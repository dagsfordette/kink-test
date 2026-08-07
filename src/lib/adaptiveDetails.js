const LEGACY_POSITIVE_WILLINGNESS = new Set(['curious', 'want_to_try', 'would_try', 'would_do'])

export const DEFAULT_DETAIL_RESPONSE_STATES = [
  'appealing', 'acceptable', 'conditional', 'not_interested', 'hard_limit',
]

export function detailParentState(answer = {}) {
  if (answer.boundary === 'hard_limit' || answer.willingness === 'hard_limit') return 'hard_limit'
  if (answer.willingness === 'fantasy_only') return 'fantasy_only'
  if (answer.willingness === 'not_interested' || answer.willingness === 'would_not_try') return 'not_interested'
  if (answer.willingness === 'actively_want') return 'strongly_interested'
  if (answer.willingness === 'interested_in_trying' || ['want_to_try', 'would_do'].includes(answer.willingness)) return 'interested'
  if (answer.willingness === 'open_to_it' || LEGACY_POSITIVE_WILLINGNESS.has(answer.willingness)) return 'open'
  if (answer.willingness === 'unsure' || answer.willingness === 'unknown') return 'unsure'

  const realWorld = answer.preference?.realWorld
  const fantasy = answer.preference?.fantasy
  const experienced = answer.preference?.experienced
  if (realWorld === 'strongly_want' || fantasy === 'love_it' || experienced === 'love_it') return 'strongly_interested'
  if (realWorld === 'want' || fantasy === 'like_it' || experienced === 'like_it') return 'interested'
  if (realWorld === 'unsure' || fantasy === 'unknown' || experienced === 'unknown' || fantasy === 'neutral') return 'unsure'
  if (['prefer_not', 'do_not_want'].includes(realWorld) && ['dislike_it', 'hate_it', undefined].includes(fantasy)) return 'not_interested'
  if (['dislike_it', 'hate_it'].includes(experienced || fantasy) && !realWorld) return 'not_interested'
  return 'unanswered'
}

export function detailBranchDecision(catalog, answer, manualOverride = false) {
  const state = detailParentState(answer)
  const system = catalog?.adaptiveDetailSystem || {}
  const rule = system.branchRules?.[state] || { defaultOpen: false, relevance: ['both', 'fantasy', 'real_world'] }
  return {
    state,
    defaultOpen: rule.defaultOpen === true,
    open: manualOverride || rule.defaultOpen === true,
    manualOverride,
    relevance: rule.relevance || ['both', 'fantasy', 'real_world'],
    reason: rule.reason || '',
  }
}

export function fieldVisibleForBranch(field, decision) {
  if (!field || field.deprecated) return false
  const relevance = field.relevance || 'both'
  return (decision?.relevance || ['both', 'fantasy', 'real_world']).includes(relevance)
}

export function legacyFieldVisible(field, details = {}) {
  return Boolean(field?.deprecated && Object.prototype.hasOwnProperty.call(details || {}, field.id))
}

export function normalizePreferenceMatrix(value) {
  if (!value) return {}
  if (Array.isArray(value)) return Object.fromEntries(value.map((id) => [id, 'appealing']))
  if (typeof value === 'object') return { ...value }
  return {}
}

export function setPreferenceMatrixValue(value, optionId, state) {
  const next = normalizePreferenceMatrix(value)
  if (!state) delete next[optionId]
  else next[optionId] = state
  return next
}

export function countDetailResponses(details = {}) {
  let count = 0
  for (const value of Object.values(details || {})) {
    if (Array.isArray(value)) count += value.length
    else if (value && typeof value === 'object') count += Object.values(value).filter((entry) => entry !== undefined && entry !== null && entry !== '').length
    else if (value !== undefined && value !== null && value !== '') count += 1
  }
  return count
}

export function detailProfileFor(catalog, concept, perspective) {
  const profileId = concept?.detailProfileByPerspective?.[perspective] || concept?.detailProfileId
  return (catalog?.detailProfiles || []).find((profile) => profile.id === profileId) || null
}

export function hasAdaptiveDetailProfile(catalog, concept, perspective) {
  const primary = detailProfileFor(catalog, concept, perspective)
  const bodyProfileId = concept?.bodyPreferenceProfileByPerspective?.[perspective] || concept?.bodyPreferenceProfileId
  const bodyPolicy = catalog?.semanticTypes?.[concept?.semanticType || 'activity']?.followupPolicy?.bodyCompatibility
  const body = bodyPolicy === 'when_bound' && bodyProfileId ? (catalog?.bodyPreferenceProfiles || []).find((profile) => profile.id === bodyProfileId) : null
  return Boolean(primary || body)
}
