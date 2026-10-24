import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createActivityState, setActivityStance, detailFieldsForActivity } from '../src/lib/activityProfile.js'
import { createExploration, normalizeExploration } from '../src/lib/explorationState.js'
import { createGuided, chooseGuidedTopic, advanceGuided, guidedQueue, preferenceOffer, preferenceKey, sharedFields } from '../src/lib/guidedExploration.js'
import { buildShareProjection } from '../src/lib/boundaryReview.js'
const catalog = JSON.parse(readFileSync(new URL('../src/data/activityCatalog.json', import.meta.url)))
const state = () => ({ ...createActivityState(catalog), exploration: createExploration() })

test('guided entry selects a topic and presents broader activities before their subtypes', () => {
  const s = state(), g = chooseGuidedTopic(catalog, s, createGuided(), 'power_exchange')
  assert.equal(g.trail.length, 1)
  assert.equal(g.trail[0], 'give_commands')
  assert(guidedQueue(catalog, s, g).every(a => a.categoryId === 'power_exchange'))
  assert.equal(createGuided().topicId, null)
})
test('answering stays on the current question until Continue, and Back retraces the path', () => {
  let s = state(), g = chooseGuidedTopic(catalog, s, createGuided(), 'power_exchange')
  const first = g.trail[0]
  s = setActivityStance(s, first, 'curious')
  assert.equal(g.trail[g.cursor], first)
  g = advanceGuided(catalog, s, g)
  assert.notEqual(g.trail[g.cursor], first)
  g = { ...g, cursor: g.cursor - 1 }
  assert.equal(g.trail[g.cursor], first)
  const next = advanceGuided(catalog, s, g)
  assert.equal(next.cursor, 1)
  assert.equal(next.trail.length, 2)
})
test('Skip saves no stance, survives reload, and completion preserves the back history', () => {
  const s = state(); let g = chooseGuidedTopic(catalog, s, createGuided(), 'power_exchange')
  const first = g.trail[0]
  g = advanceGuided(catalog, s, g, true)
  assert(g.skippedIds.includes(first)); assert(!s.answers[first])
  const restored = normalizeExploration({ ...s.exploration, guided: g }, catalog).guided
  assert.deepEqual(restored, g)
  let count = 0
  while (!g.done && count++ < 100) g = advanceGuided(catalog, s, g, true)
  assert(g.done); assert(count < 100); assert(g.trail.length > 0)
  assert.equal(Object.keys(s.answers).length, 0)
})
test('a declined parent removes unanswered descendants but keeps previously answered descendants', () => {
  let s = state(), g = chooseGuidedTopic(catalog, s, createGuided(), 'power_exchange')
  s = setActivityStance(s, 'give_masturbation_control', 'curious')
  s = setActivityStance(s, 'give_commands', 'dont_want')
  const queue = guidedQueue(catalog, s, g)
  assert(!queue.some(a => a.id === 'give_masturbation_control'))
  assert.equal(s.answers.give_masturbation_control.stance, 'curious')
  const children = catalog.relationships.filter(r => r.type === 'subtype' && r.fromId === 'give_commands').map(r => r.toId)
  assert(children.length > 0)
  assert(!queue.some(a => children.includes(a.id)))
})
test('newly suppressed future questions are skipped when retracing forward', () => {
  let s = state(), g = { ...createGuided(), topicId: 'power_exchange', trail: ['direct_sexual_access_control', 'give_masturbation_control'], cursor: 0 }
  s = setActivityStance(s, 'direct_sexual_access_control', 'dont_want')
  g = advanceGuided(catalog, s, g)
  assert.notEqual(g.trail[g.cursor], 'give_masturbation_control')
})
test('shared preferences require an explicit local choice and remain separate for directing and following', () => {
  const a = catalog.activities.find(a => a.id === 'give_commands'), b = catalog.activities.find(a => a.id === 'receive_commands'), g = createGuided()
  assert.equal(preferenceOffer(catalog, a, { stance: 'curious', details: {} }, g), null)
  const answer = { stance: 'curious', details: { tone: ['playful'] } }, offer = preferenceOffer(catalog, a, answer, g)
  assert(offer)
  const remembered = { ...g, decisions: { [offer.key]: 'remember' }, defaults: { [offer.key]: offer.value } }
  assert.equal(preferenceOffer(catalog, a, answer, remembered), null)
  const other = preferenceKey(b, sharedFields(catalog, b).find(f => f.id === 'tone'))
  assert.notEqual(offer.key, other); assert(!remembered.defaults[other])
  assert.deepEqual(answer.details, { tone: ['playful'] })
  assert.deepEqual(normalizeExploration({ guided: remembered }, catalog).guided.defaults, remembered.defaults)
})
test('shared preference prompts respect uncertainty and limits, and malformed defaults are discarded', () => {
  const a = catalog.activities.find(a => a.id === 'give_commands'), g = createGuided()
  for (const stance of ['dont_want', 'hard_limit', 'not_sure', 'soft_limit']) assert.equal(preferenceOffer(catalog, a, { stance, details: { tone: ['strict'] } }, g), null)
  assert.deepEqual(normalizeExploration({ guided: { defaults: { 'power_exchange/directing/tone': ['invented'] } } }, catalog).guided.defaults, {})
})
test('guided history and remembered preferences stay out of partner sharing', () => {
  const s = state()
  s.exploration.guided = { ...createGuided(), topicId: 'power_exchange', trail: ['give_commands'], cursor: 0, defaults: { 'power_exchange/directing/tone': ['playful'] } }
  const result = buildShareProjection(catalog, s)
  assert(result.allowed)
  const output = JSON.stringify(result.payload)
  assert(!output.includes('guided')); assert(!output.includes('playful')); assert(!output.includes('trail'))
})

test('each updated category presents a concrete main question with category-specific optional shared fields', () => {
  for (const categoryId of ['power_exchange', 'service_protocol', 'bondage_restraint']) {
    const rows = catalog.activities.filter(a => a.categoryId === categoryId)
    assert(rows.length > 0)
    for (const a of rows) {
      const fields = detailFieldsForActivity(catalog, a)
      assert.equal(fields[0].id, a.learning.primaryDetailFieldId, a.id)
      assert(!fields[0].sharedPreference, a.id)
      assert(a.learning.examples.length >= 2, a.id)
      assert(sharedFields(catalog, a).length > 0, a.id)
    }
  }
})
test('service preferences follow the service role, including activities whose give/receive IDs are misleading', () => {
  const givingService = catalog.activities.find(a => a.id === 'service_submission')
  const receivingService = catalog.activities.find(a => a.id === 'give_domestic_service')
  const attending = catalog.activities.find(a => a.id === 'give_waiting_attending')
  const providing = catalog.activities.find(a => a.id === 'receive_personal_service')
  const key = a => preferenceKey(a, sharedFields(catalog, a).find(f => f.id === 'tone'))
  assert.equal(key(givingService), key(providing))
  assert.equal(key(receivingService), key(attending))
  assert.notEqual(key(givingService), key(receivingService))
  for (const id of ['direct_standing_rules','follow_standing_rules']) {
    const fields = detailFieldsForActivity(catalog, catalog.activities.find(a => a.id === id))
    assert(!fields.some(f => f.id === 'role_scope'))
    assert.equal(fields.filter(f => !f.sharedPreference).length, 1)
  }
})
test('restraint preferences remember atmosphere without carrying equipment, duration, or restriction choices', () => {
  const a = catalog.activities.find(a => a.id === 'give_cuffs'), b = catalog.activities.find(a => a.id === 'receive_cuffs')
  const shared = sharedFields(catalog, a)
  assert.deepEqual(shared.map(f => f.id), ['restraint_atmosphere'])
  assert.notEqual(preferenceKey(a, shared[0]), preferenceKey(b, shared[0]))
  const answer = { stance:'curious', details:{ cuff_arrangement:['choice_1'], restraint_atmosphere:['choice_2'] } }
  const offer = preferenceOffer(catalog, a, answer, createGuided())
  assert.equal(offer.field.id, 'restraint_atmosphere')
  const defaults = { [offer.key]:offer.value }
  const restored = normalizeExploration({guided:{...createGuided(),defaults}},catalog)
  assert.deepEqual(restored.guided.defaults, defaults)
  const gag = detailFieldsForActivity(catalog, catalog.activities.find(a => a.id === 'be_gagged'))
  assert(!gag.some(f => ['restriction','preferred_positions','preferred_areas','duration','methods'].includes(f.id)))
})
test('learning metadata does not change filtering relationships or saved answers in other topics', () => {
  const s = state(), g = chooseGuidedTopic(catalog, s, createGuided(), 'rope_bondage')
  assert(guidedQueue(catalog, s, g).every(a => a.categoryId === 'rope_bondage'))
  assert(catalog.activities.filter(a => a.categoryId === 'rope_bondage').every(a => a.detailProfileId === 'bondage' && !a.learning))
  assert(catalog.activities.filter(a => a.categoryId === 'sensory_deprivation').every(a => a.detailProfileId === 'bondage' && !a.learning))
})

test('explicit detail interests prioritize matching follow-ups without treating unselected choices as rejection', () => {
  let s = state(), g = chooseGuidedTopic(catalog, s, createGuided(), 'service_protocol')
  s = setActivityStance(s, 'service_receiving', 'curious')
  s.answers.service_receiving.details = {service_kinds:['choice_1']}
  let queue = guidedQueue(catalog, s, g)
  assert(queue.findIndex(a => a.id === 'give_domestic_service') < queue.findIndex(a => a.id === 'service_submission'))
  assert(queue.findIndex(a => a.id === 'direct_task_assignment') < queue.findIndex(a => a.id === 'give_domestic_service'))
  assert(queue.some(a => a.id === 'give_sexual_service'))
  s = setActivityStance(s, 'direct_task_assignment', 'dont_want')
  queue = guidedQueue(catalog, s, g)
  assert(!queue.some(a => a.id === 'give_domestic_service'))
  assert(!s.answers.give_domestic_service)
})
