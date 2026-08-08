import { negotiationFieldValue, negotiationModel, setNegotiationField, toggleNegotiationOption } from '../lib/negotiation.js'

function profileSections(catalog) {
  return (negotiationModel(catalog).sections || []).filter((section) => section.pretestOnly)
}

export default function ProfilePreferences({ catalog, preferences, setPreferences, setupMode = false }) {
  const sections = profileSections(catalog)
  if (!sections.length) return null

  return (
    <section className="profile-page" aria-labelledby="profile-heading">
      <header className="category-intro profile-intro">
        <div>
          <span className="kicker">{setupMode ? 'Step 1 of 2' : 'Your setup'}</span>
          <h1 id="profile-heading">{setupMode ? 'Set up your profile' : 'Your profile'}</h1>
          <p>
            Tell the inventory a little about you and the bodies you are generally interested in. This is optional, but it lets the test hide a small number of anatomy-specific questions that clearly do not apply.
          </p>
        </div>
      </header>

      <div className="profile-pruning-note">
        <strong>Gender never determines anatomy here.</strong>
        <span>Only explicit anatomy choices are used for pruning. Leave anything blank and the related questions stay visible. Nothing you hide is deleted, and you can show filtered questions later.</span>
      </div>

      <div className="profile-section-grid">
        {sections.map((section) => (
          <article className="profile-section" key={section.id}>
            <div className="profile-section-heading">
              <h2>{section.label}</h2>
              <p>{section.description}</p>
            </div>

            <div className="profile-fields">
              {(section.fields || []).map((field) => {
                const value = negotiationFieldValue(preferences, section.id, field.id)

                if (field.type === 'multi_select') {
                  const selected = Array.isArray(value) ? value : []
                  const selectableIds = (field.options || [])
                    .map((option) => option.id)
                    .filter((id) => !(field.exclusiveOptions || []).includes(id))
                  const allSelected = selectableIds.length > 1 && selectableIds.every((id) => selected.includes(id))

                  return (
                    <div className="profile-field" key={field.id}>
                      <div className="field-label-row profile-field-heading">
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
                      {field.help && <p className="field-help profile-help">{field.help}</p>}
                      <div className="choice-chips profile-chips" aria-label={field.label}>
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
                }

                if (field.type === 'single_select') {
                  return (
                    <label className="profile-field" key={field.id}>
                      <span className="field-label field-label-row">
                        <span>{field.label}</span>
                        {value && <button type="button" className="field-clear" onClick={(event) => { event.preventDefault(); setPreferences((prev) => setNegotiationField(prev, section.id, field.id, undefined)) }}>Clear</button>}
                      </span>
                      {field.help && <span className="field-help profile-help">{field.help}</span>}
                      <select value={value || ''} onChange={(event) => setPreferences((prev) => setNegotiationField(prev, section.id, field.id, event.target.value || undefined))}>
                        <option value="" disabled hidden>Choose an option</option>
                        {(field.options || []).map((option) => <option value={option.id} key={option.id}>{option.label}</option>)}
                      </select>
                    </label>
                  )
                }

                return null
              })}
            </div>
          </article>
        ))}
      </div>

      <p className="profile-footnote">Profile answers are setup information, not kink scores. You can edit them later from the test sidebar.</p>
    </section>
  )
}
