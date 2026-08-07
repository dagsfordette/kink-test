export function primaryCategoryId(concept) {
  return concept?.primaryCategory || concept?.categoryIds?.[0] || null
}

export function relatedCategoryIds(concept) {
  if (Array.isArray(concept?.relatedCategories)) return concept.relatedCategories
  return (concept?.categoryIds || []).slice(1)
}

export function discoverableCategoryIds(concept) {
  const values = [primaryCategoryId(concept), ...relatedCategoryIds(concept)].filter(Boolean)
  return [...new Set(values)]
}

export function canonicalConceptId(concept) {
  return concept?.canonicalId || concept?.id || null
}

export function conceptDomainId(catalog, concept) {
  if (concept?.domain) return concept.domain
  const primary = primaryCategoryId(concept)
  return catalog?.categories?.find((category) => category.id === primary)?.domainId || null
}

export function domainMap(catalog) {
  return Object.fromEntries((catalog?.domains || []).map((domain) => [domain.id, domain]))
}

export function categoryMap(catalog) {
  return Object.fromEntries((catalog?.categories || []).map((category) => [category.id, category]))
}

export function categoriesByDomain(catalog) {
  const grouped = Object.fromEntries((catalog?.domains || []).map((domain) => [domain.id, []]))
  for (const category of catalog?.categories || []) {
    if (!grouped[category.domainId]) grouped[category.domainId] = []
    grouped[category.domainId].push(category)
  }
  return grouped
}

export function resolveCanonicalConcept(catalog, concept) {
  if (!concept) return null
  const canonicalId = canonicalConceptId(concept)
  if (canonicalId === concept.id) return concept
  return (catalog?.concepts || []).find((candidate) => candidate.id === canonicalId) || concept
}

export function conceptsForCategory(catalog, categoryId, { includeBranchGates = false } = {}) {
  const seen = new Set()
  const rows = []

  for (const source of catalog?.concepts || []) {
    if (!discoverableCategoryIds(source).includes(categoryId)) continue
    const concept = resolveCanonicalConcept(catalog, source)
    if (!concept) continue
    if (!includeBranchGates && concept.tags?.includes('branch_gate')) continue

    const canonicalId = canonicalConceptId(concept)
    if (seen.has(canonicalId)) continue
    seen.add(canonicalId)
    rows.push(concept)
  }

  rows.sort((a, b) => {
    const aPrimary = primaryCategoryId(a) === categoryId ? 0 : 1
    const bPrimary = primaryCategoryId(b) === categoryId ? 0 : 1
    if (aPrimary !== bPrimary) return aPrimary - bPrimary
    return (catalog?.concepts || []).indexOf(a) - (catalog?.concepts || []).indexOf(b)
  })

  return rows
}

export function isRelatedPlacement(concept, categoryId) {
  return primaryCategoryId(concept) !== categoryId && discoverableCategoryIds(concept).includes(categoryId)
}
