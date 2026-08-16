import { BASICS_FIELDS } from '../../lib/basicsProfile.js'

function toggle(values, id) {
  const next = new Set(Array.isArray(values) ? values : [])
  next.has(id) ? next.delete(id) : next.add(id)
  return [...next]
}

function visible(field, values) {
  if (!field.showWhen) return true
  const current = values[field.showWhen.field]
  if (field.showWhen.contains) return Array.isArray(current) && current.includes(field.showWhen.contains)
  if (field.showWhen.containsAny) return Array.isArray(current) && field.showWhen.containsAny.some((id) => current.includes(id))
  return true
}

export default function Basics({ values, onChange, onContinue, onBack }) {
  return (
    <main className="basics-shell">
      <section className="basics-card">
        <span className="kicker">Basics</span>
        <h1>Who are you into, generally?</h1>
        <p className="basics-lede">These are broad defaults so we do not keep asking the same attraction and body-preference questions under individual fantasies or activities. Skip anything that does not matter to you.</p>

        <div className="basics-fields">
          {BASICS_FIELDS.filter((field) => visible(field, values)).map((field) => (
            <div className="basics-field" key={field.id}>
              <strong>{field.label}</strong>
              {field.help && <small>{field.help}</small>}
              {field.type === 'paired_select' ? (
                <div className="activity-paired-select">
                  <label><small>Preferred</small><select value={values[field.id]?.preferred || ''} onChange={(event) => onChange({ [field.id]: { ...(values[field.id] || {}), preferred: event.target.value } })}><option value="">Choose</option>{field.options.map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label>
                  <label><small>Maximum</small><select value={values[field.id]?.maximum || ''} onChange={(event) => onChange({ [field.id]: { ...(values[field.id] || {}), maximum: event.target.value } })}><option value="">Choose</option>{field.options.map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label>
                </div>
              ) : (
                <div className="activity-detail-chips">
                  {field.options.map(([id, label]) => <button type="button" key={id} className={`chip ${(values[field.id] || []).includes(id) ? 'selected' : ''}`} onClick={() => onChange({ [field.id]: toggle(values[field.id], id) })}>{label}</button>)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="basics-actions">
          <button type="button" className="primary-button large" onClick={onContinue}>Save & continue</button>
          <button type="button" className="text-button" onClick={onBack}>Back</button>
        </div>
        <p className="fine-print">Basics is shared by Fantasy Profile and Activity Explorer. Once you complete it, the other path will not ask you again.</p>
      </section>
    </main>
  )
}
