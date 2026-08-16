import { fantasySuggestionDetails } from '../../lib/fantasyResults.js'

function EmptyResult({ children }) {
  return <p className="fantasy-empty-result">{children}</p>
}

function RoleBreakdown({ direction }) {
  if (!direction?.roles?.length) return null
  return (
    <div className="fantasy-role-breakdown">
      {direction.roles.map((role) => (
        <div className={`fantasy-role-row${role.observations ? '' : ' is-unsampled'}`} key={role.key}>
          <div className="fantasy-role-row-heading">
            <span>{role.label}</span>
            <b>{role.strength}</b>
          </div>
          <div
            className="fantasy-role-track"
            role="meter"
            aria-label={`${role.label}: ${role.strength}`}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={role.position ?? 50}
          >
            {role.position !== null && <span className="fantasy-role-marker" style={{ left: `${role.position}%` }} />}
          </div>
        </div>
      ))}
      <div className="fantasy-role-axis" aria-hidden="true"><span>Turn-off</span><span>Neutral</span><span>Turn-on</span></div>
      {direction.summary && <p className="fantasy-role-summary">{direction.summary}</p>}
    </div>
  )
}

function ThemeGrid({ themes, onOpenTheme }) {
  if (!themes.length) return <EmptyResult>Nothing stood out clearly here. We’d rather leave it open than force a label onto mixed or skipped answers.</EmptyResult>
  return (
    <div className="fantasy-theme-grid">
      {themes.map((theme) => (
        <button type="button" className="fantasy-theme-card" key={theme.id} onClick={() => onOpenTheme(theme.id)}>
          <span className="fantasy-result-strength">{theme.band === 'strong' ? 'Came up strongly' : 'Came up more than once'}</span>
          <strong>{theme.label}</strong>
          <span>{theme.description}</span>
          <RoleBreakdown direction={theme.direction} />
          <span className="fantasy-card-link">Take a closer look →</span>
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
        <h1>Here’s what kept showing up.</h1>
        <p>These are patterns in what appealed to you as fantasy. They don’t tell you what you should want in real life, and they don’t set any boundaries for you.</p>
        <div className="fantasy-results-actions">
          <button type="button" className="primary-button" onClick={onActivity}>See related activities</button>
          <button type="button" className="secondary-button" onClick={onReview}>Review answers</button>
          <button type="button" className="text-button danger-text" onClick={onRestart}>Start over</button>
        </div>
      </header>

      <section className="fantasy-result-section">
        <div className="fantasy-section-number">1</div>
        <div className="fantasy-section-heading">
          <span className="kicker">What seems to matter most</span>
          <h2>The feelings behind the fantasy</h2>
          <p>These are the emotional pulls that showed up most consistently in your answers.</p>
        </div>
        <ThemeGrid themes={results.drivers} onOpenTheme={onOpenTheme} />
      </section>

      <section className="fantasy-result-section">
        <div className="fantasy-section-number">2</div>
        <div className="fantasy-section-heading">
          <span className="kicker">What keeps coming back</span>
          <h2>Recurring dynamics and setups</h2>
          <p>These are the kinds of situations or structures you responded to more than once.</p>
        </div>
        <ThemeGrid themes={results.patterns} onOpenTheme={onOpenTheme} />
      </section>

      <section className="fantasy-result-section">
        <div className="fantasy-section-number">3</div>
        <div className="fantasy-section-heading">
          <span className="kicker">Your role preferences</span>
          <h2>How the two sides compare</h2>
          <p>These are independent preferences. Liking one side does not reduce your score on the other, so both can be strong at the same time.</p>
        </div>
        {results.directions.length ? (
          <div className="fantasy-direction-list">
            {results.directions.map((row) => <p key={`${row.dimensionId}-${row.text}`}>{row.text}</p>)}
          </div>
        ) : <EmptyResult>No clear preference for one side of a dynamic stood out.</EmptyResult>}
      </section>

      <section className="fantasy-result-section">
        <div className="fantasy-section-number">4</div>
        <div className="fantasy-section-heading">
          <span className="kicker">Words you might want to look up</span>
          <h2>Kink areas that overlap with your results</h2>
          <p>These are possible directions for further exploring, not labels we’re assigning to you.</p>
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
                    <summary>Why this showed up</summary>
                    <div className="fantasy-why-content">
                      {suggestion.why.length > 0 && (
                        <ul>{suggestion.why.map((reason) => <li key={reason}>{reason.charAt(0).toUpperCase() + reason.slice(1)}.</li>)}</ul>
                      )}
                      {detail?.examples?.length > 0 && (
                        <div>
                          <strong>Answers that contributed</strong>
                          <ul className="fantasy-example-list">
                            {detail.examples.map((example) => <li key={example.questionId}>“{example.statement}”: {example.responseLabel}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </details>
                </article>
              )
            })}
          </div>
        ) : <EmptyResult>No particular kink area stood out strongly enough to suggest. That’s completely fine.</EmptyResult>}
      </section>
    </main>
  )
}
