export const PLAY_PREFERENCE_FIELDS = [
  [
    'communication',
    'Talking about it',
    'How do you like to talk about activities, boundaries, or changes?'
  ],
  [
    'checkIns',
    'Check-ins',
    'What kind of check-ins feel good before, during, or after?'
  ],
  [
    'stopSignals',
    'Stop / pause signals',
    'Any words, signals, or habits you want to use for slowing down or stopping?'
  ],
  ['aftercare', 'Aftercare', 'What helps you feel good afterward?'],
  [
    'marksAfterEffects',
    'Marks and after-effects',
    'Anything you want to avoid or allow around marks, soreness, or other after-effects?'
  ],
  [
    'partnerContext',
    'Who / when / where',
    'Does familiarity, relationship context, privacy, or setting change what feels okay?'
  ],
  [
    'other',
    'Anything else',
    'Anything else you’d want a partner to know before you start?'
  ]
]

const DEFAULT_PLAY_PREFERENCES = {
  communication: '',
  checkIns: '',
  stopSignals: '',
  aftercare: '',
  marksAfterEffects: '',
  partnerContext: '',
  other: ''
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
