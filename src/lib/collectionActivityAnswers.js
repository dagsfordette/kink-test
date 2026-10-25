import catalog from '../data/activityCatalog.json' with { type: 'json' }

export const ACTIVITY_RATINGS = catalog.stanceScale.map(({ id, label }) => [id, label])
export const ACTIVITY_EXPERIENCES = catalog.experienceScale.map(({ id, label }) => [id, label])
export const activityRatingValid = value => ACTIVITY_RATINGS.some(([id]) => id === value)
export const activityDetailsAllowed = rating => Boolean(rating) && !['dont_want', 'hard_limit'].includes(rating)
export const activityRatingLabel = value => ACTIVITY_RATINGS.find(([id]) => id === value)?.[1] || 'No answer recorded'

export function normalizeActivityExtras(value, rating, { strict = false, publicOnly = false } = {}) {
  const clean = {}
  if (value.experience) {
    if (ACTIVITY_EXPERIENCES.some(([id]) => id === value.experience)) clean.experience = value.experience
    else if (strict) throw new Error('Invalid activity experience.')
  }
  if (value.conditions !== undefined) {
    if (typeof value.conditions !== 'string') { if (strict) throw new Error('Invalid activity conditions.') }
    else if (rating === 'soft_limit' && !publicOnly && value.conditions) clean.conditions = value.conditions.slice(0, 2000)
  }
  return clean
}
