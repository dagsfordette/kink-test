import test from 'node:test'
import assert from 'node:assert/strict'
import catalog from '../src/data/activityCatalog.json' with { type: 'json' }
import fantasy from '../src/data/fantasyProfile.json' with { type: 'json' }
import { ACTIVITY_RATINGS } from '../src/lib/collectionActivityAnswers.js'
import { FEATURE_GROUPS, TATTOO_GROUP, TOY_GROUPS, featureRatings, featureRatingLabel, setFeatureRating, setFeatureActivityDetails, normalizeFeatureInterests, hasFeatureMarks } from '../src/lib/featureInterests.js'
import { CONTEXT_RATINGS, setContextRating, setContextDetails } from '../src/lib/contextInterests.js'
import { ROLEPLAY_RATINGS, setRoleplayRating, setRoleplayDetails, setRoleplayThemeRating, setRoleplayThemeDetails } from '../src/lib/roleplayInterests.js'
import { sensoryRatings, setSensoryRating, setSensoryDetails } from '../src/lib/sensoryInterests.js'
import { createAppState, normalizeAppState } from '../src/lib/appState.js'
import { buildPrivateBackup, parsePrivateBackup, buildPartnerShareExport, parsePartnerShareExport } from '../src/lib/profileExports.js'

test('all custom activity controls use the exact catalog scale, while attraction controls keep the interest scale', () => {
  assert.deepEqual(ACTIVITY_RATINGS, catalog.stanceScale.map(({ id, label }) => [id, label]))
  assert.deepEqual(CONTEXT_RATINGS, ACTIVITY_RATINGS)
  assert.deepEqual(ROLEPLAY_RATINGS, ACTIVITY_RATINGS)
  for (const group of [...FEATURE_GROUPS, TATTOO_GROUP, ...TOY_GROUPS]) {
    assert.deepEqual(featureRatings(group.id), ACTIVITY_RATINGS)
    for (const [rating, label] of ACTIVITY_RATINGS) {
      const marks = setFeatureRating({}, group.id, group.rows[0][0], rating)
      assert.equal(marks[group.id].answers[group.rows[0][0]], rating)
      assert.equal(featureRatingLabel(rating, group.id), label)
    }
  }
  for (const id of ['hear_whisper', 'give_whisper', 'hear_pleasure', 'make_pleasure', 'listen_asmr']) assert.deepEqual(sensoryRatings(id), ACTIVITY_RATINGS)
  for (const id of ['hear_voice', 'hear_accent', 'smell_partner', 'partner_smells_me']) assert.deepEqual(sensoryRatings(id).map(([id]) => id), ['enjoy', 'love', 'fetish', 'no'])
  assert.deepEqual(featureRatings('body_scent').map(([id]) => id), ['enjoy', 'love', 'fetish', 'no'])
})

test('experience can be recorded before a stance, survives clearing that stance, and stays independent by direction', () => {
  let features = setFeatureActivityDetails({}, 'tattoos', 'kiss_self', { experience: 'tried_once' })
  assert(hasFeatureMarks(features, [TATTOO_GROUP]))
  assert.deepEqual(features.tattoos.answers, {})
  features = setFeatureRating(features, 'tattoos', 'kiss_self', 'hard_limit')
  features = setFeatureRating(features, 'tattoos', 'kiss_self', null)
  assert.equal(features.tattoos.activityDetails.kiss_self.experience, 'tried_once')
  assert(!features.tattoos.activityDetails.kiss_partner)
  assert.deepEqual(setFeatureActivityDetails(features, 'tattoos', 'kiss_self', { experience: '' }), {})
  let contexts = setContextDetails({}, 'hotel', { experience: 'some_experience' })
  contexts = setContextRating(contexts, 'hotel', 'love')
  contexts = setContextRating(contexts, 'hotel', 'love')
  assert.deepEqual(contexts.hotel, { experience: 'some_experience' })
  let roles = setRoleplayDetails({}, 'teacher', 'self', { experience: 'experienced' })
  roles = setRoleplayRating(roles, 'teacher', 'self', 'want')
  roles = setRoleplayRating(roles, 'teacher', 'self', null)
  assert.deepEqual(roles.roles.teacher.self, { experience: 'experienced' })
  let sensory = setSensoryDetails({}, 'give_whisper', { experience: 'not_tried' })
  sensory = setSensoryRating(sensory, 'give_whisper', 'curious')
  sensory = setSensoryRating(sensory, 'give_whisper', null)
  assert.deepEqual(sensory.give_whisper, { experience: 'not_tried' })
})

test('soft-limit conditions are per activity and cleared when changing stance', () => {
  let features = setFeatureRating({}, 'pubic', 'shave_self', 'soft_limit')
  features = setFeatureActivityDetails(features, 'pubic', 'shave_self', { conditions: 'Leave one area', experience: 'tried_once' })
  assert.equal(features.pubic.activityDetails.shave_self.conditions, 'Leave one area')
  features = setFeatureRating(features, 'pubic', 'shave_partner', 'hard_limit')
  assert.equal(features.pubic.activityDetails.shave_self.conditions, 'Leave one area')
  features = setFeatureRating(features, 'pubic', 'shave_self', 'dont_want')
  assert.deepEqual(features.pubic.activityDetails.shave_self, { experience: 'tried_once' })
  const themes = setRoleplayThemeDetails(setRoleplayThemeRating({}, 'historical', 'soft_limit'), 'historical', { conditions: 'A particular period', experience: 'not_tried' })
  assert.equal(themes.themes.historical.conditions, 'A particular period')
})

test('backups retain new stances, experience and private conditions; sharing strips conditions and keeps boundaries', () => {
  const app = createAppState(fantasy, catalog)
  app.exploration.featureInterests = setFeatureActivityDetails(setFeatureRating({}, 'toy_vibrators', 'self', 'soft_limit'), 'toy_vibrators', 'self', { conditions: 'Private device conditions', experience: 'tried_once' })
  app.exploration.contextInterests = setContextDetails(setContextRating({}, 'hotel', 'soft_limit'), 'hotel', { conditions: 'Private setting conditions', experience: 'experienced' })
  app.exploration.roleplayInterests = setRoleplayDetails(setRoleplayRating({}, 'teacher', 'self', 'soft_limit'), 'teacher', 'self', { conditions: 'Private role conditions', pairs: ['student', 'teacher'], pairRatings: { student: 'hard_limit', teacher: 'soft_limit' }, pairConditions: { teacher: 'Private pairing conditions' } })
  app.exploration.sensoryInterests = setSensoryDetails(setSensoryRating({}, 'listen_asmr', 'soft_limit'), 'listen_asmr', { conditions: 'Private audio conditions', experience: 'not_tried' })
  const restored = normalizeAppState(fantasy, catalog, parsePrivateBackup(buildPrivateBackup(app, fantasy, catalog), catalog, fantasy))
  for (const key of ['featureInterests', 'contextInterests', 'roleplayInterests', 'sensoryInterests']) assert.deepEqual(restored.exploration[key], app.exploration[key])
  const share = buildPartnerShareExport(app, catalog)
  assert(!JSON.stringify(share).includes('Private'))
  assert.equal(share.featureInterests.toy_vibrators.answers.self, 'soft_limit')
  assert.equal(share.featureInterests.toy_vibrators.activityDetails.self.experience, 'tried_once')
  assert.equal(share.roleplayInterests.roles.teacher.self.pairRatings.student, 'hard_limit')
  assert.equal(share.roleplayInterests.roles.teacher.self.pairRatings.teacher, 'soft_limit')
  const parsed = parsePartnerShareExport(share, catalog)
  for (const key of ['featureInterests', 'contextInterests', 'roleplayInterests', 'sensoryInterests']) assert.deepEqual(parsed[key], share[key])
  assert.throws(() => normalizeFeatureInterests({ tattoos: { answers: {}, activityDetails: { kiss_self: { experience: 'invalid' } } } }, { strict: true }))
})
