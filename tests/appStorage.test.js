import test from 'node:test'
import assert from 'node:assert/strict'
import { createAppStorage, STORAGE_KEY } from '../src/lib/appStorage.js'

function browser() {
  const data = new Map()
  const storage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value)
  }
  let queue = Promise.resolve()
  const locks = {
    request(key, run) {
      assert.equal(key, STORAGE_KEY)
      const result = queue.then(run)
      queue = result.catch(() => {})
      return result
    }
  }
  return {
    storage, locks,
    tab: () => createAppStorage({ storage, locks }),
    saved: () => JSON.parse(storage.getItem(STORAGE_KEY))
  }
}

test('an older tab cannot overwrite newer answers even before a storage event', async () => {
  const b = browser(), a = b.tab()
  a.load()
  await a.save({ answers: { first: 'want' } })
  const other = b.tab(), snapshot = other.load()
  await a.save({ answers: { first: 'want', second: 'love' }, note: 'New private note' })
  assert.equal(await other.save({ ...snapshot, theme: 'light' }), 'conflict')
  assert.equal(b.saved().answers.second, 'love')
  assert.equal(b.saved().note, 'New private note')
  assert.equal(await other.erase(), 'conflict')
  const reloaded = b.tab()
  assert.equal(reloaded.load().answers.second, 'love')
  assert.equal(await reloaded.save({ answers: { third: 'curious' } }), 'ready')
})

test('simultaneous writes from two tabs have one winner', async () => {
  const b = browser(), a = b.tab(), other = b.tab()
  a.load()
  other.load()
  const results = await Promise.all([
    a.save({ answer: 'A' }), other.save({ answer: 'B' })
  ])
  assert.deepEqual(results, ['ready', 'conflict'])
  assert.equal(b.saved().answer, 'A')
  await a.save({ answer: 'A2' })
  assert.equal(b.saved().answer, 'A2')
})

test('erasure leaves no profile data and invalidates stale and initially empty tabs', async () => {
  const b = browser(), a = b.tab(), emptyTab = b.tab()
  a.load()
  emptyTab.load()
  await a.save({ note: 'SECRET', answers: { first: 'want' } })
  const other = b.tab(), snapshot = other.load()
  await a.erase()
  assert.deepEqual(Object.keys(b.saved()).sort(), ['erased', 'storageRevision'])
  assert.equal(await other.save(snapshot), 'erased')
  assert.equal(await emptyTab.save({ answers: {} }), 'erased')
  assert.equal(JSON.stringify(b.saved()).includes('SECRET'), false)
  const reloaded = b.tab()
  assert.equal(reloaded.load(), null)
  assert.equal(await reloaded.save({ answers: { fresh: 'want' } }), 'ready')
  assert.equal(await other.save(snapshot), 'erased')
  assert.deepEqual(b.saved().answers, { fresh: 'want' })
})

test('erasing cancels this tab’s queued writes and pauses writes during deletion', async () => {
  const b = browser(), a = b.tab()
  a.load()
  const pending = a.save({ note: 'SECRET' })
  const erased = a.erase()
  const duringErase = a.save({ note: 'SECRET' })
  await Promise.all([pending, erased, duringErase])
  assert.equal(b.saved().erased, true)
  assert.equal(JSON.stringify(b.saved()).includes('SECRET'), false)
})

test('a conflicted tab still notices a subsequent erasure', async () => {
  const b = browser(), a = b.tab(), other = b.tab()
  a.load()
  other.load()
  await a.save({ note: 'SECRET' })
  assert.equal(other.check(), 'conflict')
  await a.erase()
  assert.equal(other.check(), 'erased')
})

test('storage errors, invalid saved JSON and missing write locks never silently save', async () => {
  const b = browser()
  const unlocked = createAppStorage({ storage: b.storage, locks: null })
  unlocked.load()
  assert.equal(await unlocked.save({ answer: 'unsaved' }), 'unavailable')
  assert.equal(b.saved(), null)
  b.storage.setItem(STORAGE_KEY, '{invalid')
  const invalid = b.tab()
  assert.equal(invalid.load(), null)
  assert.equal(await invalid.save({}), 'unavailable')
  assert.equal(b.storage.getItem(STORAGE_KEY), '{invalid')
  const broken = createAppStorage({
    storage: { getItem() { throw new Error('Denied') } }, locks: b.locks
  })
  assert.equal(broken.load(), null)
  assert.equal(await broken.save({}), 'unavailable')
  const full = createAppStorage({
    storage: { getItem: () => null, setItem() { throw new Error('Quota') } }, locks: b.locks
  })
  full.load()
  assert.equal(await full.save({}), 'unavailable')
})

test('erasure recovers after a quota failure without restoring private data from stale tabs', async () => {
  const b = browser(), a = b.tab()
  a.load()
  await a.save({ note: 'PRIVATE_NOTE' })
  const other = b.tab(), snapshot = other.load()
  const setItem = b.storage.setItem
  b.storage.setItem = (key, value) => {
    if (value.length > 200) throw new Error('Quota exceeded')
    setItem(key, value)
  }
  assert.equal(await a.save({ note: 'x'.repeat(1000) }), 'unavailable')
  assert.equal(await a.erase(), 'ready')
  assert.deepEqual(Object.keys(b.saved()).sort(), ['erased', 'storageRevision'])
  assert.equal(await other.save(snapshot), 'erased')
  assert.equal(JSON.stringify(b.saved()).includes('PRIVATE_NOTE'), false)
  assert.equal(await a.save({ answers: {} }), 'ready')
})

test('erasure after a failed save still respects newer profiles and real storage failures', async () => {
  const b = browser(), a = b.tab()
  a.load()
  await a.save({ note: 'Original' })
  const setItem = b.storage.setItem
  b.storage.setItem = () => { throw new Error('Denied') }
  assert.equal(await a.save({ note: 'Unsaved' }), 'unavailable')
  assert.equal(await a.erase(), 'unavailable')
  assert.equal(b.saved().note, 'Original')
  b.storage.setItem = setItem
  const other = b.tab()
  other.load()
  await other.save({ note: 'Newer profile' })
  assert.equal(await a.erase(), 'conflict')
  assert.equal(b.saved().note, 'Newer profile')
})
