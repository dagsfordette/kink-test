export const POWER_EXCHANGE_CATEGORY_ID = 'power_exchange'

export const POWER_EXCHANGE_ROLE_SIDES = {
  dominant: new Set(['as_dominant', 'give', 'as_owner']),
  submissive: new Set(['as_submissive', 'receive', 'as_owned']),
}

export function powerExchangeModel(catalog) {
  return catalog?.powerExchangeModel || {}
}

export function normalizePowerExchangePreferences(catalog, raw = {}) {
  const model = powerExchangeModel(catalog)
  const next = {}

  const optionIds = (options = []) => new Set(options.map((option) => option.id))
  const keepSingle = (key, options) => {
    const allowed = optionIds(options)
    if (allowed.has(raw?.[key])) next[key] = raw[key]
  }
  const keepMulti = (key, options) => {
    const allowed = optionIds(options)
    const values = [...new Set((Array.isArray(raw?.[key]) ? raw[key] : []).filter((id) => allowed.has(id)))]
    if (values.length) next[key] = values
  }

  keepSingle('roleOrientation', model.roleOptions)
  keepSingle('switchLean', model.switchLeanOptions)
  keepMulti('dominantStyles', model.dynamicStyles?.dominant)
  keepMulti('submissiveStyles', model.dynamicStyles?.submissive)
  keepSingle('structure', model.structureOptions)
  keepMulti('timing', model.timingOptions)
  keepMulti('settings', model.settingOptions)
  keepMulti('domains', model.domainOptions)
  keepSingle('authorityLevel', model.authorityOptions)
  keepMulti('agreementPreferences', model.agreementOptions)
  keepMulti('automaticPauseConditions', model.pauseConditionOptions)
  if (raw?.exploreExtended === true) next.exploreExtended = true
  return next
}

export function patchPowerExchangePreference(catalog, preferences = {}, key, value) {
  const raw = { ...(preferences || {}) }
  const empty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)
  if (empty) delete raw[key]
  else raw[key] = value
  if (key === 'roleOrientation' && value !== 'switch') delete raw.switchLean
  return normalizePowerExchangePreferences(catalog, raw)
}

export function togglePowerExchangeMulti(catalog, preferences = {}, key, optionId) {
  const model = powerExchangeModel(catalog)
  const optionSource = {
    dominantStyles: model.dynamicStyles?.dominant,
    submissiveStyles: model.dynamicStyles?.submissive,
    timing: model.timingOptions,
    settings: model.settingOptions,
    domains: model.domainOptions,
    agreementPreferences: model.agreementOptions,
    automaticPauseConditions: model.pauseConditionOptions,
  }[key] || []
  const allowed = new Set(optionSource.map((option) => option.id))
  if (!allowed.has(optionId)) return normalizePowerExchangePreferences(catalog, preferences)
  const selected = new Set(Array.isArray(preferences?.[key]) ? preferences[key] : [])
  if (selected.has(optionId)) selected.delete(optionId)
  else selected.add(optionId)
  return patchPowerExchangePreference(catalog, preferences, key, [...selected])
}

export const POWER_EXCHANGE_REAL_WORLD_STATES = [
  { id: 'love_it', label: 'Love it' },
  { id: 'like_it', label: 'Like it' },
  { id: 'curious_to_try', label: 'Curious to try' },
  { id: 'open_for_partner', label: 'Open if my partner wants it' },
  { id: 'prefer_not', label: 'Prefer not' },
  { id: 'soft_limit', label: 'Soft limit' },
  { id: 'hard_limit', label: 'Hard limit' },
]

const REAL_WORLD_STATE_MAP = {
  love_it: { preference: { realWorld: 'strongly_want' }, willingness: 'actively_want', boundary: 'none' },
  like_it: { preference: { realWorld: 'want' }, willingness: 'open_to_it', boundary: 'none' },
  curious_to_try: { preference: { realWorld: 'unsure' }, willingness: 'interested_in_trying', boundary: 'none' },
  open_for_partner: { preference: { realWorld: 'unsure' }, willingness: 'open_to_it', boundary: 'none' },
  prefer_not: { preference: { realWorld: 'prefer_not' }, willingness: 'not_interested', boundary: 'none' },
  soft_limit: { preference: { realWorld: 'prefer_not' }, willingness: 'unsure', boundary: 'soft_limit' },
  hard_limit: { preference: { realWorld: 'do_not_want' }, willingness: 'hard_limit', boundary: 'hard_limit' },
}

export function powerExchangeRealWorldState(answer = {}) {
  if (answer.boundary === 'hard_limit' || answer.willingness === 'hard_limit') return 'hard_limit'
  if (answer.boundary === 'soft_limit') return 'soft_limit'
  if (answer.willingness === 'not_interested' || answer.preference?.realWorld === 'prefer_not' || answer.preference?.realWorld === 'do_not_want') return 'prefer_not'
  if (answer.willingness === 'interested_in_trying') return 'curious_to_try'
  if (answer.willingness === 'open_to_it' && answer.preference?.realWorld === 'unsure') return 'open_for_partner'
  if (answer.preference?.realWorld === 'strongly_want' || answer.willingness === 'actively_want') return 'love_it'
  if (answer.preference?.realWorld === 'want') return 'like_it'
  return undefined
}

export function applyPowerExchangeRealWorldState(answer = {}, state) {
  const mapping = REAL_WORLD_STATE_MAP[state]
  const next = { ...(answer || {}), preference: { ...(answer?.preference || {}) } }
  delete next.preference.realWorld
  delete next.willingness
  delete next.boundary

  if (!mapping) {
    if (!Object.keys(next.preference).length) delete next.preference
    return next
  }

  next.preference = { ...next.preference, ...mapping.preference }
  next.willingness = mapping.willingness
  next.boundary = mapping.boundary
  return next
}

export function powerExchangeConceptSide(concept) {
  const perspectives = concept?.perspectives || []
  if (!perspectives.length) return 'neutral'
  const hasDominant = perspectives.some((p) => POWER_EXCHANGE_ROLE_SIDES.dominant.has(p))
  const hasSubmissive = perspectives.some((p) => POWER_EXCHANGE_ROLE_SIDES.submissive.has(p))
  if (hasDominant && !hasSubmissive) return 'dominant'
  if (hasSubmissive && !hasDominant) return 'submissive'
  return 'neutral'
}

export function splitConceptsForPowerExchangeRole(concepts = [], roleOrientation) {
  if (!['dominant', 'submissive'].includes(roleOrientation)) return { primary: concepts, otherRole: [] }
  const opposite = roleOrientation === 'dominant' ? 'submissive' : 'dominant'
  const primary = []
  const otherRole = []
  for (const concept of concepts) {
    if (powerExchangeConceptSide(concept) === opposite) otherRole.push(concept)
    else primary.push(concept)
  }
  return { primary, otherRole }
}

export function shouldShowExtendedPowerExchange(catalog, preferences = {}, answers = {}) {
  const model = powerExchangeModel(catalog)
  if (preferences?.exploreExtended === true) return true
  if ((preferences?.timing || []).some((id) => ['ongoing', 'twenty_four_seven'].includes(id))) return true
  if (['broad', 'extensive'].includes(preferences?.authorityLevel)) return true
  if (['formal', 'high'].includes(preferences?.structure)) return true
  const extended = new Set(model.extendedConceptIds || [])
  return Object.entries(answers || {}).some(([key, answer]) => {
    const conceptId = key.split('::')[0]
    if (!extended.has(conceptId)) return false
    return Boolean(answer?.preference?.fantasy || answer?.preference?.realWorld || answer?.willingness || answer?.boundary || answer?.experience?.tried !== undefined || answer?.details)
  })
}

export function inheritedPowerExchangeSummary(catalog, preferences = {}) {
  const model = powerExchangeModel(catalog)
  const labelFor = (options, id) => (options || []).find((option) => option.id === id)?.label
  const parts = []
  if (preferences.structure) parts.push(labelFor(model.structureOptions, preferences.structure))
  if (preferences.timing?.length) parts.push(preferences.timing.slice(0, 2).map((id) => labelFor(model.timingOptions, id)).filter(Boolean).join(' · '))
  if (preferences.settings?.length) parts.push(preferences.settings.slice(0, 2).map((id) => labelFor(model.settingOptions, id)).filter(Boolean).join(' · '))
  return parts.filter(Boolean).join(' · ')
}


function labelsFor(options = [], values = []) {
  const map = new Map(options.map((option) => [option.id, option.label]))
  return (Array.isArray(values) ? values : []).map((id) => map.get(id)).filter(Boolean)
}

export function powerExchangePreferenceSummary(catalog, preferences = {}) {
  const model = powerExchangeModel(catalog)
  const sections = []
  const addSection = (id, label, fields) => {
    const answered = fields.filter((field) => field.values?.length).map((field, index) => ({ id: field.id || `${id}_${index + 1}`, ...field }))
    if (answered.length) sections.push({ id, label, fields: answered })
  }
  const single = (label, options, value) => ({ label, values: value ? labelsFor(options, [value]) : [] })
  const multi = (label, options, value) => ({ label, values: labelsFor(options, value) })

  addSection('role', 'Role / orientation', [
    single('Orientation', model.roleOptions, preferences.roleOrientation),
    single('Switch leaning', model.switchLeanOptions, preferences.switchLean),
  ])
  addSection('style', 'Dynamic style', [
    multi('Dominant-side styles', model.dynamicStyles?.dominant, preferences.dominantStyles),
    multi('Submissive-side styles', model.dynamicStyles?.submissive, preferences.submissiveStyles),
  ])
  addSection('scope', 'Scope & structure', [
    single('Structure', model.structureOptions, preferences.structure),
    multi('When it applies', model.timingOptions, preferences.timing),
    multi('Where it applies', model.settingOptions, preferences.settings),
    multi('Life domains', model.domainOptions, preferences.domains),
    single('Authority level', model.authorityOptions, preferences.authorityLevel),
  ])
  addSection('care', 'Power Exchange negotiation & care', [
    multi('Agreement practices', model.agreementOptions, preferences.agreementPreferences),
    multi('Automatic pause / narrowing conditions', model.pauseConditionOptions, preferences.automaticPauseConditions),
  ])
  return { sections, answeredFields: sections.reduce((count, section) => count + section.fields.length, 0), hasData: sections.length > 0 }
}
