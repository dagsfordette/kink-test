export function riskPromptsForConcept(catalog, concept) {
  const promptIds = []
  for (const domainId of concept?.riskDomains || []) {
    for (const promptId of catalog?.riskPromptMap?.[domainId] || []) {
      if (!promptIds.includes(promptId)) promptIds.push(promptId)
    }
  }
  return promptIds.map((id) => ({ id, ...(catalog?.riskPrompts?.[id] || {}) })).filter((row) => row.text)
}
