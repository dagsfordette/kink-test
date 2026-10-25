import { ACTIVITY_RATINGS, activityRatingLabel, activityDetailsAllowed, normalizeActivityExtras } from './collectionActivityAnswers.js'
import groups from '../data/featureInterests.json' with { type: 'json' }

export const FEATURE_GROUPS = groups.filter(group => group.categoryId === 'body_features')
export const TATTOO_GROUP = groups.find(group => group.id === 'tattoos')
export const BODY_SCENT_GROUP = groups.find(group => group.id === 'body_scent')
export const TOY_GROUPS = groups.filter(group => group.categoryId === 'toys_devices')
export const FEATURE_RATINGS = [['enjoy', 'Enjoy'], ['love', 'Love'], ['fetish', 'Fetish'], ['no', 'No']]
export const featureUsesActivityScale = groupId => groupId !== 'body_scent'
export const featureRatings = groupId => featureUsesActivityScale(groupId) ? ACTIVITY_RATINGS : FEATURE_RATINGS
export const featureRatingLabel = (value, groupId) => featureUsesActivityScale(groupId) ? activityRatingLabel(value) : FEATURE_RATINGS.find(([id]) => id === value)?.[1] || 'No particular interest'
const record = value => value && typeof value === 'object' && !Array.isArray(value)
const positive = (answers, groupId) => Object.values(answers || {}).some(rating => featureUsesActivityScale(groupId) ? activityDetailsAllowed(rating) : ['enjoy', 'love', 'fetish'].includes(rating))
export const hasFeatureMarks = (value, selectedGroups = FEATURE_GROUPS) => selectedGroups.some(group => Object.keys(value?.[group.id]?.answers || {}).length > 0 || Object.keys(value?.[group.id]?.activityDetails || {}).length > 0)

export function normalizeFeatureInterests(raw, { strict = false, publicOnly = false } = {}) {
  if (raw === undefined) return {}
  const fail = () => { if (strict) throw new Error('Invalid body-feature activity preference.') }
  if (!record(raw)) { fail(); return {} }
  const clean = {}
  for (const [id, value] of Object.entries(raw)) {
    const group = groups.find(group => group.id === id)
    if (!group || !record(value) || !record(value.answers)) { fail(); continue }
    const answers = {}
    for (const [action, rating] of Object.entries(value.answers)) {
      if (!group.rows.some(([id]) => id === action) || !featureRatings(id).some(([id]) => id === rating)) { fail(); continue }
      answers[action] = rating
    }
    const activityDetails = {}
    if (featureUsesActivityScale(id) && value.activityDetails !== undefined) {
      if (!record(value.activityDetails)) fail()
      for (const [action, details] of Object.entries(record(value.activityDetails) ? value.activityDetails : {})) {
        if (!group.rows.some(([key]) => key === action) || !record(details)) { fail(); continue }
        const extras = normalizeActivityExtras(details, answers[action], { strict, publicOnly })
        if (Object.keys(extras).length) activityDetails[action] = extras
      }
    }
    if (!Object.keys(answers).length && !Object.keys(activityDetails).length) continue
    clean[id] = { answers, ...(Object.keys(activityDetails).length ? { activityDetails } : {}) }
    if (positive(answers, id) && !publicOnly) {
      if (value.note !== undefined && typeof value.note !== 'string') fail()
      clean[id].note = typeof value.note === 'string' ? value.note.slice(0, 2000) : ''
    }
  }
  return clean
}
export function setFeatureRating(raw, groupId, actionId, rating) {
  const next = normalizeFeatureInterests(raw)
  if (!groups.find(group => group.id === groupId)?.rows.some(([id]) => id === actionId)) return next
  next[groupId] ||= { answers: {} }
  if (!rating || next[groupId].answers[actionId] === rating) delete next[groupId].answers[actionId]
  else next[groupId].answers[actionId] = rating
  return normalizeFeatureInterests(next)
}
export function setFeatureNote(raw, groupId, note) {
  const next = normalizeFeatureInterests(raw)
  if (positive(next[groupId]?.answers, groupId)) next[groupId].note = note
  return normalizeFeatureInterests(next)
}

export function featureActionLabel(label, person = 'self') {
  if (person !== 'other') return label
  return label.replaceAll('my partner', 'their partner').replaceAll('My partner', 'Their partner')
    .replace(/\bmy\b/g, 'their').replace(/\bI\b/g, 'they').replace(/\bme\b/g, 'them')
}

export function setFeatureActivityDetails(raw, groupId, actionId, patch) {
  const next = normalizeFeatureInterests(raw)
  if (!featureUsesActivityScale(groupId) || !groups.find(group => group.id === groupId)?.rows.some(([id]) => id === actionId)) return next
  next[groupId] ||= { answers: {} }
  next[groupId].activityDetails ||= {}
  next[groupId].activityDetails[actionId] = { ...next[groupId].activityDetails[actionId], ...patch }
  return normalizeFeatureInterests(next)
}
