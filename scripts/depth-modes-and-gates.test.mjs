import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadCatalog } from './catalog-audit-lib.mjs'
import { conceptsForCategory } from '../src/lib/taxonomy.js'
import { buildResults } from '../src/lib/profile.js'
import {
  categoryGateBoundary,
  categoryGateIsAnswered,
  categoryGatePolicy,
  conceptsForDepth,
  createCategoryGateRecord,
  migrateLegacyCategoryGates,
  normalizeDepthMode,
} from '../src/lib/depthModes.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const catalog = loadCatalog(path.join(here, '../src/data/catalog.json'))
const categoryMap = new Map(catalog.categories.map((category) => [category.id, category]))

function directConcepts(categoryId) {
  return conceptsForCategory(catalog, categoryId)
    .filter((concept) => catalog.semanticTypes?.[concept.semanticType]?.directQuestioning !== false)
}

test('Quick, Standard, and Exhaustive are explicit nested category catalogs', () => {
  assert.deepEqual(catalog.depthModes.order, ['quick', 'standard', 'exhaustive'])
  for (const category of catalog.categories) {
    const quick = category.depthConceptIds.quick
    const standard = category.depthConceptIds.standard
    const exhaustive = category.depthConceptIds.exhaustive
    assert.ok(quick.length > 0, `${category.id} should have Quick representatives`)
    assert.ok(quick.every((id) => standard.includes(id)), `${category.id} Quick must be a Standard subset`)
    assert.ok(standard.every((id) => exhaustive.includes(id)), `${category.id} Standard must be an Exhaustive subset`)
    assert.deepEqual(new Set(exhaustive), new Set(directConcepts(category.id).map((concept) => concept.id)), `${category.id} Exhaustive must cover all discoverable concepts`)
  }
})

test('priority Quick categories use representative concepts rather than specialist edge items', () => {
  const quick = (categoryId) => categoryMap.get(categoryId).depthConceptIds.quick
  assert.ok(quick('power_exchange').includes('dominance'))
  assert.ok(quick('power_exchange').includes('submission'))
  for (const id of ['hand_spanking', 'paddling', 'flogging', 'thudding_impact', 'stingy_impact']) assert.ok(quick('impact_play').includes(id))
  for (const id of ['anal_touch', 'anal_fingering', 'anal_toys', 'anal_plugs']) assert.ok(quick('anal_play').includes(id))
  assert.ok(!quick('anal_play').includes('enema_fetish'))
  for (const id of ['vibrators', 'dildos', 'butt_plugs']) assert.ok(quick('toys_devices').includes(id))
  assert.ok(!quick('toys_devices').includes('catheter_fetish'))
  assert.ok(!quick('toys_devices').includes('urethral_sounding'))
  for (const id of ['needle_play', 'blood_play', 'fire_play', 'breath_restriction', 'cutting_fantasy']) assert.ok(!quick('medical_edge').includes(id))
})

test('specialist material remains available in Exhaustive mode', () => {
  assert.ok(categoryMap.get('anal_play').depthConceptIds.exhaustive.includes('enema_fetish'))
  assert.ok(categoryMap.get('toys_devices').depthConceptIds.exhaustive.includes('catheter_fetish'))
  assert.ok(categoryMap.get('medical_edge').depthConceptIds.exhaustive.includes('needle_play'))
  assert.ok(categoryMap.get('roleplay').depthConceptIds.exhaustive.includes('consensual_nonconsent_roleplay'))
})

test('Maybe routes to Quick representatives even in Exhaustive mode', () => {
  const category = categoryMap.get('impact_play')
  const concepts = directConcepts('impact_play')
  const rows = conceptsForDepth(category, concepts, 'exhaustive', { representativeOnly: true })
  assert.deepEqual(rows.map((concept) => concept.id), category.depthConceptIds.quick)
  assert.equal(categoryGatePolicy(createCategoryGateRecord('maybe')).representativeOnly, true)
})

test('Interested opens the selected mode while collapsed states stay closed by default', () => {
  assert.equal(categoryGatePolicy(createCategoryGateRecord('interested')).defaultOpen, true)
  assert.equal(categoryGatePolicy(createCategoryGateRecord('maybe')).defaultOpen, true)
  assert.equal(categoryGatePolicy(createCategoryGateRecord('not_interested')).defaultOpen, false)
  assert.equal(categoryGatePolicy(createCategoryGateRecord('hard_limit')).defaultOpen, false)
  assert.equal(categoryGatePolicy(createCategoryGateRecord('skip')).defaultOpen, false)
})

test('Not interested, Skip, and Hard limit remain different states', () => {
  const notInterested = createCategoryGateRecord('not_interested')
  const skipped = createCategoryGateRecord('skip')
  const hardLimit = createCategoryGateRecord('hard_limit')
  assert.equal(categoryGateIsAnswered(notInterested), true)
  assert.equal(categoryGateIsAnswered(skipped), false)
  assert.equal(categoryGateIsAnswered(hardLimit), true)
  assert.equal(categoryGateBoundary(notInterested), null)
  assert.equal(categoryGateBoundary(skipped), null)
  assert.deepEqual(categoryGateBoundary(hardLimit), { level: 'hard_limit', scope: 'category' })
})

test('legacy category mini-questionnaire answers migrate into routing records and leave concept answers clean', () => {
  const raw = {
    'impact_play::overall': { willingness: 'hard_limit', boundary: 'hard_limit' },
    'toys_devices::overall': { preference: { fantasy: 'neutral' }, willingness: 'unsure' },
    'hand_spanking::receive': { preference: { fantasy: 'like_it' } },
  }
  const migrated = migrateLegacyCategoryGates(catalog, raw, {})
  assert.equal(migrated.categoryGates.impact_play.state, 'hard_limit')
  assert.equal(migrated.categoryGates.toys_devices.state, 'maybe')
  assert.ok(!('impact_play::overall' in migrated.answers))
  assert.ok(!('toys_devices::overall' in migrated.answers))
  assert.deepEqual(migrated.answers['hand_spanking::receive'], raw['hand_spanking::receive'])
})

test('an existing Plan 05 gate record wins over a legacy overall answer', () => {
  const migrated = migrateLegacyCategoryGates(
    catalog,
    { 'impact_play::overall': { willingness: 'hard_limit' } },
    { impact_play: { state: 'interested' } },
  )
  assert.equal(migrated.categoryGates.impact_play.state, 'interested')
})

test('legacy Detailed mode normalizes to Standard', () => {
  assert.equal(normalizeDepthMode('detailed'), 'standard')
  assert.equal(normalizeDepthMode('quick'), 'quick')
  assert.equal(normalizeDepthMode('exhaustive'), 'exhaustive')
  assert.equal(normalizeDepthMode('nonsense'), 'standard')
})

test('category routing data cannot contribute to concept scoring', () => {
  const answers = {
    'hand_spanking::receive': { preference: { fantasy: 'like_it' }, willingness: 'open_to_it' },
  }
  const before = buildResults(catalog, answers)
  const categoryGates = { impact_play: createCategoryGateRecord('hard_limit') }
  const after = buildResults(catalog, answers, categoryGates)
  assert.deepEqual(after.categoryStats, before.categoryStats)
  assert.deepEqual(after.topInterests.map((row) => row.key), before.topInterests.map((row) => row.key))
})
