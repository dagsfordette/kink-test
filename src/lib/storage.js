const STORAGE_KEY = 'adult-kink-exploration:prototype'

export function loadState() {
  try {
    const current = localStorage.getItem(STORAGE_KEY)
    return current ? JSON.parse(current) : null
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
  } catch {
    // no-op
  }
}

export { STORAGE_KEY }
