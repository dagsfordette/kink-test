import {
  answerMeaning,
  canonical,
  newIdentity,
  buildShareProjection
} from './boundaryReview.js'
import { createEligibilityContext, evaluateActivity } from './eligibility.js'

const STANCE_IDS = [
  'love',
  'want',
  'curious',
  'if_partner_wants',
  'not_sure',
  'dont_want',
  'soft_limit',
  'hard_limit'
]
const EXPERIENCE_IDS = [
  'not_tried',
  'tried_once',
  'some_experience',
  'experienced',
  'very_experienced'
]

const STANCE_SET = new Set(STANCE_IDS)
const EXPERIENCE_SET = new Set(EXPERIENCE_IDS)

function trimRoleSpecificOptions(activity, field) {
  if (
    field.id === 'interaction' &&
    activity.detailProfileId === 'material_interest_with_partner_body_general'
  ) {
    if (activity.id.startsWith('self_')) {
      return {
        ...field,
        options: (field.options || []).filter(
          (option) => option.id !== 'partner_wearing'
        )
      }
    }
    if (activity.id.startsWith('observe_')) {
      return {
        ...field,
        options: (field.options || []).filter(
          (option) => !['wearing', 'touching'].includes(option.id)
        )
      }
    }
  }
  return field
}

function defaultCategoryOrder(catalog) {
  return (catalog?.categories || []).map((row) => row.id)
}

export function createActivityState(catalog) {
  const categoryOrder = defaultCategoryOrder(catalog)
  return {
    answers: {},
    drafts: {},
    lastSave: null,
    navigation: {
      categoryId: 'all',
      categoryOrder,
      search: '',
      hiddenActivityIds: [],
      showHidden: false,
      reviewActivityId: null
    }
  }
}

export function normalizeActivityState(catalog, saved) {
  const clean = createActivityState(catalog)
  if (!saved || typeof saved !== 'object') return clean
  const activities = new Map(catalog.activities.map((a) => [a.id, a]))
  const profiles = new Map(catalog.detailProfiles.map((p) => [p.id, p.fields]))
  const categoryIds = new Set(catalog.categories.map((c) => c.id))
  const safeIds = (values, allowed) => [
    ...new Set(
      Array.isArray(values) ? values.filter((id) => allowed.has(id)) : []
    )
  ]

  function answer(id, raw) {
    if (!activities.has(id) || !STANCE_SET.has(raw?.stance)) return null
    const rawDetails =
      raw.details &&
      typeof raw.details === 'object' &&
      !Array.isArray(raw.details)
        ? raw.details
        : {}
    const fields = profiles.get(activities.get(id).detailProfileId) || []
    const details = Object.fromEntries(
      fields
        .filter((f) => Object.hasOwn(rawDetails, f.id))
        .map((f) => {
          const value = rawDetails[f.id]
          const options = new Set((f.options || []).map((o) => o.id))
          if (f.type === 'text')
            return [f.id, typeof value === 'string' ? value : '']
          if (f.type === 'single_select')
            return [f.id, options.has(value) ? value : '']
          if (f.type === 'paired_select')
            return [
              f.id,
              {
                preferred: options.has(value?.preferred) ? value.preferred : '',
                maximum: options.has(value?.maximum) ? value.maximum : ''
              }
            ]
          return [
            f.id,
            Array.isArray(value) ? value.filter((v) => options.has(v)) : []
          ]
        })
    )
    return {
      stance: raw.stance,
      ...(typeof raw.eventId === 'string' ? { eventId: raw.eventId } : {}),
      ...(EXPERIENCE_SET.has(raw.experience)
        ? { experience: raw.experience }
        : {}),
      ...(Number.isInteger(raw.revision) && raw.revision > 0
        ? { revision: raw.revision }
        : {}),
      details,
      note: typeof raw.note === 'string' ? raw.note : ''
    }
  }
  const answers = (raw) =>
    Object.fromEntries(
      Object.entries(raw || {})
        .map(([id, value]) => [id, answer(id, value)])
        .filter(([, value]) => value)
    )
  function navigation(raw = {}) {
    const order = safeIds(raw.categoryOrder, categoryIds)
    return {
      categoryId:
        raw.categoryId === 'all' || categoryIds.has(raw.categoryId)
          ? raw.categoryId
          : 'all',
      categoryOrder: [
        ...order,
        ...clean.navigation.categoryOrder.filter((id) => !order.includes(id))
      ],
      search: typeof raw.search === 'string' ? raw.search : '',
      hiddenActivityIds: safeIds(raw.hiddenActivityIds, activities),
      showHidden: raw.showHidden === true,
      reviewActivityId: activities.has(raw.reviewActivityId)
        ? raw.reviewActivityId
        : null,
      bypassPromptDeferral: raw.bypassPromptDeferral === true
    }
  }
  const last = saved.lastSave
  return {
    answers: answers(saved.answers),
    drafts: answers(saved.drafts),
    navigation: navigation(saved.navigation || {}),
    lastSave: activities.has(last?.activityId)
      ? {
          activityId: last.activityId,
          previous: answer(last.activityId, last.previous),
          saved: answer(last.activityId, last.saved),
          navigation: navigation(last.navigation || {}),
          exploration: last.exploration
            ? { session: last.exploration.session || null }
            : null,
          boundaryBefore: last.boundaryBefore,
          boundaryAfter: last.boundaryAfter
        }
      : null
  }
}

function isActivityAnswered(answer) {
  return Boolean(answer && STANCE_SET.has(answer.stance))
}

export function setActivityStance(state, activityId, stance) {
  if (!STANCE_SET.has(stance)) return state
  const previous = state.answers?.[activityId] || {}
  return {
    ...state,
    answers: {
      ...state.answers,
      [activityId]: {
        ...previous,
        stance,
        ...(EXPERIENCE_SET.has(previous.experience)
          ? { experience: previous.experience }
          : {}),
        details:
          previous.details && typeof previous.details === 'object'
            ? previous.details
            : {},
        note: typeof previous.note === 'string' ? previous.note : ''
      }
    }
  }
}

export function setActivityExperience(state, activityId, experience) {
  const previous = state.answers?.[activityId]
  if (!previous?.stance) return state
  const next = { ...previous }
  if (EXPERIENCE_SET.has(experience)) next.experience = experience
  else delete next.experience
  return { ...state, answers: { ...state.answers, [activityId]: next } }
}

export function setActivityDetails(state, activityId, details) {
  const previous = state.answers?.[activityId]
  if (!previous?.stance) return state
  return {
    ...state,
    answers: {
      ...state.answers,
      [activityId]: {
        ...previous,
        details: details && typeof details === 'object' ? details : {}
      }
    }
  }
}

export function setActivityNote(state, activityId, note) {
  const previous = state.answers?.[activityId]
  if (!previous?.stance) return state
  return {
    ...state,
    answers: {
      ...state.answers,
      [activityId]: { ...previous, note: String(note ?? '') }
    }
  }
}

export function clearActivityAnswer(state, activityId) {
  const answers = { ...state.answers }
  const previous = answers[activityId]
  delete answers[activityId]
  const boundaryBefore = boundaryRecords(state),
    exploration = withoutOwner(state.exploration, activityId)
  const session = exploration?.session
  const next = {
    ...discardActivityDraft(state, activityId),
    answers,
    exploration: session
      ? {
          ...exploration,
          session: {
            ...session,
            answeredIds: session.answeredIds.filter((id) => id !== activityId)
          }
        }
      : exploration
  }
  return {
    ...next,
    lastSave: {
      activityId,
      previous,
      saved: null,
      navigation: state.navigation,
      exploration: { session: state.exploration?.session },
      boundaryBefore,
      boundaryAfter: boundaryRecords(next)
    }
  }
}

export function updateActivityNavigation(state, patch) {
  return { ...state, navigation: { ...state.navigation, ...patch } }
}

export function orderedActivityCategories(catalog, state) {
  const byId = new Map((catalog?.categories || []).map((row) => [row.id, row]))
  const savedOrder = Array.isArray(state.navigation?.categoryOrder)
    ? state.navigation.categoryOrder
    : []
  const ids = [...new Set([...savedOrder, ...defaultCategoryOrder(catalog)])]
  return ids.map((id) => byId.get(id)).filter(Boolean)
}

function scopedActivities(
  catalog,
  state,
  { categoryId = 'all', includeAnswered = true } = {}
) {
  const context = createEligibilityContext(
    catalog,
    state,
    state.fantasyEvidence
  )
  return (catalog.activities || [])
    .filter((a) => categoryId === 'all' || a.categoryId === categoryId)
    .filter((a) => {
      const derived = evaluateActivity(a, context, {
        ignoreSession: true,
        reveal: state.navigation?.showHidden
      })
      return (includeAnswered && derived.hasSavedAnswer) || derived.queueVisible
    })
}

export function prepareActivityExplorerState(
  catalog,
  state,
  { categoryOrder = null, resetView = false } = {}
) {
  return updateActivityNavigation(state, {
    categoryOrder: [
      ...new Set([...(categoryOrder || []), ...defaultCategoryOrder(catalog)])
    ],
    ...(resetView
      ? { categoryId: 'all', reviewActivityId: null, showHidden: false }
      : {})
  })
}

export function focusUnansweredActivities(state) {
  return updateActivityNavigation(
    {
      ...state,
      ...(state.exploration
        ? { exploration: { ...state.exploration, session: null } }
        : {})
    },
    {
      categoryId: 'all',
      search: '',
      reviewActivityId: null
    }
  )
}

export function focusActivityForReview(state, catalog, activityId) {
  const activity = (catalog?.activities || []).find(
    (row) => row.id === activityId
  )
  if (!activity) return state
  return updateActivityNavigation(state, {
    categoryId: activity.categoryId,
    reviewActivityId: activityId,
    search: ''
  })
}

export function toggleHiddenActivity(state, activityId) {
  const current = new Set(state.navigation?.hiddenActivityIds || [])
  current.has(activityId) ? current.delete(activityId) : current.add(activityId)
  return updateActivityNavigation(state, { hiddenActivityIds: [...current] })
}

export function activityProgress(catalog, state, categoryId = null) {
  const rows = scopedActivities(catalog, state, {
    categoryId: categoryId || 'all',
    includeAnswered: true
  })
  const answered = rows.filter((activity) =>
    isActivityAnswered(state.answers?.[activity.id])
  ).length
  return {
    answered,
    total: rows.length,
    percent: rows.length ? Math.round((answered / rows.length) * 100) : 0
  }
}

function interleaveByCategory(rows, categoryOrder) {
  const buckets = new Map(categoryOrder.map((id) => [id, []]))
  for (const row of rows) {
    if (!buckets.has(row.categoryId)) buckets.set(row.categoryId, [])
    buckets.get(row.categoryId).push(row)
  }
  const priorityRank = { starter: 0, extended: 1, specialized: 2 }
  for (const bucket of buckets.values()) {
    bucket.sort(
      (a, b) =>
        priorityRank[a.priority] - priorityRank[b.priority] ||
        a.label.localeCompare(b.label)
    )
  }
  const mixed = []
  let remaining = true
  while (remaining) {
    remaining = false
    for (const categoryId of categoryOrder) {
      const bucket = buckets.get(categoryId)
      if (bucket?.length) {
        mixed.push(bucket.shift())
        remaining = true
      }
    }
  }
  for (const [categoryId, bucket] of buckets) {
    if (categoryOrder.includes(categoryId)) continue
    mixed.push(...bucket)
  }
  return mixed
}

export function filterActivities(
  catalog,
  state,
  overrides = {},
  eligibilityContext = null
) {
  const nav = { ...state.navigation, ...overrides },
    effective = { ...state, navigation: nav }
  if (nav.reviewActivityId)
    return catalog.activities.filter((a) => a.id === nav.reviewActivityId)
  const context =
    eligibilityContext ||
    createEligibilityContext(catalog, effective, state.fantasyEvidence)
  const rows = catalog.activities.filter(
    (a) =>
      (nav.categoryId === 'all' ||
        !nav.categoryId ||
        a.categoryId === nav.categoryId) &&
      (!nav.search ||
        `${a.label} ${a.description} ${(a.aliases || []).join(' ')}`
          .toLowerCase()
          .includes(nav.search.toLowerCase())) &&
      (Boolean(state.drafts?.[a.id]) ||
        evaluateActivity(a, context, { reveal: nav.showHidden }).queueVisible)
  )
  const mixed = interleaveByCategory(
    rows,
    orderedActivityCategories(catalog, effective).map((c) => c.id)
  )
  // Pin existing drafts even when their context or category changes while editing.
  for (const a of catalog.activities)
    if (state.drafts?.[a.id] && !mixed.some((x) => x.id === a.id))
      mixed.unshift(a)
  return mixed
}

export function detailFieldsForActivity(catalog, activity, details = {}) {
  if (!activity?.detailProfileId) return []
  const profile = (catalog?.detailProfiles || []).find(
    (row) => row.id === activity.detailProfileId
  )
  if (!profile) return []

  return (profile.fields || [])
    .filter((field) => {
      if (
        Array.isArray(field.appliesToActivityIds) &&
        !field.appliesToActivityIds.includes(activity.id)
      )
        return false
      if (
        Array.isArray(field.excludeForActivityIds) &&
        field.excludeForActivityIds.includes(activity.id)
      )
        return false
      if (!field.showWhen) return true
      const current = details?.[field.showWhen.field]
      if (field.showWhen.operator === 'contains')
        return Array.isArray(current) && current.includes(field.showWhen.value)
      if (field.showWhen.operator === 'containsAny')
        return (
          Array.isArray(current) &&
          (field.showWhen.value || []).some((value) => current.includes(value))
        )
      if (field.showWhen.operator === 'equals')
        return current === field.showWhen.value
      return true
    })
    .map((field) => trimRoleSpecificOptions(activity, field))
}

export function groupActivityResults(catalog, state, mode = 'stance') {
  const categoryById = new Map(
    (catalog?.categories || []).map((row) => [row.id, row])
  )
  const stanceById = new Map(
    (catalog?.stanceScale || []).map((row) => [row.id, row])
  )
  const experienceById = new Map(
    (catalog?.experienceScale || []).map((row) => [row.id, row])
  )
  const context = createEligibilityContext(
    catalog,
    state,
    state.fantasyEvidence
  )
  const showHidden = Boolean(state.navigation?.showHidden)
  const groups = new Map()
  const unansweredIds = []
  let consideredCount = 0
  let answeredCount = 0
  const add = (key, label, activity, answer) => {
    if (!groups.has(key)) groups.set(key, { key, label, rows: [] })
    groups.get(key).rows.push({ activity, answer })
  }

  for (const activity of catalog?.activities || []) {
    const answer = state.answers?.[activity.id]
    const answered = isActivityAnswered(answer)
    const hiddenFromPath = !evaluateActivity(activity, context, {
      reveal: showHidden,
      ignoreSession: true
    }).queueVisible
    if (!answered && hiddenFromPath) continue
    consideredCount += 1
    if (!answered) {
      unansweredIds.push(activity.id)
      continue
    }
    answeredCount += 1
    if (mode === 'notes' && !answer?.note?.trim()) continue
    if (mode === 'conditions' && answer.stance !== 'soft_limit') continue
    if (mode === 'category')
      add(
        activity.categoryId,
        categoryById.get(activity.categoryId)?.label || activity.categoryId,
        activity,
        answer
      )
    else if (mode === 'experience') {
      const key = answer?.experience || 'unanswered'
      add(
        key,
        experienceById.get(key)?.label || 'Experience unanswered',
        activity,
        answer
      )
    } else if (mode === 'notes') add('notes', 'With notes', activity, answer)
    else if (mode === 'conditions')
      add('conditions', 'Soft limits / conditions', activity, answer)
    else
      add(
        answer.stance,
        stanceById.get(answer.stance)?.label || answer.stance,
        activity,
        answer
      )
  }

  const stanceOrder = [
    'love',
    'want',
    'curious',
    'if_partner_wants',
    'not_sure',
    'soft_limit',
    'dont_want',
    'hard_limit'
  ]
  const experienceOrder = [...EXPERIENCE_IDS, 'unanswered']
  const groupsArray = [...groups.values()]
  const order =
    mode === 'stance'
      ? stanceOrder
      : mode === 'experience'
        ? experienceOrder
        : null
  if (order)
    groupsArray.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))
  else groupsArray.sort((a, b) => a.label.localeCompare(b.label))
  for (const group of groupsArray)
    group.rows.sort((a, b) => a.activity.label.localeCompare(b.activity.label))
  return {
    groups: groupsArray,
    unansweredCount: unansweredIds.length,
    unansweredIds,
    consideredCount,
    answeredCount
  }
}

export function comparisonProfileFromActivityState(state, catalog) {
  if (!catalog)
    throw new Error('A current catalogue is required for comparison.')
  const result = buildShareProjection(catalog, state)
  return result.allowed
    ? result.payload
    : { activities: { answers: {} }, blocked: true }
}

// Drafts stay private and do not count as committed answers.
export function editActivityDraft(state, activityId, updater) {
  const answer = state.drafts?.[activityId] || state.answers?.[activityId]
  const edited = updater({ ...state, answers: { [activityId]: answer } })
  if (!edited.answers[activityId]?.stance) return state
  return {
    ...state,
    drafts: { ...state.drafts, [activityId]: edited.answers[activityId] }
  }
}

export function discardActivityDraft(state, activityId) {
  const drafts = { ...state.drafts }
  delete drafts[activityId]
  return { ...state, drafts }
}

function boundaryRecords(state) {
  return {
    boundaries: state.exploration?.boundaries || [],
    exceptions: state.exploration?.exceptions || []
  }
}
function withoutOwner(exploration, id) {
  if (!exploration) return exploration
  const removed = new Set(
    (exploration.boundaries || [])
      .filter((b) => b?.owner?.id === id)
      .map((b) => b.id)
  )
  return {
    ...exploration,
    boundaries: (exploration.boundaries || []).filter(
      (b) => !removed.has(b?.id)
    ),
    exceptions: (exploration.exceptions || []).filter(
      (x) => !removed.has(x?.boundaryId)
    )
  }
}
export function saveActivityDraft(state, activityId) {
  const answer = state.drafts?.[activityId] || state.answers?.[activityId]
  if (!isActivityAnswered(answer)) return state
  const previous = state.answers[activityId] || null
  const same = previous && answerMeaning(previous) === answerMeaning(answer)
  const saved = same
    ? previous
    : {
        ...answer,
        revision: (previous?.revision || 0) + 1,
        eventId: newIdentity()
      }
  const exploration =
    saved.stance === 'hard_limit'
      ? state.exploration
      : withoutOwner(state.exploration, activityId)
  const next = {
    ...discardActivityDraft(state, activityId),
    exploration,
    answers: { ...state.answers, [activityId]: saved }
  }
  return {
    ...next,
    lastSave: {
      exploration: state.exploration
        ? { session: state.exploration.session }
        : null,
      activityId,
      previous,
      saved,
      navigation: { ...state.navigation },
      boundaryBefore: boundaryRecords(state),
      boundaryAfter: boundaryRecords(next)
    },
    navigation: {
      ...state.navigation,
      reviewActivityId: null,
      ...(state.navigation.reviewActivityId && state.exploration?.session
        ? {
            categoryId: state.exploration.session.topicId
              ? 'all'
              : state.exploration.session.categoryId,
            search: ''
          }
        : {})
    }
  }
}

export function undoActivitySave(state) {
  const last = state.lastSave
  if (!last) return state
  const answers = { ...state.answers }
  if (last.previous) answers[last.activityId] = last.previous
  else delete answers[last.activityId]
  let exploration = state.exploration
  if (
    last.boundaryBefore &&
    canonical(boundaryRecords(state)) === canonical(last.boundaryAfter)
  )
    exploration = { ...exploration, ...last.boundaryBefore }
  if (
    last.exploration?.session &&
    exploration?.session &&
    last.exploration.session.id === exploration.session.id
  ) {
    // Undo only this answer's credit; retain later skips, pause state and other work.
    const before = last.exploration.session,
      current = exploration.session
    const restoreMembership = (key) => [
      ...current[key].filter((id) => id !== last.activityId),
      ...(before[key].includes(last.activityId) ? [last.activityId] : [])
    ]
    exploration = {
      ...exploration,
      session: {
        ...current,
        answeredIds: restoreMembership('answeredIds'),
        skippedIds: restoreMembership('skippedIds')
      }
    }
  }
  return {
    ...state,
    answers,
    lastSave: null,
    drafts: {
      ...state.drafts,
      [last.activityId]:
        state.drafts?.[last.activityId] || last.saved || last.previous
    },
    exploration,
    navigation: { ...last.navigation, reviewActivityId: last.activityId }
  }
}

export function saveActivityEdit(state, activityId, updater) {
  const navigation = state.navigation
  const next = saveActivityDraft(editActivityDraft(state, activityId, updater), activityId)
  return { ...next, navigation }
}
export function undoActivityEdit(state) {
  const id = state.lastSave?.activityId
  return discardActivityDraft(undoActivitySave(state), id)
}
