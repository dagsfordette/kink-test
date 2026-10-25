import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CONTEXT_ITEMS, normalizeContextInterests, setContextRating, setContextDetails } from '../src/lib/contextInterests.js'
import { createAppState, normalizeAppState } from '../src/lib/appState.js'
import { filterActivities, groupActivityResults } from '../src/lib/activityProfile.js'
import { createGuided, resumeGuidedFlow, advanceGuidedFlow, backGuidedFlow } from '../src/lib/guidedExploration.js'
import { buildPrivateBackup, parsePrivateBackup, buildPartnerShareExport, parsePartnerShareExport } from '../src/lib/profileExports.js'
const catalog = JSON.parse(readFileSync(new URL('../src/data/activityCatalog.json', import.meta.url)))
const fantasy = JSON.parse(readFileSync(new URL('../src/data/fantasyProfile.json', import.meta.url)))

test('setting cards cover all 11 existing settings with specific follow-up choices', () => {
  assert.equal(CONTEXT_ITEMS.length, 11)
  assert.deepEqual(CONTEXT_ITEMS.map(item => item.sourceActivityId).sort(), catalog.activities.filter(a => a.categoryId === 'sexual_context').map(a => a.id).sort())
  assert.equal(new Set(CONTEXT_ITEMS.map(item => item.options.join('|'))).size, 11)
})
test('unmarked, positive and explicit No remain distinct; switching to No clears details', () => {
  let marks = setContextRating(undefined, 'hotel', 'love')
  assert.equal(marks.hotel.rating, 'love')
  assert(!marks.bedroom)
  marks = setContextDetails(marks, 'hotel', { details: ['Getting away together'], note: 'private conditions' })
  marks = setContextRating(marks, 'hotel', 'hard_limit')
  assert.deepEqual(marks.hotel, { rating: 'hard_limit' })
  assert.deepEqual(setContextDetails(marks, 'hotel', { note: 'ignored' }), marks)
  assert.deepEqual(setContextRating(marks, 'hotel', 'hard_limit'), {})
})
test('private backup and reload preserve setting details alongside clothing and roleplay', () => {
  const app = createAppState(fantasy, catalog)
  app.exploration.contextInterests = setContextDetails(setContextRating({}, 'hotel', 'love'), 'hotel', { details: ['Making an occasion of it'], note: 'Private setting note' })
  app.exploration.materialInterests = { leather: { rating: 'no' } }
  app.exploration.roleplayInterests = { roles: { teacher: { self: { rating: 'hard_limit' } } }, themes: {} }
  const restored = normalizeAppState(fantasy, catalog, parsePrivateBackup(buildPrivateBackup(app, fantasy, catalog), catalog, fantasy))
  assert.deepEqual(restored.exploration.contextInterests, app.exploration.contextInterests)
  assert.deepEqual(restored.exploration.materialInterests, app.exploration.materialInterests)
  assert.deepEqual(restored.exploration.roleplayInterests, app.exploration.roleplayInterests)
})
test('public sharing preserves explicit setting ratings but excludes private details and notes', () => {
  const app = createAppState(fantasy, catalog)
  app.exploration.contextInterests = {
    hotel: { rating: 'love', details: ['Making an occasion of it'], note: 'Private setting note' },
    sex_club: { rating: 'hard_limit' }
  }
  const share = buildPartnerShareExport(app, catalog)
  assert.deepEqual(share.contextInterests, { hotel: { rating: 'love' }, sex_club: { rating: 'hard_limit' } })
  assert(!JSON.stringify(share).includes('Private setting note'))
  assert(!JSON.stringify(share).includes('Making an occasion of it'))
  assert.deepEqual(parsePartnerShareExport(share, catalog).contextInterests, share.contextInterests)
  share.contextInterests.hotel.rating = 'invalid'
  assert.throws(() => parsePartnerShareExport(share, catalog))
  assert.throws(() => normalizeContextInterests({ hotel: { rating: 'love', details: ['Shared bath'] } }, { strict: true }))
})
test('settings never invent answers to watching, recording or multi-partner activities', () => {
  const app = createAppState(fantasy, catalog)
  app.exploration.contextInterests = setContextRating({}, 'play_party', 'love')
  const restored = normalizeAppState(fantasy, catalog, app)
  assert.deepEqual(restored.activities.answers, {})
  const share = buildPartnerShareExport(restored, catalog)
  assert.deepEqual(share.activities.answers, {})
  assert.equal(share.contextInterests.play_party.rating, 'love')
})
test('all settings may remain unmarked; Continue, reload and Back retain category completion', () => {
  const app = createAppState(fantasy, catalog), state = { ...app.activities, exploration: app.exploration }
  for (const activity of catalog.activities) state.answers[activity.id] = { stance: 'curious' }
  let g = resumeGuidedFlow(catalog, state, { ...createGuided(), bodyMapComplete: true, materialsComplete: true, roleplayComplete: true, featuresComplete: true, tattoosComplete: true, sensoryComplete: true, scentComplete: true, toysComplete: true })
  assert.equal(g.topicId, 'sexual_context')
  assert.equal(g.trail.length, 0)
  app.exploration.guided = g
  g = normalizeAppState(fantasy, catalog, app).exploration.guided
  assert.equal(resumeGuidedFlow(catalog, state, g), g)
  const next = advanceGuidedFlow(catalog, state, g)
  assert(next.contextsComplete && next.flowComplete)
  const restored = backGuidedFlow(next)
  assert.equal(restored.topicId, 'sexual_context')
  assert(!restored.done)
  assert.deepEqual(app.exploration.contextInterests, {})
  const empty = { ...app.activities, answers: {}, exploration: app.exploration }
  assert(filterActivities(catalog, empty).every(a => a.categoryId !== 'sexual_context'))
  const oldIds = new Set(CONTEXT_ITEMS.map(item => item.sourceActivityId))
  assert(groupActivityResults(catalog, empty).unansweredIds.every(id => !oldIds.has(id)))
})
