export default function Home({
  fantasy,
  activities,
  onFantasy,
  onActivities,
  onFantasyResults,
  onActivityResults,
  onProfile
}) {
  const fantasyAnswered = (fantasy.questionSequence || []).filter((id) =>
    Object.prototype.hasOwnProperty.call(fantasy.answers || {}, id)
  ).length
  const activityAnswered = Object.keys(activities.answers || {}).length
  const fantasyComplete = fantasy.status === 'complete'
  const fantasyInProgress =
    fantasy.status === 'in_progress' && fantasyAnswered > 0

  const fantasyAction = fantasyComplete
    ? 'See my fantasy results'
    : fantasyInProgress
      ? 'Keep going'
      : 'Start with fantasy'
  const activityAction = activityAnswered
    ? 'Keep sorting activities'
    : 'Explore activities'

  return (
    <main className="product-home-shell">
      <section className="product-home-hero">
        <span className="kicker">Kink Exploration</span>
        <h1>Not sure what you’re into? Start there.</h1>
        <p>
          Use Fantasy Profile if you’re still figuring out what catches your
          attention. Use Activity Explorer to learn about specific activities and
          discover what you’d want, might try, or definitely don’t want.
        </p>
      </section>

      <section className="product-path-grid" aria-label="Exploration paths">
        <article className="product-path-card fantasy-path-card">
          <div className="product-path-icon" aria-hidden="true">
            ✦
          </div>
          <div>
            <span className="kicker">I’m still figuring it out</span>
            <h2>Fantasy Profile</h2>
            <p>
              React to a series of fantasies and see what keeps showing up — the
              feelings, dynamics, and themes you seem to respond to most.
            </p>
          </div>
          <div className="product-path-meta">
            <strong>About 10–15 minutes</strong>
            <span>
              A good place to start if you don’t know the vocabulary yet, or
              you’re curious about what sits underneath the things you already
              like.
            </span>
          </div>
          <div className="product-card-actions">
            <button
              type="button"
              className="primary-button"
              onClick={fantasyComplete ? onFantasyResults : onFantasy}
            >
              {fantasyAction}
            </button>
            {fantasyComplete && (
              <button type="button" className="text-button" onClick={onFantasy}>
                Review or change answers
              </button>
            )}
          </div>
        </article>

        <article className="product-path-card activity-path-card">
          <div className="product-path-icon" aria-hidden="true">
            ◇
          </div>
          <div>
            <span className="kicker">Explore specific activities</span>
            <h2>Activity Explorer</h2>
            <p>
              Go through specific activities and mark where you stand: love it,
              want it, curious, not for me, or a limit. Add experience and
              conditions when they matter.
            </p>
          </div>
          <div className="product-path-meta">
            <strong>Go at your own pace</strong>
            <span>
              {fantasyComplete
                ? 'Your Fantasy Profile can give you a few places to look first.'
                : 'Explore one activity at a time, with examples when you need them. You do not need to do Fantasy Profile first.'}
            </span>
          </div>
          <div className="product-card-actions">
            <button
              type="button"
              className="primary-button"
              onClick={onActivities}
            >
              {activityAction}
            </button>
            {activityAnswered > 0 && (
              <button
                type="button"
                className="secondary-button"
                onClick={onActivityResults}
              >
                See where I landed
              </button>
            )}
          </div>
        </article>
      </section>

      {(fantasyComplete || activityAnswered > 0) && (
        <section className="product-profile-callout">
          <div>
            <span className="kicker">Your profile</span>
            <h2>See everything you’ve learned in one place.</h2>
            <p>
              Your fantasy results and your real-life answers can sit side by
              side without having to match. My Profile shows both, plus the
              parts you can save or share.
            </p>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={onProfile}
          >
            Open My Profile
          </button>
        </section>
      )}
    </main>
  )
}
