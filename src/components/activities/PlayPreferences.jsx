import { PLAY_PREFERENCE_FIELDS } from '../../lib/playPreferences.js'

export default function PlayPreferences({ values, onChange, onBack }) {
  return (
    <main className="activity-shell activity-settings-shell">
      <header className="activity-page-header">
        <div>
          <span className="kicker">Activity Explorer</span>
          <h1>Play Preferences</h1>
          <p>
            Keep notes about the things that matter across lots of activities —
            how you communicate, stop, check in, recover, and set the scene.
            These notes don’t change any activity answer.
          </p>
        </div>
        <button type="button" className="secondary-button" onClick={onBack}>
          Back to activities
        </button>
      </header>
      <section className="activity-settings-card">
        {PLAY_PREFERENCE_FIELDS.map(([id, label, placeholder]) => (
          <label key={id} className="activity-setting-field">
            <span>{label}</span>
            <textarea
              rows="3"
              value={values[id] || ''}
              placeholder={placeholder}
              onChange={(event) => onChange({ [id]: event.target.value })}
            />
          </label>
        ))}
      </section>
    </main>
  )
}
