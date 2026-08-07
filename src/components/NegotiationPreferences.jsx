import { negotiationFieldValue, negotiationModel, negotiationPreferenceSummary, setNegotiationField, toggleNegotiationOption } from '../lib/negotiation.js'

export default function NegotiationPreferences({ catalog, preferences, setPreferences }) {
  const model = negotiationModel(catalog)
  const visibleSections = (model.sections || []).filter((section) => !section.pretestOnly)
  const summary = negotiationPreferenceSummary(catalog, preferences, { includePretestOnly: false })

  return (
    <section className="negotiation-page" aria-labelledby="negotiation-heading">
      <header className="category-intro negotiation-intro">
        <div>
          <span className="kicker">Before the questions</span>
          <h1 id="negotiation-heading">Negotiation, privacy & care</h1>
          <p>Set your general preferences for communication, stopping, privacy, marks, and aftercare. They stay separate from your interest answers, and you can change them later.</p>
        </div>
        <div className="category-stat"><strong>{summary.answeredFields}</strong><span>answered</span></div>
      </header>

      <div className="negotiation-section-grid">
        {visibleSections.map((section) => (
          <article className="negotiation-card" key={section.id}>
            <div className="negotiation-card-heading">
              <h2>{section.label}</h2>
              <p>{section.description}</p>
            </div>
            <div className="negotiation-fields">
              {(section.fields || []).map((field) => {
                const value = negotiationFieldValue(preferences, section.id, field.id)
                if (field.type === 'multi_select') {
                  const selectedValues = Array.isArray(value) ? value : []
                  const selectableIds = (field.options || [])
                    .map((option) => option.id)
                    .filter((id) => !(field.exclusiveOptions || []).includes(id))
                  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedValues.includes(id))
                  return (
                    <div className="negotiation-field" key={field.id}>
                      <div className="field-label-row">
                        <span className="field-label">{field.label}</span>
                        {selectableIds.length > 1 && (
                          <button
                            type="button"
                            className="field-clear"
                            onClick={() => setPreferences((prev) => setNegotiationField(prev, section.id, field.id, allSelected ? undefined : selectableIds))}
                          >
                            {allSelected ? 'Clear all' : 'Select all'}
                          </button>
                        )}
                      </div>
                      <div className="choice-chips negotiation-chips" aria-label={field.label}>
                        {(field.options || []).map((option) => {
                          const selected = selectedValues.includes(option.id)
                          return <button type="button" className={`chip ${selected ? 'selected' : ''}`} aria-pressed={selected} onClick={() => setPreferences((prev) => toggleNegotiationOption(catalog, prev, section.id, field.id, option.id))} key={option.id}>{option.label}</button>
                        })}
                      </div>
                    </div>
                  )
                }
                if (field.type === 'single_select') {
                  return (
                    <label className="negotiation-field" key={field.id}>
                      <span className="field-label field-label-row"><span>{field.label}</span>{value && <button type="button" className="field-clear" onClick={(event) => { event.preventDefault(); setPreferences((prev) => setNegotiationField(prev, section.id, field.id, undefined)) }}>Clear</button>}</span>
                      <select value={value || ''} onChange={(event) => setPreferences((prev) => setNegotiationField(prev, section.id, field.id, event.target.value || undefined))}>
                        <option value="" disabled hidden>Choose an option</option>
                        {(field.options || []).map((option) => <option value={option.id} key={option.id}>{option.label}</option>)}
                      </select>
                    </label>
                  )
                }
                return (
                  <label className="negotiation-field" key={field.id}>
                    <span className="field-label">{field.label}</span>
                    <input type="text" value={value || ''} placeholder={field.placeholder || ''} onChange={(event) => setPreferences((prev) => setNegotiationField(prev, section.id, field.id, event.target.value))} />
                  </label>
                )
              })}
            </div>
          </article>
        ))}
      </div>
      <p className="negotiation-footnote">These are defaults, not assumptions about every question. A specific boundary you set later takes precedence.</p>
    </section>
  )
}
