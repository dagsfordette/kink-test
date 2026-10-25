import {
  selectDeepDiveQuestions,
  selectDiscriminatorQuestions
} from './fantasyProfile.js'

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key)
}

function responseIds(profile) {
  return new Set((profile.responseScale || []).map((row) => row.id))
}

function coreQuestions(profile) {
  return (profile.questions || []).filter(
    (question) => question.stage === 'core'
  )
}

function sanitizeFantasyAnswers(profile, answers = {}) {
  const validQuestions = new Set(
    (profile.questions || []).map((question) => question.id)
  )
  const validResponses = responseIds(profile)
  return Object.fromEntries(
    Object.entries(answers || {}).filter(
      ([questionId, response]) =>
        validQuestions.has(questionId) && validResponses.has(response)
    )
  )
}

function answersFor(questionIds, answers) {
  const next = {}
  for (const id of questionIds) if (hasOwn(answers, id)) next[id] = answers[id]
  return next
}

function deriveFantasyRoute(profile, rawAnswers = {}) {
  const answers = sanitizeFantasyAnswers(profile, rawAnswers)
  const sequence = coreQuestions(profile).map((question) => question.id)
  const active = answersFor(sequence, answers)
  if (!sequence.every((id) => hasOwn(active, id))) return { sequence, answers: active }

  while (true) {
    const options = { priorQuestionIds: sequence, nextOnly: true }
    const next = selectDiscriminatorQuestions(profile, active, options)[0] ||
      selectDeepDiveQuestions(profile, active, options)[0]
    if (!next) return { sequence, answers: active }
    sequence.push(next.id)
    if (!hasOwn(answers, next.id)) return { sequence, answers: active }
    active[next.id] = answers[next.id]
  }
}

export function createFantasyState(profile) {
  return {
    status: 'not_started',
    answers: {},
    questionSequence: coreQuestions(profile).map((question) => question.id),
    currentIndex: 0
  }
}

function firstUnansweredIndex(sequence, answers) {
  const index = sequence.findIndex((id) => !hasOwn(answers, id))
  return index === -1 ? Math.max(sequence.length - 1, 0) : index
}

export function reconcileFantasyState(profile, fantasy, options = {}) {
  const route = deriveFantasyRoute(profile, fantasy?.answers || {})
  const complete =
    route.sequence.length > 0 &&
    route.sequence.every((id) => hasOwn(route.answers, id))
  const preferredId = options.preferredQuestionId
  let currentIndex = Number.isInteger(fantasy?.currentIndex)
    ? fantasy.currentIndex
    : 0
  if (preferredId && route.sequence.includes(preferredId))
    currentIndex = route.sequence.indexOf(preferredId)
  currentIndex = Math.max(
    0,
    Math.min(currentIndex, Math.max(route.sequence.length - 1, 0))
  )
  if (options.jumpToFirstUnanswered && !complete)
    currentIndex = firstUnansweredIndex(route.sequence, route.answers)

  return {
    status:
      fantasy?.status === 'not_started' && !Object.keys(route.answers).length
        ? 'not_started'
        : complete
          ? 'complete'
          : 'in_progress',
    answers: sanitizeFantasyAnswers(profile, fantasy?.answers || {}),
    questionSequence: route.sequence,
    currentIndex
  }
}

export function startFantasyProfile(
  profile,
  fantasy = createFantasyState(profile)
) {
  const next = reconcileFantasyState(
    profile,
    { ...fantasy, status: 'in_progress' },
    { jumpToFirstUnanswered: true }
  )
  return {
    ...next,
    status: next.status === 'not_started' ? 'in_progress' : next.status
  }
}

export function answerFantasyQuestion(
  profile,
  fantasy,
  questionId,
  response,
  options = {}
) {
  const nextAnswers = { ...(fantasy?.answers || {}), [questionId]: response }
  let next = reconcileFantasyState(
    profile,
    { ...fantasy, status: 'in_progress', answers: nextAnswers },
    { preferredQuestionId: questionId }
  )
  if (options.advance !== false) {
    const questionIndex = next.questionSequence.indexOf(questionId)
    if (
      questionIndex >= 0 &&
      questionIndex < next.questionSequence.length - 1
    ) {
      next = { ...next, currentIndex: questionIndex + 1 }
    }
  }
  return next
}

export function goToFantasyQuestion(profile, fantasy, questionId) {
  return reconcileFantasyState(profile, fantasy, {
    preferredQuestionId: questionId
  })
}

export function restartFantasyProfile(profile) {
  return createFantasyState(profile)
}

export function fantasyProgress(profile, fantasy) {
  const sequence = fantasy?.questionSequence || []
  const answers = fantasy?.answers || {}
  const answered = sequence.filter((id) => hasOwn(answers, id)).length
  const currentId = sequence[fantasy?.currentIndex || 0]
  const currentQuestion = (profile.questions || []).find(
    (question) => question.id === currentId
  )
  const stage = currentQuestion?.stage || 'core'
  return {
    answered,
    stageLabel: stage === 'core' ? 'Exploring your interests' : 'Following your interests'
  }
}

// Stored answers survive route changes; only this projection contributes to results.
export function activeFantasyAnswers(fantasy) {
  return answersFor(fantasy?.questionSequence || [], fantasy?.answers || {})
}
