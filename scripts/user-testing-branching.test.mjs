import test from 'node:test'
import assert from 'node:assert/strict'
import catalog from '../src/data/catalog.json' with { type: 'json' }
import { detailBranchDecision, detailProfileFor, fieldVisibleForBranch } from '../src/lib/adaptiveDetails.js'
import { conceptsForCategory } from '../src/lib/taxonomy.js'
import { conceptsForDepth } from '../src/lib/depthModes.js'

function activeFields(profile, decision) {
  if (!profile || !decision.open) return []
  return (profile.fields || []).filter((field) => fieldVisibleForBranch(field, decision))
}

test('default branching suppresses irrelevant detail after not-interested and hard-limit answers', () => {
  let suppressed = 0
  let eligible = 0
  for (const concept of catalog.concepts) {
    for (const perspective of concept.perspectives || ['overall']) {
      const profile = detailProfileFor(catalog, concept, perspective)
      if (!profile) continue
      eligible += (profile.fields || []).filter((field) => !field.deprecated).length
      suppressed += (profile.fields || []).filter((field) => !field.deprecated).length - activeFields(profile, detailBranchDecision(catalog, { willingness: 'not_interested' })).length
    }
  }
  assert.ok(eligible > 1000, 'the structural measurement should cover a large set of possible detail prompts')
  assert.equal(suppressed, eligible, 'not-interested answers should collapse all descendant detail by default')
})

test('manual override restores detail access after a collapsed parent state', () => {
  const concept = catalog.concepts.find((row) => row.id === 'hand_spanking')
  const profile = detailProfileFor(catalog, concept, 'receive')
  const automatic = activeFields(profile, detailBranchDecision(catalog, { willingness: 'hard_limit' }, false))
  const manual = activeFields(profile, detailBranchDecision(catalog, { willingness: 'hard_limit' }, true))
  assert.equal(automatic.length, 0)
  assert.ok(manual.length > 0)
})

test('fantasy-only keeps expressive refinements while hiding implementation-only detail', () => {
  const concept = catalog.concepts.find((row) => row.id === 'hand_spanking')
  const profile = detailProfileFor(catalog, concept, 'receive')
  const fantasy = activeFields(profile, detailBranchDecision(catalog, { willingness: 'fantasy_only' }))
  assert.ok(fantasy.length > 0)
  assert.ok(fantasy.every((field) => (field.relevance || 'both') !== 'real_world'))
  assert.ok((profile.fields || []).some((field) => field.relevance === 'real_world'))
})

test('uncommon preferences remain expressible through exhaustive routing even when Quick omits them', () => {
  const category = catalog.categories.find((row) => row.id === 'medical_edge')
  const concepts = conceptsForCategory(catalog, category.id)
  const quick = new Set(conceptsForDepth(category, concepts, 'quick').map((row) => row.id))
  const exhaustive = new Set(conceptsForDepth(category, concepts, 'exhaustive').map((row) => row.id))
  assert.equal(quick.has('needle_play'), false)
  assert.equal(exhaustive.has('needle_play'), true)
})
