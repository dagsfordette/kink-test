import { useState } from 'react'
import {
  reviewBoundaries,
  scopeContext,
  chooseBoundaryScope,
  acknowledgeException,
  removeException,
  removeBoundaryRecord,
  removeUnsupportedExceptions,
  undoBoundaryEdit
} from '../../lib/boundaryReview.js'
import { clearActivityAnswer } from '../../lib/activityProfile.js'

export default function BoundaryReview({ catalog, state, onChange, onEdit }) {
  const [selection, setSelection] = useState(null),
    [error, setError] = useState('')
  const review = reviewBoundaries(catalog, state),
    byId = new Map(catalog.activities.map((a) => [a.id, a]))
  const label = (id) => byId.get(id)?.label || 'Unavailable activity'
  const stance = (id) =>
    catalog.stanceScale.find((s) => s.id === state.answers?.[id]?.stance)
      ?.label || 'Unanswered'
  const owners = [
    ...new Set([
      ...review.scopes.map((s) => s.ownerId),
      ...review.blockers.map((b) => b.ownerId).filter(Boolean)
    ])
  ]
  const run = (fn) => {
    try {
      onChange(fn)
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }
  return (
    <section
      className="boundary-review no-print"
      id="boundary-review"
      aria-label="Boundary review"
    >
      <h2>Boundary review</h2>
      <p role="status">
        {review.allowed
          ? 'Ready for partner sharing.'
          : `${review.blockers.length} review ${review.blockers.length === 1 ? 'item' : 'items'} before partner sharing.`}{' '}
        Private backups remain available.
      </p>
      <p>
        Hard limits can apply to one activity or a named branch. Saved answers
        stay yours; revealing an activity does not settle a boundary.
      </p>
      {owners.length > 0 && (
        <details open={!review.allowed}>
          <summary>Review scope and exact exceptions</summary>
          {owners.map((id) => {
            const scope = review.scopes.find((s) => s.ownerId === id),
              members = scopeContext(catalog, id).members
            const selected = selection?.id === id
            const excluded = [
              ...new Set([
                ...(scope?.boundary.reviewedMembers || []).filter(
                  (x) => !members.includes(x)
                ),
                ...(catalog.relationships || [])
                  .filter(
                    (e) =>
                      e.type !== 'subtype' && (e.fromId === id || e.toId === id)
                  )
                  .map((e) => (e.fromId === id ? e.toId : e.fromId))
              ])
            ].filter((x) => x !== id && !members.includes(x))
            return (
              <article className="boundary-item" key={id}>
                <h3>
                  {label(id)} — {stance(id)}
                </h3>
                <p>
                  {scope?.valid
                    ? scope.boundary.mode === 'local'
                      ? 'Confirmed: this activity only.'
                      : 'Confirmed: this activity and the activities listed below.'
                    : 'A deliberate scope decision is needed.'}
                </p>
                <details>
                  <summary>
                    Activities covered by a branch ({members.length})
                  </summary>
                  <ul>
                    {members.map((child) => (
                      <li key={child}>
                        {label(child)} — {stance(child)}
                      </li>
                    ))}
                  </ul>
                  <p>
                    Only these subtype activities are included. Other
                    activities, opposite perspectives and related activities are
                    excluded.
                  </p>
                </details>
                <details>
                  <summary>
                    Previously covered or linked activities excluded from the
                    current branch ({excluded.length})
                  </summary>
                  <ul>
                    {excluded.map((x) => (
                      <li key={x}>
                        {byId.has(x)
                          ? label(x)
                          : `Activity no longer available (${x})`}
                      </li>
                    ))}
                  </ul>
                </details>
                <div className="boundary-actions">
                  <button
                    type="button"
                    disabled={state.answers?.[id]?.stance !== 'hard_limit'}
                    onClick={() => setSelection({ id, mode: 'local' })}
                  >
                    This activity only
                  </button>
                  <button
                    type="button"
                    disabled={
                      byId.get(id)?.boundaryCapability !== 'subtype_branch' ||
                      state.answers?.[id]?.stance !== 'hard_limit'
                    }
                    onClick={() => setSelection({ id, mode: 'branch' })}
                  >
                    This activity and the activities below
                  </button>
                  <button type="button" onClick={() => onEdit(id)}>
                    Edit parent answer
                  </button>
                  {scope && (
                    <button
                      type="button"
                      onClick={() =>
                        run((s) => removeBoundaryRecord(s, scope.boundary.id))
                      }
                    >
                      Reset this scope decision
                    </button>
                  )}
                  {review.blockers
                    .filter((b) => b.ownerId === id && b.code === 'inactive')
                    .map((b) => (
                      <button
                        type="button"
                        key={b.boundaryId}
                        onClick={() =>
                          run((s) => removeBoundaryRecord(s, b.boundaryId))
                        }
                      >
                        Remove inactive boundary
                      </button>
                    ))}
                </div>
                {selected && (
                  <div className="boundary-confirm">
                    <p>
                      {selection.mode === 'local'
                        ? `Keep the Hard limit on “${label(id)}” only. The activities listed below are excluded from that limit.`
                        : `Apply the Hard limit to “${label(id)}” and each activity listed below. Saved interests will need their own exact exceptions.`}
                    </p>
                    <ul>
                      {members.map((child) => (
                        <li key={child}>
                          {label(child)} — {stance(child)}
                        </li>
                      ))}
                    </ul>
                    {excluded.length > 0 && (
                      <>
                        <p>
                          Excluded from the current branch, including any
                          previously covered items removed by the current
                          catalogue:
                        </p>
                        <ul>
                          {excluded.map((x) => (
                            <li key={x}>
                              {byId.has(x)
                                ? label(x)
                                : `Activity no longer available (${x})`}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        run((s) =>
                          chooseBoundaryScope(catalog, s, id, selection.mode)
                        )
                        setSelection(null)
                      }}
                    >
                      Confirm{' '}
                      {selection.mode === 'local' ? 'activity-only' : 'branch'}{' '}
                      scope
                    </button>
                    <button type="button" onClick={() => setSelection(null)}>
                      Cancel scope change
                    </button>
                  </div>
                )}
                {review.conflicts
                  .filter((c) => c.ownerId === id)
                  .map((c) => (
                    <div className="boundary-conflict" key={c.childId}>
                      <p>
                        <strong>
                          {label(c.childId)} — {stance(c.childId)}
                        </strong>
                      </p>
                      <p>
                        Inside the branch Hard limit “{label(id)}”.{' '}
                        {c.resolved
                          ? 'This exact child has a confirmed exception.'
                          : 'Review this saved interest. Other children and other boundaries need separate decisions.'}
                      </p>
                      <div className="boundary-actions">
                        <button type="button" onClick={() => onEdit(c.childId)}>
                          Edit child answer
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            run((s) => clearActivityAnswer(s, c.childId))
                          }
                        >
                          Clear child answer
                        </button>
                        {c.resolved ? (
                          <button
                            type="button"
                            onClick={() =>
                              run((s) =>
                                removeException(s, c.boundaryId, c.childId)
                              )
                            }
                          >
                            Remove this exception
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={!scope?.valid}
                            onClick={() =>
                              run((s) =>
                                acknowledgeException(
                                  catalog,
                                  s,
                                  c.boundaryId,
                                  c.childId
                                )
                              )
                            }
                          >
                            Keep “{label(c.childId)}” as an exact exception to “
                            {label(id)}”
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </article>
            )
          })}
        </details>
      )}
      {review.blockers
        .filter((b) => !b.ownerId)
        .map((b, i) => (
          <p role="alert" key={i}>
            {b.message}{' '}
            {b.code === 'invalid_exception' ? (
              <button
                type="button"
                onClick={() => run(removeUnsupportedExceptions)}
              >
                Remove unsupported exception records
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  run((s) => removeBoundaryRecord(s, b.boundaryId))
                }
              >
                Remove unsupported boundary record
              </button>
            )}
          </p>
        ))}
      {!!review.notices.length && (
        <details>
          <summary>
            {review.notices.length} nonblocking preference or discussion notices
          </summary>
          <p>
            Uncertainty is never permission. Soft limits need discussion;
            preference differences are not branch boundaries.
          </p>
          {review.notices.map((n, i) => (
            <p key={i}>
              {label(n.ownerId)} / {label(n.childId)}: {n.kind}
            </p>
          ))}
        </details>
      )}
      {state.exploration?.boundaryUndo && (
        <button type="button" onClick={() => run(undoBoundaryEdit)}>
          Undo boundary review change
        </button>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  )
}
