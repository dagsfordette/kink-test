import { fantasySuggestionDetails } from '../../lib/fantasyResults.js'

function EmptyResult({ children }) {
  return <p className="fantasy-empty-result">{children}</p>
}

function ThemeGrid({ themes, onOpenTheme }) {
  if (!themes.length) return <EmptyResult>No clear positive pattern stood out here yet. Mixed and skipped answers are left uninterpreted rather than forced into a label.</EmptyResult>
  return (
    <div className="fantasy-theme-grid">
      {themes.map((theme) => (
        <button type="button" className="fantasy-theme-card" key={theme.id} onClick={() => onOpenTheme(theme.id)}>
          <span className="fantasy-result-strength">{theme.band === 'strong' ? 'Strong pattern' : 'Notable pattern'}</span>
          <strong>{theme.label}</strong>
          <span>{theme.description}</span>
          <span className="fantasy-card-link">Explore theme →</span>
        </button>
      ))}
    </div>
  )
}

export default function FantasyResults({ profile, answers, results, onOpenTheme, onReview, onRestart, onActivity }) {
  return (
    <main className="fantasy-shell fantasy-results-shell">
      <header className="fantasy-results-hero">
        <span className="kicker">Fantasy Profile</span>
        <h1>Your imagination has patterns. They are not instructions.</h1>
        <p>These results describe what drew a positive response in fantasy. They do not determine consent, identity, willingness, diagnosis, or what you should do in real life.</p>
        <div className="fantasy-results-actions">
          <button type="button" className="primary-button" onClick={onActivity}>Explore real-world activities</button>
          <button type="button" className="secondary-button" onClick={onReview}>Review answers</button>
          <button type="button" className="text-button danger-text" onClick={onRestart}>Restart profile</button>
        </div>
      </header>

      <section className="fantasy-result-section">
        <div className="fantasy-section-number">1</div>
        <div className="fantasy-section-heading">
          <span className="kicker">What seems to drive your fantasies</span>
          <h2>Emotional and motivational drivers</h2>
          <p>The strongest supported signals underneath the scenarios you responded to.</p>
        </div>
        <ThemeGrid themes={results.drivers} onOpenTheme={onOpenTheme} />
      </section>

      <section className="fantasy-result-section">
        <div className="fantasy-section-number">2</div>
        <div className="fantasy-section-heading">
          <span className="kicker">Patterns you respond to</span>
          <h2>Recurring fantasy motifs</h2>
          <p>Structures and scenario patterns that repeatedly carried positive charge.</p>
        </div>
        <ThemeGrid themes={results.patterns} onOpenTheme={onOpenTheme} />
      </section>

      <section className="fantasy-result-section">
        <div className="fantasy-section-number">3</div>
        <div className="fantasy-section-heading">
          <span className="kicker">Roles and directions</span>
          <h2>How direction changed the appeal</h2>
          <p>Only comparisons with enough evidence in both directions are shown.</p>
        </div>
        {results.directions.length ? (
          <div className="fantasy-direction-list">
            {results.directions.map((row) => <p key={`${row.dimensionId}-${row.text}`}>{row.text}</p>)}
          </div>
        ) : <EmptyResult>No stable directional contrast stood out strongly enough to summarize.</EmptyResult>}
      </section>

      <section className="fantasy-result-section">
        <div className="fantasy-section-number">4</div>
        <div className="fantasy-section-heading">
          <span className="kicker">These patterns sometimes connect to…</span>
          <h2>Possible vocabulary to explore</h2>
          <p>These are areas your themes may overlap with, not identities the profile assigns to you.</p>
        </div>
        {results.suggestions.length ? (
          <div className="fantasy-suggestion-list">
            {results.suggestions.map((suggestion) => {
              const detail = fantasySuggestionDetails(profile, answers, suggestion.id)
              return (
                <article className="fantasy-suggestion-card" key={suggestion.id}>
                  <h3>{suggestion.label}</h3>
                  <p>{suggestion.summary}</p>
                  <details>
                    <summary>Why am I seeing this?</summary>
                    <div className="fantasy-why-content">
                      {suggestion.why.length > 0 && (
                        <ul>{suggestion.why.map((reason) => <li key={reason}>{reason.charAt(0).toUpperCase() + reason.slice(1)}.</li>)}</ul>
                      )}
                      {detail?.examples?.length > 0 && (
                        <div>
                          <strong>Examples that contributed</strong>
                          <ul className="fantasy-example-list">
                            {detail.examples.map((example) => <li key={example.questionId}>“{example.statement}” — {example.responseLabel}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </details>
                </article>
              )
            })}
          </div>
        ) : <EmptyResult>No conventional kink area has enough positive evidence to suggest. That is a valid result.</EmptyResult>}
      </section>
    </main>
  )
}
