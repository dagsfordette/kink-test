import fs from 'node:fs'
import path from 'node:path'

export const VALID_PERSPECTIVES = new Set([
  'overall', 'give', 'receive', 'mutual', 'self', 'observe', 'be_observed', 'shared',
  'as_dominant', 'as_submissive', 'as_switch', 'as_owner', 'as_owned',
  'feel_self', 'evoke_partner',
])

export const VALID_MODES = new Set(['quick', 'standard', 'exhaustive'])
export const CURRENT_MODE_IDS = ['quick', 'standard', 'exhaustive']
export const REQUIRED_RISK_DOMAINS = ['physical', 'medical', 'psychological', 'consent_complexity', 'privacy', 'digital_security', 'reputational', 'financial']
export const VALID_RELATION_TYPES = new Set(['child_of', 'refines', 'related_to', 'variant_of'])

const BOILERPLATE_PATTERNS = [
  /^Neutral adult self-assessment item covering\b/i,
]

// Intentionally conservative. This is an editorial heuristic, not a claim that every
// term here always needs a glossary entry in every context.
const SPECIALIST_TERM_PATTERNS = [
  /\bCNC\b/i,
  /\bconsensual non-consent\b/i,
  /\bshibari\b/i,
  /\bkinbaku\b/i,
  /\bmummification\b/i,
  /\bpredicament bondage\b/i,
  /\bdollification\b/i,
  /\bobjectification\b/i,
  /\bedging\b/i,
  /\bchastity\b/i,
  /\bpet play\b/i,
  /\bprimal play\b/i,
  /\bprotocol\b/i,
  /\bservice submission\b/i,
  /\bsuspension\b/i,
  /\belectrostimulation\b/i,
  /\bmedical roleplay\b/i,
  /\bwatersports\b/i,
  /\burethral\b/i,
  /\bsounding\b/i,
]

const ERROR_CLASSES = new Set([
  'DUPLICATE_ID',
  'BROKEN_REFERENCE',
  'MISSING_CATEGORY_ID',
  'INVALID_PERSPECTIVE',
  'INVALID_MODE_OR_TIER',
  'LEGACY_RISK_LEVEL_PRESENT',
  'RISK_DOMAIN_SCHEMA_INVALID',
  'RISK_PROMPT_MAPPING_INVALID',
  'NEGOTIATION_PREFERENCES_SCHEMA_INVALID',
  'CATEGORY_GATE_MISSING',
  'CATEGORY_GATE_RESULT_BEHAVIOR_UNDEFINED',
  'ORPHANED_DETAIL_PROFILE_REFERENCE',
  'DETAIL_PROFILE_SEMANTIC_MISMATCH',
  'DOMAIN_SCHEMA_INVALID',
  'CATEGORY_DOMAIN_MISSING_OR_INVALID',
  'CANONICAL_CONCEPT_INVALID',
  'TAXONOMY_PLACEMENT_MISMATCH',
  'SEMANTIC_TYPE_SCHEMA_INVALID',
  'QUESTION_DIMENSION_SCHEMA_INVALID',
  'QUESTION_MODEL_INVALID',
  'RESPONSE_SCALE_INVALID',
  'ADAPTIVE_DETAIL_SCHEMA_INVALID',
  'DETAIL_PROFILE_FIELD_INVALID',
  'PRIORITY_DETAIL_PROFILE_INVALID',
  'DEPTH_MODE_SCHEMA_INVALID',
  'CATEGORY_DEPTH_INVALID',
  'CATEGORY_GATE_SCHEMA_INVALID',
  'RESULTS_MODEL_INVALID',
  'EDITORIAL_MODEL_INVALID',
  'CONTENT_EXPANSION_INVALID',
])

export function loadCatalog(catalogPath) {
  return JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
}

export function normalizeLabel(label = '') {
  return label
    .normalize('NFKD')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function tokenSet(label) {
  return new Set(normalizeLabel(label).split(' ').filter(Boolean))
}

function levenshtein(a, b) {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  const curr = new Array(b.length + 1)
  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost)
    }
    for (let j = 0; j <= b.length; j += 1) prev[j] = curr[j]
  }
  return prev[b.length]
}

function labelSimilarity(a, b) {
  const na = normalizeLabel(a)
  const nb = normalizeLabel(b)
  if (!na || !nb) return 0
  const maxLen = Math.max(na.length, nb.length)
  const charSimilarity = 1 - levenshtein(na, nb) / maxLen
  const ta = tokenSet(a)
  const tb = tokenSet(b)
  const intersection = [...ta].filter((t) => tb.has(t)).length
  const union = new Set([...ta, ...tb]).size
  const tokenSimilarity = union ? intersection / union : 0
  return Math.max(charSimilarity, tokenSimilarity)
}

export function isBoilerplateDescription(description = '') {
  return BOILERPLATE_PATTERNS.some((pattern) => pattern.test(description.trim()))
}

function isSubstantiveDefinition(concept) {
  const d = concept.description?.trim()
  if (!d || isBoilerplateDescription(d)) return false
  if (/^High-level branch gate\b/i.test(d)) return false
  return true
}

function makeFinding(code, severity, message, affectedIds = [], details = {}) {
  return { code, severity, message, affectedIds: [...affectedIds].sort(), details }
}

function duplicateValues(items, getValue) {
  const map = new Map()
  for (const item of items) {
    const value = getValue(item)
    if (value === undefined || value === null || value === '') continue
    const list = map.get(value) || []
    list.push(item)
    map.set(value, list)
  }
  return [...map.entries()].filter(([, values]) => values.length > 1)
}

function conceptResultPerspectives(concept) {
  return (concept.perspectives || []).filter((p) => p !== 'overall')
}

function primaryCategory(concept) {
  return concept.primaryCategory || concept.categoryIds?.[0] || null
}

function relatedCategories(concept) {
  return Array.isArray(concept.relatedCategories) ? concept.relatedCategories : (concept.categoryIds || []).slice(1)
}

function discoverableCategories(concept) {
  return [...new Set([primaryCategory(concept), ...relatedCategories(concept)].filter(Boolean))]
}

function directConceptsForCategory(catalog, categoryId) {
  const semanticTypes = catalog.semanticTypes || {}
  return catalog.concepts.filter((concept) => {
    if (concept.tags?.includes('branch_gate')) return false
    if (!discoverableCategories(concept).includes(categoryId)) return false
    const semantic = semanticTypes[concept.semanticType || 'activity'] || semanticTypes.activity || {}
    return semantic.directQuestioning !== false
  }).sort((a, b) => {
    const aRelated = primaryCategory(a) === categoryId ? 0 : 1
    const bRelated = primaryCategory(b) === categoryId ? 0 : 1
    if (aRelated !== bRelated) return aRelated - bRelated
    return catalog.concepts.indexOf(a) - catalog.concepts.indexOf(b)
  })
}

function auditModes(catalog) {
  const modeIds = catalog.depthModes?.order || CURRENT_MODE_IDS
  const perCategory = catalog.categories.map((category) => {
    const concepts = directConceptsForCategory(catalog, category.id)
    const counts = Object.fromEntries(modeIds.map((mode) => [mode, category.depthConceptIds?.[mode]?.length || 0]))
    return {
      categoryId: category.id,
      categoryLabel: category.label,
      available: concepts.length,
      counts,
      conceptIds: Object.fromEntries(modeIds.map((mode) => [mode, category.depthConceptIds?.[mode] || []])),
    }
  })
  const totals = Object.fromEntries(modeIds.map((mode) => [
    mode,
    perCategory.reduce((sum, row) => sum + (row.counts[mode] || 0), 0),
  ]))
  return {
    version: catalog.depthModes?.version || null,
    order: modeIds,
    definitions: catalog.depthModes?.modes || {},
    totals,
    perCategory,
  }
}

function auditScoring(catalog) {
  const rows = []
  for (const category of catalog.categories) {
    const concepts = catalog.concepts.filter((concept) => primaryCategory(concept) === category.id)
      .filter((concept) => !concept.tags?.includes('branch_gate'))
      .map((concept) => ({ id: concept.id, label: concept.label, perspectives: conceptResultPerspectives(concept) }))
      .filter((concept) => concept.perspectives.length > 0)
    const perspectiveRecordCount = concepts.reduce((sum, concept) => sum + concept.perspectives.length, 0)
    const conceptCount = concepts.length
    const equalConceptWeight = conceptCount ? 1 / conceptCount : 0
    const conceptWeights = concepts.map((concept) => ({
      conceptId: concept.id,
      label: concept.label,
      perspectiveCount: concept.perspectives.length,
      perspectives: concept.perspectives,
      effectiveWeight: equalConceptWeight,
      effectiveWeightPercent: Number((equalConceptWeight * 100).toFixed(4)),
      equalConceptWeightPercent: Number((equalConceptWeight * 100).toFixed(4)),
      weightVsSinglePerspective: 1,
      overweightVsEqualConcept: conceptCount ? 1 : null,
      disproportionateBecauseMultiplePerspectives: false,
      perspectiveCombination: 'mean_within_concept_per_dimension',
    }))
    rows.push({
      categoryId: category.id,
      categoryLabel: category.label,
      contributingConceptCount: conceptCount,
      perspectiveRecordCount,
      aggregationOrder: ['perspective', 'concept', 'category'],
      categoryWeighting: 'equal_concept',
      conceptWeights,
      disproportionateConcepts: [],
    })
  }
  return rows
}

function auditBranches(catalog) {
  return catalog.concepts.flatMap((concept) => (concept.relations || [])
    .filter((relation) => relation.type === 'child_of')
    .map((relation) => ({ parentId: relation.target, childId: concept.id })))
    .sort((a, b) => a.parentId.localeCompare(b.parentId) || a.childId.localeCompare(b.childId))
}

function auditRelations(catalog) {
  return catalog.concepts.flatMap((concept) => (concept.relations || []).map((relation) => ({
    sourceId: concept.id,
    type: relation.type,
    targetId: relation.target,
  }))).sort((a, b) => a.type.localeCompare(b.type) || a.sourceId.localeCompare(b.sourceId) || a.targetId.localeCompare(b.targetId))
}

function categoryGates(catalog) {
  const legacyGateConcepts = catalog.concepts.filter((concept) => concept.tags?.includes('branch_gate'))
  const model = catalog.categoryGateModel || {}
  return catalog.categories.map((category) => {
    const legacyGate = legacyGateConcepts.find((concept) => concept.id === category.id)
    return {
      categoryId: category.id,
      categoryLabel: category.label,
      gatePrompt: category.gatePrompt || null,
      storage: model.storage || null,
      scoreContribution: model.scoreContribution || null,
      states: model.states || [],
      manualOverride: model.manualOverride === true,
      legacyGateConceptId: legacyGate?.id || null,
      legacyGateConceptRetainedForCompatibility: Boolean(legacyGate),
    }
  })
}

export function validateCatalog(catalog, options = {}) {
  const findings = []
  const includeEditorial = options.editorial !== false
  const concepts = Array.isArray(catalog.concepts) ? catalog.concepts : []
  const domains = Array.isArray(catalog.domains) ? catalog.domains : []
  const categories = Array.isArray(catalog.categories) ? catalog.categories : []
  const detailProfiles = Array.isArray(catalog.detailProfiles) ? catalog.detailProfiles : []
  const bodyProfiles = Array.isArray(catalog.bodyPreferenceProfiles) ? catalog.bodyPreferenceProfiles : []
  const optionSets = Array.isArray(catalog.optionSets) ? catalog.optionSets : []
  const specifierDefinitions = Array.isArray(catalog.specifierDefinitions) ? catalog.specifierDefinitions : []

  const collections = [
    ['concept', concepts], ['domain', domains], ['category', categories], ['detail profile', detailProfiles],
    ['body preference profile', bodyProfiles], ['option set', optionSets], ['specifier definition', specifierDefinitions],
  ]
  for (const [kind, items] of collections) {
    for (const [id, duplicates] of duplicateValues(items, (item) => item.id)) {
      findings.push(makeFinding('DUPLICATE_ID', 'error', `Duplicate ${kind} id: ${id}`, duplicates.map((item) => item.id), { kind, id, count: duplicates.length }))
    }
  }

  const domainIds = new Set(domains.map((d) => d.id))
  const categoryIds = new Set(categories.map((c) => c.id))
  const categoryMap = new Map(categories.map((c) => [c.id, c]))
  const conceptIds = new Set(concepts.map((c) => c.id))
  const detailProfileIds = new Set(detailProfiles.map((p) => p.id))
  const detailProfileMap = new Map(detailProfiles.map((p) => [p.id, p]))
  const bodyProfileIds = new Set(bodyProfiles.map((p) => p.id))
  const optionSetIds = new Set(optionSets.map((o) => o.id))
  const specifierIds = new Set(specifierDefinitions.map((s) => s.id))
  const semanticTypeIds = new Set(Object.keys(catalog.semanticTypes || {}))
  const questionDimensionIds = new Set(Object.keys(catalog.questionDimensions || {}))
  const requiredSemanticTypes = [
    'activity', 'role', 'dynamic', 'fantasy', 'stimulus', 'body_part', 'material',
    'emotion', 'setting', 'relationship_dynamic', 'device', 'communication_preference', 'risk_context',
  ]
  const requiredQuestionDimensions = ['fantasyAppeal', 'realWorldDesire', 'experience', 'experiencedPreference', 'willingness', 'boundary']
  const detailDimensionIds = new Set(Object.keys(catalog.detailDimensions || {}))
  const adaptiveSystem = catalog.adaptiveDetailSystem || {}
  const detailResponseStateIds = new Set((adaptiveSystem.detailResponseStates || []).map((state) => state.id))
  const requiredDetailResponseStates = ['appealing', 'acceptable', 'conditional', 'not_interested', 'hard_limit']
  const requiredBranchStates = ['strongly_interested', 'interested', 'open', 'unsure', 'fantasy_only', 'not_interested', 'hard_limit']
  const supportedDetailFieldTypes = new Set(adaptiveSystem.profileSchema?.fieldTypes || [])
  const supportedFieldRelevance = new Set(adaptiveSystem.profileSchema?.fieldRelevance || [])
  const editorialModel = catalog.editorialModel || {}
  const contentExpansion = catalog.contentExpansion || {}
  if (editorialModel.version !== '1.0.0' || !editorialModel.styleGuide || !editorialModel.boilerplatePatternRetired) {
    findings.push(makeFinding('EDITORIAL_MODEL_INVALID', 'error', 'Plan 08 requires editorialModel v1.0.0 with a style-guide reference and retired boilerplate pattern.', ['editorialModel']))
  }
  if (contentExpansion.version !== '1.0.0' || !Array.isArray(contentExpansion.addedConceptIds) || contentExpansion.addedConceptIds.length === 0) {
    findings.push(makeFinding('CONTENT_EXPANSION_INVALID', 'error', 'Plan 08 requires a non-empty machine-readable contentExpansion record.', ['contentExpansion']))
  } else {
    for (const conceptId of contentExpansion.addedConceptIds) {
      if (!conceptIds.has(conceptId)) findings.push(makeFinding('CONTENT_EXPANSION_INVALID', 'error', `Plan 08 expansion references missing concept ${conceptId}.`, [conceptId]))
    }
  }
  for (const concept of concepts) {
    if (concept.tags?.includes('branch_gate')) continue
    if (!concept.description?.trim() || isBoilerplateDescription(concept.description)) findings.push(makeFinding('EDITORIAL_MODEL_INVALID', 'error', `User-facing concept ${concept.id} must have a substantive non-boilerplate description after Plan 08.`, [concept.id]))
  }
  for (const conceptId of ['adult_age_play_roleplay', 'caregiver_little_adult_dynamic', 'negotiated_sleep_vulnerability_fantasy']) {
    const concept = concepts.find((row) => row.id === conceptId)
    if (concept && !/adult/i.test(`${concept.label} ${concept.description}`)) findings.push(makeFinding('EDITORIAL_MODEL_INVALID', 'error', `Adult-only wording is required for ${conceptId}.`, [conceptId]))
  }

  if (adaptiveSystem.version !== '1.0.0') findings.push(makeFinding('ADAPTIVE_DETAIL_SCHEMA_INVALID', 'error', 'Plan 04 requires adaptiveDetailSystem version 1.0.0.', ['adaptiveDetailSystem']))
  for (const stateId of requiredDetailResponseStates) {
    if (!detailResponseStateIds.has(stateId)) findings.push(makeFinding('ADAPTIVE_DETAIL_SCHEMA_INVALID', 'error', `Adaptive detail response scale is missing ${stateId}.`, [stateId]))
  }
  for (const stateId of requiredBranchStates) {
    const rule = adaptiveSystem.branchRules?.[stateId]
    if (!rule || typeof rule.defaultOpen !== 'boolean' || !Array.isArray(rule.relevance)) findings.push(makeFinding('ADAPTIVE_DETAIL_SCHEMA_INVALID', 'error', `Adaptive branch state ${stateId} must define defaultOpen and relevance.`, [stateId]))
  }
  if (adaptiveSystem.branchRules?.not_interested?.defaultOpen !== false || adaptiveSystem.branchRules?.hard_limit?.defaultOpen !== false) findings.push(makeFinding('ADAPTIVE_DETAIL_SCHEMA_INVALID', 'error', 'Not-interested and hard-limit detail branches must collapse by default.', ['not_interested', 'hard_limit']))
  if (adaptiveSystem.branchRules?.unsure?.defaultOpen !== true || adaptiveSystem.branchRules?.fantasy_only?.defaultOpen !== true) findings.push(makeFinding('ADAPTIVE_DETAIL_SCHEMA_INVALID', 'error', 'Unsure and fantasy-only detail branches must remain available by default.', ['unsure', 'fantasy_only']))
  if ((adaptiveSystem.branchRules?.fantasy_only?.relevance || []).includes('real_world')) findings.push(makeFinding('ADAPTIVE_DETAIL_SCHEMA_INVALID', 'error', 'Fantasy-only branches must suppress real-world-only implementation fields.', ['fantasy_only']))
  if (!adaptiveSystem.manualOverrideLabel) findings.push(makeFinding('ADAPTIVE_DETAIL_SCHEMA_INVALID', 'error', 'Adaptive detail system must declare a manual override label.', ['adaptiveDetailSystem']))

  for (const semanticType of requiredSemanticTypes) {
    if (!semanticTypeIds.has(semanticType)) findings.push(makeFinding('SEMANTIC_TYPE_SCHEMA_INVALID', 'error', `Plan 03 semantic type ${semanticType} is missing.`, [semanticType]))
  }
  for (const dimensionId of requiredQuestionDimensions) {
    if (!questionDimensionIds.has(dimensionId)) findings.push(makeFinding('QUESTION_DIMENSION_SCHEMA_INVALID', 'error', `Plan 03 question dimension ${dimensionId} is missing.`, [dimensionId]))
  }
  for (const [semanticType, definition] of Object.entries(catalog.semanticTypes || {})) {
    if (!definition || typeof definition !== 'object') {
      findings.push(makeFinding('SEMANTIC_TYPE_SCHEMA_INVALID', 'error', `Semantic type ${semanticType} must be an object.`, [semanticType]))
      continue
    }
    const dimensions = definition.questionDimensions
    if (!dimensions || typeof dimensions !== 'object' || Array.isArray(dimensions)) {
      findings.push(makeFinding('QUESTION_DIMENSION_SCHEMA_INVALID', 'error', `Semantic type ${semanticType} must declare questionDimensions.`, [semanticType]))
      continue
    }
    for (const [dimensionId, enabled] of Object.entries(dimensions)) {
      if (!questionDimensionIds.has(dimensionId) || typeof enabled !== 'boolean') {
        findings.push(makeFinding('QUESTION_DIMENSION_SCHEMA_INVALID', 'error', `Semantic type ${semanticType} has an invalid question-dimension entry ${dimensionId}.`, [semanticType, dimensionId], { enabled }))
      }
    }
  }
  const willingnessIds = new Set((catalog.scales?.willingness?.values || []).map((value) => value.id))
  for (const required of ['actively_want', 'interested_in_trying', 'open_to_it', 'unsure', 'fantasy_only', 'not_interested', 'hard_limit']) {
    if (!willingnessIds.has(required)) findings.push(makeFinding('RESPONSE_SCALE_INVALID', 'error', `Willingness scale is missing ${required}.`, [required]))
  }
  const boundaryNone = (catalog.scales?.boundary?.values || []).find((value) => value.id === 'none')
  if (!boundaryNone || /^(no limit)$/i.test(boundaryNone.label || '')) findings.push(makeFinding('RESPONSE_SCALE_INVALID', 'error', 'Boundary value "none" must use clarified non-absolute wording such as "No special boundary".', ['none']))

  if (domains.length !== 8) {
    findings.push(makeFinding('DOMAIN_SCHEMA_INVALID', 'error', `Plan 02 requires exactly eight navigation domains; found ${domains.length}.`, domains.map((domain) => domain.id), { count: domains.length }))
  }
  for (const domain of domains) {
    if (!domain.id || !domain.label) findings.push(makeFinding('DOMAIN_SCHEMA_INVALID', 'error', 'Every navigation domain requires an id and label.', [domain.id].filter(Boolean)))
  }
  for (const category of categories) {
    if (typeof category.domainId !== 'string' || !domainIds.has(category.domainId)) {
      findings.push(makeFinding('CATEGORY_DOMAIN_MISSING_OR_INVALID', 'error', `Category ${category.id} must belong to exactly one defined navigation domain.`, [category.id, category.domainId].filter(Boolean), { domainId: category.domainId || null }))
    }
  }

  const depthModes = catalog.depthModes || {}
  if (depthModes.version !== '1.0.0' || JSON.stringify(depthModes.order) !== JSON.stringify(CURRENT_MODE_IDS)) {
    findings.push(makeFinding('DEPTH_MODE_SCHEMA_INVALID', 'error', 'Plan 05 requires depthModes v1.0.0 with Quick, Standard, and Exhaustive in that order.', ['depthModes']))
  }
  for (const modeId of CURRENT_MODE_IDS) {
    const definition = depthModes.modes?.[modeId]
    if (!definition?.label || !definition?.purpose || !definition?.catalogPolicy) {
      findings.push(makeFinding('DEPTH_MODE_SCHEMA_INVALID', 'error', `Depth mode ${modeId} must declare label, purpose, and catalogPolicy.`, [modeId]))
    }
  }

  for (const category of categories) {
    const directIds = directConceptsForCategory(catalog, category.id).map((concept) => concept.id)
    const directSet = new Set(directIds)
    const modeIds = {}
    for (const modeId of CURRENT_MODE_IDS) {
      const ids = category.depthConceptIds?.[modeId]
      if (!Array.isArray(ids)) {
        findings.push(makeFinding('CATEGORY_DEPTH_INVALID', 'error', `Category ${category.id} must declare an explicit ${modeId} concept list.`, [category.id, modeId]))
        modeIds[modeId] = []
        continue
      }
      modeIds[modeId] = ids
      if (new Set(ids).size !== ids.length) findings.push(makeFinding('CATEGORY_DEPTH_INVALID', 'error', `Category ${category.id} ${modeId} list contains duplicate concept IDs.`, [category.id, modeId]))
      for (const conceptId of ids) if (!directSet.has(conceptId)) findings.push(makeFinding('CATEGORY_DEPTH_INVALID', 'error', `Category ${category.id} ${modeId} references concept ${conceptId}, which is not directly discoverable in that category.`, [category.id, conceptId, modeId]))
    }
    const quickSet = new Set(modeIds.quick || [])
    const standardSet = new Set(modeIds.standard || [])
    const exhaustiveSet = new Set(modeIds.exhaustive || [])
    for (const conceptId of quickSet) if (!standardSet.has(conceptId)) findings.push(makeFinding('CATEGORY_DEPTH_INVALID', 'error', `Category ${category.id} Quick concept ${conceptId} is missing from Standard.`, [category.id, conceptId]))
    for (const conceptId of standardSet) if (!exhaustiveSet.has(conceptId)) findings.push(makeFinding('CATEGORY_DEPTH_INVALID', 'error', `Category ${category.id} Standard concept ${conceptId} is missing from Exhaustive.`, [category.id, conceptId]))
    if (directIds.length && quickSet.size === 0) findings.push(makeFinding('CATEGORY_DEPTH_INVALID', 'error', `Category ${category.id} has directly question-able concepts but no Quick representatives.`, [category.id]))
    if (exhaustiveSet.size !== directSet.size || [...directSet].some((id) => !exhaustiveSet.has(id))) findings.push(makeFinding('CATEGORY_DEPTH_INVALID', 'error', `Category ${category.id} Exhaustive mode must contain every directly discoverable concept exactly once.`, [category.id], { expected: directIds.length, actual: exhaustiveSet.size }))
  }

  const gateModel = catalog.categoryGateModel || {}
  const requiredGateStates = ['interested', 'maybe', 'not_interested', 'hard_limit', 'skip']
  const gateStates = new Map((gateModel.states || []).map((state) => [state.id, state]))
  if (gateModel.version !== '1.0.0' || gateModel.storage !== 'categoryGates' || gateModel.scoreContribution !== 'none' || gateModel.manualOverride !== true) {
    findings.push(makeFinding('CATEGORY_GATE_SCHEMA_INVALID', 'error', 'Plan 05 category gates must use categoryGates storage, contribute no score, and allow manual expansion.', ['categoryGateModel']))
  }
  if (JSON.stringify((gateModel.states || []).map((state) => state.id)) !== JSON.stringify(requiredGateStates)) {
    findings.push(makeFinding('CATEGORY_GATE_SCHEMA_INVALID', 'error', 'Category gate states must be Interested, Maybe, Not interested, Hard limit, and Skip in the Plan 05 order.', ['categoryGateModel']))
  }
  if (gateStates.get('skip')?.answered !== false || gateStates.get('not_interested')?.answered !== true) {
    findings.push(makeFinding('CATEGORY_GATE_SCHEMA_INVALID', 'error', 'Skip must remain unanswered while Not interested is a distinct answered routing state.', ['skip', 'not_interested']))
  }
  const hardBoundary = gateStates.get('hard_limit')?.boundary
  if (hardBoundary?.level !== 'hard_limit' || hardBoundary?.scope !== 'category') {
    findings.push(makeFinding('CATEGORY_GATE_SCHEMA_INVALID', 'error', 'The hard-limit gate state must create a category-scoped hard-limit boundary.', ['hard_limit']))
  }
  for (const category of categories) if (!category.gatePrompt?.trim()) findings.push(makeFinding('CATEGORY_GATE_MISSING', 'error', `Category ${category.id} must declare a routing gate prompt.`, [category.id]))

  const resultsModel = catalog.resultsModel || {}
  const expectedAggregationOrder = ['perspective', 'concept', 'category', 'domain']
  const requiredResultDimensions = ['fantasy_interest', 'real_world_interest', 'experienced_preference', 'experience', 'willingness', 'perspective', 'conditions', 'boundaries']
  if (resultsModel.version !== '2.0.0' || resultsModel.defaultCategoryWeighting !== 'equal_concept' || resultsModel.hardLimitsInPreferenceAverages !== false || resultsModel.categoryGateContribution !== 'none') {
    findings.push(makeFinding('RESULTS_MODEL_INVALID', 'error', 'Plan 06 requires resultsModel v2.0.0, equal-concept category weighting, separate hard limits, and no category-gate score contribution.', ['resultsModel']))
  }
  if (JSON.stringify(resultsModel.aggregationOrder || []) !== JSON.stringify(expectedAggregationOrder)) {
    findings.push(makeFinding('RESULTS_MODEL_INVALID', 'error', 'Plan 06 aggregation order must be perspective → concept → category → domain.', ['resultsModel', 'aggregationOrder']))
  }
  for (const dimension of requiredResultDimensions) if (!(resultsModel.dimensions || []).includes(dimension)) {
    findings.push(makeFinding('RESULTS_MODEL_INVALID', 'error', `Plan 06 results model is missing dimension ${dimension}.`, ['resultsModel', dimension]))
  }
  if (resultsModel.internalIndex?.shownAsPrimaryResult !== false) {
    findings.push(makeFinding('RESULTS_MODEL_INVALID', 'error', 'The compatibility interest index must not be shown as the primary Plan 06 result.', ['resultsModel', 'internalIndex']))
  }

  const riskDomains = catalog.riskDomains || {}
  const riskPrompts = catalog.riskPrompts || {}
  const riskPromptMap = catalog.riskPromptMap || {}
  const riskDomainIds = new Set(Object.keys(riskDomains))
  if (JSON.stringify([...riskDomainIds].sort()) !== JSON.stringify([...REQUIRED_RISK_DOMAINS].sort())) {
    findings.push(makeFinding('RISK_DOMAIN_SCHEMA_INVALID', 'error', 'Plan 07 requires the eight descriptive risk domains: physical, medical, psychological, consent_complexity, privacy, digital_security, reputational, and financial.', ['riskDomains']))
  }
  for (const domainId of REQUIRED_RISK_DOMAINS) {
    const definition = riskDomains[domainId]
    if (!definition?.label || !definition?.description) findings.push(makeFinding('RISK_DOMAIN_SCHEMA_INVALID', 'error', `Risk domain ${domainId} must declare a neutral label and description.`, [domainId]))
    const promptIds = riskPromptMap[domainId]
    if (!Array.isArray(promptIds) || promptIds.length === 0) findings.push(makeFinding('RISK_PROMPT_MAPPING_INVALID', 'error', `Risk domain ${domainId} must map to at least one high-level prompt.`, [domainId]))
    for (const promptId of promptIds || []) {
      const prompt = riskPrompts[promptId]
      if (!prompt?.text || prompt.instructionLevel !== 'high_level_non_procedural' || !(prompt.domains || []).includes(domainId)) {
        findings.push(makeFinding('RISK_PROMPT_MAPPING_INVALID', 'error', `Risk prompt ${promptId} must be high-level/non-procedural and explicitly include mapped domain ${domainId}.`, [domainId, promptId]))
      }
    }
  }
  if (catalog.riskMigration?.sourceField !== 'riskLevel' || catalog.riskMigration?.removedFromConcepts !== true) {
    findings.push(makeFinding('RISK_DOMAIN_SCHEMA_INVALID', 'error', 'Plan 07 must document migration away from the legacy riskLevel field.', ['riskMigration']))
  }

  const negotiationModel = catalog.negotiationPreferencesModel || {}
  const requiredNegotiationSections = ['communication', 'stop_checkin', 'aftercare', 'marks', 'privacy', 'partner_context']
  const negotiationSections = new Map((negotiationModel.sections || []).map((section) => [section.id, section]))
  if (negotiationModel.version !== '1.0.0' || negotiationModel.storage !== 'negotiationPreferences' || negotiationModel.scoreContribution !== 'none' || negotiationModel.resultTreatment !== 'separate_descriptive_profile') {
    findings.push(makeFinding('NEGOTIATION_PREFERENCES_SCHEMA_INVALID', 'error', 'Plan 07 negotiation preferences must use negotiationPreferences storage, contribute no score, and remain a separate descriptive results profile.', ['negotiationPreferencesModel']))
  }
  for (const sectionId of requiredNegotiationSections) {
    const section = negotiationSections.get(sectionId)
    if (!section?.label || !Array.isArray(section.fields) || section.fields.length === 0) findings.push(makeFinding('NEGOTIATION_PREFERENCES_SCHEMA_INVALID', 'error', `Negotiation preferences section ${sectionId} is missing or has no fields.`, [sectionId]))
    for (const field of section?.fields || []) {
      if (!field.id || !field.label || !['single_select', 'multi_select', 'text'].includes(field.type)) findings.push(makeFinding('NEGOTIATION_PREFERENCES_SCHEMA_INVALID', 'error', `Negotiation field ${sectionId}.${field.id || '(missing)'} has an invalid schema.`, [sectionId, field.id].filter(Boolean)))
      if (['single_select', 'multi_select'].includes(field.type) && (!Array.isArray(field.options) || field.options.length === 0)) findings.push(makeFinding('NEGOTIATION_PREFERENCES_SCHEMA_INVALID', 'error', `Negotiation field ${sectionId}.${field.id} must declare selectable options.`, [sectionId, field.id]))
    }
  }
  if (!(resultsModel.dimensions || []).includes('negotiation_care') || resultsModel.negotiationProfileTreatment !== 'separate_descriptive_profile') {
    findings.push(makeFinding('RESULTS_MODEL_INVALID', 'error', 'Plan 07 requires negotiation/care to appear as a separate descriptive results dimension.', ['resultsModel', 'negotiation_care']))
  }

  const quickRequirements = {
    power_exchange: ['dominance', 'submission'],
    bondage_restraint: ['wrist_restraint', 'cuffs'],
    impact_play: ['hand_spanking', 'paddling', 'flogging', 'thudding_impact', 'stingy_impact'],
    anal_play: ['anal_touch', 'anal_fingering', 'anal_toys', 'anal_plugs'],
    toys_devices: ['vibrators', 'dildos', 'butt_plugs'],
  }
  for (const [categoryId, requiredIds] of Object.entries(quickRequirements)) {
    const category = categoryMap.get(categoryId)
    const quickIds = new Set(category?.depthConceptIds?.quick || [])
    for (const conceptId of requiredIds) if (!quickIds.has(conceptId)) findings.push(makeFinding('CATEGORY_DEPTH_INVALID', 'error', `Quick mode for ${categoryId} is missing representative concept ${conceptId}.`, [categoryId, conceptId]))
  }
  for (const [categoryId, excludedIds] of Object.entries({ anal_play: ['enema_fetish'], toys_devices: ['urethral_sounding', 'catheter_fetish'], medical_edge: ['needle_play', 'blood_play', 'electrical_play', 'fire_play', 'breath_restriction', 'cutting_fantasy'] })) {
    const quickIds = new Set(categoryMap.get(categoryId)?.depthConceptIds?.quick || [])
    for (const conceptId of excludedIds) if (quickIds.has(conceptId)) findings.push(makeFinding('CATEGORY_DEPTH_INVALID', 'error', `Quick mode for ${categoryId} should not be defined by specialist edge concept ${conceptId}.`, [categoryId, conceptId]))
  }

  for (const concept of concepts) {
    if (typeof concept.canonicalId !== 'string' || !conceptIds.has(concept.canonicalId)) {
      findings.push(makeFinding('CANONICAL_CONCEPT_INVALID', 'error', `Concept ${concept.id} must declare a canonicalId that references a known concept.`, [concept.id, concept.canonicalId].filter(Boolean), { canonicalId: concept.canonicalId || null }))
    }
    if (typeof concept.primaryCategory !== 'string' || !categoryIds.has(concept.primaryCategory)) {
      findings.push(makeFinding('TAXONOMY_PLACEMENT_MISMATCH', 'error', `Concept ${concept.id} must declare a valid primaryCategory.`, [concept.id, concept.primaryCategory].filter(Boolean), { primaryCategory: concept.primaryCategory || null }))
    }
    if (!Array.isArray(concept.relatedCategories)) {
      findings.push(makeFinding('TAXONOMY_PLACEMENT_MISMATCH', 'error', `Concept ${concept.id} must declare relatedCategories as an array.`, [concept.id]))
    } else {
      const uniqueRelated = new Set(concept.relatedCategories)
      if (uniqueRelated.size !== concept.relatedCategories.length || concept.relatedCategories.includes(concept.primaryCategory)) {
        findings.push(makeFinding('TAXONOMY_PLACEMENT_MISMATCH', 'error', `Concept ${concept.id} has duplicate or primary-category entries in relatedCategories.`, [concept.id], { relatedCategories: concept.relatedCategories }))
      }
      for (const categoryId of concept.relatedCategories) {
        if (!categoryIds.has(categoryId)) findings.push(makeFinding('BROKEN_REFERENCE', 'error', `Concept ${concept.id} references unknown related category ${categoryId}.`, [concept.id, categoryId], { referenceType: 'relatedCategory' }))
      }
    }
    const primaryDomain = categoryMap.get(concept.primaryCategory)?.domainId
    if (typeof concept.domain !== 'string' || !domainIds.has(concept.domain) || (primaryDomain && concept.domain !== primaryDomain)) {
      findings.push(makeFinding('TAXONOMY_PLACEMENT_MISMATCH', 'error', `Concept ${concept.id} domain must match the domain of its primary category.`, [concept.id, concept.domain, primaryDomain].filter(Boolean), { conceptDomain: concept.domain || null, primaryDomain: primaryDomain || null }))
    }
    if (!Array.isArray(concept.semanticTags) || concept.semanticTags.length === 0) {
      findings.push(makeFinding('TAXONOMY_PLACEMENT_MISMATCH', 'error', `Concept ${concept.id} must declare semanticTags.`, [concept.id]))
    }
    const expectedPlacements = [concept.primaryCategory, ...(Array.isArray(concept.relatedCategories) ? concept.relatedCategories : [])].filter(Boolean)
    if (JSON.stringify(concept.categoryIds || []) !== JSON.stringify(expectedPlacements)) {
      findings.push(makeFinding('TAXONOMY_PLACEMENT_MISMATCH', 'error', `Concept ${concept.id} categoryIds compatibility mirror does not match primaryCategory + relatedCategories.`, [concept.id], { categoryIds: concept.categoryIds || [], expectedPlacements }))
    }

    if (!Array.isArray(concept.categoryIds) || concept.categoryIds.length === 0) {
      findings.push(makeFinding('MISSING_CATEGORY_ID', 'error', `Concept ${concept.id} has no categoryIds.`, [concept.id]))
    } else {
      for (const categoryId of concept.categoryIds) {
        if (!categoryIds.has(categoryId)) findings.push(makeFinding('BROKEN_REFERENCE', 'error', `Concept ${concept.id} references unknown category ${categoryId}.`, [concept.id, categoryId], { referenceType: 'category' }))
      }
    }

    for (const perspective of concept.perspectives || []) {
      if (!VALID_PERSPECTIVES.has(perspective)) findings.push(makeFinding('INVALID_PERSPECTIVE', 'error', `Concept ${concept.id} uses unsupported perspective ${perspective}.`, [concept.id], { perspective }))
    }

    for (const key of ['mode', 'tier']) {
      const values = concept[key] === undefined ? [] : Array.isArray(concept[key]) ? concept[key] : [concept[key]]
      for (const value of values) {
        if (!VALID_MODES.has(value)) findings.push(makeFinding('INVALID_MODE_OR_TIER', 'error', `Concept ${concept.id} has invalid ${key} value ${value}.`, [concept.id], { field: key, value }))
      }
    }

    if (!concept.semanticType || !semanticTypeIds.has(concept.semanticType)) {
      findings.push(makeFinding('BROKEN_REFERENCE', 'error', `Concept ${concept.id} references unknown or missing semantic type ${concept.semanticType || '(missing)'}.`, [concept.id], { referenceType: 'semanticType' }))
    }
    if (!concept.questionModel || concept.questionModel.template !== concept.semanticType) {
      findings.push(makeFinding('QUESTION_MODEL_INVALID', 'error', `Concept ${concept.id} must use its semanticType as the questionModel template.`, [concept.id], { semanticType: concept.semanticType || null, questionModel: concept.questionModel || null }))
    }
    if (!concept.semanticTags?.includes(`semantic:${concept.semanticType}`)) {
      findings.push(makeFinding('QUESTION_MODEL_INVALID', 'error', `Concept ${concept.id} semanticTags must include semantic:${concept.semanticType}.`, [concept.id]))
    }
    for (const [dimensionId, enabled] of Object.entries(concept.questionModel?.overrides || {})) {
      if (!questionDimensionIds.has(dimensionId) || typeof enabled !== 'boolean') findings.push(makeFinding('QUESTION_MODEL_INVALID', 'error', `Concept ${concept.id} has an invalid questionModel override ${dimensionId}.`, [concept.id, dimensionId], { enabled }))
    }

    if ('riskLevel' in concept) findings.push(makeFinding('LEGACY_RISK_LEVEL_PRESENT', 'error', `Concept ${concept.id} still contains the legacy one-dimensional riskLevel field.`, [concept.id]))
    if (!Array.isArray(concept.riskDomains)) findings.push(makeFinding('RISK_DOMAIN_SCHEMA_INVALID', 'error', `Concept ${concept.id} must declare riskDomains as an array, even when empty.`, [concept.id]))
    else {
      if (new Set(concept.riskDomains).size !== concept.riskDomains.length) findings.push(makeFinding('RISK_DOMAIN_SCHEMA_INVALID', 'error', `Concept ${concept.id} has duplicate riskDomains.`, [concept.id]))
      for (const domainId of concept.riskDomains) if (!riskDomainIds.has(domainId)) findings.push(makeFinding('RISK_DOMAIN_SCHEMA_INVALID', 'error', `Concept ${concept.id} references unknown risk domain ${domainId}.`, [concept.id, domainId]))
    }

    if (concept.detailProfileId) {
      const profile = detailProfileMap.get(concept.detailProfileId)
      if (!profile) {
        findings.push(makeFinding('ORPHANED_DETAIL_PROFILE_REFERENCE', 'error', `Concept ${concept.id} references missing detail profile ${concept.detailProfileId}.`, [concept.id, concept.detailProfileId], { referenceType: 'detailProfile' }))
      } else if (profile.appliesToSemanticTypes?.length && !profile.appliesToSemanticTypes.includes(concept.semanticType)) {
        findings.push(makeFinding('DETAIL_PROFILE_SEMANTIC_MISMATCH', 'error', `Concept ${concept.id} uses detail profile ${profile.id}, which does not allow semantic type ${concept.semanticType}.`, [concept.id, profile.id], { semanticType: concept.semanticType, appliesToSemanticTypes: profile.appliesToSemanticTypes }))
      }
    }
    for (const [perspective, profileId] of Object.entries(concept.detailProfileByPerspective || {})) {
      if (!VALID_PERSPECTIVES.has(perspective)) findings.push(makeFinding('INVALID_PERSPECTIVE', 'error', `Concept ${concept.id} maps a detail profile for unsupported perspective ${perspective}.`, [concept.id], { perspective }))
      const profile = detailProfileMap.get(profileId)
      if (!profile) {
        findings.push(makeFinding('ORPHANED_DETAIL_PROFILE_REFERENCE', 'error', `Concept ${concept.id} references missing perspective detail profile ${profileId}.`, [concept.id, profileId], { referenceType: 'detailProfileByPerspective', perspective }))
      } else if (profile.appliesToSemanticTypes?.length && !profile.appliesToSemanticTypes.includes(concept.semanticType)) {
        findings.push(makeFinding('DETAIL_PROFILE_SEMANTIC_MISMATCH', 'error', `Concept ${concept.id} uses perspective detail profile ${profile.id}, which does not allow semantic type ${concept.semanticType}.`, [concept.id, profile.id], { perspective, semanticType: concept.semanticType, appliesToSemanticTypes: profile.appliesToSemanticTypes }))
      }
    }
    if (concept.bodyPreferenceProfileId && !bodyProfileIds.has(concept.bodyPreferenceProfileId)) {
      findings.push(makeFinding('BROKEN_REFERENCE', 'error', `Concept ${concept.id} references missing body preference profile ${concept.bodyPreferenceProfileId}.`, [concept.id, concept.bodyPreferenceProfileId], { referenceType: 'bodyPreferenceProfile' }))
    }

    for (const binding of concept.specifierBindings || []) {
      if (binding.specifierId && !specifierIds.has(binding.specifierId)) findings.push(makeFinding('BROKEN_REFERENCE', 'error', `Concept ${concept.id} references missing specifier ${binding.specifierId}.`, [concept.id, binding.specifierId], { referenceType: 'specifier' }))
      if (binding.optionSetId && !optionSetIds.has(binding.optionSetId)) findings.push(makeFinding('BROKEN_REFERENCE', 'error', `Concept ${concept.id} references missing option set ${binding.optionSetId}.`, [concept.id, binding.optionSetId], { referenceType: 'optionSet' }))
    }

    for (const relation of concept.relations || []) {
      if (!conceptIds.has(relation.target)) findings.push(makeFinding('BROKEN_REFERENCE', 'error', `Concept ${concept.id} relation points to unknown concept ${relation.target}.`, [concept.id, relation.target], { referenceType: 'relation', relationType: relation.type }))
      if (relation.type && !VALID_RELATION_TYPES.has(relation.type)) findings.push(makeFinding('BROKEN_REFERENCE', 'error', `Concept ${concept.id} uses unsupported relation type ${relation.type}.`, [concept.id], { referenceType: 'relationType', relationType: relation.type }))
    }

    if (!concept.description?.trim()) findings.push(makeFinding('EMPTY_DESCRIPTION', 'warning', `Concept ${concept.id} has an empty description.`, [concept.id]))
    else if (isBoilerplateDescription(concept.description)) findings.push(makeFinding('BOILERPLATE_DESCRIPTION', 'warning', `Concept ${concept.id} uses the catalog boilerplate description pattern.`, [concept.id]))

    const label = concept.label?.trim() || ''
    if (label && label[0] !== label[0].toUpperCase()) findings.push(makeFinding('INCONSISTENT_CAPITALIZATION', 'warning', `Concept label starts with lowercase text: ${label}`, [concept.id], { label }))

    const isSpecialist = SPECIALIST_TERM_PATTERNS.some((pattern) => pattern.test(label))
    if (isSpecialist && !concept.tags?.includes('branch_gate') && !isSubstantiveDefinition(concept)) findings.push(makeFinding('SPECIALIST_TERM_WITHOUT_DEFINITION', 'warning', `Specialist term may need a plain-language definition: ${label}`, [concept.id], { label }))
  }

  for (const category of categories) {
    const label = category.label?.trim() || ''
    if (label && label[0] !== label[0].toUpperCase()) findings.push(makeFinding('INCONSISTENT_CAPITALIZATION', 'warning', `Category label starts with lowercase text: ${label}`, [category.id], { label }))
  }

  for (const [, duplicates] of duplicateValues(concepts, (concept) => normalizeLabel(concept.label))) {
    const ids = duplicates.map((c) => c.id)
    findings.push(makeFinding('DUPLICATE_EXACT_LABEL', 'warning', `Multiple concept IDs share the same normalized label: ${duplicates[0].label}`, ids, { labels: duplicates.map((c) => c.label) }))
    const categoriesUsed = new Set(duplicates.flatMap((c) => c.categoryIds || []))
    if (categoriesUsed.size > 1) findings.push(makeFinding('DUPLICATE_CONCEPT_PLACEMENT', 'warning', `Exact-label concepts appear as separate IDs across categories; canonical reuse may be preferable: ${duplicates[0].label}`, ids, { categoryIds: [...categoriesUsed].sort() }))
  }

  if (includeEditorial) {
    const labelRows = concepts.map((c) => ({ id: c.id, label: c.label || '', normalized: normalizeLabel(c.label) }))
      .filter((row) => row.normalized.length >= 8)
    const nearPairs = []
    for (let i = 0; i < labelRows.length; i += 1) {
      for (let j = i + 1; j < labelRows.length; j += 1) {
        if (labelRows[i].normalized === labelRows[j].normalized) continue
        const similarity = labelSimilarity(labelRows[i].label, labelRows[j].label)
        if (similarity >= 0.9) nearPairs.push({ a: labelRows[i], b: labelRows[j], similarity: Number(similarity.toFixed(4)) })
      }
    }
    nearPairs.sort((a, b) => b.similarity - a.similarity || a.a.id.localeCompare(b.a.id) || a.b.id.localeCompare(b.b.id))
    for (const pair of nearPairs) findings.push(makeFinding('NEAR_DUPLICATE_LABEL', 'warning', `Suspiciously similar concept labels: “${pair.a.label}” / “${pair.b.label}”.`, [pair.a.id, pair.b.id], { similarity: pair.similarity }))
  }

  for (const optionSet of optionSets) {
    if (optionSet.specifierId && !specifierIds.has(optionSet.specifierId)) findings.push(makeFinding('BROKEN_REFERENCE', 'error', `Option set ${optionSet.id} references missing specifier ${optionSet.specifierId}.`, [optionSet.id, optionSet.specifierId], { referenceType: 'optionSet.specifierId' }))
  }

  for (const profile of [...detailProfiles, ...bodyProfiles]) {
    for (const semanticType of profile.appliesToSemanticTypes || []) {
      if (!semanticTypeIds.has(semanticType)) findings.push(makeFinding('BROKEN_REFERENCE', 'error', `Profile ${profile.id} references unknown semantic type ${semanticType}.`, [profile.id], { referenceType: 'profileSemanticType', semanticType }))
    }
    for (const field of profile.fields || []) {
      if (!field.id || !field.type) findings.push(makeFinding('DETAIL_PROFILE_FIELD_INVALID', 'error', `Profile ${profile.id} has a field without id/type.`, [profile.id]))
      if (supportedDetailFieldTypes.size && !supportedDetailFieldTypes.has(field.type)) findings.push(makeFinding('DETAIL_PROFILE_FIELD_INVALID', 'error', `Profile ${profile.id} field ${field.id} uses unsupported type ${field.type}.`, [profile.id, field.id], { fieldType: field.type }))
      if (field.dimension && !detailDimensionIds.has(field.dimension)) findings.push(makeFinding('DETAIL_PROFILE_FIELD_INVALID', 'error', `Profile ${profile.id} field ${field.id} references unknown detail dimension ${field.dimension}.`, [profile.id, field.id, field.dimension], { dimension: field.dimension }))
      if (field.relevance && supportedFieldRelevance.size && !supportedFieldRelevance.has(field.relevance)) findings.push(makeFinding('DETAIL_PROFILE_FIELD_INVALID', 'error', `Profile ${profile.id} field ${field.id} has invalid relevance ${field.relevance}.`, [profile.id, field.id], { relevance: field.relevance }))
      if (field.type === 'preference_matrix' && (!Array.isArray(field.options) || field.options.length === 0)) findings.push(makeFinding('DETAIL_PROFILE_FIELD_INVALID', 'error', `Preference-matrix field ${profile.id}.${field.id} must have options.`, [profile.id, field.id]))
    }
  }

  const priorityProfileIds = ['impact', 'bondage', 'body_part_interest', 'material_interest', 'roleplay', 'emotion_self', 'emotion_partner', 'sexual_activity']
  for (const profileId of priorityProfileIds) {
    const profile = detailProfileMap.get(profileId)
    if (!profile || profile.priorityFamily !== true || profile.activationPolicy !== 'adaptive_parent_state' || !profile.fields?.some((field) => field.type === 'preference_matrix')) {
      findings.push(makeFinding('PRIORITY_DETAIL_PROFILE_INVALID', 'error', `Priority adaptive profile ${profileId} must exist, use adaptive_parent_state, and include a preference matrix.`, [profileId]))
    }
  }

  const usedDetailProfiles = new Set(concepts.flatMap((c) => [c.detailProfileId, ...Object.values(c.detailProfileByPerspective || {})]).filter(Boolean))
  for (const profile of detailProfiles) {
    if (!usedDetailProfiles.has(profile.id)) findings.push(makeFinding('UNUSED_DETAIL_PROFILE', 'warning', `Detail profile ${profile.id} is defined but not used by any concept.`, [profile.id]))
  }

  const gates = categoryGates(catalog)
  for (const gate of gates) {
    if (!gate.legacyGateConceptId) findings.push(makeFinding('CATEGORY_GATE_MISSING', 'warning', `Category ${gate.categoryId} has no legacy branch-gate marker; this is allowed by Plan 05 but may affect old exports.`, [gate.categoryId]))
  }

  const severityOrder = { error: 0, warning: 1 }
  findings.sort((a, b) => (severityOrder[a.severity] - severityOrder[b.severity]) || a.code.localeCompare(b.code) || a.message.localeCompare(b.message))
  return findings
}

export function buildAudit(catalog) {
  const findings = validateCatalog(catalog)
  const domains = catalog.domains || []
  const categories = catalog.categories || []
  const concepts = catalog.concepts || []
  const detailProfiles = catalog.detailProfiles || []
  const gates = categoryGates(catalog)
  const scoringDiagnostics = auditScoring(catalog)
  const exactLabelGroups = duplicateValues(concepts, (concept) => normalizeLabel(concept.label)).map(([normalizedLabel, rows]) => ({ normalizedLabel, concepts: rows.map((c) => ({ id: c.id, label: c.label, categoryIds: c.categoryIds })) }))
  const nearDuplicateFindings = findings.filter((f) => f.code === 'NEAR_DUPLICATE_LABEL')
  const detailProfileUsage = detailProfiles.map((profile) => {
    const references = concepts.filter((concept) => concept.detailProfileId === profile.id || Object.values(concept.detailProfileByPerspective || {}).includes(profile.id)).map((concept) => concept.id).sort()
    return { id: profile.id, label: profile.label, appliesToSemanticTypes: profile.appliesToSemanticTypes || [], referenceCount: references.length, concepts: references, priorityFamily: profile.priorityFamily === true, activationPolicy: profile.activationPolicy || null, preferenceMatrixFields: (profile.fields || []).filter((field) => field.type === 'preference_matrix').length }
  })
  const categoryRows = categories.map((category) => {
    const placements = concepts.filter((concept) => discoverableCategories(concept).includes(category.id) && !concept.tags?.includes('branch_gate'))
    const primary = concepts.filter((concept) => primaryCategory(concept) === category.id && !concept.tags?.includes('branch_gate'))
    const scoring = scoringDiagnostics.find((row) => row.categoryId === category.id)
    return {
      id: category.id,
      label: category.label,
      domainId: category.domainId || null,
      semanticType: category.semanticType || null,
      catalogPlacementCount: placements.length,
      primaryConceptCount: primary.length,
      resultContributingConceptCount: scoring?.contributingConceptCount || 0,
      resultPerspectiveRecordCount: scoring?.perspectiveRecordCount || 0,
      concepts: primary.map((c) => c.id),
    }
  })

  const perspectiveCounts = {}
  for (const concept of concepts) for (const p of concept.perspectives || []) perspectiveCounts[p] = (perspectiveCounts[p] || 0) + 1
  const semanticTypeCounts = {}
  for (const concept of concepts) semanticTypeCounts[concept.semanticType || '(missing)'] = (semanticTypeCounts[concept.semanticType || '(missing)'] || 0) + 1
  const riskDomainCounts = Object.fromEntries(REQUIRED_RISK_DOMAINS.map((domainId) => [domainId, 0]))
  for (const concept of concepts) for (const domainId of concept.riskDomains || []) riskDomainCounts[domainId] = (riskDomainCounts[domainId] || 0) + 1

  const definitionRows = concepts.map((concept) => ({ id: concept.id, label: concept.label, description: concept.description, branchGate: concept.tags?.includes('branch_gate') === true, substantiveDefinition: isSubstantiveDefinition(concept), boilerplate: isBoilerplateDescription(concept.description || '') }))
  const definitionEligibleRows = definitionRows.filter((row) => !row.branchGate)
  const crossCategory = concepts.filter((concept) => discoverableCategories(concept).length > 1).map((concept) => ({ id: concept.id, label: concept.label, primaryCategory: primaryCategory(concept), relatedCategories: relatedCategories(concept), categoryIds: discoverableCategories(concept) }))
  const domainRows = domains.map((domain) => {
    const domainCategories = categories.filter((category) => category.domainId === domain.id)
    const primaryConcepts = concepts.filter((concept) => concept.domain === domain.id && !concept.tags?.includes('branch_gate'))
    const placements = domainCategories.reduce((sum, category) => sum + concepts.filter((concept) => discoverableCategories(concept).includes(category.id) && !concept.tags?.includes('branch_gate')).length, 0)
    return {
      id: domain.id,
      label: domain.label,
      description: domain.description || '',
      categoryCount: domainCategories.length,
      categoryIds: domainCategories.map((category) => category.id),
      primaryConceptCount: primaryConcepts.length,
      discoverablePlacementCount: placements,
    }
  })

  const findingsByCode = {}
  for (const finding of findings) {
    findingsByCode[finding.code] ||= { errors: 0, warnings: 0 }
    findingsByCode[finding.code][finding.severity === 'error' ? 'errors' : 'warnings'] += 1
  }

  return {
    auditSchemaVersion: '1.7.0',
    source: {
      questionnaireId: catalog.questionnaire?.id || null,
      questionnaireVersion: catalog.questionnaire?.version || null,
      catalogSchemaVersion: catalog.schemaVersion || null,
    },
    summary: {
      totalDomains: domains.length,
      totalCategories: categories.length,
      totalConcepts: concepts.length,
      branchGateConcepts: concepts.filter((c) => c.tags?.includes('branch_gate')).length,
      crossCategoryConcepts: crossCategory.length,
      detailProfiles: detailProfiles.length,
      conceptsWithDetailProfiles: concepts.filter((c) => c.detailProfileId || Object.keys(c.detailProfileByPerspective || {}).length).length,
      adaptivePriorityProfiles: detailProfiles.filter((profile) => profile.priorityFamily === true).length,
      preferenceMatrixFields: detailProfiles.reduce((sum, profile) => sum + (profile.fields || []).filter((field) => field.type === 'preference_matrix').length, 0),
      definitionEligibleConcepts: definitionEligibleRows.length,
      substantiveDefinitions: definitionEligibleRows.filter((row) => row.substantiveDefinition).length,
      conceptsWithoutSubstantiveDefinitions: definitionEligibleRows.filter((row) => !row.substantiveDefinition).length,
      boilerplateDescriptions: definitionRows.filter((row) => row.boilerplate).length,
      duplicateExactLabelGroups: exactLabelGroups.length,
      nearDuplicateLabelPairs: nearDuplicateFindings.length,
      errors: findings.filter((f) => f.severity === 'error').length,
      warnings: findings.filter((f) => f.severity === 'warning').length,
      conceptsWithRiskDomains: concepts.filter((concept) => (concept.riskDomains || []).length > 0).length,
    },
    domains: domainRows,
    modeCoverage: auditModes(catalog),
    perspectiveCounts,
    adaptiveDetailMetadata: {
      system: catalog.adaptiveDetailSystem || {},
      detailDimensions: catalog.detailDimensions || {},
      priorityProfileIds: detailProfiles.filter((profile) => profile.priorityFamily === true).map((profile) => profile.id),
    },
    semanticMetadata: {
      semanticTypeCounts,
      semanticTypes: catalog.semanticTypes || {},
      conceptTypes: [...new Set(concepts.map((c) => c.type))].sort(),
      legacyDimensionsInUse: [...new Set(concepts.flatMap((c) => Object.keys(c.dimensions || {})))].sort(),
      questionDimensions: catalog.questionDimensions || {},
      questionTemplates: Object.fromEntries(Object.entries(catalog.semanticTypes || {}).map(([id, definition]) => [id, definition.questionDimensions || {}])),
    },
    categories: categoryRows,
    detailProfiles: detailProfileUsage,
    crossCategoryConcepts: crossCategory,
    duplicateExactLabels: exactLabelGroups,
    nearDuplicateLabels: nearDuplicateFindings.map((f) => ({ conceptIds: f.affectedIds, similarity: f.details.similarity, message: f.message })),
    definitions: {
      eligibleConceptCount: definitionEligibleRows.length,
      excludedBranchGateCount: definitionRows.length - definitionEligibleRows.length,
      withSubstantiveDefinitions: definitionEligibleRows.filter((row) => row.substantiveDefinition),
      withoutSubstantiveDefinitions: definitionEligibleRows.filter((row) => !row.substantiveDefinition),
      boilerplateDescriptions: definitionRows.filter((row) => row.boilerplate),
    },
    editorialMetadata: {
      model: catalog.editorialModel || {},
      contentExpansion: catalog.contentExpansion || {},
    },
    riskMetadata: {
      riskDomainCounts,
      domainDefinitions: catalog.riskDomains || {},
      promptMap: catalog.riskPromptMap || {},
      prompts: catalog.riskPrompts || {},
      migration: catalog.riskMigration || {},
      concepts: concepts.filter((concept) => (concept.riskDomains || []).length > 0).map((concept) => ({ id: concept.id, label: concept.label, riskDomains: concept.riskDomains })),
    },
    negotiationPreferences: catalog.negotiationPreferencesModel || {},
    categoryGates: gates,
    resultsModel: catalog.resultsModel || {},
    relations: auditRelations(catalog),
    branchRelationships: auditBranches(catalog),
    orphanedDetailProfileReferences: findings.filter((finding) => finding.code === 'ORPHANED_DETAIL_PROFILE_REFERENCE'),
    unusedDetailProfiles: detailProfileUsage.filter((profile) => profile.referenceCount === 0),
    resultCategoryContributions: scoringDiagnostics.map((row) => ({
      categoryId: row.categoryId,
      categoryLabel: row.categoryLabel,
      conceptIds: row.conceptWeights.map((c) => c.conceptId),
      perspectiveRecordCount: row.perspectiveRecordCount,
    })),
    scoringDiagnostics,
    validation: {
      findingsByCode,
      findings,
    },
  }
}

function pct(value) {
  return `${Number(value).toFixed(2)}%`
}

export function renderAuditMarkdown(audit) {
  const lines = []
  lines.push('# Catalog Audit Baseline', '')
  lines.push(`Questionnaire: \`${audit.source.questionnaireId}\` v${audit.source.questionnaireVersion}  `)
  lines.push(`Catalog schema: \`${audit.source.catalogSchemaVersion}\`  `)
  lines.push(`Audit schema: \`${audit.auditSchemaVersion}\``, '')
  lines.push('## Summary', '')
  lines.push('| Metric | Count |', '|---|---:|')
  const summaryRows = [
    ['Navigation domains', audit.summary.totalDomains],
    ['Categories', audit.summary.totalCategories],
    ['Concepts', audit.summary.totalConcepts],
    ['Branch-gate concepts', audit.summary.branchGateConcepts],
    ['Cross-category concepts', audit.summary.crossCategoryConcepts],
    ['Detail profiles', audit.summary.detailProfiles],
    ['Concepts with detail profiles', audit.summary.conceptsWithDetailProfiles],
    ['Priority adaptive profiles', audit.summary.adaptivePriorityProfiles],
    ['Preference-matrix fields', audit.summary.preferenceMatrixFields],
    ['Definition-eligible concepts', audit.summary.definitionEligibleConcepts],
    ['Substantive definitions', audit.summary.substantiveDefinitions],
    ['Without substantive definitions', audit.summary.conceptsWithoutSubstantiveDefinitions],
    ['Boilerplate descriptions', audit.summary.boilerplateDescriptions],
    ['Exact duplicate label groups', audit.summary.duplicateExactLabelGroups],
    ['Near-duplicate label pairs', audit.summary.nearDuplicateLabelPairs],
    ['Validation errors', audit.summary.errors],
    ['Validation warnings', audit.summary.warnings],
  ]
  for (const [label, count] of summaryRows) lines.push(`| ${label} | ${count} |`)

  lines.push('', '## Navigation domains', '')
  lines.push('| Domain | Categories | Primary concepts | Discoverable placements |', '|---|---:|---:|---:|')
  for (const row of audit.domains) lines.push(`| ${row.label} | ${row.categoryCount} | ${row.primaryConceptCount} | ${row.discoverablePlacementCount} |`)

  lines.push('', '## Depth-mode coverage', '')
  lines.push('Counts reflect current UI placements when every category branch is open and “show all” has not been manually selected. Cross-listed canonical concepts can therefore appear in more than one category without creating extra answer identities.', '')
  lines.push('| Mode | Concepts shown |', '|---|---:|')
  for (const mode of audit.modeCoverage.order) lines.push(`| ${mode} | ${audit.modeCoverage.totals[mode]} |`)

  lines.push('', '## Concepts per category', '')
  lines.push('| Domain | Category | Primary concepts | All catalog placements | Result contributors | Perspective records |', '|---|---|---:|---:|---:|---:|')
  const domainLabels = Object.fromEntries(audit.domains.map((domain) => [domain.id, domain.label]))
  for (const row of audit.categories) lines.push(`| ${domainLabels[row.domainId] || row.domainId || '—'} | ${row.label} | ${row.primaryConceptCount} | ${row.catalogPlacementCount} | ${row.resultContributingConceptCount} | ${row.resultPerspectiveRecordCount} |`)

  lines.push('', '## Perspectives', '', '| Perspective | Concepts |', '|---|---:|')
  for (const [perspective, count] of Object.entries(audit.perspectiveCounts).sort(([a], [b]) => a.localeCompare(b))) lines.push(`| ${perspective} | ${count} |`)

  lines.push('', '## Semantic metadata', '')
  lines.push('Semantic types currently present in the catalog:', '')
  for (const [type, count] of Object.entries(audit.semanticMetadata.semanticTypeCounts).sort(([a], [b]) => a.localeCompare(b))) lines.push(`- \`${type}\`: ${count}`)
  lines.push('', `Authoritative question dimensions: ${Object.keys(audit.semanticMetadata.questionDimensions).map((d) => `\`${d}\``).join(', ')}.`)
  lines.push(`Legacy per-concept dimension flags retained for compatibility: ${audit.semanticMetadata.legacyDimensionsInUse.map((d) => `\`${d}\``).join(', ')}.`)

  lines.push('', '## Adaptive detail system', '')
  lines.push(`Adaptive detail system: \`${audit.adaptiveDetailMetadata.system.version || '—'}\`; response states: ${(audit.adaptiveDetailMetadata.system.detailResponseStates || []).map((state) => `\`${state.id}\``).join(', ')}.`)
  lines.push(`Priority profiles: ${audit.adaptiveDetailMetadata.priorityProfileIds.map((id) => `\`${id}\``).join(', ')}.`)
  lines.push(`Reusable detail primitives: ${Object.keys(audit.adaptiveDetailMetadata.detailDimensions).map((id) => `\`${id}\``).join(', ')}.`)

  lines.push('', '## Detail profiles', '', '| Profile | Semantic applicability | References | Matrix fields |', '|---|---|---:|---:|')
  for (const profile of audit.detailProfiles) lines.push(`| ${profile.label} (\`${profile.id}\`) | ${(profile.appliesToSemanticTypes || []).join(', ') || '—'} | ${profile.referenceCount} | ${profile.preferenceMatrixFields} |`)

  lines.push('', '## Cross-category concepts', '', `${audit.crossCategoryConcepts.length} concepts are canonically reused across more than one category. The explicit primaryCategory remains the current results/scoring category; related placements reuse the same canonical answer key.`, '')
  for (const row of audit.crossCategoryConcepts) lines.push(`- **${row.label}** (\`${row.id}\`): ${row.categoryIds.join(', ')}`)

  lines.push('', '## Duplicate and near-duplicate labels', '')
  if (!audit.duplicateExactLabels.length) lines.push('No exact normalized duplicate-label groups detected.')
  else for (const group of audit.duplicateExactLabels) lines.push(`- Exact: ${group.concepts.map((c) => `**${c.label}** (\`${c.id}\`)`).join(' / ')}`)
  if (!audit.nearDuplicateLabels.length) lines.push('No suspicious near-duplicate label pairs detected by the current heuristic.')
  else for (const pair of audit.nearDuplicateLabels) lines.push(`- Near (${pair.similarity}): ${pair.message}`)

  lines.push('', '## Definitions and descriptions', '')
  lines.push(`- Definition-eligible concepts (branch-gate compatibility markers excluded): **${audit.summary.definitionEligibleConcepts}**`)
  lines.push(`- Substantive definitions: **${audit.summary.substantiveDefinitions}**`)
  lines.push(`- Missing/non-substantive definitions: **${audit.summary.conceptsWithoutSubstantiveDefinitions}**`)
  lines.push(`- Boilerplate descriptions: **${audit.summary.boilerplateDescriptions}**`)
  lines.push(`- Editorial model: **${audit.editorialMetadata.model.version || '—'}**; Plan 08 additions: **${(audit.editorialMetadata.contentExpansion.addedConceptIds || []).length} concepts**.`)

  lines.push('', '## Risk metadata', '', 'Plan 07 uses descriptive concern domains rather than a one-dimensional severity label. A concept can carry more than one domain, and the domain controls high-level/non-procedural negotiation prompts.', '', '| Risk domain | Concepts |', '|---|---:|')
  for (const [domainId, count] of Object.entries(audit.riskMetadata.riskDomainCounts).sort(([a], [b]) => a.localeCompare(b))) lines.push(`| ${audit.riskMetadata.domainDefinitions?.[domainId]?.label || domainId} (\`${domainId}\`) | ${count} |`)
  lines.push('', `Concepts with one or more risk domains: **${audit.summary.conceptsWithRiskDomains}/${audit.summary.totalConcepts}**.`)

  lines.push('', '## Negotiation, privacy, and care profile', '')
  lines.push(`Storage: \`${audit.negotiationPreferences.storage || '—'}\` · score contribution: **${audit.negotiationPreferences.scoreContribution || '—'}** · results treatment: **${audit.negotiationPreferences.resultTreatment || '—'}**.`, '')
  for (const section of audit.negotiationPreferences.sections || []) lines.push(`- **${section.label}** (\`${section.id}\`): ${(section.fields || []).map((field) => field.label).join(', ')}`)

  lines.push('', '## Category gates and branching', '')
  lines.push(`Category routing records use **${audit.categoryGates[0]?.storage || '—'}** storage and contribute **${audit.categoryGates[0]?.scoreContribution || '—'}** to preference scoring.`)
  lines.push(`Legacy branch-gate markers retained for import compatibility: **${audit.categoryGates.filter((g) => g.legacyGateConceptId).length}/${audit.categoryGates.length}**.`)
  lines.push(`Child-of relationships: **${audit.branchRelationships.length}**.`)
  lines.push('Plan 05 category gates route navigation only. Category-wide hard limits are stored separately from concept answers, while Skip remains unanswered.', '')

  lines.push('## Scoring diagnostics', '')
  lines.push('Plan 06 aggregates perspective responses within each concept before category aggregation. Every contributing concept therefore has the same default category weight, regardless of perspective count. Hard limits and category gates are excluded from preference averages.', '')
  lines.push('| Category | Concepts | Perspective records | Multi-perspective overweight anomalies |', '|---|---:|---:|---:|')
  for (const row of audit.scoringDiagnostics) lines.push(`| ${row.categoryLabel} | ${row.contributingConceptCount} | ${row.perspectiveRecordCount} | ${row.disproportionateConcepts.length} |`)
  lines.push('', `Results model: **${audit.resultsModel.version || '—'}** · weighting: **${audit.resultsModel.defaultCategoryWeighting || '—'}** · primary output uses qualitative labels: **${audit.resultsModel.internalIndex?.shownAsPrimaryResult === false ? 'yes' : 'no'}**.`, '')

  lines.push('', '## Validation findings', '')
  lines.push(`Fatal errors: **${audit.summary.errors}**. Editorial warnings: **${audit.summary.warnings}**.`, '')
  lines.push('| Class | Errors | Warnings |', '|---|---:|---:|')
  for (const [code, counts] of Object.entries(audit.validation.findingsByCode).sort(([a], [b]) => a.localeCompare(b))) lines.push(`| \`${code}\` | ${counts.errors} | ${counts.warnings} |`)
  lines.push('', 'See `docs/catalog-validation.md` for the meaning and severity of every validation class. The complete machine-readable finding list is in `reports/catalog-audit.json`.', '')
  return `${lines.join('\n')}\n`
}

export function writeAuditFiles(audit, outputDir) {
  fs.mkdirSync(outputDir, { recursive: true })
  const jsonPath = path.join(outputDir, 'catalog-audit.json')
  const mdPath = path.join(outputDir, 'catalog-audit.md')
  fs.writeFileSync(jsonPath, `${JSON.stringify(audit, null, 2)}\n`)
  fs.writeFileSync(mdPath, renderAuditMarkdown(audit))
  return { jsonPath, mdPath }
}

export function validationExitCode(findings) {
  return findings.some((finding) => finding.severity === 'error' || ERROR_CLASSES.has(finding.code) && finding.severity === 'error') ? 1 : 0
}
