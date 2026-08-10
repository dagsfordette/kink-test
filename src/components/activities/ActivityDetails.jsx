import { detailFieldsForActivity } from '../../lib/activityProfile.js'

function toggleArray(current, option, options) {
  const set = new Set(Array.isArray(current) ? current : [])
  if (set.has(option.id)) set.delete(option.id)
  else {
    if (option.exclusive) set.clear()
    else for (const row of options || []) if (row.exclusive) set.delete(row.id)
    set.add(option.id)
  }
  return [...set]
}

function Field({ field, value, onChange }) {
  if (field.type === 'text') {
    return <label className="activity-detail-field"><span>{field.label}</span><textarea rows="3" value={value || ''} placeholder={field.placeholder || ''} onChange={(event) => onChange(event.target.value)} /></label>
  }
  if (field.type === 'single_select') {
    return <label className="activity-detail-field"><span>{field.label}</span><select value={value || ''} onChange={(event) => onChange(event.target.value)}><option value="">{field.placeholder || 'Choose one'}</option>{(field.options || []).map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
  }
  if (field.type === 'paired_select') {
    const pair = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
    return (
      <div className="activity-detail-field">
        <span>{field.label}</span>
        <div className="activity-paired-select">
          <label><small>{field.preferredLabel || 'Preferred'}</small><select value={pair.preferred || ''} onChange={(event) => onChange({ ...pair, preferred: event.target.value })}><option value="">{field.placeholder || 'Choose'}</option>{(field.options || []).map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
          <label><small>{field.maximumLabel || 'Maximum'}</small><select value={pair.maximum || ''} onChange={(event) => onChange({ ...pair, maximum: event.target.value })}><option value="">{field.placeholder || 'Choose'}</option>{(field.options || []).map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
        </div>
      </div>
    )
  }
  const values = Array.isArray(value) ? value : []
  return (
    <div className="activity-detail-field">
      <span>{field.label}</span>
      {field.help && <small>{field.help}</small>}
      <div className="activity-detail-chips">
        {(field.options || []).map((option) => (
          <button type="button" key={option.id} className={`chip ${values.includes(option.id) ? 'selected' : ''}`} onClick={() => onChange(toggleArray(values, option, field.options))}>{option.label}</button>
        ))}
      </div>
    </div>
  )
}

export default function ActivityDetails({ catalog, activity, answer, onDetails, onNote }) {
  const details = answer?.details || {}
  const fields = detailFieldsForActivity(catalog, activity, details)
  const riskMap = new Map(catalog.riskDomains.map((row) => [row.id, row]))
  const riskRows = (activity.riskDomains || []).map((id) => riskMap.get(id)).filter(Boolean)

  return (
    <div className="activity-details-panel">
      {fields.length > 0 ? fields.map((field) => (
        <Field key={field.id} field={field} value={details[field.id]} onChange={(value) => onDetails({ ...details, [field.id]: value })} />
      )) : <p className="muted">No additional structured details are needed for this activity.</p>}

      <label className="activity-detail-field activity-note-field">
        <span>Private note</span>
        <textarea rows="3" value={answer?.note || ''} placeholder={answer?.stance === 'soft_limit' ? 'Conditions, boundaries, or context that matter…' : 'Optional nuance, context, or reminder…'} onChange={(event) => onNote(event.target.value)} />
      </label>

      {riskRows.length > 0 && (
        <details className="activity-considerations">
          <summary>Relevant considerations</summary>
          <div>{riskRows.map((row) => <p key={row.id}><strong>{row.label}:</strong> {row.prompt}</p>)}</div>
        </details>
      )}
    </div>
  )
}
