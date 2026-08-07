export function riskDomainDefinitions(catalog, concept) {
  const definitions = catalog?.riskDomains || {}
  return (concept?.riskDomains || []).map((id) => ({ id, ...(definitions[id] || {}) })).filter((row) => row.label)
}

export function riskPromptsForConcept(catalog, concept) {
  const promptIds = []
  for (const domainId of concept?.riskDomains || []) {
    for (const promptId of catalog?.riskPromptMap?.[domainId] || []) {
      if (!promptIds.includes(promptId)) promptIds.push(promptId)
    }
  }
  return promptIds.map((id) => ({ id, ...(catalog?.riskPrompts?.[id] || {}) })).filter((row) => row.text)
}
