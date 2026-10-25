import { ACTIVITY_RATINGS, activityRatingLabel, activityDetailsAllowed, normalizeActivityExtras } from './collectionActivityAnswers.js'
import items from '../data/contextInterests.json' with { type: 'json' }

export const CONTEXT_ITEMS = items
export const CONTEXT_RATINGS = ACTIVITY_RATINGS
export const contextRatingLabel = activityRatingLabel
const record = value => value && typeof value === 'object' && !Array.isArray(value)

export function normalizeContextInterests(raw, { strict = false, publicOnly = false } = {}) {
  if (raw === undefined) return {}
  const fail = () => { if (strict) throw new Error('Invalid setting preference.') }
  if (!record(raw)) { fail(); return {} }
  const result = {}
  for (const [id, value] of Object.entries(raw)) {
    const item = items.find(item => item.id === id)
    if (!item || !record(value) || (value.rating ? !CONTEXT_RATINGS.some(([id]) => id === value.rating) : !value.experience)) { fail(); continue }
    const entry = { ...(value.rating ? { rating: value.rating } : {}), ...normalizeActivityExtras(value, value.rating, { strict, publicOnly }) }
    if (activityDetailsAllowed(value.rating) && !publicOnly) {
      if (value.details !== undefined && (!Array.isArray(value.details) || value.details.some(option => !item.options.includes(option)))) fail()
      entry.details = [...new Set((Array.isArray(value.details) ? value.details : []).filter(option => item.options.includes(option)))]
      if (value.note !== undefined && typeof value.note !== 'string') fail()
      entry.note = typeof value.note === 'string' ? value.note.slice(0, 2000) : ''
    }
    result[id] = entry
  }
  return result
}
export function setContextRating(raw, id, rating) {
  const next = normalizeContextInterests(raw), previous = next[id]
  if (!rating || previous?.rating === rating) { if (previous?.experience) next[id] = { experience: previous.experience }; else delete next[id] }
  else next[id] = { ...previous, rating }
  return normalizeContextInterests(next)
}
export function setContextDetails(raw, id, patch) {
  const next = normalizeContextInterests(raw), previous = next[id]
  next[id] = { ...previous, ...patch, ...(previous?.rating ? { rating: previous.rating } : {}) }
  return normalizeContextInterests(next)
}
