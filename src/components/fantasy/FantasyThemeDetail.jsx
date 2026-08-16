import { contributingAnswers, fantasyRoleBreakdown, kinkAreasForTheme, nearbyFantasyThemes } from '../../lib/fantasyResults.js'
import { describeFantasyDimension, scoreFantasyProfile } from '../../lib/fantasyProfile.js'

export default function FantasyThemeDetail({ profile, answers, dimensionId, onBack, onOpenTheme, onExploreMore }) {
  const theme = profile.dimensions.find((dimension) => dimension.id === dimensionId)
  if (!theme) return null
  const evidence = scoreFantasyProfile(profile, answers)[dimensionId]
  const summary = describeFantasyDimension(profile, dimensionId, answers)
  const examples = contributingAnswers(profile, answers, dimensionId, 6)
  const nearby = nearbyFantasyThemes(profile, dimensionId, answers, 4)
  const kinkAreas = kinkAreasForTheme(profile, answers, dimensionId)
  const direction = fantasyRoleBreakdown(profile, answers, dimensionId)
  const unansweredDeepDiveCount = profile.questions.filter((question) => question.stage === 'deep_dive' && !Object.prototype.hasOwnProperty.call(answers, question.id) && (question.signals?.some((signal) => signal.dimensionId === dimensionId) || question.parentDimensionId === dimensionId)).length

  return (
    <main className="fantasy-shell fantasy-detail-shell">
      <button type="button" className="text-button fantasy-back-link" onClick={onBack}>← Back to results</button>
      <section className="fantasy-detail-hero">
        <span className="kicker">A closer look</span>
        <h1>{theme.label}</h1>
        <p className="fantasy-detail-definition">{theme.description}</p>
        {evidence?.band !== 'insufficient' && <p className="fantasy-theme-summary">{summary}</p>}
      </section>

      <section className="fantasy-detail-section">
        <h2>What you responded to</h2>
        {examples.length ? (
          <div className="fantasy-statement-list">
            {examples.map((row) => (
              <div key={row.questionId}>
                <p>“{row.statement}”</p>
                <span>{row.responseLabel}</span>
              </div>
            ))}
          </div>
        ) : <p className="muted">Your answers here were mixed, neutral, or mostly skipped, so there isn’t a clear example to point to.</p>}
      </section>

      {direction?.roles?.length > 0 && (
        <section className="fantasy-detail-section">
          <h2>How each side landed</h2>
          <p className="muted">These scores are independent, so both sides can be strong at the same time.</p>
          <div className="fantasy-role-breakdown fantasy-role-breakdown-detail">
            {direction.roles.map((role) => (
              <div className={`fantasy-role-row${role.observations ? '' : ' is-unsampled'}`} key={role.key}>
                <div className="fantasy-role-row-heading"><span>{role.label}</span><b>{role.strength}</b></div>
                <div className="fantasy-role-track" role="meter" aria-label={`${role.label}: ${role.strength}`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={role.position ?? 50}>
                  {role.position !== null && <span className="fantasy-role-marker" style={{ left: `${role.position}%` }} />}
                </div>
              </div>
            ))}
            <div className="fantasy-role-axis" aria-hidden="true"><span>Turn-off</span><span>Neutral</span><span>Turn-on</span></div>
            {direction.summary && <p className="fantasy-role-summary">{direction.summary}</p>}
          </div>
        </section>
      )}

      {theme.searchTerms?.length > 0 && (
        <section className="fantasy-detail-section">
          <h2>Common terms</h2>
          <p>People may also use terms such as {theme.searchTerms.join(', ')}.</p>
        </section>
      )}

      {nearby.length > 0 && (
        <section className="fantasy-detail-section">
          <h2>Related themes</h2>
          <div className="fantasy-nearby-list">
            {nearby.map((row) => <button type="button" className="secondary-button" key={row.id} onClick={() => onOpenTheme(row.id)}>{row.label}</button>)}
          </div>
        </section>
      )}

      {kinkAreas.length > 0 && (
        <section className="fantasy-detail-section">
          <h2>Terms that sometimes overlap</h2>
          <div className="fantasy-kink-pills">
            {kinkAreas.map((row) => <span key={row.id}>{row.label}</span>)}
          </div>
          <p className="muted">Think of these as search terms, not identities.</p>
        </section>
      )}

      <section className="fantasy-more-card">
        <div>
          <span className="kicker">Optional</span>
          <h2>{unansweredDeepDiveCount ? 'Want to dig into this one?' : 'You’ve explored this theme'}</h2>
          <p>{unansweredDeepDiveCount ? 'Answer a few more fantasies that focus on this theme. They’ll be added only if you choose to continue.' : 'There aren’t any more follow-up questions for this theme right now.'}</p>
        </div>
        {unansweredDeepDiveCount > 0 && <button type="button" className="primary-button" onClick={() => onExploreMore(dimensionId)}>Ask me more</button>}
      </section>
    </main>
  )
}
