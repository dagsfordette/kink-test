const DEFAULT_PLAY_PREFERENCES = {
  communication: '',
  checkIns: '',
  stopSignals: '',
  aftercare: '',
  marksAfterEffects: '',
  partnerContext: '',
  other: '',
}

export function createPlayPreferences() {
  return { ...DEFAULT_PLAY_PREFERENCES }
}

export function normalizePlayPreferences(saved) {
  const clean = createPlayPreferences()
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return clean
  for (const key of Object.keys(clean)) {
    if (typeof saved[key] === 'string') clean[key] = saved[key]
  }
  return clean
}

export function updatePlayPreferences(values, patch) {
  const next = normalizePlayPreferences(values)
  for (const [key, value] of Object.entries(patch || {})) {
    if (key in next && typeof value === 'string') next[key] = value
  }
  return next
}
