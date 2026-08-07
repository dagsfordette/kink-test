import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  detailParentState,
  detailBranchDecision,
  fieldVisibleForBranch,
  normalizePreferenceMatrix,
  setPreferenceMatrixValue,
  countDetailResponses,
} from '../src/lib/adaptiveDetails.js'
import { buildResults } from '../src/lib/profile.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const catalog = JSON.parse(fs.readFileSync(path.join(here, '../src/data/catalog.json'), 'utf8'))
const profile = (id) => catalog.detailProfiles.find((item) => item.id === id)
const concept = (id) => catalog.concepts.find((item) => item.id === id)

test('Plan 04 parent states activate interested/open/unsure/fantasy-only branches', () => {
  assert.equal(detailParentState({ willingness: 'actively_want' }), 'strongly_interested')
  assert.equal(detailParentState({ willingness: 'interested_in_trying' }), 'interested')
  assert.equal(detailParentState({ willingness: 'open_to_it' }), 'open')
  assert.equal(detailParentState({ willingness: 'unsure' }), 'unsure')
  assert.equal(detailParentState({ willingness: 'fantasy_only' }), 'fantasy_only')
  for (const willingness of ['actively_want', 'interested_in_trying', 'open_to_it', 'unsure', 'fantasy_only']) {
    assert.equal(detailBranchDecision(catalog, { willingness }).open, true, willingness)
  }
})

test('not interested and hard limit collapse by default but manual override opens them', () => {
  for (const answer of [{ willingness: 'not_interested' }, { willingness: 'hard_limit' }, { boundary: 'hard_limit' }]) {
    const automatic = detailBranchDecision(catalog, answer, false)
    assert.equal(automatic.open, false)
    const manual = detailBranchDecision(catalog, answer, true)
    assert.equal(manual.open, true)
    assert.equal(manual.manualOverride, true)
  }
})

test('fantasy-only hides real-world implementation fields', () => {
  const decision = detailBranchDecision(catalog, { willingness: 'fantasy_only' })
  assert.equal(fieldVisibleForBranch({ relevance: 'both' }, decision), true)
  assert.equal(fieldVisibleForBranch({ relevance: 'fantasy' }, decision), true)
  assert.equal(fieldVisibleForBranch({ relevance: 'real_world' }, decision), false)
  const impact = profile('impact')
  assert.equal(fieldVisibleForBranch(impact.fields.find((field) => field.id === 'mark_preferences'), decision), false)
})

test('preference matrices preserve independent subtype states including hard limits', () => {
  let value = setPreferenceMatrixValue({}, 'buttocks', 'appealing')
  value = setPreferenceMatrixValue(value, 'face', 'hard_limit')
  value = setPreferenceMatrixValue(value, 'thighs', 'conditional')
  assert.deepEqual(value, { buttocks: 'appealing', face: 'hard_limit', thighs: 'conditional' })
  value = setPreferenceMatrixValue(value, 'buttocks', undefined)
  assert.deepEqual(value, { face: 'hard_limit', thighs: 'conditional' })
})

test('legacy multi-select detail arrays remain readable after a matrix migration', () => {
  assert.deepEqual(normalizePreferenceMatrix(['rope', 'cuffs']), { rope: 'appealing', cuffs: 'appealing' })
})

test('priority families use adaptive profiles with rich subtype matrices', () => {
  const required = ['impact', 'bondage', 'body_part_interest', 'material_interest', 'roleplay', 'emotion_self', 'emotion_partner', 'sexual_activity']
  for (const id of required) {
    const item = profile(id)
    assert.ok(item, id)
    assert.equal(item.priorityFamily, true, id)
    assert.equal(item.activationPolicy, 'adaptive_parent_state', id)
    assert.ok(item.fields.some((field) => field.type === 'preference_matrix'), id)
  }
})

test('body-part and material concepts use their semantic-specific migrated profiles', () => {
  for (const item of catalog.concepts.filter((row) => row.semanticType === 'body_part' && !row.tags?.includes('branch_gate'))) {
    assert.equal(item.detailProfileId, 'body_part_interest', item.id)
  }
  for (const item of catalog.concepts.filter((row) => row.semanticType === 'material' && !row.tags?.includes('branch_gate'))) {
    assert.equal(item.detailProfileId, 'material_interest', item.id)
  }
})

test('representative distinct interests remain first-class concepts', () => {
  for (const id of ['hand_spanking', 'paddling', 'flogging', 'cuffs', 'rope_bondage_general', 'feet_fetish', 'latex_rubber_fetish', 'doctor_patient_roleplay', 'oral_sex']) {
    const item = concept(id)
    assert.ok(item, id)
    assert.ok(!item.tags?.includes('branch_gate'), id)
  }
})

test('saved detail data remains counted even when the parent later collapses', () => {
  const answer = {
    willingness: 'not_interested',
    details: { body_area_preferences: { buttocks: 'appealing', face: 'hard_limit' }, impact_intensity: { preferred: 'light' } },
  }
  assert.equal(detailBranchDecision(catalog, answer).open, false)
  assert.equal(countDetailResponses(answer.details), 3)
  assert.deepEqual(answer.details.body_area_preferences, { buttocks: 'appealing', face: 'hard_limit' })
})

test('detail response states distinguish conditional/not-interested/hard-limit', () => {
  const ids = catalog.adaptiveDetailSystem.detailResponseStates.map((state) => state.id)
  assert.deepEqual(ids, ['appealing', 'acceptable', 'conditional', 'not_interested', 'hard_limit'])
  assert.notEqual(ids.indexOf('not_interested'), ids.indexOf('hard_limit'))
})


test('adaptive detail answers do not change Plan 01–03 scoring', () => {
  const base = { 'hand_spanking::give': { preference: { fantasy: 'like_it' } } }
  const detailed = { 'hand_spanking::give': { preference: { fantasy: 'like_it' }, details: { body_area_preferences: { buttocks: 'appealing', face: 'hard_limit' } } } }
  const a = buildResults(catalog, base)
  const b = buildResults(catalog, detailed)
  const aRow = a.records.find((row) => row.key === 'hand_spanking::give')
  const bRow = b.records.find((row) => row.key === 'hand_spanking::give')
  assert.equal(aRow.score, bRow.score)
  assert.equal(a.categoryStats.find((row) => row.id === 'impact_play').fantasy.index, b.categoryStats.find((row) => row.id === 'impact_play').fantasy.index)
  assert.equal(b.hardLimits.some((row) => row.key === 'hand_spanking::give'), false)
})
