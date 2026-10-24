import { detailFieldsForActivity } from '../../lib/activityProfile.js'
import { useEffect, useState } from 'react'
import ActivityDetails from './ActivityDetails.jsx'
import ActivityExamples from './ActivityExamples.jsx'

function usefulDescription(description = '') {
  if (
    /^A consensual adult activity or negotiated dynamic involving .+ with context, boundaries, and conditions fine-tuned separately where useful\.$/i.test(
      description
    )
  )
    return ''
  if (
    /^Using .+ as a deliberate clothing, material, texture, or aesthetic focus in consensual adult play\.$/i.test(
      description
    )
  )
    return ''
  if (
    /^A real-world setting or context for consensual adult sexual or kink activity:/i.test(
      description
    )
  )
    return ''
  if (
    /^A negotiated ongoing adult relationship structure or dynamic involving /i.test(
      description
    )
  )
    return ''
  return description
}

export default function ActivityCard({
  catalog,
  activity,
  answer,
  focused,
  onStance,
  onExperience,
  onDetails,
  onNote,
  onClear,
  guided = false,
  sharedPreferences = {},
  onRemember
}) {
  const [expanded, setExpanded] = useState(
    Boolean(focused || answer?.stance === 'soft_limit' || (activity.learning && answer?.stance && !['dont_want','hard_limit'].includes(answer.stance)))
  )
  const description = usefulDescription(activity.description)
  useEffect(() => {
    if (focused) setExpanded(true)
  }, [focused])
  useEffect(() => {
    if (answer?.stance === 'soft_limit' || (activity.learning && answer?.stance && !['dont_want', 'hard_limit'].includes(answer.stance))) setExpanded(true)
    else if (activity.learning && !focused) setExpanded(false)
  }, [answer?.stance, activity.learning, focused])

  const experienceControl = (<fieldset className="activity-experience-control">
          <legend>Have you tried it?</legend>
          <div className="activity-detail-chips">
            {catalog.experienceScale.map((row) => (
              <button type="button" key={row.id} disabled={!answer?.stance}
                aria-pressed={answer?.experience === row.id}
                className={`chip ${answer?.experience === row.id ? 'selected' : ''}`}
                onClick={() => onExperience(answer?.experience === row.id ? '' : row.id)}>{row.label}</button>
            ))}
          </div>
        </fieldset>)

  return (
    <article
      id={`activity-${activity.id}`}
      className={`activity-card ${answer?.stance === 'hard_limit' ? 'activity-card-hard-limit' : ''} ${focused ? 'activity-card-focused' : ''}`}
    >
      <header className="activity-card-header">
        <div>
          {answer?.stance && (
            <div className="activity-card-meta">
              {answer?.stance && (
                <span>Saved</span>
              )}
            </div>
          )}
          <h3 tabIndex={-1}>{activity.label}</h3>
          {description && <p>{description}</p>}
        </div>

      </header>

      <ActivityExamples key={activity.id} activityId={activity.id} />

      {guided && <ActivityVariations catalog={catalog} activity={activity} />}

      <div
        className="activity-stance-grid"
        aria-label={`Stance for ${activity.label}`}
      >
        {catalog.stanceScale.map((row) => (
          <button
            type="button"
            key={row.id}
            title={row.meaning}
            aria-pressed={answer?.stance === row.id}
            className={`activity-stance stance-${row.id} ${answer?.stance === row.id ? 'selected' : ''}`}
            onClick={() => onStance(row.id)}
          >
            <span>{row.label}</span>
          </button>
        ))}
      </div>

      {expanded && answer?.stance && (
        <ActivityDetails
          catalog={catalog}
          activity={activity}
          answer={answer}
          onDetails={onDetails}
          onNote={onNote}
          guided={guided}
          sharedPreferences={sharedPreferences}
          onRemember={onRemember}
        />
      )}

      <div className="activity-secondary-controls">
        {(!guided || answer?.stance) && (activity.learning ? <details className="guided-experience"><summary>Experience</summary>{experienceControl}</details> : experienceControl)}

        <div className="activity-card-actions no-print">
          {answer?.stance && answer.stance !== 'hard_limit' && (
            <button
              type="button"
              className="text-button"
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded
                ? 'Close'
                : answer.stance === 'soft_limit'
                  ? 'Add my conditions'
                  : 'Explore my preferences'}
            </button>
          )}
          {answer?.stance === 'hard_limit' && (
            <button
              type="button"
              className="text-button"
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? 'Close' : 'Add a private note'}
            </button>
          )}
          {answer?.stance && (
            <button type="button" className="text-button" onClick={onClear}>
              Clear
            </button>
          )}
        </div>
      </div>


    </article>
  )
}

function ActivityVariations({ catalog, activity }) {
  if (activity.learning?.examples?.length) return <details className="guided-examples"><summary>Explore variations</summary>
    <ul>{activity.learning.examples.map((example, i) => <li key={i}>{example}</li>)}</ul>
    <p>You can be interested in one version and unsure about another.</p>
  </details>
  const fields = detailFieldsForActivity(catalog, activity).filter(f => !['tone','role_scope','structure'].includes(f.id) && !f.showWhen && f.options?.length)
  if (!fields.length) return null
  const field = fields[0]
  return <details className="guided-examples"><summary>Explore variations</summary>
    <p>{field.label}</p><ul>{field.options.slice(0,4).map(o => <li key={o.id}>{o.label}</li>)}</ul>
    <p>These are examples. You can be interested in some versions and unsure about others.</p>
  </details>
}
