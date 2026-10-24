import { filterActivities, detailFieldsForActivity } from './activityProfile.js'

export function createGuided() {
  return { topicId: null, done: false, trail: [], cursor: -1, skippedIds: [], defaults: {}, decisions: {} }
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
  return {
    ...base, done: raw.done === true, topicId,
    trail, cursor: trail.length ? Math.max(0, Math.min(trail.length - 1, Number.isInteger(raw.cursor) ? raw.cursor : 0)) : -1,
    skippedIds: list(raw.skippedIds), defaults, decisions
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
export function preferenceOffer(catalog, activity, answer, guided) {
  if (!['love', 'want', 'curious', 'if_partner_wants'].includes(answer?.stance)) return null
  for (const field of sharedFields(catalog, activity)) {
    const key = preferenceKey(activity, field), value = answer.details?.[field.id]
    if (!guided.decisions[key] && validValue(field, value)) return { key, field, value }
  }
  return null
}
export function describePreference(field, value) {
  const values = Array.isArray(value) ? value : [value]
  return field.options.filter(o => values.includes(o.id)).map(o => o.label).join(', ')
}
