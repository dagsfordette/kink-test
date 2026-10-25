import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildFantasyResults, fantasyRoleBreakdown, fantasySuggestionDetails, specificFantasyAnswers } from '../src/lib/fantasyResults.js'
import { buildFantasySuggestions } from '../src/lib/fantasyProfile.js'
import { startFantasyProfile, createFantasyState, answerFantasyQuestion, activeFantasyAnswers, addThemeDeepDive, reconcileFantasyState } from '../src/lib/fantasyRouting.js'

const profile = JSON.parse(readFileSync(new URL('../src/data/fantasyProfile.json', import.meta.url)))

function complete(responseFor) {
  let state = startFantasyProfile(profile, createFantasyState(profile))
  let count = 0
  while (state.status !== 'complete' && count++ < 100) {
    const id = state.questionSequence[state.currentIndex]
    const question = profile.questions.find((row) => row.id === id)
    state = answerFantasyQuestion(profile, state, id, responseFor(question))
  }
  assert.equal(state.status, 'complete')
  assert.ok(count <= profile.questionnaire.administration.coreCount + 24)
  return state
}

test('chasing remains visible when being chased is a turn-off, through results and reload', () => {
  const state = complete((q) => q.statement === 'Chasing a partner.' ? 'strong_turn_on' :
    q.statement === 'Being chased by a partner.' ? 'strong_turn_off' : 'neutral')
  const restored = reconcileFantasyState(profile, JSON.parse(JSON.stringify(state)))
  const answers = activeFantasyAnswers(restored)
  const results = buildFantasyResults(profile, answers)
  const theme = results.patterns.find((row) => row.id === 'primal_struggle_competition')
  assert.ok(theme)
  assert.equal(theme.direction.roles.length, 2)
  assert.ok(theme.direction.roles.find((row) => row.key === 'give').score > 0)
  assert.ok(theme.direction.roles.find((row) => row.key === 'receive').score < 0)
  assert.match(theme.direction.summary, /chasing or overpowering a partner/)
})

test('opposite roles do not cancel suggestion evidence or contaminate its explanation', () => {
  const preferences = { pain_intensity: 'give', sensory_focus_alteration: 'give', fear_adrenaline: 'evoke_partner' }
  const answers = Object.fromEntries(profile.questions.map((q) => {
    const signal = q.signals.find((row) => preferences[row.dimensionId])
    return [q.id, signal ? signal.perspective === preferences[signal.dimensionId] ? 'strong_turn_on' : 'strong_turn_off' : 'neutral']
  }))
  const suggestion = buildFantasySuggestions(profile, answers).find((row) => row.id === 'impact_pain')
  assert.ok(suggestion)
  assert.ok(suggestion.why.some((reason) => reason.includes('causing pain')))
  assert.equal(suggestion.matchedEvidence.find((row) => row.dimensionId === 'pain_intensity').perspective, 'give')
  const detail = fantasySuggestionDetails(profile, answers, suggestion.id)
  assert.ok(detail.examples.length)
  for (const example of detail.examples) {
    assert.equal(answers[example.questionId], 'strong_turn_on')
    const q = profile.questions.find((row) => row.id === example.questionId)
    assert.ok(q.signals.some((signal) => suggestion.matchedEvidence.some((evidence) =>
      signal.dimensionId === evidence.dimensionId && signal.perspective === evidence.perspective)))
  }
})

test('each specific fantasy displays its exact answer without altering broad scores', () => {
  const questions = profile.questions.filter((q) => !q.signals.length)
  assert.ok(questions.length >= 10)
  for (const question of questions) {
    for (const response of profile.responseScale) {
      const results = buildFantasyResults(profile, { [question.id]: response.id })
      assert.deepEqual(results.specifics, [{ questionId: question.id, statement: question.statement, response: response.id, responseLabel: response.label }])
      assert.equal(results.drivers.length, 0)
      assert.equal(results.patterns.length, 0)
      assert.equal(results.suggestions.length, 0)
      assert.ok(specificFantasyAnswers(profile, { [question.id]: response.id }, question.parentDimensionId).some((row) => row.questionId === question.id))
    }
  }
  assert.deepEqual(buildFantasyResults(profile, {}).specifics, [])
})

test('paired themes retain follow-ups on both sides without forcing duplicate stages', () => {
  for (const dimension of profile.dimensions.filter((row) => row.directionPairs?.length)) {
    const pair = dimension.directionPairs[0]
    for (const perspective of [pair.left, pair.right]) {
      assert.ok(profile.questions.some((q) => q.stage !== 'core' && q.signals[0]?.dimensionId === dimension.id && q.signals[0].perspective === perspective), `${dimension.id}/${perspective}`)
    }
  }
})

test('pain follow-ups and optional exploration follow the independently preferred role', () => {
  for (const preferred of ['give', 'receive']) {
    const state = complete((q) => {
      const pain = q.signals.find((row) => row.dimensionId === 'pain_intensity')
      return pain?.perspective === preferred ? 'strong_turn_on' :
        pain && ['give', 'receive'].includes(pain.perspective) ? 'strong_turn_off' : 'neutral'
    })
    const followUps = state.questionSequence.map((id) => profile.questions.find((q) => q.id === id))
      .filter((q) => q.stage !== 'core' && q.signals[0]?.dimensionId === 'pain_intensity')
    assert.equal(followUps.length, 3)
    assert.ok(followUps.every((q) => q.signals[0].perspective === preferred))
    const roles = fantasyRoleBreakdown(profile, activeFantasyAnswers(state), 'pain_intensity').roles
    assert.equal(roles.find((role) => role.key === preferred).score, 2)
    assert.equal(roles.find((role) => role.key !== preferred).score, -2)

    const extra = addThemeDeepDive(profile, state, 'pain_intensity')
    const added = extra.questionSequence.filter((id) => !state.questionSequence.includes(id))
    assert.equal(new Set(extra.questionSequence).size, extra.questionSequence.length)
    assert.ok(added.every((id) => {
      const question = profile.questions.find((q) => q.id === id)
      return question.signals.some((signal) => signal.dimensionId === 'pain_intensity') ||
        question.parentDimensionId === 'pain_intensity' ||
        question.activation?.conditions?.some((condition) => condition.dimensionId === 'pain_intensity')
    }))
  }
})

test('negative and skipped questionnaires do not acquire positive patterns or suggestions', () => {
  for (const response of ['strong_turn_off', 'unsure']) {
    const state = complete(() => response)
    const results = buildFantasyResults(profile, activeFantasyAnswers(state))
    assert.deepEqual(results.drivers, [])
    assert.deepEqual(results.patterns, [])
    assert.deepEqual(results.suggestions, [])
  }
})

const addedDetailGroups = new Set([
  'bondage_duration', 'ongoing_restraints', 'restraint_release', 'restraint_inescapability',
  'nonsexual_bondage', 'restraint_process', 'restraint_comfort', 'ongoing_authority',
  'discipline', 'training', 'earned_approval',
  'partner_sharing', 'jealousy', 'exclusivity', 'switching_control', 'role_reversal'
])
const addedFantasies = profile.questions.filter((q) => addedDetailGroups.has(q.detailKey))
const bondageFantasies = addedFantasies.filter((q) => q.parentDimensionId === 'restraint_confinement')

function coreAnswers(responseFor) {
  return Object.fromEntries(profile.questions.filter((q) => q.stage === 'core').map((q) => [q.id, responseFor(q)]))
}

test('retained fantasy variations keep their independent counterparts', () => {
  assert.equal(addedFantasies.length, 31)
  assert.equal(bondageFantasies.length, 14)
  assert.equal(profile.questions.filter((q) => q.stage === 'core').length, 64)
  assert.equal(new Set(profile.questions.map((q) => q.id)).size, profile.questions.length)
  for (const q of addedFantasies) {
    assert.equal(q.stage, 'deep_dive')
    assert.deepEqual(q.signals, [])
    assert.ok(q.activation.conditions.length)
    if (q.detailKey !== 'switching_control')
      assert.equal(addedFantasies.filter((other) => other.detailKey === q.detailKey).length, 2)
  }
})

test('bondage detail routing checks the relevant role rather than the opposite role', async () => {
  const { selectDeepDiveQuestions } = await import('../src/lib/fantasyProfile.js')
  for (const preferred of ['receive', 'give']) {
    const answers = coreAnswers((q) => q.id === `fp_core_restraint_confinement_${preferred === 'receive' ? '01' : '02'}` ? 'strong_turn_on' : 'strong_turn_off')
    const selected = selectDeepDiveQuestions(profile, answers, {
      dimensionId: 'restraint_confinement', maxCount: 12, maxDetailCount: 12,
      priorQuestionIds: Object.keys(answers)
    }).filter((q) => bondageFantasies.some((row) => row.id === q.id))
    assert.equal(selected.length, 7)
    assert.ok(selected.every((q) => q.perspective === preferred))
  }
  const negative = coreAnswers(() => 'strong_turn_off')
  const selected = selectDeepDiveQuestions(profile, negative, {
    dimensionId: 'restraint_confinement', maxCount: 12, maxDetailCount: 12,
    priorQuestionIds: Object.keys(negative)
  })
  assert.ok(selected.every((q) => !bondageFantasies.some((row) => row.id === q.id)))
})

test('all fourteen bondage details can be explored, saved and changed independently', () => {
  const responseFor = (q) => q.parentDimensionId === 'restraint_confinement' || q.signals[0]?.dimensionId === 'restraint_confinement' ? 'strong_turn_on' : 'neutral'
  let state = complete(responseFor)
  for (let visit = 0; visit < 15 && bondageFantasies.some((q) => !state.answers[q.id]); visit++) {
    const next = addThemeDeepDive(profile, state, 'restraint_confinement')
    assert.ok(next.questionSequence.length > state.questionSequence.length)
    state = next
    let count = 0
    while (state.status !== 'complete' && count++ < 15) {
      const id = state.questionSequence[state.currentIndex]
      state = answerFantasyQuestion(profile, state, id, responseFor(profile.questions.find((q) => q.id === id)))
    }
    assert.equal(state.status, 'complete')
  }
  assert.ok(bondageFantasies.every((q) => state.answers[q.id] === 'strong_turn_on'))
  state = reconcileFantasyState(profile, JSON.parse(JSON.stringify(state)))
  const id = 'fp_deep_dive_restraint_release_receive'
  state = answerFantasyQuestion(profile, state, id, 'strong_turn_off', { advance: false })
  const results = buildFantasyResults(profile, activeFantasyAnswers(state))
  assert.equal(results.specifics.find((row) => row.questionId === id).response, 'strong_turn_off')
  assert.equal(results.specifics.find((row) => row.questionId === 'fp_deep_dive_restraint_release_give').response, 'strong_turn_on')
  assert.equal(results.specifics.filter((row) => bondageFantasies.some((q) => q.id === row.questionId)).length, 14)
})


test('the standard questionnaire stops before optional variations and theme exploration can reach them', () => {
  const state = complete(() => 'strong_turn_on')
  assert.equal(state.questionSequence.length, 88)
  assert.ok(state.questionSequence.every((id) => !profile.questions.find((q) => q.id === id).optionalOnly))
  const extra = addThemeDeepDive(profile, state, 'restraint_confinement')
  const added = extra.questionSequence.filter((id) => !state.questionSequence.includes(id))
  assert.ok(added.length > 0 && added.length <= 3)
  assert.ok(added.some((id) => profile.questions.find((q) => q.id === id).optionalOnly))
})
