import { buildFantasySuggestions, scoreFantasyProfile } from './fantasyProfile.js'

const POSITIVE_BANDS = new Set(['strong', 'notable'])

function themeLabels(profile, answers) {
  const evidence = scoreFantasyProfile(profile, answers)
  return (profile.dimensions || [])
    .filter((dimension) => POSITIVE_BANDS.has(evidence[dimension.id]?.band))
    .sort((a, b) => evidence[b.id].score - evidence[a.id].score || a.label.localeCompare(b.label))
    .map((dimension) => dimension.label)
}

export function buildActivityCategorySuggestions(activityCatalog, fantasyProfile, fantasyAnswers = {}) {
  const suggestions = buildFantasySuggestions(fantasyProfile, fantasyAnswers)
  if (!suggestions.length) return []

  const categoryById = new Map((activityCatalog.categories || []).map((category, index) => [category.id, { category, index }]))
  const rows = new Map()

  for (const suggestion of suggestions) {
    for (const categoryId of suggestion.activityCategoryIds || []) {
      const categoryEntry = categoryById.get(categoryId)
      if (!categoryEntry) continue
      const existing = rows.get(categoryId) || {
        category: categoryEntry.category,
        catalogIndex: categoryEntry.index,
        evidencePoints: 0,
        suggestionLabels: [],
        reasons: [],
      }
      existing.evidencePoints = Math.max(existing.evidencePoints, suggestion.evidencePoints || 0)
      if (!existing.suggestionLabels.includes(suggestion.label)) existing.suggestionLabels.push(suggestion.label)
      for (const reason of suggestion.why || []) {
        if (!existing.reasons.includes(reason)) existing.reasons.push(reason)
      }
      rows.set(categoryId, existing)
    }
  }

  return [...rows.values()]
    .sort((a, b) => b.evidencePoints - a.evidencePoints || a.catalogIndex - b.catalogIndex)
    .map((row) => ({
      category: row.category,
      evidencePoints: row.evidencePoints,
      reason: row.reasons.length
        ? `This connects with ${row.reasons.slice(0, 2).join(' and ')}.`
        : `This overlaps with ${row.suggestionLabels.slice(0, 2).join(' and ').toLowerCase()} in your Fantasy Profile.`,
    }))
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
