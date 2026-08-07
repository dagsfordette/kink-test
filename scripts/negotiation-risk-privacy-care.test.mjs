import test from 'node:test'
import assert from 'node:assert/strict'
import catalog from '../src/data/catalog.json' with { type: 'json' }
import { buildResults } from '../src/lib/profile.js'
import { negotiationPreferenceSummary, setNegotiationField, toggleNegotiationOption } from '../src/lib/negotiation.js'
import { riskPromptsForConcept } from '../src/lib/risk.js'

const requiredRiskDomains = ['physical', 'medical', 'psychological', 'consent_complexity', 'privacy', 'digital_security', 'reputational', 'financial']
const concept = (id) => catalog.concepts.find((row) => row.id === id)

test('Plan 07 general negotiation profile covers communication, stopping, aftercare, marks, privacy, and partner context', () => {
  const visibleSections = catalog.negotiationPreferencesModel.sections.filter((section) => !section.pretestOnly)
  const sections = new Map(visibleSections.map((section) => [section.id, section]))
  assert.deepEqual([...sections.keys()], ['communication', 'stop_checkin', 'aftercare', 'marks', 'privacy', 'partner_context'])
  const attraction = catalog.negotiationPreferencesModel.sections.find((section) => section.id === 'attraction_profile')
  assert.equal(attraction?.pretestOnly, true)
  assert.ok(attraction?.fields.some((field) => field.id === 'partner_gender'))
  assert.ok(attraction?.fields.some((field) => field.id === 'partner_anatomy'))
  const optionIds = (sectionId, fieldId) => sections.get(sectionId).fields.find((field) => field.id === fieldId).options.map((option) => option.id)
  for (const id of ['verbal_discussion', 'written_checklist', 'detailed_pre_negotiation', 'in_moment_checkins', 'minimal_interruption']) assert.ok(optionIds('communication', 'methods').includes(id), id)
  for (const id of ['safeword', 'traffic_light', 'ordinary_language', 'nonverbal_signals', 'context_dependent']) assert.ok(optionIds('stop_checkin', 'methods').includes(id), id)
  for (const id of ['physical_closeness', 'reassurance', 'water_food', 'quiet', 'space_alone', 'conversation', 'later_checkin', 'no_special_aftercare']) assert.ok(optionIds('aftercare', 'preferences').includes(id), id)
  assert.ok(optionIds('privacy', 'recording').includes('no_photos_video'))
  assert.ok(optionIds('privacy', 'recording').includes('photos_ok'))
  assert.ok(optionIds('privacy', 'recording').includes('video_ok'))
  assert.ok(optionIds('privacy', 'identification').includes('face_excluded'))
  for (const id of ['trusted_partner', 'established_partner', 'casual_partner', 'context_dependent', 'fantasy_only']) assert.ok(optionIds('partner_context', 'contexts').includes(id), id)
})

test('exclusive general options do not erase unrelated sections', () => {
  let preferences = {}
  preferences = toggleNegotiationOption(catalog, preferences, 'aftercare', 'preferences', 'reassurance')
  preferences = setNegotiationField(preferences, 'privacy', 'recording', 'no_photos_video')
  preferences = toggleNegotiationOption(catalog, preferences, 'aftercare', 'preferences', 'no_special_aftercare')
  assert.deepEqual(preferences.aftercare.preferences, ['no_special_aftercare'])
  assert.equal(preferences.privacy.recording, 'no_photos_video')
})

test('negotiation preferences appear in results but never change concept scoring', () => {
  const answers = {
    'hand_spanking::receive': { preference: { fantasy: 'like_it', realWorld: 'want' } },
    'paddling::receive': { preference: { fantasy: 'love_it', realWorld: 'strongly_want' } },
  }
  const preferences = {
    communication: { methods: ['written_checklist', 'in_moment_checkins'] },
    aftercare: { preferences: ['quiet', 'later_checkin'] },
    privacy: { recording: 'no_photos_video', identification: 'face_excluded' },
  }
  const before = buildResults(catalog, answers)
  const after = buildResults(catalog, answers, {}, preferences)
  assert.deepEqual(after.categoryStats, before.categoryStats)
  assert.deepEqual(after.topInterests.map((row) => row.key), before.topInterests.map((row) => row.key))
  assert.equal(after.negotiationPreferences.answeredFields, 4)
  assert.ok(after.negotiationPreferences.sections.some((section) => section.id === 'privacy'))
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

test('negotiation summary keeps marks/privacy/aftercare visible as separate result fields', () => {
  const summary = negotiationPreferenceSummary(catalog, {
    aftercare: { preferences: ['physical_closeness', 'water_food'] },
    marks: { visibility: 'no_visible_marks', location_restrictions: 'No face or neck marks' },
    privacy: { recording: 'photos_ok', identification: 'face_excluded', deletion_expectations: 'delete_by_agreed_time' },
  })
  assert.ok(summary.sections.some((section) => section.id === 'aftercare'))
  assert.ok(summary.sections.some((section) => section.id === 'marks'))
  assert.ok(summary.sections.some((section) => section.id === 'privacy'))
  assert.ok(summary.sections.find((section) => section.id === 'marks').fields.some((field) => field.values.includes('No face or neck marks')))
})
