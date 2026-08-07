import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadCatalog } from './catalog-audit-lib.mjs'
import { answerKey, buildResults } from '../src/lib/profile.js'
import {
  canonicalConceptId,
  categoriesByDomain,
  conceptsForCategory,
  discoverableCategoryIds,
  primaryCategoryId,
} from '../src/lib/taxonomy.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const catalog = loadCatalog(path.join(here, '../src/data/catalog.json'))

test('taxonomy defines exactly eight navigation domains', () => {
  assert.equal(catalog.domains.length, 8)
  assert.equal(new Set(catalog.domains.map((domain) => domain.id)).size, 8)
})

test('every category belongs to exactly one defined domain', () => {
  const domainIds = new Set(catalog.domains.map((domain) => domain.id))
  for (const category of catalog.categories) assert.ok(domainIds.has(category.domainId), category.id)
  const grouped = categoriesByDomain(catalog)
  assert.equal(Object.values(grouped).flat().length, catalog.categories.length)
})

test('every concept declares stable canonical ownership metadata', () => {
  const categoryIds = new Set(catalog.categories.map((category) => category.id))
  const domainIds = new Set(catalog.domains.map((domain) => domain.id))
  for (const concept of catalog.concepts) {
    assert.equal(canonicalConceptId(concept), concept.id)
    assert.ok(categoryIds.has(primaryCategoryId(concept)), concept.id)
    assert.ok(domainIds.has(concept.domain), concept.id)
    assert.deepEqual(concept.categoryIds, [concept.primaryCategory, ...concept.relatedCategories])
    assert.ok(Array.isArray(concept.semanticTags) && concept.semanticTags.length >= 3, concept.id)
  }
})

test('related-category discovery reuses the same canonical answer identity', () => {
  const concept = catalog.concepts.find((item) => item.id === 'service_submission')
  assert.ok(concept)
  assert.ok(discoverableCategoryIds(concept).includes('service_protocol'))
  assert.ok(discoverableCategoryIds(concept).includes('power_exchange'))
  assert.ok(conceptsForCategory(catalog, 'service_protocol').some((item) => item.id === concept.id))
  assert.ok(conceptsForCategory(catalog, 'power_exchange').some((item) => item.id === concept.id))
  assert.equal(canonicalConceptId(concept), 'service_submission')
})

test('remote and observation overlap now uses cross-category references', () => {
  for (const id of ['video_call_play', 'remote_observation', 'photo_exchange_private', 'video_exchange_private', 'remote_camera_play']) {
    const concept = catalog.concepts.find((item) => item.id === id)
    assert.ok(concept, id)
    assert.ok(discoverableCategoryIds(concept).includes('remote_digital'), `${id} missing remote_digital`)
    assert.ok(discoverableCategoryIds(concept).includes('exhibition_observation'), `${id} missing exhibition_observation`)
  }
})

test('exhaustive category navigation still reaches every directly questioned non-gate concept', () => {
  const discoverable = new Set(catalog.categories.flatMap((category) => conceptsForCategory(catalog, category.id).map((concept) => concept.id)))
  const expected = catalog.concepts.filter((concept) => !concept.tags?.includes('branch_gate') && catalog.semanticTypes?.[concept.semanticType]?.directQuestioning !== false)
  assert.equal(discoverable.size, expected.length)
  for (const concept of expected) assert.ok(discoverable.has(concept.id), concept.id)
})

test('taxonomy remains stable while later plans may append canonical concepts', () => {
  assert.equal(catalog.concepts.length, 594)
  assert.equal(catalog.categories.length, 32)
  assert.equal(new Set(catalog.concepts.map((concept) => concept.id)).size, 594)
})


test('cross-listing does not change primary category scoring ownership', () => {
  const concept = catalog.concepts.find((item) => item.id === 'service_submission')
  assert.ok(concept.relatedCategories.includes('power_exchange'))
  const perspective = concept.perspectives[0]
  const results = buildResults(catalog, {
    [answerKey(concept.id, perspective)]: { preference: { fantasy: 'love_it' } },
  })
  assert.ok(results.categoryStats.some((row) => row.id === concept.primaryCategory && row.answered === 1))
  assert.ok(!results.categoryStats.some((row) => row.id === 'power_exchange'))
})
