import test from 'node:test'
import assert from 'node:assert/strict'
import catalog from '../src/data/catalog.json' with { type: 'json' }
import { buildResults } from '../src/lib/profile.js'
import { negotiationPreferenceSummary, setNegotiationField, toggleNegotiationOption } from '../src/lib/negotiation.js'
import { riskPromptsForConcept } from '../src/lib/risk.js'

const requiredRiskDomains = ['physical', 'medical', 'psychological', 'consent_complexity', 'privacy', 'digital_security', 'reputational', 'financial']
const concept = (id) => catalog.concepts.find((row) => row.id === id)

test('global negotiation setup is limited to broad communication, care, marks, and familiarity preferences', () => {
  const visibleSections = catalog.negotiationPreferencesModel.sections.filter((section) => !section.pretestOnly)
  const sections = new Map(visibleSections.map((section) => [section.id, section]))
  assert.deepEqual([...sections.keys()], ['communication', 'stop_checkin', 'aftercare', 'marks', 'partner_context'])
  assert.equal(sections.has('privacy'), false)

  const optionIds = (sectionId, fieldId) => sections.get(sectionId).fields.find((field) => field.id === fieldId).options.map((option) => option.id)
  for (const id of ['verbal_discussion', 'written_checklist', 'detailed_pre_negotiation', 'in_moment_checkins', 'minimal_interruption', 'no_particular_preference']) assert.ok(optionIds('communication', 'methods').includes(id), id)
  for (const id of ['safeword', 'traffic_light', 'ordinary_language', 'nonverbal_signals', 'context_dependent', 'no_particular_preference']) assert.ok(optionIds('stop_checkin', 'methods').includes(id), id)
  for (const id of ['physical_closeness', 'reassurance', 'water_food', 'quiet', 'space_alone', 'conversation', 'later_checkin', 'no_special_aftercare', 'no_particular_preference']) assert.ok(optionIds('aftercare', 'preferences').includes(id), id)

  assert.ok(sections.get('communication').fields[0].otherOption)
  assert.equal(sections.get('stop_checkin').fields[0].otherOption.label, 'Another agreed signal or method')
  assert.ok(sections.get('aftercare').fields[0].otherOption)
})

test('marks use separate duration and reusable area matrix dimensions', () => {
  const marks = catalog.negotiationPreferencesModel.sections.find((section) => section.id === 'marks')
  const duration = marks.fields.find((field) => field.id === 'maximum_duration')
  const matrix = marks.fields.find((field) => field.id === 'area_tolerance')
  assert.equal(duration.type, 'scale')
  assert.ok(duration.options.some((option) => option.id === 'permanent'))
  assert.ok(duration.options.some((option) => option.id === 'long_term'))
  assert.equal(matrix.type, 'matrix_scale')
  assert.deepEqual(matrix.scale.map((option) => option.id), ['none', 'light', 'moderate', 'heavy'])
  for (const row of ['face', 'neck', 'chest_torso', 'back', 'arms', 'hands', 'butt_hips', 'genitals', 'thighs', 'lower_legs_feet']) assert.ok(matrix.rows.some((item) => item.id === row), row)
  assert.equal(matrix.shortcut.value, 'none')
})

test('partner familiarity is an ordered minimum scale and does not contain fantasy-only', () => {
  const section = catalog.negotiationPreferencesModel.sections.find((row) => row.id === 'partner_context')
  const field = section.fields.find((row) => row.id === 'minimum_familiarity')
  assert.equal(field.type, 'scale')
  assert.deepEqual(field.options.map((option) => option.id), ['stranger_just_met', 'new_acquaintance', 'casual_partner', 'familiar_ongoing', 'established_partner', 'long_term_committed'])
  assert.equal(field.options.some((option) => option.id === 'fantasy_only'), false)
})

test('contextual recording topics contain identifiability, storage, access, live-viewing, and deletion qualifiers', () => {
  const exhibition = catalog.detailProfiles.find((profile) => profile.id === 'exhibition')
  const field = (id) => exhibition.fields.find((row) => row.id === id)
  for (const id of ['capture_modes', 'recording_identifiability', 'recording_storage', 'recording_access', 'recording_deletion', 'remote_camera_mode']) assert.ok(field(id), id)
  assert.ok(field('capture_modes').options.some((option) => option.id === 'audio'))
  assert.ok(field('capture_modes').options.some((option) => option.id === 'live_stream'))
  assert.ok(field('recording_access').options.some((option) => option.id === 'no_forwarding'))
})

test('exclusive and extensible general options do not erase unrelated sections or retain hidden Other text', () => {
  let preferences = {}
  preferences = toggleNegotiationOption(catalog, preferences, 'aftercare', 'preferences', 'reassurance')
  preferences = setNegotiationField(preferences, 'aftercare', 'preferences', { selected: ['reassurance', 'other'], otherText: 'Tea and a quiet walk' })
  preferences = setNegotiationField(preferences, 'marks', 'maximum_duration', 'day_or_two')
  preferences = toggleNegotiationOption(catalog, preferences, 'aftercare', 'preferences', 'no_special_aftercare')
  assert.deepEqual(preferences.aftercare.preferences, { selected: ['no_special_aftercare'], otherText: '' })
  assert.equal(preferences.marks.maximum_duration, 'day_or_two')
})

test('negotiation preferences appear in results but never change concept scoring', () => {
  const answers = {
    'hand_spanking::receive': { preference: { fantasy: 'like_it', realWorld: 'want' } },
    'paddling::receive': { preference: { fantasy: 'love_it', realWorld: 'strongly_want' } },
  }
  const preferences = {
    communication: { methods: { selected: ['written_checklist', 'in_moment_checkins'], otherText: '' } },
    aftercare: { preferences: { selected: ['quiet', 'later_checkin'], otherText: '' } },
    marks: { maximum_duration: 'day_or_two' },
    partner_context: { minimum_familiarity: 'established_partner' },
  }
  const before = buildResults(catalog, answers)
  const after = buildResults(catalog, answers, {}, preferences)
  assert.deepEqual(after.categoryStats, before.categoryStats)
  assert.deepEqual(after.topInterests.map((row) => row.key), before.topInterests.map((row) => row.key))
  assert.equal(after.negotiationPreferences.answeredFields, 4)
  assert.equal(after.negotiationPreferences.sections.some((section) => section.id === 'privacy'), false)
})

test('all concepts use descriptive riskDomains and the legacy riskLevel field is gone', () => {
  assert.deepEqual(Object.keys(catalog.riskDomains).sort(), [...requiredRiskDomains].sort())
  for (const item of catalog.concepts) {
    assert.ok(Array.isArray(item.riskDomains), item.id)
    assert.equal('riskLevel' in item, false, item.id)
    for (const domainId of item.riskDomains) assert.ok(requiredRiskDomains.includes(domainId), `${item.id}: ${domainId}`)
  }
  assert.equal(catalog.riskMigration.sourceField, 'riskLevel')
  assert.equal(catalog.riskMigration.removedFromConcepts, true)
})

test('digital and recording interests receive privacy/digital prompts, not unrelated financial prompts', () => {
  const item = concept('private_video')
  assert.ok(item.riskDomains.includes('privacy'))
  assert.ok(item.riskDomains.includes('digital_security'))
  const prompts = riskPromptsForConcept(catalog, item)
  const text = prompts.map((prompt) => prompt.text).join(' ')
  for (const word of ['storage', 'screenshots', 'identification', 'redistribution']) assert.match(text, new RegExp(word, 'i'))
  assert.ok(!prompts.some((prompt) => prompt.domains.includes('financial')))
})

test('financial dynamics get explicit financial-boundary guidance', () => {
  const item = concept('financial_domination')
  assert.ok(item.riskDomains.includes('financial'))
  const prompt = riskPromptsForConcept(catalog, item).find((row) => row.domains.includes('financial'))
  assert.match(prompt.text, /explicit financial limits and boundaries/i)
})

test('consent-complex fantasies emphasize prior negotiation and a stopping mechanism', () => {
  const item = concept('consensual_nonconsent_roleplay')
  assert.ok(item.riskDomains.includes('consent_complexity'))
  const prompt = riskPromptsForConcept(catalog, item).find((row) => row.domains.includes('consent_complexity'))
  assert.match(prompt.text, /prior negotiation/i)
  assert.match(prompt.text, /pause|stop/i)
})

test('physically higher-concern interests get high-level precaution language without procedural steps', () => {
  const item = concept('breath_restriction')
  assert.ok(item.riskDomains.includes('physical'))
  assert.ok(item.riskDomains.includes('medical'))
  const prompts = riskPromptsForConcept(catalog, item)
  assert.ok(prompts.every((prompt) => prompt.instructionLevel === 'high_level_non_procedural'))
  assert.match(prompts.map((prompt) => prompt.text).join(' '), /knowledge|precautions/i)
})

test('negotiation summary renders marks matrix, familiarity, and extensible other text', () => {
  const summary = negotiationPreferenceSummary(catalog, {
    communication: { methods: { selected: ['verbal_discussion', 'other'], otherText: 'Shared notes before meeting' } },
    marks: {
      maximum_duration: 'several_days',
      area_tolerance: { values: { face: 'none', neck: 'light', thighs: 'heavy' }, note: 'Discuss visible work events first' },
    },
    partner_context: { minimum_familiarity: 'established_partner' },
  })
  assert.ok(summary.sections.some((section) => section.id === 'communication'))
  assert.ok(summary.sections.some((section) => section.id === 'marks'))
  assert.ok(summary.sections.some((section) => section.id === 'partner_context'))
  const markValues = summary.sections.find((section) => section.id === 'marks').fields.flatMap((field) => field.values)
  assert.ok(markValues.includes('Face: None'))
  assert.ok(markValues.includes('Thighs: Heavy'))
  assert.ok(markValues.some((value) => value.includes('Discuss visible work events first')))
})
