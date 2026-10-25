import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createActivityState, setActivityStance, detailFieldsForActivity, setActivityExperience, saveActivityEdit, normalizeActivityState } from '../src/lib/activityProfile.js'
import { createExploration, normalizeExploration } from '../src/lib/explorationState.js'
import { createGuided, chooseGuidedTopic, advanceGuided, guidedQueue, nextPreferencePrompt, finishPreferencePrompt, preferenceKey, sharedFields, resumeGuidedFlow, advanceGuidedFlow, backGuidedFlow } from '../src/lib/guidedExploration.js'
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
function exploredPower() {
  const s=state(), ids=['give_commands','rule_setting','direct_behavioral_control']
  for(const id of ids)s.answers[id]={stance:'curious',details:{},note:''}
  const g={...createGuided(),topicId:'power_exchange',trail:ids,cursor:2}
  return {s,g}
}
test('broader preferences are asked after relevant examples and require a separate explicit answer', () => {
  const {s,g}=exploredPower(),a=catalog.activities.find(a=>a.id==='give_commands'),b=catalog.activities.find(a=>a.id==='receive_commands')
  const before={...s,answers:{give_commands:s.answers.give_commands}}
  assert.equal(nextPreferencePrompt(catalog,before,g),null)
  const prompt=nextPreferencePrompt(catalog,s,g)
  assert.equal(prompt.fieldId,'tone')
  assert.equal(prompt.exampleIds.length,3)
  assert.deepEqual(prompt.value,[])
  const pending={...g,pendingPreference:prompt}
  assert.equal(finishPreferencePrompt(catalog,s,pending,'remember'),pending)
  const remembered=finishPreferencePrompt(catalog,s,{...g,pendingPreference:{...prompt,value:['playful']}},'remember')
  const field=sharedFields(catalog,a).find(f=>f.id==='tone'),key=preferenceKey(a,field)
  assert.deepEqual(remembered.defaults[key],['playful'])
  assert(!remembered.defaults[preferenceKey(b,field)])
  assert.deepEqual(s.answers.give_commands.details,{})
  assert.deepEqual(normalizeExploration({guided:remembered},catalog).guided.defaults,remembered.defaults)
})
test('broader prompts allow uncertainty while avoiding negative activities and malformed defaults', () => {
  const {s,g}=exploredPower()
  for(const stance of ['dont_want','hard_limit','soft_limit']){
    const changed={...s,answers:{...s.answers,direct_behavioral_control:{stance,details:{}}}}
    assert.equal(nextPreferencePrompt(catalog,changed,g),null)
  }
  s.answers.direct_behavioral_control.stance='not_sure'
  assert(nextPreferencePrompt(catalog,s,g))
  assert.deepEqual(normalizeExploration({guided:{defaults:{'power_exchange/directing/tone':['invented']}}},catalog).guided.defaults,{})
})
test('tone and scope are separate prompts spaced by more activity answers', () => {
  const {s,g}=exploredPower(),prompt=nextPreferencePrompt(catalog,s,g)
  const remembered=finishPreferencePrompt(catalog,s,{...g,pendingPreference:{...prompt,value:['playful']}},'remember')
  assert.equal(nextPreferencePrompt(catalog,s,remembered),null)
  for(const id of ['direct_reward_system','give_speech_control','give_eye_contact_rules'])s.answers[id]={stance:'curious',details:{},note:''}
  const next={...remembered,trail:[...g.trail,'direct_reward_system','give_speech_control','give_eye_contact_rules'],cursor:5}
  assert.equal(nextPreferencePrompt(catalog,s,next).fieldId,'role_scope')
})
test('pending broader questions survive reload and uncertainty decisions do not invent defaults or activity answers', () => {
  const {s,g}=exploredPower(),prompt=nextPreferencePrompt(catalog,s,g)
  const pending={...g,pendingPreference:{...prompt,value:['formal']}}
  const restored=normalizeExploration({guided:pending},catalog).guided
  assert.deepEqual(restored.pendingPreference,pending.pendingPreference)
  for(const decision of ['unsure','depends']){
    const finished=finishPreferencePrompt(catalog,s,restored,decision)
    assert.equal(finished.pendingPreference,null)
    assert.deepEqual(finished.defaults,{})
    assert.equal(nextPreferencePrompt(catalog,s,finished),null)
  }
  assert.deepEqual(s.answers.direct_behavioral_control.details,{})
})
test('guided history and remembered preferences stay out of partner sharing', () => {
  const s = state()
  s.exploration.guided = { ...createGuided(), topicId: 'power_exchange', trail: ['give_commands'], cursor: 0, defaults: { 'power_exchange/directing/tone': ['playful'] }, pendingPreference: {activityId:'give_commands',fieldId:'role_scope',exampleIds:['give_commands'],value:'ongoing'} }
  const result = buildShareProjection(catalog, s)
  assert(result.allowed)
  const output = JSON.stringify(result.payload)
  assert(!output.includes('guided')); assert(!output.includes('playful')); assert(!output.includes('trail')); assert(!output.includes('ongoing'))
})

test('each updated category presents a concrete main question with category-specific optional shared fields', () => {
  for (const categoryId of ['power_exchange', 'service_protocol', 'bondage_restraint', 'rope_bondage', 'sensory_deprivation', 'impact_play']) {
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
  const defaults = { [preferenceKey(a, shared[0])]:answer.details.restraint_atmosphere }
  const restored = normalizeExploration({guided:{...createGuided(),defaults}},catalog)
  assert.deepEqual(restored.guided.defaults, defaults)
  const gag = detailFieldsForActivity(catalog, catalog.activities.find(a => a.id === 'be_gagged'))
  assert(!gag.some(f => ['restriction','preferred_positions','preferred_areas','duration','methods'].includes(f.id)))
})
test('learning metadata leaves unrelated sensation and rough-play topics unchanged', () => {
  const s = state(), g = chooseGuidedTopic(catalog, s, createGuided(), 'sensation_play')
  assert(guidedQueue(catalog, s, g).every(a => a.categoryId === 'sensation_play'))
  assert(catalog.activities.filter(a => a.categoryId === 'sensation_play').every(a => a.detailProfileId === 'sensation' && !a.learning))
  assert(catalog.activities.filter(a => a.categoryId === 'rough_physical').every(a => a.detailProfileId === 'impact' && !a.learning))
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

test('rope decoration recommends its own branch without assuming restriction or suspension', () => {
  let s = state(), g = chooseGuidedTopic(catalog, s, createGuided(), 'rope_bondage')
  s = setActivityStance(s, 'give_rope_bondage_general', 'curious')
  s.answers.give_rope_bondage_general.details = {rope_interest:['choice_1']}
  const queue = guidedQueue(catalog, s, g)
  assert.equal(queue[0].id, 'give_decorative_rope')
  assert(queue.some(a => a.id === 'give_full_suspension'))
  assert(!s.answers.give_full_suspension)
  assert.deepEqual(sharedFields(catalog, queue[0]).map(f => f.id), ['rope_atmosphere'])
  s = setActivityStance(s, 'give_rope_bondage_general', 'dont_want')
  assert(!guidedQueue(catalog, s, g).some(a => a.id === 'give_full_suspension'))
})
test('sensory controls ask distinct questions without transferring a preference for combined effects', () => {
  const fields = id => detailFieldsForActivity(catalog,catalog.activities.find(a => a.id === id))
  assert.equal(fields('give_silence')[0].id,'speech_limits')
  assert.equal(fields('give_mittens_hand_control')[0].id,'hand_cover_interest')
  assert.equal(fields('give_sensory_overload')[0].id,'overload_interest')
  const a = catalog.activities.find(a => a.id === 'give_blindfolds'), b = catalog.activities.find(a => a.id === 'receive_blindfolds')
  const shared=sharedFields(catalog,a)
  assert.deepEqual(shared.map(f=>f.id),['sensory_atmosphere'])
  assert.notEqual(preferenceKey(a,shared[0]),preferenceKey(b,shared[0]))
})
test('impact rhythm choices prioritize rhythm without carrying over force, marks, or equipment', () => {
  let s=state(),g=chooseGuidedTopic(catalog,s,createGuided(),'impact_play')
  s=setActivityStance(s,'give_hand_spanking','curious')
  s.answers.give_hand_spanking.details={impact_pacing:['choice_2']}
  const queue=guidedQueue(catalog,s,g)
  assert.equal(queue[0].id,'give_rhythmic_impact')
  assert(!s.answers.give_impact_marks)
  const a=catalog.activities.find(a=>a.id==='give_hand_spanking')
  assert.deepEqual(sharedFields(catalog,a).map(f=>f.id),['impact_atmosphere'])
  assert(!detailFieldsForActivity(catalog,a).some(f=>f.type==='paired_select'))
})

test('automatic entry follows the recommended category order without requiring topic selection', () => {
  const s=state()
  s.navigation.categoryOrder=['service_protocol','power_exchange',...s.navigation.categoryOrder.filter(id=>!['service_protocol','power_exchange'].includes(id))]
  const g=resumeGuidedFlow(catalog,s,createGuided())
  assert.equal(g.topicId,'service_protocol')
  assert.equal(g.trail[g.cursor],'service_receiving')
  assert.equal(resumeGuidedFlow(catalog,s,g),g)
})
test('finishing a category advances automatically and Back preserves the last answer across the transition', () => {
  const s=state()
  for(const a of catalog.activities.filter(a=>a.categoryId==='power_exchange'))s.answers[a.id]={stance:'curious',details:{},note:''}
  const g={...createGuided(),topicId:'power_exchange',trail:['give_commands'],cursor:0}
  const next=advanceGuidedFlow(catalog,s,g)
  assert.equal(next.topicId,'service_protocol')
  assert(!next.done)
  assert.equal(s.answers.give_commands.stance,'curious')
  assert.equal(next.topicHistory.length,1)
  const restored=normalizeExploration({guided:next},catalog).guided
  assert.deepEqual(restored.topicHistory,next.topicHistory)
  const previous=backGuidedFlow(restored)
  assert.equal(previous.topicId,'power_exchange')
  assert.equal(previous.trail[previous.cursor],'give_commands')
})
test('skipped questions remain skipped across automatic category changes and the flow eventually ends', () => {
  const s=state()
  for(const a of catalog.activities)s.answers[a.id]={stance:'curious',details:{},note:''}
  delete s.answers.give_commands;delete s.answers.service_receiving
  let g=resumeGuidedFlow(catalog,s,{...createGuided(),bodyMapComplete:true,materialsComplete:true,roleplayComplete:true,contextsComplete:true,featuresComplete:true,tattoosComplete:true,sensoryComplete:true,scentComplete:true,toysComplete:true})
  assert.equal(g.topicId,'power_exchange')
  g=advanceGuidedFlow(catalog,s,g,true)
  assert.equal(g.topicId,'service_protocol')
  assert(g.skippedIds.includes('give_commands'))
  g=advanceGuidedFlow(catalog,s,g,true)
  assert(g.flowComplete)
  assert(g.done)
  assert.deepEqual(g.skippedIds,['give_commands','service_receiving'])
  assert(!s.answers.give_commands&&!s.answers.service_receiving)
  assert.equal(resumeGuidedFlow(catalog,s,g),g)
})
test('the body map participates once in the automatic path and remains available through Back', () => {
  const s=state();s.navigation.categoryOrder=['body_part_fetishes',...s.navigation.categoryOrder.filter(id=>id!=='body_part_fetishes')]
  let g=resumeGuidedFlow(catalog,s,createGuided())
  assert.equal(g.topicId,'body_part_fetishes')
  g=advanceGuidedFlow(catalog,s,g)
  assert(g.bodyMapComplete)
  assert.equal(g.topicId,'power_exchange')
  assert.equal(backGuidedFlow(g).topicId,'body_part_fetishes')
  assert(normalizeExploration({guided:g},catalog).guided.bodyMapComplete)
})

test('experience can be recorded, restored, cleared, and carried into a later stance without inventing an answer', () => {
  let s=state()
  s=saveActivityEdit(s,'give_commands',draft=>setActivityExperience(draft,'give_commands','tried_once'))
  assert.equal(s.drafts.give_commands.experience,'tried_once')
  assert(!s.answers.give_commands)
  assert.equal(buildShareProjection(catalog,s).payload.activities.answers.give_commands,undefined)
  const restored=normalizeActivityState(catalog,s)
  assert.equal(restored.drafts.give_commands.experience,'tried_once')
  s={...s,...restored}
  s=saveActivityEdit(s,'give_commands',draft=>setActivityExperience(draft,'give_commands',''))
  assert(!s.drafts.give_commands)
  s=saveActivityEdit(s,'give_commands',draft=>setActivityExperience(draft,'give_commands','some_experience'))
  s=saveActivityEdit(s,'give_commands',draft=>setActivityStance(draft,'give_commands','curious'))
  assert.equal(s.answers.give_commands.experience,'some_experience')
  assert.equal(s.answers.give_commands.stance,'curious')
  assert(!s.drafts.give_commands)
})
