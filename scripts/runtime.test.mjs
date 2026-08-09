import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createCategoryGateRecord, normalizeCategoryGates, normalizeDepthMode } from '../src/lib/depthModes.js'
import { normalizePreferenceMatrix } from '../src/lib/adaptiveDetails.js'
import { createResponsePayload, parseResponsePayload, RESPONSE_FORMAT } from '../src/lib/responseFormat.js'
import { buildResults, willingnessState } from '../src/lib/profile.js'

const catalog = JSON.parse(readFileSync(new URL('../src/data/catalog.json', import.meta.url), 'utf8'))

test('depth modes and category gates accept current states only', () => {
  assert.equal(normalizeDepthMode('quick'), 'quick')
  assert.equal(normalizeDepthMode('anything-old-or-invalid'), 'standard')
  assert.deepEqual(createCategoryGateRecord('hard_limit'), { state: 'hard_limit', boundary: { level: 'hard_limit', scope: 'category' } })
  assert.equal(createCategoryGateRecord('legacy_state'), undefined)
  assert.deepEqual(normalizeCategoryGates(catalog, { power_exchange: { state: 'interested' }, nope: { state: 'interested' } }), { power_exchange: { state: 'interested' } })
})

test('current response exports round-trip and old shapes are rejected instead of migrated', () => {
  const answers = {
    'giving_commands::give': { preference: { fantasy: 'like_it', realWorld: 'want' }, willingness: 'open_to_it', boundary: 'none' },
  }
  const payload = createResponsePayload(catalog, {
    settings: { mode: 'standard' },
    answers,
    categoryGates: { power_exchange: { state: 'interested' } },
  })
  assert.equal(payload.format, RESPONSE_FORMAT)
  assert.equal(payload.questionnaireVersion, catalog.questionnaire.version)
  assert.deepEqual(parseResponsePayload(catalog, payload).answers, answers)

  assert.throws(() => parseResponsePayload(catalog, { ...payload, questionnaireVersion: '0.0.0' }), /different questionnaire version/)
  assert.throws(() => parseResponsePayload(catalog, { ...payload, format: undefined }), /Unsupported exploration response format/)
  assert.throws(() => parseResponsePayload(catalog, { ...payload, answers: { 'receiving_commands::receive': { willingness: 'would_try' } } }), /Unsupported answer key/)
})

test('legacy willingness and detail-matrix values are not interpreted', () => {
  assert.equal(willingnessState('open_to_it'), 'open_to_it')
  assert.equal(willingnessState('would_try'), null)
  assert.deepEqual(normalizePreferenceMatrix(['old_option']), {})
})

test('results still separate interest, willingness, and hard limits', () => {
  const answers = {
    'giving_commands::give': { preference: { fantasy: 'love_it', realWorld: 'want' }, willingness: 'actively_want', boundary: 'none' },
    'giving_commands::receive': { preference: { fantasy: 'dislike_it', realWorld: 'do_not_want' }, willingness: 'hard_limit', boundary: 'hard_limit' },
  }
  const results = buildResults(catalog, answers, {})
  assert.equal(results.records.length, 2)
  assert.equal(results.hardLimits.length, 1)
  assert.equal(results.strongInterests.length, 1)
})
