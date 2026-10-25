import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { MATERIAL_ITEMS, normalizeMaterialInterests, setMaterialRating } from '../src/lib/materialInterests.js'
import { createAppState, normalizeAppState } from '../src/lib/appState.js'
import { filterActivities, groupActivityResults } from '../src/lib/activityProfile.js'
import { createGuided, resumeGuidedFlow, advanceGuidedFlow, backGuidedFlow } from '../src/lib/guidedExploration.js'
import { buildPrivateBackup, parsePrivateBackup, buildPartnerShareExport, parsePartnerShareExport } from '../src/lib/profileExports.js'
const catalog = JSON.parse(readFileSync(new URL('../src/data/activityCatalog.json', import.meta.url)))
const fantasy = JSON.parse(readFileSync(new URL('../src/data/fantasyProfile.json', import.meta.url)))

test('all 35 interests are represented once; clearing means no particular interest, not a negative answer', () => {
  assert.equal(MATERIAL_ITEMS.length, 35)
  assert.equal(new Set(MATERIAL_ITEMS.map(i => i.id)).size, 35)
  let marks = setMaterialRating({}, 'leather', 'love')
  assert.equal(marks.leather.rating, 'love')
  assert(!marks.denim)
  marks = setMaterialRating(marks, 'leather', 'love')
  assert.deepEqual(marks, {})
})
test('switching to No removes positive follow-up details', () => {
  const marks = setMaterialRating({ leather: { rating: 'love', perspectives: ['self'], note: 'private' } }, 'leather', 'no')
  assert.deepEqual(marks.leather, { rating: 'no' })
  assert.deepEqual(setMaterialRating(marks, 'leather', null), {})
  assert.throws(() => normalizeMaterialInterests({ leather: { rating: 'unknown' } }, { strict: true }))
})
test('material interests survive reload and private backup with independent optional perspectives', () => {
  const app = createAppState(fantasy, catalog)
  app.exploration.materialInterests = { leather: { rating: 'fetish', perspectives: ['partner'], note: 'private note' }, denim: { rating: 'no' } }
  const backup = buildPrivateBackup(app, fantasy, catalog)
  const restored = normalizeAppState(fantasy, catalog, parsePrivateBackup(backup, catalog, fantasy))
  assert.deepEqual(restored.exploration.materialInterests, app.exploration.materialInterests)
})
test('sharing retains exact ratings without private notes or follow-up details', () => {
  const app = createAppState(fantasy, catalog)
  app.exploration.materialInterests = { leather: { rating: 'fetish', perspectives: ['self'], note: 'private note' }, denim: { rating: 'no' } }
  const exported = buildPartnerShareExport(app, catalog)
  assert.deepEqual(exported.materialInterests, { leather: { rating: 'fetish' }, denim: { rating: 'no' } })
  assert(!JSON.stringify(exported).includes('private note'))
  assert.deepEqual(parsePartnerShareExport(exported, catalog).materialInterests, exported.materialInterests)
  exported.materialInterests.leather.rating = 'invalid'
  assert.throws(() => parsePartnerShareExport(exported, catalog))
})
test('clothing collection needs no ratings to Continue; completion and Back work across reload', () => {
  const app = createAppState(fantasy, catalog)
  const state = { ...app.activities, exploration: app.exploration }
  for (const a of catalog.activities) state.answers[a.id] = { stance: 'curious' }
  let g = resumeGuidedFlow(catalog, state, { ...createGuided(), bodyMapComplete: true, roleplayComplete: true, contextsComplete: true, featuresComplete: true, tattoosComplete: true, sensoryComplete: true, scentComplete: true, toysComplete: true })
  assert.equal(g.topicId, 'fetish_materials')
  assert.equal(g.trail.length, 0)
  app.exploration.guided = g
  g = normalizeAppState(fantasy, catalog, app).exploration.guided
  assert.equal(resumeGuidedFlow(catalog, state, g), g)
  const next = advanceGuidedFlow(catalog, state, g)
  assert(next.materialsComplete)
  assert(next.flowComplete)
  const back = backGuidedFlow(next)
  assert.equal(back.topicId, 'fetish_materials')
  assert(!back.done)
})
test('unmarked collection items do not create an unanswered activity backlog', () => {
  const app = createAppState(fantasy, catalog), state = { ...app.activities, exploration: app.exploration }
  assert(filterActivities(catalog, state).every(a => a.categoryId !== 'fetish_materials'))
  const materialIds = new Set(catalog.activities.filter(a => a.categoryId === 'fetish_materials').map(a => a.id))
  assert(groupActivityResults(catalog, state).unansweredIds.every(id => !materialIds.has(id)))
})
