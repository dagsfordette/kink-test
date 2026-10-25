import {
  buildFantasySuggestions,
  fantasySuggestionEvidence,
  scoreFantasyProfile
} from './fantasyProfile.js'

const POSITIVE_STATES = new Set(['strong_turn_on', 'turn_on', 'intriguing'])
const POSITIVE_BANDS = new Set(['strong', 'notable'])

function responseLabelMap(profile) {
  return new Map(
    (profile.responseScale || []).map((row) => [row.id, row.label])
  )
}

function dimensionMap(profile) {
  return new Map(
    (profile.dimensions || []).map((dimension) => [dimension.id, dimension])
  )
}

const AUTHORITY_THEMES = ['authority_responsibility', 'surrender']

export function fantasyThemePresentation(profile, dimensionId) {
  const dimension = profile.dimensions.find((row) => row.id === dimensionId)
  if (!dimension) return null
  if (!AUTHORITY_THEMES.includes(dimensionId))
    return { ...dimension, dimensionIds: [dimensionId] }
  return {
    ...dimension,
    id: 'authority_responsibility',
    label: 'Authority & surrender',
    description: 'Taking the lead and carrying responsibility, or handing control to a partner and letting them decide.',
    dimensionIds: AUTHORITY_THEMES
  }
}

function directionPairForDimension(dimension) {
  if (dimension.directionPairs?.length) return dimension.directionPairs[0]
  return null
}

function scorePosition(score) {
  return Math.round(Math.max(0, Math.min(100, ((Number(score) + 2) / 4) * 100)))
}

function scoreStrength(score) {
  if (score >= 1.55) return 'Very high'
  if (score >= 0.9) return 'High'
  if (score >= 0.35) return 'Moderate'
  if (score > -0.35) return 'Neutral / mixed'
  if (score > -1.55) return 'Low'
  return 'Very low'
}

function lowerFirst(value) {
  if (!value) return value
  return value.charAt(0).toLowerCase() + value.slice(1)
}

export function fantasyRoleBreakdown(profile, answers, dimensionId) {
  const dimension = (profile.dimensions || []).find(
    (row) => row.id === dimensionId
  )
  if (!dimension) return null
  const authority = AUTHORITY_THEMES.includes(dimensionId)
  const pair = authority ? {
    left: 'authority_responsibility',
    leftLabel: 'Taking authority and responsibility',
    right: 'surrender',
    rightLabel: 'Giving up control and responsibility'
  } : directionPairForDimension(dimension)
  const evidence = scoreFantasyProfile(profile, answers)
  const metric = evidence[dimensionId]
  const left = authority ? evidence[pair.left] : pair ? metric?.perspectives?.[pair.left] : null
  const right = authority ? evidence[pair.right] : pair ? metric?.perspectives?.[pair.right] : null
  if (!left?.observations && !right?.observations) {
    if (!metric?.observations) return null
    return {
      dimensionId,
      roles: [{
        key: 'overall',
        label: 'Overall appeal',
        observations: metric.observations,
        score: metric.score,
        position: scorePosition(metric.score),
        strength: scoreStrength(metric.score)
      }],
      summary: null
    }
  }
  const roles = [
    { key: pair.left, label: pair.leftLabel, metric: left },
    { key: pair.right, label: pair.rightLabel, metric: right }
  ].map((role) => ({
    key: role.key,
    label: role.label,
    observations: role.metric?.observations || 0,
    score: role.metric?.score ?? null,
    position: role.metric?.observations
      ? scorePosition(role.metric.score)
      : null,
    strength: role.metric?.observations
      ? scoreStrength(role.metric.score)
      : 'Not enough data'
  }))

  let summary = null
  if (left?.observations && right?.observations) {
    const leftPositive = left.score >= 0.35
    const rightPositive = right.score >= 0.35
    const difference = left.score - right.score
    if (leftPositive && rightPositive && Math.abs(difference) < 0.35) {
      summary = `Both ${lowerFirst(pair.leftLabel)} and ${lowerFirst(pair.rightLabel)} appeal to you.`
    } else if (leftPositive && rightPositive) {
      const stronger = difference > 0 ? pair.leftLabel : pair.rightLabel
      summary = `Both directions appeal, with a stronger pull toward ${lowerFirst(stronger)}.`
    } else if (leftPositive) {
      summary = `Your answers lean toward ${lowerFirst(pair.leftLabel)}.`
    } else if (rightPositive) {
      summary = `Your answers lean toward ${lowerFirst(pair.rightLabel)}.`
    }
  } else {
    const sampled = left?.observations ? { label: pair.leftLabel, metric: left } : { label: pair.rightLabel, metric: right }
    if (sampled.metric.score >= 0.35)
      summary = `You showed some signal for ${lowerFirst(sampled.label)}, but there isn’t enough information to compare both sides yet.`
  }

  return { dimensionId, roles, summary }
}

export function contributingAnswers(
  profile,
  answers,
  dimensionId,
  maxCount = 5
) {
  const labels = responseLabelMap(profile)
  return (profile.questions || [])
    .filter((question) =>
      Object.prototype.hasOwnProperty.call(answers || {}, question.id)
    )
    .filter((question) =>
      question.signals?.some((signal) => signal.dimensionId === dimensionId)
    )
    .filter((question) => POSITIVE_STATES.has(answers[question.id]))
    .map((question) => ({
      questionId: question.id,
      statement: question.statement,
      response: answers[question.id],
      responseLabel: labels.get(answers[question.id]) || answers[question.id]
    }))
    .slice(0, maxCount)
}

function rankedFantasyThemes(profile, answers, layer, maxCount = 6) {
  const evidence = scoreFantasyProfile(profile, answers)
  const candidates = (profile.dimensions || [])
    .filter((dimension) => dimension.resultLayer === layer)
    .map((dimension) => {
      const metric = evidence[dimension.id]
      const direction = fantasyRoleBreakdown(profile, answers, dimension.id)
      const strongest = direction?.roles
        .filter((role) => role.observations && role.score >= 0.35)
        .sort((a, b) => b.score - a.score)[0]
      const roleSpecific = Boolean(strongest && !POSITIVE_BANDS.has(metric.band))
      return {
        ...dimension,
        roleSpecific,
        evidence: roleSpecific ? { ...metric, score: strongest.score, band: 'notable' } : metric
      }
    })
    .filter((row) => row.evidence.observations >= 2 && POSITIVE_BANDS.has(row.evidence.band))
    .sort((a, b) => b.evidence.score - a.evidence.score ||
      b.evidence.confidence - a.evidence.confidence || a.label.localeCompare(b.label))
  const seen = new Set()
  return candidates.flatMap((row) => {
    const theme = fantasyThemePresentation(profile, row.id)
    if (seen.has(theme.id)) return []
    seen.add(theme.id)
    return [{
      id: theme.id,
      label: theme.label,
      description: theme.description,
      interpretation: row.positiveInterpretation,
      band: row.evidence.band,
      roleSpecific: row.roleSpecific,
      direction: fantasyRoleBreakdown(profile, answers, theme.id),
      examples: theme.dimensionIds.flatMap((id) => contributingAnswers(profile, answers, id, 3))
    }]
  }).slice(0, maxCount)
}

function directionalSentence(dimension, breakdown) {
  if (!breakdown?.summary) return null
  return `${dimension.label}: ${breakdown.summary}`
}

function fantasyDirectionality(profile, answers, maxCount = 6) {
  const evidence = scoreFantasyProfile(profile, answers)
  const rows = []
  for (const dimension of profile.dimensions || []) {
    if (dimension.id === 'surrender') continue
    const breakdown = fantasyRoleBreakdown(profile, answers, dimension.id)
    if (
      !breakdown?.summary ||
      breakdown.roles.filter((role) => role.observations).length < 2
    )
      continue
    const text = directionalSentence(fantasyThemePresentation(profile, dimension.id), breakdown)
    const strength = Math.max(
      ...breakdown.roles
        .filter((role) => role.score !== null)
        .map((role) => role.score)
    )
    if (
      strength < 0.35 &&
      evidence[dimension.id]?.band !== 'strong' &&
      evidence[dimension.id]?.band !== 'notable'
    )
      continue
    rows.push({
      dimensionId: dimension.id,
      text,
      strength,
      breakdown
    })
  }
  return rows
    .sort((a, b) => b.strength - a.strength || a.text.localeCompare(b.text))
    .slice(0, maxCount)
}

export function nearbyFantasyThemes(
  profile,
  dimensionId,
  answers = {},
  maxCount = 4
) {
  const counts = new Map()
  const evidence = fantasySuggestionEvidence(profile, answers)
  for (const question of profile.questions || []) {
    const ids = [
      ...new Set((question.signals || []).map((signal) => signal.dimensionId))
    ]
    if (!ids.includes(dimensionId)) continue
    for (const id of ids) {
      if (id !== dimensionId) counts.set(id, (counts.get(id) || 0) + 1)
    }
  }
  const dimensions = dimensionMap(profile)
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([id]) => dimensions.get(id))
    .filter(
      (dimension) =>
        dimension &&
        evidence[dimension.id]?.observations >= 2 &&
        POSITIVE_BANDS.has(evidence[dimension.id]?.band)
    )
    .slice(0, maxCount)
}

export function kinkAreasForTheme(profile, answers, dimensionId) {
  const ruleIds = new Set(
    (profile.questions || [])
      .filter((question) =>
        question.signals?.some((signal) => signal.dimensionId === dimensionId)
      )
      .flatMap((question) => question.suggestionLinks || [])
  )
  return buildFantasySuggestions(profile, answers).filter((suggestion) =>
    ruleIds.has(suggestion.id)
  )
}

export function fantasySuggestionDetails(profile, answers, suggestionId) {
  const suggestion = buildFantasySuggestions(profile, answers).find(
    (row) => row.id === suggestionId
  )
  const rule = (profile.suggestionRules || []).find(
    (row) => row.id === suggestionId
  )
  if (!suggestion || !rule) return null
  const dimensions = dimensionMap(profile)
  const conditionIds = suggestion.matchedEvidence.map((row) => row.dimensionId)
  const labels = responseLabelMap(profile)
  const examples = suggestion.matchedEvidence.flatMap(({ dimensionId, perspective }) =>
    profile.questions.filter((question) =>
      POSITIVE_STATES.has(answers[question.id]) && question.signals?.some((signal) =>
        signal.dimensionId === dimensionId && (!perspective || signal.perspective === perspective)
      )
    ).slice(0, 2).map((question) => ({
      questionId: question.id,
      statement: question.statement,
      response: answers[question.id],
      responseLabel: labels.get(answers[question.id])
    }))
  )
  const uniqueExamples = [
    ...new Map(examples.map((row) => [row.questionId, row])).values()
  ].slice(0, 4)
  return {
    ...suggestion,
    themes: conditionIds.map((id) => dimensions.get(id)).filter(Boolean),
    examples: uniqueExamples
  }
}

export function specificFantasyAnswers(profile, answers, dimensionId = null) {
  const labels = responseLabelMap(profile)
  return profile.questions.filter((question) =>
    question.detailKey && labels.has(answers[question.id]) &&
    (!dimensionId || question.parentDimensionId === dimensionId ||
      question.activation?.conditions?.some((condition) => condition.dimensionId === dimensionId))
  ).map((question) => ({
    questionId: question.id,
    statement: question.statement,
    response: answers[question.id],
    responseLabel: labels.get(answers[question.id])
  }))
}

export function buildFantasyResults(profile, answers) {
  return {
    specifics: specificFantasyAnswers(profile, answers),
    drivers: rankedFantasyThemes(profile, answers, 'driver', 6),
    patterns: rankedFantasyThemes(profile, answers, 'motif', 10),
    directions: fantasyDirectionality(profile, answers, 6),
    suggestions: buildFantasySuggestions(profile, answers, {
      maxSuggestions: 6
    })
  }
}
