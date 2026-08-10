import { useEffect, useState } from 'react'
import ActivityDetails from './ActivityDetails.jsx'

const FINE_TUNE_STANCES = new Set(['love', 'want', 'curious', 'if_partner_wants', 'soft_limit'])

export default function ActivityCard({ catalog, activity, answer, focused, hidden, onStance, onExperience, onDetails, onNote, onClear, onToggleHidden }) {
  const [expanded, setExpanded] = useState(false)
  useEffect(() => {
    if (focused) setExpanded(true)
  }, [focused])

  return (
    <article id={`activity-${activity.id}`} className={`activity-card ${answer?.stance === 'hard_limit' ? 'activity-card-hard-limit' : ''} ${focused ? 'activity-card-focused' : ''}`}>
      <header className="activity-card-header">
        <div>
          <div className="activity-card-meta"><span>{activity.priority}</span>{answer?.stance && <span>answered</span>}{hidden && <span>hidden for now</span>}</div>
          <h3>{activity.label}</h3>
          <p>{activity.description}</p>
        </div>
        <button type="button" className="text-button activity-hide-button no-print" onClick={onToggleHidden}>{hidden ? 'Show normally' : 'Hide for now'}</button>
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
          <span>Experience <small>optional</small></span>
          <select disabled={!answer?.stance} value={answer?.experience || ''} onChange={(event) => onExperience(event.target.value)}>
            <option value="">Not answered</option>
            {catalog.experienceScale.map((row) => <option key={row.id} value={row.id}>{row.label}</option>)}
          </select>
        </label>
        <div className="activity-card-actions no-print">
          {answer?.stance && FINE_TUNE_STANCES.has(answer.stance) && <button type="button" className="text-button" onClick={() => setExpanded((value) => !value)}>{expanded ? 'Close details' : answer.stance === 'soft_limit' ? 'Add conditions' : 'Fine-tune this'}</button>}
          {answer?.stance === 'hard_limit' && <button type="button" className="text-button" onClick={() => setExpanded((value) => !value)}>{expanded ? 'Close note' : 'Add private note'}</button>}
          {answer?.stance && <button type="button" className="text-button" onClick={onClear}>Clear answer</button>}
        </div>
      </div>

      {expanded && answer?.stance && (FINE_TUNE_STANCES.has(answer.stance) || answer.stance === 'hard_limit') && <ActivityDetails catalog={catalog} activity={activity} answer={answer} onDetails={onDetails} onNote={onNote} />}
    </article>
  )
}
