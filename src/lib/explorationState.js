import { normalizeBodyPaint } from './bodyPaint.js'
export const ANATOMY_FEATURES = ['penis', 'vagina']

export function bodyFactsFromSelection(selected) {
  return {
    self: {
      anatomy: Object.fromEntries(ANATOMY_FEATURES.map((id) => [
        id, selected.length ? (selected.includes(id) ? 'present' : 'absent') : 'undisclosed'
      ]))
    }
  }
}
export const ROLE_VALUES = {
  action: [
    'giving',
    'receiving',
    'mutual',
    'observing',
    'being_observed',
    'self_directed'
  ],
  coordination: ['directing', 'following', 'shared'],
  power: ['dominant', 'submissive', 'equal']
}
export function createExploration() {
  return {
    facts: {
      self: { anatomy: {} }
    },
    bodyPaint: {},
    bodyMapModels: { self: 'auto', partner: 'auto' },
    roles: { global: {}, byCategory: {} },
    inferredFilterOverrides: {},
    relevanceOverrides: {},
    manualApplicability: {},
    promptResponses: {},
    topicPreferences: {},
    sessionSize: 10,
    session: null,
    boundaries: [],
    exceptions: []
  }
}
const record = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
export function normalizeExploration(value, catalog) {
  const e = record(value),
    base = createExploration(),
    ids = new Set(catalog.activities.map((a) => a.id)),
    cats = new Set(catalog.categories.map((c) => c.id))
  const validIds = (values) => [
    ...new Set(
      (Array.isArray(values) ? values : []).filter((id) => ids.has(id))
    )
  ]
  const participant = (raw) => ({
    anatomy: Object.fromEntries(
      ANATOMY_FEATURES.map((k) => [k, anatomyState(raw?.anatomy?.[k])])
    )
  })
  const roles = (raw) =>
    Object.fromEntries(
      Object.entries(record(raw))
        .filter(([k]) => ROLE_VALUES[k])
        .map(([k, c]) => [
          k,
          {
            confirmation:
              c?.confirmation === 'confirmed' ? 'confirmed' : 'unconfirmed',
            allowed: [
              ...new Set(
                (Array.isArray(c?.allowed) ? c.allowed : []).filter((v) =>
                  ROLE_VALUES[k].includes(v)
                )
              )
            ],
            inferenceBasisHash:
              typeof c?.inferenceBasisHash === 'string'
                ? c.inferenceBasisHash
                : null
          }
        ])
    )
  const overrides = (raw, allowed) =>
    Object.fromEntries(
      Object.entries(record(raw)).filter(
        ([id, v]) => ids.has(id) && v === allowed
      )
    )
  const session =
    e.session &&
    typeof e.session.id === 'string' &&
    ['active', 'ended'].includes(e.session.status)
      ? {
          id: e.session.id,
          status: e.session.status,
          topicId: catalog.routingPrompts.some(
            (p) => p.id === e.session.topicId
          )
            ? e.session.topicId
            : null,
          categoryId: cats.has(e.session.categoryId)
            ? e.session.categoryId
            : 'all',
          poolIds: validIds(e.session.poolIds),
          target: Math.max(
            1,
            Math.min(50, Math.round(Number(e.session.target) || 10))
          ),
          answeredIds: validIds(e.session.answeredIds).filter((id) =>
            e.session.poolIds?.includes(id)
          ),
          skippedIds: validIds(e.session.skippedIds).filter(
            (id) =>
              e.session.poolIds?.includes(id) &&
              !e.session.answeredIds?.includes(id)
          )
        }
      : null
  return {
    ...base,
    bodyPaint: normalizeBodyPaint(e.bodyPaint),
    bodyMapModels: Object.fromEntries(['self', 'partner'].map((owner) => [owner,
      ['male', 'female'].includes(e.bodyMapModels?.[owner]) ? e.bodyMapModels[owner] : 'auto'
    ])),
    facts: {
      self: participant(e.facts?.self)
    },
    roles: {
      global: roles(e.roles?.global),
      byCategory: Object.fromEntries(
        Object.entries(record(e.roles?.byCategory))
          .filter(([id]) => cats.has(id))
          .map(([id, v]) => [id, roles(v)])
      )
    },
    inferredFilterOverrides: overrides(
      e.inferredFilterOverrides,
      'keep_in_exploration'
    ),
    relevanceOverrides: overrides(e.relevanceOverrides, 'keep_in_exploration'),
    manualApplicability: overrides(e.manualApplicability, 'not_applicable'),
    promptResponses: Object.fromEntries(
      catalog.routingPrompts
        .filter((p) =>
          ['explore', 'skip_for_now', 'not_sure'].includes(
            e.promptResponses?.[p.id]?.response
          )
        )
        .map((p) => {
          const r = e.promptResponses[p.id]
          return [
            p.id,
            {
              response: r.response,
              scopeRevision: r.scopeRevision,
              sessionId: typeof r.sessionId === 'string' ? r.sessionId : null
            }
          ]
        })
    ),
    topicPreferences: Object.fromEntries(Object.entries(record(e.topicPreferences)).filter(([key, v]) => /^(power|[a-z_]+\/[a-z_]+)\/(give|receive|observe|be_observed|overall)$/.test(key) && [-1, 0, 1, 3].includes(v))),
    sessionSize: Math.max(
      1,
      Math.min(50, Math.round(Number(e.sessionSize) || 10))
    ),
    session,
    // Preserve even invalid records; the checked projection decides current scope/exception validity.
    boundaries: Array.isArray(e.boundaries)
      ? e.boundaries
      : e.boundaries === undefined
        ? []
        : [null],
    exceptions: Array.isArray(e.exceptions)
      ? e.exceptions
      : e.exceptions === undefined
        ? []
        : [null],
    boundaryUndo: e.boundaryUndo || null
  }
}
export function participantFacts(facts, participant) {
  if (participant === 'self') return facts?.self || {}
  return {}
}
export function anatomyState(value) {
  return ['present', 'absent'].includes(value) ? value : 'undisclosed'
}
