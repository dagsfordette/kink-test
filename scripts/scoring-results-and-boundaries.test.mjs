import test from 'node:test'
import assert from 'node:assert/strict'
import catalog from '../src/data/catalog.json' with { type: 'json' }
import { buildResults, normalizeWillingnessForResults } from '../src/lib/profile.js'

function category(results, id) {
  return results.categoryStats.find((row) => row.id === id)
}

test('Plan 06 catalog declares concept-aware aggregation and separate result dimensions', () => {
  assert.equal(catalog.resultsModel.version, '2.0.0')
  assert.deepEqual(catalog.resultsModel.aggregationOrder, ['perspective', 'concept', 'category', 'domain'])
  assert.equal(catalog.resultsModel.defaultCategoryWeighting, 'equal_concept')
  assert.equal(catalog.resultsModel.hardLimitsInPreferenceAverages, false)
  for (const id of ['fantasy_interest', 'real_world_interest', 'experience', 'willingness', 'perspective', 'conditions', 'boundaries']) {
    assert.ok(catalog.resultsModel.dimensions.includes(id), id)
  }
})

test('multi-perspective concepts do not outweigh single-perspective concepts', () => {
  const results = buildResults(catalog, {
    'permission_protocol::as_dominant': { preference: { fantasy: 'love_it' } },
    'permission_protocol::as_submissive': { preference: { fantasy: 'love_it' } },
    'dominance::as_dominant': { preference: { fantasy: 'hate_it' } },
  })
  const power = category(results, 'power_exchange')
  assert.equal(power.fantasy.answeredConcepts, 2)
  assert.equal(power.fantasy.average, 0)
  assert.equal(power.fantasy.index, 50)
})

test('semantically equivalent concept answers keep the same category weight regardless of perspective record count', () => {
  const onePerspective = buildResults(catalog, {
    'permission_protocol::as_dominant': { preference: { fantasy: 'love_it' } },
    'dominance::as_dominant': { preference: { fantasy: 'hate_it' } },
  })
  const twoPerspectives = buildResults(catalog, {
    'permission_protocol::as_dominant': { preference: { fantasy: 'love_it' } },
    'permission_protocol::as_submissive': { preference: { fantasy: 'love_it' } },
    'dominance::as_dominant': { preference: { fantasy: 'hate_it' } },
  })
  assert.equal(category(onePerspective, 'power_exchange').fantasy.average, category(twoPerspectives, 'power_exchange').fantasy.average)
})

test('perspective data remains visible as sub-results after concept aggregation', () => {
  const results = buildResults(catalog, {
    'permission_protocol::as_dominant': { preference: { fantasy: 'love_it' } },
    'permission_protocol::as_submissive': { preference: { fantasy: 'dislike_it' } },
  })
  const perspectives = new Set(results.perspectiveStats.map((row) => row.perspective))
  assert.ok(perspectives.has('as_dominant'))
  assert.ok(perspectives.has('as_submissive'))
  assert.equal(results.conceptResults.find((row) => row.conceptId === 'permission_protocol').answeredPerspectives, 2)
})

test('hard limits are surfaced separately and never converted into negative preference points', () => {
  const results = buildResults(catalog, {
    'hand_spanking::receive': { preference: { fantasy: 'love_it' }, boundary: 'hard_limit', willingness: 'hard_limit' },
  })
  const impact = category(results, 'impact_play')
  assert.equal(impact.fantasy.average, 2)
  assert.equal(impact.fantasy.label, 'Strong interest')
  assert.equal(results.hardLimits.length, 1)
  assert.equal(results.strongInterests.length, 0)
})

test('a hard limit without an interest answer does not create a low interest score', () => {
  const results = buildResults(catalog, {
    'hand_spanking::receive': { boundary: 'hard_limit', willingness: 'hard_limit' },
  })
  const impact = category(results, 'impact_play')
  assert.equal(impact.fantasy.answeredConcepts, 0)
  assert.equal(impact.fantasy.average, null)
  assert.equal(impact.fantasy.label, 'Insufficient data')
})

test('fantasy and real-world interest can point in opposite directions without being collapsed', () => {
  const results = buildResults(catalog, {
    'hand_spanking::receive': { preference: { fantasy: 'love_it', realWorld: 'do_not_want' }, willingness: 'fantasy_only' },
  })
  const impact = category(results, 'impact_play')
  assert.equal(impact.fantasy.label, 'Strong interest')
  assert.equal(impact.realWorld.label, 'Strong disinterest')
  assert.equal(results.fantasyOnlyInterests.length, 1)
})

test('category-wide hard limits remain separate from concept hard limits and scoring', () => {
  const answers = { 'hand_spanking::receive': { preference: { fantasy: 'like_it' } } }
  const withoutGate = buildResults(catalog, answers)
  const withGate = buildResults(catalog, answers, { impact_play: { state: 'hard_limit', boundary: { level: 'hard_limit', scope: 'category' } } })
  assert.equal(category(withoutGate, 'impact_play').fantasy.average, category(withGate, 'impact_play').fantasy.average)
  assert.equal(withGate.hardLimits.length, 0)
  assert.deepEqual(withGate.categoryHardLimits.map((row) => row.categoryId), ['impact_play'])
})

test('giving/receiving asymmetries are preserved as meaningful result rows', () => {
  const results = buildResults(catalog, {
    'oral_sex::give': { preference: { fantasy: 'love_it', realWorld: 'strongly_want' }, willingness: 'actively_want' },
    'oral_sex::receive': { preference: { fantasy: 'hate_it', realWorld: 'do_not_want' }, willingness: 'not_interested' },
  })
  assert.ok(results.asymmetries.some((row) => row.conceptId === 'oral_sex' && row.dimension === 'fantasy'))
  assert.ok(results.asymmetries.some((row) => row.conceptId === 'oral_sex' && row.dimension === 'realWorld'))
})

test('conditional detail states and subtype hard limits are surfaced independently', () => {
  const results = buildResults(catalog, {
    'hand_spanking::receive': {
      preference: { fantasy: 'like_it' },
      details: { body_area_preferences: { face: 'conditional', feet: 'hard_limit' } },
    },
  })
  assert.ok(results.conditionalInterests.some((row) => row.key === 'hand_spanking::receive'))
  assert.ok(results.detailHardLimits.some((row) => row.record.key === 'hand_spanking::receive' && row.optionId === 'feet'))
  assert.ok(results.commonConditions.some((row) => row.optionId === 'face'))
  assert.equal(results.hardLimits.length, 0)
})

test('legacy willingness values normalize for results without rewriting saved answers', () => {
  const answer = { preference: { fantasy: 'like_it' }, willingness: 'would_try' }
  const results = buildResults(catalog, { 'hand_spanking::receive': answer })
  const row = results.records[0]
  assert.equal(normalizeWillingnessForResults('would_try'), 'open_to_it')
  assert.equal(row.willingnessState, 'open_to_it')
  assert.equal(row.answer.willingness, 'would_try')
  assert.ok(results.curiosities.some((item) => item.key === row.key))
})

test('not interested remains distinct from hard limit, skipped, and unanswered states', () => {
  const results = buildResults(catalog, {
    'hand_spanking::receive': { willingness: 'not_interested' },
  }, { bondage_restraint: { state: 'skip' } })
  assert.equal(results.notInterested.length, 1)
  assert.equal(results.hardLimits.length, 0)
  assert.equal(results.categoryHardLimits.length, 0)
  assert.ok(results.insufficientData.some((row) => row.id === 'bondage_restraint' && row.gateState === 'skip'))
})

test('qualitative labels are primary while the numeric index remains compatibility-only metadata', () => {
  assert.equal(catalog.resultsModel.internalIndex.shownAsPrimaryResult, false)
  const results = buildResults(catalog, {
    'hand_spanking::receive': { preference: { fantasy: 'like_it' } },
    'paddling::receive': { preference: { fantasy: 'love_it' } },
  })
  const impact = category(results, 'impact_play')
  assert.equal(impact.fantasy.label, 'Strong interest')
  assert.equal(typeof impact.fantasy.index, 'number')
})
