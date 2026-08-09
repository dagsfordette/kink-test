export function primaryCategoryId(concept) {
  return concept?.primaryCategory || null
}

export function relatedCategoryIds(concept) {
  return Array.isArray(concept?.relatedCategories) ? concept.relatedCategories : []
}

export function discoverableCategoryIds(concept) {
  return [...new Set([primaryCategoryId(concept), ...relatedCategoryIds(concept)].filter(Boolean))]
}

export function categoriesByDomain(catalog) {
  const grouped = Object.fromEntries((catalog?.domains || []).map((domain) => [domain.id, []]))
  for (const category of catalog?.categories || []) {
    if (!grouped[category.domainId]) grouped[category.domainId] = []
    grouped[category.domainId].push(category)
  }
  return grouped
}

export function conceptsForCategory(catalog, categoryId) {
  return (catalog?.concepts || [])
    .filter((concept) => discoverableCategoryIds(concept).includes(categoryId))
    .sort((a, b) => {
      const aPrimary = primaryCategoryId(a) === categoryId ? 0 : 1
      const bPrimary = primaryCategoryId(b) === categoryId ? 0 : 1
      if (aPrimary !== bPrimary) return aPrimary - bPrimary
      return (catalog?.concepts || []).indexOf(a) - (catalog?.concepts || []).indexOf(b)
    })
}
