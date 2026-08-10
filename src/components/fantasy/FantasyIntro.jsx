export default function FantasyIntro({ profile, fantasy, adultConfirmed, onAdultConfirmed, onStart, onResume, onResults, onActivity }) {
  const hasProgress = fantasy.status === 'in_progress' && Object.keys(fantasy.answers || {}).length > 0
  const isComplete = fantasy.status === 'complete'

  return (
    <main className="fantasy-shell fantasy-intro-shell">
      <section className="fantasy-intro-card">
        <div className="fantasy-brand-mark" aria-hidden="true">✦</div>
        <span className="kicker">Fantasy Profile</span>
        <h1>Explore what turns your imagination on.</h1>
        <p className="fantasy-lede">A private, reflective questionnaire about fantasies, emotions, roles, and erotic themes. About 10–15 minutes.</p>

        <div className="fantasy-reality-note">
          <strong>Rate the fantasy, not the reality.</strong>
          <p>Fantasy does not equal consent, intent, morality, identity, or a real-world plan. Some statements may be intense, unrealistic, frightening, taboo, or impossible. You can choose <em>Unsure / skip</em> at any time.</p>
        </div>

        {!hasProgress && !isComplete && (
          <label className="fantasy-adult-confirmation">
            <input type="checkbox" checked={adultConfirmed} onChange={(event) => onAdultConfirmed(event.target.checked)} />
            <span>I confirm that I am an adult and want to continue with adult-only fantasy content.</span>
          </label>
        )}

        <div className="fantasy-intro-actions">
          {isComplete ? (
            <button type="button" className="primary-button large" onClick={onResults}>View fantasy profile</button>
          ) : hasProgress ? (
            <button type="button" className="primary-button large" onClick={onResume}>Continue fantasy profile</button>
          ) : (
            <button type="button" className="primary-button large" disabled={!adultConfirmed} onClick={onStart}>Discover my fantasy profile</button>
          )}
          <button type="button" className="secondary-button large" onClick={onActivity}>Open Activity Explorer</button>
        </div>
        <p className="fine-print">Your answers stay in this browser. Fantasy Profile does not set Activity Explorer answers or real-world boundaries.</p>
      </section>
    </main>
  )
}
