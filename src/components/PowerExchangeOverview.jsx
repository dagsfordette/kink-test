import {
  patchPowerExchangePreference,
  powerExchangeModel,
  shouldShowExtendedPowerExchange,
  togglePowerExchangeMulti,
} from '../lib/powerExchange.js'

function SingleChips({ label, options = [], value, onChange, help }) {
  return (
    <fieldset className="power-exchange-field">
      <legend className="field-label">{label}</legend>
      {help && <p className="field-help preference-help">{help}</p>}
      <div className="choice-chips power-exchange-chips" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button
            type="button"
            role="radio"
            aria-checked={value === option.id}
            className={`chip ${value === option.id ? 'selected' : ''}`}
            onClick={() => onChange(value === option.id ? undefined : option.id)}
            key={option.id}
          >{option.label}</button>
        ))}
      </div>
    </fieldset>
  )
}

function MultiChips({ label, options = [], selected = [], onToggle, help }) {
  const selectedSet = new Set(selected || [])
  return (
    <fieldset className="power-exchange-field">
      <legend className="field-label">{label}</legend>
      {help && <p className="field-help preference-help">{help}</p>}
      <div className="choice-chips power-exchange-chips" aria-label={label}>
        {options.map((option) => (
          <button
            type="button"
            className={`chip ${selectedSet.has(option.id) ? 'selected' : ''}`}
            aria-pressed={selectedSet.has(option.id)}
            onClick={() => onToggle(option.id)}
            key={option.id}
          >{option.label}</button>
        ))}
      </div>
    </fieldset>
  )
}

export default function PowerExchangeOverview({ catalog, preferences = {}, setPreferences }) {
  const model = powerExchangeModel(catalog)
  const update = (key, value) => setPreferences((prev) => patchPowerExchangePreference(catalog, prev, key, value))
  const toggle = (key, optionId) => setPreferences((prev) => togglePowerExchangeMulti(catalog, prev, key, optionId))
  const role = preferences.roleOrientation
  const showDominantStyle = !role || ['dominant', 'switch', 'exploring'].includes(role)
  const showSubmissiveStyle = !role || ['submissive', 'switch', 'exploring'].includes(role)
  const extended = shouldShowExtendedPowerExchange(catalog, preferences)

  return (
    <section className="power-exchange-overview" aria-labelledby="power-exchange-overview-heading">
      <div className="power-exchange-section-heading">
        <span className="kicker">Your Power Exchange defaults</span>
        <h2 id="power-exchange-overview-heading">Set the dynamic once, then explore specific interests</h2>
        <p>These answers describe your usual Power Exchange context. Individual interests inherit them unless you choose to customize a card.</p>
      </div>

      <div className="power-exchange-overview-grid">
        <article className="power-exchange-preference-card">
          <h3>Role / orientation</h3>
          <SingleChips
            label="Which role appeals to you most as an orientation?"
            options={model.roleOptions}
            value={role}
            onChange={(value) => update('roleOrientation', value)}
            help="This helps organize the questions. It never prevents you from exploring interests associated with another role."
          />
          {role === 'switch' && (
            <SingleChips
              label="Where do you tend to land as a switch?"
              options={model.switchLeanOptions}
              value={preferences.switchLean}
              onChange={(value) => update('switchLean', value)}
            />
          )}
        </article>

        <article className="power-exchange-preference-card">
          <h3>How should it feel?</h3>
          {showDominantStyle && (
            <MultiChips
              label="Dominant-side styles that appeal"
              options={model.dynamicStyles?.dominant}
              selected={preferences.dominantStyles}
              onToggle={(id) => toggle('dominantStyles', id)}
            />
          )}
          {showSubmissiveStyle && (
            <MultiChips
              label="Submissive-side styles that appeal"
              options={model.dynamicStyles?.submissive}
              selected={preferences.submissiveStyles}
              onToggle={(id) => toggle('submissiveStyles', id)}
            />
          )}
        </article>

        <article className="power-exchange-preference-card power-exchange-preference-card-wide">
          <h3>Scope & structure</h3>
          <SingleChips
            label="How structured do you usually want Power Exchange to be?"
            options={model.structureOptions}
            value={preferences.structure}
            onChange={(value) => update('structure', value)}
          />
          <MultiChips
            label="When can the authority be active?"
            options={model.timingOptions}
            selected={preferences.timing}
            onToggle={(id) => toggle('timing', id)}
            help="Timing is separate from how formal or broad the dynamic is."
          />
          <MultiChips
            label="Where can it apply?"
            options={model.settingOptions}
            selected={preferences.settings}
            onToggle={(id) => toggle('settings', id)}
          />
          <MultiChips
            label="Which parts of life could it affect?"
            options={model.domainOptions}
            selected={preferences.domains}
            onToggle={(id) => toggle('domains', id)}
          />
          <SingleChips
            label="How much decision-making authority appeals to you?"
            options={model.authorityOptions}
            value={preferences.authorityLevel}
            onChange={(value) => update('authorityLevel', value)}
            help="Broad authority and high structure are independent. You can prefer one without the other."
          />
          {extended && <div className="power-exchange-extended-hint">Your answers indicate that ongoing or extended dynamics may be relevant, so that subsection is available below.</div>}
        </article>
      </div>
    </section>
  )
}

export function PowerExchangeCare({ catalog, preferences = {}, setPreferences }) {
  const model = powerExchangeModel(catalog)
  const toggle = (key, optionId) => setPreferences((prev) => togglePowerExchangeMulti(catalog, prev, key, optionId))
  return (
    <section className="power-exchange-care" aria-labelledby="power-exchange-care-heading">
      <div className="power-exchange-section-heading">
        <span className="kicker">Negotiation, boundaries & care</span>
        <h2 id="power-exchange-care-heading">Keep the agreement clearer than the roleplay</h2>
        <p>These are Power Exchange-specific defaults. Your general stop/check-in and aftercare preferences remain in the main Negotiation & care section.</p>
      </div>
      <div className="power-exchange-care-grid">
        <article className="power-exchange-preference-card">
          <MultiChips
            label="Agreement practices that appeal to you"
            options={model.agreementOptions}
            selected={preferences.agreementPreferences}
            onToggle={(id) => toggle('agreementPreferences', id)}
          />
        </article>
        <article className="power-exchange-preference-card">
          <MultiChips
            label="Situations that should automatically pause or narrow authority"
            options={model.pauseConditionOptions}
            selected={preferences.automaticPauseConditions}
            onToggle={(id) => toggle('automaticPauseConditions', id)}
          />
        </article>
      </div>
    </section>
  )
}
