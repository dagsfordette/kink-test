export const STANCE_IDS = ['love', 'want', 'curious', 'if_partner_wants', 'dont_want', 'soft_limit', 'hard_limit']
export const EXPERIENCE_IDS = ['not_tried', 'tried_once', 'some_experience', 'experienced', 'very_experienced']
export const DEPTH_IDS = ['starter', 'extended', 'specialized', 'all']

const STANCE_SET = new Set(STANCE_IDS)
const EXPERIENCE_SET = new Set(EXPERIENCE_IDS)
const DEPTH_SET = new Set(DEPTH_IDS)

const BASICS_DETAIL_FIELD_IDS = new Set([
  'body_partner_gender', 'body_gender_expression', 'body_partner_anatomy', 'body_build',
  'body_height_relative', 'body_hair', 'body_feature_focus', 'body_pubic_hair',
  'body_penis_size', 'body_breast_chest',
])

const ALWAYS_REDUNDANT_DETAIL_FIELD_IDS = new Set(['detail_note'])
const ROLE_ALREADY_IN_ACTIVITY_FIELD_IDS = new Set(['role_preferences', 'edge_role', 'pet_role'])
const GENERIC_SEXUAL_CONTEXT_FIELD_IDS = new Set(['completion', 'context_preferences', 'physical_privacy'])
const AVAILABILITY_ACTIVITY_IDS = new Set(['direct_negotiated_sexual_availability', 'follow_negotiated_sexual_availability'])
const AVAILABILITY_REDUNDANT_FIELD_IDS = new Set(['scope', 'protocol', 'areas', 'sexual_submission_scope'])
const IMMOBILIZATION_ACTIVITY_IDS = new Set(['give_partial_immobilization', 'receive_partial_immobilization', 'give_full_immobilization', 'receive_full_immobilization'])
const POSITION_ALREADY_IN_ACTIVITY_IDS = new Set([
  'give_standing_restraint', 'receive_standing_restraint', 'give_kneeling_restraint', 'receive_kneeling_restraint',
  'give_hands_behind_back', 'receive_hands_behind_back', 'give_arms_overhead', 'receive_arms_overhead',
  'give_spread_position_restraint', 'receive_spread_position_restraint',
])
const BODY_AREA_ALREADY_IN_ACTIVITY_IDS = new Set([
  'give_wrist_restraint', 'receive_wrist_restraint', 'give_ankle_restraint', 'receive_ankle_restraint',
  'give_arm_restraint', 'receive_arm_restraint', 'give_leg_restraint', 'receive_leg_restraint',
  'give_full_body_restraint', 'receive_full_body_restraint', 'give_hands_behind_back', 'receive_hands_behind_back',
  'give_arms_overhead', 'receive_arms_overhead', 'give_spread_position_restraint', 'receive_spread_position_restraint',
])

function trimRoleSpecificOptions(activity, field) {
  if (field.id === 'interaction' && activity.detailProfileId === 'body_part_interest_with_partner_body_general') {
    if (activity.id.startsWith('observe_')) {
      return { ...field, options: (field.options || []).filter((option) => ['looking'].includes(option.id)) }
    }
    if (activity.id.startsWith('give_')) {
      return { ...field, options: (field.options || []).filter((option) => option.id !== 'receiving_attention') }
    }
  }
  if (field.id === 'interaction' && activity.detailProfileId === 'material_interest_with_partner_body_general') {
    if (activity.id.startsWith('self_')) {
      return { ...field, options: (field.options || []).filter((option) => option.id !== 'partner_wearing') }
    }
    if (activity.id.startsWith('observe_')) {
      return { ...field, options: (field.options || []).filter((option) => !['wearing', 'touching'].includes(option.id)) }
    }
  }
  return field
}

export function createActivityState(catalog) {
  return {
    answers: {},
    navigation: {
      categoryId: catalog?.categories?.[0]?.id || 'all',
      entryCategoryId: catalog?.categories?.[0]?.id || 'all',
      search: '',
      stanceFilter: 'all',
      experienceFilter: 'all',
      answerFilter: 'all',
      depth: 'starter',
      skippedCategoryIds: [],
      adaptiveHiddenCategoryIds: [],
      hiddenActivityIds: [],
      showHidden: false,
    },
  }
}

export function normalizeActivityState(catalog, saved) {
  const clean = createActivityState(catalog)
  if (!saved || typeof saved !== 'object') return clean

  const activityById = new Map((catalog?.activities || []).map((row) => [row.id, row]))
  const activityIds = new Set(activityById.keys())
  const categoryIds = new Set((catalog?.categories || []).map((row) => row.id))
  const answers = {}

  for (const [activityId, raw] of Object.entries(saved.answers || {})) {
    if (!activityIds.has(activityId) || !raw || !STANCE_SET.has(raw.stance)) continue
    const rawDetails = raw.details && typeof raw.details === 'object' && !Array.isArray(raw.details) ? raw.details : {}
    const allowedDetailIds = new Set(detailFieldsForActivity(catalog, activityById.get(activityId), rawDetails).map((field) => field.id))
    answers[activityId] = {
      stance: raw.stance,
      ...(EXPERIENCE_SET.has(raw.experience) ? { experience: raw.experience } : {}),
      details: Object.fromEntries(Object.entries(rawDetails).filter(([fieldId]) => allowedDetailIds.has(fieldId))),
      note: typeof raw.note === 'string' ? raw.note : '',
    }
  }

  const navigation = saved.navigation && typeof saved.navigation === 'object' ? saved.navigation : {}
  const safeIds = (values, allowed) => [...new Set(Array.isArray(values) ? values.filter((id) => allowed.has(id)) : [])]

  return {
    ...clean,
    answers,
    navigation: {
      ...clean.navigation,
      categoryId: navigation.categoryId === 'all' || categoryIds.has(navigation.categoryId) ? navigation.categoryId : clean.navigation.categoryId,
      entryCategoryId: navigation.entryCategoryId === 'all' || categoryIds.has(navigation.entryCategoryId) ? navigation.entryCategoryId : clean.navigation.entryCategoryId,
      search: typeof navigation.search === 'string' ? navigation.search : '',
      stanceFilter: navigation.stanceFilter === 'all' || STANCE_SET.has(navigation.stanceFilter) ? navigation.stanceFilter : 'all',
      experienceFilter: navigation.experienceFilter === 'all' || navigation.experienceFilter === 'unanswered' || EXPERIENCE_SET.has(navigation.experienceFilter) ? navigation.experienceFilter : 'all',
      answerFilter: ['all', 'answered', 'unanswered'].includes(navigation.answerFilter) ? navigation.answerFilter : 'all',
      depth: DEPTH_SET.has(navigation.depth) ? navigation.depth : 'starter',
      skippedCategoryIds: safeIds(navigation.skippedCategoryIds, categoryIds),
      adaptiveHiddenCategoryIds: safeIds(navigation.adaptiveHiddenCategoryIds, categoryIds),
      hiddenActivityIds: safeIds(navigation.hiddenActivityIds, activityIds),
      showHidden: Boolean(navigation.showHidden),
    },
  }
}

export function isActivityAnswered(answer) {
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
        stance,
        ...(EXPERIENCE_SET.has(previous.experience) ? { experience: previous.experience } : {}),
        details: previous.details && typeof previous.details === 'object' ? previous.details : {},
        note: typeof previous.note === 'string' ? previous.note : '',
      },
    },
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
      [activityId]: { ...previous, details: details && typeof details === 'object' ? details : {} },
    },
  }
}

export function setActivityNote(state, activityId, note) {
  const previous = state.answers?.[activityId]
  if (!previous?.stance) return state
  return { ...state, answers: { ...state.answers, [activityId]: { ...previous, note: String(note ?? '') } } }
}

export function clearActivityAnswer(state, activityId) {
  const answers = { ...state.answers }
  delete answers[activityId]
  return { ...state, answers }
}

export function updateActivityNavigation(state, patch) {
  return { ...state, navigation: { ...state.navigation, ...patch } }
}


export function focusUnansweredActivities(state) {
  return updateActivityNavigation(state, {
    categoryId: 'all',
    search: '',
    stanceFilter: 'all',
    experienceFilter: 'all',
    answerFilter: 'unanswered',
    depth: 'all',
    showHidden: Boolean(state.navigation?.showHidden),
  })
}

export function toggleSkippedCategory(state, categoryId) {
  const current = new Set(state.navigation?.skippedCategoryIds || [])
  current.has(categoryId) ? current.delete(categoryId) : current.add(categoryId)
  return updateActivityNavigation(state, { skippedCategoryIds: [...current] })
}

export function toggleHiddenActivity(state, activityId) {
  const current = new Set(state.navigation?.hiddenActivityIds || [])
  current.has(activityId) ? current.delete(activityId) : current.add(activityId)
  return updateActivityNavigation(state, { hiddenActivityIds: [...current] })
}


export function activityProgress(catalog, state, categoryId = null) {
  const nav = state.navigation || {}
  const hiddenCategories = new Set([...(nav.skippedCategoryIds || []), ...(nav.adaptiveHiddenCategoryIds || [])])
  const hiddenActivities = new Set(nav.hiddenActivityIds || [])
  const rows = (catalog?.activities || [])
    .filter((activity) => !categoryId || categoryId === 'all' || activity.categoryId === categoryId)
    .filter((activity) => nav.showHidden || categoryId !== 'all' || !hiddenCategories.has(activity.categoryId))
    .filter((activity) => nav.showHidden || !hiddenActivities.has(activity.id))
  const answered = rows.filter((activity) => isActivityAnswered(state.answers?.[activity.id])).length
  return { answered, total: rows.length, percent: rows.length ? Math.round((answered / rows.length) * 100) : 0 }
}

function priorityVisible(priority, depth) {
  if (depth === 'all' || depth === 'specialized') return true
  if (depth === 'extended') return priority === 'starter' || priority === 'extended'
  return priority === 'starter'
}

export function filterActivities(catalog, state, overrides = {}) {
  const nav = { ...state.navigation, ...overrides }
  const hidden = new Set(nav.hiddenActivityIds || [])
  const hiddenCategories = new Set([...(nav.skippedCategoryIds || []), ...(nav.adaptiveHiddenCategoryIds || [])])
  const query = String(nav.search || '').trim().toLowerCase()
  const searchMode = query.length > 0

  return (catalog?.activities || [])
    .filter((activity) => searchMode || nav.categoryId === 'all' || activity.categoryId === nav.categoryId)
    .filter((activity) => searchMode || nav.categoryId !== 'all' || nav.showHidden || !hiddenCategories.has(activity.categoryId))
    .filter((activity) => searchMode || priorityVisible(activity.priority, nav.depth))
    .filter((activity) => nav.showHidden || !hidden.has(activity.id))
    .filter((activity) => !query || `${activity.label} ${activity.description} ${(activity.tags || []).join(' ')} ${(activity.aliases || []).join(' ')}`.toLowerCase().includes(query))
    .filter((activity) => {
      const answer = state.answers?.[activity.id]
      if (nav.answerFilter === 'answered' && !isActivityAnswered(answer)) return false
      if (nav.answerFilter === 'unanswered' && isActivityAnswered(answer)) return false
      if (nav.stanceFilter !== 'all' && answer?.stance !== nav.stanceFilter) return false
      if (nav.experienceFilter === 'unanswered' && answer?.experience) return false
      if (nav.experienceFilter !== 'all' && nav.experienceFilter !== 'unanswered' && answer?.experience !== nav.experienceFilter) return false
      return true
    })
    .sort((a, b) => {
      const priorityRank = { starter: 0, extended: 1, specialized: 2 }
      return (priorityRank[a.priority] - priorityRank[b.priority]) || a.label.localeCompare(b.label)
    })
}

export function detailFieldsForActivity(catalog, activity, details = {}) {
  if (!activity?.detailProfileId) return []
  const profile = (catalog?.detailProfiles || []).find((row) => row.id === activity.detailProfileId)
  if (!profile) return []

  return (profile.fields || []).filter((field) => {
    if (BASICS_DETAIL_FIELD_IDS.has(field.id) || ALWAYS_REDUNDANT_DETAIL_FIELD_IDS.has(field.id)) return false
    if (ROLE_ALREADY_IN_ACTIVITY_FIELD_IDS.has(field.id)) return false
    if (GENERIC_SEXUAL_CONTEXT_FIELD_IDS.has(field.id) && ['sexual_activity', 'sexual_activity_with_partner_body_general'].includes(activity.detailProfileId)) return false
    if (AVAILABILITY_ACTIVITY_IDS.has(activity.id) && AVAILABILITY_REDUNDANT_FIELD_IDS.has(field.id)) return false
    if (IMMOBILIZATION_ACTIVITY_IDS.has(activity.id) && ['restriction', 'mobility_preferences'].includes(field.id)) return false
    if (POSITION_ALREADY_IN_ACTIVITY_IDS.has(activity.id) && field.id === 'preferred_positions') return false
    if (BODY_AREA_ALREADY_IN_ACTIVITY_IDS.has(activity.id) && field.id === 'preferred_areas') return false
    if (Array.isArray(field.appliesToActivityIds) && !field.appliesToActivityIds.includes(activity.id)) return false
    if (Array.isArray(field.excludeForActivityIds) && field.excludeForActivityIds.includes(activity.id)) return false
    if (!field.showWhen) return true
    const current = details?.[field.showWhen.field]
    if (field.showWhen.operator === 'contains') return Array.isArray(current) && current.includes(field.showWhen.value)
    if (field.showWhen.operator === 'containsAny') return Array.isArray(current) && (field.showWhen.value || []).some((value) => current.includes(value))
    if (field.showWhen.operator === 'equals') return current === field.showWhen.value
    return true
  }).map((field) => trimRoleSpecificOptions(activity, field))
}

export function groupActivityResults(catalog, state, mode = 'stance') {
  const categoryById = new Map((catalog?.categories || []).map((row) => [row.id, row]))
  const stanceById = new Map((catalog?.stanceScale || []).map((row) => [row.id, row]))
  const experienceById = new Map((catalog?.experienceScale || []).map((row) => [row.id, row]))
  const showHidden = Boolean(state.navigation?.showHidden)
  const hiddenCategories = new Set(showHidden ? [] : [...(state.navigation?.skippedCategoryIds || []), ...(state.navigation?.adaptiveHiddenCategoryIds || [])])
  const hiddenActivities = new Set(showHidden ? [] : (state.navigation?.hiddenActivityIds || []))
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
    const hiddenFromPath = hiddenCategories.has(activity.categoryId) || hiddenActivities.has(activity.id)
    if (!answered && hiddenFromPath) continue
    consideredCount += 1
    if (!answered) {
      unansweredIds.push(activity.id)
      continue
    }
    answeredCount += 1
    if (mode === 'notes' && !answer?.note?.trim()) continue
    if (mode === 'conditions' && answer.stance !== 'soft_limit') continue
    if (mode === 'category') add(activity.categoryId, categoryById.get(activity.categoryId)?.label || activity.categoryId, activity, answer)
    else if (mode === 'experience') {
      const key = answer?.experience || 'unanswered'
      add(key, experienceById.get(key)?.label || 'Experience unanswered', activity, answer)
    } else if (mode === 'notes') add('notes', 'With notes', activity, answer)
    else if (mode === 'conditions') add('conditions', 'Soft limits / conditions', activity, answer)
    else add(answer.stance, stanceById.get(answer.stance)?.label || answer.stance, activity, answer)
  }

  const stanceOrder = [...STANCE_IDS.slice(0, 4), 'soft_limit', 'hard_limit', 'dont_want']
  const experienceOrder = [...EXPERIENCE_IDS, 'unanswered']
  const groupsArray = [...groups.values()]
  const order = mode === 'stance' ? stanceOrder : mode === 'experience' ? experienceOrder : null
  if (order) groupsArray.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))
  else groupsArray.sort((a, b) => a.label.localeCompare(b.label))
  for (const group of groupsArray) group.rows.sort((a, b) => a.activity.label.localeCompare(b.activity.label))
  return { groups: groupsArray, unansweredCount: unansweredIds.length, unansweredIds, consideredCount, answeredCount }
}

export function comparisonProfileFromActivityState(state) {
  return {
    activities: {
      answers: typeof structuredClone === 'function' ? structuredClone(state.answers || {}) : JSON.parse(JSON.stringify(state.answers || {})),
    },
  }
}
