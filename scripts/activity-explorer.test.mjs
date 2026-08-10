import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  STANCE_IDS,
  clearActivityAnswer,
  createActivityState,
  filterActivities,
  focusUnansweredActivities,
  groupActivityResults,
  normalizeActivityState,
  setActivityDetails,
  setActivityExperience,
  setActivityNote,
  setActivityStance,
  toggleHiddenActivity,
  toggleSkippedCategory,
  updateActivityNavigation,
} from '../src/lib/activityProfile.js'
import { buildActivityRecommendations } from '../src/lib/activityRecommendations.js'

const catalog = JSON.parse(readFileSync(new URL('../src/data/activityCatalog.json', import.meta.url), 'utf8'))
const fantasyProfile = JSON.parse(readFileSync(new URL('../src/data/fantasyProfile.json', import.meta.url), 'utf8'))
const sampleActivityId = 'give_commands'

test('all seven stance states persist exactly as semantic states', () => {
  for (const stance of STANCE_IDS) {
    const state = setActivityStance(createActivityState(catalog), sampleActivityId, stance)
    assert.equal(state.answers[sampleActivityId].stance, stance)
  }
  assert.deepEqual(STANCE_IDS, catalog.stanceScale.map((row) => row.id))
})

test('experience is independent from stance and is never inferred', () => {
  let state = createActivityState(catalog)
  state = setActivityStance(state, sampleActivityId, 'hard_limit')
  assert.equal(state.answers[sampleActivityId].experience, undefined)
  state = setActivityExperience(state, sampleActivityId, 'very_experienced')
  assert.equal(state.answers[sampleActivityId].stance, 'hard_limit')
  assert.equal(state.answers[sampleActivityId].experience, 'very_experienced')

  state = setActivityStance(state, sampleActivityId, 'love')
  state = setActivityExperience(state, sampleActivityId, 'not_tried')
  assert.equal(state.answers[sampleActivityId].stance, 'love')
  assert.equal(state.answers[sampleActivityId].experience, 'not_tried')
})

test('activity answers persist with stance, experience, details, and note', () => {
  let state = createActivityState(catalog)
  state = setActivityStance(state, sampleActivityId, 'soft_limit')
  state = setActivityExperience(state, sampleActivityId, 'some_experience')
  state = setActivityDetails(state, sampleActivityId, { context: ['private'] })
  state = setActivityNote(state, sampleActivityId, 'Only under agreed conditions')
  const restored = normalizeActivityState(catalog, JSON.parse(JSON.stringify(state)))
  assert.deepEqual(restored.answers[sampleActivityId], state.answers[sampleActivityId])
})

test('clearing one activity answer does not affect navigation', () => {
  let state = createActivityState(catalog)
  state = setActivityStance(state, sampleActivityId, 'want')
  state = toggleSkippedCategory(state, 'power_exchange')
  state = clearActivityAnswer(state, sampleActivityId)
  assert.equal(state.answers[sampleActivityId], undefined)
  assert.deepEqual(state.navigation.skippedCategoryIds, ['power_exchange'])
})

test('skipping a category never creates negative stance answers', () => {
  const state = toggleSkippedCategory(createActivityState(catalog), 'power_exchange')
  assert.deepEqual(state.answers, {})
  assert.ok(state.navigation.skippedCategoryIds.includes('power_exchange'))
})

test('standalone depth expands starter to extended to specialized without separate questionnaires', () => {
  let state = updateActivityNavigation(createActivityState(catalog), { categoryId: 'all', depth: 'starter' })
  const starter = filterActivities(catalog, state)
  assert.ok(starter.length > 0)
  assert.ok(starter.every((row) => row.priority === 'starter'))

  state = updateActivityNavigation(state, { depth: 'extended' })
  const extended = filterActivities(catalog, state)
  assert.ok(extended.some((row) => row.priority === 'extended'))
  assert.equal(extended.some((row) => row.priority === 'specialized'), false)

  state = updateActivityNavigation(state, { depth: 'specialized' })
  const specialized = filterActivities(catalog, state)
  assert.ok(specialized.some((row) => row.priority === 'specialized'))
})

test('search and answer filters operate on Activity Explorer answers', () => {
  let state = updateActivityNavigation(createActivityState(catalog), { categoryId: 'all', depth: 'all', search: 'commands' })
  const searchRows = filterActivities(catalog, state)
  assert.ok(searchRows.some((row) => row.id === 'give_commands'))
  assert.ok(searchRows.every((row) => `${row.label} ${row.description} ${(row.tags || []).join(' ')}`.toLowerCase().includes('commands')))

  state = setActivityStance(state, 'give_commands', 'want')
  state = updateActivityNavigation(state, { search: '', answerFilter: 'answered' })
  const answered = filterActivities(catalog, state)
  assert.deepEqual(answered.map((row) => row.id), ['give_commands'])
})

test('hidden/relevance-filtered activities remain reachable and do not create answers', () => {
  let state = updateActivityNavigation(createActivityState(catalog), { categoryId: 'power_exchange', depth: 'all' })
  state = toggleHiddenActivity(state, sampleActivityId)
  assert.equal(state.answers[sampleActivityId], undefined)
  assert.equal(filterActivities(catalog, state).some((row) => row.id === sampleActivityId), false)
  state = updateActivityNavigation(state, { showHidden: true })
  assert.equal(filterActivities(catalog, state).some((row) => row.id === sampleActivityId), true)
})

test('Fantasy Profile recommendations cannot mutate Activity Explorer answers', () => {
  const fantasyAnswers = Object.fromEntries(fantasyProfile.questions.map((question) => [question.id, 'turn_on']))
  const activityState = setActivityStance(createActivityState(catalog), sampleActivityId, 'dont_want')
  const before = JSON.stringify(activityState.answers)
  const recommendations = buildActivityRecommendations(catalog, fantasyProfile, fantasyAnswers, { maxItems: 8 })
  assert.ok(recommendations.length > 0)
  assert.equal(JSON.stringify(activityState.answers), before)
  assert.equal(activityState.answers[sampleActivityId].stance, 'dont_want')
  assert.ok(recommendations.every((row) => row.activity && row.reason))
})


test('activity results derive unanswered activities without storing answer records', () => {
  let state = createActivityState(catalog)
  state = setActivityStance(state, 'give_commands', 'want')
  const beforeKeys = Object.keys(state.answers)
  const result = groupActivityResults(catalog, state, 'stance')

  assert.equal(result.unansweredCount, catalog.activities.length - 1)
  assert.equal(result.unansweredIds.includes('give_commands'), false)
  assert.equal(result.groups.flatMap((group) => group.rows).some((row) => row.activity.id === 'give_commands'), true)
  assert.deepEqual(Object.keys(state.answers), beforeKeys)
  assert.equal(result.groups.some((group) => group.key === 'unanswered'), false)
})

test('unanswered results action opens the explorer with a complete unanswered filter', () => {
  let state = createActivityState(catalog)
  state = setActivityStance(state, 'give_commands', 'want')
  state = toggleHiddenActivity(state, 'receive_commands')
  state = updateActivityNavigation(state, { categoryId: 'power_exchange', depth: 'starter', search: 'commands', stanceFilter: 'want', experienceFilter: 'unanswered' })

  const focused = focusUnansweredActivities(state)
  const rows = filterActivities(catalog, focused)

  assert.deepEqual(focused.navigation, {
    ...state.navigation,
    categoryId: 'all',
    search: '',
    stanceFilter: 'all',
    experienceFilter: 'all',
    answerFilter: 'unanswered',
    depth: 'all',
    showHidden: true,
  })
  assert.equal(rows.some((row) => row.id === 'give_commands'), false)
  assert.equal(rows.some((row) => row.id === 'receive_commands'), true)
  assert.equal(rows.length, catalog.activities.length - 1)
})
