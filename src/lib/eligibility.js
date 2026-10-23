import {
  INTEREST,
  reviewBoundaries,
  buildShareProjection
} from './boundaryReview.js'
import { relationshipGraph, scopeMembers } from './relationships.js'
import { participantFacts, anatomyState } from './explorationState.js'
import { scoreFantasyProfile } from './fantasyProfile.js'
import {
  reconcileFantasyState,
  activeFantasyAnswers
} from './fantasyRouting.js'
const STANCES = new Set([...INTEREST, 'not_sure', 'dont_want', 'hard_limit'])
function evaluateRequirement(req, facts) {
  if (!req) return 'applies'
  const values = (key) =>
    req[key].map((child) => evaluateRequirement(child, facts))
  if (Array.isArray(req.all) && req.all.length) {
    const v = values('all')
    return v.includes('does_not_apply')
      ? 'does_not_apply'
      : v.every((x) => x === 'applies')
        ? 'applies'
        : 'unknown'
  }
  if (Array.isArray(req.any) && req.any.length) {
    const v = values('any')
    return v.includes('applies')
      ? 'applies'
      : v.every((x) => x === 'does_not_apply')
        ? 'does_not_apply'
        : 'unknown'
  }
  const p = participantFacts(facts, req.participant)
  if (req.anatomy) {
    const v = anatomyState(p.anatomy?.[req.anatomy])
    return v === 'present'
      ? 'applies'
      : v === 'absent'
        ? 'does_not_apply'
        : 'unknown'
  }
  return 'unknown'
}
function rolesCompatible(activity, roles = {}) {
  const choices = {
    ...roles.global,
    ...roles.byCategory?.[activity.categoryId]
  }
  return (
    !(activity.roleConfigurations || []).length ||
    activity.roleConfigurations.some((config) =>
      Object.entries(config).every(([dimension, allowed]) => {
        const choice = choices[dimension]
        return (
          choice?.confirmation !== 'confirmed' ||
          !choice.allowed?.length ||
          allowed.some(
            (value) =>
              Array.isArray(choice.allowed) && choice.allowed.includes(value)
          )
        )
      })
    )
  )
}
export function fantasyEvidence(profile, fantasy) {
  const state = reconcileFantasyState(profile, fantasy)
  const answers = activeFantasyAnswers(state),
    metrics = scoreFantasyProfile(profile, answers)
  const scores = new Map(profile.responseScale.map((x) => [x.id, x.score])),
    byKey = {}
  for (const q of profile.questions) {
    const answer = answers[q.id],
      score = scores.get(answer)
    if (!(score < 0)) continue
    for (const signal of q.signals || []) {
      if (!(Number(signal.weight ?? 1) > 0)) continue
      const key = `${signal.dimensionId}/${signal.perspective}`
      const row = (byKey[key] ||= {
        ids: new Set(),
        groups: new Set(),
        core: false
      })
      row.ids.add(q.id)
      row.groups.add(q.mirrorGroup || q.id)
      if (q.stage === 'core') row.core = true
    }
  }
  const qualified = {},
    positive = {}
  for (const [dimension, row] of Object.entries(metrics))
    for (const [perspective, metric] of Object.entries(row.perspectives)) {
      const key = `${dimension}/${perspective}`,
        evidence = byKey[key]
      positive[key] = metric.positiveEvidence > 0
      if (
        metric.band === 'negative' &&
        metric.positiveEvidence === 0 &&
        evidence?.ids.size >= 3 &&
        evidence.groups.size >= 2 &&
        evidence.core
      )
        qualified[key] = [...evidence.ids]
    }
  return { qualified, positive, metrics, answers }
}
function fantasyExclusion(activity, evidence) {
  const links = (activity.fantasyConnections || []).filter(
    (x) =>
      x.specificity === 'direct' &&
      x.essential &&
      x.coverage === 'whole_activity'
  )
  if (
    (activity.fantasyConnections || []).some(
      (x) =>
        x.specificity === 'direct' &&
        x.essential &&
        evidence?.positive[`${x.dimensionId}/${x.perspective}`]
    )
  )
    return []
  return links.flatMap(
    (x) => evidence?.qualified[`${x.dimensionId}/${x.perspective}`] || []
  )
}
export function roleSuggestions(catalog, evidence) {
  const choices = {},
    basis = []
  for (const rule of catalog.roleSuggestionRules || []) {
    const [dim, perspective] = rule.evidenceKey.split('/'),
      metric = evidence?.metrics[dim]?.perspectives[perspective]
    // Conservative suggestion threshold, not a change to scoring or negative policy.
    if (
      metric?.positiveEvidence > 0 &&
      metric.negativeEvidence === 0 &&
      metric.observations >= 3 &&
      ['strong', 'notable'].includes(metric.band)
    ) {
      for (const [dimension, values] of Object.entries(
        rule.candidateSuggestion
      ))
        choices[dimension] = [
          ...new Set([...(choices[dimension] || []), ...values])
        ]
      basis.push({
        rule: rule.id,
        answers: Object.fromEntries(
          rule.sourceQuestionIds
            .filter((id) => Object.hasOwn(evidence.answers, id))
            .map((id) => [id, evidence.answers[id]])
        )
      })
    }
  }
  // Stable private comparison token (not a security signature).
  return {
    choices,
    basisHash: JSON.stringify(basis),
    explanations: (catalog.roleSuggestionRules || [])
      .filter((r) => basis.some((b) => b.rule === r.id))
      .map((r) => r.rationale)
  }
}
function boundaryCoverage(catalog, exploration, answers) {
  const review = reviewBoundaries(catalog, { answers, exploration }),
    covered = new Map()
  for (const [id, rows] of review.coverage)
    covered.set(
      id,
      rows.map((b) => ({
        source: b.id,
        kind: 'ancestor_hard_limit',
        resolved: review.conflicts.some(
          (c) => c.childId === id && c.boundaryId === b.id && c.resolved
        )
      }))
    )
  return covered
}

export function createEligibilityContext(catalog, state, evidence = null) {
  return {
    catalog,
    state,
    evidence,
    graph: relationshipGraph(catalog),
    coverage: boundaryCoverage(catalog, state.exploration, state.answers || {})
  }
}
export function evaluateActivity(
  activity,
  context,
  { reveal = false, ignoreNavigation = false, ignoreSession = false } = {}
) {
  const { catalog, state, evidence, graph, coverage } = context,
    e = state.exploration || {},
    nav = state.navigation || {},
    id = activity.id
  const hasSavedAnswer = STANCES.has(state.answers?.[id]?.stance),
    explicitInterest = INTEREST.has(state.answers?.[id]?.stance)
  const reasons = [],
    reviewItems = []
  const add = (code, message, sourceIds = [], suppresses = true) =>
    reasons.push({
      code,
      sourceIds,
      messageKey: code,
      message,
      bypassed: false,
      suppresses
    })
  if (!graph.valid)
    add('catalog_invalid', 'The relationship data needs repair.', [], true)
  const fit = evaluateRequirement(activity.applicability, e.facts)
  if (fit === 'does_not_apply')
    add(
      'applicability_false',
      'The explicit body facts do not fit this activity.'
    )
  if (fit === 'unknown')
    add(
      'applicability_unknown',
      'Body or participant fit is unknown; this stays available.',
      [],
      false
    )
  if (e.manualApplicability?.[id] === 'not_applicable')
    add(
      'manual_not_applicable',
      'You marked this as not applicable in the current context.'
    )
  if (hasSavedAnswer)
    add('already_answered', 'Your answer is saved. Open Review to edit it.')
  for (const row of coverage.get(id) || []) {
    add(
      row.kind,
      row.resolved
        ? 'This saved answer has an exact exception to this covering Hard limit.'
        : 'A covering hard limit needs scope review.',
      [row.source],
      !row.resolved
    )
    if (explicitInterest && !row.resolved)
      reviewItems.push({
        code: row.kind,
        activityId: id,
        boundaryId: row.source,
        severity: 'blocking',
        resolution: 'unresolved'
      })
  }
  const override = e.inferredFilterOverrides?.[id] === 'keep_in_exploration'
  if (!rolesCompatible(activity, e.roles))
    add(
      'role_excluded',
      'Outside your confirmed role preferences.',
      [],
      !override && !hasSavedAnswer
    )
  const negatives = fantasyExclusion(activity, evidence)
  if (negatives.length)
    add(
      'fantasy_negative',
      'Several active fantasy answers disliked this exact theme and perspective.',
      negatives,
      !override && !hasSavedAnswer
    )
  for (const rule of catalog.relevanceRules || [])
    if (
      rule.activityIds.includes(id) &&
      anatomyState(
        participantFacts(e.facts, rule.participant).anatomy?.penis
      ) === 'absent'
    ) {
      add(
        'inferred_lower_relevance',
        rule.explanation,
        [rule.id],
        !explicitInterest &&
          e.relevanceOverrides?.[id] !== 'keep_in_exploration' &&
          Boolean(e.session && e.session.status !== 'idle')
      )
      reasons.at(-1).basis = {
        participant: rule.participant,
        anatomy: 'penis',
        state: 'absent',
        ruleRevision: rule.ruleRevision,
        policyVersion: catalog.runtimePolicy?.relevancePolicyVersion,
        partnerContextId:
          rule.participant === 'partner'
            ? e.facts.selectedPartnerContextId
            : null
      }
    }
  if (!ignoreNavigation) {
    if ((nav.hiddenActivityIds || []).includes(id))
      add('activity_skipped', 'Hidden for now in exploration.')
    for (const prompt of catalog.routingPrompts || []) {
      const choice = e.promptResponses?.[prompt.id]
      if (
        choice?.response === 'skip_for_now' &&
        choice.scopeRevision === prompt.scopeRevision &&
        choice.sessionId === (e.session?.id || null) &&
        scopeMembers(catalog, prompt.scope).includes(id) &&
        nav.bypassPromptDeferral !== true
      )
        add('parent_deferred', 'This topic is deferred for this session.', [
          prompt.id
        ])
    }
  }
  if (
    !ignoreSession &&
    e.session?.status === 'active' &&
    e.session.skippedIds?.includes(id)
  )
    add('activity_skipped', 'Skipped in this short session.', [e.session.id])
  if (
    !ignoreSession &&
    e.session?.status === 'active' &&
    !e.session.poolIds.includes(id)
  )
    add('outside_session', 'Outside this short session.')
  if (
    hasSavedAnswer &&
    (fit === 'does_not_apply' || !rolesCompatible(activity, e.roles))
  )
    reviewItems.push({
      code:
        fit === 'does_not_apply'
          ? 'applicability_answer_mismatch'
          : 'role_answer_mismatch',
      activityId: id,
      severity: 'advisory',
      resolution: 'unresolved'
    })
  for (const reason of reasons)
    reason.bypassed = Boolean(
      reveal && reason.suppresses && reason.code !== 'catalog_invalid'
    )
  return {
    activityId: id,
    applicability: fit,
    hasSavedAnswer,
    queueVisible: !reasons.some((r) => r.suppresses && !r.bypassed),
    reasons,
    reviewItems,
    shareState:
      !graph.valid || reviewItems.some((r) => r.severity === 'blocking')
        ? 'blocked'
        : 'allowed'
  }
}
export function partnerShareStatus(catalog, state) {
  const result = buildShareProjection(catalog, state)
  return {
    allowed: result.allowed,
    conflicts: result.blockers,
    message:
      'Review boundary scope and saved interests before sharing. Private backups remain available.'
  }
}
