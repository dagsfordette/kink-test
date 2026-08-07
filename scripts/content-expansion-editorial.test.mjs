import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { buildAudit, isBoilerplateDescription, loadCatalog, validateCatalog } from './catalog-audit-lib.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const catalog = loadCatalog(path.join(here, '../src/data/catalog.json'))
const byId = new Map(catalog.concepts.map((concept) => [concept.id, concept]))
const categoryById = new Map(catalog.categories.map((category) => [category.id, category]))
const sha = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')

const EXPECTED_ADDITIONS = [
  'rimming','prostate_focused_play','intercrural_sex','chest_breast_nonpenetrative_sex','riding_crop_play',
  'masturbation_sleeves','prostate_toys','powered_sex_machines','honor_system_chastity','self_directed_chastity',
  'forced_orgasm_fantasy','overstimulation','orgasm_on_command','conditioned_orgasm','adult_age_play_roleplay',
  'caregiver_little_adult_dynamic','negotiated_sleep_vulnerability_fantasy','erotic_hypnosis_activity','consensual_blackmail_fantasy','negotiated_misdirection',
  'eyes_fetish','ears_fetish','tongue_fetish','teeth_fetish','facial_hair_fetish','calves_fetish','navel_fetish',
  'spandex_fetish','nylon_hosiery_material_fetish','neoprene_fetish','fur_like_texture_fetish','socks_fetish','metal_chain_aesthetic_fetish',
  'emotion_helplessness','emotion_desperation','emotion_frustration','emotion_awe_reverence','twenty_four_seven_ds','negotiated_availability_free_use_fantasy','gender_transformation_fantasy',
]

test('Plan 08 appends exactly the approved 40 concepts', () => {
  assert.deepEqual(catalog.contentExpansion.addedConceptIds, EXPECTED_ADDITIONS)
  assert.equal(catalog.concepts.length, 594)
  for (const id of EXPECTED_ADDITIONS) assert.ok(byId.has(id), id)
})

test('all 554 Plan 07 canonical ids remain unchanged and in original order', () => {
  const legacyIds = catalog.concepts.slice(0, 554).map((concept) => concept.id)
  assert.equal(sha(legacyIds), '9e81b3cfc3c3d076ba4e7fe62115ac81229099227bf11c80a7492729f707eb2c')
})

test('Plan 08 leaves the curated Quick catalog unchanged', () => {
  const quick = Object.fromEntries(catalog.categories.map((category) => [category.id, category.depthConceptIds.quick]))
  assert.equal(sha(quick), 'f85ba335ad9e421b3c02c5b6f9a78bcf1429f5eb03c0cfd96765d1c5e478b5a1')
})

test('every new concept is discoverable in Exhaustive for every canonical placement', () => {
  for (const id of EXPECTED_ADDITIONS) {
    const concept = byId.get(id)
    for (const categoryId of concept.categoryIds) {
      assert.ok(categoryById.get(categoryId).depthConceptIds.exhaustive.includes(id), `${id} missing from ${categoryId} exhaustive`)
    }
  }
})

test('common additions are promoted to Standard while specialist additions can remain Exhaustive-only', () => {
  for (const id of ['rimming','prostate_focused_play','riding_crop_play','masturbation_sleeves','overstimulation','orgasm_on_command','twenty_four_seven_ds','gender_transformation_fantasy']) {
    const concept = byId.get(id)
    assert.ok(categoryById.get(concept.primaryCategory).depthConceptIds.standard.includes(id), id)
  }
  for (const id of ['powered_sex_machines','consensual_blackmail_fantasy','negotiated_sleep_vulnerability_fantasy','metal_chain_aesthetic_fetish']) {
    const concept = byId.get(id)
    assert.ok(!categoryById.get(concept.primaryCategory).depthConceptIds.standard.includes(id), `${id} should remain exhaustive-only`)
  }
})

test('wearable/remote toy coverage reuses the existing canonical concept with adaptive details', () => {
  const concept = byId.get('app_controlled_toys')
  assert.equal(concept.detailProfileId, 'remote_toy')
  assert.match(concept.description, /wearable/i)
  const profile = catalog.detailProfiles.find((row) => row.id === 'remote_toy')
  assert.ok(profile)
  assert.ok(profile.fields.some((field) => field.id === 'form_factor' && field.type === 'preference_matrix'))
})

test('broad transformation subtypes use adaptive detail rather than duplicate standalone permutations', () => {
  assert.equal(byId.get('transformation_fantasy').detailProfileId, 'transformation_fantasy')
  const profile = catalog.detailProfiles.find((row) => row.id === 'transformation_fantasy')
  assert.ok(profile.fields.some((field) => field.id === 'transformation_focus' && field.type === 'preference_matrix'))
  assert.ok(byId.has('gender_transformation_fantasy'), 'gender transformation remains independently answerable')
})

test('adult-only sensitive roleplay additions are explicit about adult participation', () => {
  for (const id of ['adult_age_play_roleplay','caregiver_little_adult_dynamic','negotiated_sleep_vulnerability_fantasy']) {
    const concept = byId.get(id)
    assert.match(`${concept.label} ${concept.description}`, /adult/i, id)
    assert.ok(concept.riskDomains.includes('consent_complexity'), id)
  }
})

test('specialist terminology has plain-language definitions', () => {
  for (const id of ['compersion_play','predicament_bondage','dollification','brat_taming','ruined_orgasm_fantasy','primal_play','formal_protocol','service_submission','objectification_general','consensual_nonconsent_roleplay']) {
    const description = byId.get(id)?.description || ''
    assert.ok(description.length >= 70, id)
    assert.ok(!isBoilerplateDescription(description), id)
  }
})

test('all answerable non-gate concepts have substantive non-boilerplate descriptions', () => {
  for (const concept of catalog.concepts.filter((row) => !row.tags?.includes('branch_gate'))) {
    assert.ok(concept.description?.trim().length >= 30, concept.id)
    assert.equal(isBoilerplateDescription(concept.description), false, concept.id)
  }
})

test('user-facing labels have no exact normalized duplicate groups or capitalization warnings', () => {
  const findings = validateCatalog(catalog)
  assert.equal(findings.filter((finding) => finding.code === 'DUPLICATE_EXACT_LABEL').length, 0)
  assert.equal(findings.filter((finding) => finding.code === 'INCONSISTENT_CAPITALIZATION').length, 0)
})

test('Plan 08 audit reaches full definition coverage and zero boilerplate', () => {
  const audit = buildAudit(catalog)
  assert.equal(audit.summary.definitionEligibleConcepts, 562)
  assert.equal(audit.summary.substantiveDefinitions, 562)
  assert.equal(audit.summary.conceptsWithoutSubstantiveDefinitions, 0)
  assert.equal(audit.summary.boilerplateDescriptions, 0)
  assert.equal(audit.summary.errors, 0)
})

test('the only remaining editorial warnings are intentional near-duplicate distinctions', () => {
  const findings = validateCatalog(catalog)
  assert.deepEqual([...new Set(findings.map((finding) => finding.code))], ['NEAR_DUPLICATE_LABEL'])
  assert.equal(findings.length, 2)
})
