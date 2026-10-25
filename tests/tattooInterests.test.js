import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { TATTOO_GROUP, FEATURE_GROUPS, hasFeatureMarks, normalizeFeatureInterests, setFeatureRating, setFeatureNote } from '../src/lib/featureInterests.js'
import { createAppState, normalizeAppState } from '../src/lib/appState.js'
import { filterActivities, groupActivityResults } from '../src/lib/activityProfile.js'
import { createGuided, resumeGuidedFlow, advanceGuidedFlow, backGuidedFlow } from '../src/lib/guidedExploration.js'
import { buildPrivateBackup, parsePrivateBackup, buildPartnerShareExport, parsePartnerShareExport } from '../src/lib/profileExports.js'
const catalog = JSON.parse(readFileSync(new URL('../src/data/activityCatalog.json', import.meta.url)))
const fantasy = JSON.parse(readFileSync(new URL('../src/data/fantasyProfile.json', import.meta.url)))

test('tattoos have exactly four concrete actions, separate from the existing four body-feature groups', () => {
  assert.deepEqual(TATTOO_GROUP.rows, [
    ['trace_partner', 'Tracing my partner’s tattoos'],
    ['trace_self', 'Having my partner trace my tattoos'],
    ['kiss_partner', 'Kissing my partner’s tattoos'],
    ['kiss_self', 'Having my partner kiss my tattoos']
  ])
  assert.equal(FEATURE_GROUPS.length, 4)
  const marks = setFeatureRating({}, 'tattoos', 'trace_partner', 'love')
  assert(!hasFeatureMarks(marks))
  assert(hasFeatureMarks(marks, [TATTOO_GROUP]))
})
test('tracing and kissing in either direction remain independent, with clearing distinct from No', () => {
  let marks = setFeatureRating({}, 'tattoos', 'trace_partner', 'love')
  marks = setFeatureRating(marks, 'tattoos', 'trace_self', 'hard_limit')
  marks = setFeatureRating(marks, 'tattoos', 'kiss_partner', 'want')
  marks = setFeatureRating(marks, 'tattoos', 'kiss_self', 'love')
  assert.deepEqual(marks.tattoos.answers, { trace_partner: 'love', trace_self: 'hard_limit', kiss_partner: 'want', kiss_self: 'love' })
  marks = setFeatureRating(marks, 'tattoos', 'trace_partner', 'love')
  assert(!marks.tattoos.answers.trace_partner)
  assert.equal(marks.tattoos.answers.trace_self, 'hard_limit')
})
test('optional tattoo notes disappear when the last positive mark is removed, without affecting other groups', () => {
  let marks = setFeatureRating({}, 'hair', 'stroke_partner', 'want')
  marks = setFeatureRating(marks, 'tattoos', 'trace_partner', 'love')
  marks = setFeatureNote(marks, 'tattoos', 'Private tattoo note')
  assert.equal(marks.tattoos.note, 'Private tattoo note')
  marks = setFeatureRating(marks, 'tattoos', 'trace_partner', 'hard_limit')
  assert.deepEqual(marks.tattoos, { answers: { trace_partner: 'hard_limit' } })
  assert.equal(marks.hair.answers.stroke_partner, 'want')
  assert(!setFeatureRating(marks, 'tattoos', 'trace_partner', null).tattoos)
})
test('private reload/backup preserves tattoo notes; public sharing keeps ratings only and validates them', () => {
  const app = createAppState(fantasy, catalog)
  let marks = setFeatureRating({}, 'tattoos', 'trace_partner', 'love')
  marks = setFeatureRating(marks, 'tattoos', 'kiss_self', 'hard_limit')
  app.exploration.featureInterests = setFeatureNote(marks, 'tattoos', 'Private tattoo note')
  app.exploration.materialInterests = { leather: { rating: 'no' } }
  const restored = normalizeAppState(fantasy, catalog, parsePrivateBackup(buildPrivateBackup(app, fantasy, catalog), catalog, fantasy))
  assert.deepEqual(restored.exploration.featureInterests, app.exploration.featureInterests)
  assert.deepEqual(restored.exploration.materialInterests, app.exploration.materialInterests)
  const share = buildPartnerShareExport(restored, catalog)
  assert.deepEqual(share.featureInterests.tattoos, { answers: { trace_partner: 'love', kiss_self: 'hard_limit' } })
  assert(!JSON.stringify(share).includes('Private tattoo note'))
  assert.deepEqual(parsePartnerShareExport(share, catalog).featureInterests, share.featureInterests)
  share.featureInterests.tattoos.answers.kiss_self = 'invalid'
  assert.throws(() => parsePartnerShareExport(share, catalog))
  assert.throws(() => normalizeFeatureInterests({ tattoos: { answers: { admire: 'love' } } }, { strict: true }))
})
test('tattoos complete without marks, survive reload and Back, and replace the old question backlog', () => {
  const app = createAppState(fantasy, catalog), state = { ...app.activities, exploration: app.exploration }
  for (const activity of catalog.activities) state.answers[activity.id] = { stance: 'curious' }
  let g = resumeGuidedFlow(catalog, state, { ...createGuided(), bodyMapComplete: true, materialsComplete: true, roleplayComplete: true, contextsComplete: true, featuresComplete: true, sensoryComplete: true, scentComplete: true, toysComplete: true })
  assert.equal(g.topicId, 'tattoo_interests')
  assert.equal(g.trail.length, 0)
  app.exploration.guided = g
  g = normalizeAppState(fantasy, catalog, app).exploration.guided
  assert.equal(resumeGuidedFlow(catalog, state, g), g)
  const next = advanceGuidedFlow(catalog, state, g)
  assert(next.tattoosComplete && next.flowComplete)
  const previous = backGuidedFlow(next)
  assert.equal(previous.topicId, 'tattoo_interests')
  assert(!previous.done)
  const empty = { ...app.activities, answers: {}, exploration: app.exploration }
  assert(filterActivities(catalog, empty).every(a => a.categoryId !== 'tattoo_interests'))
  const oldIds = new Set(catalog.activities.filter(a => a.categoryId === 'tattoo_interests').map(a => a.id))
  assert(groupActivityResults(catalog, empty).unansweredIds.every(id => !oldIds.has(id)))
})
