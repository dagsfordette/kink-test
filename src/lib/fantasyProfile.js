const VALID_BANDS = new Set(['strong', 'notable', 'mixed', 'low', 'negative', 'insufficient'])

function answerState(value) {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') return value.response ?? value.state ?? null
  return null
}

function responseScores(profile) {
  return new Map((profile.responseScale || []).map((row) => [row.id, row.score]))
}

function newAccumulator() {
  return {
    weightedScore: 0,
    totalWeight: 0,
    observations: new Set(),
    positiveEvidence: 0,
    negativeEvidence: 0,
    neutralEvidence: 0,
    perspectives: new Map(),
  }
}

function addPerspective(acc, perspective, score, weight, questionId) {
  if (!acc.perspectives.has(perspective)) acc.perspectives.set(perspective, newAccumulator())
  const target = acc.perspectives.get(perspective)
  target.weightedScore += score * weight
  target.totalWeight += Math.abs(weight)
  target.observations.add(questionId)
  if (score > 0) target.positiveEvidence += Math.abs(score * weight)
  else if (score < 0) target.negativeEvidence += Math.abs(score * weight)
  else target.neutralEvidence += Math.abs(weight)
}

function consistencyFor(acc, mean) {
  const directional = acc.positiveEvidence + acc.negativeEvidence
  if (!directional) return 0.5
  if (mean > 0) return acc.positiveEvidence / directional
  if (mean < 0) return acc.negativeEvidence / directional
  return 0.5
}

function classify(acc, mean, consistency) {
  const observations = acc.observations.size
  if (observations < 2) return 'insufficient'
  const contradictory = acc.positiveEvidence >= 1 && acc.negativeEvidence >= 1
  if (contradictory && Math.abs(mean) < 0.85) return 'mixed'
  if (mean >= 1.1 && observations >= 3 && consistency >= 0.67) return 'strong'
  if (mean >= 0.35) return 'notable'
  if (mean <= -1.1 && observations >= 3 && consistency >= 0.67) return 'negative'
  if (mean <= -0.35) return 'low'
  return 'mixed'
}

function finalizeAccumulator(acc) {
  const observations = acc.observations.size
  const mean = acc.totalWeight ? acc.weightedScore / acc.totalWeight : 0
  const consistency = consistencyFor(acc, mean)
  const contradictory = acc.positiveEvidence >= 1 && acc.negativeEvidence >= 1
  const confidence = observations
    ? Math.min(1, observations / 5) * (0.45 + 0.55 * consistency)
    : 0
  return {
    score: Number(mean.toFixed(4)),
    observations,
    consistency: Number(consistency.toFixed(4)),
    confidence: Number(confidence.toFixed(4)),
    contradictory,
    band: classify(acc, mean, consistency),
    positiveEvidence: Number(acc.positiveEvidence.toFixed(4)),
    negativeEvidence: Number(acc.negativeEvidence.toFixed(4)),
  }
}

export function scoreFantasyProfile(profile, answers = {}) {
  const scores = responseScores(profile)
  const dimensions = new Map((profile.dimensions || []).map((dimension) => [dimension.id, newAccumulator()]))
  const questionMap = new Map((profile.questions || []).map((question) => [question.id, question]))

  for (const [questionId, rawAnswer] of Object.entries(answers || {})) {
    const question = questionMap.get(questionId)
    if (!question) continue
    const state = answerState(rawAnswer)
    if (!scores.has(state)) continue
    const responseScore = scores.get(state)
    if (responseScore === null || responseScore === undefined) continue

    for (const signal of question.signals || []) {
      const acc = dimensions.get(signal.dimensionId)
      if (!acc) continue
      const weight = Number(signal.weight ?? 1)
      acc.weightedScore += responseScore * weight
      acc.totalWeight += Math.abs(weight)
      acc.observations.add(questionId)
      if (responseScore > 0) acc.positiveEvidence += Math.abs(responseScore * weight)
      else if (responseScore < 0) acc.negativeEvidence += Math.abs(responseScore * weight)
      else acc.neutralEvidence += Math.abs(weight)
      addPerspective(acc, signal.perspective, responseScore, weight, questionId)
    }
  }

  const result = {}
  for (const dimension of profile.dimensions || []) {
    const acc = dimensions.get(dimension.id)
    const finalized = finalizeAccumulator(acc)
    const perspectives = {}
    for (const [perspective, perspectiveAcc] of acc.perspectives.entries()) {
      perspectives[perspective] = finalizeAccumulator(perspectiveAcc)
    }
    result[dimension.id] = { ...finalized, perspectives }
  }
  return result
}

function unresolvedPriority(metric) {
  if (!metric || metric.observations < 2) return 5
  if (metric.positiveEvidence === 0 && metric.negativeEvidence === 0) return 1.1
  if (metric.contradictory) return 4.5
  if (metric.band === 'mixed') return 3.6
  if (metric.confidence < 0.5) return 3.2
  if (metric.band === 'strong' || metric.band === 'negative') return 2.4
  if (metric.band === 'notable' || metric.band === 'low') return 2.1
  return 1.5
}

function positiveBand(metric) {
  return metric?.band === 'strong' || metric?.band === 'notable'
}

function routingDimensions(question) {
  const signalDimensions = [...new Set((question.signals || []).map((signal) => signal.dimensionId))]
  if (signalDimensions.length) return signalDimensions
  return question.parentDimensionId ? [question.parentDimensionId] : []
}

function questionIsActive(question, answers, evidence) {
  const activation = question.activation
  if (!activation) return true
  if (activation.type === 'question_response') {
    const state = answerState(answers?.[activation.questionId])
    return (activation.responses || []).includes(state)
  }
  if (activation.type === 'any_dimension_band') {
    return (activation.conditions || []).some((condition) => (condition.bands || []).includes(evidence?.[condition.dimensionId]?.band))
  }
  return false
}

function candidateDiscriminatorScore(question, evidence, selectedDimensionCounts) {
  const signalDimensions = routingDimensions(question)
  const primaryDimension = signalDimensions[0]
  const primaryMetric = evidence[primaryDimension]
  let score = 0
  if (primaryMetric && (primaryMetric.positiveEvidence > 0 || primaryMetric.negativeEvidence > 0)) score += Number(question.routingBoost || 0)
  for (const dimensionId of signalDimensions) score += unresolvedPriority(evidence[dimensionId])

  for (const otherId of question.discriminates || []) {
    const primary = primaryMetric
    const other = evidence[otherId]
    if (positiveBand(primary) && positiveBand(other)) score += 2.2
    else if (primary?.contradictory || other?.contradictory) score += 1.4
    else if (!other || other.band === 'insufficient') score += 1.1
  }

  if (primaryMetric?.observations >= 4 && !primaryMetric.contradictory && ['strong', 'negative'].includes(primaryMetric.band)) score -= 1.4
  score += Number(question.activation?.priorityBoost || 0)
  if (question.detailKey) score += 0.75
  score -= (selectedDimensionCounts.get(primaryDimension) || 0) * 1.25
  return score
}

function candidateDeepDiveScore(question, evidence, selectedDimensionCounts) {
  const signalDimensions = routingDimensions(question)
  const primaryDimension = signalDimensions[0]
  const metric = evidence[primaryDimension]
  let score = Number(question.routingBoost || 0)
  if (!metric || metric.band === 'insufficient') score += 1.2
  else if (metric.contradictory) score += 7
  else if (metric.band === 'strong' || metric.band === 'negative') score += 6
  else if (metric.band === 'mixed') score += 5
  else if (metric.band === 'notable' || metric.band === 'low') score += 3.8
  score += Math.abs(metric?.score || 0)
  score += Number(question.activation?.priorityBoost || 0)
  if (question.detailKey) score += 0.5
  score -= (selectedDimensionCounts.get(primaryDimension) || 0) * 1.5
  return score
}

function lastKnownMirrorGroup(profile, answers, priorQuestionIds = []) {
  const questionMap = new Map((profile.questions || []).map((question) => [question.id, question]))
  if (priorQuestionIds.length) {
    for (let i = priorQuestionIds.length - 1; i >= 0; i -= 1) {
      const question = questionMap.get(priorQuestionIds[i])
      if (question) return question.mirrorGroup || null
    }
  }
  let last = null
  for (const question of profile.questions || []) {
    if (Object.prototype.hasOwnProperty.call(answers, question.id)) last = question.mirrorGroup || null
  }
  return last
}

function selectAdaptive(profile, answers, stage, maxCount, options = {}) {
  const evidence = scoreFantasyProfile(profile, answers)
  const answeredIds = new Set(Object.keys(answers || {}))
  const candidates = (profile.questions || []).filter((question) => question.stage === stage && !answeredIds.has(question.id) && questionIsActive(question, answers, evidence))
  const selected = []
  const selectedDimensionCounts = new Map()
  const selectedBucketCounts = new Map()
  let selectedDetailCount = 0
  let lastMirrorGroup = lastKnownMirrorGroup(profile, answers, options.priorQuestionIds || [])
  const maxPrimaryPerDimension = stage === 'discriminator' ? 2 : 1
  const configuredDetailLimit = stage === 'discriminator'
    ? profile.questionnaire?.administration?.maxDetailDiscriminatorCount
    : profile.questionnaire?.administration?.maxDetailDeepDiveCount
  const maxDetailCount = Math.min(options.maxDetailCount ?? configuredDetailLimit ?? maxCount, maxCount)

  while (selected.length < maxCount) {
    const ranked = candidates
      .filter((question) => !selected.includes(question))
      .filter((question) => !question.detailKey || selectedDetailCount < maxDetailCount)
      .filter((question) => {
        const primaryDimension = routingDimensions(question)[0]
        const bucket = question.detailKey ? `detail:${question.detailKey}` : primaryDimension
        return primaryDimension && (selectedBucketCounts.get(bucket) || 0) < maxPrimaryPerDimension
      })
      .filter((question) => !lastMirrorGroup || question.mirrorGroup !== lastMirrorGroup)
      .map((question) => ({
        question,
        score: stage === 'discriminator'
          ? candidateDiscriminatorScore(question, evidence, selectedDimensionCounts)
          : candidateDeepDiveScore(question, evidence, selectedDimensionCounts),
      }))
      .sort((a, b) => b.score - a.score || a.question.id.localeCompare(b.question.id))

    if (!ranked.length) break
    const chosen = ranked[0].question
    selected.push(chosen)
    const primaryDimension = routingDimensions(chosen)[0]
    const bucket = chosen.detailKey ? `detail:${chosen.detailKey}` : primaryDimension
    if (!chosen.detailKey) selectedDimensionCounts.set(primaryDimension, (selectedDimensionCounts.get(primaryDimension) || 0) + 1)
    selectedBucketCounts.set(bucket, (selectedBucketCounts.get(bucket) || 0) + 1)
    if (chosen.detailKey) selectedDetailCount += 1
    lastMirrorGroup = chosen.mirrorGroup || null
  }

  return selected
}

export function selectDiscriminatorQuestions(profile, answers = {}, options = {}) {
  const maxCount = Math.min(options.maxCount ?? profile.questionnaire?.administration?.maxDiscriminatorCount ?? 12, 12)
  return selectAdaptive(profile, answers, 'discriminator', maxCount, options)
}

export function selectDeepDiveQuestions(profile, answers = {}, options = {}) {
  const maxCount = Math.min(options.maxCount ?? profile.questionnaire?.administration?.maxDeepDiveCount ?? 12, 12)
  return selectAdaptive(profile, answers, 'deep_dive', maxCount, options)
}

function bandEvidencePoints(band, required = false) {
  if (band === 'strong') return required ? 1.7 : 1.25
  if (band === 'notable') return required ? 1.1 : 0.85
  if (band === 'mixed') return 0.3
  return 0
}

function conditionMatches(condition, evidence) {
  return Boolean(evidence && (condition.bands || []).includes(evidence.band))
}

function reasonFor(dimension, evidence) {
  const label = dimension.label.toLowerCase()
  if (evidence.band === 'strong') return `you reacted strongly to ${label}`
  if (evidence.band === 'notable') return `${label} came up repeatedly`
  if (evidence.band === 'mixed') return `your response to ${label} depended on context`
  if (evidence.band === 'low') return `${label} did not add much for you`
  if (evidence.band === 'negative') return `you usually disliked ${label}`
  return `there was not enough information about ${label}`
}

function aggregatePerspective(evidenceRows, perspective) {
  let weighted = 0
  let observations = 0
  for (const evidence of evidenceRows) {
    const row = evidence?.perspectives?.[perspective]
    if (!row?.observations) continue
    weighted += row.score * row.observations
    observations += row.observations
  }
  return observations ? weighted / observations : null
}

export function buildFantasySuggestions(profile, answers = {}, options = {}) {
  const evidence = scoreFantasyProfile(profile, answers)
  const dimensionMap = new Map((profile.dimensions || []).map((dimension) => [dimension.id, dimension]))
  const results = []

  for (const rule of profile.suggestionRules || []) {
    const requiredMatches = (rule.requiredEvidence || []).filter((condition) => conditionMatches(condition, evidence[condition.dimensionId]))
    const requiredPass = rule.matchMode === 'any_required'
      ? requiredMatches.length > 0
      : requiredMatches.length === (rule.requiredEvidence || []).length
    if (!requiredPass) continue

    let evidencePoints = 0
    const matchedConditions = []
    for (const condition of requiredMatches) {
      evidencePoints += bandEvidencePoints(evidence[condition.dimensionId].band, true)
      matchedConditions.push(condition)
    }
    for (const condition of rule.supportingEvidence || []) {
      if (!conditionMatches(condition, evidence[condition.dimensionId])) continue
      evidencePoints += bandEvidencePoints(evidence[condition.dimensionId].band, false)
      matchedConditions.push(condition)
    }
    for (const condition of rule.contradictingEvidence || []) {
      if (conditionMatches(condition, evidence[condition.dimensionId])) evidencePoints -= 1.5
    }
    if (evidencePoints < (rule.minimumEvidencePoints ?? 2.5)) continue

    const uniqueDimensionIds = [...new Set(matchedConditions.map((condition) => condition.dimensionId))]
    const reasons = uniqueDimensionIds
      .sort((a, b) => {
        const rank = { strong: 3, notable: 2, mixed: 1, low: 0, negative: -1, insufficient: -2 }
        return (rank[evidence[b].band] - rank[evidence[a].band]) || a.localeCompare(b)
      })
      .map((dimensionId) => reasonFor(dimensionMap.get(dimensionId), evidence[dimensionId]))

    const evidenceRows = uniqueDimensionIds.map((dimensionId) => evidence[dimensionId])
    const receive = aggregatePerspective(evidenceRows, 'receive')
    const give = aggregatePerspective(evidenceRows, 'give')
    if (receive !== null && give !== null && Math.abs(receive - give) >= 0.35) {
      reasons.push(receive > give ? 'receiving signals stronger than giving signals' : 'giving signals stronger than receiving signals')
    }

    results.push({
      id: rule.id,
      label: rule.label,
      activityCategoryIds: [...rule.activityCategoryIds],
      summary: rule.summary,
      evidencePoints: Number(evidencePoints.toFixed(3)),
      why: reasons.slice(0, profile.resultCopy?.explanationTemplate?.maxReasons ?? 4),
    })
  }

  results.sort((a, b) => b.evidencePoints - a.evidencePoints || a.id.localeCompare(b.id))
  return results.slice(0, options.maxSuggestions ?? results.length)
}

export function describeFantasyDimension(profile, dimensionId, answers = {}) {
  const dimension = (profile.dimensions || []).find((row) => row.id === dimensionId)
  if (!dimension) return null
  const evidence = scoreFantasyProfile(profile, answers)[dimensionId]
  if (!VALID_BANDS.has(evidence.band)) return null
  const key = {
    strong: 'leadPositive', notable: 'leadNotable', mixed: 'leadMixed', low: 'leadLow',
    negative: 'leadNegative', insufficient: 'leadInsufficient',
  }[evidence.band]
  const template = profile.resultCopy?.language?.[key] || '{dimension}'
  return template.replace('{dimension}', dimension.label.toLowerCase())
}
