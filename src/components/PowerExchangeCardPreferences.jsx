import { useState } from 'react'
import { inheritedPowerExchangeSummary, powerExchangeConceptSide, powerExchangeModel } from '../lib/powerExchange.js'

function OptionButtons({ options = [], value, onChange, multi = false }) {
  const selected = new Set(multi ? (Array.isArray(value) ? value : []) : value ? [value] : [])
  const toggle = (id) => {
    if (!multi) return onChange(value === id ? undefined : id)
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange([...next])
  }
  return (
    <div className="choice-chips compact-power-exchange-chips">
      {options.map((option) => (
        <button type="button" className={`chip ${selected.has(option.id) ? 'selected' : ''}`} aria-pressed={selected.has(option.id)} onClick={() => toggle(option.id)} key={option.id}>{option.label}</button>
      ))}
    </div>
  )
}

export default function PowerExchangeCardPreferences({ catalog, concept, perspective, preferences = {}, answer = {}, update }) {
  const [open, setOpen] = useState(Boolean(answer?.details?.powerExchangeOverride))
  const model = powerExchangeModel(catalog)
  const override = answer?.details?.powerExchangeOverride || {}
  const summary = inheritedPowerExchangeSummary(catalog, preferences)
  const side = powerExchangeConceptSide({ ...concept, perspectives: [perspective] })
  const styleOptions = side === 'dominant'
    ? model.dynamicStyles?.dominant
    : side === 'submissive'
      ? model.dynamicStyles?.submissive
      : [...(model.dynamicStyles?.dominant || []), ...(model.dynamicStyles?.submissive || [])]
        .filter((option, index, all) => all.findIndex((row) => row.id === option.id) === index)

  const patchOverride = (key, value) => {
    const nextOverride = { ...override }
    if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) delete nextOverride[key]
    else nextOverride[key] = value
    const details = { ...(answer?.details || {}) }
    if (Object.keys(nextOverride).length) details.powerExchangeOverride = nextOverride
    else delete details.powerExchangeOverride
    update({ ...answer, details })
  }

  const useUsual = () => {
    const details = { ...(answer?.details || {}) }
    delete details.powerExchangeOverride
    update({ ...answer, details })
    setOpen(false)
  }

  return (
    <div className="power-exchange-inheritance">
      <div className="power-exchange-inheritance-row">
        <div>
          <strong>{answer?.details?.powerExchangeOverride ? 'Customized for this interest' : 'Use my usual Power Exchange preferences ✓'}</strong>
          <span>{answer?.details?.powerExchangeOverride ? 'Only the choices below override your usual defaults.' : (summary || 'Set defaults at the top of this section, or customize only this interest.')}</span>
        </div>
        <button type="button" className="text-button" onClick={() => setOpen((value) => !value)}>{open ? 'Close' : 'Customize for this interest'}</button>
      </div>
      {open && (
        <div className="power-exchange-override-fields">
          <div className="detail-field">
            <div className="detail-field-heading"><strong>Style for this interest</strong></div>
            <OptionButtons options={styleOptions} value={override.styles} multi onChange={(value) => patchOverride('styles', value)} />
          </div>
          <div className="detail-field">
            <div className="detail-field-heading"><strong>Structure for this interest</strong></div>
            <OptionButtons options={model.structureOptions} value={override.structure} onChange={(value) => patchOverride('structure', value)} />
          </div>
          <div className="detail-field">
            <div className="detail-field-heading"><strong>When it applies for this interest</strong></div>
            <OptionButtons options={model.timingOptions} value={override.timing} multi onChange={(value) => patchOverride('timing', value)} />
          </div>
          <div className="detail-field">
            <div className="detail-field-heading"><strong>Where it applies for this interest</strong></div>
            <OptionButtons options={model.settingOptions} value={override.settings} multi onChange={(value) => patchOverride('settings', value)} />
          </div>
          {answer?.details?.powerExchangeOverride && <button type="button" className="field-clear" onClick={useUsual}>Reset to my usual preferences</button>}
        </div>
      )}
    </div>
  )
}
