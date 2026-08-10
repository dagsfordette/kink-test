import { selectDeepDiveQuestions, selectDiscriminatorQuestions } from './fantasyProfile.js'

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key)
}

function responseIds(profile) {
  return new Set((profile.responseScale || []).map((row) => row.id))
}

export function coreQuestions(profile) {
  return (profile.questions || []).filter((question) => question.stage === 'core')
}

export function sanitizeFantasyAnswers(profile, answers = {}) {
  const validQuestions = new Set((profile.questions || []).map((question) => question.id))
  const validResponses = responseIds(profile)
  return Object.fromEntries(Object.entries(answers || {}).filter(([questionId, response]) => (
    validQuestions.has(questionId) && validResponses.has(response)
  )))
}

function answersFor(questionIds, answers) {
  const next = {}
  for (const id of questionIds) if (hasOwn(answers, id)) next[id] = answers[id]
  return next
}

function allAnswered(questionIds, answers) {
  return questionIds.length > 0 && questionIds.every((id) => hasOwn(answers, id))
}

export function deriveFantasyRoute(profile, rawAnswers = {}, options = {}) {
  const answers = sanitizeFantasyAnswers(profile, rawAnswers)
  const coreIds = coreQuestions(profile).map((question) => question.id)
  let keptAnswers = answersFor(coreIds, answers)
  const base = {
    coreIds,
    discriminatorIds: [],
    deepDiveIds: [],
    extraQuestionIds: [],
    answers: keptAnswers,
    sequence: [...coreIds],
    stage: 'core',
  }

  if (!allAnswered(coreIds, keptAnswers)) return base

  const discriminatorIds = selectDiscriminatorQuestions(profile, keptAnswers, {
    priorQuestionIds: coreIds,
  }).map((question) => question.id)
  keptAnswers = { ...keptAnswers, ...answersFor(discriminatorIds, answers) }
  const discriminatorSequence = [...coreIds, ...discriminatorIds]

  if (!allAnswered(discriminatorIds, keptAnswers)) {
    return {
      ...base,
      discriminatorIds,
      answers: keptAnswers,
      sequence: discriminatorSequence,
      stage: 'discriminator',
    }
  }

  const deepDiveIds = selectDeepDiveQuestions(profile, keptAnswers, {
    priorQuestionIds: discriminatorSequence,
  }).map((question) => question.id)
  keptAnswers = { ...keptAnswers, ...answersFor(deepDiveIds, answers) }

  const validDeepDive = new Set((profile.questions || []).filter((question) => question.stage === 'deep_dive').map((question) => question.id))
  const extraQuestionIds = (options.extraQuestionIds || [])
    .filter((id, index, rows) => validDeepDive.has(id) && !deepDiveIds.includes(id) && rows.indexOf(id) === index)
  keptAnswers = { ...keptAnswers, ...answersFor(extraQuestionIds, answers) }

  return {
    ...base,
    discriminatorIds,
    deepDiveIds,
    extraQuestionIds,
    answers: keptAnswers,
    sequence: [...discriminatorSequence, ...deepDiveIds, ...extraQuestionIds],
    stage: extraQuestionIds.length ? 'extra' : 'deep_dive',
  }
}

export function createFantasyState(profile) {
  return {
    status: 'not_started',
    answers: {},
    questionSequence: coreQuestions(profile).map((question) => question.id),
    currentIndex: 0,
    extraQuestionIds: [],
  }
}

function firstUnansweredIndex(sequence, answers) {
  const index = sequence.findIndex((id) => !hasOwn(answers, id))
  return index === -1 ? Math.max(sequence.length - 1, 0) : index
}

export function reconcileFantasyState(profile, fantasy, options = {}) {
  const route = deriveFantasyRoute(profile, fantasy?.answers || {}, {
    extraQuestionIds: fantasy?.extraQuestionIds || [],
  })
  const complete = route.sequence.length > 0 && route.sequence.every((id) => hasOwn(route.answers, id))
  const preferredId = options.preferredQuestionId
  let currentIndex = Number.isInteger(fantasy?.currentIndex) ? fantasy.currentIndex : 0
  if (preferredId && route.sequence.includes(preferredId)) currentIndex = route.sequence.indexOf(preferredId)
  currentIndex = Math.max(0, Math.min(currentIndex, Math.max(route.sequence.length - 1, 0)))
  if (options.jumpToFirstUnanswered && !complete) currentIndex = firstUnansweredIndex(route.sequence, route.answers)

  return {
    status: fantasy?.status === 'not_started' && !Object.keys(route.answers).length ? 'not_started' : (complete ? 'complete' : 'in_progress'),
    answers: route.answers,
    questionSequence: route.sequence,
    currentIndex,
    extraQuestionIds: route.extraQuestionIds,
  }
}

export function startFantasyProfile(profile, fantasy = createFantasyState(profile)) {
  const next = reconcileFantasyState(profile, { ...fantasy, status: 'in_progress' }, { jumpToFirstUnanswered: true })
  return { ...next, status: next.status === 'not_started' ? 'in_progress' : next.status }
}

export function answerFantasyQuestion(profile, fantasy, questionId, response, options = {}) {
  const nextAnswers = { ...(fantasy?.answers || {}), [questionId]: response }
  let next = reconcileFantasyState(profile, { ...fantasy, status: 'in_progress', answers: nextAnswers }, { preferredQuestionId: questionId })
  if (options.advance !== false) {
    const questionIndex = next.questionSequence.indexOf(questionId)
    if (questionIndex >= 0 && questionIndex < next.questionSequence.length - 1) {
      next = { ...next, currentIndex: questionIndex + 1 }
    }
  }
  return next
}

export function goToFantasyQuestion(profile, fantasy, questionId) {
  return reconcileFantasyState(profile, fantasy, { preferredQuestionId: questionId })
}

export function restartFantasyProfile(profile) {
  return createFantasyState(profile)
}

export function addThemeDeepDive(profile, fantasy, dimensionId, maxCount = 3) {
  const current = reconcileFantasyState(profile, fantasy)
  const alreadyUsed = new Set(current.questionSequence)
  const candidates = (profile.questions || []).filter((question) => (
    question.stage === 'deep_dive'
    && !alreadyUsed.has(question.id)
    && question.signals?.some((signal) => signal.dimensionId === dimensionId)
  ))
  const extra = []
  let lastMirror = profile.questions.find((question) => question.id === current.questionSequence.at(-1))?.mirrorGroup || null
  for (const question of candidates) {
    if (extra.length >= maxCount) break
    if (lastMirror && question.mirrorGroup === lastMirror) continue
    extra.push(question.id)
    lastMirror = question.mirrorGroup || null
  }
  if (!extra.length) return current

  const next = reconcileFantasyState(profile, {
    ...current,
    status: 'in_progress',
    extraQuestionIds: [...current.extraQuestionIds, ...extra],
  })
  return {
    ...next,
    status: 'in_progress',
    currentIndex: next.questionSequence.indexOf(extra[0]),
  }
}

export function fantasyProgress(profile, fantasy) {
  const sequence = fantasy?.questionSequence || []
  const answers = fantasy?.answers || {}
  const answered = sequence.filter((id) => hasOwn(answers, id)).length
  const currentId = sequence[fantasy?.currentIndex || 0]
  const currentQuestion = (profile.questions || []).find((question) => question.id === currentId)
  const stage = currentQuestion?.stage || 'core'
  const coreIds = sequence.filter((id) => id.startsWith('fp_core_'))
  const discriminatorIds = sequence.filter((id) => id.startsWith('fp_discriminator_'))
  const deepIds = sequence.filter((id) => id.startsWith('fp_deep_dive_'))
  const answeredWithin = (ids) => ids.filter((id) => hasOwn(answers, id)).length
  let percent = coreIds.length ? (answeredWithin(coreIds) / coreIds.length) * 68 : 0
  if (discriminatorIds.length) percent = 68 + (answeredWithin(discriminatorIds) / discriminatorIds.length) * 16
  if (deepIds.length) percent = 84 + (answeredWithin(deepIds) / deepIds.length) * 16
  const stageLabel = stage === 'core'
    ? 'Core exploration'
    : stage === 'discriminator'
      ? 'Refining your profile'
      : (fantasy?.extraQuestionIds || []).includes(currentId)
        ? 'Exploring this theme'
        : 'A few deeper questions'
  return {
    answered,
    totalKnown: sequence.length,
    percent: Math.min(100, Math.round(percent)),
    stageLabel,
  }
}
