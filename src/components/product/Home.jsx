export default function Home({ fantasy, activities, onFantasy, onActivities, onFantasyResults, onActivityResults, onProfile }) {
  const fantasyAnswered = Object.keys(fantasy.answers || {}).length
  const activityAnswered = Object.keys(activities.answers || {}).length
  const fantasyComplete = fantasy.status === 'complete'
  const fantasyInProgress = fantasy.status === 'in_progress' && fantasyAnswered > 0

  const fantasyAction = fantasyComplete ? 'View fantasy profile' : fantasyInProgress ? 'Continue fantasy profile' : 'Discover my fantasy profile'
  const activityAction = activityAnswered ? 'Continue exploring' : 'Start exploring activities'

  return (
    <main className="product-home-shell">
      <section className="product-home-hero">
        <span className="kicker">Kink Exploration</span>
        <h1>Discover yourself broadly. Explore reality precisely.</h1>
        <p>Two complementary tools, kept deliberately separate: one for private imagination and one for real-world interests, experience, conditions, and limits.</p>
      </section>

      <section className="product-path-grid" aria-label="Exploration paths">
        <article className="product-path-card fantasy-path-card">
          <div className="product-path-icon" aria-hidden="true">✦</div>
          <div>
            <span className="kicker">Private self-discovery</span>
            <h2>Fantasy Profile</h2>
            <p>Discover the themes, emotions, roles, and situations that turn your imagination on.</p>
          </div>
          <div className="product-path-meta">
            <strong>About 10–15 minutes</strong>
            <span>Fantasy only — this does not set real-world boundaries or consent.</span>
          </div>
          <div className="product-card-actions">
            <button type="button" className="primary-button" onClick={fantasyComplete ? onFantasyResults : onFantasy}>{fantasyAction}</button>
            {fantasyComplete && <button type="button" className="text-button" onClick={onFantasy}>Review or edit answers</button>}
          </div>
        </article>

        <article className="product-path-card activity-path-card">
          <div className="product-path-icon" aria-hidden="true">◇</div>
          <div>
            <span className="kicker">Real-world precision</span>
            <h2>Activity Explorer</h2>
            <p>Build a detailed real-world profile of activities you love, want, might explore, or consider a limit.</p>
          </div>
          <div className="product-path-meta">
            <strong>Detailed and open-ended</strong>
            <span>{fantasyComplete ? 'Personalized suggestions available from your Fantasy Profile.' : 'You can use Activity Explorer on its own.'}</span>
          </div>
          <div className="product-card-actions">
            <button type="button" className="primary-button" onClick={onActivities}>{activityAction}</button>
            {activityAnswered > 0 && <button type="button" className="secondary-button" onClick={onActivityResults}>View activity profile</button>}
          </div>
        </article>
      </section>

      {(fantasyComplete || activityAnswered > 0) && (
        <section className="product-profile-callout">
          <div><span className="kicker">Your combined view</span><h2>My Profile keeps fantasy and reality distinct.</h2><p>See both sets of results together, with neutral fantasy-to-reality observations and privacy-aware sharing controls.</p></div>
          <button type="button" className="secondary-button" onClick={onProfile}>Open My Profile</button>
        </section>
      )}
    </main>
  )
}
