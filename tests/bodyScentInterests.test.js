import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { BODY_SCENT_GROUP, FEATURE_GROUPS, hasFeatureMarks, normalizeFeatureInterests, setFeatureRating, setFeatureNote } from '../src/lib/featureInterests.js'
import { createAppState, normalizeAppState } from '../src/lib/appState.js'
import { filterActivities, groupActivityResults } from '../src/lib/activityProfile.js'
import { createGuided, resumeGuidedFlow, advanceGuidedFlow, backGuidedFlow } from '../src/lib/guidedExploration.js'
import { buildPrivateBackup, parsePrivateBackup, buildPartnerShareExport, parsePartnerShareExport } from '../src/lib/profileExports.js'
const catalog = JSON.parse(readFileSync(new URL('../src/data/activityCatalog.json', import.meta.url)))
const fantasy = JSON.parse(readFileSync(new URL('../src/data/fantasyProfile.json', import.meta.url)))

test('body scent contains two independent directions and stays separate from body-feature cards', () => {
  assert.deepEqual(BODY_SCENT_GROUP.rows, [
    ['partner_scent', 'Enjoying my partner’s natural body scent'],
    ['self_scent', 'Having my partner enjoy my natural body scent']
  ])
  assert.equal(FEATURE_GROUPS.length, 4)
  const marks = setFeatureRating({}, 'body_scent', 'partner_scent', 'love')
  assert(!hasFeatureMarks(marks))
  assert(hasFeatureMarks(marks, [BODY_SCENT_GROUP]))
})
test('positive and No ratings stay independent; clearing differs from No and removes unneeded notes', () => {
  let marks = setFeatureRating({}, 'body_scent', 'partner_scent', 'love')
  marks = setFeatureRating(marks, 'body_scent', 'self_scent', 'no')
  marks = setFeatureNote(marks, 'body_scent', 'Private scent note')
  assert.equal(marks.body_scent.answers.partner_scent, 'love')
  assert.equal(marks.body_scent.answers.self_scent, 'no')
  assert.equal(marks.body_scent.note, 'Private scent note')
  marks = setFeatureRating(marks, 'body_scent', 'partner_scent', 'love')
  assert.deepEqual(marks.body_scent, { answers: { self_scent: 'no' } })
  assert.deepEqual(setFeatureRating(marks, 'body_scent', 'self_scent', null), {})
})
test('reload and private backup preserve notes; partner sharing retains exact ratings and strips notes', () => {
  const app = createAppState(fantasy, catalog)
  let marks = setFeatureRating({}, 'body_scent', 'partner_scent', 'fetish')
  marks = setFeatureRating(marks, 'body_scent', 'self_scent', 'no')
  app.exploration.featureInterests = setFeatureNote(marks, 'body_scent', 'Private scent note')
  app.exploration.contextInterests = { hotel: { rating: 'hard_limit' } }
  const restored = normalizeAppState(fantasy, catalog, parsePrivateBackup(buildPrivateBackup(app, fantasy, catalog), catalog, fantasy))
  assert.deepEqual(restored.exploration.featureInterests, app.exploration.featureInterests)
  assert.deepEqual(restored.exploration.contextInterests, app.exploration.contextInterests)
  const share = buildPartnerShareExport(restored, catalog)
  assert.deepEqual(share.featureInterests.body_scent, { answers: { partner_scent: 'fetish', self_scent: 'no' } })
  assert(!JSON.stringify(share).includes('Private scent note'))
  assert.deepEqual(parsePartnerShareExport(share, catalog).featureInterests, share.featureInterests)
  share.featureInterests.body_scent.answers.self_scent = 'invalid'
  assert.throws(() => parsePartnerShareExport(share, catalog))
  assert.throws(() => normalizeFeatureInterests({ body_scent: { answers: { perfume: 'love' } } }, { strict: true }))
})
test('natural scent preferences never rate fragrances or unrelated body-feature activities', () => {
  const app = createAppState(fantasy, catalog)
  app.exploration.sensoryInterests = { smell_partner: { rating: 'no' } }
  app.exploration.featureInterests = setFeatureRating({}, 'body_scent', 'partner_scent', 'love')
  const restored = normalizeAppState(fantasy, catalog, app)
  assert.equal(restored.exploration.sensoryInterests.smell_partner.rating, 'no')
  assert.deepEqual(Object.keys(restored.exploration.featureInterests), ['body_scent'])
  assert.deepEqual(restored.activities.answers, {})
})
test('body scent can finish unmarked, supports reload and Back, and does not leave old questions unanswered', () => {
  const app = createAppState(fantasy, catalog), state = { ...app.activities, exploration: app.exploration }
  for (const activity of catalog.activities) state.answers[activity.id] = { stance: 'curious' }
  let g = resumeGuidedFlow(catalog, state, { ...createGuided(), bodyMapComplete: true, materialsComplete: true, roleplayComplete: true, contextsComplete: true, featuresComplete: true, tattoosComplete: true, sensoryComplete: true, toysComplete: true })
  assert.equal(g.topicId, 'body_scent')
  assert.equal(g.trail.length, 0)
  app.exploration.guided = g
  g = normalizeAppState(fantasy, catalog, app).exploration.guided
  assert.equal(resumeGuidedFlow(catalog, state, g), g)
  const next = advanceGuidedFlow(catalog, state, g)
  assert(next.scentComplete && next.flowComplete)
  const previous = backGuidedFlow(next)
  assert.equal(previous.topicId, 'body_scent')
  assert(!previous.done)
  const empty = { ...app.activities, answers: {}, exploration: app.exploration }
  assert(filterActivities(catalog, empty).every(a => a.categoryId !== 'body_scent'))
  const oldIds = new Set(catalog.activities.filter(a => a.categoryId === 'body_scent').map(a => a.id))
  assert(groupActivityResults(catalog, empty).unansweredIds.every(id => !oldIds.has(id)))
})
