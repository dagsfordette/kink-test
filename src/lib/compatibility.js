import { isAnswered, normalizeWillingnessForResults } from './profile.js'
import { primaryCategoryId } from './taxonomy.js'

export const compatibilityStateLabels = {
  strong_directional_match: 'Strong directional match',
  shared_mutual_interest: 'Shared mutual interest',
  possible_discussion: 'Possible discussion',
  fantasy_real_world_mismatch: 'Fantasy / real-world mismatch',
  conditional_match: 'Conditional match',
  hard_limit_conflict: 'Hard-limit conflict',
  insufficient_data: 'Insufficient data',
}

const COMPLEMENTS = new Map([
  ['give', 'receive'], ['receive', 'give'],
  ['as_dominant', 'as_submissive'], ['as_submissive', 'as_dominant'],
  ['as_owner', 'as_owned'], ['as_owned', 'as_owner'],
  ['observe', 'be_observed'], ['be_observed', 'observe'],
  ['feel_self', 'evoke_partner'], ['evoke_partner', 'feel_self'],
])

const STRONG_REAL_WORLD = new Set(['strongly_want', 'want'])
const POSITIVE_FANTASY = new Set(['love_it', 'like_it'])
const NEGATIVE_REAL_WORLD = new Set(['prefer_not', 'do_not_want'])
const OPEN_WILLINGNESS = new Set(['actively_want', 'interested_in_trying', 'open_to_it', 'unsure'])

function hardLimit(answer) {
  return answer?.boundary === 'hard_limit' || normalizeWillingnessForResults(answer?.willingness) === 'hard_limit'
}

function conditional(answer) {
  if (answer?.boundary === 'conditional') return true
  for (const value of Object.values(answer?.details || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value) && Object.values(value).includes('conditional')) return true
  }
  return false
}

function detailHardLimitConflicts(leftAnswer, rightAnswer) {
  const conflicts = []
  const leftDetails = leftAnswer?.details || {}
  const rightDetails = rightAnswer?.details || {}
  for (const fieldId of new Set([...Object.keys(leftDetails), ...Object.keys(rightDetails)])) {
    const left = leftDetails[fieldId]
    const right = rightDetails[fieldId]
    if (!left || !right || Array.isArray(left) || Array.isArray(right) || typeof left !== 'object' || typeof right !== 'object') continue
    for (const optionId of new Set([...Object.keys(left), ...Object.keys(right)])) {
      const a = left[optionId]
      const b = right[optionId]
      const otherPositive = (value) => ['appealing', 'acceptable', 'conditional'].includes(value)
      if ((a === 'hard_limit' && otherPositive(b)) || (b === 'hard_limit' && otherPositive(a))) conflicts.push({ fieldId, optionId, leftState: a, rightState: b })
    }
  }
  return conflicts
}

function fantasyRealityMismatch(left, right) {
  const leftFantasyOnly = normalizeWillingnessForResults(left?.willingness) === 'fantasy_only' || (POSITIVE_FANTASY.has(left?.preference?.fantasy) && NEGATIVE_REAL_WORLD.has(left?.preference?.realWorld))
  const rightFantasyOnly = normalizeWillingnessForResults(right?.willingness) === 'fantasy_only' || (POSITIVE_FANTASY.has(right?.preference?.fantasy) && NEGATIVE_REAL_WORLD.has(right?.preference?.realWorld))
  const leftReality = STRONG_REAL_WORLD.has(left?.preference?.realWorld) || ['actively_want', 'interested_in_trying'].includes(normalizeWillingnessForResults(left?.willingness))
  const rightReality = STRONG_REAL_WORLD.has(right?.preference?.realWorld) || ['actively_want', 'interested_in_trying'].includes(normalizeWillingnessForResults(right?.willingness))
  return (leftFantasyOnly && rightReality) || (rightFantasyOnly && leftReality)
}

function strength(answer) {
  let score = 0
  if (answer?.preference?.realWorld === 'strongly_want') score += 3
  else if (answer?.preference?.realWorld === 'want') score += 2
  else if (answer?.preference?.realWorld === 'unsure') score += 1
  if (answer?.preference?.fantasy === 'love_it') score += 2
  else if (answer?.preference?.fantasy === 'like_it') score += 1
  const willingness = normalizeWillingnessForResults(answer?.willingness)
  if (willingness === 'actively_want') score += 3
  else if (willingness === 'interested_in_trying') score += 2
  else if (OPEN_WILLINGNESS.has(willingness)) score += 1
  else if (willingness === 'not_interested') score -= 2
  return score
}

function classifyPair(left, right, directional) {
  if (!left || !right || !isAnswered(left) || !isAnswered(right)) return 'insufficient_data'
  if (hardLimit(left) || hardLimit(right)) return 'hard_limit_conflict'
  if (detailHardLimitConflicts(left, right).length) return 'hard_limit_conflict'
  if (fantasyRealityMismatch(left, right)) return 'fantasy_real_world_mismatch'
  if (conditional(left) || conditional(right)) return 'conditional_match'
  const minStrength = Math.min(strength(left), strength(right))
  if (minStrength >= 4) return directional ? 'strong_directional_match' : 'shared_mutual_interest'
  return 'possible_discussion'
}

function answerFor(answers, conceptId, perspective) {
  return answers?.[`${conceptId}::${perspective}`] || null
}

function conceptPerspectives(concept) {
  if (Array.isArray(concept?.perspectives) && concept.perspectives.length) return concept.perspectives
  if (concept?.perspectivePrompts && typeof concept.perspectivePrompts === 'object') {
    const ids = Object.keys(concept.perspectivePrompts)
    if (ids.length) return ids
  }
  return ['overall']
}

function positiveCategoryInterest(catalog, answers, categoryId) {
  for (const concept of catalog.concepts) {
    if (primaryCategoryId(concept) !== categoryId) continue
    for (const perspective of conceptPerspectives(concept)) {
      const answer = answerFor(answers, concept.id, perspective)
      if (!answer || hardLimit(answer)) continue
      if (strength(answer) >= 2) return true
    }
  }
  return false
}

export function compareResponses(catalog, leftResponse = {}, rightResponse = {}) {
  const leftAnswers = leftResponse.answers || {}
  const rightAnswers = rightResponse.answers || {}
  const rows = []

  for (const category of catalog.categories) {
    const leftHard = leftResponse.categoryGates?.[category.id]?.state === 'hard_limit'
    const rightHard = rightResponse.categoryGates?.[category.id]?.state === 'hard_limit'
    const conflict = (leftHard && positiveCategoryInterest(catalog, rightAnswers, category.id)) || (rightHard && positiveCategoryInterest(catalog, leftAnswers, category.id))
    if (conflict) rows.push({ key: `category:${category.id}`, scope: 'category', categoryId: category.id, label: category.label, state: 'hard_limit_conflict', directional: false })
  }

  for (const concept of catalog.concepts) {
    if (concept.tags?.includes('branch_gate')) continue
    const perspectives = conceptPerspectives(concept)
    const seen = new Set()
    for (const leftPerspective of perspectives) {
      const complement = COMPLEMENTS.get(leftPerspective)
      const rightPerspective = complement && perspectives.includes(complement) ? complement : leftPerspective
      const directional = Boolean(complement && rightPerspective !== leftPerspective)
      const pairId = `${leftPerspective}->${rightPerspective}`
      if (seen.has(pairId)) continue
      seen.add(pairId)
      const left = answerFor(leftAnswers, concept.id, leftPerspective)
      const right = answerFor(rightAnswers, concept.id, rightPerspective)
      if (!left && !right) continue
      const detailConflicts = detailHardLimitConflicts(left, right)
      rows.push({
        key: `${concept.id}:${pairId}`,
        scope: 'concept',
        conceptId: concept.id,
        categoryId: primaryCategoryId(concept),
        label: concept.label,
        leftPerspective,
        rightPerspective,
        directional,
        state: classifyPair(left, right, directional),
        detailConflicts,
      })
    }
  }

  const priority = ['hard_limit_conflict', 'fantasy_real_world_mismatch', 'conditional_match', 'strong_directional_match', 'shared_mutual_interest', 'possible_discussion', 'insufficient_data']
  rows.sort((a, b) => priority.indexOf(a.state) - priority.indexOf(b.state) || a.label.localeCompare(b.label))
  const counts = Object.fromEntries(priority.map((state) => [state, rows.filter((row) => row.state === state).length]))
  return {
    modelVersion: '1.0.0',
    rows,
    counts,
    hardLimitConflicts: rows.filter((row) => row.state === 'hard_limit_conflict'),
    comparableRows: rows.filter((row) => row.state !== 'insufficient_data').length,
    note: 'States are descriptive interaction classifications. No overall compatibility percentage is calculated, and hard-limit conflicts take precedence over positive matches.',
  }
}
