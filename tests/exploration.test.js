import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createExploration, bodyFactsFromSelection, normalizeExploration } from '../src/lib/explorationState.js'
import { createEligibilityContext, evaluateActivity, fantasyEvidence } from '../src/lib/eligibility.js'
import { createActivityState, filterActivities, saveActivityEdit, setActivityStance, setActivityExperience, setActivityNote, undoActivityEdit } from '../src/lib/activityProfile.js'
import { attractionFits, filterQuestions, questionLimit } from '../src/lib/explorationFilters.js'
import { resolveAppRoute, normalizeAppState, createAppState } from '../src/lib/appState.js'
const c = JSON.parse(readFileSync(new URL('../src/data/activityCatalog.json', import.meta.url)))
const f = JSON.parse(readFileSync(new URL('../src/data/fantasyProfile.json', import.meta.url)))
const metric = (score) => ({ score, observations: 4, contradictory: false, band: score >= 1.1 ? 'strong' : score >= .35 ? 'notable' : score <= -1.1 ? 'negative' : 'low' })
const evidence = (dim, perspective, score) => ({ metrics: { [dim]: { ...metric(score), perspectives: { [perspective]: metric(score) } } } })
const state = () => ({ ...createActivityState(c), exploration: createExploration() })
function visible(s, id, e = null) {
  return evaluateActivity(c.activities.find((a) => a.id === id), createEligibilityContext(c, s, e)).queueVisible
}
test('strong versus weaker power scores filter opposite-side intensity, not oral receiving', () => {
  const s = state()
  const strong = evidence('authority_responsibility', 'experience_self', 1.7)
  const weaker = evidence('authority_responsibility', 'experience_self', .6)
  assert.equal(visible(s, 'receive_wrist_restraint', strong), false)
  assert.equal(visible(s, 'receive_hand_spanking', strong), false)
  assert.equal(visible(s, 'receive_hand_spanking', weaker), true)
  assert.equal(visible(s, 'receive_flogging', weaker), false)
  assert.equal(visible(s, 'receive_blowjob', strong), true)
  assert.equal(visible(s, 'give_hand_spanking', strong), true)
  assert.equal(visible(s, 'give_hand_spanking', evidence('surrender', 'experience_self', 1.8)), false)
  assert.equal(visible(s, 'give_blowjob', evidence('surrender', 'experience_self', 1.8)), true)
})
test('specific interests and explicit topic settings beat a broad role inference', () => {
  const s = state(), e = evidence('authority_responsibility', 'experience_self', 1.8)
  e.metrics.pain_intensity = { perspectives: { receive: metric(1.8) } }
  assert.equal(visible(s, 'receive_flogging', e), true)
  s.exploration.topicPreferences['impact_play/pain_intensity/receive'] = 1
  assert.equal(visible(s, 'receive_flogging', e), false)
  assert.equal(visible(s, 'receive_hand_spanking', e), true)
  s.exploration.topicPreferences['impact_play/pain_intensity/receive'] = 0
  assert.equal(visible(s, 'receive_hand_spanking', e), false)
  assert.equal(visible(s, 'give_hand_spanking', e), true)
  assert.deepEqual(normalizeExploration(s.exploration, c).topicPreferences, s.exploration.topicPreferences)
})
test('missing and mixed fantasy evidence stays open and asks a concrete clarification', () => {
  const s = state(), q = filterQuestions('impact_play')[1]
  assert.equal(questionLimit(q, s.exploration, null), null)
  assert.equal(visible(s, 'receive_flogging'), true)
  const e = evidence('pain_intensity', 'receive', .6)
  e.metrics.pain_intensity.perspectives.receive.contradictory = true
  assert.equal(questionLimit(q, s.exploration, e), null)
  e.metrics.pain_intensity.perspectives.receive.contradictory = false
  assert.equal(questionLimit(q, s.exploration, e), 1)
})
test('attraction anatomy filters the partner, body facts filter self, and anal is independent', () => {
  const s = state()
  s.exploration.facts = bodyFactsFromSelection(['penis'])
  s.attraction = { partnerAnatomy: ['vagina'] }
  assert.equal(visible(s, 'give_blowjob'), false)
  assert.equal(visible(s, 'receive_blowjob'), true)
  assert.equal(visible(s, 'give_vulva_oral'), true)
  assert.equal(visible(s, 'receive_vulva_oral'), false)
  assert.equal(visible(s, 'give_anal_touch'), true)
  s.attraction.partnerAnatomy = ['penis']
  assert.equal(visible(s, 'give_vulva_oral'), false)
  assert.equal(visible(s, 'give_blowjob'), true)
  s.attraction.partnerAnatomy = ['depends_person']
  assert.equal(visible(s, 'give_vulva_oral'), true)
  assert.equal(visible(s, 'give_blowjob'), true)
  assert.equal(attractionFits({ partnerGenders: ['men'] }, { partnerGender: ['women'] }), false)
  assert.equal(attractionFits({}, { partnerGender: ['women'] }), true)
})
test('auto-save keeps cards, experience and notes; declining a parent hides only unanswered subtype follow-ups', () => {
  let s = state()
  const id = 'give_rope_bondage_general', child = 'give_decorative_rope'
  s = saveActivityEdit(s, child, (x) => setActivityStance(x, child, 'want'))
  s = saveActivityEdit(s, id, (x) => setActivityStance(x, id, 'dont_want'))
  assert.equal(visible(s, id), true)
  assert.equal(visible(s, child), true)
  assert.equal(visible(s, 'give_functional_rope'), false)
  assert.equal(visible(s, 'receive_functional_rope'), true)
  assert.ok(filterActivities(c, s).some((a) => a.id === id))
  s = saveActivityEdit(s, id, (x) => setActivityExperience(x, id, 'tried_once'))
  s = saveActivityEdit(s, id, (x) => setActivityNote(x, id, 'Example test note'))
  assert.equal(s.answers[id].note, 'Example test note')
  assert.equal(s.answers[id].experience, 'tried_once')
  s = undoActivityEdit(s)
  assert.equal(s.answers[id].note, '')
  assert.equal(s.answers[id].experience, 'tried_once')
  assert.equal(s.drafts[id], undefined)
})
test('direct entry and restored explorer routes require the body screen first', () => {
  assert.equal(resolveAppRoute('activity_explorer', { adultConfirmed: true }, { aboutYouComplete: false }), 'about_you')
  assert.equal(resolveAppRoute('activity_explorer', { adultConfirmed: true }, { aboutYouComplete: true, complete: false }), 'basics')
  const app = createAppState(f, c)
  app.route = 'activity_explorer'; app.settings.adultConfirmed = true
  const restored = normalizeAppState(f, c, app)
  assert.equal(restored.route, 'about_you')
  assert.equal(restored.basics.nextRoute, 'activity_explorer')
})
test('real active fantasy answers produce graded filters without confirming roles', () => {
  const app = createAppState(f, c)
  app.fantasy.questionSequence = f.questions.filter((q) => q.stage === 'core').map((q) => q.id)
  app.fantasy.answers = Object.fromEntries(app.fantasy.questionSequence.map((id) => [id, f.questions.find((q) => q.id === id).signals.some((l) => l.dimensionId === 'authority_responsibility' && l.perspective === 'experience_self') ? 'strong_turn_on' : 'neutral']))
  const e = fantasyEvidence(f, app.fantasy)
  assert.ok(e.metrics.authority_responsibility.perspectives.experience_self.score > 1.1)
  assert.equal(visible(state(), 'receive_flogging', e), false)
})

test('manual topic choices stay within the category and unsure leaves it unrestricted', () => {
  const s = state()
  s.exploration.topicPreferences['impact_play/pain_intensity/receive'] = 0
  assert.equal(visible(s, 'receive_hand_spanking'), false)
  assert.equal(visible(s, 'receive_biting'), true)
  s.exploration.topicPreferences['impact_play/pain_intensity/receive'] = -1
  const e = evidence('authority_responsibility', 'experience_self', 1.8)
  assert.equal(visible(s, 'receive_flogging', e), true)
  assert.equal(visible(s, 'receive_wrist_restraint', e), false)
  assert.deepEqual(normalizeExploration(s.exploration, c).topicPreferences, s.exploration.topicPreferences)
  s.exploration.topicPreferences['power/give'] = 3
  assert.equal(visible(s, 'receive_wrist_restraint'), false)
  assert.equal(visible(s, 'receive_blowjob'), true)
})

test('explorer puts broader activities before their subtypes in every category and the mixed view', () => {
  for (const categoryId of ['all', ...c.categories.map((category) => category.id)]) {
    const s = state()
    const rows = filterActivities(c, s, { categoryId, showHidden: true })
    const positions = new Map(rows.map((row, index) => [row.id, index]))
    for (const relation of c.relationships) {
      if (relation.type !== 'subtype' || !positions.has(relation.fromId) || !positions.has(relation.toId)) continue
      assert.ok(positions.get(relation.fromId) < positions.get(relation.toId), `${categoryId}: ${relation.fromId} before ${relation.toId}`)
    }
  }
})

test('broad-first ordering keeps search results scoped and works through filtered intermediate activities', () => {
  const catalog = {
    ...c,
    routingPrompts: [],
    activities: ['specific', 'middle', 'broad'].map((id) => ({ ...c.activities[0], id, label: id, description: '' })),
    relationships: [
      { id: 'broad-middle', type: 'subtype', fromId: 'broad', toId: 'middle' },
      { id: 'middle-specific', type: 'subtype', fromId: 'middle', toId: 'specific' }
    ]
  }
  const s = state()
  assert.deepEqual(filterActivities(catalog, s, { categoryId: 'all', showHidden: true, search: 'specific' }).map((row) => row.id), ['specific'])
  catalog.activities[0].label = 'a match'
  catalog.activities[2].label = 'z match'
  assert.deepEqual(filterActivities(catalog, s, { categoryId: 'all', showHidden: true, search: 'match' }).map((row) => row.id), ['broad', 'specific'])
})
