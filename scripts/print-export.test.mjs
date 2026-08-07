import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import catalog from '../src/data/catalog.json' with { type: 'json' }
import { createResponsePayload, normalizeResponsePayload } from '../src/lib/responseFormat.js'

test('JSON export/import preserves boundaries, conditions, category gates, and negotiation preferences', () => {
  const source = {
    settings: { mode: 'standard' },
    answers: {
      'hand_spanking::receive': { boundary: 'conditional', willingness: 'open_to_it', details: { body_area_preferences: { face: 'hard_limit', thighs: 'conditional' } } },
    },
    categoryGates: { medical_edge: { state: 'hard_limit' } },
    negotiationPreferences: { privacy_recording: 'no_recording' },
  }
  const payload = createResponsePayload(catalog, source)
  const restored = normalizeResponsePayload(catalog, payload)
  assert.deepEqual(restored.answers, source.answers)
  assert.equal(restored.categoryGates.medical_edge.state, 'hard_limit')
  assert.deepEqual(restored.categoryGates.medical_edge.boundary, { level: 'hard_limit', scope: 'category' })
})

test('print report source retains every release-critical result section', () => {
  const source = fs.readFileSync(new URL('../src/components/PrintReport.jsx', import.meta.url), 'utf8')
  for (const heading of ['Negotiation, privacy & care preferences','Domain overview','Category overview','Fantasy-only interests','Conditional interests','Concept hard limits','Detailed hard limits','Category-wide hard limits','Perspective-level answered items','Areas with insufficient data']) {
    assert.match(source, new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), heading)
  }
})
