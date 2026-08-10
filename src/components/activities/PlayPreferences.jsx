const FIELDS = [
  ['communication', 'Communication preferences', 'How do you prefer to discuss activities, boundaries, and changes?'],
  ['checkIns', 'Check-ins', 'What kind of check-ins work for you before, during, or after play?'],
  ['stopSignals', 'Stop signals', 'Any reusable stop/pause signal preferences you want to remember?'],
  ['aftercare', 'Aftercare', 'What kinds of aftercare or decompression tend to help?'],
  ['marksAfterEffects', 'Marks / after-effects', 'Preferences around visible marks, soreness, or other after-effects.'],
  ['partnerContext', 'Partner familiarity / context', 'Anything about partner familiarity, relationship context, or setting that commonly matters?'],
  ['other', 'Other reusable preferences', 'Anything else you want available for future negotiation.'],
]

export default function PlayPreferences({ values, onChange, onBack }) {
  return (
    <main className="activity-shell activity-settings-shell">
      <header className="activity-page-header"><div><span className="kicker">Activity Explorer</span><h1>Play Preferences</h1><p>Optional reusable negotiation and setup preferences. These do not create or change any activity stance.</p></div><button type="button" className="secondary-button" onClick={onBack}>Back to activities</button></header>
      <section className="activity-settings-card">
        {FIELDS.map(([id, label, placeholder]) => (
          <label key={id} className="activity-setting-field"><span>{label}</span><textarea rows="3" value={values[id] || ''} placeholder={placeholder} onChange={(event) => onChange({ [id]: event.target.value })} /></label>
        ))}
      </section>
    </main>
  )
}
