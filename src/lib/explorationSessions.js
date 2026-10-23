import { scopeMembers } from './relationships.js'
import { createEligibilityContext, evaluateActivity } from './eligibility.js'
export function choosePrompt(exploration, prompt, response) {
  if (!['explore', 'skip_for_now', 'not_sure'].includes(response))
    return exploration
  return {
    ...exploration,
    promptResponses: {
      ...exploration.promptResponses,
      [prompt.id]: {
        response,
        scopeRevision: prompt.scopeRevision,
        sessionId: exploration.session?.id || null
      }
    }
  }
}
export function startSession(
  catalog,
  state,
  {
    size = 10,
    topicId = null,
    categoryId = state.navigation?.categoryId || 'all',
    id = globalThis.crypto?.randomUUID?.() || String(Date.now())
  } = {}
) {
  const prompt = catalog.routingPrompts.find((p) => p.id === topicId)
  const scope = prompt ? new Set(scopeMembers(catalog, prompt.scope)) : null
  const poolIds = catalog.activities
    .filter(
      (a) =>
        !state.answers?.[a.id]?.stance &&
        (scope
          ? scope.has(a.id)
          : categoryId === 'all' || a.categoryId === categoryId)
    )
    .map((a) => a.id)
  // Finite snapshot. Re-filter on display, never refill from unrelated topics.
  const session = {
    id,
    status: 'active',
    topicId,
    categoryId,
    poolIds,
    target: Math.max(1, Math.min(50, Math.round(Number(size) || 10))),
    answeredIds: [],
    skippedIds: []
  }
  return { ...state.exploration, sessionSize: session.target, session }
}
export function sessionProgress(catalog, state, eligibilityContext = null) {
  const session = state.exploration?.session
  if (!session) return null
  const context =
    eligibilityContext ||
    createEligibilityContext(catalog, state, state.fantasyEvidence)
  const answered = new Set(session.answeredIds),
    skipped = new Set(session.skippedIds)
  const pool = new Set(session.poolIds)
  const available = catalog.activities.filter(
    (a) =>
      pool.has(a.id) &&
      !answered.has(a.id) &&
      !skipped.has(a.id) &&
      evaluateActivity(a, context, {
        ignoreSession: true,
        reveal: state.navigation?.showHidden
      }).queueVisible
  )
  const remainingSlots = Math.max(
    0,
    session.target - answered.size - skipped.size
  )
  const availableSet = new Set(available.map((a) => a.id))
  return {
    poolSize: pool.size,
    remainingSlots,
    answered: answered.size,
    skipped: skipped.size,
    savedOutside: session.poolIds.filter(
      (id) =>
        !answered.has(id) && !skipped.has(id) && state.answers?.[id]?.stance
    ).length,
    filtered: session.poolIds.filter(
      (id) =>
        !answered.has(id) &&
        !skipped.has(id) &&
        !state.answers?.[id]?.stance &&
        !availableSet.has(id)
    ).length,
    total:
      answered.size + skipped.size + Math.min(remainingSlots, available.length),
    remaining: Math.min(remainingSlots, available.length),
    done:
      session.status === 'ended' ||
      remainingSlots === 0 ||
      available.length === 0,
    availableIds: available.slice(0, remainingSlots).map((a) => a.id)
  }
}
export function recordSessionAction(exploration, activityId, kind) {
  const s = exploration.session
  if (!s || s.status !== 'active' || !s.poolIds.includes(activityId))
    return exploration
  const key = kind === 'save' ? 'answeredIds' : 'skippedIds'
  if (
    s.answeredIds.includes(activityId) ||
    (kind !== 'save' && s.skippedIds.includes(activityId))
  )
    return exploration
  if (
    !s.skippedIds.includes(activityId) &&
    s.answeredIds.length + s.skippedIds.length >= s.target
  )
    return exploration
  return {
    ...exploration,
    session: {
      ...s,
      skippedIds:
        kind === 'save'
          ? s.skippedIds.filter((id) => id !== activityId)
          : s.skippedIds,
      [key]: [...new Set([...s[key], activityId])]
    }
  }
}
