import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compareResponses, comparisonStateLabels } from '../src/lib/partnerComparison.js'

const catalog = JSON.parse(readFileSync(new URL('../src/data/catalog.json', import.meta.url), 'utf8'))

test('partner comparison uses named interaction states', () => {
  const left = { answers: { 'giving_commands::give': { preference: { realWorld: 'want' }, willingness: 'actively_want', boundary: 'none' } } }
  const right = { answers: { 'giving_commands::receive': { preference: { realWorld: 'want' }, willingness: 'actively_want', boundary: 'none' } } }
  const comparison = compareResponses(catalog, left, right)
  assert.equal(comparison.counts.strong_directional_match, 1)
  assert.match(comparison.note, /No overall compatibility percentage/i)
  assert.equal(comparisonStateLabels.strong_directional_match, 'Strong directional match')
})

test('hard limits take precedence in comparison', () => {
  const left = { answers: { 'giving_commands::give': { preference: { realWorld: 'want' }, willingness: 'actively_want', boundary: 'none' } } }
  const right = { answers: { 'giving_commands::receive': { preference: { realWorld: 'do_not_want' }, willingness: 'hard_limit', boundary: 'hard_limit' } } }
  const comparison = compareResponses(catalog, left, right)
  assert.equal(comparison.counts.hard_limit_conflict, 1)
})
