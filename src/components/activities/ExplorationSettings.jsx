import { useState } from 'react'
import { ANATOMY_FEATURES, ROLE_VALUES } from '../../lib/explorationState.js'
export function BodyFacts({ facts, onChange }) {
  const selected = facts.selectedPartnerContextId,
    target = selected ? facts.partnerContexts[selected] : { anatomy: {} }
  const [participant, setParticipant] = useState('self')
  const actual = participant === 'partner' ? target : facts.self
  const update = (feature, value) => {
    if (participant === 'partner' && !selected) return
    const next = {
      ...actual,
      anatomy: { ...actual?.anatomy, [feature]: value }
    }
    onChange(
      participant === 'self'
        ? { ...facts, self: next }
        : {
            ...facts,
            partnerContexts: { ...facts.partnerContexts, [selected]: next }
          }
    )
  }
  return (
    <div className="exploration-controls">
      <p>
        Optional body facts. Undisclosed stays available. Attraction preferences
        never supply these facts.
      </p>
      <label>
        Whose facts?{' '}
        <select
          value={participant}
          onChange={(e) => setParticipant(e.target.value)}
        >
          <option value="self">My body</option>
          <option value="partner">Selected partner context</option>
        </select>
      </label>
      {participant === 'partner' && (
        <div>
          <label>
            Partner context{' '}
            <select
              value={selected || ''}
              onChange={(e) =>
                onChange({
                  ...facts,
                  selectedPartnerContextId: e.target.value || null
                })
              }
            >
              <option value="">No selected partner</option>
              {Object.keys(facts.partnerContexts || {}).map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => {
              const id = `Partner ${Object.keys(facts.partnerContexts || {}).length + 1}`
              onChange({
                ...facts,
                partnerContexts: {
                  ...facts.partnerContexts,
                  [id]: { anatomy: {} }
                },
                selectedPartnerContextId: id
              })
            }}
          >
            Add partner context
          </button>
        </div>
      )}
      <div className="body-fact-grid">
        {ANATOMY_FEATURES.map((feature) => (
          <label key={feature}>
            <span>{feature[0].toUpperCase() + feature.slice(1)}</span>
            <select
              aria-label={`${participant} ${feature}`}
              disabled={participant === 'partner' && !selected}
              value={
                ['present', 'absent'].includes(actual?.anatomy?.[feature])
                  ? actual.anatomy[feature]
                  : 'undisclosed'
              }
              onChange={(e) => update(feature, e.target.value)}
            >
              <option value="undisclosed">Undisclosed</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </label>
        ))}
      </div>
      <button
        type="button"
        className="text-button"
        onClick={() => {
          if (participant === 'partner' && !selected) return
          const next = { ...actual, anatomy: {} }
          onChange(
            participant === 'self'
              ? { ...facts, self: next }
              : {
                  ...facts,
                  partnerContexts: {
                    ...facts.partnerContexts,
                    [selected]: next
                  }
                }
          )
        }}
      >
        Reset these body facts
      </button>
    </div>
  )
}
export default function ExplorationSettings({
  catalog,
  exploration,
  suggestions,
  onChange
}) {
  const [scope, setScope] = useState('global')
  const roles = exploration.roles,
    choices = scope === 'global' ? roles.global : roles.byCategory[scope] || {}
  const update = (dimension, choice) =>
    onChange({
      ...exploration,
      roles:
        scope === 'global'
          ? { ...roles, global: { ...roles.global, [dimension]: choice } }
          : {
              ...roles,
              byCategory: {
                ...roles.byCategory,
                [scope]: { ...choices, [dimension]: choice }
              }
            }
    })
  return (
    <details className="exploration-settings no-print">
      <summary>Body facts &amp; role preferences · optional</summary>
      <BodyFacts
        facts={exploration.facts}
        onChange={(facts) => onChange({ ...exploration, facts })}
      />
      <h2>Roles you want to explore</h2>
      <p>
        Each dimension is independent. Choices filter only after confirmation.
        Select several for mixed roles, or leave uncertain.
      </p>
      {suggestions.explanations.map((text) => (
        <p key={text}>{text}</p>
      ))}
      {!suggestions.explanations.length && (
        <p>
          There is not enough clear active fantasy evidence to suggest roles.
          You can choose your own.
        </p>
      )}
      {Object.values(roles.global).some(
        (c) =>
          c?.confirmation === 'confirmed' &&
          c.inferenceBasisHash !== suggestions.basisHash
      ) && (
        <p role="status">
          Your fantasy evidence has changed. Your confirmed settings are kept
          until you edit or reset them.
        </p>
      )}
      <label>
        Apply to{' '}
        <select value={scope} onChange={(e) => setScope(e.target.value)}>
          <option value="global">All categories</option>
          {catalog.categories.map((c) => (
            <option value={c.id} key={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      {Object.entries(ROLE_VALUES).map(([dimension, values]) => {
        const choice = choices[dimension] || {
          confirmation: 'unconfirmed',
          allowed: [],
          inferenceBasisHash: null
        }
        return (
          <fieldset key={`${scope}-${dimension}`}>
            <legend>
              {
                {
                  action: 'Physical action',
                  coordination: 'Control and coordination',
                  power: 'Power role'
                }[dimension]
              }{' '}
              ·{' '}
              {choice.confirmation === 'confirmed'
                ? 'confirmed'
                : 'uncertain / unrestricted'}
            </legend>
            {suggestions.choices[dimension]?.length > 0 && (
              <p>
                Suggested:{' '}
                {suggestions.choices[dimension].join(', ').replaceAll('_', ' ')}
              </p>
            )}
            <div className="activity-detail-chips">
              {values.map((v) => (
                <label className="chip" key={v}>
                  <input
                    type="checkbox"
                    checked={choice.allowed.includes(v)}
                    onChange={() =>
                      update(dimension, {
                        ...choice,
                        confirmation: 'unconfirmed',
                        allowed: choice.allowed.includes(v)
                          ? choice.allowed.filter((x) => x !== v)
                          : [...choice.allowed, v]
                      })
                    }
                  />
                  {v.replaceAll('_', ' ')}
                </label>
              ))}
            </div>
            <p>
              {
                {
                  action:
                    'Giving, receiving and watching describe the activity itself.',
                  coordination:
                    'Directing, following or sharing describes who guides what happens.',
                  power:
                    'Dominant, submissive or equal describes the power dynamic. Giving does not mean dominant.'
                }[dimension]
              }
            </p>
            <button
              type="button"
              disabled={!choice.allowed.length}
              onClick={() =>
                update(dimension, {
                  ...choice,
                  confirmation: 'confirmed',
                  inferenceBasisHash: suggestions.basisHash
                })
              }
            >
              Confirm {dimension}
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() =>
                update(dimension, {
                  confirmation: 'unconfirmed',
                  allowed: [],
                  inferenceBasisHash: null
                })
              }
            >
              Uncertain / reset
            </button>
            {scope !== 'global' && (
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  const next = { ...choices }
                  delete next[dimension]
                  onChange({
                    ...exploration,
                    roles: {
                      ...roles,
                      byCategory: { ...roles.byCategory, [scope]: next }
                    }
                  })
                }}
              >
                Use global setting
              </button>
            )}
          </fieldset>
        )
      })}
      {scope !== 'global' && (
        <small>
          A category setting replaces only that dimension. Other dimensions
          inherit your global choices.
        </small>
      )}
    </details>
  )
}
