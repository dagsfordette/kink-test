// Only subtype edges establish ancestry. Complement/related edges are non-transitive.
const cache = new WeakMap()
export function relationshipGraph(catalog) {
  if (cache.has(catalog)) return cache.get(catalog)
  const ids = new Set((catalog.activities || []).map((a) => a.id))
  const children = new Map([...ids].map((id) => [id, []]))
  const parents = new Map([...ids].map((id) => [id, []]))
  const errors = [],
    edgeIds = new Set()
  if (ids.size !== catalog.activities?.length)
    errors.push('Duplicate activity ID')
  for (const edge of catalog.relationships || []) {
    if (
      edgeIds.has(edge.id) ||
      !ids.has(edge.fromId) ||
      !ids.has(edge.toId) ||
      edge.fromId === edge.toId ||
      !['subtype', 'complement', 'related'].includes(edge.type)
    ) {
      errors.push(`Invalid relationship ${edge.id}`)
      continue
    }
    edgeIds.add(edge.id)
    if (edge.type === 'subtype') {
      children.get(edge.fromId).push(edge.toId)
      parents.get(edge.toId).push(edge.fromId)
    }
  }
  const visited = new Set(),
    active = new Set()
  function visit(id) {
    if (active.has(id)) {
      errors.push(`Subtype cycle at ${id}`)
      return
    }
    if (visited.has(id)) return
    active.add(id)
    for (const child of children.get(id)) visit(child)
    active.delete(id)
    visited.add(id)
  }
  for (const id of ids) visit(id)
  for (const prompt of catalog.routingPrompts || []) {
    if (
      prompt.allowsHardBoundary !== false ||
      [...prompt.scope.rootActivityIds, ...prompt.scope.memberActivityIds].some(
        (id) => !ids.has(id)
      )
    )
      errors.push(`Invalid prompt ${prompt.id}`)
  }
  const result = { ids, children, parents, errors, valid: !errors.length }
  cache.set(catalog, result)
  return result
}
export function traverse(graph, start, direction = 'children') {
  if (!graph.valid) throw new Error(graph.errors.join('; '))
  const found = new Set(),
    pending = [...(graph[direction].get(start) || [])]
  while (pending.length) {
    const id = pending.pop()
    if (found.has(id)) continue
    found.add(id)
    pending.push(...(graph[direction].get(id) || []))
  }
  return [...found]
}
const scopeCache = new WeakMap()
export function scopeMembers(catalog, scope) {
  let scopes = scopeCache.get(catalog)
  if (!scopes) {
    scopes = new WeakMap()
    scopeCache.set(catalog, scopes)
  }
  if (scopes.has(scope)) return scopes.get(scope)
  const graph = relationshipGraph(catalog)
  if (!graph.valid) throw new Error(graph.errors.join('; '))
  const ids = new Set([...scope.rootActivityIds, ...scope.memberActivityIds])
  if (scope.includeDescendants)
    for (const id of scope.rootActivityIds)
      for (const child of traverse(graph, id)) ids.add(child)
  const members = [...ids]
  scopes.set(scope, members)
  return members
}
