const PAGE_SIZE = 50

// Keep the page order intact; retain off-page drafts after its regular cards.
export function activityPage(
  rows,
  drafts = {},
  requestedPage = 0,
  { size = PAGE_SIZE, anchorId = null } = {}
) {
  const pageCount = Math.max(1, Math.ceil(rows.length / size))
  let page = Math.max(0, Math.min(pageCount - 1, requestedPage))
  const anchorIndex = rows.findIndex((a) => a.id === anchorId)
  if (anchorIndex >= 0 && Math.floor(anchorIndex / size) !== page)
    page = Math.floor(anchorIndex / size)
  const regular = rows.slice(page * size, (page + 1) * size)
  const regularIds = new Set(regular.map((a) => a.id))
  const retained = rows.filter((a) => drafts[a.id] && !regularIds.has(a.id))
  return {
    page,
    pageCount,
    pinned: retained.length,
    total: rows.length,
    rows: [...regular, ...retained],
    from: rows.length ? page * size + 1 : 0,
    to: Math.min(rows.length, (page + 1) * size)
  }
}

export function nextActivityId(rows, id) {
  const index = rows.findIndex((a) => a.id === id)
  return index < 0 ? null : (rows[index + 1] || rows[index - 1])?.id || null
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
