import test from 'node:test'
import assert from 'node:assert/strict'
import catalog from '../src/data/catalog.json' with { type: 'json' }
import { compareResponses, compatibilityStateLabels } from '../src/lib/compatibility.js'

const strong = { preference: { fantasy: 'love_it', realWorld: 'strongly_want' }, willingness: 'actively_want' }

test('partner comparison uses named interaction states and no overall percentage', () => {
  const comparison = compareResponses(catalog, { answers: { 'oral_sex::give': strong } }, { answers: { 'oral_sex::receive': strong } })
  assert.ok(comparison.rows.some((row) => row.conceptId === 'oral_sex' && row.state === 'strong_directional_match'))
  assert.equal('percentage' in comparison, false)
  assert.equal('score' in comparison, false)
  assert.match(comparison.note, /No overall compatibility percentage/i)
  for (const state of Object.keys(compatibilityStateLabels)) assert.equal(typeof comparison.counts[state], 'number')
})

test('matching mutual perspectives classify as shared mutual interest', () => {
  const comparison = compareResponses(catalog, { answers: { 'partner_watches::mutual': strong } }, { answers: { 'partner_watches::mutual': strong } })
  assert.ok(comparison.rows.some((row) => row.conceptId === 'partner_watches' && row.state === 'shared_mutual_interest'))
})

test('hard limits override otherwise strong directional matches', () => {
  const comparison = compareResponses(catalog,
    { answers: { 'oral_sex::give': strong } },
    { answers: { 'oral_sex::receive': { ...strong, boundary: 'hard_limit', willingness: 'hard_limit' } } },
  )
  const row = comparison.rows.find((item) => item.conceptId === 'oral_sex' && item.leftPerspective === 'give')
  assert.equal(row.state, 'hard_limit_conflict')
  assert.ok(comparison.hardLimitConflicts.includes(row))
})

test('category hard limits override positive concept interest in that area', () => {
  const comparison = compareResponses(catalog,
    { answers: {}, categoryGates: { impact_play: { state: 'hard_limit' } } },
    { answers: { 'hand_spanking::receive': strong } },
  )
  assert.ok(comparison.hardLimitConflicts.some((row) => row.scope === 'category' && row.categoryId === 'impact_play'))
})

test('fantasy-only versus real-world desire is classified separately', () => {
  const comparison = compareResponses(catalog,
    { answers: { 'oral_sex::give': { preference: { fantasy: 'love_it', realWorld: 'do_not_want' }, willingness: 'fantasy_only' } } },
    { answers: { 'oral_sex::receive': strong } },
  )
  assert.ok(comparison.rows.some((row) => row.conceptId === 'oral_sex' && row.state === 'fantasy_real_world_mismatch'))
})

test('conditional answers remain discussion conditions rather than hard-limit conflicts', () => {
  const comparison = compareResponses(catalog,
    { answers: { 'oral_sex::give': { ...strong, boundary: 'conditional' } } },
    { answers: { 'oral_sex::receive': strong } },
  )
  assert.ok(comparison.rows.some((row) => row.conceptId === 'oral_sex' && row.state === 'conditional_match'))
})

test('subtype hard limits override a positive paired concept when the same subtype is desired', () => {
  const left = { ...strong, details: { body_area_preferences: { face: 'hard_limit' } } }
  const right = { ...strong, details: { body_area_preferences: { face: 'appealing' } } }
  const comparison = compareResponses(catalog, { answers: { 'hand_spanking::give': left } }, { answers: { 'hand_spanking::receive': right } })
  const row = comparison.rows.find((item) => item.conceptId === 'hand_spanking' && item.leftPerspective === 'give')
  assert.equal(row.state, 'hard_limit_conflict')
  assert.equal(row.detailConflicts[0].optionId, 'face')
})
