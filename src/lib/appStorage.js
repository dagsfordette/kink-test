export const STORAGE_KEY = 'kink-exploration:profile:v4'

export function createAppStorage({
  storage,
  locks = globalThis.navigator?.locks
} = {}) {
  let expected, status = 'ready', generation = 0, erasing = false
  const browserStorage = () => storage ?? globalThis.localStorage
  const check = (retryUnavailable = false) => {
    if (status === 'erased') return status
    try {
      const raw = browserStorage().getItem(STORAGE_KEY)
      if (raw !== expected)
        status = raw === null || JSON.parse(raw)?.erased === true ? 'erased' : 'conflict'
      else if (retryUnavailable && status === 'unavailable')
        status = 'ready'
      return status
    } catch {
      return (status = 'unavailable')
    }
  }
  const write = async (state, erased = false, token = generation) => {
    if (status !== 'ready' && !(erased && status === 'unavailable')) return status
    if (!locks?.request) return (status = 'unavailable')
    try {
      return await locks.request(STORAGE_KEY, () => {
        if (token !== generation) return status
        if (check(erased) !== 'ready') return status
        const raw = JSON.stringify({
          ...(erased ? { erased: true } : state),
          storageRevision: globalThis.crypto.randomUUID()
        })
        browserStorage().setItem(STORAGE_KEY, raw)
        expected = raw
        return status
      })
    } catch {
      return (status = 'unavailable')
    }
  }
  return {
    load() {
      try {
        expected = browserStorage().getItem(STORAGE_KEY)
        const saved = expected ? JSON.parse(expected) : null
        return saved?.erased === true ? null : saved
      } catch {
        status = 'unavailable'
        return null
      }
    },
    check,
    save: (state) => erasing ? Promise.resolve(status) : write(state),
    async erase() {
      // Cancel queued saves before erasing; they must not restore the old profile.
      generation++
      erasing = true
      try {
        return await write(null, true)
      } finally {
        erasing = false
      }
    }
  }
}
