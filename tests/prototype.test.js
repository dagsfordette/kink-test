import { fantasyRoleBreakdown, buildFantasyResults } from '../src/lib/fantasyResults.js'
import { scoreFantasyProfile } from '../src/lib/fantasyProfile.js'
import { bodyFactsFromSelection } from '../src/lib/explorationState.js'
import { BASICS_FIELDS } from '../src/lib/basicsProfile.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createAppState, normalizeAppState } from '../src/lib/appState.js'
import {
  editActivityDraft,
  setActivityStance,
  setActivityExperience,
  setActivityNote,
  setActivityDetails,
  saveActivityDraft,
  undoActivitySave,
  comparisonProfileFromActivityState,
  filterActivities
} from '../src/lib/activityProfile.js'
import {
  reconcileFantasyState,
  answerFantasyQuestion,
  activeFantasyAnswers
} from '../src/lib/fantasyRouting.js'
import {
  buildPrivateBackup,
  parsePrivateBackup,
  buildPartnerShareExport,
  parsePartnerShareExport
} from '../src/lib/profileExports.js'
import {
  chooseBoundaryScope,
  acknowledgeException,
  buildShareProjection
} from '../src/lib/boundaryReview.js'
import {
  createEligibilityContext,
  evaluateActivity
} from '../src/lib/eligibility.js'
import {
  startSession,
  recordSessionAction,
  sessionProgress
} from '../src/lib/explorationSessions.js'
import { compareActivityProfiles } from '../src/lib/activityComparison.js'
const load = (name) =>
  JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url)))
const c = load('activityCatalog'),
  f = load('fantasyProfile')
const fresh = () => createAppState(f, c)
const activityState = (app) => ({
  ...app.activities,
  exploration: app.exploration
})
const save = (state, id, stance, patch = {}) =>
  saveActivityDraft(
    {
      ...state,
      drafts: {
        ...state.drafts,
        [id]: { stance, details: {}, note: '', ...patch }
      }
    },
    id
  )
const asApp = (state) => ({
  ...fresh(),
  activities: {
    answers: state.answers,
    drafts: state.drafts,
    navigation: state.navigation,
    lastSave: state.lastSave
  },
  exploration: state.exploration
})

test('full draft survives filtering and reload; Save and Undo preserve its contents', () => {
  const id = 'give_massage'
  let state = activityState(fresh())
  for (const update of [
    (s) => setActivityStance(s, id, 'soft_limit'),
    (s) => setActivityExperience(s, id, 'some_experience'),
    (s) =>
      setActivityDetails(s, id, {
        sensation_strength: { preferred: 'light', maximum: 'moderate' }
      }),
    (s) => setActivityNote(s, id, 'PRIVATE_NOTE')
  ])
    state = editActivityDraft(state, id, update)
  assert.equal(state.answers[id], undefined)
  assert.ok(
    filterActivities(c, state, { search: 'NO_MATCH' }).some((a) => a.id === id)
  )
  state = activityState(
    normalizeAppState(
      f,
      c,
      parsePrivateBackup(buildPrivateBackup(asApp(state), f, c), c, f)
    )
  )
  assert.equal(state.drafts[id].note, 'PRIVATE_NOTE')
  assert.deepEqual(state.drafts[id].details, {
    sensation_strength: { preferred: 'light', maximum: 'moderate' }
  })
  assert.equal(
    buildPartnerShareExport(asApp(state), c).activities.answers[id],
    undefined
  )
  state = saveActivityDraft(state, id)
  const committed = state.answers[id]
  assert.equal(state.drafts[id], undefined)
  state = activityState(normalizeAppState(f, c, asApp(state)))
  state = undoActivitySave(state)
  assert.equal(state.answers[id], undefined)
  assert.deepEqual(state.drafts[id], committed)
})

test('changing an early fantasy answer keeps inactive answers and restores the route', () => {
  const answers = Object.fromEntries(
    f.questions.map((q, i) => [
      q.id,
      f.responseScale[(i * 7 + Math.floor(i / 3)) % f.responseScale.length].id
    ])
  )
  const state = reconcileFantasyState(f, { status: 'complete', answers })
  const first = state.questionSequence[0]
  let changed = false
  for (const response of f.responseScale) {
    const next = answerFantasyQuestion(f, state, first, response.id)
    assert.equal(Object.keys(next.answers).length, Object.keys(answers).length)
    assert.deepEqual(
      Object.keys(activeFantasyAnswers(next)),
      next.questionSequence.filter((id) => Object.hasOwn(next.answers, id))
    )
    changed ||=
      JSON.stringify(next.questionSequence) !==
      JSON.stringify(state.questionSequence)
    assert.deepEqual(
      answerFantasyQuestion(f, next, first, answers[first]).questionSequence,
      state.questionSequence
    )
  }
  assert.ok(changed)
})

test('branch boundaries require exact exceptions and edits require reconfirmation', () => {
  const root = 'give_rope_bondage_general',
    child = 'give_decorative_rope'
  let state = save(
    save(activityState(fresh()), root, 'hard_limit'),
    child,
    'want',
    { note: 'PRIVATE_NOTE' }
  )
  assert.equal(buildShareProjection(c, state).allowed, false)
  state = chooseBoundaryScope(c, state, root, 'branch')
  assert.equal(buildShareProjection(c, state).allowed, false)
  state = acknowledgeException(
    c,
    state,
    state.exploration.boundaries[0].id,
    child
  )
  assert.equal(buildShareProjection(c, state).allowed, true)
  const restored = activityState(
    normalizeAppState(
      f,
      c,
      parsePrivateBackup(buildPrivateBackup(asApp(state), f, c), c, f)
    )
  )
  assert.equal(buildShareProjection(c, restored).allowed, true)
  state = save(state, child, 'want', { note: 'Changed' })
  assert.equal(buildShareProjection(c, state).allowed, false)
  state = undoActivitySave(state)
  assert.equal(buildShareProjection(c, state).allowed, true)
})

test('partner output strips private data; imports strip extra fields and reject invalid answers', () => {
  const app = fresh()
  app.activities.answers.give_massage = {
    stance: 'want',
    experience: 'tried_once',
    note: 'SECRET',
    details: { conditions: 'SECRET' }
  }
  app.playPreferences.aftercare = 'SECRET'
  const payload = buildPartnerShareExport(app, c)
  assert.ok(!JSON.stringify(payload).includes('SECRET'))
  assert.equal(payload.playPreferences, undefined)
  payload.activities.answers.give_massage.note = 'SECRET'
  assert.ok(
    !JSON.stringify(parsePartnerShareExport(payload, c)).includes('SECRET')
  )
  payload.activities.answers.give_massage.stance = 'invalid'
  assert.throws(() => parsePartnerShareExport(payload, c))
  const backup = buildPrivateBackup(app, f, c)
  backup.profileVersion--
  assert.throws(() => parsePrivateBackup(backup, c, f))
  assert.deepEqual(normalizeAppState(f, c, { profileVersion: 3 }), fresh())
})

test('body facts filter; unknown facts stay available', () => {
  const state = activityState(fresh())
  const a = c.activities.find(
    (a) => a.id === 'receive_vaginal_penetration'
  )
  assert.ok(
    evaluateActivity(a, createEligibilityContext(c, state)).queueVisible
  )
  state.exploration.facts.self.anatomy[a.applicability.anatomy] = 'absent'
  assert.equal(
    evaluateActivity(a, createEligibilityContext(c, state)).queueVisible,
    false
  )

})

test('finite sessions count Save and Undo without losing later skips or facts', () => {
  let state = activityState(fresh())
  state.exploration = startSession(c, state, { size: 3, id: 'session' })
  const [first, second] = state.exploration.session.poolIds
  state = save(state, first, 'want')
  state.exploration = recordSessionAction(state.exploration, first, 'save')
  state.exploration = recordSessionAction(state.exploration, second, 'skip')
  state.exploration.facts.self.anatomy.penis = 'absent'
  assert.equal(sessionProgress(c, state).answered, 1)
  state = undoActivitySave(state)
  assert.equal(sessionProgress(c, state).answered, 0)
  assert.deepEqual(state.exploration.session.skippedIds, [second])
  assert.equal(state.exploration.facts.self.anatomy.penis, 'absent')
})

test('comparison respects the partner’s direct Hard limit', () => {
  const left = { activities: { answers: { give_massage: { stance: 'want' } } } }
  const right = {
    activities: { answers: { receive_massage: { stance: 'hard_limit' } } }
  }
  const comparison = compareActivityProfiles(c, left, right)
  assert.ok(
    comparison.hardLimitConflicts.some(
      (row) => row.activityId === 'give_massage'
    )
  )
})

test('comparison applies exported branch Hard limits on either side, including conditional interest', () => {
  let boundary = save(activityState(fresh()), 'receive_rope_bondage_general', 'hard_limit')
  boundary = chooseBoundaryScope(c, boundary, 'receive_rope_bondage_general', 'branch')
  const partner = parsePartnerShareExport(buildPartnerShareExport(asApp(boundary), c), c)
  const before = structuredClone(partner)
  for (const stance of ['love', 'want', 'curious', 'if_partner_wants', 'soft_limit']) {
    const own = comparisonProfileFromActivityState(
      save(activityState(fresh()), 'give_decorative_rope', stance), c
    )
    for (const [left, right, id, side] of [
      [own, partner, 'give_decorative_rope', 'right'],
      [partner, own, 'receive_decorative_rope', 'left']
    ]) {
      const result = compareActivityProfiles(c, left, right)
      const row = result.rows.find((r) => r.activityId === id)
      assert.equal(row.state, 'hard_limit_conflict')
      assert.equal(row[`${side}Stance`], 'hard_limit')
      assert.deepEqual(row[`${side}BoundaryLabels`], [c.activities.find((a) => a.id === 'receive_rope_bondage_general').label])
      assert.ok(result.hardLimitConflicts.includes(row))
      assert.ok(result.counts.hard_limit_conflict > 0)
      assert.equal(result.rows[0].state, 'hard_limit_conflict')
    }
  }
  assert.deepEqual(partner, before)
})

test('comparison honors local scope and exact branch exceptions without exempting siblings', () => {
  const root = 'receive_rope_bondage_general', child = 'receive_decorative_rope'
  const own = comparisonProfileFromActivityState(
    save(save(activityState(fresh()), 'give_decorative_rope', 'want'), 'give_floor_rope', 'want'), c
  )
  let boundary = save(activityState(fresh()), root, 'hard_limit')
  boundary = chooseBoundaryScope(c, boundary, root, 'local')
  const compare = (state) => compareActivityProfiles(c, own,
    parsePartnerShareExport(buildPartnerShareExport(asApp(state), c), c))
  assert.equal(compare(boundary).rows.find((r) => r.activityId === 'give_decorative_rope').state, 'insufficient_data')
  boundary = chooseBoundaryScope(c, boundary, root, 'branch')
  boundary = save(boundary, child, 'want')
  boundary = acknowledgeException(c, boundary, boundary.exploration.boundaries[0].id, child)
  const result = compare(boundary)
  const exception = result.rows.find((r) => r.activityId === 'give_decorative_rope')
  assert.equal(exception.state, 'strong_match')
  assert.deepEqual(exception.rightBoundaryLabels, [])
  assert.equal(result.rows.find((r) => r.activityId === 'give_floor_rope').state, 'hard_limit_conflict')
})


test('simple body selections filter only self anatomy and clearing restores availability', () => {
  const state = activityState(fresh())
  const visible = (id) => evaluateActivity(
    c.activities.find((a) => a.id === id), createEligibilityContext(c, state)
  ).queueVisible
  state.exploration.facts = bodyFactsFromSelection(['penis'])
  assert.equal(visible('receive_vaginal_penetration'), false)
  assert.equal(visible('give_vaginal_penetration'), true)
  assert.equal(visible('anal_penetration_receiving'), true)
  state.exploration.facts = bodyFactsFromSelection(['penis', 'vagina'])
  assert.equal(visible('receive_vaginal_penetration'), true)
  state.exploration.facts = bodyFactsFromSelection(['vagina'])
  assert.equal(state.exploration.facts.self.anatomy.penis, 'absent')
  state.exploration.facts = bodyFactsFromSelection([])
  assert.equal(visible('receive_vaginal_penetration'), true)
  assert.equal(state.exploration.facts.self.anatomy.penis, 'undisclosed')
  const restored = normalizeAppState(f, c, parsePrivateBackup(buildPrivateBackup(asApp(state), f, c), c, f))
  assert.deepEqual(restored.exploration.facts, state.exploration.facts)
  assert.equal('partnerContexts' in restored.exploration.facts, false)
  assert.equal(BASICS_FIELDS.some((field) => field.id === 'intensity'), false)
})


test('chasing fantasies have independent answers and every ranked theme has a scored bar', () => {
  const chase = f.questions.find((q) => q.statement === 'Chasing a partner.')
  const chased = f.questions.find((q) => q.statement === 'Being chased by a partner.')
  assert.ok(chase && chased)
  assert.notEqual(chase.id, chased.id)
  assert.equal(chase.stage, 'core')
  assert.equal(chased.stage, 'core')
  const score = scoreFantasyProfile(f, {
    [chase.id]: 'strong_turn_on', [chased.id]: 'strong_turn_off'
  }).primal_struggle_competition
  assert.equal(score.perspectives.give.score, 2)
  assert.equal(score.perspectives.receive.score, -2)
  assert.equal(f.questionnaire.administration.coreCount, f.questions.filter((q) => q.stage === 'core').length)
  const positive = Object.fromEntries(f.questions.map((q) => [q.id, 'strong_turn_on']))
  for (const id of ['authority_responsibility', 'novelty_experimentation']) {
    const breakdown = fantasyRoleBreakdown(f, positive, id)
    assert.equal(breakdown.roles.length, 1)
    assert.equal(breakdown.roles[0].key, 'overall')
    assert.equal(breakdown.roles[0].position, 100)
    assert.equal(breakdown.summary, null)
    assert.equal(fantasyRoleBreakdown(f, {}, id), null)
  }
  const results = buildFantasyResults(f, positive)
  for (const theme of [...results.drivers, ...results.patterns]) {
    assert.ok(theme.direction.roles.some((role) => role.position !== null), theme.id)
  }
  assert.equal(results.directions.some((row) => row.dimensionId === 'novelty_experimentation'), false)
})
