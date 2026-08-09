import { ExtensibleMultiSelect, MatrixQuestion, ScaleQuestion } from './PreferenceQuestions.jsx'
import { negotiationFieldValue, negotiationModel, negotiationPreferenceSummary, setNegotiationField } from '../lib/negotiation.js'

function fieldIsVisible(field, sectionPreferences = {}) {
  const rule = field.showWhen
  if (!rule) return true
  const current = sectionPreferences?.[rule.field]
  const selected = Array.isArray(current) ? current : (Array.isArray(current?.selected) ? current.selected : [])
  if (rule.operator === 'equals') return current === rule.value
  if (rule.operator === 'present') {
    if (Array.isArray(current)) return current.length > 0
    if (current && typeof current === 'object') return selected.length > 0 || Boolean(current.note?.trim?.()) || Boolean(current.otherText?.trim?.())
    return current !== undefined && current !== null && current !== ''
  }
  if (rule.operator === 'contains') return selected.includes(rule.value)
  if (rule.operator === 'containsAny') return (rule.values || []).some((value) => selected.includes(value))
  return true
}

export default function NegotiationPreferences({
  catalog,
  preferences,
  setPreferences,
  setupMode = false,
  sectionIds = ['communication', 'stop_checkin', 'aftercare', 'partner_context'],
  heading = 'Negotiation & care',
  description = 'Set broad preferences that can be useful across many situations. More specific boundaries, such as recording or public/semi-public contexts, appear only inside related topics.',
  setupStep = '2 of 3',
  footnote = 'These are broad defaults, not rules for every topic. A more specific boundary you set later takes precedence.',
  standaloneSection = false,
}) {
  const model = negotiationModel(catalog)
  const allowedSections = new Set(sectionIds)
  const visibleSections = (model.sections || []).filter((section) => !section.pretestOnly && allowedSections.has(section.id))
  const fullSummary = negotiationPreferenceSummary(catalog, preferences, { includePretestOnly: false })
  const summarySections = fullSummary.sections.filter((section) => allowedSections.has(section.id))
  const answeredFields = summarySections.reduce((count, section) => count + section.fields.length, 0)

  const update = (sectionId, fieldId, value) => setPreferences((prev) => setNegotiationField(prev, sectionId, fieldId, value))

  return (
    <section className="negotiation-page" aria-labelledby="negotiation-heading">
      <header className="category-intro negotiation-intro">
        <div>
          <span className="kicker">{setupMode ? `Step ${setupStep}` : 'Your setup'}</span>
          <h1 id="negotiation-heading">{heading}</h1>
          <p>{description}</p>
        </div>
        <div className="category-stat"><strong>{answeredFields}</strong><span>answered</span></div>
      </header>

      <div className={`negotiation-section-grid ${standaloneSection ? 'standalone-negotiation-section' : ''}`}>
        {visibleSections.map((section) => (
          <article className={`negotiation-card negotiation-card-${section.id}`} key={section.id}>
            {!standaloneSection && (
              <div className="negotiation-card-heading">
                <h2>{section.label}</h2>
                <p>{section.description}</p>
              </div>
            )}
            <div className="negotiation-fields">
              {(section.fields || []).filter((field) => fieldIsVisible(field, preferences?.[section.id])).map((field) => {
                const value = negotiationFieldValue(preferences, section.id, field.id)

                if (field.type === 'multi_select') {
                  return <div className="negotiation-field" key={field.id}><ExtensibleMultiSelect field={field} value={value} onChange={(next) => update(section.id, field.id, next)} /></div>
                }

                if (field.type === 'scale') {
                  return <div className="negotiation-field" key={field.id}><ScaleQuestion field={field} value={value} onChange={(next) => update(section.id, field.id, next)} /></div>
                }

                if (field.type === 'matrix_scale') {
                  return <div className="negotiation-field matrix-negotiation-field" key={field.id}><MatrixQuestion field={field} value={value} onChange={(next) => update(section.id, field.id, next)} /></div>
                }

                if (field.type === 'single_select') {
                  return (
                    <label className="negotiation-field" key={field.id}>
                      <span className="field-label field-label-row"><span>{field.label}</span>{value && <button type="button" className="field-clear" onClick={(event) => { event.preventDefault(); update(section.id, field.id, undefined) }}>Clear</button>}</span>
                      {field.help && <span className="field-help preference-help">{field.help}</span>}
                      <select value={value || ''} onChange={(event) => update(section.id, field.id, event.target.value || undefined)}>
                        <option value="" disabled hidden>Choose an option</option>
                        {(field.options || []).map((option) => <option value={option.id} key={option.id}>{option.label}</option>)}
                      </select>
                    </label>
                  )
                }

                return (
                  <label className="negotiation-field" key={field.id}>
                    <span className="field-label">{field.label}</span>
                    <input type="text" value={value || ''} placeholder={field.placeholder || ''} onChange={(event) => update(section.id, field.id, event.target.value)} />
                  </label>
                )
              })}
            </div>
          </article>
        ))}
      </div>
      <p className="negotiation-footnote">{footnote}</p>
    </section>
  )
}
