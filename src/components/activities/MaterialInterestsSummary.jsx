import { MATERIAL_ITEMS, MATERIAL_RATINGS, MATERIAL_PERSPECTIVES } from '../../lib/materialInterests.js'
export default function MaterialInterestsSummary({ interests = {}, title = 'Clothing & material interests', onEdit, privateDetails = false }) {
  const marked = MATERIAL_ITEMS.filter(item => interests[item.id])
  if (!marked.length && !onEdit) return null
  return <section className="material-summary">
    <h2>{title}</h2>
    <p className="muted">Unmarked items mean no particular interest. No / turn-off is an explicit dislike.</p>
    {marked.map(item => {
      const answer = interests[item.id]
      return <div className="material-summary-row" key={item.id}>
        <div><strong>{item.label}</strong>{privateDetails && answer.rating !== 'no' && <>
          {answer.perspectives?.length > 0 && <p>{answer.perspectives.map(id => MATERIAL_PERSPECTIVES.find(([key]) => key === id)?.[1]).join(' · ')}</p>}
          {answer.note && <p>{answer.note}</p>}
        </>}</div><span className="soft-pill">{MATERIAL_RATINGS.find(([id]) => id === answer.rating)?.[1]}</span>
      </div>
    })}
    {onEdit && <button type="button" className="text-button no-print" onClick={onEdit}>Edit clothing & materials</button>}
  </section>
}
