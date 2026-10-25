import { useState } from 'react'
import { MATERIAL_ITEMS, MATERIAL_RATINGS, MATERIAL_PERSPECTIVES, setMaterialRating } from '../../lib/materialInterests.js'
import ActivityExamples from './ActivityExamples.jsx'
import images from '../../data/activityImages.json'

export default function MaterialInterestsExplorer({ activityState, onExploration }) {
  const e = activityState.exploration, interests = e.materialInterests || {}
  const [group, setGroup] = useState('Materials')
  const save = next => onExploration({ ...e, materialInterests: next })
  return <section className="material-explorer" aria-label="Clothing and material interests">
    <p className="muted">Mark what stands out. Unmarked means no particular interest.</p>
    <div className="activity-detail-chips" role="group" aria-label="Browse clothing and materials">
      {['Materials', 'Clothing', 'Objects'].map(label => <button type="button" key={label} className={`chip ${group === label ? 'selected' : ''}`} aria-pressed={group === label} onClick={() => setGroup(label)}>{label}</button>)}
    </div>
    <div className="material-interest-grid">
      {MATERIAL_ITEMS.filter(item => item.group === group).map(item => {
        const answer = interests[item.id], positive = answer && answer.rating !== 'no'
        const image = images.find(image => image.activityIds.includes(item.exampleActivityId))
        return <article className={`material-interest-card ${answer ? 'marked' : ''}`} key={item.id}>
          {image && <figure className="material-thumbnail"><img src={`${import.meta.env.BASE_URL}${image.src}`} alt={image.alt} loading="lazy" /><figcaption>{image.credit} · <a href={image.licenseUrl} target="_blank" rel="noopener noreferrer">{image.license}</a></figcaption></figure>}
          <h2>{item.label}</h2>
          {item.description && <p>{item.description}</p>}
          <div className="activity-detail-chips" role="group" aria-label={`${item.label}: interest`}>
            {MATERIAL_RATINGS.map(([id, label]) => <button type="button" key={id} className={`chip ${answer?.rating === id ? 'selected' : ''}`} aria-pressed={answer?.rating === id} onClick={() => save(setMaterialRating(interests, item.id, id))}>{label}</button>)}
          </div>
          {answer && <button type="button" className="text-button" onClick={() => save(setMaterialRating(interests, item.id, null))}>Clear mark</button>}
          {positive && <details className="material-follow-up">
            <summary>Make it more specific</summary>
            <fieldset><legend>What appeals to you? <small>Optional</small></legend>
              {MATERIAL_PERSPECTIVES.map(([id, label]) => <label key={id}><input type="checkbox" checked={answer.perspectives?.includes(id) || false} onChange={event => save({ ...interests, [item.id]: { ...answer, perspectives: event.target.checked ? [...(answer.perspectives || []), id] : answer.perspectives.filter(p => p !== id) } })} />{item.group === 'Objects' ? { self: 'Using or handling it myself', partner: 'Seeing my partner with it', together: 'Using it together' }[id] : label}</label>)}
            </fieldset>
            <label>Notes<textarea rows="2" maxLength={2000} value={answer.note || ''} placeholder="Particular items, combinations, or conditions…" onChange={event => save({ ...interests, [item.id]: { ...answer, note: event.target.value } })} /></label>
          </details>}
          <ActivityExamples activityId={item.exampleActivityId} />
        </article>
      })}
    </div>
  </section>
}
