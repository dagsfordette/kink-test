import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { validateCatalog } from './catalog-validation.mjs'

const catalog = JSON.parse(readFileSync(new URL('../src/data/catalog.json', import.meta.url), 'utf8'))

test('current catalog is internally consistent', () => {
  assert.deepEqual(validateCatalog(catalog), [])
})

test('catalog contains no migration or compatibility scaffolding', () => {
  const text = JSON.stringify(catalog)
  for (const removedKey of ['semanticMigration', 'riskMigration', 'contentExpansion', 'editorialModel', 'legacyValues', 'canonicalId', 'categoryIds']) {
    assert.equal(text.includes(`\"${removedKey}\"`), false, `${removedKey} should not be present`)
  }
  assert.equal(catalog.concepts.some((concept) => concept.directQuestioning === false || concept.tags?.includes('branch_gate')), false)
})

test('every current concept is reachable through exhaustive navigation', () => {
  const reachable = new Set(catalog.categories.flatMap((category) => category.depthConceptIds.exhaustive))
  assert.equal(reachable.size, catalog.concepts.length)
  for (const concept of catalog.concepts) assert.ok(reachable.has(concept.id), concept.id)
})
