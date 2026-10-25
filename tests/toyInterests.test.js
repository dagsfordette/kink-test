import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { TOY_GROUPS, FEATURE_GROUPS, hasFeatureMarks, normalizeFeatureInterests, setFeatureRating, setFeatureNote } from '../src/lib/featureInterests.js'
import { toyGroupsForState } from '../src/lib/toyInterests.js'
import { createAppState, normalizeAppState } from '../src/lib/appState.js'
import { filterActivities, groupActivityResults } from '../src/lib/activityProfile.js'
import { createGuided, resumeGuidedFlow, advanceGuidedFlow, backGuidedFlow } from '../src/lib/guidedExploration.js'
import { buildPrivateBackup, parsePrivateBackup, buildPartnerShareExport, parsePartnerShareExport } from '../src/lib/profileExports.js'
const catalog = JSON.parse(readFileSync(new URL('../src/data/activityCatalog.json', import.meta.url)))
const fantasy = JSON.parse(readFileSync(new URL('../src/data/fantasyProfile.json', import.meta.url)))
const state = app => ({ ...app.activities, exploration: app.exploration, attraction: app.basics.values })

test('device cards keep only relevant perspectives and preserve procedure questions in Medical-themed & edge activities', () => {
  assert.equal(TOY_GROUPS.length, 12)
  assert.equal(TOY_GROUPS.flatMap(group => group.rows).length, 35)
  assert.equal(FEATURE_GROUPS.length, 4)
  const swing = TOY_GROUPS.find(group => group.id === 'toy_sex_swings')
  assert.deepEqual(swing.rows.map(([id]) => id), ['give', 'receive'])
  for (const group of TOY_GROUPS) for (const id of Object.values(group.sources)) assert(catalog.activities.some(a => a.id === id))
  for (const id of ['give_urethral_sounding', 'receive_urethral_sounding', 'give_catheter_fetish', 'receive_catheter_fetish']) {
    const activity = catalog.activities.find(a => a.id === id)
    assert.equal(activity.categoryId, 'medical_edge')
    assert(activity.riskDomains.length)
  }
  for (const id of ['give_strap_on_penetration', 'give_device_chastity', 'give_furniture_restraint']) assert(catalog.activities.some(a => a.id === id))
  assert(!TOY_GROUPS.some(group => /chastity|strap_on|bondage_furniture/.test(group.id)))
})
test('solo, giving and receiving remain independent, and clearing differs from No', () => {
  let marks = setFeatureRating({}, 'toy_vibrators', 'self', 'love')
  marks = setFeatureRating(marks, 'toy_vibrators', 'give', 'hard_limit')
  marks = setFeatureRating(marks, 'toy_vibrators', 'receive', 'want')
  marks = setFeatureNote(marks, 'toy_vibrators', 'Private device note')
  assert.deepEqual(marks.toy_vibrators.answers, { self: 'love', give: 'hard_limit', receive: 'want' })
  assert(!hasFeatureMarks(marks))
  assert(hasFeatureMarks(marks, TOY_GROUPS))
  marks = setFeatureRating(marks, 'toy_vibrators', 'self', 'love')
  assert(!marks.toy_vibrators.answers.self)
  assert.equal(marks.toy_vibrators.answers.give, 'hard_limit')
  marks = setFeatureRating(marks, 'toy_vibrators', 'receive', 'hard_limit')
  assert(!marks.toy_vibrators.note)
})
test('private reload and backups preserve toy notes and all earlier category marks', () => {
  const app = createAppState(fantasy, catalog)
  let marks = setFeatureRating({}, 'toy_dildos', 'self', 'love')
  marks = setFeatureRating(marks, 'tattoos', 'kiss_partner', 'hard_limit')
  app.exploration.featureInterests = setFeatureNote(marks, 'toy_dildos', 'Private device note')
  app.exploration.contextInterests = { hotel: { rating: 'hard_limit' } }
  app.exploration.materialInterests = { leather: { rating: 'no' } }
  const restored = normalizeAppState(fantasy, catalog, parsePrivateBackup(buildPrivateBackup(app, fantasy, catalog), catalog, fantasy))
  for (const field of ['featureInterests', 'contextInterests', 'materialInterests']) assert.deepEqual(restored.exploration[field], app.exploration[field])
  assert.deepEqual(restored.activities.answers, {})
})
test('public toy output keeps exact ratings and No, strips notes and rejects invalid perspectives', () => {
  const app = createAppState(fantasy, catalog)
  let marks = setFeatureRating({}, 'toy_vibrators', 'self', 'love')
  marks = setFeatureRating(marks, 'toy_vibrators', 'receive', 'hard_limit')
  app.exploration.featureInterests = setFeatureNote(marks, 'toy_vibrators', 'Private device note')
  const share = buildPartnerShareExport(app, catalog)
  assert.deepEqual(share.featureInterests.toy_vibrators, { answers: { self: 'love', receive: 'hard_limit' } })
  assert(!JSON.stringify(share).includes('Private device note'))
  assert.deepEqual(parsePartnerShareExport(share, catalog).featureInterests, share.featureInterests)
  share.featureInterests.toy_vibrators.answers.self = 'invalid'
  assert.throws(() => parsePartnerShareExport(share, catalog))
  assert.throws(() => normalizeFeatureInterests({ toy_sex_swings: { answers: { self: 'love' } } }, { strict: true }))
})
test('device filtering respects body facts and attraction preferences while retaining saved answers', () => {
  const app = createAppState(fantasy, catalog)
  const rows = app => toyGroupsForState(catalog, state(app)).find(group => group.id === 'toy_masturbation_sleeves')?.rows.map(([id]) => id) || []
  assert.deepEqual(rows(app), ['self', 'give', 'receive'])
  app.exploration.facts.self.anatomy.penis = 'absent'
  assert.deepEqual(rows(app), ['give'])
  app.basics.values.partnerAnatomy = ['vagina']
  assert.deepEqual(rows(app), [])
  app.exploration.featureInterests = setFeatureRating({}, 'toy_masturbation_sleeves', 'self', 'hard_limit')
  assert.deepEqual(rows(app), ['self'])
  assert(toyGroupsForState(catalog, state(app)).some(group => group.id === 'toy_vibrators'))
})
test('solo use is not inferred from or excluded by the partner-use answer', () => {
  const app = createAppState(fantasy, catalog)
  app.activities.answers.receive_nipple_clamps = { stance: 'dont_want' }
  const groups = toyGroupsForState(catalog, state(app))
  assert(groups.find(group => group.id === 'toy_nipple_clamps').rows.some(([id]) => id === 'self'))
  assert.deepEqual(app.exploration.featureInterests, {})
})
test('device collection completes without ratings, survives reload and Back, and removes the duplicate-question backlog', () => {
  const app = createAppState(fantasy, catalog), current = state(app)
  for (const activity of catalog.activities) current.answers[activity.id] = { stance: 'curious' }
  let g = resumeGuidedFlow(catalog, current, { ...createGuided(), bodyMapComplete: true, materialsComplete: true, roleplayComplete: true, contextsComplete: true, featuresComplete: true, tattoosComplete: true, sensoryComplete: true, scentComplete: true })
  assert.equal(g.topicId, 'toys_devices')
  assert.equal(g.trail.length, 0)
  app.exploration.guided = g
  g = normalizeAppState(fantasy, catalog, app).exploration.guided
  assert.equal(resumeGuidedFlow(catalog, current, g), g)
  const next = advanceGuidedFlow(catalog, current, g)
  assert(next.toysComplete && next.flowComplete)
  const previous = backGuidedFlow(next)
  assert.equal(previous.topicId, 'toys_devices')
  assert(!previous.done)
  const empty = { ...app.activities, answers: {}, exploration: app.exploration }
  assert(filterActivities(catalog, empty).every(a => a.categoryId !== 'toys_devices'))
  const oldIds = new Set(catalog.activities.filter(a => a.categoryId === 'toys_devices').map(a => a.id))
  assert(groupActivityResults(catalog, empty).unansweredIds.every(id => !oldIds.has(id)))
})
