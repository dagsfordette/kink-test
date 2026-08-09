const EXPECTED_TOP_LEVEL_KEYS = [
  'questionnaire', 'scales', 'domains', 'categories', 'concepts',
  'detailProfiles', 'bodyPreferenceProfiles', 'semanticTypes', 'adaptiveDetailSystem',
  'riskPrompts', 'riskPromptMap', 'negotiationPreferencesModel', 'powerExchangeModel',
]

const CURRENT_WILLINGNESS = [
  'actively_want', 'interested_in_trying', 'open_to_it', 'unsure',
  'fantasy_only', 'not_interested', 'hard_limit',
]

const REMOVED_CONCEPT_FIELDS = [
  'canonicalId', 'categoryIds', 'dimensions', 'specifierBindings', 'relations', 'branching',
  'wording', 'semanticTags', 'answerable', 'requiresExplicitConsent', 'directQuestioning', 'questionModel', 'type', 'domain',
]

function duplicateIds(rows = []) {
  const seen = new Set()
  const duplicates = new Set()
  for (const row of rows) {
    if (!row?.id) continue
    if (seen.has(row.id)) duplicates.add(row.id)
    seen.add(row.id)
  }
  return [...duplicates]
}

export function validateCatalog(catalog) {
  const errors = []
  const error = (message) => errors.push(message)

  const actualTop = Object.keys(catalog || {}).sort()
  const expectedTop = [...EXPECTED_TOP_LEVEL_KEYS].sort()
  if (JSON.stringify(actualTop) !== JSON.stringify(expectedTop)) error('Catalog contains unexpected or missing top-level sections.')

  for (const [label, rows] of [['domain', catalog.domains], ['category', catalog.categories], ['concept', catalog.concepts], ['detail profile', catalog.detailProfiles], ['body preference profile', catalog.bodyPreferenceProfiles]]) {
    const duplicates = duplicateIds(rows)
    if (duplicates.length) error(`Duplicate ${label} ids: ${duplicates.join(', ')}`)
  }

  const domainIds = new Set((catalog.domains || []).map((row) => row.id))
  const categoryIds = new Set((catalog.categories || []).map((row) => row.id))
  const conceptIds = new Set((catalog.concepts || []).map((row) => row.id))
  const detailProfileIds = new Set((catalog.detailProfiles || []).map((row) => row.id))
  const bodyProfileIds = new Set((catalog.bodyPreferenceProfiles || []).map((row) => row.id))
  const semanticIds = new Set(Object.keys(catalog.semanticTypes || {}))
  const riskDomainIds = new Set(Object.keys(catalog.riskPromptMap || {}))

  const willingness = (catalog.scales?.willingness?.values || []).map((row) => row.id)
  if (JSON.stringify(willingness) !== JSON.stringify(CURRENT_WILLINGNESS)) error('Willingness scale must contain only the current response states.')
  if ('legacyValues' in (catalog.scales?.willingness || {})) error('Legacy willingness values are not allowed in the prototype catalog.')

  for (const category of catalog.categories || []) {
    if (!domainIds.has(category.domainId)) error(`Category ${category.id} references unknown domain ${category.domainId}.`)
    const modes = category.depthConceptIds || {}
    for (const mode of ['quick', 'standard', 'exhaustive']) {
      if (!Array.isArray(modes[mode])) error(`Category ${category.id} is missing ${mode} depth concepts.`)
      for (const conceptId of modes[mode] || []) {
        if (!conceptIds.has(conceptId)) error(`Category ${category.id} ${mode} mode references unknown concept ${conceptId}.`)
      }
    }
    const quick = new Set(modes.quick || [])
    const standard = new Set(modes.standard || [])
    const exhaustive = new Set(modes.exhaustive || [])
    for (const id of quick) if (!standard.has(id)) error(`Category ${category.id}: Quick must be a subset of Standard (${id}).`)
    for (const id of standard) if (!exhaustive.has(id)) error(`Category ${category.id}: Standard must be a subset of Exhaustive (${id}).`)
  }

  const exhaustiveReachable = new Set((catalog.categories || []).flatMap((category) => category.depthConceptIds?.exhaustive || []))
  for (const concept of catalog.concepts || []) {
    for (const field of REMOVED_CONCEPT_FIELDS) if (field in concept) error(`Concept ${concept.id} still contains removed field ${field}.`)
    if (!concept.label || !concept.description) error(`Concept ${concept.id} needs a label and description.`)
    if (!categoryIds.has(concept.primaryCategory)) error(`Concept ${concept.id} has unknown primary category ${concept.primaryCategory}.`)
    for (const categoryId of concept.relatedCategories || []) if (!categoryIds.has(categoryId)) error(`Concept ${concept.id} has unknown related category ${categoryId}.`)
    if (!semanticIds.has(concept.semanticType)) error(`Concept ${concept.id} has unknown semantic type ${concept.semanticType}.`)
    if (!Array.isArray(concept.perspectives) || !concept.perspectives.length) error(`Concept ${concept.id} needs at least one perspective.`)
    if (concept.detailProfileId && !detailProfileIds.has(concept.detailProfileId)) error(`Concept ${concept.id} references missing detail profile ${concept.detailProfileId}.`)
    for (const profileId of Object.values(concept.detailProfileByPerspective || {})) if (!detailProfileIds.has(profileId)) error(`Concept ${concept.id} references missing detail profile ${profileId}.`)
    if (concept.bodyPreferenceProfileId && !bodyProfileIds.has(concept.bodyPreferenceProfileId)) error(`Concept ${concept.id} references missing body profile ${concept.bodyPreferenceProfileId}.`)
    for (const domainId of concept.riskDomains || []) if (!riskDomainIds.has(domainId)) error(`Concept ${concept.id} references unknown risk domain ${domainId}.`)
    if (!exhaustiveReachable.has(concept.id)) error(`Concept ${concept.id} is unreachable from exhaustive navigation.`)
  }

  for (const profile of [...(catalog.detailProfiles || []), ...(catalog.bodyPreferenceProfiles || [])]) {
    for (const field of profile.fields || []) {
      if (field.deprecated) error(`Profile ${profile.id} contains deprecated field ${field.id}.`)
      for (const conceptId of [...(field.appliesToConceptIds || []), ...(field.excludeForConceptIds || [])]) {
        if (!conceptIds.has(conceptId)) error(`Profile ${profile.id} field ${field.id} references unknown concept ${conceptId}.`)
      }
      for (const option of field.options || []) {
        for (const conceptId of [...(option.appliesToConceptIds || []), ...(option.excludeForConceptIds || [])]) {
          if (!conceptIds.has(conceptId)) error(`Profile ${profile.id} field ${field.id} option ${option.id} references unknown concept ${conceptId}.`)
        }
      }
    }
  }

  for (const conceptId of catalog.powerExchangeModel?.extendedConceptIds || []) {
    if (!conceptIds.has(conceptId)) error(`Power Exchange extended concept ${conceptId} does not exist.`)
  }

  return errors
}
