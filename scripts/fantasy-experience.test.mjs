import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  answerFantasyQuestion,
  createFantasyState,
  deriveFantasyRoute,
  restartFantasyProfile,
  startFantasyProfile,
} from '../src/lib/fantasyRouting.js'
import { buildFantasyResults, fantasySuggestionDetails } from '../src/lib/fantasyResults.js'
import { createAppState, normalizeAppState, withFantasyState } from '../src/lib/appState.js'

const profile = JSON.parse(readFileSync(new URL('../src/data/fantasyProfile.json', import.meta.url), 'utf8'))
const activityCatalog = JSON.parse(readFileSync(new URL('../src/data/activityCatalog.json', import.meta.url), 'utf8'))
const coreQuestions = profile.questions.filter((question) => question.stage === 'core')

function answerAllCore(state = 'neutral') {
  return Object.fromEntries(coreQuestions.map((question) => [question.id, state]))
}

function completeProfile(responseFor = () => 'turn_on') {
  let fantasy = startFantasyProfile(profile, createFantasyState(profile))
  let guard = 0
  while (fantasy.status !== 'complete' && guard < 100) {
    const questionId = fantasy.questionSequence[fantasy.currentIndex]
    fantasy = answerFantasyQuestion(profile, fantasy, questionId, responseFor(questionId, guard))
    guard += 1
  }
  assert.equal(fantasy.status, 'complete')
  return fantasy
}

test('Fantasy Profile completes through core, discriminator, and deep-dive stages', () => {
  const fantasy = completeProfile((_, index) => ['turn_on', 'intriguing', 'neutral'][index % 3])
  assert.equal(fantasy.questionSequence.length, 76)
  assert.equal(Object.keys(fantasy.answers).length, 76)
  assert.equal(fantasy.questionSequence.slice(0, 52).every((id) => id.startsWith('fp_core_')), true)
  assert.equal(fantasy.questionSequence.slice(52, 64).every((id) => id.startsWith('fp_discriminator_')), true)
  assert.equal(fantasy.questionSequence.slice(64).every((id) => id.startsWith('fp_deep_dive_')), true)
})

test('editing a core answer deterministically rebuilds and prunes the adaptive tail', () => {
  const neutralCore = answerAllCore('neutral')
  const initialRoute = deriveFantasyRoute(profile, neutralCore)
  const staleId = initialRoute.discriminatorIds.find((id) => id === 'fp_discriminator_surrender_02') || initialRoute.discriminatorIds[0]
  const withAdaptiveAnswer = { ...neutralCore, [staleId]: 'turn_on' }

  const edited = deriveFantasyRoute(profile, {
    ...withAdaptiveAnswer,
    fp_core_surrender_01: 'strong_turn_on',
  })

  const repeat = deriveFantasyRoute(profile, {
    ...withAdaptiveAnswer,
    fp_core_surrender_01: 'strong_turn_on',
  })
  assert.deepEqual(edited.discriminatorIds, repeat.discriminatorIds)
  assert.notDeepEqual(edited.discriminatorIds, initialRoute.discriminatorIds)
  if (!edited.discriminatorIds.includes(staleId)) assert.equal(Object.hasOwn(edited.answers, staleId), false)
  assert.equal(Object.keys(edited.answers).every((id) => edited.sequence.includes(id)), true)
})

test('editing a discriminator answer recalculates the deep-dive route without stale deep answers', () => {
  const coreAnswers = answerAllCore('turn_on')
  const discriminatorRoute = deriveFantasyRoute(profile, coreAnswers)
  const discriminatorAnswers = Object.fromEntries(discriminatorRoute.discriminatorIds.map((id) => [id, 'turn_on']))
  const deepRoute = deriveFantasyRoute(profile, { ...coreAnswers, ...discriminatorAnswers })
  const oldDeepId = deepRoute.deepDiveIds[0]

  const firstDiscriminator = discriminatorRoute.discriminatorIds[0]
  const editedAnswers = { ...coreAnswers, ...discriminatorAnswers, [firstDiscriminator]: 'strong_turn_off', [oldDeepId]: 'strong_turn_on' }
  const edited = deriveFantasyRoute(profile, editedAnswers)
  assert.equal(Object.keys(edited.answers).every((id) => edited.sequence.includes(id)), true)
  if (!edited.deepDiveIds.includes(oldDeepId)) assert.equal(Object.hasOwn(edited.answers, oldDeepId), false)
})

test('results expose supported drivers, motifs, and explainable suggestions without raw scores', () => {
  const fantasy = completeProfile(() => 'strong_turn_on')
  const results = buildFantasyResults(profile, fantasy.answers)
  assert.ok(results.drivers.length > 0)
  assert.ok(results.patterns.length > 0)
  assert.ok(results.suggestions.length > 0)
  assert.equal(results.drivers.every((row) => !Object.hasOwn(row, 'score')), true)
  assert.equal(results.patterns.every((row) => !Object.hasOwn(row, 'score')), true)

  const detail = fantasySuggestionDetails(profile, fantasy.answers, results.suggestions[0].id)
  assert.ok(detail)
  assert.ok(detail.why.length > 0)
  assert.ok(detail.examples.length > 0)
})

test('unsure answers can complete the questionnaire without creating positive result claims', () => {
  const fantasy = completeProfile(() => 'unsure')
  const results = buildFantasyResults(profile, fantasy.answers)
  assert.deepEqual(results.drivers, [])
  assert.deepEqual(results.patterns, [])
  assert.deepEqual(results.directions, [])
  assert.deepEqual(results.suggestions, [])
})

test('saved Fantasy Profile state resumes on the active question', () => {
  let fantasy = startFantasyProfile(profile)
  for (let index = 0; index < 7; index += 1) {
    const questionId = fantasy.questionSequence[fantasy.currentIndex]
    fantasy = answerFantasyQuestion(profile, fantasy, questionId, 'intriguing')
  }
  const saved = { ...createAppState(profile, activityCatalog), route: 'fantasy_questions', fantasy }
  const resumed = normalizeAppState(profile, activityCatalog, JSON.parse(JSON.stringify(saved)))
  assert.equal(resumed.route, 'fantasy_questions')
  assert.equal(resumed.fantasy.status, 'in_progress')
  assert.deepEqual(resumed.fantasy.answers, fantasy.answers)
  assert.equal(resumed.fantasy.currentIndex, fantasy.currentIndex)
})

test('restart clears Fantasy Profile answers and returns it to not_started', () => {
  const complete = completeProfile(() => 'neutral')
  const restarted = restartFantasyProfile(profile)
  assert.equal(complete.status, 'complete')
  assert.equal(restarted.status, 'not_started')
  assert.deepEqual(restarted.answers, {})
  assert.equal(restarted.currentIndex, 0)
  assert.equal(restarted.questionSequence.length, 52)
})

test('Fantasy Profile updates leave Activity Explorer answers untouched', () => {
  const activityAnswers = { give_commands: { stance: 'want', details: {}, note: '' } }
  const app = { ...createAppState(profile, activityCatalog), activities: { ...createAppState(profile, activityCatalog).activities, answers: activityAnswers } }
  const fantasy = startFantasyProfile(profile, app.fantasy)
  const questionId = fantasy.questionSequence[0]
  const updatedFantasy = answerFantasyQuestion(profile, fantasy, questionId, 'turn_on')
  const updatedApp = withFantasyState(app, updatedFantasy, 'fantasy_questions')
  assert.deepEqual(updatedApp.activities.answers, activityAnswers)
  assert.equal(updatedApp.activities.answers, activityAnswers)
})
