import { filterActivities, detailFieldsForActivity, orderedActivityCategories } from './activityProfile.js'

export function createGuided() {
  return { topicId: null, done: false, trail: [], cursor: -1, skippedIds: [], defaults: {}, decisions: {}, topicHistory: [], bodyMapComplete: false, materialsComplete: false, roleplayComplete: false, contextsComplete: false, featuresComplete: false, tattoosComplete: false, sensoryComplete: false, scentComplete: false, toysComplete: false, flowComplete: false, pendingPreference: null, preferenceLastAsked: {} }
}
export function normalizeGuided(raw, catalog) {
  const base = createGuided(), ids = new Set(catalog.activities.map(a => a.id))
  if (!raw || typeof raw !== 'object') return base
  const list = value => [...new Set((Array.isArray(value) ? value : []).filter(id => ids.has(id)))]
  const topicId = catalog.categories.some(c => c.id === raw.topicId) ? raw.topicId : null
  const topicIds = new Set(catalog.activities.filter(a => a.categoryId === topicId).map(a => a.id))
  const trail = (Array.isArray(raw.trail) ? raw.trail : []).filter(id => topicIds.has(id)).slice(-2000)
  const defaults = {}, decisions = {}
  for (const a of catalog.activities) {
    for (const f of sharedFields(catalog, a)) {
      const key = preferenceKey(a, f), value = raw.defaults?.[key]
      if (validValue(f, value)) defaults[key] = value
      if (['remember', 'specific', 'unsure', 'depends'].includes(raw.decisions?.[key])) decisions[key] = raw.decisions[key]
    }
  }
  const source = catalog.activities.find(a => a.id === raw.pendingPreference?.activityId && a.categoryId === topicId)
  const pendingField = sharedFields(catalog, source).find(f => f.id === raw.pendingPreference?.fieldId)
  const pendingPreference = source && pendingField ? {
    activityId: source.id, fieldId: pendingField.id,
    exampleIds: list(raw.pendingPreference.exampleIds).filter(id => {
      const a = catalog.activities.find(a => a.id === id)
      return a.categoryId === topicId && preferenceKey(a, pendingField) === preferenceKey(source, pendingField)
    }).slice(-3),
    value: validValue(pendingField, raw.pendingPreference.value) ? raw.pendingPreference.value : pendingField.type === 'single_select' ? '' : []
  } : null
  return {
    ...base, pendingPreference,
    preferenceLastAsked: Object.fromEntries(Object.entries(raw.preferenceLastAsked || {}).filter(([id, count]) => catalog.categories.some(c => c.id === id) && Number.isInteger(count) && count >= 0 && count <= catalog.activities.length)),
    done: raw.done === true, topicId,
    trail, cursor: trail.length ? Math.max(0, Math.min(trail.length - 1, Number.isInteger(raw.cursor) ? raw.cursor : 0)) : -1,
    skippedIds: list(raw.skippedIds), defaults, decisions,
    bodyMapComplete: raw.bodyMapComplete === true,
    materialsComplete: raw.materialsComplete === true,
    roleplayComplete: raw.roleplayComplete === true,
    contextsComplete: raw.contextsComplete === true,
    featuresComplete: raw.featuresComplete === true,
    tattoosComplete: raw.tattoosComplete === true,
    sensoryComplete: raw.sensoryComplete === true,
    scentComplete: raw.scentComplete === true,
    toysComplete: raw.toysComplete === true,
    flowComplete: raw.flowComplete === true,
    topicHistory: (Array.isArray(raw.topicHistory) ? raw.topicHistory : []).slice(-100).flatMap(item => {
      if (!catalog.categories.some(c => c.id === item?.topicId)) return []
      const allowed = new Set(catalog.activities.filter(a => a.categoryId === item.topicId).map(a => a.id))
      const trail = (Array.isArray(item.trail) ? item.trail : []).filter(id => allowed.has(id)).slice(-2000)
      return [{ topicId: item.topicId, trail, cursor: trail.length ? Math.max(0, Math.min(trail.length - 1, Number.isInteger(item.cursor) ? item.cursor : 0)) : -1 }]
    })
  }
}
export function guidedQueue(catalog, state, guided) {
  if (!guided.topicId) return []
  const skipped = new Set(guided.skippedIds)
  // The guided route controls navigation; existing eligibility and broad-first ordering still apply.
  const available = filterActivities(catalog, {
    ...state, drafts: {}, exploration: { ...state.exploration, session: null },
    navigation: { ...state.navigation, categoryId: guided.topicId, reviewActivityId: null, search: '', showHidden: false, bypassPromptDeferral: true }
  }).filter(a => !state.answers[a.id]?.stance && !skipped.has(a.id))
  const recommendations = new Map()
  for (const source of catalog.activities) {
    if (source.categoryId !== guided.topicId || !['love','want','curious','if_partner_wants'].includes(state.answers[source.id]?.stance)) continue
    for (const link of source.learning?.followUps || []) {
      if (!state.answers[source.id].details?.[link.fieldId]?.includes(link.optionId)) continue
      for (const id of link.activityIds) recommendations.set(id, (recommendations.get(id) || 0) + 1)
    }
  }
  const rank = { starter: 0, extended: 1, specialized: 2 }
  const order = new Map(catalog.activities.map((a, i) => [a.id, i]))
  available.sort((a, b) => (recommendations.get(b.id) || 0) - (recommendations.get(a.id) || 0) || (a.learning?.order ?? 9999) - (b.learning?.order ?? 9999) || (rank[a.priority] ?? 1) - (rank[b.priority] ?? 1) || (a.explorationIntensity || 1) - (b.explorationIntensity || 1) || order.get(a.id) - order.get(b.id))
  const byId = new Map(available.map(a => [a.id, a])), parents = new Map()
  for (const r of catalog.relationships || []) if (r.type === 'subtype') {
    if (!parents.has(r.toId)) parents.set(r.toId, [])
    parents.get(r.toId).push(r.fromId)
  }
  const visited = new Set(), result = []
  function visit(id) {
    if (visited.has(id)) return
    visited.add(id)
    for (const parent of parents.get(id) || []) if (byId.has(parent)) visit(parent)
    if (byId.has(id)) result.push(byId.get(id))
  }
  available.forEach(a => visit(a.id))
  return result
}
export function chooseGuidedTopic(catalog, state, guided, topicId) {
  if (topicId === guided.topicId) return guided
  const next = { ...guided, topicId, done: false, trail: [], cursor: -1, skippedIds: [] }
  const first = guidedQueue(catalog, state, next)[0]
  return first ? { ...next, trail: [first.id], cursor: 0 } : next
}
export function advanceGuided(catalog, state, guided, skip = false) {
  const id = guided.trail[guided.cursor]
  const next = { ...guided, done: false, skippedIds: skip && id ? [...new Set([...guided.skippedIds, id])] : guided.skippedIds.filter(skipped => skipped !== id || !state.answers[id]?.stance) }
  const queue = guidedQueue(catalog, state, next).filter(a => a.id !== id)
  const eligible = new Set(queue.map(a => a.id))
  for (let cursor = guided.cursor + 1; cursor < guided.trail.length; cursor++) {
    const candidate = guided.trail[cursor]
    if (state.answers[candidate]?.stance || eligible.has(candidate)) return { ...next, cursor }
  }
  const visited = new Set(guided.trail)
  const first = queue.find(a => !visited.has(a.id)) || queue[0]
  const trail = guided.trail.slice(0, guided.cursor + 1)
  return first ? { ...next, trail: [...trail, first.id], cursor: trail.length } : { ...next, done: true }
}
export function nextGuidedTopic(catalog, state, guided) {
  for (const category of orderedActivityCategories(catalog, state)) {
    const bodyMap = category.id === 'body_part_fetishes'
    const toys = category.id === 'toys_devices'
    if (toys && guided.toysComplete) continue
    const scent = category.id === 'body_scent'
    if (scent && guided.scentComplete) continue
    const sensory = category.id === 'sensory_fetishes'
    if (sensory && guided.sensoryComplete) continue
    const tattoos = category.id === 'tattoo_interests'
    if (tattoos && guided.tattoosComplete) continue
    const features = category.id === 'body_features'
    if (features && guided.featuresComplete) continue
    const contexts = category.id === 'sexual_context'
    if (contexts && guided.contextsComplete) continue
    const roleplay = category.id === 'roleplay'
    if (roleplay && guided.roleplayComplete) continue
    const materials = category.id === 'fetish_materials'
    if (materials && guided.materialsComplete) continue
    if (bodyMap && guided.bodyMapComplete) continue
    const candidate = { ...guided, topicId: category.id, trail: [], cursor: -1, done: false, flowComplete: false }
    const first = bodyMap || materials || roleplay || contexts || features || tattoos || sensory || scent || toys ? null : guidedQueue(catalog, state, candidate)[0]
    if (!bodyMap && !materials && !roleplay && !contexts && !features && !tattoos && !sensory && !scent && !toys && !first) continue
    const history = guided.topicHistory || []
    const previous = guided.topicId && guided.topicId !== category.id
      ? [{ topicId: guided.topicId, trail: guided.trail, cursor: guided.cursor }] : []
    return { ...candidate, trail: first ? [first.id] : [], cursor: first ? 0 : -1, topicHistory: [...history, ...previous].slice(-100) }
  }
  return guided.flowComplete ? guided : { ...guided, done: true, flowComplete: true }
}
export function resumeGuidedFlow(catalog, state, guided) {
  if (guided.topicId && !guided.done && (guided.trail[guided.cursor] || ['body_part_fetishes', 'fetish_materials', 'roleplay', 'sexual_context', 'body_features', 'tattoo_interests', 'sensory_fetishes', 'body_scent', 'toys_devices'].includes(guided.topicId))) return guided
  return nextGuidedTopic(catalog, state, guided)
}
export function advanceGuidedFlow(catalog, state, guided, skip = false) {
  if (guided.topicId === 'toys_devices') return nextGuidedTopic(catalog, state, { ...guided, toysComplete: true, done: true })
  if (guided.topicId === 'body_scent') return nextGuidedTopic(catalog, state, { ...guided, scentComplete: true, done: true })
  if (guided.topicId === 'sensory_fetishes') return nextGuidedTopic(catalog, state, { ...guided, sensoryComplete: true, done: true })
  if (guided.topicId === 'tattoo_interests') return nextGuidedTopic(catalog, state, { ...guided, tattoosComplete: true, done: true })
  if (guided.topicId === 'body_features') return nextGuidedTopic(catalog, state, { ...guided, featuresComplete: true, done: true })
  if (guided.topicId === 'sexual_context') return nextGuidedTopic(catalog, state, { ...guided, contextsComplete: true, done: true })
  if (guided.topicId === 'roleplay') return nextGuidedTopic(catalog, state, { ...guided, roleplayComplete: true, done: true })
  if (guided.topicId === 'fetish_materials') return nextGuidedTopic(catalog, state, { ...guided, materialsComplete: true, done: true })
  if (guided.topicId === 'body_part_fetishes') return nextGuidedTopic(catalog, state, { ...guided, bodyMapComplete: true, done: true })
  const next = advanceGuided(catalog, state, guided, skip)
  return next.done ? nextGuidedTopic(catalog, state, next) : next
}
export function backGuidedFlow(guided) {
  if (guided.done && (guided.trail.length || ['body_part_fetishes', 'fetish_materials', 'roleplay', 'sexual_context', 'body_features', 'tattoo_interests', 'sensory_fetishes', 'body_scent', 'toys_devices'].includes(guided.topicId))) return { ...guided, done: false, flowComplete: false }
  if (guided.cursor > 0) return { ...guided, cursor: guided.cursor - 1, done: false, flowComplete: false }
  const history = guided.topicHistory || []
  if (!history.length) return guided
  return { ...guided, ...history.at(-1), topicHistory: history.slice(0, -1), done: false, flowComplete: false }
}

export function sharedFields(catalog, activity) {
  if (!activity) return []
  return detailFieldsForActivity(catalog, activity).filter(f => f.sharedPreference === true)
}
export function preferenceKey(activity, field) {
  if (activity.guidedRole) return `${activity.categoryId}/${activity.guidedRole}/${field.id}`
  const roles = [...new Set((activity.roleConfigurations || []).flatMap(c => c.coordination || []))].sort().join('_') || 'shared'
  return `${activity.categoryId}/${roles}/${field.id}`
}
export function validValue(field, value) {
  const ids = new Set((field.options || []).map(o => o.id))
  return field.type === 'single_select' ? ids.has(value) : Array.isArray(value) && value.length > 0 && value.every(v => ids.has(v))
}
const EXPLORATORY_STANCES = new Set(['love', 'want', 'curious', 'if_partner_wants', 'not_sure'])
export function nextPreferencePrompt(catalog, state, guided) {
  const activity = catalog.activities.find(a => a.id === guided.trail[guided.cursor])
  if (!activity || !EXPLORATORY_STANCES.has(state.answers[activity.id]?.stance)) return null
  const topicCount = catalog.activities.filter(a => a.categoryId === activity.categoryId && state.answers[a.id]?.stance).length
  if (topicCount - (guided.preferenceLastAsked?.[activity.categoryId] || 0) < 3) return null
  for (const field of sharedFields(catalog, activity)) {
    const key = preferenceKey(activity, field)
    if (guided.decisions[key] || validValue(field, guided.defaults[key])) continue
    const examples = catalog.activities.filter(a => a.categoryId === activity.categoryId && EXPLORATORY_STANCES.has(state.answers[a.id]?.stance) && sharedFields(catalog, a).some(f => f.id === field.id && preferenceKey(a, f) === key))
    if (examples.length < 3) continue
    return { activityId: activity.id, fieldId: field.id, exampleIds: [...examples.filter(a => a.id !== activity.id).slice(-2).map(a => a.id), activity.id], value: field.type === 'single_select' ? '' : [] }
  }
  return null
}
export function finishPreferencePrompt(catalog, state, guided, decision) {
  const pending = guided.pendingPreference
  const activity = catalog.activities.find(a => a.id === pending?.activityId)
  const field = sharedFields(catalog, activity).find(f => f.id === pending?.fieldId)
  if (!field || !['remember','unsure','depends'].includes(decision) || (decision === 'remember' && !validValue(field, pending.value))) return guided
  const key = preferenceKey(activity, field)
  return {
    ...guided, pendingPreference: null,
    decisions: { ...guided.decisions, [key]: decision },
    defaults: decision === 'remember' ? { ...guided.defaults, [key]: pending.value } : guided.defaults,
    preferenceLastAsked: { ...guided.preferenceLastAsked, [activity.categoryId]: catalog.activities.filter(a => a.categoryId === activity.categoryId && state.answers[a.id]?.stance).length }
  }
}
export function preferenceQuestion(activity, field) {
  if (field.id === 'role_scope') return 'How broadly would you want this dynamic to apply?'
  if (field.id === 'tone' && activity.categoryId === 'power_exchange') return activity.guidedRole === 'directing' ? 'Which styles appeal to you when giving directions?' : 'Which styles appeal to you when following directions?'
  if (field.id === 'tone') return activity.guidedRole === 'directing' ? 'Which styles appeal to you when directing service?' : 'Which styles appeal to you when providing service?'
  return 'What atmosphere would you enjoy for these activities?'
}

export function describePreference(field, value) {
  const values = Array.isArray(value) ? value : [value]
  return field.options.filter(o => values.includes(o.id)).map(o => o.label).join(', ')
}
