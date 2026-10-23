import { normalizePlayPreferences } from './playPreferences.js'
import { relationshipGraph, traverse } from './relationships.js'

export const INTEREST = new Set([
  'love',
  'want',
  'curious',
  'if_partner_wants',
  'soft_limit'
])
// Complete canonical dependency tuples: deterministic and collision-free, kept private.
export function canonical(v) {
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`
  if (v && typeof v === 'object')
    return `{${Object.keys(v)
      .filter((k) => v[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`)
      .join(',')}}`
  return JSON.stringify(v)
}
export const newIdentity = () => globalThis.crypto.randomUUID?.() ||
  [...globalThis.crypto.getRandomValues(new Uint32Array(4))].map((n) => n.toString(16).padStart(8, '0')).join('')
export const answerMeaning = (a) =>
  canonical({
    stance: a?.stance,
    experience: a?.experience,
    details: a?.details || {},
    note: a?.note || ''
  })
const meaning = (a) => ({
  id: a.id,
  label: a.label,
  description: a.description,
  scopeRevision: a.scopeRevision,
  boundaryCapability: a.boundaryCapability,
  applicability: a.applicability,
  roleConfigurations: a.roleConfigurations
})
export function scopeContext(catalog, id) {
  const g = relationshipGraph(catalog),
    byId = new Map(catalog.activities.map((a) => [a.id, a]))
  if (!g.valid || !byId.has(id))
    throw new Error('Activity scope is unavailable. Review the catalogue.')
  const members = traverse(g, id).sort(),
    ids = new Set([id, ...members])
  const edges = (catalog.relationships || [])
    .filter((e) => e.type === 'subtype' && ids.has(e.fromId) && ids.has(e.toId))
    .sort((a, b) => a.id.localeCompare(b.id))
  return {
    members,
    signature: canonical({
      owner: meaning(byId.get(id)),
      definition: { root: id, includeDescendants: true },
      members: members.map((x) => meaning(byId.get(x))),
      edges
    })
  }
}
function pairContext(catalog, b, child) {
  const g = relationshipGraph(catalog),
    descendants = new Set([b.owner.id, ...traverse(g, b.owner.id)]),
    ancestors = new Set([child, ...traverse(g, child, 'parents')])
  const ids = new Set([...descendants].filter((x) => ancestors.has(x)))
  return canonical({
    boundaryId: b.id,
    revision: b.revision,
    mode: b.mode,
    owner: meaning(catalog.activities.find((a) => a.id === b.owner.id)),
    child: meaning(catalog.activities.find((a) => a.id === child)),
    edges: (catalog.relationships || [])
      .filter(
        (e) => e.type === 'subtype' && ids.has(e.fromId) && ids.has(e.toId)
      )
      .sort((a, b) => a.id.localeCompare(b.id))
  })
}
function exceptionTuple(catalog, state, b, child) {
  return canonical({
    pair: pairContext(catalog, b, child),
    answer: state.answers[child]
  })
}
export function reviewBoundaries(catalog, state) {
  const blockers = [],
    conflicts = [],
    scopes = [],
    coverage = new Map(),
    notices = []
  const g = relationshipGraph(catalog),
    e = state.exploration || {},
    records = e.boundaries || [],
    byId = new Map(catalog.activities.map((a) => [a.id, a]))
  if (!g.valid)
    return {
      allowed: false,
      blockers: [
        { code: 'catalog', message: 'The activity catalogue needs repair.' }
      ],
      conflicts,
      scopes,
      coverage,
      notices
    }
  if (!Array.isArray(records) || !Array.isArray(e.exceptions || []))
    return {
      allowed: false,
      blockers: [
        { code: 'invalid', message: 'Boundary data needs repair or removal.' }
      ],
      conflicts,
      scopes,
      coverage,
      notices
    }
  for (const x of e.exceptions || [])
    if (
      !x ||
      typeof x.boundaryId !== 'string' ||
      typeof x.childId !== 'string' ||
      typeof x.tuple !== 'string'
    )
      blockers.push({
        code: 'invalid_exception',
        message:
          'An unsupported exception record needs removal. It grants no permission.'
      })
  const seen = new Set(),
    owners = new Set()
  for (const b of records) {
    const owner = b?.owner?.id
    if (
      !b ||
      typeof b.id !== 'string' ||
      seen.has(b.id) ||
      b.owner?.kind !== 'activity' ||
      !byId.has(owner) ||
      owners.has(owner) ||
      !['local', 'branch'].includes(b.mode) ||
      !Number.isInteger(b.revision) ||
      b.revision < 1 ||
      typeof b.ownerAnswer !== 'string' ||
      typeof b.scopeSignature !== 'string' ||
      !Array.isArray(b.reviewedMembers) ||
      b.reviewedMembers.some((x) => typeof x !== 'string') ||
      (b.mode === 'branch' &&
        byId.get(owner)?.boundaryCapability !== 'subtype_branch')
    ) {
      blockers.push({
        code: 'invalid',
        boundaryId: b?.id,
        message:
          'An unsupported boundary record needs removal and a new scope decision.'
      })
      continue
    }
    seen.add(b.id)
    owners.add(owner)
    const a = state.answers?.[owner]
    if (a?.stance !== 'hard_limit') {
      blockers.push({
        code: 'inactive',
        boundaryId: b.id,
        ownerId: owner,
        message:
          'This boundary no longer has its saved Hard limit. Review or remove it.'
      })
      continue
    }
    const scope = scopeContext(catalog, owner)
    const valid =
      b.ownerAnswer === canonical(a) &&
      b.scopeSignature === scope.signature &&
      canonical(b.reviewedMembers) === canonical(scope.members)
    scopes.push({ boundary: b, ownerId: owner, members: scope.members, valid })
    if (!valid)
      blockers.push({
        code: 'scope',
        ownerId: owner,
        boundaryId: b.id,
        message:
          'The saved answer or covered activities changed. Confirm the scope again.'
      })
    if (b.mode === 'branch') {
      // Until re-reviewed, retain formerly reviewed coverage as well as the live closure.
      for (const child of new Set([
        ...scope.members,
        ...(Array.isArray(b.reviewedMembers)
          ? b.reviewedMembers.filter((x) => byId.has(x))
          : [])
      ])) {
        const rows = coverage.get(child) || []
        rows.push(b)
        coverage.set(child, rows)
        if (INTEREST.has(state.answers?.[child]?.stance)) {
          const tuple = scope.members.includes(child)
            ? exceptionTuple(catalog, state, b, child)
            : null
          const resolved =
            valid &&
            tuple &&
            (e.exceptions || []).some(
              (x) =>
                x?.boundaryId === b.id &&
                x.childId === child &&
                x.tuple === tuple
            )
          const row = {
            code: 'conflict',
            boundaryId: b.id,
            ownerId: owner,
            childId: child,
            resolved: Boolean(resolved),
            message: 'A saved interest is inside this branch Hard limit.'
          }
          conflicts.push(row)
          if (!resolved) blockers.push(row)
        }
      }
    }
  }
  for (const [id, a] of Object.entries(state.answers || {}))
    if (
      a?.stance === 'hard_limit' &&
      byId.has(id) &&
      traverse(g, id).length &&
      !owners.has(id)
    )
      blockers.push({
        code: 'scope',
        ownerId: id,
        message:
          'Choose whether this Hard limit covers this activity only or the activities below it.'
      })
  for (const [parent, answer] of Object.entries(state.answers || {}))
    if (byId.has(parent))
      for (const child of traverse(g, parent)) {
        const p = answer?.stance,
          c = state.answers?.[child]?.stance
        if (c === 'not_sure')
          notices.push({ ownerId: parent, childId: child, kind: 'uncertainty' })
        else if (
          INTEREST.has(c) &&
          ['dont_want', 'soft_limit', 'not_sure'].includes(p)
        )
          notices.push({
            ownerId: parent,
            childId: child,
            kind: p === 'soft_limit' ? 'discussion' : 'preference'
          })
      }
  return {
    allowed: !blockers.length,
    blockers,
    conflicts,
    scopes,
    coverage,
    notices
  }
}
function editRecords(state, updater) {
  const e = state.exploration || {},
    before = { boundaries: e.boundaries || [], exceptions: e.exceptions || [] }
  return {
    ...state,
    exploration: { ...e, ...updater(before), boundaryUndo: before }
  }
}
export function chooseBoundaryScope(catalog, state, ownerId, mode) {
  if (
    !['local', 'branch'].includes(mode) ||
    state.answers?.[ownerId]?.stance !== 'hard_limit'
  )
    throw new Error('Save a Hard limit before choosing its scope.')
  if (
    mode === 'branch' &&
    catalog.activities.find((a) => a.id === ownerId)?.boundaryCapability !==
      'subtype_branch'
  )
    throw new Error('This activity has no reviewed subtype branch.')
  const scope = scopeContext(catalog, ownerId)
  return editRecords(state, (r) => {
    const previous = r.boundaries.find((b) => b?.owner?.id === ownerId)
    const old =
      typeof previous?.id === 'string' &&
      Number.isInteger(previous.revision) &&
      previous.revision > 0
        ? previous
        : null
    const next = {
      id: old?.id || newIdentity(),
      revision: (old?.revision || 0) + 1,
      owner: { kind: 'activity', id: ownerId },
      mode,
      ownerAnswer: canonical(state.answers[ownerId]),
      scopeSignature: scope.signature,
      reviewedMembers: scope.members
    }
    if (
      old &&
      canonical({ ...next, revision: old.revision }) === canonical(old)
    )
      return r
    return {
      ...r,
      boundaries: [
        ...r.boundaries.filter((b) => b?.owner?.id !== ownerId),
        next
      ]
    }
  })
}
export function acknowledgeException(catalog, state, boundaryId, childId) {
  const review = reviewBoundaries(catalog, state),
    scope = review.scopes.find((s) => s.boundary.id === boundaryId)
  if (
    !scope?.valid ||
    !review.conflicts.some(
      (c) => c.boundaryId === boundaryId && c.childId === childId
    )
  )
    throw new Error('Confirm the current boundary scope first.')
  return editRecords(state, (r) => ({
    ...r,
    exceptions: [
      ...r.exceptions.filter(
        (x) => !(x.boundaryId === boundaryId && x.childId === childId)
      ),
      {
        boundaryId,
        childId,
        tuple: exceptionTuple(catalog, state, scope.boundary, childId)
      }
    ]
  }))
}
export function removeBoundaryRecord(state, id) {
  return editRecords(state, (r) => ({
    ...r,
    boundaries: r.boundaries.filter((b) => b?.id !== id),
    exceptions: r.exceptions.filter((x) => x?.boundaryId !== id)
  }))
}
export function removeException(state, boundaryId, childId) {
  return editRecords(state, (r) => ({
    ...r,
    exceptions: r.exceptions.filter(
      (x) => !(x.boundaryId === boundaryId && x.childId === childId)
    )
  }))
}
export function removeUnsupportedExceptions(state) {
  return editRecords(state, (r) => ({
    ...r,
    exceptions: r.exceptions.filter(
      (x) =>
        x &&
        typeof x.boundaryId === 'string' &&
        typeof x.childId === 'string' &&
        typeof x.tuple === 'string'
    )
  }))
}
export function undoBoundaryEdit(state) {
  const e = state.exploration
  return e?.boundaryUndo
    ? { ...state, exploration: { ...e, ...e.boundaryUndo, boundaryUndo: null } }
    : state
}
export function buildShareProjection(catalog, state, options = {}) {
  const review = reviewBoundaries(catalog, state)
  if (!review.allowed)
    return { allowed: false, blockers: review.blockers, payload: null }
  const ids = new Set(catalog.activities.map((a) => a.id)),
    stances = new Set(catalog.stanceScale.map((s) => s.id)),
    exp = new Set(catalog.experienceScale.map((s) => s.id))
  const answers = {}
  for (const [id, a] of Object.entries(state.answers || {})) {
    if (
      !ids.has(id) ||
      !stances.has(a?.stance) ||
      (a.experience && !exp.has(a.experience))
    )
      return {
        allowed: false,
        blockers: [
          { code: 'answer', message: 'An activity answer needs repair.' }
        ],
        payload: null
      }
    answers[id] = {
      stance: a.stance,
      ...(a.experience ? { experience: a.experience } : {})
    }
  }
  const label = (id) => catalog.activities.find((a) => a.id === id).label
  const boundaryContext = review.scopes.map((s) => ({
    ownerId: s.ownerId,
    ownerLabel: label(s.ownerId),
    mode: s.boundary.mode,
    members: s.boundary.mode === 'branch' ? s.members : [],
    exceptions: review.conflicts
      .filter((c) => c.boundaryId === s.boundary.id && c.resolved)
      .map((c) => ({ childId: c.childId, childLabel: label(c.childId) }))
  }))
  return {
    allowed: true,
    blockers: [],
    payload: {
      shareVersion: 2,
      catalog: {
        id: catalog.questionnaire.id,
        version: catalog.questionnaire.version
      },
      activities: { answers },
      boundaryContext,
      ...(options.includePlayPreferences === true
        ? { playPreferences: normalizePlayPreferences(options.playPreferences) }
        : {})
    }
  }
}
export function validatePublicContext(value, catalog) {
  if (value.shareVersion !== 2 || !Array.isArray(value.boundaryContext))
    throw new Error('Ask for a current reviewed partner export.')
  const state = {
      answers: value.activities.answers,
      exploration: { boundaries: [], exceptions: [] }
    },
    seen = new Set()
  for (const c of value.boundaryContext) {
    const a = catalog.activities.find((a) => a.id === c?.ownerId)
    if (
      !a ||
      a.label !== c.ownerLabel ||
      seen.has(c.ownerId) ||
      state.answers[c.ownerId]?.stance !== 'hard_limit' ||
      !['local', 'branch'].includes(c.mode) ||
      !Array.isArray(c.members) ||
      !Array.isArray(c.exceptions)
    )
      throw new Error('Invalid boundary context.')
    seen.add(c.ownerId)
    const scope = scopeContext(catalog, c.ownerId)
    if (
      canonical([...c.members].sort()) !==
        canonical(c.mode === 'branch' ? scope.members : []) ||
      (c.mode === 'local' && c.exceptions.length)
    )
      throw new Error('Invalid covered activities.')
    let next = chooseBoundaryScope(catalog, state, c.ownerId, c.mode)
    state.exploration = next.exploration
    const childIds = new Set()
    for (const x of c.exceptions) {
      if (
        childIds.has(x.childId) ||
        catalog.activities.find((a) => a.id === x.childId)?.label !==
          x.childLabel ||
        !scope.members.includes(x.childId) ||
        !INTEREST.has(state.answers[x.childId]?.stance)
      )
        throw new Error('Invalid exact exception.')
      childIds.add(x.childId)
      next = acknowledgeException(
        catalog,
        state,
        state.exploration.boundaries.at(-1).id,
        x.childId
      )
      state.exploration = next.exploration
    }
  }
  if (!buildShareProjection(catalog, state).allowed)
    throw new Error(
      'This partner file contains unresolved boundary context. Request a new export.'
    )
  return value.boundaryContext.map((c) => ({
    ownerId: c.ownerId,
    ownerLabel: c.ownerLabel,
    mode: c.mode,
    members: [...c.members],
    exceptions: c.exceptions.map((x) => ({
      childId: x.childId,
      childLabel: x.childLabel
    }))
  }))
}
