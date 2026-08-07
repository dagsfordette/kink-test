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
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) delete section[fieldId]
  else section[fieldId] = value
  if (Object.keys(section).length) next[sectionId] = section
  else delete next[sectionId]
  return next
}

export function toggleNegotiationOption(catalog, preferences = {}, sectionId, fieldId, optionId) {
  const field = fieldDefinition(catalog, sectionId, fieldId)
  if (!field || field.type !== 'multi_select') return preferences
  const current = Array.isArray(negotiationFieldValue(preferences, sectionId, fieldId))
    ? negotiationFieldValue(preferences, sectionId, fieldId)
    : []
  const selected = current.includes(optionId)
  let nextValues
  if (selected) nextValues = current.filter((id) => id !== optionId)
  else if ((field.exclusiveOptions || []).includes(optionId)) nextValues = [optionId]
  else nextValues = [...current.filter((id) => !(field.exclusiveOptions || []).includes(id)), optionId]
  return setNegotiationField(preferences, sectionId, fieldId, nextValues)
}

function renderValue(field, value) {
  const optionLabel = (id) => field.options?.find((option) => option.id === id)?.label || id
  if (field.type === 'multi_select') return (Array.isArray(value) ? value : []).map(optionLabel)
  if (field.type === 'single_select') return value ? [optionLabel(value)] : []
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

export function normalizeNegotiationPreferences(catalog, raw = {}) {
  const normalized = {}
  for (const section of negotiationModel(catalog).sections || []) {
    for (const field of section.fields || []) {
      const value = raw?.[section.id]?.[field.id]
      if (field.type === 'multi_select') {
        const valid = new Set((field.options || []).map((option) => option.id))
        const cleaned = [...new Set((Array.isArray(value) ? value : []).filter((id) => valid.has(id)))]
        if (cleaned.length) Object.assign(normalized, setNegotiationField(normalized, section.id, field.id, cleaned))
      } else if (field.type === 'single_select') {
        if ((field.options || []).some((option) => option.id === value)) Object.assign(normalized, setNegotiationField(normalized, section.id, field.id, value))
      } else if (field.type === 'text' && typeof value === 'string' && value.trim()) {
        Object.assign(normalized, setNegotiationField(normalized, section.id, field.id, value))
      }
    }
  }
  return normalized
}
