import test from 'node:test'
import assert from 'node:assert/strict'
import catalog from '../src/data/catalog.json' with { type: 'json' }
import { createResponsePayload, normalizeResponsePayload, RESPONSE_FORMAT, RESPONSE_SCHEMA_VERSION } from '../src/lib/responseFormat.js'

test('current response exports are explicitly versioned and round-trip without reinterpretation', () => {
  const source = {
    settings: { mode: 'exhaustive' },
    answers: { 'hand_spanking::receive': { preference: { fantasy: 'like_it' }, willingness: 'open_to_it' } },
    categoryGates: { impact_play: { state: 'interested' } },
    negotiationPreferences: { communication_style: 'direct' },
  }
  const payload = createResponsePayload(catalog, { ...source, exportedAt: '2026-08-08T00:00:00.000Z' })
  assert.equal(payload.format, RESPONSE_FORMAT)
  assert.equal(payload.schemaVersion, RESPONSE_SCHEMA_VERSION)
  assert.equal(payload.questionnaireId, catalog.questionnaire.id)
  const normalized = normalizeResponsePayload(catalog, payload)
  assert.deepEqual(normalized.answers, source.answers)
  assert.deepEqual(normalized.categoryGates, source.categoryGates)
  assert.equal(normalized.settings.mode, 'exhaustive')
})

test('legacy Detailed mode and category overall records migrate on import', () => {
  const normalized = normalizeResponsePayload(catalog, {
    questionnaireId: catalog.questionnaire.id,
    settings: { mode: 'detailed' },
    answers: {
      'impact_play::overall': { willingness: 'hard_limit', boundary: 'hard_limit' },
      'hand_spanking::receive': { preference: { fantasy: 'like_it' } },
    },
  })
  assert.equal(normalized.settings.mode, 'standard')
  assert.equal(normalized.categoryGates.impact_play.state, 'hard_limit')
  assert.ok(!('impact_play::overall' in normalized.answers))
  assert.ok(normalized.answers['hand_spanking::receive'])
})

test('legacy renamed concept keys migrate without overwriting the canonical answer', () => {
  const normalized = normalizeResponsePayload(catalog, {
    questionnaireId: catalog.questionnaire.id,
    answers: {
      'oral_giving::give': { preference: { fantasy: 'like_it' } },
      'oral_sex::give': { preference: { fantasy: 'love_it' } },
    },
  })
  assert.equal(normalized.answers['oral_sex::give'].preference.fantasy, 'love_it')
  assert.ok(!('oral_giving::give' in normalized.answers))
})

test('unversioned compatible exports remain readable', () => {
  const normalized = normalizeResponsePayload(catalog, { questionnaireId: catalog.questionnaire.id, answers: {} })
  assert.equal(normalized.sourceSchemaVersion, 'legacy/unversioned')
})

test('imports reject a different questionnaire and malformed answer maps', () => {
  assert.throws(() => normalizeResponsePayload(catalog, { questionnaireId: 'other', answers: {} }), /different questionnaire/i)
  assert.throws(() => normalizeResponsePayload(catalog, { questionnaireId: catalog.questionnaire.id, answers: [] }), /valid answer map/i)
})
