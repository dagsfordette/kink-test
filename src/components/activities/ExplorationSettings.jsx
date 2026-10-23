import { ANATOMY_FEATURES, bodyFactsFromSelection } from '../../lib/explorationState.js'
export function BodyFacts({ facts, onChange }) {
  const anatomy = facts.self.anatomy
  return (
    <fieldset className="body-anatomy-options">
      <legend>Which anatomy applies to you?</legend>
      <p>
        This helps hide activities that don’t fit your anatomy. Select any that
        apply, or leave both unselected to keep everything available. You can
        change your answers or show excluded activities later.
      </p>
      <div className="activity-detail-chips">
        {ANATOMY_FEATURES.map((feature) => (
          <label className="chip" key={feature}>
            <input
              type="checkbox"
              checked={anatomy[feature] === 'present'}
              onChange={() => onChange(bodyFactsFromSelection(
                ANATOMY_FEATURES.filter((id) =>
                  id === feature ? anatomy[id] !== 'present' : anatomy[id] === 'present'
                )
              ))}
            />
            {feature === 'penis' ? 'Penis' : 'Vagina'}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

