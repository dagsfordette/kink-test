import { useEffect, useState } from 'react'
import ActivityDetails from './ActivityDetails.jsx'

const FINE_TUNE_STANCES = new Set(['love', 'want', 'curious', 'if_partner_wants', 'soft_limit'])

function usefulDescription(description = '') {
  if (/^A consensual adult activity or negotiated dynamic involving .+ with context, boundaries, and conditions fine-tuned separately where useful\.$/i.test(description)) return ''
  if (/^Using .+ as a deliberate clothing, material, texture, or aesthetic focus in consensual adult play\.$/i.test(description)) return ''
  if (/^A real-world setting or context for consensual adult sexual or kink activity:/i.test(description)) return ''
  if (/^A negotiated ongoing adult relationship structure or dynamic involving /i.test(description)) return ''
  return description
}

export default function ActivityCard({ catalog, activity, answer, focused, hidden, onStance, onExperience, onDetails, onNote, onClear, onToggleHidden }) {
  const [expanded, setExpanded] = useState(false)
  const description = usefulDescription(activity.description)
  useEffect(() => {
    if (focused) setExpanded(true)
  }, [focused])

  return (
    <article id={`activity-${activity.id}`} className={`activity-card ${answer?.stance === 'hard_limit' ? 'activity-card-hard-limit' : ''} ${focused ? 'activity-card-focused' : ''}`}>
      <header className="activity-card-header">
        <div>
          <div className="activity-card-meta"><span>{activity.priority}</span>{answer?.stance && <span>answered</span>}{hidden && <span>hidden for now</span>}</div>
          <h3>{activity.label}</h3>
          {description && <p>{description}</p>}
        </div>
        <button type="button" className="text-button activity-hide-button no-print" onClick={onToggleHidden}>{hidden ? 'Put back in the list' : 'Hide for now'}</button>
      </header>

      <div className="activity-stance-grid" aria-label={`Stance for ${activity.label}`}>
        {catalog.stanceScale.map((row) => (
          <button type="button" key={row.id} title={row.meaning} className={`activity-stance stance-${row.id} ${answer?.stance === row.id ? 'selected' : ''}`} onClick={() => onStance(row.id)}>
            <span>{row.label}</span>
          </button>
        ))}
      </div>

      <div className="activity-secondary-controls">
        <label className="activity-experience-control">
          <span>Have you tried it? <small>optional</small></span>
          <select disabled={!answer?.stance} value={answer?.experience || ''} onChange={(event) => onExperience(event.target.value)}>
            <option value="">Not answered</option>
            {catalog.experienceScale.map((row) => <option key={row.id} value={row.id}>{row.label}</option>)}
          </select>
        </label>
        <div className="activity-card-actions no-print">
          {answer?.stance && FINE_TUNE_STANCES.has(answer.stance) && <button type="button" className="text-button" onClick={() => setExpanded((value) => !value)}>{expanded ? 'Close' : answer.stance === 'soft_limit' ? 'Add my conditions' : 'Add details'}</button>}
          {answer?.stance === 'hard_limit' && <button type="button" className="text-button" onClick={() => setExpanded((value) => !value)}>{expanded ? 'Close' : 'Add a private note'}</button>}
          {answer?.stance && <button type="button" className="text-button" onClick={onClear}>Clear</button>}
        </div>
      </div>

      {expanded && answer?.stance && (FINE_TUNE_STANCES.has(answer.stance) || answer.stance === 'hard_limit') && <ActivityDetails catalog={catalog} activity={activity} answer={answer} onDetails={onDetails} onNote={onNote} />}
    </article>
  )
}
