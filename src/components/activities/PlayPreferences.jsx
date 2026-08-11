const FIELDS = [
  ['communication', 'Talking about it', 'How do you like to talk about activities, boundaries, or changes?'],
  ['checkIns', 'Check-ins', 'What kind of check-ins feel good before, during, or after?'],
  ['stopSignals', 'Stop / pause signals', 'Any words, signals, or habits you want to use for slowing down or stopping?'],
  ['aftercare', 'Aftercare', 'What helps you feel good afterward?'],
  ['marksAfterEffects', 'Marks and after-effects', 'Anything you want to avoid or allow around marks, soreness, or other after-effects?'],
  ['partnerContext', 'Who / when / where', 'Does familiarity, relationship context, privacy, or setting change what feels okay?'],
  ['other', 'Anything else', 'Anything else you’d want a partner to know before you start?'],
]

export default function PlayPreferences({ values, onChange, onBack }) {
  return (
    <main className="activity-shell activity-settings-shell">
      <header className="activity-page-header"><div><span className="kicker">Activity Explorer</span><h1>Play Preferences</h1><p>Keep notes about the things that matter across lots of activities — how you communicate, stop, check in, recover, and set the scene. These notes don’t change any activity answer.</p></div><button type="button" className="secondary-button" onClick={onBack}>Back to activities</button></header>
      <section className="activity-settings-card">
        {FIELDS.map(([id, label, placeholder]) => (
          <label key={id} className="activity-setting-field"><span>{label}</span><textarea rows="3" value={values[id] || ''} placeholder={placeholder} onChange={(event) => onChange({ [id]: event.target.value })} /></label>
        ))}
      </section>
    </main>
  )
}
