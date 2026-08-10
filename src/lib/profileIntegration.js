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
        text: `Fantasy interest around ${suggestion.label.toLowerCase()} sits alongside ${limits.length} related real-world ${limits.length === 1 ? 'limit' : 'limits'} in the activities you have answered.`,
      })
    } else if (positive.length) {
      const curious = positive.filter((activity) => answers[activity.id].stance === 'curious').length
      observations.push({
        type: 'fantasy_translation',
        text: curious
          ? `${suggestion.label} connects with ${positive.length} related real-world ${positive.length === 1 ? 'activity' : 'activities'} you marked positively, including ${curious} ${curious === 1 ? 'curiosity' : 'curiosities'}.`
          : `${suggestion.label} connects with ${positive.length} related real-world ${positive.length === 1 ? 'activity' : 'activities'} you marked positively.`,
      })
    } else if (dontWant.length) {
      observations.push({
        type: 'fantasy_low_reality',
        text: `Fantasy interest around ${suggestion.label.toLowerCase()} does not currently translate into positive real-world stances among the related activities you have answered.`,
      })
    }
  }

  for (const activity of activityCatalog?.activities || []) {
    if (observations.length >= maxItems) break
    const stance = answers[activity.id]?.stance
    if (!POSITIVE_STANCES.has(stance) || coveredCategories.has(activity.categoryId)) continue
    observations.push({
      type: 'reality_without_fantasy',
      text: `${activity.label} interests you in real life even though its broader category was not prominent in your current Fantasy Profile suggestions.`,
    })
  }

  return observations.slice(0, maxItems)
}
