import CollectionActivitySummary from './CollectionActivitySummary.jsx'
import { SENSORY_ITEMS, sensoryRatingLabel } from '../../lib/sensoryInterests.js'
import { featureActionLabel as activityLabel } from '../../lib/featureInterests.js'

export default function SensorySummary({ interests = {}, title = 'Sensory interests', privateDetails = false, person = 'self', onEdit }) {
  const marked = SENSORY_ITEMS.filter(item => item.rows.some(row => interests[row.id]))
  if (!marked.length && !onEdit) return null
  return <section className="sensory-summary"><h2>{title}</h2>
    <p className="muted">Unmarked activities have no answer recorded. Unmarked attraction preferences mean no particular interest.</p>
    {marked.map(item => <section key={item.id}><h3>{item.label}</h3>
      {item.rows.filter(row => interests[row.id]).map(row => {
        const answer = interests[row.id]
        return <div key={row.id} className="feature-summary-row"><div><strong>{activityLabel(row.label, person)}</strong><CollectionActivitySummary answer={answer} privateDetails={privateDetails} />
          {privateDetails && answer.choices?.length > 0 && <p>{answer.choices.join(' · ')}</p>}
          {privateDetails && answer.note && <p>{answer.note}</p>}
        </div><span className="soft-pill">{sensoryRatingLabel(answer.rating, row.id)}</span></div>
      })}
    </section>)}
    {onEdit && <button type="button" className="text-button no-print" onClick={onEdit}>Edit sensory interests</button>}
  </section>
}
