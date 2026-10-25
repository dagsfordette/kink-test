import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { FEATURE_GROUPS, normalizeFeatureInterests, setFeatureRating, setFeatureNote } from '../src/lib/featureInterests.js'
import { createAppState, normalizeAppState } from '../src/lib/appState.js'
import { filterActivities, groupActivityResults } from '../src/lib/activityProfile.js'
import { createGuided, resumeGuidedFlow, advanceGuidedFlow, backGuidedFlow } from '../src/lib/guidedExploration.js'
import { buildPrivateBackup, parsePrivateBackup, buildPartnerShareExport, parsePartnerShareExport } from '../src/lib/profileExports.js'
const catalog = JSON.parse(readFileSync(new URL('../src/data/activityCatalog.json', import.meta.url)))
const fantasy = JSON.parse(readFileSync(new URL('../src/data/fantasyProfile.json', import.meta.url)))

test('approved feature collection uses concrete actions, with shaving in both directions for both hair groups', () => {
  assert.equal(FEATURE_GROUPS.length, 4)
  assert.equal(FEATURE_GROUPS.flatMap(group => group.rows).length, 16)
  assert(!JSON.stringify(FEATURE_GROUPS).includes('focus'))
  for (const id of ['pubic', 'facial']) {
    const rows = FEATURE_GROUPS.find(group => group.id === id).rows
    assert(rows.some(([id]) => id === 'shave_partner'))
    assert(rows.some(([id]) => id === 'shave_self'))
  }
})
test('shaving and touching, groups, and directions are independent; clearing differs from No', () => {
  let marks = setFeatureRating(undefined, 'pubic', 'shave_partner', 'love')
  marks = setFeatureRating(marks, 'pubic', 'shave_self', 'hard_limit')
  marks = setFeatureRating(marks, 'pubic', 'touch_self', 'want')
  marks = setFeatureRating(marks, 'facial', 'shave_partner', 'love')
  assert.equal(marks.pubic.answers.shave_partner, 'love')
  assert.equal(marks.pubic.answers.shave_self, 'hard_limit')
  assert(!marks.pubic.answers.touch_partner)
  marks = setFeatureRating(marks, 'pubic', 'shave_partner', 'love')
  assert(!marks.pubic.answers.shave_partner)
  assert.equal(marks.pubic.answers.shave_self, 'hard_limit')
  assert.equal(marks.facial.answers.shave_partner, 'love')
})
test('notes remain optional and are removed when the last positive action is cleared or changed to No', () => {
  let marks = setFeatureNote(setFeatureRating({}, 'pubic', 'shave_partner', 'love'), 'pubic', 'Leave some areas')
  assert.equal(marks.pubic.note, 'Leave some areas')
  marks = setFeatureRating(marks, 'pubic', 'shave_partner', 'hard_limit')
  assert.deepEqual(marks.pubic, { answers: { shave_partner: 'hard_limit' } })
  assert.deepEqual(setFeatureNote(marks, 'pubic', 'ignored'), marks)
  assert.deepEqual(setFeatureRating(marks, 'pubic', 'shave_partner', null), {})
})
test('reload and private backup preserve activities, notes, attraction preferences and previous category updates', () => {
  const app = createAppState(fantasy, catalog)
  app.exploration.featureInterests = setFeatureNote(setFeatureRating({}, 'facial', 'shave_self', 'love'), 'facial', 'Private grooming note')
  app.exploration.contextInterests = { hotel: { rating: 'hard_limit' } }
  app.exploration.materialInterests = { leather: { rating: 'no' } }
  app.exploration.roleplayInterests = { roles: { teacher: { self: { rating: 'hard_limit' } } }, themes: {} }
  app.basics.values.bodyBuild = ['muscular']
  const restored = normalizeAppState(fantasy, catalog, parsePrivateBackup(buildPrivateBackup(app, fantasy, catalog), catalog, fantasy))
  for (const field of ['featureInterests', 'contextInterests', 'materialInterests', 'roleplayInterests']) assert.deepEqual(restored.exploration[field], app.exploration[field])
  assert.deepEqual(restored.basics.values.bodyBuild, ['muscular'])
  assert.deepEqual(restored.activities.answers, {})
})
test('public exports retain exact action ratings including No, strip notes, and reject invalid answers', () => {
  const app = createAppState(fantasy, catalog)
  let marks = setFeatureRating({}, 'pubic', 'shave_partner', 'love')
  marks = setFeatureRating(marks, 'pubic', 'shave_self', 'hard_limit')
  app.exploration.featureInterests = setFeatureNote(marks, 'pubic', 'Private grooming note')
  const share = buildPartnerShareExport(app, catalog)
  assert.deepEqual(share.featureInterests.pubic, { answers: { shave_partner: 'love', shave_self: 'hard_limit' } })
  assert(!JSON.stringify(share).includes('Private grooming note'))
  assert.deepEqual(parsePartnerShareExport(share, catalog).featureInterests, share.featureInterests)
  share.featureInterests.pubic.answers.shave_self = 'invalid'
  assert.throws(() => parsePartnerShareExport(share, catalog))
  assert.throws(() => normalizeFeatureInterests({ facial: { answers: { nonexisting_action: 'love' } } }, { strict: true }))
})
test('collection can be completed unmarked, survives reload, supports Back, and has no legacy question backlog', () => {
  const app = createAppState(fantasy, catalog), state = { ...app.activities, exploration: app.exploration }
  for (const activity of catalog.activities) state.answers[activity.id] = { stance: 'curious' }
  let g = resumeGuidedFlow(catalog, state, { ...createGuided(), bodyMapComplete: true, materialsComplete: true, roleplayComplete: true, contextsComplete: true, tattoosComplete: true, sensoryComplete: true, scentComplete: true, toysComplete: true })
  assert.equal(g.topicId, 'body_features')
  assert.equal(g.trail.length, 0)
  app.exploration.guided = g
  g = normalizeAppState(fantasy, catalog, app).exploration.guided
  assert.equal(resumeGuidedFlow(catalog, state, g), g)
  const next = advanceGuidedFlow(catalog, state, g)
  assert(next.featuresComplete && next.flowComplete)
  const previous = backGuidedFlow(next)
  assert.equal(previous.topicId, 'body_features')
  assert(!previous.done)
  assert.deepEqual(app.exploration.featureInterests, {})
  const empty = { ...app.activities, answers: {}, exploration: app.exploration }
  assert(filterActivities(catalog, empty).every(a => a.categoryId !== 'body_features'))
  const oldIds = new Set(catalog.activities.filter(a => a.categoryId === 'body_features').map(a => a.id))
  assert(groupActivityResults(catalog, empty).unansweredIds.every(id => !oldIds.has(id)))
})
