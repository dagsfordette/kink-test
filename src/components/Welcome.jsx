export default function Welcome({ settings, setSettings, onStart, onImport }) {
  return (
    <main className="welcome-page">
      <section className="welcome-panel">
        <div className="brand-mark" aria-hidden="true">◇</div>
        <span className="kicker">Private self-exploration prototype</span>
        <h1>A nuanced kink inventory that stays on your device.</h1>
        <p className="lede">
          Explore interests, experience, willingness, boundaries, and details separately. Your answers are stored only in this browser unless you explicitly export them.
        </p>

        <div className="privacy-card">
          <div><strong>Local first</strong><span>No account or server required.</span></div>
          <div><strong>Adaptive</strong><span>Uninteresting branches can stay collapsed.</span></div>
          <div><strong>Portable</strong><span>Export JSON or a print-ready PDF report.</span></div>
        </div>

        <div className="welcome-controls">
          <label>
            <span className="field-label">How detailed should the inventory be?</span>
            <select value={settings.mode} onChange={(e) => setSettings({ ...settings, mode: e.target.value })}>
              <option value="quick">Short — the main questions</option>
              <option value="standard">Detailed — broad coverage</option>
              <option value="exhaustive">Everything — include niche and specialized questions</option>
            </select>
          </label>

          <p className="mode-help">
            You can still open more questions inside any topic later, so this only sets the starting amount.
          </p>

          <label className="consent-check">
            <input
              type="checkbox"
              checked={settings.adultConfirmed}
              onChange={(e) => setSettings({ ...settings, adultConfirmed: e.target.checked })}
            />
            <span>I confirm I am 18 or older. All activities in this inventory assume informed consent between adults; this is a self-assessment, not a medical or psychological diagnosis.</span>
          </label>
        </div>

        <div className="welcome-actions">
          <button type="button" className="primary-button large" disabled={!settings.adultConfirmed} onClick={onStart}>Start inventory</button>
          <button type="button" className="secondary-button large" onClick={onImport}>Import previous JSON</button>
        </div>

        <p className="fine-print">Some higher-risk practices appear as preference labels. The prototype deliberately does not provide instructions for performing them.</p>
      </section>
    </main>
  )
}
