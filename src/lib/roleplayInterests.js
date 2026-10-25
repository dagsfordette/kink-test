import { ACTIVITY_RATINGS, activityRatingLabel, activityDetailsAllowed, normalizeActivityExtras } from './collectionActivityAnswers.js'
import data from '../data/roleplayInterests.json' with { type: 'json' }

export const ROLEPLAY_ROLES = data.roles
export const ROLEPLAY_THEMES = data.themes
export const ROLEPLAY_RATINGS = ACTIVITY_RATINGS
export const ROLEPLAY_SIDES = ['self', 'partner']
const record = value => value && typeof value === 'object' && !Array.isArray(value)
const ratingValid = value => ROLEPLAY_RATINGS.some(([id]) => id === value)
export const roleplayRatingLabel = activityRatingLabel
export const roleplayRoleLabel = id => ROLEPLAY_ROLES.find(role => role.id === id)?.label || id
export function roleplaySideLabel(role, side, person = 'self') {
  const roleName = role.label.charAt(0).toLowerCase() + role.label.slice(1)
  if (person === 'other') return `${side === 'self' ? 'They play' : 'Their partner plays'}: ${roleName}`
  if (role.id === 'pretend_sleeping') return side === 'self' ? 'Pretending to sleep' : 'My partner pretending to sleep'
  return `${side === 'self' ? 'Being the' : 'My partner being the'} ${roleName}`
}
export function normalizeRoleplayInterests(raw, { strict = false, publicOnly = false } = {}) {
  const clean = { roles: {}, themes: {} }
  const fail = () => { if (strict) throw new Error('Invalid roleplay preference.') }
  if (raw === undefined) return clean
  if (!record(raw)) { fail(); return clean }
  for (const section of ['roles', 'themes']) if (raw[section] !== undefined && !record(raw[section])) fail()
  const note = value => {
    if (value !== undefined && typeof value !== 'string') fail()
    return typeof value === 'string' ? value.slice(0, 2000) : ''
  }
  for (const [id, sides] of Object.entries(record(raw.roles) ? raw.roles : {})) {
    const role = ROLEPLAY_ROLES.find(role => role.id === id)
    if (!role || !record(sides)) { fail(); continue }
    for (const [side, value] of Object.entries(sides)) {
      if (!ROLEPLAY_SIDES.includes(side) || !record(value) || (value.rating ? !ratingValid(value.rating) : !value.experience)) { fail(); continue }
      const entry = { ...(value.rating ? { rating: value.rating } : {}), ...normalizeActivityExtras(value, value.rating, { strict, publicOnly }) }
      if (activityDetailsAllowed(value.rating)) {
        if (value.pairs !== undefined && (!Array.isArray(value.pairs) || value.pairs.some(p => !role.counterparts.includes(p)))) fail()
        entry.pairs = [...new Set((Array.isArray(value.pairs) ? value.pairs : []).filter(p => role.counterparts.includes(p)))]
        if (value.pairRatings !== undefined && !record(value.pairRatings)) fail()
        entry.pairRatings = {}
        for (const [pair, rating] of Object.entries(record(value.pairRatings) ? value.pairRatings : {})) {
          if (!entry.pairs.includes(pair) || !ratingValid(rating)) { fail(); continue }
          entry.pairRatings[pair] = rating
        }
        if (value.pairConditions !== undefined && !record(value.pairConditions)) fail()
        const pairConditions = {}
        for (const [pair, text] of Object.entries(record(value.pairConditions) ? value.pairConditions : {})) {
          if (!entry.pairs.includes(pair) || typeof text !== 'string') { fail(); continue }
          if (!publicOnly && entry.pairRatings[pair] === 'soft_limit' && text) pairConditions[pair] = text.slice(0, 2000)
        }
        if (Object.keys(pairConditions).length) entry.pairConditions = pairConditions
        if (!publicOnly) {
          const options = side === 'self' ? role.selfAppeal : role.partnerAppeal
          if (value.appeal !== undefined && (!Array.isArray(value.appeal) || value.appeal.some(a => !options.includes(a)))) fail()
          entry.appeal = [...new Set((Array.isArray(value.appeal) ? value.appeal : []).filter(a => options.includes(a)))]
          entry.note = note(value.note)
        }
      }
      clean.roles[id] ||= {}
      clean.roles[id][side] = entry
    }
  }
  for (const [id, value] of Object.entries(record(raw.themes) ? raw.themes : {})) {
    if (!ROLEPLAY_THEMES.some(theme => theme.id === id) || !record(value) || (value.rating ? !ratingValid(value.rating) : !value.experience)) { fail(); continue }
    clean.themes[id] = { ...(value.rating ? { rating: value.rating } : {}), ...normalizeActivityExtras(value, value.rating, { strict, publicOnly }) }
    if (!publicOnly && activityDetailsAllowed(value.rating)) clean.themes[id].note = note(value.note)
  }
  return clean
}
export function setRoleplayRating(raw, roleId, side, rating) {
  const next = normalizeRoleplayInterests(raw)
  if (!ROLEPLAY_ROLES.some(role => role.id === roleId) || !ROLEPLAY_SIDES.includes(side)) return next
  next.roles[roleId] ||= {}
  const previous = next.roles[roleId][side]
  if (!rating || previous?.rating === rating) { if (previous?.experience) next.roles[roleId][side] = { experience: previous.experience }; else delete next.roles[roleId][side] }
  else next.roles[roleId][side] = { ...previous, rating }
  if (!Object.keys(next.roles[roleId]).length) delete next.roles[roleId]
  return normalizeRoleplayInterests(next)
}
export function setRoleplayDetails(raw, roleId, side, patch) {
  const next = normalizeRoleplayInterests(raw), current = next.roles[roleId]?.[side]
  if (!ROLEPLAY_ROLES.some(role => role.id === roleId) || !ROLEPLAY_SIDES.includes(side)) return next
  next.roles[roleId] ||= {}
  next.roles[roleId][side] = { ...current, ...patch, ...(current?.rating ? { rating: current.rating } : {}) }
  return normalizeRoleplayInterests(next)
}
export function setRoleplayThemeRating(raw, themeId, rating) {
  const next = normalizeRoleplayInterests(raw), previous = next.themes[themeId]
  if (!rating || previous?.rating === rating) { if (previous?.experience) next.themes[themeId] = { experience: previous.experience }; else delete next.themes[themeId] }
  else next.themes[themeId] = { ...previous, rating }
  return normalizeRoleplayInterests(next)
}
export function hasRoleplayMarks(value) {
  return Object.keys(value?.roles || {}).length > 0 || Object.keys(value?.themes || {}).length > 0
}

export function setRoleplayThemeDetails(raw, themeId, patch) {
  const next = normalizeRoleplayInterests(raw), previous = next.themes[themeId]
  if (!ROLEPLAY_THEMES.some(theme => theme.id === themeId)) return next
  next.themes[themeId] = { ...previous, ...patch, ...(previous?.rating ? { rating: previous.rating } : {}) }
  return normalizeRoleplayInterests(next)
}
