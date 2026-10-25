import CollectionActivityControls from './CollectionActivityControls.jsx'
import { activityDetailsAllowed } from '../../lib/collectionActivityAnswers.js'
import { useState } from 'react'
import { SENSORY_ITEMS, SENSORY_GROUPS, SENSORY_RATINGS, sensoryUsesActivityScale, setSensoryRating, setSensoryDetails } from '../../lib/sensoryInterests.js'

export default function SensoryExplorer({ activityState, onExploration }) {
  const e = activityState.exploration, interests = e.sensoryInterests || {}
  const [selected, setSelected] = useState(() => SENSORY_ITEMS.find(item => item.rows.some(row => interests[row.id]))?.id || SENSORY_ITEMS[0].id)
  const item = SENSORY_ITEMS.find(item => item.id === selected)
  const peers = SENSORY_ITEMS.filter(peer => peer.group === item.group)
  const save = next => onExploration({ ...e, sensoryInterests: next })
  const detail = (id, patch) => save(setSensoryDetails(interests, id, patch))
  return <section className="sensory-explorer" aria-label="Sensory interests">
    <div className="sensory-groups" role="group" aria-label="Sensory groups">
      {SENSORY_GROUPS.map(group => <button type="button" className={`chip ${item.group === group ? 'selected' : ''}`} key={group} aria-pressed={item.group === group} onClick={() => setSelected(SENSORY_ITEMS.find(item => item.group === group).id)}>{group}</button>)}
    </div>
    {peers.length > 1 && <div className="sensory-picker" role="group" aria-label="Explore an interest">
      {peers.map(peer => <button type="button" key={peer.id} className={`sensory-choice ${selected === peer.id ? 'selected' : ''}`} aria-pressed={selected === peer.id} onClick={() => setSelected(peer.id)}>{peer.label}</button>)}
    </div>}
    <header className="feature-heading"><h2>{item.label}</h2><p>{item.description}</p></header>
    <div className="feature-rating-list">
      {item.rows.map(row => <div className="feature-rating-row" key={row.id}>
        <h3>{row.label}</h3>
        {sensoryUsesActivityScale(row.id) ? <CollectionActivityControls label={row.label} answer={interests[row.id]} onRating={rating => save(setSensoryRating(interests, row.id, rating))} onDetails={patch => detail(row.id, patch)} /> : <div className="feature-ratings" role="group" aria-label={`${row.label}: interest`}>
          {SENSORY_RATINGS.map(([id, label]) => <button type="button" key={id} className={`chip ${interests[row.id]?.rating === id ? 'selected' : ''}`} aria-pressed={interests[row.id]?.rating === id} onClick={() => save(setSensoryRating(interests, row.id, id))}>{label}</button>)}
          {interests[row.id] && <button type="button" className="text-button" aria-label={`Clear ${row.label}`} onClick={() => save(setSensoryRating(interests, row.id, null))}>Clear</button>}
        </div>}
      </div>)}
    </div>
    {item.rows.map(row => {
      const answer = interests[row.id]
      if (!answer || (sensoryUsesActivityScale(row.id) ? !activityDetailsAllowed(answer.rating) : answer.rating === 'no')) return null
      return <section className="sensory-details" key={row.id} aria-label={`${row.label}: optional details`}>
        {item.rows.length > 1 && <h3>{row.label}</h3>}
        {row.choices.length > 0 && <fieldset><legend>What appeals? <small>Optional</small></legend><div className="activity-detail-chips">
          {row.choices.map(choice => <button type="button" key={choice} className={`chip ${answer.choices?.includes(choice) ? 'selected' : ''}`} aria-pressed={answer.choices?.includes(choice) || false} onClick={() => detail(row.id, { choices: answer.choices?.includes(choice) ? answer.choices.filter(value => value !== choice) : [...(answer.choices || []), choice] })}>{choice}</button>)}
        </div></fieldset>}
        <details><summary>{row.choices.length ? 'Anything more specific?' : 'Which accents?'} <small>Optional</small></summary>
          <label>{row.noteLabel}<textarea rows="2" maxLength={2000} value={answer.note || ''} placeholder="Preferences or examples…" onChange={event => detail(row.id, { note: event.target.value })} /></label>
        </details>
      </section>
    })}
    <p className="muted feature-unmarked">{item.rows.some(row => sensoryUsesActivityScale(row.id)) ? 'Unmarked means no answer recorded.' : 'Unmarked means no particular interest.'}</p>
  </section>
}
