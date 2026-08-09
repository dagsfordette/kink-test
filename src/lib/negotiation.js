export function negotiationModel(catalog) {
  return catalog?.negotiationPreferencesModel || { sections: [] }
}

function fieldDefinition(catalog, sectionId, fieldId) {
  const section = negotiationModel(catalog).sections?.find((row) => row.id === sectionId)
  return section?.fields?.find((row) => row.id === fieldId) || null
}

export function negotiationFieldValue(preferences = {}, sectionId, fieldId) {
  return preferences?.[sectionId]?.[fieldId]
}

export function setNegotiationField(preferences = {}, sectionId, fieldId, value) {
  const next = { ...(preferences || {}) }
  const section = { ...(next[sectionId] || {}) }
  const emptyObject = value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0) || emptyObject) delete section[fieldId]
  else section[fieldId] = value
  if (Object.keys(section).length) next[sectionId] = section
  else delete next[sectionId]
  return next
}

function multiSelectState(field, value) {
  if (field?.otherOption) {
    if (Array.isArray(value)) return { selected: value, otherText: '' }
    if (value && typeof value === 'object') {
      return {
        selected: Array.isArray(value.selected) ? value.selected : [],
        otherText: typeof value.otherText === 'string' ? value.otherText : '',
      }
    }
    return { selected: [], otherText: '' }
  }
  return { selected: Array.isArray(value) ? value : [], otherText: '' }
}

function buildMultiValue(field, selected, otherText = '') {
  if (!field?.otherOption) return selected
  return { selected, otherText }
}

export function toggleNegotiationOption(catalog, preferences = {}, sectionId, fieldId, optionId) {
  const field = fieldDefinition(catalog, sectionId, fieldId)
  if (!field || field.type !== 'multi_select') return preferences
  const currentValue = negotiationFieldValue(preferences, sectionId, fieldId)
  const current = multiSelectState(field, currentValue)
  const selected = current.selected.includes(optionId)
  let nextValues
  if (selected) nextValues = current.selected.filter((id) => id !== optionId)
  else if ((field.exclusiveOptions || []).includes(optionId)) nextValues = [optionId]
  else nextValues = [...current.selected.filter((id) => !(field.exclusiveOptions || []).includes(id)), optionId]
  const otherStillSelected = field.otherOption && nextValues.includes(field.otherOption.id)
  const otherText = otherStillSelected ? current.otherText : ''
  return setNegotiationField(preferences, sectionId, fieldId, buildMultiValue(field, nextValues, otherText))
}

function optionLabel(field, id) {
  if (field.otherOption?.id === id) return field.otherOption.label
  return field.options?.find((option) => option.id === id)?.label || id
}

function renderMatrixValue(field, value) {
  if (!value || typeof value !== 'object') return []
  const state = value.values && typeof value.values === 'object' ? value : { values: value, note: '' }
  const rows = new Map((field.rows || []).map((row) => [row.id, row.label]))
  const scale = new Map([...(field.scale || []), ...(field.notApplicable ? [field.notApplicable] : [])].map((option) => [option.id, option.label]))
  const values = []
  for (const row of field.rows || []) {
    const selected = state.values?.[row.id]
    if (selected && scale.has(selected)) values.push(`${rows.get(row.id)}: ${scale.get(selected)}`)
  }
  if (typeof state.note === 'string' && state.note.trim()) values.push(`Note: ${state.note.trim()}`)
  return values
}

function renderValue(field, value) {
  if (field.type === 'multi_select') {
    const state = multiSelectState(field, value)
    const values = state.selected.map((id) => optionLabel(field, id))
    if (field.otherOption && state.selected.includes(field.otherOption.id) && state.otherText.trim()) values.push(`${field.otherOption.summaryLabel || 'Other'}: ${state.otherText.trim()}`)
    return values
  }
  if (field.type === 'single_select' || field.type === 'scale') return value ? [optionLabel(field, value)] : []
  if (field.type === 'matrix_scale') return renderMatrixValue(field, value)
  if (field.type === 'text') return typeof value === 'string' && value.trim() ? [value.trim()] : []
  return []
}

export function negotiationPreferenceSummary(catalog, preferences = {}, { includePretestOnly = false, onlyPretestOnly = false } = {}) {
  const sections = []
  let answeredFields = 0
  for (const section of negotiationModel(catalog).sections || []) {
    if (onlyPretestOnly && !section.pretestOnly) continue
    if (!includePretestOnly && !onlyPretestOnly && section.pretestOnly) continue
    const fields = []
    for (const field of section.fields || []) {
      const rawValue = negotiationFieldValue(preferences, section.id, field.id)
      const values = renderValue(field, rawValue)
      if (!values.length) continue
      answeredFields += 1
      fields.push({ id: field.id, label: field.label, type: field.type, values, rawValue })
    }
    if (fields.length) sections.push({ id: section.id, label: section.label, description: section.description, fields })
  }
  return { answeredFields, sections, hasData: answeredFields > 0 }
}

function normalizeMultiSelect(field, value) {
  const valid = new Set((field.options || []).map((option) => option.id))
  if (field.otherOption) valid.add(field.otherOption.id)
  const state = multiSelectState(field, value)
  let cleaned = [...new Set(state.selected.filter((id) => valid.has(id)))]
  const selectedExclusive = cleaned.find((id) => (field.exclusiveOptions || []).includes(id))
  if (selectedExclusive) cleaned = [selectedExclusive]
  const otherText = field.otherOption && cleaned.includes(field.otherOption.id) && typeof state.otherText === 'string' ? state.otherText : ''
  if (!cleaned.length && !otherText.trim()) return undefined
  return buildMultiValue(field, cleaned, otherText)
}

function normalizeMatrix(field, value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  const rawValues = value.values && typeof value.values === 'object' ? value.values : value
  const allowedRows = new Set((field.rows || []).map((row) => row.id))
  const allowedScale = new Set([...(field.scale || []), ...(field.notApplicable ? [field.notApplicable] : [])].map((option) => option.id))
  const values = {}
  for (const [rowId, scaleId] of Object.entries(rawValues)) {
    if (allowedRows.has(rowId) && allowedScale.has(scaleId)) values[rowId] = scaleId
  }
  const note = typeof value.note === 'string' ? value.note : ''
  if (!Object.keys(values).length && !note.trim()) return undefined
  return { values, note }
}

export function normalizeNegotiationPreferences(catalog, raw = {}) {
  let normalized = {}
  for (const section of negotiationModel(catalog).sections || []) {
    for (const field of section.fields || []) {
      const value = raw?.[section.id]?.[field.id]
      if (field.type === 'multi_select') {
        const cleaned = normalizeMultiSelect(field, value)
        if (cleaned !== undefined) normalized = setNegotiationField(normalized, section.id, field.id, cleaned)
      } else if (field.type === 'single_select' || field.type === 'scale') {
        if ((field.options || []).some((option) => option.id === value)) normalized = setNegotiationField(normalized, section.id, field.id, value)
      } else if (field.type === 'matrix_scale') {
        const cleaned = normalizeMatrix(field, value)
        if (cleaned !== undefined) normalized = setNegotiationField(normalized, section.id, field.id, cleaned)
      } else if (field.type === 'text' && typeof value === 'string' && value.trim()) {
        normalized = setNegotiationField(normalized, section.id, field.id, value)
      }
    }
  }
  return normalized
}
