import { sharedFields, preferenceKey, describePreference, validValue } from '../../lib/guidedExploration.js'
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
    return (
      <label className="activity-detail-field">
        <span>{field.label}</span>
        <textarea
          rows="3"
          value={value || ''}
          placeholder={field.placeholder || ''}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    )
  }
  if (field.type === 'single_select') {
    return (
      <label className="activity-detail-field">
        <span>{field.label}</span>
        <select
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{field.placeholder || 'Choose one'}</option>
          {(field.options || []).map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    )
  }
  if (field.type === 'paired_select') {
    const pair =
      value && typeof value === 'object' && !Array.isArray(value) ? value : {}
    return (
      <div className="activity-detail-field">
        <span>{field.label}</span>
        <div className="activity-paired-select">
          <label>
            <small>{field.preferredLabel || 'Preferred'}</small>
            <select
              value={pair.preferred || ''}
              onChange={(event) =>
                onChange({ ...pair, preferred: event.target.value })
              }
            >
              <option value="">{field.placeholder || 'Choose'}</option>
              {(field.options || []).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <small>{field.maximumLabel || 'Maximum'}</small>
            <select
              value={pair.maximum || ''}
              onChange={(event) =>
                onChange({ ...pair, maximum: event.target.value })
              }
            >
              <option value="">{field.placeholder || 'Choose'}</option>
              {(field.options || []).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
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
          <button
            type="button"
            key={option.id}
            className={`chip ${values.includes(option.id) ? 'selected' : ''}`}
            onClick={() => onChange(toggleArray(values, option, field.options))}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ActivityDetails({
  catalog,
  activity,
  answer,
  onDetails,
  onNote,
  guided = false,
  sharedPreferences = {},
  onRemember
}) {
  const details = answer?.details || {}
  const allFields = ['hard_limit', 'dont_want'].includes(answer?.stance) ? [] : detailFieldsForActivity(catalog, activity, details)
  const shared = guided ? sharedFields(catalog, activity).filter(f => allFields.some(a => a.id === f.id)) : []
  const fields = allFields.filter(f => !shared.some(s => s.id === f.id))
  // A conditional follow-up stays next to its parent, even across progressive disclosure.
  const primaryCount = activity.learning ? 1 : 2
  const cut = fields.findIndex((f, i) => i >= primaryCount && !f.showWhen)
  const primary = guided && cut >= 0 ? fields.slice(0, cut) : fields
  const more = guided && cut >= 0 ? fields.slice(cut) : []
  const sharedIntroduction = catalog.categories.find(c => c.id === activity.categoryId)?.guidedDetails
  const renderField = field => <Field key={field.id} field={field} value={details[field.id]} onChange={value => onDetails({ ...details, [field.id]: value })} />
  const riskMap = new Map(catalog.riskDomains.map((row) => [row.id, row]))
  const riskRows = (activity.riskDomains || [])
    .map((id) => riskMap.get(id))
    .filter(Boolean)

  const noteField = (<label className="activity-detail-field activity-note-field">
        <span>Private note</span>
        <textarea
          rows="3"
          value={answer?.note || ''}
          placeholder={
            answer?.stance === 'soft_limit'
              ? 'What would need to be true for this to feel okay?'
              : 'Anything you want to remember about this one?'
          }
          onChange={(event) => onNote(event.target.value)}
        />
      </label>)

  return (
    <div className="activity-details-panel">
      {primary.map(renderField)}
      {more.length > 0 && <details className="guided-more-details"><summary>More details</summary>{more.map(renderField)}</details>}
      {shared.length > 0 && <details className="guided-more-details"><summary>{sharedIntroduction?.title || 'Explore broader preferences'}</summary>
        <p>{sharedIntroduction?.help || 'You can leave these preferences undecided. Remembered choices are suggestions for other activities in the same role.'}</p>
        {shared.map(field => {
          const remembered = sharedPreferences[preferenceKey(activity, field)]
          return <div key={field.id}>
            {remembered && <div className="guided-remembered"><p>Previously chosen in this role: <strong>{describePreference(field, remembered)}</strong></p>
              <button type="button" className="text-button" onClick={() => onDetails({ ...details, [field.id]: remembered })}>Use for this activity</button></div>}
            {renderField(field)}
            {onRemember && validValue(field, details[field.id]) && JSON.stringify(details[field.id]) !== JSON.stringify(remembered) && <button type="button" className="text-button" onClick={() => onRemember(field, details[field.id])}>Remember this choice for this role</button>}
            <button type="button" className="text-button" onClick={() => {
              const next = { ...details }; delete next[field.id]; onDetails(next)
            }}>I’m not sure yet</button>
          </div>
        })}
      </details>}

      {activity.learning && !['soft_limit','hard_limit','dont_want'].includes(answer?.stance) ? <details className="guided-more-details"><summary>Add a private note</summary>{noteField}</details> : noteField}

      {riskRows.length > 0 && (
        <details className="activity-considerations">
          <summary>Things to think about</summary>
          <div>
            {riskRows.map((row) => (
              <p key={row.id}>
                <strong>{row.label}:</strong> {row.prompt}
              </p>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
