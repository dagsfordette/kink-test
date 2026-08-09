export default function Welcome({ settings, setSettings, onStart, onImport }) {
  return (
    <main className="welcome-page">
      <section className="welcome-panel">
        <div className="brand-mark" aria-hidden="true">◇</div>
        <span className="kicker">Private self-exploration prototype</span>
        <h1>Kink Exploration</h1>
        <p className="lede">
          A private space for adults to reflect on interests, curiosities, boundaries, and things they may want to discuss with a partner. You will move through topics at your own pace, and you can skip any question you do not want to answer.
        </p>

        <div className="privacy-card">
          <div><strong>Local first</strong><span>Your answers stay in this browser unless you deliberately export or share them.</span></div>
          <div><strong>Move at your pace</strong><span>Skip questions, leave optional setup blank, or explore a topic in more detail when it is useful.</span></div>
          <div><strong>Portable when you choose</strong><span>Export JSON or a print-ready PDF report if you want a copy.</span></div>
        </div>

        <div className="welcome-controls">
          <label>
            <span className="field-label">Choose how detailed you want your exploration to be.</span>
            <select value={settings.mode} onChange={(e) => setSettings({ ...settings, mode: e.target.value })}>
              <option value="quick">Short — the main questions</option>
              <option value="standard">Detailed — broad coverage</option>
              <option value="exhaustive">Everything — include niche and specialized questions</option>
            </select>
          </label>

          <p className="mode-help">
            You can open more questions inside any topic later, so this only sets the starting amount.
          </p>

          <label className="consent-check">
            <input
              type="checkbox"
              checked={settings.adultConfirmed}
              onChange={(e) => setSettings({ ...settings, adultConfirmed: e.target.checked })}
            />
            <span>I confirm I am 18 or older. All activities in this exploration assume informed consent between adults; this is a self-assessment, not a medical or psychological diagnosis.</span>
          </label>
        </div>

        <div className="welcome-actions">
          <button type="button" className="primary-button large" disabled={!settings.adultConfirmed} onClick={onStart}>Start exploring</button>
          <button type="button" className="secondary-button large" onClick={onImport}>Import previous JSON</button>
        </div>
      </section>
    </main>
  )
}
