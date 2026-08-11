export default function ActivityIntro({ catalog, activity, fantasyComplete, adultConfirmed, onAdultConfirmed, onStart, onResults, onFantasy }) {
  const answeredCount = Object.keys(activity.answers || {}).length
  const hasProgress = answeredCount > 0

  return (
    <main className="activity-shell activity-intro-shell">
      <section className="activity-intro-card">
        <div className="activity-brand-mark" aria-hidden="true">◇</div>
        <span className="kicker">Activity Explorer</span>
        <h1>Sort out your yes, maybe, and no.</h1>
        <p className="activity-lede">Go through specific activities and mark how you feel about them today. Add experience, conditions, or a note when it helps. You can stop and come back whenever you want.</p>

        <div className="activity-scale-grid">
          {catalog.stanceScale.map((row) => (
            <div key={row.id} className={`activity-scale-item stance-${row.id}`}>
              <strong>{row.label}</strong>
              <span>{row.meaning}</span>
            </div>
          ))}
        </div>

        <div className="activity-intro-notes">
          <p><strong>Use limits for real-life boundaries.</strong> A soft limit means “only under certain conditions.” A hard limit means “no.”</p>
          <p><strong>Experience is a separate question.</strong> You can have tried something and not want it again, or want something you’ve never tried.</p>
          <p><strong>{fantasyComplete ? 'Want a place to start?' : 'You can start here.'}</strong> {fantasyComplete ? 'Your Fantasy Profile can suggest a few activities to look at first, but you still answer every activity for yourself.' : 'You do not need to complete Fantasy Profile before using Activity Explorer.'}</p>
        </div>

        {!adultConfirmed && (
          <label className="fantasy-adult-confirmation">
            <input type="checkbox" checked={adultConfirmed} onChange={(event) => onAdultConfirmed(event.target.checked)} />
            <span>I’m an adult and I’m okay continuing with sexual and kink-related activity content.</span>
          </label>
        )}

        <div className="activity-intro-actions">
          <button type="button" className="primary-button large" disabled={!adultConfirmed} onClick={onStart}>
            {hasProgress ? `Keep going (${answeredCount} answered)` : 'Browse activities'}
          </button>
          {hasProgress && <button type="button" className="secondary-button large" onClick={onResults}>See where I landed</button>}
          <button type="button" className="text-button" onClick={onFantasy}>Try Fantasy Profile instead</button>
        </div>
        <p className="fine-print">Your answers stay in this browser unless you choose to export them. There is no compatibility score and no “right” way for your list to look.</p>
      </section>
    </main>
  )
}
