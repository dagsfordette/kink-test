const POSITIVE_STANCES = new Set(['love', 'want', 'curious', 'if_partner_wants'])
const LIMIT_STANCES = new Set(['soft_limit', 'hard_limit'])

export function buildFantasyRealityObservations(activityCatalog, fantasyResults, activityState, options = {}) {
  const maxItems = options.maxItems ?? 5
  const answers = activityState?.answers || {}
  const categoryActivities = new Map()
  for (const activity of activityCatalog?.activities || []) {
    if (!categoryActivities.has(activity.categoryId)) categoryActivities.set(activity.categoryId, [])
    categoryActivities.get(activity.categoryId).push(activity)
  }

  const observations = []
  const coveredCategories = new Set()

  for (const suggestion of fantasyResults?.suggestions || []) {
    const related = suggestion.activityCategoryIds.flatMap((id) => categoryActivities.get(id) || [])
    suggestion.activityCategoryIds.forEach((id) => coveredCategories.add(id))
    const answered = related.filter((activity) => answers[activity.id]?.stance)
    if (!answered.length) continue
    const positive = answered.filter((activity) => POSITIVE_STANCES.has(answers[activity.id].stance))
    const limits = answered.filter((activity) => LIMIT_STANCES.has(answers[activity.id].stance))
    const dontWant = answered.filter((activity) => answers[activity.id].stance === 'dont_want')

    if (limits.length && positive.length === 0) {
      observations.push({
        type: 'fantasy_limit',
        text: `${suggestion.label} showed up in fantasy, but the related activities you answered are ${limits.length === 1 ? 'a limit' : 'limits'} for you in real life. Fantasy and boundaries do not have to match.`,
      })
    } else if (positive.length) {
      const curious = positive.filter((activity) => answers[activity.id].stance === 'curious').length
      observations.push({
        type: 'fantasy_translation',
        text: curious
          ? `${suggestion.label} shows up in both places: you responded to it in fantasy, and you marked ${positive.length} related ${positive.length === 1 ? 'activity' : 'activities'} positively. ${curious} ${curious === 1 ? 'is' : 'are'} still in the “curious” zone.`
          : `${suggestion.label} shows up in both places: you responded to it in fantasy, and you marked ${positive.length} related ${positive.length === 1 ? 'activity' : 'activities'} positively.`,
      })
    } else if (dontWant.length) {
      observations.push({
        type: 'fantasy_low_reality',
        text: `${suggestion.label} showed up in fantasy, but you have not marked any related activities as something you want in real life.`,
      })
    }
  }

  for (const activity of activityCatalog?.activities || []) {
    if (observations.length >= maxItems) break
    const stance = answers[activity.id]?.stance
    if (!POSITIVE_STANCES.has(stance) || coveredCategories.has(activity.categoryId)) continue
    observations.push({
      type: 'reality_without_fantasy',
      text: `${activity.label} interests you in real life even though that area did not stand out in your Fantasy Profile.`,
    })
  }

  return observations.slice(0, maxItems)
}
