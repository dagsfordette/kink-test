import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createAppState } from '../src/lib/appState.js'
import {
  filterActivities, editActivityDraft, setActivityStance, setActivityNote,
  saveActivityDraft, discardActivityDraft
} from '../src/lib/activityProfile.js'
import { activityPage, nextActivityId } from '../src/lib/explorationView.js'

const load = (name) => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url)))
const catalog = load('activityCatalog'), fantasy = load('fantasyProfile')
const fresh = () => {
  const app = createAppState(fantasy, catalog)
  return { ...app.activities, exploration: app.exploration }
}
const ids = (rows) => rows.map((a) => a.id)
const draft = (state, id) => editActivityDraft(state, id, (s) => setActivityStance(s, id, 'soft_limit'))

test('editing preserves page order and Save & next reaches the original successor across page boundaries', () => {
  for (const index of [30, 49, 80, 99]) {
    let state = fresh()
    const rows = filterActivities(catalog, state)
    const requestedPage = Math.floor(index / 50)
    const before = activityPage(rows, state.drafts, requestedPage)
    const chosen = rows[index]
    state = draft(state, chosen.id)
    state = editActivityDraft(state, chosen.id, (s) => setActivityNote(s, chosen.id, 'Keep my conditions'))
    const editingRows = filterActivities(catalog, state)
    const editing = activityPage(editingRows, state.drafts, requestedPage)
    assert.deepEqual(ids(editing.rows), ids(before.rows))
    assert.equal(editing.total, before.total)
    assert.equal(editing.pageCount, before.pageCount)
    assert.equal(editing.pinned, 0)
    const nextId = nextActivityId(editingRows, chosen.id)
    assert.equal(nextId, rows[index + 1].id)
    state = saveActivityDraft(state, chosen.id)
    const after = activityPage(filterActivities(catalog, state), state.drafts, requestedPage, { anchorId: nextId })
    assert.ok(after.rows.some((a) => a.id === nextId))
    assert.ok(!after.rows.some((a) => a.id === chosen.id))
    assert.equal(state.answers[chosen.id].note, 'Keep my conditions')
  }
})

test('off-page and filtered drafts stay accessible without displacing regular page cards', () => {
  let state = fresh()
  const rows = filterActivities(catalog, state)
  state = draft(draft(state, rows[30].id), rows[80].id)
  const page = activityPage(filterActivities(catalog, state), state.drafts, 1)
  assert.deepEqual(ids(page.rows.slice(0, 50)), ids(rows.slice(50, 100)))
  assert.equal(page.rows[50].id, rows[30].id)
  assert.equal(page.pinned, 1)
  assert.equal(new Set(ids(page.rows)).size, page.rows.length)
  const filtered = filterActivities(catalog, state, { search: 'NO_MATCH_FOR_THIS_SEARCH' })
  assert.deepEqual(new Set(ids(filtered)), new Set([rows[30].id, rows[80].id]))
  state = discardActivityDraft(state, rows[30].id)
  assert.deepEqual(ids(activityPage(filterActivities(catalog, state), state.drafts, 1).rows), ids(rows.slice(50, 100)))
  assert.equal(activityPage([], {}, 9).page, 0)
  assert.equal(nextActivityId([], 'missing'), null)
})
