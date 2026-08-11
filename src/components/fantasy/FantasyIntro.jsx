export default function FantasyIntro({ profile, fantasy, adultConfirmed, onAdultConfirmed, onStart, onResume, onResults, onActivity }) {
  const hasProgress = fantasy.status === 'in_progress' && Object.keys(fantasy.answers || {}).length > 0
  const isComplete = fantasy.status === 'complete'

  return (
    <main className="fantasy-shell fantasy-intro-shell">
      <section className="fantasy-intro-card">
        <div className="fantasy-brand-mark" aria-hidden="true">✦</div>
        <span className="kicker">Fantasy Profile</span>
        <h1>See what your fantasies have in common.</h1>
        <p className="fantasy-lede">You’ll react to a series of fantasies, then we’ll show you the themes and dynamics that came up most often. It usually takes about 10–15 minutes.</p>

        <div className="fantasy-reality-note">
          <strong>Answer for the fantasy itself.</strong>
          <p>You can be turned on by something in your head and never want it in real life. This is not a consent checklist, a diagnosis, or a label. If something does nothing for you — or you just don’t know — choose <em>Unsure / skip</em>.</p>
        </div>

        {!hasProgress && !isComplete && (
          <label className="fantasy-adult-confirmation">
            <input type="checkbox" checked={adultConfirmed} onChange={(event) => onAdultConfirmed(event.target.checked)} />
            <span>I’m an adult and I’m okay continuing with sexual and kink-related fantasy content.</span>
          </label>
        )}

        <div className="fantasy-intro-actions">
          {isComplete ? (
            <button type="button" className="primary-button large" onClick={onResults}>See my results</button>
          ) : hasProgress ? (
            <button type="button" className="primary-button large" onClick={onResume}>Keep going</button>
          ) : (
            <button type="button" className="primary-button large" disabled={!adultConfirmed} onClick={onStart}>Start Fantasy Profile</button>
          )}
          <button type="button" className="secondary-button large" onClick={onActivity}>I’d rather browse activities</button>
        </div>
        <p className="fine-print">Your answers stay in this browser unless you choose to export them. Nothing here changes your Activity Explorer answers.</p>
      </section>
    </main>
  )
}
