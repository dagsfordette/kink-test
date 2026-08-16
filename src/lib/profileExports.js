import { normalizeActivityState } from './activityProfile.js'
import { normalizePlayPreferences } from './playPreferences.js'
import { buildFantasyResults } from './fantasyResults.js'

export const PRIVATE_PROFILE_FORMAT = 'kink-exploration-private-profile'
export const PARTNER_ACTIVITY_FORMAT = 'kink-exploration-activity-profile'

function clone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value)
  return JSON.parse(JSON.stringify(value))
}

function datasetMetadata(fantasyProfile, activityCatalog) {
  return {
    fantasyProfile: {
      id: fantasyProfile?.questionnaire?.id || 'fantasy_profile',
      version: fantasyProfile?.questionnaire?.version || 'unknown',
    },
    activityCatalog: {
      id: activityCatalog?.questionnaire?.id || 'activity-explorer',
      version: activityCatalog?.questionnaire?.version || 'unknown',
    },
  }
}

export function buildPrivateBackup(appState, fantasyProfile, activityCatalog, options = {}) {
  const results = options.fantasyResults || buildFantasyResults(fantasyProfile, appState.fantasy?.answers || {})
  return {
    format: PRIVATE_PROFILE_FORMAT,
    exportedAt: options.exportedAt || new Date().toISOString(),
    datasets: datasetMetadata(fantasyProfile, activityCatalog),
    settings: clone(appState.settings || {}),
    fantasy: {
      status: appState.fantasy?.status || 'not_started',
      answers: clone(appState.fantasy?.answers || {}),
      questionSequence: clone(appState.fantasy?.questionSequence || []),
      currentIndex: Number(appState.fantasy?.currentIndex || 0),
      resultMetadata: {
        driverIds: results.drivers.map((row) => row.id),
        patternIds: results.patterns.map((row) => row.id),
        directionality: results.directions.map((row) => ({ dimensionId: row.dimensionId, text: row.text })),
        suggestionIds: results.suggestions.map((row) => row.id),
      },
    },
    activities: {
      answers: clone(appState.activities?.answers || {}),
      navigation: clone(appState.activities?.navigation || {}),
    },
    playPreferences: clone(normalizePlayPreferences(appState.playPreferences)),
    relevancePreferences: clone(appState.relevancePreferences || {}),
  }
}

export function buildPartnerShareExport(appState, activityCatalog, options = {}) {
  const normalized = normalizeActivityState(activityCatalog, appState.activities)
  const payload = {
    format: PARTNER_ACTIVITY_FORMAT,
    exportedAt: options.exportedAt || new Date().toISOString(),
    catalog: {
      id: activityCatalog?.questionnaire?.id || 'activity-explorer',
      version: activityCatalog?.questionnaire?.version || 'unknown',
    },
    activities: {
      answers: clone(normalized.answers),
    },
  }

  if (options.includePlayPreferences === true) {
    payload.playPreferences = clone(normalizePlayPreferences(appState.playPreferences))
  }
  return payload
}

export function parsePartnerShareExport(value, activityCatalog) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('That doesn’t look like an Activity Explorer share file.')
  }
  if (value.format !== PARTNER_ACTIVITY_FORMAT) {
    throw new Error('Only partner-share Activity Explorer files can be compared here; a private backup will not work.')
  }
  if (!value.activities || typeof value.activities.answers !== 'object' || Array.isArray(value.activities.answers)) {
    throw new Error('This partner-share export does not contain valid Activity Explorer answers.')
  }

  const normalized = normalizeActivityState(activityCatalog, { answers: value.activities.answers, navigation: {} })

  return {
    activities: { answers: normalized.answers },
    playPreferences: value.playPreferences ? normalizePlayPreferences(value.playPreferences) : null,
  }
}

export function jsonDownloadName(kind, date = new Date()) {
  const stamp = date.toISOString().slice(0, 10)
  return kind === 'private'
    ? `kink-exploration-private-profile-${stamp}.json`
    : `kink-exploration-activity-profile-${stamp}.json`
}
