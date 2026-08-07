import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import catalog from '../src/data/catalog.json' with { type: 'json' }
import { buildResults } from '../src/lib/profile.js'

const fixtureFile = JSON.parse(fs.readFileSync(new URL('../fixtures/regression-fixtures.json', import.meta.url), 'utf8'))

test('Plan 09 ships all eight representative regression personas', () => {
  assert.deepEqual(fixtureFile.fixtures.map((row) => row.id), [
    'broad_enthusiast','mostly_vanilla','fantasy_heavy_reality_light','dominant_giver','submissive_receiver','switch','many_hard_limits','highly_conditional',
  ])
})

for (const fixture of fixtureFile.fixtures) {
  test(`regression fixture: ${fixture.label}`, () => {
    const results = buildResults(catalog, fixture.answers, fixture.categoryGates || {}, fixture.negotiationPreferences || {})
    const expected = fixture.expected || {}
    if (expected.minStrongInterests !== undefined) assert.ok(results.strongInterests.length >= expected.minStrongInterests)
    if (expected.conceptHardLimits !== undefined) assert.equal(results.hardLimits.length, expected.conceptHardLimits)
    if (expected.minConceptHardLimits !== undefined) assert.ok(results.hardLimits.length >= expected.minConceptHardLimits)
    if (expected.minCategoryHardLimits !== undefined) assert.ok(results.categoryHardLimits.length >= expected.minCategoryHardLimits)
    if (expected.minFantasyOnly !== undefined) assert.ok(results.fantasyOnlyInterests.length >= expected.minFantasyOnly)
    if (expected.containsNotInterested) for (const id of expected.containsNotInterested) assert.ok(results.notInterested.some((row) => row.concept.id === id), id)
    if (expected.asymmetryConcepts) for (const id of expected.asymmetryConcepts) assert.ok(results.asymmetries.some((row) => row.conceptId === id), id)
    if (expected.maxAsymmetryCount !== undefined) assert.ok(results.asymmetries.length <= expected.maxAsymmetryCount)
    if (expected.minConditionalInterests !== undefined) assert.ok(results.conditionalInterests.length >= expected.minConditionalInterests)
    if (expected.minDetailHardLimits !== undefined) assert.ok(results.detailHardLimits.length >= expected.minDetailHardLimits)
  })
}
