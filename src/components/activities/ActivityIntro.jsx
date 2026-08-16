export default function ActivityIntro({ catalog, activity, fantasyComplete, categorySuggestions = [], adultConfirmed, onAdultConfirmed, onStart, onResume, onResults, onFantasy }) {
  const answeredCount = Object.keys(activity.answers || {}).length
  const hasProgress = answeredCount > 0
  const suggestionByCategory = new Map(categorySuggestions.map((row) => [row.category.id, row]))
  const suggestedCategories = categorySuggestions.slice(0, 8).map((row) => row.category)
  const featuredSuggestedIds = new Set(suggestedCategories.map((category) => category.id))
  const otherCategories = catalog.categories.filter((category) => !featuredSuggestedIds.has(category.id))

  const categoryButton = (category, suggested = false) => {
    const suggestion = suggestionByCategory.get(category.id)
    return (
      <button
        type="button"
        key={category.id}
        className={`activity-entry-category ${suggested ? 'suggested' : ''}`}
        disabled={!adultConfirmed}
        onClick={() => onStart(category.id)}
      >
        <span className="activity-entry-category-topline">
          <strong>{category.label}</strong>
          {suggested && <em>Suggested</em>}
        </span>
        <span>{category.description}</span>
        {suggestion?.reason && <small>{suggestion.reason}</small>}
      </button>
    )
  }

  return (
    <main className="activity-shell activity-intro-shell">
      <section className="activity-intro-card activity-entry-card">
        <div className="activity-brand-mark" aria-hidden="true">◇</div>
        <span className="kicker">Activity Explorer</span>
        <h1>Where do you want to start?</h1>
        <p className="activity-lede">Pick any area that catches your attention. It only chooses your starting point — once you begin, you can keep moving through the rest of your current question path normally.</p>

        <div className="activity-intro-notes activity-entry-notes">
          <p><strong>Your answers are still yours.</strong> Fantasy Profile can shape what gets surfaced first, but it never decides whether an activity is a yes, maybe, no, or limit.</p>
          <p><strong>The first pass stays focused.</strong> {fantasyComplete && categorySuggestions.length > 0 ? 'Categories your Fantasy Profile does not currently point toward are tucked away at first.' : 'Nothing is hidden unless you choose to skip or hide it.'}</p>
          <p><strong>You can reveal everything.</strong> Search and “Show hidden / skipped things” always let you step outside the suggested path.</p>
        </div>

        {!adultConfirmed && (
          <label className="fantasy-adult-confirmation">
            <input type="checkbox" checked={adultConfirmed} onChange={(event) => onAdultConfirmed(event.target.checked)} />
            <span>I’m an adult and I’m okay continuing with sexual and kink-related activity content.</span>
          </label>
        )}

        {hasProgress && (
          <section className="activity-entry-resume">
            <div><span className="kicker">Already started</span><h2>{answeredCount} answered so far</h2><p>Continue exactly where you left off, without changing your current filters or adaptive path.</p></div>
            <div><button type="button" className="primary-button" disabled={!adultConfirmed} onClick={onResume}>Keep going</button><button type="button" className="text-button" onClick={onResults}>See my answers</button></div>
          </section>
        )}

        {fantasyComplete && suggestedCategories.length > 0 && (
          <section className="activity-entry-section">
            <div className="activity-entry-heading">
              <div><span className="kicker">Soft starting points</span><h2>Strongest matches from your Fantasy Profile</h2><p>These are good places to enter the second test, not conclusions about what you want in real life.</p></div>
              <button type="button" className="text-button" onClick={onFantasy}>Review Fantasy Profile</button>
            </div>
            <div className="activity-entry-grid">{suggestedCategories.map((category) => categoryButton(category, true))}</div>
          </section>
        )}

        <section className="activity-entry-section">
          <div className="activity-entry-heading">
            <div><span className="kicker">Choose any starting point</span><h2>{fantasyComplete && suggestedCategories.length > 0 ? 'Or start somewhere else' : 'What are you interested in looking at?'}</h2><p>Choosing a category starts there. It does not remove your ability to explore the rest later.</p></div>
            <button type="button" className="secondary-button compact" disabled={!adultConfirmed} onClick={() => onStart('all')}>Start with everything</button>
          </div>
          <div className="activity-entry-grid">{(fantasyComplete && suggestedCategories.length > 0 ? otherCategories : catalog.categories).map((category) => categoryButton(category, suggestionByCategory.has(category.id)))}</div>
        </section>

        <div className="activity-scale-grid activity-entry-scale">
          {catalog.stanceScale.map((row) => (
            <div key={row.id} className={`activity-scale-item stance-${row.id}`}>
              <strong>{row.label}</strong>
              <span>{row.meaning}</span>
            </div>
          ))}
        </div>

        <p className="fine-print">Your answers stay in this browser unless you choose to export them. There is no compatibility score and no “right” way for your list to look.</p>
      </section>
    </main>
  )
}
