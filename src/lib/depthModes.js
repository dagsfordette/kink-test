export const DEPTH_MODE_IDS = ['quick', 'standard', 'exhaustive']
export const CATEGORY_GATE_STATE_IDS = ['interested', 'maybe', 'not_interested', 'hard_limit', 'skip']

export function normalizeDepthMode(mode) {
  return DEPTH_MODE_IDS.includes(mode) ? mode : 'standard'
}

export function modeConceptIds(category, mode) {
  const normalized = normalizeDepthMode(mode)
  return Array.isArray(category?.depthConceptIds?.[normalized]) ? category.depthConceptIds[normalized] : []
}

export function conceptsForDepth(category, concepts, mode, { representativeOnly = false, exhaustiveOverride = false } = {}) {
  const selectedMode = exhaustiveOverride ? 'exhaustive' : representativeOnly ? 'quick' : normalizeDepthMode(mode)
  const ids = modeConceptIds(category, selectedMode)
  if (!ids.length) return exhaustiveOverride ? concepts : []
  const byId = new Map(concepts.map((concept) => [concept.id, concept]))
  return ids.map((id) => byId.get(id)).filter(Boolean)
}

export function createCategoryGateRecord(state) {
  if (!CATEGORY_GATE_STATE_IDS.includes(state)) return undefined
  const record = { state }
  if (state === 'hard_limit') record.boundary = { level: 'hard_limit', scope: 'category' }
  return record
}

export function normalizeCategoryGateRecord(record) {
  if (!record || !CATEGORY_GATE_STATE_IDS.includes(record.state)) return undefined
  return createCategoryGateRecord(record.state)
}

export function normalizeCategoryGates(catalog, raw = {}) {
  const normalized = {}
  for (const category of catalog?.categories || []) {
    const record = normalizeCategoryGateRecord(raw?.[category.id])
    if (record) normalized[category.id] = record
  }
  return normalized
}

export function categoryGateIsAnswered(record) {
  const normalized = normalizeCategoryGateRecord(record)
  return Boolean(normalized && normalized.state !== 'skip')
}

export function categoryGateBoundary(record) {
  const normalized = normalizeCategoryGateRecord(record)
  return normalized?.state === 'hard_limit' ? normalized.boundary : null
}

export function categoryGatePolicy(record) {
  const state = normalizeCategoryGateRecord(record)?.state
  if (state === 'interested') return { state, defaultOpen: true, representativeOnly: false, collapsedReason: null }
  if (state === 'maybe') return { state, defaultOpen: true, representativeOnly: true, collapsedReason: null }
  if (state === 'not_interested') return { state, defaultOpen: false, representativeOnly: false, collapsedReason: 'not_interested' }
  if (state === 'hard_limit') return { state, defaultOpen: false, representativeOnly: false, collapsedReason: 'hard_limit' }
  if (state === 'skip') return { state, defaultOpen: false, representativeOnly: false, collapsedReason: 'skip' }
  return { state: null, defaultOpen: false, representativeOnly: false, collapsedReason: 'unanswered' }
}

export function categoryGateSummary(catalog, categoryGates = {}) {
  const rows = []
  for (const category of catalog?.categories || []) {
    const gate = normalizeCategoryGateRecord(categoryGates[category.id])
    if (!gate) continue
    rows.push({ categoryId: category.id, label: category.label, state: gate.state, answered: categoryGateIsAnswered(gate), boundary: categoryGateBoundary(gate) })
  }
  return rows
}
