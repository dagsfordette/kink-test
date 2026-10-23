import { relationshipGraph } from './relationships.js'
import { INTEREST } from './boundaryReview.js'
export const comparisonStateLabels = {
  strong_match: 'Strong match',
  willing_match: 'Willing match',
  mutual_curiosity: 'Mutual curiosity',
  conditional_discussion: 'Conditional discussion',
  preference_mismatch: 'Preference mismatch',
  hard_limit_conflict: 'Hard-limit conflict',
  aligned_no_interest: 'Shared no-interest / boundary',
  insufficient_data: 'Insufficient data'
}

export function comparisonPage(rows, filter = 'all', requestedPage = 0) {
  const matches = filter === 'all' ? rows : rows.filter((r) => r.state === filter)
  const size = 50
  const pageCount = Math.max(1, Math.ceil(matches.length / size))
  const page = Math.max(0, Math.min(pageCount - 1, requestedPage))
  return {
    rows: matches.slice(page * size, (page + 1) * size),
    page,
    pageCount,
    total: matches.length,
    from: matches.length ? page * size + 1 : 0,
    to: Math.min(matches.length, (page + 1) * size)
  }
}

const ACTIVE = new Set(['love', 'want'])
const TENTATIVE = new Set(['curious', 'if_partner_wants'])
const POSITIVE = new Set([...ACTIVE, ...TENTATIVE])
const EXPERIENCE_RANK = new Map(
  [
    'not_tried',
    'tried_once',
    'some_experience',
    'experienced',
    'very_experienced'
  ].map((id, index) => [id, index])
)

function extractAnswers(profile) {
  if (!profile || typeof profile !== 'object') return {}
  if (
    profile.activities?.answers &&
    typeof profile.activities.answers === 'object'
  )
    return profile.activities.answers
  return {}
}

function effectiveAnswers(profile) {
  const answers = { ...extractAnswers(profile) }
  for (const boundary of profile?.boundaryContext || []) {
    if (boundary.mode !== 'branch') continue
    const exceptions = new Set(boundary.exceptions.map((x) => x.childId))
    for (const id of boundary.members) {
      if (exceptions.has(id)) continue
      answers[id] = {
        ...answers[id],
        stance: 'hard_limit',
        boundaryLabels: [
          ...(answers[id]?.boundaryLabels || []),
          boundary.ownerLabel
        ]
      }
    }
  }
  return answers
}

function stance(answer) {
  return typeof answer?.stance === 'string' ? answer.stance : null
}

function classify(leftAnswer, rightAnswer) {
  const left = stance(leftAnswer)
  const right = stance(rightAnswer)
  if (!left || !right) return 'insufficient_data'

  if (
    (left === 'hard_limit' && INTEREST.has(right)) ||
    (right === 'hard_limit' && INTEREST.has(left))
  )
    return 'hard_limit_conflict'
  if (left === 'hard_limit' || right === 'hard_limit')
    return 'aligned_no_interest'
  if (left === 'soft_limit' || right === 'soft_limit')
    return 'conditional_discussion'
  if (
    (POSITIVE.has(left) && right === 'dont_want') ||
    (POSITIVE.has(right) && left === 'dont_want')
  )
    return 'preference_mismatch'
  if (ACTIVE.has(left) && ACTIVE.has(right)) return 'strong_match'
  if (
    (ACTIVE.has(left) && TENTATIVE.has(right)) ||
    (ACTIVE.has(right) && TENTATIVE.has(left))
  )
    return 'willing_match'
  if (TENTATIVE.has(left) && TENTATIVE.has(right)) return 'mutual_curiosity'
  if (left === 'dont_want' && right === 'dont_want')
    return 'aligned_no_interest'
  return 'insufficient_data'
}

function experienceNote(leftAnswer, rightAnswer) {
  const left = EXPERIENCE_RANK.get(leftAnswer?.experience)
  const right = EXPERIENCE_RANK.get(rightAnswer?.experience)
  if (left === undefined || right === undefined || Math.abs(left - right) < 2)
    return null
  return 'You’re both interested, but one of you has substantially more experience.'
}

export function compareActivityProfiles(
  catalog,
  leftProfile = {},
  rightProfile = {}
) {
  const leftAnswers = effectiveAnswers(leftProfile)
  const rightAnswers = effectiveAnswers(rightProfile)
  const byId = new Map((catalog?.activities || []).map((row) => [row.id, row]))
  const rows = []

  if (!relationshipGraph(catalog).valid)
    return {
      rows: [],
      counts: {},
      hardLimitConflicts: [],
      note: 'The relationship data needs repair.'
    }
  for (const activity of catalog?.activities || []) {
    const counterpartIds = (catalog.relationships || [])
      .filter(
        (e) =>
          e.type === 'complement' &&
          (e.fromId === activity.id || e.toId === activity.id)
      )
      .map((e) => (e.fromId === activity.id ? e.toId : e.fromId))
    if (activity.sameActivityComparison) counterpartIds.push(activity.id)
    for (const counterpartId of new Set(counterpartIds)) {
      const rightActivity = byId.get(counterpartId)
      if (!rightActivity) continue
      const leftAnswer = leftAnswers[activity.id]
      const rightAnswer = rightAnswers[rightActivity.id]
      if (!leftAnswer && !rightAnswer) continue
      const state = classify(leftAnswer, rightAnswer)
      rows.push({
        key: `${activity.id}->${rightActivity.id}`,
        activityId: activity.id,
        partnerActivityId: rightActivity.id,
        label: activity.label,
        partnerLabel: rightActivity.label,
        directional: activity.id !== rightActivity.id,
        leftStance: stance(leftAnswer),
        rightStance: stance(rightAnswer),
        leftBoundaryLabels: leftAnswer?.boundaryLabels || [],
        rightBoundaryLabels: rightAnswer?.boundaryLabels || [],
        leftExperience: leftAnswer?.experience || null,
        rightExperience: rightAnswer?.experience || null,
        state,
        experienceNote:
          POSITIVE.has(stance(leftAnswer)) && POSITIVE.has(stance(rightAnswer))
            ? experienceNote(leftAnswer, rightAnswer)
            : null
      })
    }
  }
  const priority = [
    'hard_limit_conflict',
    'conditional_discussion',
    'preference_mismatch',
    'strong_match',
    'willing_match',
    'mutual_curiosity',
    'aligned_no_interest',
    'insufficient_data'
  ]
  rows.sort(
    (a, b) =>
      priority.indexOf(a.state) - priority.indexOf(b.state) ||
      a.label.localeCompare(b.label)
  )
  const counts = Object.fromEntries(
    priority.map((state) => [
      state,
      rows.filter((row) => row.state === state).length
    ])
  )

  return {
    rows,
    counts,
    hardLimitConflicts: rows.filter(
      (row) => row.state === 'hard_limit_conflict'
    ),
    note: 'This compares Activity Explorer answers and reviewed boundary scopes. Branch Hard limits cover their listed activities except for exact exceptions. Hard limits are shown first, experience differences are just context, and there is no overall compatibility percentage or score.'
  }
}
