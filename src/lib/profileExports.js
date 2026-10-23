import {
  buildShareProjection,
  validatePublicContext
} from './boundaryReview.js'
import { PROFILE_VERSION } from './appState.js'
import { normalizePlayPreferences } from './playPreferences.js'

const PRIVATE_PROFILE_FORMAT = 'kink-exploration-private-profile'
const PARTNER_ACTIVITY_FORMAT = 'kink-exploration-activity-profile'

const clone = structuredClone

function datasetMetadata(fantasyProfile, activityCatalog) {
  return {
    fantasyProfile: {
      id: fantasyProfile.questionnaire.id,
      version: fantasyProfile.questionnaire.version
    },
    activityCatalog: {
      id: activityCatalog.questionnaire.id,
      version: activityCatalog.questionnaire.version
    }
  }
}

export function buildPrivateBackup(
  appState,
  fantasyProfile,
  activityCatalog,
  options = {}
) {
  return {
    format: PRIVATE_PROFILE_FORMAT,
    profileVersion: PROFILE_VERSION,
    privateState: clone(appState),
    exportedAt: options.exportedAt || new Date().toISOString(),
    datasets: datasetMetadata(fantasyProfile, activityCatalog)
  }
}

export function buildPartnerShareExport(
  appState,
  activityCatalog,
  options = {}
) {
  const state = { ...appState.activities, exploration: appState.exploration }
  const checked = buildShareProjection(activityCatalog, state, {
    includePlayPreferences: options.includePlayPreferences,
    playPreferences: appState.playPreferences
  })
  if (!checked.allowed)
    throw new Error(
      'Review boundary scope and saved interests before sharing. Private backups remain available.'
    )
  const payload = {
    ...checked.payload,
    format: PARTNER_ACTIVITY_FORMAT,
    exportedAt: options.exportedAt || new Date().toISOString()
  }

  return payload
}

const DEBUG_ANSWER_FORMAT = 'kink-exploration-debug-answers'

export function buildDebugAnswerExport(
  appState,
  fantasyProfile,
  activityCatalog,
  options = {}
) {
  const fantasyAnswers = appState.fantasy?.answers || {}
  const fantasySequence = appState.fantasy?.questionSequence || []
  const sequenceIndex = new Map(fantasySequence.map((id, index) => [id, index]))
  const responseById = new Map(
    (fantasyProfile?.responseScale || []).map((row) => [row.id, row])
  )
  const dimensionById = new Map(
    (fantasyProfile?.dimensions || []).map((row) => [row.id, row])
  )

  const categoryById = new Map(
    (activityCatalog?.categories || []).map((row) => [row.id, row])
  )
  const stanceById = new Map(
    (activityCatalog?.stanceScale || []).map((row) => [row.id, row])
  )
  const experienceById = new Map(
    (activityCatalog?.experienceScale || []).map((row) => [row.id, row])
  )
  const activityAnswers = appState.activities?.answers || {}

  return {
    format: DEBUG_ANSWER_FORMAT,
    exportedAt: options.exportedAt || new Date().toISOString(),
    datasets: datasetMetadata(fantasyProfile, activityCatalog),
    // Private debugging output; never use for partner sharing.
    rawAppState: clone(appState),
    basics: clone(appState.basics || { complete: false, values: {} }),
    summary: {
      fantasy: {
        totalQuestionBank: (fantasyProfile?.questions || []).length,
        inAdaptiveSequence: fantasySequence.length,
        answered: Object.keys(fantasyAnswers).length
      },
      activities: {
        totalCatalog: (activityCatalog?.activities || []).length,
        answered: Object.keys(activityAnswers).length
      }
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
          sequenceIndex: sequenceIndex.has(question.id)
            ? sequenceIndex.get(question.id)
            : null,
          answered: responseId !== null,
          answer:
            responseId === null
              ? null
              : {
                  id: responseId,
                  label: response?.label || responseId,
                  score: response?.score ?? null
                },
          signals: (question.signals || []).map((signal) => ({
            dimensionId: signal.dimensionId,
            dimensionLabel:
              dimensionById.get(signal.dimensionId)?.label ||
              signal.dimensionId,
            perspective: signal.perspective || null,
            weight: signal.weight ?? 1
          })),
          discriminates: clone(question.discriminates || []),
          mirrorGroup: question.mirrorGroup || null
        }
      })
    },
    activities: {
      questions: (activityCatalog?.activities || []).map((activity) => {
        const answer = activityAnswers[activity.id] || null
        const stance = answer?.stance ? stanceById.get(answer.stance) : null
        const experience = answer?.experience
          ? experienceById.get(answer.experience)
          : null
        return {
          id: activity.id,
          text: activity.label,
          description: activity.description || null,
          categoryId: activity.categoryId || null,
          categoryLabel:
            categoryById.get(activity.categoryId)?.label ||
            activity.categoryId ||
            null,
          priority: activity.priority || null,
          answered: Boolean(answer?.stance),
          answer: answer?.stance
            ? {
                stance: {
                  id: answer.stance,
                  label: stance?.label || answer.stance,
                  meaning: stance?.meaning || null
                },
                experience: answer.experience
                  ? {
                      id: answer.experience,
                      label: experience?.label || answer.experience
                    }
                  : null,
                details: clone(answer.details || {}),
                note: typeof answer.note === 'string' ? answer.note : ''
              }
            : null,
          riskDomains: clone(activity.riskDomains || []),
          tags: clone(activity.tags || []),
          complementId:
            activityCatalog.relationships.find(
              (edge) =>
                edge.type === 'complement' && edge.fromId === activity.id
            )?.toId ||
            activityCatalog.relationships.find(
              (edge) => edge.type === 'complement' && edge.toId === activity.id
            )?.fromId ||
            null
        }
      })
    }
  }
}

export function parsePartnerShareExport(value, activityCatalog) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('That doesn’t look like an Activity Explorer share file.')
  }
  if (value.format !== PARTNER_ACTIVITY_FORMAT) {
    throw new Error(
      'Only partner-share Activity Explorer files can be compared here; a private backup will not work.'
    )
  }
  if (
    !value.activities ||
    !value.activities.answers ||
    typeof value.activities.answers !== 'object' ||
    Array.isArray(value.activities.answers)
  ) {
    throw new Error(
      'This partner-share export does not contain valid Activity Explorer answers.'
    )
  }

  const expectedId = activityCatalog.questionnaire.id
  const expectedVersion = activityCatalog.questionnaire.version
  if (
    !value.catalog ||
    value.catalog.id !== expectedId ||
    value.catalog.version !== expectedVersion
  ) {
    throw new Error(
      `This share file uses a different or unrecognized Activity Explorer catalogue. Expected ${expectedId} version ${expectedVersion}; received ${value.catalog?.id || 'unknown'} version ${value.catalog?.version || 'unknown'}. Ask your partner to export again from the same site version.`
    )
  }

  const ids = new Set(activityCatalog.activities.map((a) => a.id))
  const stances = new Set(activityCatalog.stanceScale.map((s) => s.id)),
    experiences = new Set(activityCatalog.experienceScale.map((s) => s.id))
  for (const [id, a] of Object.entries(value.activities.answers)) {
    if (
      !ids.has(id) ||
      !a ||
      !stances.has(a.stance) ||
      (a.experience && !experiences.has(a.experience))
    )
      throw new Error(
        'This partner file contains an unrecognized activity or answer. Export it again from the current site.'
      )
  }
  const boundaryContext = validatePublicContext(value, activityCatalog)

  return {
    activities: {
      answers: Object.fromEntries(
        Object.entries(value.activities.answers).map(([id, a]) => [
          id,
          {
            stance: a.stance,
            ...(a.experience ? { experience: a.experience } : {})
          }
        ])
      )
    },
    boundaryContext,
    contextNote:
      'Boundary context is the sender’s declared scope and exact exceptions. Private answer dependencies and consent are not independently verified. Uncertainty and soft limits need discussion.',
    playPreferences: value.playPreferences
      ? normalizePlayPreferences(value.playPreferences)
      : null
  }
}

export function jsonDownloadName(kind, date = new Date()) {
  const stamp = date.toISOString().slice(0, 10)
  if (kind === 'private')
    return `kink-exploration-private-profile-${stamp}.json`
  if (kind === 'debug') return `kink-exploration-debug-answers-${stamp}.json`
  return `kink-exploration-activity-profile-${stamp}.json`
}

export function parsePrivateBackup(value, activityCatalog, fantasyProfile) {
  if (value?.format !== PRIVATE_PROFILE_FORMAT)
    throw new Error('Choose a private profile backup JSON file.')
  const state = value.privateState
  if (
    value.profileVersion !== PROFILE_VERSION ||
    state?.profileVersion !== PROFILE_VERSION
  )
    throw new Error(
      'This backup is from an unsupported prototype version. Use a backup from the current site.'
    )
  const record = (v) => v && typeof v === 'object' && !Array.isArray(v)
  if (
    !record(state.activities) ||
    !record(state.activities.answers) ||
    !record(state.activities.drafts) ||
    !record(state.fantasy?.answers) ||
    !record(state.exploration) ||
    !record(state.settings)
  )
    throw new Error('This backup is missing valid profile data.')
  const meta = datasetMetadata(fantasyProfile, activityCatalog)
  if (
    !['activityCatalog', 'fantasyProfile'].every(
      (k) =>
        value.datasets?.[k]?.id === meta[k].id &&
        value.datasets[k].version === meta[k].version
    )
  )
    throw new Error(
      'This backup uses a different question bank. Export from the current site.'
    )
  const ids = new Set(activityCatalog.activities.map((a) => a.id)),
    stances = new Set(activityCatalog.stanceScale.map((a) => a.id)),
    exp = new Set(activityCatalog.experienceScale.map((a) => a.id))
  for (const answers of [state.activities.answers, state.activities.drafts])
    for (const [id, a] of Object.entries(answers)) {
      if (
        !ids.has(id) ||
        !record(a) ||
        !stances.has(a.stance) ||
        (a.experience && !exp.has(a.experience)) ||
        (a.note !== undefined && typeof a.note !== 'string') ||
        (a.details !== undefined && !record(a.details))
      )
        throw new Error('This backup contains an invalid activity answer.')
    }
  const questions = new Set(fantasyProfile.questions.map((q) => q.id)),
    responses = new Set(fantasyProfile.responseScale.map((r) => r.id))
  if (
    Object.entries(state.fantasy.answers).some(
      ([id, a]) => !questions.has(id) || !responses.has(a)
    )
  )
    throw new Error('This backup contains an invalid fantasy answer.')
  if (
    typeof state.settings.adultConfirmed !== 'boolean' ||
    !['dark', 'light'].includes(state.settings.theme) ||
    !record(state.exploration.facts?.self?.anatomy) ||
    !record(state.exploration.facts?.partnerContexts) ||
    !record(state.exploration.roles?.global) ||
    !record(state.exploration.roles?.byCategory) ||
    !Array.isArray(state.exploration.boundaries) ||
    !Array.isArray(state.exploration.exceptions)
  )
    throw new Error('This backup contains invalid settings.')
  if (
    state.exploration.boundaries.some(
      (b) =>
        !record(b) ||
        typeof b.id !== 'string' ||
        !record(b.owner) ||
        b.owner.kind !== 'activity' ||
        typeof b.owner.id !== 'string'
    ) ||
    state.exploration.exceptions.some((b) => !record(b))
  )
    throw new Error('This backup contains an invalid boundary record.')
  const session = state.exploration.session
  if (
    session &&
    (!record(session) ||
      typeof session.id !== 'string' ||
      !['active', 'ended'].includes(session.status) ||
      !Number.isInteger(session.target) ||
      session.target < 1 ||
      session.target > 50 ||
      !['poolIds', 'answeredIds', 'skippedIds'].every(
        (k) =>
          Array.isArray(session[k]) && session[k].every((id) => ids.has(id))
      ) ||
      [...session.answeredIds, ...session.skippedIds].some(
        (id) => !session.poolIds.includes(id)
      ) ||
      session.answeredIds.some((id) => session.skippedIds.includes(id)))
  )
    throw new Error('This backup contains an invalid session.')
  return clone(state)
}
