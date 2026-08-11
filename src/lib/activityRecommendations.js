import { buildFantasySuggestions, scoreFantasyProfile } from './fantasyProfile.js'

const POSITIVE_BANDS = new Set(['strong', 'notable'])

function themeLabels(profile, answers) {
  const evidence = scoreFantasyProfile(profile, answers)
  return (profile.dimensions || [])
    .filter((dimension) => POSITIVE_BANDS.has(evidence[dimension.id]?.band))
    .sort((a, b) => evidence[b.id].score - evidence[a.id].score || a.label.localeCompare(b.label))
    .map((dimension) => dimension.label)
}

export function buildActivityRecommendations(activityCatalog, fantasyProfile, fantasyAnswers = {}, options = {}) {
  const maxItems = options.maxItems ?? 10
  const suggestions = buildFantasySuggestions(fantasyProfile, fantasyAnswers, { maxSuggestions: 8 })
  if (!suggestions.length) return []

  const themes = themeLabels(fantasyProfile, fantasyAnswers)
  const candidates = []
  for (const suggestion of suggestions) {
    const categorySet = new Set(suggestion.activityCategoryIds || [])
    for (const activity of activityCatalog.activities || []) {
      if (!categorySet.has(activity.categoryId)) continue
      candidates.push({
        activity,
        suggestion,
        reason: suggestion.why?.length
          ? `This connects with ${suggestion.why.slice(0, 2).join(' and ')}.`
          : `This overlaps with your ${suggestion.label.toLowerCase()} results.`,
      })
    }
  }

  const priorityRank = { starter: 0, extended: 1, specialized: 2 }
  candidates.sort((a, b) => priorityRank[a.activity.priority] - priorityRank[b.activity.priority] || a.activity.label.localeCompare(b.activity.label))

  const chosen = []
  const seenActivities = new Set()
  const categoryCounts = new Map()
  const tagCounts = new Map()
  while (chosen.length < maxItems) {
    let best = null
    let bestScore = -Infinity
    for (const row of candidates) {
      if (seenActivities.has(row.activity.id)) continue
      const categoryCount = categoryCounts.get(row.activity.categoryId) || 0
      const tags = row.activity.tags || []
      const tagPenalty = tags.reduce((sum, tag) => sum + (tagCounts.get(tag) || 0), 0)
      const score = 8 - categoryCount * 2 - tagPenalty - priorityRank[row.activity.priority] * 0.5
      if (score > bestScore) {
        best = row
        bestScore = score
      }
    }
    if (!best) break
    chosen.push({ ...best, themes: themes.slice(0, 3) })
    seenActivities.add(best.activity.id)
    categoryCounts.set(best.activity.categoryId, (categoryCounts.get(best.activity.categoryId) || 0) + 1)
    for (const tag of best.activity.tags || []) tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
  }
  return chosen
}
