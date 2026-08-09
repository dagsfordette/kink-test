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
          <strong>{answer?.details?.powerExchangeOverride ? 'Different choices for this interest' : 'Using my general Power Exchange choices ✓'}</strong>
          <span>{answer?.details?.powerExchangeOverride ? 'Only the choices below are different here.' : (summary || 'Choose your general Power Exchange preferences above, or make different choices for this interest.')}</span>
        </div>
        <button type="button" className="text-button" onClick={() => setOpen((value) => !value)}>{open ? 'Close' : 'Choose differently for this interest'}</button>
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
            <div className="detail-field-heading"><strong>How much of life this interest can cover</strong></div>
            <OptionButtons options={model.lifeScopeOptions} value={override.lifeScope} onChange={(value) => patchOverride('lifeScope', value)} />
          </div>
          <div className="detail-field">
            <div className="detail-field-heading"><strong>Can it continue while apart / remote?</strong></div>
            <OptionButtons options={model.remoteAuthorityOptions} value={override.remoteAuthority} onChange={(value) => patchOverride('remoteAuthority', value)} />
          </div>
          <div className="detail-field">
            <div className="detail-field-heading"><strong>Where it applies for this interest</strong></div>
            <OptionButtons options={model.settingOptions} value={override.settings} multi onChange={(value) => patchOverride('settings', value)} />
          </div>
          {answer?.details?.powerExchangeOverride && <button type="button" className="field-clear" onClick={useUsual}>Use my general choices</button>}
        </div>
      )}
    </div>
  )
}
