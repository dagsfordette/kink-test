const STORAGE_KEY = 'adult-kink-inventory:prototype:v3'
const LEGACY_KEYS = ['adult-kink-inventory:prototype:v2']

export function loadState() {
  try {
    const current = localStorage.getItem(STORAGE_KEY)
    if (current) return JSON.parse(current)

    for (const key of LEGACY_KEYS) {
      const raw = localStorage.getItem(key)
      if (raw) return { ...JSON.parse(raw), migratedFromStorageKey: key }
    }
    return null
  } catch {
    return null
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage can be unavailable in privacy modes. The app remains usable in-memory.
  }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    for (const key of LEGACY_KEYS) localStorage.removeItem(key)
  } catch {
    // no-op
  }
}

export { STORAGE_KEY }
