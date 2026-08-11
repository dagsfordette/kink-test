import { buildFantasySuggestions, scoreFantasyProfile } from './fantasyProfile.js'

const POSITIVE_STATES = new Set(['strong_turn_on', 'turn_on', 'intriguing'])
const POSITIVE_BANDS = new Set(['strong', 'notable'])

function responseLabelMap(profile) {
  return new Map((profile.responseScale || []).map((row) => [row.id, row.label]))
}

function dimensionMap(profile) {
  return new Map((profile.dimensions || []).map((dimension) => [dimension.id, dimension]))
}

export function contributingAnswers(profile, answers, dimensionId, maxCount = 5) {
  const labels = responseLabelMap(profile)
  return (profile.questions || [])
    .filter((question) => Object.prototype.hasOwnProperty.call(answers || {}, question.id))
    .filter((question) => question.signals?.some((signal) => signal.dimensionId === dimensionId))
    .filter((question) => POSITIVE_STATES.has(answers[question.id]))
    .map((question) => ({
      questionId: question.id,
      statement: question.statement,
      response: answers[question.id],
      responseLabel: labels.get(answers[question.id]) || answers[question.id],
    }))
    .slice(0, maxCount)
}

export function rankedFantasyThemes(profile, answers, layer, maxCount = 6) {
  const evidence = scoreFantasyProfile(profile, answers)
  return (profile.dimensions || [])
    .filter((dimension) => dimension.resultLayer === layer)
    .map((dimension) => ({ ...dimension, evidence: evidence[dimension.id] }))
    .filter((row) => row.evidence.observations >= 2 && POSITIVE_BANDS.has(row.evidence.band))
    .sort((a, b) => b.evidence.score - a.evidence.score || b.evidence.confidence - a.evidence.confidence || a.label.localeCompare(b.label))
    .slice(0, maxCount)
    .map((row) => ({
      id: row.id,
      label: row.label,
      description: row.description,
      interpretation: row.positiveInterpretation,
      band: row.evidence.band,
      examples: contributingAnswers(profile, answers, row.id, 3),
    }))
}

function directionalSentence(label, leftName, left, rightName, right) {
  if (!left?.observations || !right?.observations || left.observations < 2 || right.observations < 2) return null
  const leftPositive = left.score >= 0.35
  const rightPositive = right.score >= 0.35
  if (!leftPositive && !rightPositive) return null
  const normalizedLabel = label.replace(/ & /g, ' and ').toLowerCase()
  if (leftPositive && rightPositive && Math.abs(left.score - right.score) < 0.35) {
    return `${label} worked for you both when ${leftName} and when ${rightName}.`
  }
  if (left.score > right.score + 0.35) return `${label} appealed more when you imagined ${leftName}.`
  if (right.score > left.score + 0.35) return `${label} appealed more when you imagined ${rightName}.`
  return `${label} changed for you depending on which side of the dynamic you imagined.`
}

export function fantasyDirectionality(profile, answers, maxCount = 6) {
  const evidence = scoreFantasyProfile(profile, answers)
  const rows = []
  for (const dimension of profile.dimensions || []) {
    const metric = evidence[dimension.id]
    const receiveGive = directionalSentence(dimension.label, 'receiving it', metric?.perspectives?.receive, 'giving it', metric?.perspectives?.give)
    if (receiveGive) rows.push({ dimensionId: dimension.id, text: receiveGive, strength: Math.max(metric.perspectives.receive.score, metric.perspectives.give.score) })

    const watchSeen = directionalSentence(dimension.label, 'being observed', metric?.perspectives?.be_observed, 'watching', metric?.perspectives?.observe)
    if (watchSeen) rows.push({ dimensionId: dimension.id, text: watchSeen, strength: Math.max(metric.perspectives.be_observed.score, metric.perspectives.observe.score) })
  }
  return rows.sort((a, b) => b.strength - a.strength || a.text.localeCompare(b.text)).slice(0, maxCount)
}

export function nearbyFantasyThemes(profile, dimensionId, answers = {}, maxCount = 4) {
  const counts = new Map()
  const evidence = scoreFantasyProfile(profile, answers)
  for (const question of profile.questions || []) {
    const ids = [...new Set((question.signals || []).map((signal) => signal.dimensionId))]
    if (!ids.includes(dimensionId)) continue
    for (const id of ids) {
      if (id !== dimensionId) counts.set(id, (counts.get(id) || 0) + 1)
    }
  }
  const dimensions = dimensionMap(profile)
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([id]) => dimensions.get(id))
    .filter((dimension) => dimension && evidence[dimension.id]?.observations >= 2 && POSITIVE_BANDS.has(evidence[dimension.id]?.band))
    .slice(0, maxCount)
}

export function kinkAreasForTheme(profile, answers, dimensionId) {
  const ruleIds = new Set((profile.questions || [])
    .filter((question) => question.signals?.some((signal) => signal.dimensionId === dimensionId))
    .flatMap((question) => question.suggestionLinks || []))
  return buildFantasySuggestions(profile, answers).filter((suggestion) => ruleIds.has(suggestion.id))
}

export function fantasySuggestionDetails(profile, answers, suggestionId) {
  const suggestion = buildFantasySuggestions(profile, answers).find((row) => row.id === suggestionId)
  const rule = (profile.suggestionRules || []).find((row) => row.id === suggestionId)
  if (!suggestion || !rule) return null
  const dimensions = dimensionMap(profile)
  const evidence = scoreFantasyProfile(profile, answers)
  const conditionIds = [...new Set([...(rule.requiredEvidence || []), ...(rule.supportingEvidence || [])].map((condition) => condition.dimensionId))]
    .filter((id) => POSITIVE_BANDS.has(evidence[id]?.band))
  const examples = []
  for (const id of conditionIds) examples.push(...contributingAnswers(profile, answers, id, 2))
  const uniqueExamples = [...new Map(examples.map((row) => [row.questionId, row])).values()].slice(0, 4)
  return {
    ...suggestion,
    themes: conditionIds.map((id) => dimensions.get(id)).filter(Boolean),
    examples: uniqueExamples,
  }
}

export function buildFantasyResults(profile, answers) {
  return {
    drivers: rankedFantasyThemes(profile, answers, 'driver', 6),
    patterns: rankedFantasyThemes(profile, answers, 'motif', 7),
    directions: fantasyDirectionality(profile, answers, 6),
    suggestions: buildFantasySuggestions(profile, answers, { maxSuggestions: 6 }),
  }
}
