import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildResults, questionDimensions, shouldExpandDetails, willingnessLabel } from '../src/lib/profile.js'
import { conceptsForCategory } from '../src/lib/taxonomy.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const catalog = JSON.parse(fs.readFileSync(path.join(here, '../src/data/catalog.json'), 'utf8'))
const concept = (id) => catalog.concepts.find((item) => item.id === id)

const requiredTypes = [
  'activity', 'role', 'dynamic', 'fantasy', 'stimulus', 'body_part', 'material',
  'emotion', 'setting', 'relationship_dynamic', 'device', 'communication_preference', 'risk_context',
]

test('Plan 03 semantic types and concept templates are explicit', () => {
  for (const type of requiredTypes) assert.ok(catalog.semanticTypes[type], type)
  for (const item of catalog.concepts) {
    assert.ok(catalog.semanticTypes[item.semanticType], item.id)
    assert.equal(item.questionModel?.template, item.semanticType, item.id)
    assert.ok(item.semanticTags.includes(`semantic:${item.semanticType}`), item.id)
  }
})

test('impossible transformation fantasies suppress physical experience questions', () => {
  for (const id of ['giant_tiny_fantasy', 'body_swap_fantasy', 'transformation_fantasy', 'doll_transformation_fantasy']) {
    const item = concept(id)
    assert.equal(item.semanticType, 'fantasy', id)
    const dimensions = questionDimensions(catalog, item)
    assert.equal(dimensions.experience, false, id)
    assert.equal(dimensions.experiencedPreference, false, id)
    assert.equal(dimensions.fantasyAppeal, true, id)
    assert.equal(dimensions.realWorldDesire, true, id)
  }
})

test('body-part, material, and stimulus concepts are not activity-shaped', () => {
  for (const id of ['feet_fetish', 'latex_rubber_fetish', 'scent_fetish']) {
    const item = concept(id)
    const dimensions = questionDimensions(catalog, item)
    assert.ok(['body_part', 'material', 'stimulus'].includes(item.semanticType), id)
    assert.equal(dimensions.experience, false, id)
    assert.equal(dimensions.experiencedPreference, false, id)
    assert.equal(dimensions.fantasyAppeal, true, id)
    assert.equal(dimensions.realWorldDesire, true, id)
    assert.equal(dimensions.boundary, true, id)
  }
})

test('activity and device concepts retain meaningful experience dimensions', () => {
  for (const id of ['hand_spanking', 'oral_sex', 'vibrators']) {
    const item = concept(id)
    const dimensions = questionDimensions(catalog, item)
    assert.equal(dimensions.experience, true, id)
    assert.equal(dimensions.experiencedPreference, true, id)
  }
})

test('fantasy appeal, real-world desire, willingness, experience, and boundary are separate storage constructs', () => {
  assert.equal(catalog.questionDimensions.fantasyAppeal.storagePath, 'preference.fantasy')
  assert.equal(catalog.questionDimensions.realWorldDesire.storagePath, 'preference.realWorld')
  assert.equal(catalog.questionDimensions.willingness.storagePath, 'willingness')
  assert.equal(catalog.questionDimensions.experience.storagePath, 'experience')
  assert.equal(catalog.questionDimensions.boundary.storagePath, 'boundary')
  assert.equal(new Set(Object.values(catalog.questionDimensions).map((item) => item.storagePath)).size, Object.keys(catalog.questionDimensions).length)
})

test('fantasy-only is a first-class willingness response', () => {
  const willingnessIds = catalog.scales.willingness.values.map((value) => value.id)
  assert.ok(willingnessIds.includes('fantasy_only'))
  assert.equal(willingnessLabel('fantasy_only'), 'Fantasy only')
  assert.equal(shouldExpandDetails({ willingness: 'fantasy_only' }), true)
})

test('legacy willingness values remain readable without entering the new response scale', () => {
  const willingnessIds = catalog.scales.willingness.values.map((value) => value.id)
  assert.equal(willingnessIds.includes('would_try'), false)
  assert.equal(willingnessLabel('would_try', false, 'activity'), 'Would try')
  assert.ok(catalog.scales.willingness.legacyValues.some((value) => value.id === 'would_try'))
})

test('hard limits remain boundaries rather than negative preference scores', () => {
  const answers = {
    'hand_spanking::give': {
      preference: { fantasy: 'love_it', realWorld: 'do_not_want' },
      willingness: 'hard_limit',
      boundary: 'hard_limit',
    },
  }
  const results = buildResults(catalog, answers)
  const row = results.records.find((record) => record.key === 'hand_spanking::give')
  assert.equal(row.score, 2)
  assert.ok(results.hardLimits.some((record) => record.key === row.key))
  assert.equal(results.topInterests.some((record) => record.key === row.key), false)
})

test('real-world desire remains separate from fantasy-interest aggregation', () => {
  const base = { 'hand_spanking::give': { preference: { fantasy: 'like_it' } } }
  const expanded = { 'hand_spanking::give': { preference: { fantasy: 'like_it', realWorld: 'strongly_want' }, willingness: 'actively_want' } }
  const baseResult = buildResults(catalog, base)
  const expandedResult = buildResults(catalog, expanded)
  assert.equal(baseResult.records[0].score, expandedResult.records[0].score)
  assert.equal(baseResult.categoryStats.find((row) => row.id === 'impact_play').fantasy.index, expandedResult.categoryStats.find((row) => row.id === 'impact_play').fantasy.index)
  assert.equal(baseResult.categoryStats.find((row) => row.id === 'impact_play').realWorld.answeredConcepts, 0)
  assert.equal(expandedResult.categoryStats.find((row) => row.id === 'impact_play').realWorld.label, 'Strong interest')
})

test('every directly questioned concept remains reachable in exhaustive navigation', () => {
  const reachable = new Set()
  for (const category of catalog.categories) {
    for (const item of conceptsForCategory(catalog, category.id)) reachable.add(item.id)
  }
  const expected = catalog.concepts.filter((item) => !item.tags?.includes('branch_gate') && catalog.semanticTypes[item.semanticType]?.directQuestioning !== false)
  assert.ok(expected.length > 500)
  for (const item of expected) assert.ok(reachable.has(item.id), item.id)
})
