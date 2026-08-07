import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadCatalog, validateCatalog, validationExitCode } from './catalog-audit-lib.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const catalogPath = path.join(here, '../src/data/catalog.json')

function freshCatalog() {
  return JSON.parse(JSON.stringify(loadCatalog(catalogPath)))
}

function hasCode(findings, code) {
  return findings.some((finding) => finding.code === code)
}

test('current catalog has no fatal validation errors', () => {
  const findings = validateCatalog(freshCatalog(), { editorial: false })
  assert.equal(validationExitCode(findings), 0)
})

test('duplicate concept ids are fatal', () => {
  const catalog = freshCatalog()
  catalog.concepts.push({ ...catalog.concepts[0] })
  const findings = validateCatalog(catalog, { editorial: false })
  assert.ok(hasCode(findings, 'DUPLICATE_ID'))
  assert.equal(validationExitCode(findings), 1)
})

test('broken relation targets are fatal', () => {
  const catalog = freshCatalog()
  catalog.concepts[1].relations = [{ type: 'child_of', target: 'definitely_missing' }]
  const findings = validateCatalog(catalog, { editorial: false })
  assert.ok(hasCode(findings, 'BROKEN_REFERENCE'))
  assert.equal(validationExitCode(findings), 1)
})

test('invalid perspectives are fatal', () => {
  const catalog = freshCatalog()
  catalog.concepts[1].perspectives = ['sideways']
  const findings = validateCatalog(catalog, { editorial: false })
  assert.ok(hasCode(findings, 'INVALID_PERSPECTIVE'))
  assert.equal(validationExitCode(findings), 1)
})

test('invalid tier values are fatal when tier metadata is present', () => {
  const catalog = freshCatalog()
  catalog.concepts[1].tier = 'mega'
  const findings = validateCatalog(catalog, { editorial: false })
  assert.ok(hasCode(findings, 'INVALID_MODE_OR_TIER'))
  assert.equal(validationExitCode(findings), 1)
})

test('orphaned detail-profile references are fatal', () => {
  const catalog = freshCatalog()
  catalog.concepts[1].detailProfileId = 'missing_profile'
  const findings = validateCatalog(catalog, { editorial: false })
  assert.ok(hasCode(findings, 'ORPHANED_DETAIL_PROFILE_REFERENCE'))
  assert.equal(validationExitCode(findings), 1)
})

test('editorial description concerns remain warnings', () => {
  const catalog = freshCatalog()
  catalog.concepts[1].description = ''
  const findings = validateCatalog(catalog)
  const issue = findings.find((finding) => finding.code === 'EMPTY_DESCRIPTION' && finding.affectedIds.includes(catalog.concepts[1].id))
  assert.equal(issue?.severity, 'warning')
})

test('undefined category domains are fatal', () => {
  const catalog = freshCatalog()
  catalog.categories[0].domainId = 'missing_domain'
  const findings = validateCatalog(catalog, { editorial: false })
  assert.ok(hasCode(findings, 'CATEGORY_DOMAIN_MISSING_OR_INVALID'))
  assert.equal(validationExitCode(findings), 1)
})

test('canonical taxonomy placement mismatches are fatal', () => {
  const catalog = freshCatalog()
  catalog.concepts[1].primaryCategory = catalog.categories[1].id
  const findings = validateCatalog(catalog, { editorial: false })
  assert.ok(hasCode(findings, 'TAXONOMY_PLACEMENT_MISMATCH'))
  assert.equal(validationExitCode(findings), 1)
})

test('missing Plan 03 semantic types are fatal', () => {
  const catalog = freshCatalog()
  delete catalog.semanticTypes.fantasy
  const findings = validateCatalog(catalog, { editorial: false })
  assert.ok(hasCode(findings, 'SEMANTIC_TYPE_SCHEMA_INVALID'))
  assert.equal(validationExitCode(findings), 1)
})

test('concept question-model template mismatches are fatal', () => {
  const catalog = freshCatalog()
  catalog.concepts[1].questionModel.template = 'fantasy'
  const findings = validateCatalog(catalog, { editorial: false })
  assert.ok(hasCode(findings, 'QUESTION_MODEL_INVALID'))
  assert.equal(validationExitCode(findings), 1)
})

test('fantasy-only willingness support is required', () => {
  const catalog = freshCatalog()
  catalog.scales.willingness.values = catalog.scales.willingness.values.filter((value) => value.id !== 'fantasy_only')
  const findings = validateCatalog(catalog, { editorial: false })
  assert.ok(hasCode(findings, 'RESPONSE_SCALE_INVALID'))
  assert.equal(validationExitCode(findings), 1)
})


test('missing Plan 04 adaptive branch rules are fatal', () => {
  const catalog = freshCatalog()
  delete catalog.adaptiveDetailSystem.branchRules.fantasy_only
  const findings = validateCatalog(catalog, { editorial: false })
  assert.ok(hasCode(findings, 'ADAPTIVE_DETAIL_SCHEMA_INVALID'))
  assert.equal(validationExitCode(findings), 1)
})

test('unknown adaptive detail dimensions are fatal', () => {
  const catalog = freshCatalog()
  catalog.detailProfiles.find((profile) => profile.id === 'impact').fields[0].dimension = 'made_up_dimension'
  const findings = validateCatalog(catalog, { editorial: false })
  assert.ok(hasCode(findings, 'DETAIL_PROFILE_FIELD_INVALID'))
  assert.equal(validationExitCode(findings), 1)
})

test('priority profiles must retain a preference matrix', () => {
  const catalog = freshCatalog()
  const impact = catalog.detailProfiles.find((profile) => profile.id === 'impact')
  for (const field of impact.fields) if (field.type === 'preference_matrix') field.type = 'multi_select'
  const findings = validateCatalog(catalog, { editorial: false })
  assert.ok(hasCode(findings, 'PRIORITY_DETAIL_PROFILE_INVALID'))
  assert.equal(validationExitCode(findings), 1)
})

test('Plan 05 depth lists must remain nested and exhaustive', () => {
  const catalog = freshCatalog()
  const category = catalog.categories.find((row) => row.id === 'impact_play')
  category.depthConceptIds.standard = category.depthConceptIds.standard.filter((id) => id !== 'hand_spanking')
  const findings = validateCatalog(catalog, { editorial: false })
  assert.ok(hasCode(findings, 'CATEGORY_DEPTH_INVALID'))
  assert.equal(validationExitCode(findings), 1)
})

test('Plan 05 gate skip state must remain unanswered', () => {
  const catalog = freshCatalog()
  catalog.categoryGateModel.states.find((state) => state.id === 'skip').answered = true
  const findings = validateCatalog(catalog, { editorial: false })
  assert.ok(hasCode(findings, 'CATEGORY_GATE_SCHEMA_INVALID'))
  assert.equal(validationExitCode(findings), 1)
})

test('Plan 05 depth mode registry is required', () => {
  const catalog = freshCatalog()
  delete catalog.depthModes.modes.quick.catalogPolicy
  const findings = validateCatalog(catalog, { editorial: false })
  assert.ok(hasCode(findings, 'DEPTH_MODE_SCHEMA_INVALID'))
  assert.equal(validationExitCode(findings), 1)
})

test('Plan 06 equal-concept results model is required', () => {
  const catalog = freshCatalog()
  catalog.resultsModel.defaultCategoryWeighting = 'perspective_record'
  const findings = validateCatalog(catalog, { editorial: false })
  assert.ok(hasCode(findings, 'RESULTS_MODEL_INVALID'))
  assert.equal(validationExitCode(findings), 1)
})

test('Plan 07 legacy riskLevel fields are fatal', () => {
  const catalog = freshCatalog()
  catalog.concepts[0].riskLevel = 'high'
  const findings = validateCatalog(catalog, { editorial: false })
  assert.ok(hasCode(findings, 'LEGACY_RISK_LEVEL_PRESENT'))
  assert.equal(validationExitCode(findings), 1)
})

test('Plan 07 unknown risk domains are fatal', () => {
  const catalog = freshCatalog()
  catalog.concepts[0].riskDomains = ['made_up_risk']
  const findings = validateCatalog(catalog, { editorial: false })
  assert.ok(hasCode(findings, 'RISK_DOMAIN_SCHEMA_INVALID'))
  assert.equal(validationExitCode(findings), 1)
})

test('Plan 07 risk prompt mappings must stay high-level and non-procedural', () => {
  const catalog = freshCatalog()
  catalog.riskPrompts.physical_precautions.instructionLevel = 'procedural'
  const findings = validateCatalog(catalog, { editorial: false })
  assert.ok(hasCode(findings, 'RISK_PROMPT_MAPPING_INVALID'))
  assert.equal(validationExitCode(findings), 1)
})

test('Plan 07 negotiation profile cannot contribute to interest scoring', () => {
  const catalog = freshCatalog()
  catalog.negotiationPreferencesModel.scoreContribution = 'positive'
  const findings = validateCatalog(catalog, { editorial: false })
  assert.ok(hasCode(findings, 'NEGOTIATION_PREFERENCES_SCHEMA_INVALID'))
  assert.equal(validationExitCode(findings), 1)
})
