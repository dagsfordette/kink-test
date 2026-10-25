import { TOY_GROUPS } from './featureInterests.js'
import { createEligibilityContext, evaluateActivity } from './eligibility.js'

export function toyActivityForRow(catalog, group, rowId) {
  const source = catalog.activities.find(activity => activity.id === group.sources[rowId])
  let activity = source
  if (!activity && rowId === 'self') {
    const receiving = catalog.activities.find(activity => activity.id === group.sources.receive)
    if (!receiving) return null
    activity = { ...receiving, id: `${group.id}_self`, roleConfigurations: [{ action: ['self_directed'] }], tags: ['self_directed'], fantasyConnections: [] }
  }
  if (!activity) return null
  if (group.id === 'toy_masturbation_sleeves') {
    activity = { ...activity, applicability: { all: [activity.applicability, { participant: rowId === 'give' ? 'partner' : 'self', anatomy: 'penis' }].filter(Boolean) } }
  }
  return activity
}

export function toyGroupsForState(catalog, state) {
  const context = createEligibilityContext(catalog, state, state.fantasyEvidence)
  return TOY_GROUPS.map(group => ({ ...group, rows: group.rows.filter(([id]) => {
    if ((state.exploration?.featureInterests?.[group.id]?.answers[id] || state.exploration?.featureInterests?.[group.id]?.activityDetails?.[id]?.experience)) return true
    const activity = toyActivityForRow(catalog, group, id)
    return activity && evaluateActivity(activity, context, { ignoreNavigation: true, ignoreSession: true }).queueVisible
  }) })).filter(group => group.rows.length)
}
