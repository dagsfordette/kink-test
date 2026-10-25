import { ACTIVITY_RATINGS, ACTIVITY_EXPERIENCES } from '../../lib/collectionActivityAnswers.js'

export default function CollectionActivityControls({ label, answer = {}, onRating, onDetails }) {
  return <div className="collection-activity-controls">
    <div className="activity-stance-grid" role="group" aria-label={`${label}: preference`}>
      {ACTIVITY_RATINGS.map(([id, text]) => <button type="button" key={id} className={`activity-stance stance-${id} ${answer.rating === id ? 'selected' : ''}`} aria-pressed={answer.rating === id} onClick={() => onRating(id)}>{text}</button>)}
      {answer.rating && <button type="button" className="text-button" onClick={() => onRating(null)} aria-label={`Clear preference for ${label}`}>Clear</button>}
    </div>
    <fieldset className="activity-experience-control"><legend>Have you tried it?</legend>
      <div className="activity-detail-chips" role="group" aria-label={`${label}: experience`}>
        {ACTIVITY_EXPERIENCES.map(([id, text]) => <button type="button" key={id} className={`chip ${answer.experience === id ? 'selected' : ''}`} aria-pressed={answer.experience === id} onClick={() => onDetails({ experience: answer.experience === id ? '' : id })}>{text}</button>)}
      </div>
    </fieldset>
    {answer.rating === 'soft_limit' && <label>My conditions <small>Optional · private</small><textarea rows="2" maxLength={2000} value={answer.conditions || ''} onChange={event => onDetails({ conditions: event.target.value })} /></label>}
  </div>
}
