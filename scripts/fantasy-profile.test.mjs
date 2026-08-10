import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  buildFantasySuggestions,
  scoreFantasyProfile,
  selectDeepDiveQuestions,
  selectDiscriminatorQuestions,
} from '../src/lib/fantasyProfile.js'
import { validateFantasyProfile } from './fantasy-profile-validation.mjs'

const profile = JSON.parse(readFileSync(new URL('../src/data/fantasyProfile.json', import.meta.url), 'utf8'))
const catalog = JSON.parse(readFileSync(new URL('../src/data/activityCatalog.json', import.meta.url), 'utf8'))
const coreQuestions = profile.questions.filter((question) => question.stage === 'core')

function answerQuestions(questionIds, state) {
  return Object.fromEntries(questionIds.map((id) => [id, state]))
}

function corePatternAnswers() {
  const states = ['strong_turn_on', 'turn_on', 'intriguing', 'neutral', 'turn_off', 'strong_turn_off', 'unsure']
  return Object.fromEntries(coreQuestions.map((question, index) => [question.id, states[index % states.length]]))
}

function assertNoAdjacentMirrors(questions) {
  for (let index = 1; index < questions.length; index += 1) {
    assert.notEqual(questions[index - 1].mirrorGroup, questions[index].mirrorGroup)
  }
}

test('Fantasy Profile dataset passes structural validation', () => {
  assert.deepEqual(validateFantasyProfile(profile, catalog), [])
  assert.equal(profile.questions.filter((q) => q.stage === 'core').length, 52)
  assert.equal(profile.questions.filter((q) => q.stage === 'discriminator').length, 52)
  assert.equal(profile.questions.filter((q) => q.stage === 'deep_dive').length, 26)
})

test('adaptive selection is deterministic and bounded', () => {
  const answers = corePatternAnswers()
  const first = selectDiscriminatorQuestions(profile, answers).map((q) => q.id)
  const second = selectDiscriminatorQuestions(profile, answers).map((q) => q.id)
  assert.deepEqual(first, second)
  assert.equal(first.length, 12)

  const withDiscriminators = { ...answers, ...answerQuestions(first, 'turn_on') }
  const deepFirst = selectDeepDiveQuestions(profile, withDiscriminators, { priorQuestionIds: [...coreQuestions.map((q) => q.id), ...first] }).map((q) => q.id)
  const deepSecond = selectDeepDiveQuestions(profile, withDiscriminators, { priorQuestionIds: [...coreQuestions.map((q) => q.id), ...first] }).map((q) => q.id)
  assert.deepEqual(deepFirst, deepSecond)
  assert.equal(deepFirst.length, 12)
})

test('scoring combines repeated evidence into descriptive bands', () => {
  const surrenderQuestionIds = profile.questions
    .filter((question) => question.signals.some((signal) => signal.dimensionId === 'surrender'))
    .slice(0, 5)
    .map((question) => question.id)
  const evidence = scoreFantasyProfile(profile, answerQuestions(surrenderQuestionIds, 'strong_turn_on'))
  assert.equal(evidence.surrender.band, 'strong')
  assert.ok(evidence.surrender.score > 1.5)
  assert.ok(evidence.surrender.observations >= 3)
})

test('unsure contributes no positive or negative evidence', () => {
  const ids = coreQuestions.slice(0, 10).map((question) => question.id)
  const evidence = scoreFantasyProfile(profile, answerQuestions(ids, 'unsure'))
  for (const row of Object.values(evidence)) {
    assert.equal(row.observations, 0)
    assert.equal(row.positiveEvidence, 0)
    assert.equal(row.negativeEvidence, 0)
  }
})

test('one isolated answer cannot create a strong classification', () => {
  const question = profile.questions.find((q) => q.signals.some((signal) => signal.dimensionId === 'surrender'))
  const evidence = scoreFantasyProfile(profile, { [question.id]: 'strong_turn_on' })
  assert.notEqual(evidence.surrender.band, 'strong')
  assert.equal(evidence.surrender.band, 'insufficient')
})

test('authored and adaptive sequences keep mirrored groups apart', () => {
  assertNoAdjacentMirrors(coreQuestions)
  const answers = corePatternAnswers()
  const discriminator = selectDiscriminatorQuestions(profile, answers)
  assertNoAdjacentMirrors(discriminator)
  const withDiscriminator = { ...answers, ...answerQuestions(discriminator.map((q) => q.id), 'intriguing') }
  const deep = selectDeepDiveQuestions(profile, withDiscriminator, { priorQuestionIds: [...coreQuestions.map((q) => q.id), ...discriminator.map((q) => q.id)] })
  assertNoAdjacentMirrors(deep)
})

test('suggestion explanations are generated from actual scored evidence', () => {
  const targetIds = profile.questions
    .filter((question) => question.signals.some((signal) => ['control_permission', 'surrender', 'rules_ritual_protocol'].includes(signal.dimensionId)))
    .slice(0, 16)
    .map((question) => question.id)
  const suggestions = buildFantasySuggestions(profile, answerQuestions(targetIds, 'strong_turn_on'))
  const power = suggestions.find((suggestion) => suggestion.id === 'power_exchange')
  assert.ok(power)
  assert.ok(power.why.length >= 2)
  assert.ok(power.why.some((reason) => /control|surrender|rules/.test(reason)))
  assert.ok(power.why.every((reason) => typeof reason === 'string' && reason.length > 0))
})
