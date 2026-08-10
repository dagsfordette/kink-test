export default function ActivityIntro({ catalog, activity, fantasyComplete, adultConfirmed, onAdultConfirmed, onStart, onResults, onFantasy }) {
  const answeredCount = Object.keys(activity.answers || {}).length
  const hasProgress = answeredCount > 0

  return (
    <main className="activity-shell activity-intro-shell">
      <section className="activity-intro-card">
        <div className="activity-brand-mark" aria-hidden="true">◇</div>
        <span className="kicker">Activity Explorer</span>
        <h1>Map what fits in real life.</h1>
        <p className="activity-lede">Build a detailed real-world profile of activities you love, want, might explore, or consider a limit. Work through it in as many sittings as you want.</p>

        <div className="activity-scale-grid">
          {catalog.stanceScale.map((row) => (
            <div key={row.id} className={`activity-scale-item stance-${row.id}`}>
              <strong>{row.label}</strong>
              <span>{row.meaning}</span>
            </div>
          ))}
        </div>

        <div className="activity-intro-notes">
          <p><strong>Limits belong here.</strong> Soft and hard limits are real-world stance states.</p>
          <p><strong>Experience is separate.</strong> You can be experienced with something you do not want, or love something you have not tried.</p>
          <p><strong>{fantasyComplete ? 'Personalized suggestions are available.' : 'Fantasy Profile is optional.'}</strong> Recommendations never pre-answer anything, and the full catalog always stays available.</p>
        </div>

        {!adultConfirmed && (
          <label className="fantasy-adult-confirmation">
            <input type="checkbox" checked={adultConfirmed} onChange={(event) => onAdultConfirmed(event.target.checked)} />
            <span>I confirm that I am an adult and want to continue with adult-only real-world activity content.</span>
          </label>
        )}

        <div className="activity-intro-actions">
          <button type="button" className="primary-button large" disabled={!adultConfirmed} onClick={onStart}>
            {hasProgress ? `Continue exploring (${answeredCount} answered)` : 'Start exploring activities'}
          </button>
          {hasProgress && <button type="button" className="secondary-button large" onClick={onResults}>View activity profile</button>}
          <button type="button" className="text-button" onClick={onFantasy}>Fantasy Profile</button>
        </div>
        <p className="fine-print">Your answers stay in this browser. Stance choices are not scores and are never averaged into a compatibility percentage.</p>
      </section>
    </main>
  )
}
