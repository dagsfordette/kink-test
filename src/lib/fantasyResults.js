import { buildFantasySuggestions, scoreFantasyProfile } from './fantasyProfile.js'

const POSITIVE_STATES = new Set(['strong_turn_on', 'turn_on', 'intriguing'])
const POSITIVE_BANDS = new Set(['strong', 'notable'])

function responseLabelMap(profile) {
  return new Map((profile.responseScale || []).map((row) => [row.id, row.label]))
}

function dimensionMap(profile) {
  return new Map((profile.dimensions || []).map((dimension) => [dimension.id, dimension]))
}


// Directional themes are scored independently on both sides. A strong score on
// one side never reduces the score on the other, so someone can be high on both.
const DIRECTIONAL_ROLE_PAIRS = {
  helplessness_vulnerability: { left: 'experience_self', leftLabel: 'Being helpless or vulnerable', right: 'evoke_partner', rightLabel: 'A partner being helpless or vulnerable' },
  anticipation_denial: { left: 'receive', leftLabel: 'Being made to wait', right: 'give', rightLabel: 'Making a partner wait' },
  fear_adrenaline: { left: 'experience_self', leftLabel: 'Feeling fear or adrenaline', right: 'evoke_partner', rightLabel: 'Making a partner feel fear or adrenaline' },
  pain_intensity: { left: 'receive', leftLabel: 'Experiencing pain', right: 'give', rightLabel: 'Causing pain' },
  humiliation_embarrassment: { left: 'receive', leftLabel: 'Being humiliated or embarrassed', right: 'give', rightLabel: 'Humiliating or embarrassing a partner' },
  praise_approval: { left: 'receive', leftLabel: 'Receiving praise or approval', right: 'give', rightLabel: 'Giving praise or approval' },
  being_desired_attention: { left: 'receive', leftLabel: 'Being intensely desired', right: 'evoke_partner', rightLabel: 'Making a partner feel intensely desired' },
  possession_belonging: { left: 'give', leftLabel: 'Possessing a partner', right: 'receive', rightLabel: 'Being possessed by a partner' },
  tenderness_care: { left: 'give', leftLabel: 'Caring for a partner', right: 'receive', rightLabel: 'Being cared for by a partner' },
  control_permission: { left: 'give', leftLabel: 'Being in control', right: 'receive', rightLabel: 'Giving a partner control' },
  rules_ritual_protocol: { left: 'give', leftLabel: 'Setting rules', right: 'receive', rightLabel: 'Following a partner’s rules' },
  service_usefulness: { left: 'give', leftLabel: 'Serving a partner', right: 'receive', rightLabel: 'Being served by a partner' },
  restraint_confinement: { left: 'give', leftLabel: 'Restraining a partner', right: 'receive', rightLabel: 'Being restrained by a partner' },
  objectification_use: { left: 'give', leftLabel: 'Objectifying or using a partner', right: 'receive', rightLabel: 'Being objectified or used' },
  exposure_being_seen: { left: 'be_observed', leftLabel: 'Being exposed or seen', right: 'observe', rightLabel: 'Seeing a partner exposed' },
  watching_observation: { left: 'observe', leftLabel: 'Watching a partner', right: 'be_observed', rightLabel: 'Being watched by a partner' },
  sensory_focus_alteration: { left: 'experience_self', leftLabel: 'Having my senses altered', right: 'give', rightLabel: 'Altering a partner’s senses' },
  romance: { left: 'receive', leftLabel: 'Being deeply loved', right: 'give', rightLabel: 'Loving a partner deeply' },
  transformation: { left: 'receive', leftLabel: 'Being transformed', right: 'give', rightLabel: 'Transforming someone else' },
  becoming_huge: { left: 'experience_self', leftLabel: 'Becoming huge', right: 'observe', rightLabel: 'Someone else becoming huge' },
  being_tiny: { left: 'experience_self', leftLabel: 'Being tiny', right: 'observe', rightLabel: 'Someone else being tiny' },
  animal_transformation: { left: 'experience_self', leftLabel: 'Turning into an animal', right: 'observe', rightLabel: 'Seeing someone else transform' },
  mind_control: { left: 'receive', leftLabel: 'Being mentally controlled', right: 'give', rightLabel: 'Controlling someone else’s mind' },
  nonconsent: { left: 'receive', leftLabel: 'Having my consent overridden', right: 'give', rightLabel: 'Overriding a partner’s consent' },
  monsters_supernatural: { left: 'receive', leftLabel: 'Being with a nonhuman being', right: 'experience_self', rightLabel: 'Being the nonhuman character' },
}

function directionPairForDimension(dimension) {
  if (DIRECTIONAL_ROLE_PAIRS[dimension.id]) return DIRECTIONAL_ROLE_PAIRS[dimension.id]
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
  const dimension = (profile.dimensions || []).find((row) => row.id === dimensionId)
  if (!dimension) return null
  const pair = directionPairForDimension(dimension)
  if (!pair) return null

  const metric = scoreFantasyProfile(profile, answers)[dimensionId]
  const left = metric?.perspectives?.[pair.left]
  const right = metric?.perspectives?.[pair.right]
  if (!left?.observations && !right?.observations) return null

  const roles = [
    { key: pair.left, label: pair.leftLabel, metric: left },
    { key: pair.right, label: pair.rightLabel, metric: right },
  ].map((role) => ({
    key: role.key,
    label: role.label,
    observations: role.metric?.observations || 0,
    score: role.metric?.score ?? null,
    position: role.metric?.observations ? scorePosition(role.metric.score) : null,
    strength: role.metric?.observations ? scoreStrength(role.metric.score) : 'Not enough data',
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
    const sampled = left?.observations ? pair.leftLabel : pair.rightLabel
    summary = `You showed some signal for ${lowerFirst(sampled)}, but there isn’t enough information to compare both sides yet.`
  }

  return { dimensionId, roles, summary }
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
      direction: fantasyRoleBreakdown(profile, answers, row.id),
      examples: contributingAnswers(profile, answers, row.id, 3),
    }))
}

function directionalSentence(dimension, breakdown) {
  if (!breakdown?.summary) return null
  return `${dimension.label}: ${breakdown.summary}`
}

export function fantasyDirectionality(profile, answers, maxCount = 6) {
  const evidence = scoreFantasyProfile(profile, answers)
  const rows = []
  for (const dimension of profile.dimensions || []) {
    const breakdown = fantasyRoleBreakdown(profile, answers, dimension.id)
    if (!breakdown?.summary || breakdown.roles.filter((role) => role.observations).length < 2) continue
    const text = directionalSentence(dimension, breakdown)
    const strength = Math.max(...breakdown.roles.filter((role) => role.score !== null).map((role) => role.score))
    if (strength < 0.35 && evidence[dimension.id]?.band !== 'strong' && evidence[dimension.id]?.band !== 'notable') continue
    rows.push({
      dimensionId: dimension.id,
      text,
      strength,
      breakdown,
    })
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
    patterns: rankedFantasyThemes(profile, answers, 'motif', 10),
    directions: fantasyDirectionality(profile, answers, 6),
    suggestions: buildFantasySuggestions(profile, answers, { maxSuggestions: 6 }),
  }
}
