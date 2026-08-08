import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'src/data/catalog.json'), 'utf8'))
const auditText = fs.readFileSync(path.join(root, 'reports/kink-qualifier-audit.md'), 'utf8')
const auditedIds = [...auditText.matchAll(/- \*\*.*?\*\* \(`([^`]+)`\)/g)].map((match) => match[1])
const conceptMap = new Map(catalog.concepts.map((concept) => [concept.id, concept]))
const profileMap = new Map(catalog.detailProfiles.map((profile) => [profile.id, profile]))

function appliesToConcept(item, conceptId) {
  if (item.appliesToConceptIds && !item.appliesToConceptIds.includes(conceptId)) return false
  if (item.excludeForConceptIds?.includes(conceptId)) return false
  return true
}

function assignedProfiles(concept) {
  const ids = [concept.detailProfileId, ...Object.values(concept.detailProfileByPerspective || {})].filter(Boolean)
  return [...new Set(ids)].map((id) => profileMap.get(id)).filter(Boolean)
}

function activeFields(conceptId) {
  const concept = conceptMap.get(conceptId)
  return assignedProfiles(concept).flatMap((profile) => (profile.fields || [])
    .filter((field) => !field.deprecated && appliesToConcept(field, conceptId))
    .map((field) => ({ ...field, profileId: profile.id })))
}

function fieldIds(conceptId) {
  return new Set(activeFields(conceptId).map((field) => field.id))
}

function option(profileId, fieldId, optionId) {
  const profile = profileMap.get(profileId)
  const field = profile.fields.find((row) => row.id === fieldId)
  return field.options.find((row) => row.id === optionId)
}

test('qualifier audit source contains the complete 412-concept flagged set', () => {
  assert.equal(auditedIds.length, 412)
  assert.equal(new Set(auditedIds).size, 412)
  assert.equal(catalog.meta.qualifierAuditUpdate.flaggedConceptCount, 412)
})

test('every audited concept has at least two structured concept-relevant qualifiers', () => {
  for (const conceptId of auditedIds) {
    const fields = activeFields(conceptId)
    assert.ok(fields.length >= 2, `${conceptId} only has ${fields.length} active qualifier(s)`)
    assert.ok(fields.some((field) => field.type !== 'text'), `${conceptId} has no structured qualifier`)
  }
})

test('restraint, impact, pain, rough-play, sensation, and anal leaves do not inherit sibling menus', () => {
  assert.ok(!fieldIds('wrist_restraint').has('preferred_areas'))
  assert.ok(!fieldIds('cuffs').has('methods'))
  assert.ok(!fieldIds('blindfolds').has('methods'))
  assert.ok(!fieldIds('blindfolds').has('preferred_areas'))
  assert.ok(!fieldIds('hand_spanking').has('implement_preferences'))
  assert.ok(!fieldIds('thudding_impact').has('impact_character'))
  assert.ok(!fieldIds('pain_general').has('implement_preferences'))
  assert.ok(!fieldIds('rough_sex_general').has('impact_character'))
  assert.ok(!fieldIds('light_touch').has('qualities'))
  assert.ok(!fieldIds('anal_touch').has('roles_styles'))
})

test('sexual activity/device qualifiers include physical privacy and anatomy-specific targets', () => {
  for (const id of ['kissing', 'vaginal_penetration', 'dildos', 'nipple_clamps', 'powered_sex_machines']) {
    assert.ok(fieldIds(id).has('physical_privacy'), id)
  }
  assert.ok(!fieldIds('vaginal_penetration').has('body_area_preferences'))
  assert.ok(fieldIds('strap_on_penetration').has('penetration_target'))
  assert.ok(fieldIds('genital_clamps').has('genital_clamp_target'))
  const anatomyField = catalog.bodyPreferenceProfiles[0].fields.find((field) => field.id === 'body_partner_anatomy')
  assert.ok(anatomyField.excludeForConceptIds.includes('oral_sex'))
})

test('oral anatomy choices condition penis-specific styles and positions', () => {
  for (const profileId of ['oral_giving', 'oral_receiving']) {
    assert.deepEqual(option(profileId, 'style', 'deep_oral').showWhen, { field: 'oral_focus', operator: 'contains', value: 'penis' })
    const faceFucking = option(profileId, 'style', 'face_fucking')
    if (faceFucking) assert.deepEqual(faceFucking.showWhen, { field: 'oral_focus', operator: 'contains', value: 'penis' })
    assert.deepEqual(option(profileId, 'positions', 'face_sitting').showWhen, { field: 'oral_focus', operator: 'containsAny', value: ['vulva_clitoris', 'anus'] })
  }
})

test('orgasm, humiliation/objectification, psychological, and location profiles removed sibling taxonomies', () => {
  assert.ok(!fieldIds('edging').has('modes'))
  assert.ok(!fieldIds('verbal_degradation').has('forms'))
  assert.ok(!fieldIds('human_furniture').has('forms'))
  assert.ok(!fieldIds('anticipation').has('elements'))
  assert.ok(!fieldIds('bedroom_context').has('location_types'))
})

test('observation, recording, multi-partner, and remote questions use scenario-specific depth', () => {
  assert.ok(fieldIds('private_video').has('recording_storage'))
  assert.ok(fieldIds('private_video').has('recording_access'))
  assert.ok(!fieldIds('mirror_play').has('audience'))
  assert.ok(!fieldIds('threesome').has('group_size'))
  assert.equal(conceptMap.get('sexting').detailProfileId, 'remote_digital')
  assert.ok(fieldIds('sexting').has('privacy_conditions'))
  assert.ok(!fieldIds('voice_commands_remote').has('remote_control_scope'))
})

test('roleplay, pet/primal, and fantasy concepts no longer inherit unconditional authority/costume fields', () => {
  assert.equal(conceptMap.get('stranger_roleplay').detailProfileId, 'roleplay_scenario')
  assert.ok(!fieldIds('stranger_roleplay').has('authority_level'))
  assert.equal(conceptMap.get('pet_play_general').detailProfileId, 'pet_play')
  assert.equal(conceptMap.get('primal_play').detailProfileId, 'primal_play')
  assert.equal(conceptMap.get('size_difference_fantasy').detailProfileId, 'size_fantasy')
  assert.equal(conceptMap.get('negotiated_sleep_vulnerability_fantasy').detailProfileId, 'sleep_vulnerability_fantasy')
})

test('relationship scope, emotion blends, and formerly free-text-only families are corrected', () => {
  assert.ok(!fieldIds('bedroom_only_ds').has('scope'))
  assert.ok(fieldIds('collared_relationship').has('collar_symbolism'))
  assert.ok(fieldIds('financial_domination').has('financial_limits'))
  for (const [conceptId, optionId] of [
    ['emotion_fear', 'fear'], ['emotion_humiliation', 'humiliation'], ['emotion_excitement', 'excitement'],
    ['emotion_vulnerability', 'vulnerability'], ['emotion_safety', 'safety'], ['emotion_closeness', 'closeness'],
    ['emotion_surrender', 'surrender'], ['emotion_power', 'power'], ['emotion_playfulness', 'playfulness'],
  ]) {
    for (const profileId of ['emotion_self', 'emotion_partner']) {
      assert.ok(option(profileId, 'blend', optionId).excludeForConceptIds.includes(conceptId), `${profileId}:${conceptId}`)
    }
  }
  for (const id of ['praise_kink', 'needle_play', 'saliva_play']) {
    const fields = activeFields(id)
    assert.ok(fields.filter((field) => field.type !== 'text').length >= 3, id)
  }
})
