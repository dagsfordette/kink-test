import CollectionActivityControls from './CollectionActivityControls.jsx'
import { activityDetailsAllowed } from '../../lib/collectionActivityAnswers.js'
import { useState } from 'react'
import { FEATURE_GROUPS, featureRatings, featureUsesActivityScale, setFeatureActivityDetails, setFeatureRating, setFeatureNote } from '../../lib/featureInterests.js'

export default function FeatureExplorer({ activityState, onExploration, groups = FEATURE_GROUPS, pickerLabel = 'Explore a feature', label = 'Body-feature activities' }) {
  const e = activityState.exploration, interests = e.featureInterests || {}
  const [selected, setSelected] = useState(() => groups.find(group => interests[group.id])?.id || groups[0]?.id)
  const group = groups.find(group => group.id === selected) || groups[0]
  if (!group) return <section className="feature-explorer" aria-label={label}><p className="muted">There are no devices to show with your current preferences. You can continue or change your preferences.</p></section>
  const saved = interests[group.id], answers = saved?.answers || {}
  const isActivity = featureUsesActivityScale(group.id)
  const positive = Object.values(answers).some(rating => isActivity ? activityDetailsAllowed(rating) : rating !== 'no')
  const save = next => onExploration({ ...e, featureInterests: next })
  return <section className="feature-explorer" aria-label={groups.length === 1 ? `${group.label} activities` : label}>
    {groups.length > 1 && <div className="feature-picker" role="group" aria-label={pickerLabel}>
      {groups.map(item => <button type="button" key={item.id} className={`feature-choice ${group.id === item.id ? 'selected' : ''}`} aria-pressed={group.id === item.id} onClick={() => setSelected(item.id)}>{item.label}</button>)}
    </div>}
    {groups.length > 1 && <header className="feature-heading"><h2>{group.label}</h2><p>{group.description}</p></header>}
    <div className="feature-rating-list">
      {group.rows.map(([id, label]) => <div className="feature-rating-row" key={id}>
        <h3>{label}</h3>
        {isActivity ? <CollectionActivityControls label={label} answer={{ rating: answers[id], ...saved?.activityDetails?.[id] }} onRating={rating => save(setFeatureRating(interests, group.id, id, rating))} onDetails={patch => save(setFeatureActivityDetails(interests, group.id, id, patch))} /> : <div className="feature-ratings" role="group" aria-label={`${label}: interest`}>
          {featureRatings(group.id).map(([rating, text]) => <button type="button" key={rating} className={`chip ${answers[id] === rating ? 'selected' : ''}`} aria-pressed={answers[id] === rating} onClick={() => save(setFeatureRating(interests, group.id, id, rating))}>{text}</button>)}
          {answers[id] && <button type="button" className="text-button" aria-label={`Clear ${label}`} onClick={() => save(setFeatureRating(interests, group.id, id, null))}>Clear</button>}
        </div>}
      </div>)}
    </div>
    {positive && <details className="feature-notes" key={group.id}><summary>Anything more specific? <small>Optional</small></summary>
      <label>{group.noteLabel}<textarea rows="2" maxLength={2000} value={saved?.note || ''} placeholder="Preferences or conditions…" onChange={event => save(setFeatureNote(interests, group.id, event.target.value))} /></label>
    </details>}
    <p className="muted feature-unmarked">{isActivity ? 'Unmarked means no answer recorded.' : 'Unmarked means no particular interest.'}</p>
  </section>
}
