const VALID_BANDS = new Set([
  'strong',
  'notable',
  'mixed',
  'low',
  'negative',
  'insufficient'
])

function responseScores(profile) {
  return new Map(
    (profile.responseScale || []).map((row) => [row.id, row.score])
  )
}

function newAccumulator() {
  return {
    weightedScore: 0,
    totalWeight: 0,
    observations: new Set(),
    positiveEvidence: 0,
    negativeEvidence: 0,
    neutralEvidence: 0,
    perspectives: new Map()
  }
}

function addPerspective(acc, perspective, score, weight, questionId) {
  if (!acc.perspectives.has(perspective))
    acc.perspectives.set(perspective, newAccumulator())
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
  if (mean <= -1.1 && observations >= 3 && consistency >= 0.67)
    return 'negative'
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
    negativeEvidence: Number(acc.negativeEvidence.toFixed(4))
  }
}

export function scoreFantasyProfile(profile, answers = {}) {
  const scores = responseScores(profile)
  const dimensions = new Map(
    (profile.dimensions || []).map((dimension) => [
      dimension.id,
      newAccumulator()
    ])
  )
  const questionMap = new Map(
    (profile.questions || []).map((question) => [question.id, question])
  )

  for (const [questionId, rawAnswer] of Object.entries(answers || {})) {
    const question = questionMap.get(questionId)
    if (!question) continue
    const state = rawAnswer
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
      if (responseScore > 0)
        acc.positiveEvidence += Math.abs(responseScore * weight)
      else if (responseScore < 0)
        acc.negativeEvidence += Math.abs(responseScore * weight)
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

export function fantasyRoleEvidence(profile, evidence, dimensionId) {
  const pair = profile.dimensions.find((row) => row.id === dimensionId)?.directionPairs?.[0]
  if (!pair) return []
  return [
    { perspective: pair.left, roleLabel: pair.leftLabel },
    { perspective: pair.right, roleLabel: pair.rightLabel }
  ].map((role) => ({ ...evidence[dimensionId]?.perspectives?.[role.perspective], ...role }))
    .filter((role) => role.observations)
}

export function fantasySuggestionEvidence(profile, answers) {
  const evidence = scoreFantasyProfile(profile, answers)
  return Object.fromEntries(profile.dimensions.map(({ id }) => {
    const positiveRole = fantasyRoleEvidence(profile, evidence, id)
      .filter((role) => positiveBand(role))
      .sort((a, b) => b.score - a.score || b.observations - a.observations)[0]
    return [id, positiveRole ? { ...evidence[id], ...positiveRole } : evidence[id]]
  }))
}

function questionRoleMetric(profile, question, evidence) {
  const signal = question.signals?.[0]
  const dimensionId = signal?.dimensionId || question.parentDimensionId
  const perspective = signal?.perspective || question.perspective
  const pair = profile.dimensions.find((row) => row.id === dimensionId)?.directionPairs?.[0]
  if (pair && [pair.left, pair.right].includes(perspective))
    return evidence[dimensionId]?.perspectives?.[perspective]
  return evidence[dimensionId]
}

function preferredRoleScore(profile, question, evidence) {
  const signal = question.signals?.[0]
  const dimensionId = signal?.dimensionId || question.parentDimensionId
  const roles = fantasyRoleEvidence(profile, evidence, dimensionId)
  const role = roles.find((row) => row.perspective === (signal?.perspective || question.perspective))
  if (!role) return 0
  if (role.score >= 0.35) return 8 + role.score
  if (role.score < -0.35 && roles.some((other) => other.score >= 0.35)) return -16
  return 0
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
  const signalDimensions = [
    ...new Set((question.signals || []).map((signal) => signal.dimensionId))
  ]
  if (signalDimensions.length) return signalDimensions
  return question.parentDimensionId ? [question.parentDimensionId] : []
}

// Group related themes without changing scoring or adaptive selection.
const DIMENSION_THEME_TAGS = {
  surrender: ['power_agency'],
  authority_responsibility: ['power_agency'],
  helplessness_vulnerability: ['power_agency', 'intensity'],
  trust_safety: ['care_connection'],
  anticipation_denial: ['suspense'],
  fear_adrenaline: ['suspense', 'intensity'],
  pain_intensity: ['physical_intensity', 'intensity'],
  humiliation_embarrassment: ['social_exposure', 'intensity'],
  praise_approval: ['care_connection', 'attention'],
  being_desired_attention: ['care_connection', 'attention', 'social_exposure'],
  possession_belonging: ['power_agency', 'care_connection'],
  tenderness_care: ['care_connection'],
  control_permission: ['power_agency', 'structure'],
  rules_ritual_protocol: ['power_agency', 'structure'],
  service_usefulness: ['care_connection', 'structure'],
  restraint_confinement: ['power_agency', 'physical_intensity'],
  objectification_use: ['power_agency', 'social_exposure'],
  exposure_being_seen: ['social_exposure', 'observation'],
  watching_observation: ['observation', 'attention'],
  sensory_focus_alteration: ['sensory', 'physical_intensity'],
  roleplay_transformation: ['identity_novelty'],
  primal_struggle_competition: ['physical_intensity', 'suspense'],
  taboo_transgression: ['identity_novelty', 'transgression'],
  novelty_experimentation: ['identity_novelty'],
  group_social_multipartner: ['social_exposure', 'attention'],
  fetish_focus: ['sensory'],
  romance: ['care_connection'],
  transformation: ['body_change', 'identity_novelty'],
  becoming_huge: ['body_change', 'scale'],
  mind_control: ['power_agency', 'mind'],
  being_tiny: ['body_change', 'scale', 'power_agency'],
  nonconsent: ['power_agency', 'transgression', 'intensity'],
  animal_transformation: ['body_change', 'identity_novelty'],
  monsters_supernatural: ['identity_novelty', 'nonhuman']
}

function questionThemeTags(question) {
  const tags = new Set()
  for (const dimensionId of routingDimensions(question)) {
    for (const tag of DIMENSION_THEME_TAGS[dimensionId] || []) tags.add(tag)
  }
  return tags
}

function themeSimilarity(a, b) {
  if (!a || !b) return 0
  const aDimensions = new Set(routingDimensions(a))
  const bDimensions = new Set(routingDimensions(b))
  const aPrimary = routingDimensions(a)[0]
  const bPrimary = routingDimensions(b)[0]
  let similarity = aPrimary && aPrimary === bPrimary ? 12 : 0
  for (const dimensionId of aDimensions)
    if (bDimensions.has(dimensionId)) similarity += 5
  const aTags = questionThemeTags(a)
  const bTags = questionThemeTags(b)
  for (const tag of aTags) if (bTags.has(tag)) similarity += 2
  if (a.mirrorGroup && a.mirrorGroup === b.mirrorGroup) similarity += 8
  return similarity
}

function spreadQuestionsByTheme(profile, questions, priorQuestionIds = []) {
  if (questions.length < 2) return questions
  const questionMap = new Map(
    (profile.questions || []).map((question) => [question.id, question])
  )
  const recent = priorQuestionIds
    .map((id) => questionMap.get(id))
    .filter(Boolean)
    .slice(-8)
  const remaining = [...questions]
  const ordered = []

  while (remaining.length) {
    let bestIndex = 0
    let bestPenalty = Number.POSITIVE_INFINITY
    for (let index = 0; index < remaining.length; index += 1) {
      const candidate = remaining[index]
      const history = [...recent, ...ordered]
      let penalty = 0
      for (
        let distance = 1;
        distance <= Math.min(8, history.length);
        distance += 1
      ) {
        const previous = history[history.length - distance]
        // Immediate bleed-over matters most; similarity fades with distance.
        const similarity = themeSimilarity(previous, candidate)
        penalty += similarity * (9 - distance)
        // If any unrelated option is available, never put a related theme directly next.
        if (distance === 1 && similarity > 0) penalty += 10000
      }
      if (
        penalty < bestPenalty ||
        (penalty === bestPenalty &&
          candidate.id.localeCompare(remaining[bestIndex].id) < 0)
      ) {
        bestIndex = index
        bestPenalty = penalty
      }
    }
    ordered.push(remaining.splice(bestIndex, 1)[0])
  }
  return ordered
}

function questionIsActive(profile, question, answers, evidence) {
  const activation = question.activation
  if (!activation) return true
  if (activation.type === 'question_response') {
    const state = answers?.[activation.questionId]
    return (activation.responses || []).includes(state)
  }
  if (activation.type === 'any_dimension_band') {
    return (activation.conditions || []).some((condition) => {
      const metric = evidence[condition.dimensionId]
      const metrics = condition.perspective
        ? [metric?.perspectives?.[condition.perspective]]
        : [metric, ...fantasyRoleEvidence(profile, evidence, condition.dimensionId)]
      return metrics.some((row) => row?.observations && (
        (condition.bands || []).includes(row.band) ||
        (row.score >= 0.35 && (condition.bands || []).includes('notable'))
      ))
    })
  }
  return false
}

function candidateDiscriminatorScore(
  profile,
  question,
  evidence,
  selectedDimensionCounts
) {
  const signalDimensions = routingDimensions(question)
  const primaryDimension = signalDimensions[0]
  const primaryMetric = questionRoleMetric(profile, question, evidence)
  let score = preferredRoleScore(profile, question, evidence)
  if (
    primaryMetric &&
    (primaryMetric.positiveEvidence > 0 || primaryMetric.negativeEvidence > 0)
  )
    score += Number(question.routingBoost || 0)
  for (const dimensionId of signalDimensions)
    score += unresolvedPriority(dimensionId === primaryDimension ? primaryMetric : evidence[dimensionId])

  for (const otherId of question.discriminates || []) {
    const primary = primaryMetric
    const other = evidence[otherId]
    if (positiveBand(primary) && positiveBand(other)) score += 2.2
    else if (primary?.contradictory || other?.contradictory) score += 1.4
    else if (!other || other.band === 'insufficient') score += 1.1
  }

  if (
    primaryMetric?.observations >= 4 &&
    !primaryMetric.contradictory &&
    ['strong', 'negative'].includes(primaryMetric.band)
  )
    score -= 1.4
  score += Number(question.activation?.priorityBoost || 0)
  if (question.detailKey) score += 0.75
  score -= (selectedDimensionCounts.get(primaryDimension) || 0) * 1.25
  return score
}

function candidateDeepDiveScore(profile, question, evidence, selectedDimensionCounts) {
  const signalDimensions = routingDimensions(question)
  const primaryDimension = signalDimensions[0]
  const metric = questionRoleMetric(profile, question, evidence)
  let score = Number(question.routingBoost || 0) + preferredRoleScore(profile, question, evidence)
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

function questionIsNeeded(profile, question, answers, evidence) {
  if (!questionIsActive(profile, question, answers, evidence)) return false
  if (!question.signals?.length) return true
  const metric = questionRoleMetric(profile, question, evidence)
  if (!metric?.observations) return false
  if (metric.score >= 0.35) return true
  return question.stage === 'discriminator' && metric.score > -0.35 &&
    metric.positiveEvidence > 0 && metric.negativeEvidence > 0
}

function selectAdaptive(profile, answers, stage, options = {}) {
  const evidence = scoreFantasyProfile(profile, answers)
  const priorIds = new Set(options.priorQuestionIds || [])
  const questions = new Map(profile.questions.map((question) => [question.id, question]))
  const recent = (options.priorQuestionIds || []).slice(-8)
    .map((id) => questions.get(id)).filter(Boolean)
  const counts = new Map()
  for (const id of priorIds) {
    const question = questions.get(id)
    if (!question || question.stage === 'core') continue
    const dimensionId = routingDimensions(question)[0]
    counts.set(dimensionId, (counts.get(dimensionId) || 0) + 1)
  }
  const ranked = profile.questions.filter((question) =>
    question.stage === stage && !Object.hasOwn(answers, question.id) &&
    !priorIds.has(question.id) && questionIsNeeded(profile, question, answers, evidence)
  ).map((question) => {
    let score = stage === 'discriminator'
      ? candidateDiscriminatorScore(profile, question, evidence, counts)
      : candidateDeepDiveScore(profile, question, evidence, counts)
    for (let distance = 1; distance <= recent.length; distance++)
      score -= themeSimilarity(recent[recent.length - distance], question) * (9 - distance)
    return { question, score }
  }).sort((a, b) => b.score - a.score || a.question.id.localeCompare(b.question.id))
  if (options.nextOnly) return ranked.slice(0, 1).map((row) => row.question)
  return spreadQuestionsByTheme(profile, ranked.map((row) => row.question), options.priorQuestionIds)
}

export function selectDiscriminatorQuestions(profile, answers = {}, options = {}) {
  return selectAdaptive(profile, answers, 'discriminator', options)
}

export function selectDeepDiveQuestions(profile, answers = {}, options = {}) {
  return selectAdaptive(profile, answers, 'deep_dive', options)
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
  const label = (evidence.roleLabel || dimension.label).toLowerCase()
  if (evidence.band === 'strong') return `you reacted strongly to ${label}`
  if (evidence.band === 'notable') return `${label} came up repeatedly`
  if (evidence.band === 'mixed')
    return `your response to ${label} depended on context`
  if (evidence.band === 'low') return `${label} did not add much for you`
  if (evidence.band === 'negative') return `you usually disliked ${label}`
  return `there was not enough information about ${label}`
}

export function buildFantasySuggestions(profile, answers = {}, options = {}) {
  const evidence = fantasySuggestionEvidence(profile, answers)
  const dimensionMap = new Map(
    (profile.dimensions || []).map((dimension) => [dimension.id, dimension])
  )
  const results = []

  for (const rule of profile.suggestionRules || []) {
    const requiredMatches = (rule.requiredEvidence || []).filter((condition) =>
      conditionMatches(condition, evidence[condition.dimensionId])
    )
    const requiredPass =
      rule.matchMode === 'any_required'
        ? requiredMatches.length > 0
        : requiredMatches.length === (rule.requiredEvidence || []).length
    if (!requiredPass) continue

    let evidencePoints = 0
    const matchedConditions = []
    for (const condition of requiredMatches) {
      evidencePoints += bandEvidencePoints(
        evidence[condition.dimensionId].band,
        true
      )
      matchedConditions.push(condition)
    }
    for (const condition of rule.supportingEvidence || []) {
      if (!conditionMatches(condition, evidence[condition.dimensionId]))
        continue
      evidencePoints += bandEvidencePoints(
        evidence[condition.dimensionId].band,
        false
      )
      matchedConditions.push(condition)
    }
    for (const condition of rule.contradictingEvidence || []) {
      if (conditionMatches(condition, evidence[condition.dimensionId]))
        evidencePoints -= 1.5
    }
    if (evidencePoints < (rule.minimumEvidencePoints ?? 2.5)) continue

    const uniqueDimensionIds = [
      ...new Set(matchedConditions.map((condition) => condition.dimensionId))
    ]
    const reasons = uniqueDimensionIds
      .sort((a, b) => {
        const rank = {
          strong: 3,
          notable: 2,
          mixed: 1,
          low: 0,
          negative: -1,
          insufficient: -2
        }
        return (
          rank[evidence[b].band] - rank[evidence[a].band] || a.localeCompare(b)
        )
      })
      .map((dimensionId) =>
        reasonFor(dimensionMap.get(dimensionId), evidence[dimensionId])
      )


    results.push({
      id: rule.id,
      label: rule.label,
      activityCategoryIds: [...rule.activityCategoryIds],
      summary: rule.summary,
      evidencePoints: Number(evidencePoints.toFixed(3)),
      matchedEvidence: uniqueDimensionIds.map((dimensionId) => ({
        dimensionId,
        perspective: evidence[dimensionId].perspective || null
      })),
      why: reasons.slice(
        0,
        profile.resultCopy?.explanationTemplate?.maxReasons ?? 4
      )
    })
  }

  results.sort(
    (a, b) => b.evidencePoints - a.evidencePoints || a.id.localeCompare(b.id)
  )
  return results.slice(0, options.maxSuggestions ?? results.length)
}

export function describeFantasyDimension(profile, dimensionId, answers = {}) {
  const dimension = (profile.dimensions || []).find(
    (row) => row.id === dimensionId
  )
  if (!dimension) return null
  const evidence = scoreFantasyProfile(profile, answers)[dimensionId]
  if (!VALID_BANDS.has(evidence.band)) return null
  const key = {
    strong: 'leadPositive',
    notable: 'leadNotable',
    mixed: 'leadMixed',
    low: 'leadLow',
    negative: 'leadNegative',
    insufficient: 'leadInsufficient'
  }[evidence.band]
  const template = profile.resultCopy?.language?.[key] || '{dimension}'
  return template.replace('{dimension}', dimension.label.toLowerCase())
}
