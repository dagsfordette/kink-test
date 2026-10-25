import CollectionActivitySummary from './CollectionActivitySummary.jsx'
import { CONTEXT_ITEMS, contextRatingLabel } from '../../lib/contextInterests.js'

export default function ContextSummary({ interests = {}, title = 'Settings & contexts', privateDetails = false, onEdit }) {
  const marked = CONTEXT_ITEMS.filter(item => interests[item.id])
  if (!marked.length && !onEdit) return null
  return <section className="context-summary"><h2>{title}</h2>
    <p className="muted">Unmarked settings have no answer recorded.</p>
    {marked.map(item => {
      const answer = interests[item.id]
      return <div className="context-summary-row" key={item.id}>
        <div><strong>{item.label}</strong><CollectionActivitySummary answer={answer} privateDetails={privateDetails} />
          {privateDetails && answer.details?.length > 0 && <p>{answer.details.join(' · ')}</p>}
          {privateDetails && answer.note && <p>{answer.note}</p>}
        </div><span className="soft-pill">{contextRatingLabel(answer.rating)}</span>
      </div>
    })}
    {onEdit && <button type="button" className="text-button no-print" onClick={onEdit}>Edit settings & contexts</button>}
  </section>
}
