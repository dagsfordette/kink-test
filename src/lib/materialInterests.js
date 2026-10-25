import items from '../data/materialInterests.json' with { type: 'json' }

export const MATERIAL_ITEMS = items
export const MATERIAL_RATINGS = [
  ['enjoy', 'Enjoy'], ['love', 'Love'], ['fetish', 'Fetish'], ['no', 'No / turn-off']
]
export const MATERIAL_PERSPECTIVES = [
  ['self', 'Wearing or using it myself'], ['partner', 'My partner wearing or using it'], ['together', 'Using it together']
]
const record = value => value && typeof value === 'object' && !Array.isArray(value)
export function normalizeMaterialInterests(raw, { strict = false, publicOnly = false } = {}) {
  if (raw === undefined) return {}
  const fail = () => { if (strict) throw new Error('Invalid clothing or material preference.') }
  if (!record(raw)) { fail(); return {} }
  const result = {}
  for (const [id, value] of Object.entries(raw)) {
    if (!items.some(item => item.id === id) || !record(value) || !MATERIAL_RATINGS.some(([rating]) => rating === value.rating)) { fail(); continue }
    const entry = { rating: value.rating }
    if (value.rating !== 'no' && !publicOnly) {
      if (value.perspectives !== undefined && (!Array.isArray(value.perspectives) || value.perspectives.some(p => !MATERIAL_PERSPECTIVES.some(([id]) => id === p)))) fail()
      entry.perspectives = [...new Set((Array.isArray(value.perspectives) ? value.perspectives : []).filter(p => MATERIAL_PERSPECTIVES.some(([id]) => id === p)))]
      if (value.note !== undefined && typeof value.note !== 'string') fail()
      entry.note = typeof value.note === 'string' ? value.note.slice(0, 2000) : ''
    }
    result[id] = entry
  }
  return result
}
export function setMaterialRating(interests, id, rating) {
  const next = { ...interests }
  if (!rating || interests?.[id]?.rating === rating) delete next[id]
  else next[id] = rating === 'no' ? { rating } : { ...interests?.[id], rating }
  return normalizeMaterialInterests(next)
}
