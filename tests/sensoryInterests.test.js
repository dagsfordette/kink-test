import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SENSORY_ITEMS, SENSORY_ROWS, normalizeSensoryInterests, setSensoryRating, setSensoryDetails } from '../src/lib/sensoryInterests.js'
import { createAppState, normalizeAppState } from '../src/lib/appState.js'
import { filterActivities, groupActivityResults } from '../src/lib/activityProfile.js'
import { createGuided, resumeGuidedFlow, advanceGuidedFlow, backGuidedFlow } from '../src/lib/guidedExploration.js'
import { buildPrivateBackup, parsePrivateBackup, buildPartnerShareExport, parsePartnerShareExport } from '../src/lib/profileExports.js'
const catalog = JSON.parse(readFileSync(new URL('../src/data/activityCatalog.json', import.meta.url)))
const fantasy = JSON.parse(readFileSync(new URL('../src/data/fantasyProfile.json', import.meta.url)))

test('approved sensory collection has six distinct cards and nine ratings without repeated sensation or body-scent questions', () => {
  assert.deepEqual(SENSORY_ITEMS.map(item => item.id), ['voice', 'accent', 'whisper', 'pleasure', 'asmr', 'fragrance'])
  assert.equal(SENSORY_ROWS.length, 9)
  assert.equal(new Set(SENSORY_ROWS.map(row => row.id)).size, 9)
  for (const id of ['give_texture_play', 'give_warmth_play', 'give_pressure_sensation', 'give_tickling', 'give_massage', 'body_scented_body_area_partner_scent']) assert(catalog.activities.some(a => a.id === id))
})
test('ratings and optional details stay independent across directions and different sensory interests', () => {
  let marks = setSensoryRating({}, 'hear_whisper', 'love')
  marks = setSensoryRating(marks, 'give_whisper', 'hard_limit')
  marks = setSensoryDetails(marks, 'hear_whisper', { choices: ['Hearing their breath'], note: 'Private whisper note' })
  assert.equal(marks.hear_whisper.rating, 'love')
  assert.equal(marks.give_whisper.rating, 'hard_limit')
  assert(!marks.hear_voice && !marks.hear_pleasure)
  marks = setSensoryRating(marks, 'hear_whisper', 'hard_limit')
  assert.deepEqual(marks.hear_whisper, { rating: 'hard_limit' })
  assert.deepEqual(setSensoryDetails(marks, 'hear_whisper', { note: 'ignored' }), marks)
  marks = setSensoryRating(marks, 'hear_whisper', 'hard_limit')
  assert(!marks.hear_whisper)
  assert.equal(marks.give_whisper.rating, 'hard_limit')
})
test('private reload and backups retain sensory qualities and notes alongside prior category answers', () => {
  const app = createAppState(fantasy, catalog)
  app.exploration.sensoryInterests = setSensoryDetails(setSensoryRating({}, 'smell_partner', 'fetish'), 'smell_partner', { choices: ['Woody', 'Spicy'], note: 'Private fragrance note' })
  app.exploration.featureInterests = { tattoos: { answers: { trace_partner: 'hard_limit' } } }
  app.exploration.contextInterests = { hotel: { rating: 'hard_limit' } }
  app.exploration.materialInterests = { leather: { rating: 'no' } }
  const restored = normalizeAppState(fantasy, catalog, parsePrivateBackup(buildPrivateBackup(app, fantasy, catalog), catalog, fantasy))
  for (const field of ['sensoryInterests', 'featureInterests', 'contextInterests', 'materialInterests']) assert.deepEqual(restored.exploration[field], app.exploration[field])
})
test('public sensory sharing keeps exact ratings and No but strips private qualities and notes', () => {
  const app = createAppState(fantasy, catalog)
  let marks = setSensoryRating({}, 'smell_partner', 'love')
  marks = setSensoryRating(marks, 'partner_smells_me', 'no')
  app.exploration.sensoryInterests = setSensoryDetails(marks, 'smell_partner', { choices: ['Woody'], note: 'Private fragrance note' })
  const share = buildPartnerShareExport(app, catalog)
  assert.deepEqual(share.sensoryInterests, { smell_partner: { rating: 'love' }, partner_smells_me: { rating: 'no' } })
  assert(!JSON.stringify(share).includes('Private fragrance note'))
  assert(!JSON.stringify(share).includes('Woody'))
  assert.deepEqual(parsePartnerShareExport(share, catalog).sensoryInterests, share.sensoryInterests)
  share.sensoryInterests.smell_partner.rating = 'invalid'
  assert.throws(() => parsePartnerShareExport(share, catalog))
  assert.throws(() => normalizeSensoryInterests({ hear_voice: { rating: 'love', choices: ['Woody'] } }, { strict: true }))
})
test('sensory ratings never invent or alter body-scent, physical-sensation or activity answers', () => {
  const app = createAppState(fantasy, catalog)
  app.activities.answers.give_massage = { stance: 'want', details: {}, note: '' }
  app.activities.answers.body_scented_body_area_partner_scent = { stance: 'dont_want', details: {}, note: '' }
  app.exploration.sensoryInterests = setSensoryRating({}, 'smell_partner', 'love')
  const restored = normalizeAppState(fantasy, catalog, app)
  assert.deepEqual(Object.keys(restored.activities.answers).sort(), ['body_scented_body_area_partner_scent', 'give_massage'])
  assert.equal(restored.activities.answers.give_massage.stance, 'want')
  assert.equal(restored.activities.answers.body_scented_body_area_partner_scent.stance, 'dont_want')
})
test('sensory collection can finish unmarked, supports reload/Back, and replaces the old question backlog', () => {
  const app = createAppState(fantasy, catalog), state = { ...app.activities, exploration: app.exploration }
  for (const activity of catalog.activities) state.answers[activity.id] = { stance: 'curious' }
  let g = resumeGuidedFlow(catalog, state, { ...createGuided(), bodyMapComplete: true, materialsComplete: true, roleplayComplete: true, contextsComplete: true, featuresComplete: true, tattoosComplete: true, scentComplete: true, toysComplete: true })
  assert.equal(g.topicId, 'sensory_fetishes')
  assert.equal(g.trail.length, 0)
  app.exploration.guided = g
  g = normalizeAppState(fantasy, catalog, app).exploration.guided
  assert.equal(resumeGuidedFlow(catalog, state, g), g)
  const next = advanceGuidedFlow(catalog, state, g)
  assert(next.sensoryComplete && next.flowComplete)
  const previous = backGuidedFlow(next)
  assert.equal(previous.topicId, 'sensory_fetishes')
  assert(!previous.done)
  assert.deepEqual(app.exploration.sensoryInterests, {})
  const empty = { ...app.activities, answers: {}, exploration: app.exploration }
  assert(filterActivities(catalog, empty).every(a => a.categoryId !== 'sensory_fetishes'))
  const oldIds = new Set(catalog.activities.filter(a => a.categoryId === 'sensory_fetishes').map(a => a.id))
  assert(groupActivityResults(catalog, empty).unansweredIds.every(id => !oldIds.has(id)))
})
