import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  ROLEPLAY_ROLES, ROLEPLAY_THEMES, normalizeRoleplayInterests,
  setRoleplayRating, setRoleplayDetails, setRoleplayThemeRating
} from '../src/lib/roleplayInterests.js'
import { createAppState, normalizeAppState } from '../src/lib/appState.js'
import { createGuided, resumeGuidedFlow, advanceGuidedFlow, backGuidedFlow } from '../src/lib/guidedExploration.js'
import { filterActivities, groupActivityResults } from '../src/lib/activityProfile.js'
import { buildPrivateBackup, parsePrivateBackup, buildPartnerShareExport, parsePartnerShareExport } from '../src/lib/profileExports.js'
const catalog = JSON.parse(readFileSync(new URL('../src/data/activityCatalog.json', import.meta.url)))
const fantasy = JSON.parse(readFileSync(new URL('../src/data/fantasyProfile.json', import.meta.url)))

test('role picker covers every original roleplay subject and all counterpart roles exist', () => {
  const sources = [...new Set([...ROLEPLAY_ROLES, ...ROLEPLAY_THEMES].flatMap(item => item.sourceActivityIds))].sort()
  assert.deepEqual(sources, catalog.activities.filter(a => a.categoryId === 'roleplay').map(a => a.id).sort())
  for (const role of ROLEPLAY_ROLES) for (const pair of role.counterparts) assert(ROLEPLAY_ROLES.some(role => role.id === pair))
})
test('self, partner and counterpart roles retain independent ratings without implied answers', () => {
  let marks = setRoleplayRating(undefined, 'teacher', 'self', 'love')
  marks = setRoleplayRating(marks, 'teacher', 'partner', 'hard_limit')
  marks = setRoleplayDetails(marks, 'teacher', 'self', { pairs: ['student'], pairRatings: { student: 'curious' }, appeal: ['Giving instruction'] })
  assert.equal(marks.roles.teacher.self.rating, 'love')
  assert.equal(marks.roles.teacher.partner.rating, 'hard_limit')
  assert.equal(marks.roles.teacher.self.pairRatings.student, 'curious')
  assert(!marks.roles.student)
  assert.deepEqual(marks.themes, {})
})
test('clearing or selecting No removes positive details only for that perspective', () => {
  let marks = setRoleplayRating(undefined, 'teacher', 'self', 'love')
  marks = setRoleplayRating(marks, 'teacher', 'partner', 'curious')
  marks = setRoleplayDetails(marks, 'teacher', 'self', { pairs: ['student'], pairRatings: { student: 'hard_limit' }, note: 'private' })
  marks = setRoleplayRating(marks, 'teacher', 'self', 'hard_limit')
  assert.deepEqual(marks.roles.teacher.self, { rating: 'hard_limit' })
  assert.equal(marks.roles.teacher.partner.rating, 'curious')
  marks = setRoleplayRating(marks, 'teacher', 'self', 'hard_limit')
  assert(!marks.roles.teacher.self)
  marks = setRoleplayRating(marks, 'teacher', 'partner', null)
  assert.deepEqual(marks.roles, {})
})
test('removing a counterpart drops its override; themes do not answer any roles', () => {
  let marks = setRoleplayRating(undefined, 'doctor', 'self', 'want')
  marks = setRoleplayDetails(marks, 'doctor', 'self', { pairs: ['patient'], pairRatings: { patient: 'love' } })
  marks = setRoleplayDetails(marks, 'doctor', 'self', { pairs: [] })
  assert.deepEqual(marks.roles.doctor.self.pairRatings, {})
  const withTheme = setRoleplayThemeRating(marks, 'historical', 'love')
  assert.deepEqual(withTheme.roles, marks.roles)
  assert.equal(withTheme.themes.historical.rating, 'love')
})
test('reload and private backup preserve role details, themes and previous material preferences', () => {
  const app = createAppState(fantasy, catalog)
  let marks = setRoleplayRating(undefined, 'patient', 'self', 'curious')
  marks = setRoleplayDetails(marks, 'patient', 'self', { pairs: ['doctor', 'nurse'], pairRatings: { nurse: 'hard_limit' }, appeal: ['Focused attention'], note: 'Private role note' })
  app.exploration.roleplayInterests = setRoleplayThemeRating(marks, 'historical', 'love')
  app.exploration.materialInterests = { leather: { rating: 'no' } }
  const backup = buildPrivateBackup(app, fantasy, catalog)
  const restored = normalizeAppState(fantasy, catalog, parsePrivateBackup(backup, catalog, fantasy))
  assert.deepEqual(restored.exploration.roleplayInterests, app.exploration.roleplayInterests)
  assert.deepEqual(restored.exploration.materialInterests, app.exploration.materialInterests)
})
test('partner sharing keeps perspective and pairing No ratings, strips private details and rejects invalid ratings', () => {
  const app = createAppState(fantasy, catalog)
  let marks = setRoleplayRating(undefined, 'patient', 'self', 'love')
  marks = setRoleplayRating(marks, 'patient', 'partner', 'hard_limit')
  marks = setRoleplayDetails(marks, 'patient', 'self', { pairs: ['doctor', 'nurse'], pairRatings: { nurse: 'hard_limit' }, appeal: ['Focused attention'], note: 'Private role note' })
  app.exploration.roleplayInterests = marks
  const share = buildPartnerShareExport(app, catalog)
  assert.equal(share.roleplayInterests.roles.patient.partner.rating, 'hard_limit')
  assert.equal(share.roleplayInterests.roles.patient.self.pairRatings.nurse, 'hard_limit')
  assert(!JSON.stringify(share).includes('Private role note'))
  assert(!JSON.stringify(share).includes('Focused attention'))
  assert.deepEqual(parsePartnerShareExport(share, catalog).roleplayInterests, share.roleplayInterests)
  share.roleplayInterests.roles.patient.self.pairRatings.nurse = 'invalid'
  assert.throws(() => parsePartnerShareExport(share, catalog))
  assert.throws(() => normalizeRoleplayInterests({ roles: { patient: { self: { rating: 'love', pairs: ['nonexistent'] } } } }, { strict: true }))
})
test('roleplay can be completed with no marks and revisited through Back after reload', () => {
  const app = createAppState(fantasy, catalog), state = { ...app.activities, exploration: app.exploration }
  for (const activity of catalog.activities) state.answers[activity.id] = { stance: 'curious' }
  let guided = resumeGuidedFlow(catalog, state, { ...createGuided(), bodyMapComplete: true, materialsComplete: true, contextsComplete: true, featuresComplete: true, tattoosComplete: true, sensoryComplete: true, scentComplete: true, toysComplete: true })
  assert.equal(guided.topicId, 'roleplay')
  assert.equal(guided.trail.length, 0)
  app.exploration.guided = guided
  guided = normalizeAppState(fantasy, catalog, app).exploration.guided
  assert.equal(resumeGuidedFlow(catalog, state, guided), guided)
  const complete = advanceGuidedFlow(catalog, state, guided)
  assert(complete.roleplayComplete && complete.flowComplete)
  const previous = backGuidedFlow(complete)
  assert.equal(previous.topicId, 'roleplay')
  assert(!previous.done)
  assert.deepEqual(app.exploration.roleplayInterests, { roles: {}, themes: {} })
})
test('roleplay items do not create a backlog of unanswered activity cards', () => {
  const app = createAppState(fantasy, catalog), state = { ...app.activities, exploration: app.exploration }
  assert(filterActivities(catalog, state).every(a => a.categoryId !== 'roleplay'))
  const oldIds = new Set(catalog.activities.filter(a => a.categoryId === 'roleplay').map(a => a.id))
  assert(groupActivityResults(catalog, state).unansweredIds.every(id => !oldIds.has(id)))
})
