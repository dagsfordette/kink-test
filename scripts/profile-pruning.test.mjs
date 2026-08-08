import test from 'node:test'
import assert from 'node:assert/strict'
import catalog from '../src/data/catalog.json' with { type: 'json' }
import { applicablePerspectives, perspectiveMatchesProfile, profileHasPruningData } from '../src/lib/profilePruning.js'

const concept = (id) => catalog.concepts.find((row) => row.id === id)

test('profile setup keeps gender and anatomy separate', () => {
  const personal = catalog.negotiationPreferencesModel.sections.find((section) => section.id === 'personal_profile')
  const attraction = catalog.negotiationPreferencesModel.sections.find((section) => section.id === 'attraction_profile')
  assert.equal(personal?.pretestOnly, true)
  assert.ok(personal?.fields.some((field) => field.id === 'self_gender'))
  assert.ok(personal?.fields.some((field) => field.id === 'self_anatomy'))
  assert.ok(attraction?.fields.some((field) => field.id === 'partner_gender'))
  assert.ok(attraction?.fields.some((field) => field.id === 'partner_anatomy'))
  assert.equal(profileHasPruningData({ personal_profile: { self_gender: ['woman'] } }), false)
})

test('self anatomy only prunes clearly anatomy-specific receiving or self perspectives', () => {
  const preferences = { personal_profile: { self_anatomy: ['penis', 'prostate'] } }
  assert.deepEqual(applicablePerspectives(concept('vaginal_penetration'), preferences), ['give'])
  assert.deepEqual(applicablePerspectives(concept('prostate_focused_play'), preferences), ['give', 'receive', 'self'])
  assert.deepEqual(applicablePerspectives(concept('oral_sex'), preferences), ['give', 'receive'])
})

test('partner anatomy only prunes clearly anatomy-specific giving or observing perspectives', () => {
  const preferences = {
    personal_profile: { self_anatomy: ['vagina'] },
    attraction_profile: { partner_anatomy: ['penis'] },
  }
  assert.deepEqual(applicablePerspectives(concept('vaginal_penetration'), preferences), ['receive'])
  assert.equal(perspectiveMatchesProfile(concept('masturbation_sleeves'), 'give', preferences), true)
  assert.equal(perspectiveMatchesProfile(concept('breasts_fetish'), 'observe', preferences), false)
})

test('blank or open-ended anatomy answers keep questions visible', () => {
  assert.deepEqual(applicablePerspectives(concept('vaginal_penetration'), {}), ['give', 'receive'])
  assert.deepEqual(applicablePerspectives(concept('vaginal_penetration'), { personal_profile: { self_anatomy: ['prefer_not_say'] } }), ['give', 'receive'])
  assert.deepEqual(applicablePerspectives(concept('breasts_fetish'), { attraction_profile: { partner_anatomy: ['depends_person'] } }), ['observe', 'give', 'receive'])
})
