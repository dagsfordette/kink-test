import CollectionActivityControls from './CollectionActivityControls.jsx'
import { activityDetailsAllowed } from '../../lib/collectionActivityAnswers.js'
import { CONTEXT_ITEMS, setContextRating, setContextDetails } from '../../lib/contextInterests.js'

export default function ContextExplorer({ activityState, onExploration }) {
  const e = activityState.exploration, interests = e.contextInterests || {}
  const save = next => onExploration({ ...e, contextInterests: next })
  return <section className="context-explorer" aria-label="Settings and contexts">
    <p className="muted">Unmarked means no answer recorded.</p>
    <div className="context-interest-grid">
      {CONTEXT_ITEMS.map(item => {
        const answer = interests[item.id], positive = activityDetailsAllowed(answer?.rating)
        return <article key={item.id} className={`context-interest-card ${answer ? 'marked' : ''}`}>
          <h2>{item.label}</h2><p>{item.description}</p>
          <CollectionActivityControls label={item.label} answer={answer} onRating={rating => save(setContextRating(interests, item.id, rating))} onDetails={patch => save(setContextDetails(interests, item.id, patch))} />
          {positive && <div className="context-follow-up">
            <fieldset><legend>What appeals? <small>Optional</small></legend><div className="activity-detail-chips">
              {item.options.map(option => <button type="button" key={option} className={`chip ${answer.details?.includes(option) ? 'selected' : ''}`} aria-pressed={answer.details?.includes(option) || false} onClick={() => save(setContextDetails(interests, item.id, { details: answer.details?.includes(option) ? answer.details.filter(value => value !== option) : [...(answer.details || []), option] }))}>{option}</button>)}
            </div></fieldset>
            <details><summary>Something more specific?</summary><label>Preferences or conditions<textarea rows="2" maxLength={2000} value={answer.note || ''} onChange={event => save(setContextDetails(interests, item.id, { note: event.target.value }))} placeholder="Anything that makes this setting work for you…" /></label></details>
          </div>}
        </article>
      })}
    </div>
  </section>
}
