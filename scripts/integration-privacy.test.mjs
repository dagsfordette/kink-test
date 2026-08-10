import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { createAppState, normalizeAppState, resolveAppRoute, withActivityState, APP_VERSION } from '../src/lib/appState.js'
import { setActivityStance } from '../src/lib/activityProfile.js'
import { buildActivityRecommendations } from '../src/lib/activityRecommendations.js'
import { buildPartnerShareExport, buildPrivateBackup, parsePartnerShareExport, PARTNER_ACTIVITY_FORMAT, PRIVATE_PROFILE_FORMAT } from '../src/lib/profileExports.js'

const fantasyProfile = JSON.parse(readFileSync(new URL('../src/data/fantasyProfile.json', import.meta.url), 'utf8'))
const activityCatalog = JSON.parse(readFileSync(new URL('../src/data/activityCatalog.json', import.meta.url), 'utf8'))

function allFantasyAnswers(value = 'turn_on') {
  return Object.fromEntries(fantasyProfile.questions.map((question) => [question.id, value]))
}

function walkFiles(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) out.push(...walkFiles(path))
    else out.push(path)
  }
  return out
}

test('partner-share export contains no Fantasy Profile keys or result material', () => {
  let state = createAppState(fantasyProfile, activityCatalog)
  state = { ...state, fantasy: { ...state.fantasy, status: 'complete', answers: allFantasyAnswers(), questionSequence: ['private_question'] } }
  state = { ...state, activities: setActivityStance(state.activities, 'give_commands', 'want') }
  state = { ...state, playPreferences: { ...state.playPreferences, aftercare: 'Quiet time' } }

  const share = buildPartnerShareExport(state, activityCatalog, { includePlayPreferences: true, exportedAt: '2026-08-10T00:00:00.000Z' })
  const serialized = JSON.stringify(share).toLowerCase()
  assert.equal(share.format, PARTNER_ACTIVITY_FORMAT)
  assert.equal(serialized.includes('fantasy'), false)
  assert.equal(serialized.includes('questionsequence'), false)
  assert.equal(serialized.includes('suggestion'), false)
  assert.equal(share.activities.answers.give_commands.stance, 'want')
  assert.equal(share.playPreferences.aftercare, 'Quiet time')
})

test('private backup includes both profiles under the new current format', () => {
  let state = createAppState(fantasyProfile, activityCatalog)
  state = { ...state, fantasy: { ...state.fantasy, answers: { fp_core_surrender_01: 'turn_on' } } }
  state = { ...state, activities: setActivityStance(state.activities, 'give_commands', 'curious') }
  const backup = buildPrivateBackup(state, fantasyProfile, activityCatalog, { exportedAt: '2026-08-10T00:00:00.000Z' })
  assert.equal(backup.format, PRIVATE_PROFILE_FORMAT)
  assert.equal(backup.version, APP_VERSION)
  assert.equal(backup.fantasy.answers.fp_core_surrender_01, 'turn_on')
  assert.equal(backup.activities.answers.give_commands.stance, 'curious')
})

test('partner comparison import accepts only the partner-share Activity Explorer format', () => {
  const state = createAppState(fantasyProfile, activityCatalog)
  const share = buildPartnerShareExport(state, activityCatalog, { exportedAt: '2026-08-10T00:00:00.000Z' })
  assert.doesNotThrow(() => parsePartnerShareExport(share, activityCatalog))
  assert.throws(() => parsePartnerShareExport({ activities: { answers: {} } }, activityCatalog), /only partner-share/i)
  assert.throws(() => parsePartnerShareExport({ format: PRIVATE_PROFILE_FORMAT, activities: { answers: {} } }, activityCatalog), /only partner-share/i)
})

test('Fantasy Profile scoring and recommendation recalculation cannot mutate Activity Explorer answers', () => {
  let state = createAppState(fantasyProfile, activityCatalog)
  state = { ...state, activities: setActivityStance(state.activities, 'give_commands', 'hard_limit') }
  const before = JSON.stringify(state.activities.answers)
  const first = buildActivityRecommendations(activityCatalog, fantasyProfile, allFantasyAnswers('turn_on'), { maxItems: 8 })
  const second = buildActivityRecommendations(activityCatalog, fantasyProfile, allFantasyAnswers('strong_turn_on'), { maxItems: 8 })
  assert.ok(first.length > 0)
  assert.ok(second.length > 0)
  assert.equal(JSON.stringify(state.activities.answers), before)
  assert.equal(state.activities.answers.give_commands.stance, 'hard_limit')
})

test('storage normalization uses only version 2.0.0 and rejects legacy state shapes', () => {
  const current = createAppState(fantasyProfile, activityCatalog)
  assert.equal(current.version, '2.0.0')
  assert.equal(current.route, 'home')
  assert.ok(current.activities)
  assert.ok(current.playPreferences)
  const normalizedLegacy = normalizeAppState(fantasyProfile, activityCatalog, { version: 4, route: 'fantasy_results', activity: { answers: { give_commands: { stance: 'want' } } } })
  assert.equal(normalizedLegacy.route, 'home')
  assert.deepEqual(normalizedLegacy.activities.answers, {})
})

test('no legacy universal catalog is required at runtime', () => {
  assert.equal(existsSync(new URL('../src/data/catalog.json', import.meta.url)), false)
  const srcDir = new URL('../src/', import.meta.url)
  for (const file of walkFiles(srcDir.pathname).filter((path) => /\.(js|jsx)$/.test(path))) {
    const content = readFileSync(file, 'utf8')
    assert.equal(/data\/catalog\.json/.test(content), false, `${file} should not reference legacy catalog.json`)
  }
})


test('Activity Explorer route is guarded until adult confirmation is recorded', () => {
  const clean = createAppState(fantasyProfile, activityCatalog)
  assert.equal(resolveAppRoute('activity_explorer', clean.settings), 'activity_intro')
  assert.equal(withActivityState(clean, clean.activities, 'activity_explorer').route, 'activity_intro')

  const savedUnconfirmed = { ...clean, route: 'activity_explorer', settings: { ...clean.settings, adultConfirmed: false } }
  assert.equal(normalizeAppState(fantasyProfile, activityCatalog, savedUnconfirmed).route, 'activity_intro')

  const confirmed = { ...clean, settings: { ...clean.settings, adultConfirmed: true } }
  assert.equal(resolveAppRoute('activity_explorer', confirmed.settings), 'activity_explorer')
  assert.equal(withActivityState(confirmed, confirmed.activities, 'activity_explorer').route, 'activity_explorer')

  const savedConfirmed = { ...confirmed, route: 'activity_explorer' }
  assert.equal(normalizeAppState(fantasyProfile, activityCatalog, savedConfirmed).route, 'activity_explorer')
})
