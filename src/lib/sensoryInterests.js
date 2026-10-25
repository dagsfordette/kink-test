import { ACTIVITY_RATINGS, activityRatingLabel, activityDetailsAllowed, normalizeActivityExtras } from './collectionActivityAnswers.js'
import items from '../data/sensoryInterests.json' with { type: 'json' }

export const SENSORY_ITEMS = items
export const SENSORY_ROWS = items.flatMap(item => item.rows)
export const SENSORY_GROUPS = [...new Set(items.map(item => item.group))]
export const SENSORY_RATINGS = [['enjoy', 'Enjoy'], ['love', 'Love'], ['fetish', 'Fetish'], ['no', 'No']]
export const sensoryRatingLabel = (rating, rowId) => sensoryUsesActivityScale(rowId) ? activityRatingLabel(rating) : SENSORY_RATINGS.find(([id]) => id === rating)?.[1] || 'No particular interest'
export const sensoryUsesActivityScale = id => ['hear_whisper', 'give_whisper', 'hear_pleasure', 'make_pleasure', 'listen_asmr'].includes(id)
export const sensoryRatings = id => sensoryUsesActivityScale(id) ? ACTIVITY_RATINGS : SENSORY_RATINGS
const record = value => value && typeof value === 'object' && !Array.isArray(value)

export function normalizeSensoryInterests(raw, { strict = false, publicOnly = false } = {}) {
  if (raw === undefined) return {}
  const fail = () => { if (strict) throw new Error('Invalid sensory preference.') }
  if (!record(raw)) { fail(); return {} }
  const clean = {}
  for (const [id, value] of Object.entries(raw)) {
    const row = SENSORY_ROWS.find(row => row.id === id)
    if (!row || !record(value) || (value.rating ? !sensoryRatings(id).some(([key]) => key === value.rating) : !(sensoryUsesActivityScale(id) && value.experience))) { fail(); continue }
    clean[id] = { ...(value.rating ? { rating: value.rating } : {}), ...(sensoryUsesActivityScale(id) ? normalizeActivityExtras(value, value.rating, { strict, publicOnly }) : {}) }
    if ((sensoryUsesActivityScale(id) ? activityDetailsAllowed(value.rating) : value.rating && value.rating !== 'no') && !publicOnly) {
      if (value.choices !== undefined && (!Array.isArray(value.choices) || value.choices.some(choice => !row.choices.includes(choice)))) fail()
      clean[id].choices = [...new Set((Array.isArray(value.choices) ? value.choices : []).filter(choice => row.choices.includes(choice)))]
      if (value.note !== undefined && typeof value.note !== 'string') fail()
      clean[id].note = typeof value.note === 'string' ? value.note.slice(0, 2000) : ''
    }
  }
  return clean
}
export function setSensoryRating(raw, id, rating) {
  const next = normalizeSensoryInterests(raw), previous = next[id]
  if (!rating || previous?.rating === rating) { if (previous?.experience) next[id] = { experience: previous.experience }; else delete next[id] }
  else next[id] = { ...previous, rating }
  return normalizeSensoryInterests(next)
}
export function setSensoryDetails(raw, id, patch) {
  const next = normalizeSensoryInterests(raw), previous = next[id]
  if (!sensoryUsesActivityScale(id) && (!previous || previous.rating === 'no')) return next
  next[id] = { ...previous, ...patch, ...(previous?.rating ? { rating: previous.rating } : {}) }
  return normalizeSensoryInterests(next)
}
