import { buildFantasySuggestions } from './fantasyProfile.js'

export function buildActivityCategorySuggestions(
  activityCatalog,
  fantasyProfile,
  fantasyAnswers = {}
) {
  const suggestions = buildFantasySuggestions(fantasyProfile, fantasyAnswers)
  if (!suggestions.length) return []

  const categoryById = new Map(
    (activityCatalog.categories || []).map((category, index) => [
      category.id,
      { category, index }
    ])
  )
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
        reasons: []
      }
      existing.evidencePoints = Math.max(
        existing.evidencePoints,
        suggestion.evidencePoints || 0
      )
      if (!existing.suggestionLabels.includes(suggestion.label))
        existing.suggestionLabels.push(suggestion.label)
      for (const reason of suggestion.why || []) {
        if (!existing.reasons.includes(reason)) existing.reasons.push(reason)
      }
      rows.set(categoryId, existing)
    }
  }

  return [...rows.values()]
    .sort(
      (a, b) =>
        b.evidencePoints - a.evidencePoints || a.catalogIndex - b.catalogIndex
    )
    .map((row) => ({
      category: row.category,
      evidencePoints: row.evidencePoints,
      reason: row.reasons.length
        ? `This connects with ${row.reasons.slice(0, 2).join(' and ')}.`
        : `This overlaps with ${row.suggestionLabels.slice(0, 2).join(' and ').toLowerCase()} in your Fantasy Profile.`
    }))
}
