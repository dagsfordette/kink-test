const PAGE_SIZE = 50

// Drafts live in the same keyed list on every page, even outside the selected scope.
export function activityPage(
  rows,
  drafts = {},
  requestedPage = 0,
  size = PAGE_SIZE
) {
  const pinned = rows.filter((a) => drafts[a.id])
  const matches = rows.filter((a) => !drafts[a.id])
  const pageCount = Math.max(1, Math.ceil(matches.length / size))
  const page = Math.max(0, Math.min(pageCount - 1, requestedPage))
  return {
    page,
    pageCount,
    pinned: pinned.length,
    total: matches.length,
    rows: [...pinned, ...matches.slice(page * size, (page + 1) * size)],
    from: matches.length ? page * size + 1 : 0,
    to: Math.min(matches.length, (page + 1) * size)
  }
}
export function explorationViewKey(nav, exploration) {
  return JSON.stringify([
    nav.categoryId,
    nav.search,
    nav.showHidden,
    nav.reviewActivityId,
    exploration.session?.id,
    exploration.session?.status,
    exploration.facts,
    exploration.roles,
    exploration.manualApplicability,
    exploration.inferredFilterOverrides,
    exploration.relevanceOverrides,
    exploration.promptResponses
  ])
}
