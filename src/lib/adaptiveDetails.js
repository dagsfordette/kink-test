export const DEFAULT_DETAIL_RESPONSE_STATES = [
  'appealing', 'acceptable', 'conditional', 'not_interested', 'hard_limit',
]

export function detailParentState(answer = {}) {
  if (answer.boundary === 'hard_limit' || answer.willingness === 'hard_limit') return 'hard_limit'
  if (answer.willingness === 'fantasy_only') return 'fantasy_only'
  if (answer.willingness === 'not_interested') return 'not_interested'
  if (answer.willingness === 'actively_want') return 'strongly_interested'
  if (answer.willingness === 'interested_in_trying') return 'interested'
  if (answer.willingness === 'open_to_it') return 'open'
  if (answer.willingness === 'unsure') return 'unsure'

  const realWorld = answer.preference?.realWorld
  const fantasy = answer.preference?.fantasy
  const experienced = answer.preference?.experienced
  if (realWorld === 'strongly_want' || fantasy === 'love_it' || experienced === 'love_it') return 'strongly_interested'
  if (realWorld === 'want' || fantasy === 'like_it' || experienced === 'like_it') return 'interested'
  if (realWorld === 'unsure' || fantasy === 'neutral' || experienced === 'neutral') return 'unsure'
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
  if (!field) return false
  const relevance = field.relevance || 'both'
  return (decision?.relevance || ['both', 'fantasy', 'real_world']).includes(relevance)
}

export function normalizePreferenceMatrix(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : {}
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

function detailFieldMatchesScope(field, conceptId, perspective) {
  if (!field) return false
  if (field.appliesToConceptIds && !field.appliesToConceptIds.includes(conceptId)) return false
  if (field.excludeForConceptIds?.includes(conceptId)) return false
  if (field.appliesToPerspectives && !field.appliesToPerspectives.includes(perspective)) return false
  if (field.excludeForPerspectives?.includes(perspective)) return false
  return true
}

export function hasAdaptiveDetailFields(catalog, concept, perspective, excludedFieldIds = []) {
  const excluded = new Set(excludedFieldIds || [])
  const primary = detailProfileFor(catalog, concept, perspective)
  const primaryHasFields = (primary?.fields || []).some((field) => !excluded.has(field.id) && detailFieldMatchesScope(field, concept?.id, perspective))
  if (primaryHasFields) return true

  const bodyProfileId = concept?.bodyPreferenceProfileByPerspective?.[perspective] || concept?.bodyPreferenceProfileId
  const bodyPolicy = catalog?.semanticTypes?.[concept?.semanticType || 'activity']?.followupPolicy?.bodyCompatibility
  const body = bodyPolicy === 'when_bound' && bodyProfileId ? (catalog?.bodyPreferenceProfiles || []).find((profile) => profile.id === bodyProfileId) : null
  return (body?.fields || []).some((field) => !excluded.has(field.id) && detailFieldMatchesScope(field, concept?.id, perspective))
}
