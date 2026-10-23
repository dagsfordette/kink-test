import { useEffect, useState } from 'react'
import ActivityDetails from './ActivityDetails.jsx'

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
  hidden,
  onStance,
  onExperience,
  onDetails,
  onNote,
  onClear,
  onToggleHidden
}) {
  const [expanded, setExpanded] = useState(
    Boolean(focused || answer?.stance === 'soft_limit')
  )
  const description = usefulDescription(activity.description)
  useEffect(() => {
    if (focused) setExpanded(true)
  }, [focused])
  useEffect(() => {
    if (answer?.stance === 'soft_limit') setExpanded(true)
  }, [answer?.stance])

  return (
    <article
      id={`activity-${activity.id}`}
      className={`activity-card ${answer?.stance === 'hard_limit' ? 'activity-card-hard-limit' : ''} ${focused ? 'activity-card-focused' : ''}`}
    >
      <header className="activity-card-header">
        <div>
          {(answer?.stance || hidden) && (
            <div className="activity-card-meta">
              {answer?.stance && (
                <span>Saved</span>
              )}
              {hidden && <span>hidden for now</span>}
            </div>
          )}
          <h3 tabIndex={-1}>{activity.label}</h3>
          {description && <p>{description}</p>}
        </div>
        <button
          type="button"
          className="text-button activity-hide-button no-print"
          onClick={onToggleHidden}
        >
          {hidden ? 'Show again' : 'Skip'}
        </button>
      </header>

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

      <div className="activity-secondary-controls">
        <fieldset className="activity-experience-control">
          <legend>Have you tried it?</legend>
          <div className="activity-detail-chips">
            {catalog.experienceScale.map((row) => (
              <button type="button" key={row.id} disabled={!answer?.stance}
                aria-pressed={answer?.experience === row.id}
                className={`chip ${answer?.experience === row.id ? 'selected' : ''}`}
                onClick={() => onExperience(answer?.experience === row.id ? '' : row.id)}>{row.label}</button>
            ))}
          </div>
        </fieldset>
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
                  : 'Add details'}
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

      {expanded && answer?.stance && (
        <ActivityDetails
          catalog={catalog}
          activity={activity}
          answer={answer}
          onDetails={onDetails}
          onNote={onNote}
        />
      )}
    </article>
  )
}
