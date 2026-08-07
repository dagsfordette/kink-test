import { negotiationFieldValue, negotiationModel, setNegotiationField, toggleNegotiationOption } from '../lib/negotiation.js'

function visibleAttractionSection(catalog) {
  return (negotiationModel(catalog).sections || []).find((section) => section.id === 'attraction_profile')
}

export default function AttractionPreferences({ catalog, preferences, setPreferences }) {
  const section = visibleAttractionSection(catalog)
  if (!section) return null

  return (
    <section className="attraction-page" aria-labelledby="attraction-heading">
      <header className="category-intro attraction-intro">
        <div>
          <span className="kicker">Before the questions</span>
          <h1 id="attraction-heading">Who and what interests you?</h1>
          <p>{section.description}</p>
        </div>
      </header>

      <div className="attraction-fields">
        {(section.fields || []).map((field) => {
          const value = negotiationFieldValue(preferences, section.id, field.id)
          const selected = Array.isArray(value) ? value : []
          const selectableIds = (field.options || [])
            .map((option) => option.id)
            .filter((id) => !(field.exclusiveOptions || []).includes(id))
          const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.includes(id))

          return (
            <div className="attraction-field" key={field.id}>
              <div className="field-label-row attraction-field-heading">
                <span className="field-label">{field.label}</span>
                <span className="inline-field-actions">
                  {selectableIds.length > 1 && (
                    <button
                      type="button"
                      className="field-clear"
                      onClick={() => setPreferences((prev) => setNegotiationField(prev, section.id, field.id, allSelected ? undefined : selectableIds))}
                    >
                      {allSelected ? 'Clear all' : 'Select all'}
                    </button>
                  )}
                </span>
              </div>
              {field.help && <p className="field-help attraction-help">{field.help}</p>}
              <div className="choice-chips attraction-chips" aria-label={field.label}>
                {(field.options || []).map((option) => {
                  const isSelected = selected.includes(option.id)
                  return (
                    <button
                      type="button"
                      className={`chip ${isSelected ? 'selected' : ''}`}
                      aria-pressed={isSelected}
                      onClick={() => setPreferences((prev) => toggleNegotiationOption(catalog, prev, section.id, field.id, option.id))}
                      key={option.id}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <p className="negotiation-footnote">These are broad defaults, not rules. You can still answer any individual interest differently later.</p>
    </section>
  )
}
