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


export const DEBUG_ANSWER_FORMAT = 'kink-exploration-debug-answers'

export function buildDebugAnswerExport(appState, fantasyProfile, activityCatalog, options = {}) {
  const fantasyAnswers = appState.fantasy?.answers || {}
  const fantasySequence = appState.fantasy?.questionSequence || []
  const sequenceIndex = new Map(fantasySequence.map((id, index) => [id, index]))
  const responseById = new Map((fantasyProfile?.responseScale || []).map((row) => [row.id, row]))
  const dimensionById = new Map((fantasyProfile?.dimensions || []).map((row) => [row.id, row]))

  const categoryById = new Map((activityCatalog?.categories || []).map((row) => [row.id, row]))
  const stanceById = new Map((activityCatalog?.stanceScale || []).map((row) => [row.id, row]))
  const experienceById = new Map((activityCatalog?.experienceScale || []).map((row) => [row.id, row]))
  const activityAnswers = appState.activities?.answers || {}

  return {
    format: DEBUG_ANSWER_FORMAT,
    exportedAt: options.exportedAt || new Date().toISOString(),
    datasets: datasetMetadata(fantasyProfile, activityCatalog),
    summary: {
      fantasy: {
        totalQuestionBank: (fantasyProfile?.questions || []).length,
        inAdaptiveSequence: fantasySequence.length,
        answered: Object.keys(fantasyAnswers).length,
      },
      activities: {
        totalCatalog: (activityCatalog?.activities || []).length,
        answered: Object.keys(activityAnswers).length,
      },
    },
    fantasy: {
      status: appState.fantasy?.status || 'not_started',
      currentIndex: Number(appState.fantasy?.currentIndex || 0),
      questionSequence: clone(fantasySequence),
      questions: (fantasyProfile?.questions || []).map((question) => {
        const responseId = fantasyAnswers[question.id] ?? null
        const response = responseId ? responseById.get(responseId) : null
        return {
          id: question.id,
          text: question.statement,
          stage: question.stage || null,
          intensity: question.intensity || null,
          asked: sequenceIndex.has(question.id),
          sequenceIndex: sequenceIndex.has(question.id) ? sequenceIndex.get(question.id) : null,
          answered: responseId !== null,
          answer: responseId === null ? null : {
            id: responseId,
            label: response?.label || responseId,
            score: response?.score ?? null,
          },
          signals: (question.signals || []).map((signal) => ({
            dimensionId: signal.dimensionId,
            dimensionLabel: dimensionById.get(signal.dimensionId)?.label || signal.dimensionId,
            perspective: signal.perspective || null,
            weight: signal.weight ?? 1,
          })),
          discriminates: clone(question.discriminates || []),
          mirrorGroup: question.mirrorGroup || null,
        }
      }),
    },
    activities: {
      questions: (activityCatalog?.activities || []).map((activity) => {
        const answer = activityAnswers[activity.id] || null
        const stance = answer?.stance ? stanceById.get(answer.stance) : null
        const experience = answer?.experience ? experienceById.get(answer.experience) : null
        return {
          id: activity.id,
          text: activity.label,
          description: activity.description || null,
          categoryId: activity.categoryId || null,
          categoryLabel: categoryById.get(activity.categoryId)?.label || activity.categoryId || null,
          priority: activity.priority || null,
          answered: Boolean(answer?.stance),
          answer: answer?.stance ? {
            stance: {
              id: answer.stance,
              label: stance?.label || answer.stance,
              meaning: stance?.meaning || null,
            },
            experience: answer.experience ? {
              id: answer.experience,
              label: experience?.label || answer.experience,
            } : null,
            details: clone(answer.details || {}),
            note: typeof answer.note === 'string' ? answer.note : '',
          } : null,
          riskDomains: clone(activity.riskDomains || []),
          tags: clone(activity.tags || []),
          complementId: activity.complementId || null,
        }
      }),
    },
  }
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
  if (kind === 'private') return `kink-exploration-private-profile-${stamp}.json`
  if (kind === 'debug') return `kink-exploration-debug-answers-${stamp}.json`
  return `kink-exploration-activity-profile-${stamp}.json`
}
