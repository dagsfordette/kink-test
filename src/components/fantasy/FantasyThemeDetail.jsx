import FantasySpecificAnswers from './FantasySpecificAnswers.jsx'
import {
  contributingAnswers,
  specificFantasyAnswers,
  fantasyRoleBreakdown,
  fantasyThemePresentation,
  kinkAreasForTheme,
  nearbyFantasyThemes
} from '../../lib/fantasyResults.js'
import {
  describeFantasyDimension,
  selectDeepDiveQuestions,
  scoreFantasyProfile
} from '../../lib/fantasyProfile.js'

export default function FantasyThemeDetail({
  profile,
  answers,
  dimensionId,
  onBack,
  onOpenTheme,
  onExploreMore
}) {
  const theme = fantasyThemePresentation(profile, dimensionId)
  if (!theme) return null
  const evidence = scoreFantasyProfile(profile, answers)[dimensionId]
  const summary = describeFantasyDimension(profile, dimensionId, answers)
  const examples = [...new Map(theme.dimensionIds.flatMap(
    (id) => contributingAnswers(profile, answers, id, 3)
  ).map((row) => [row.questionId, row])).values()]
  const nearby = [...new Map(theme.dimensionIds.flatMap(
    (id) => nearbyFantasyThemes(profile, id, answers, 4)
  ).map((row) => {
    const related = fantasyThemePresentation(profile, row.id)
    return [related.id, related]
  })).values()].filter((row) => row.id !== theme.id).slice(0, 4)
  const kinkAreas = [...new Map(theme.dimensionIds.flatMap(
    (id) => kinkAreasForTheme(profile, answers, id)
  ).map((row) => [row.id, row])).values()]
  const direction = fantasyRoleBreakdown(profile, answers, dimensionId)
  const specifics = [...new Map(theme.dimensionIds.flatMap((id) =>
    specificFantasyAnswers(profile, answers, id)
  ).map((row) => [row.questionId, row])).values()]
  const followUps = theme.dimensionIds.map((id) => ({
    id,
    label: profile.dimensions.find((row) => row.id === id).label,
    count: selectDeepDiveQuestions(profile, answers, {
      dimensionId: id,
      priorQuestionIds: Object.keys(answers),
      maxCount: 3
    }).length
  }))

  return (
    <main className="fantasy-shell fantasy-detail-shell">
      <button
        type="button"
        className="text-button fantasy-back-link"
        onClick={onBack}
      >
        ← Back to results
      </button>
      <section className="fantasy-detail-hero">
        <span className="kicker">A closer look</span>
        <h1>{theme.label}</h1>
        <p className="fantasy-detail-definition">{theme.description}</p>
        {theme.dimensionIds.length === 1 && direction?.roles.length === 1 && evidence?.band !== 'insufficient' && (
          <p className="fantasy-theme-summary">{summary}</p>
        )}
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
        ) : (
          <p className="muted">
            Your answers here were mixed, neutral, or mostly skipped, so there
            isn’t a clear example to point to.
          </p>
        )}
      </section>

      {specifics.length > 0 && (
        <section className="fantasy-detail-section">
          <h2>Specific fantasies</h2>
          <FantasySpecificAnswers rows={specifics} />
        </section>
      )}

      {direction?.roles?.length > 0 && (
        <section className="fantasy-detail-section">
          <h2>{direction.roles.length > 1 ? 'How each side landed' : 'How this theme landed'}</h2>
          {direction.roles.length > 1 && (
            <p className="muted">
              These scores are independent, so both sides can be strong at the same time.
            </p>
          )}
          <div className="fantasy-role-breakdown fantasy-role-breakdown-detail">
            {direction.roles.map((role) => (
              <div
                className={`fantasy-role-row${role.observations ? '' : ' is-unsampled'}`}
                key={role.key}
              >
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
                  {role.position !== null && (
                    <span
                      className="fantasy-role-marker"
                      style={{ left: `${role.position}%` }}
                    />
                  )}
                </div>
              </div>
            ))}
            <div className="fantasy-role-axis" aria-hidden="true">
              <span>Turn-off</span>
              <span>Neutral</span>
              <span>Turn-on</span>
            </div>
            {direction.summary && (
              <p className="fantasy-role-summary">{direction.summary}</p>
            )}
          </div>
        </section>
      )}

      {theme.searchTerms?.length > 0 && (
        <section className="fantasy-detail-section">
          <h2>Common terms</h2>
          <p>
            People may also use terms such as {theme.searchTerms.join(', ')}.
          </p>
        </section>
      )}

      {nearby.length > 0 && (
        <section className="fantasy-detail-section">
          <h2>Related themes</h2>
          <div className="fantasy-nearby-list">
            {nearby.map((row) => (
              <button
                type="button"
                className="secondary-button"
                key={row.id}
                onClick={() => onOpenTheme(row.id)}
              >
                {row.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {kinkAreas.length > 0 && (
        <section className="fantasy-detail-section">
          <h2>Terms that sometimes overlap</h2>
          <div className="fantasy-kink-pills">
            {kinkAreas.map((row) => (
              <span key={row.id}>{row.label}</span>
            ))}
          </div>
          <p className="muted">
            Think of these as search terms, not identities.
          </p>
        </section>
      )}

      {followUps.map(({ id, label, count: unansweredDeepDiveCount }) => (
        <section className="fantasy-more-card" key={id}>
          <div>
            <span className="kicker">Optional</span>
            <h2>
              {unansweredDeepDiveCount
                ? (followUps.length > 1 ? `Explore ${label.toLowerCase()}` : 'Want to dig into this one?')
                : (followUps.length > 1 ? `You’ve explored ${label.toLowerCase()}` : 'You’ve explored this theme')}
            </h2>
            <p>
              {unansweredDeepDiveCount
                ? 'Answer a few more fantasies that focus on this theme. They’ll be added only if you choose to continue.'
                : 'There aren’t any more follow-up questions for this theme right now.'}
            </p>
          </div>
          {unansweredDeepDiveCount > 0 && (
            <button
              type="button"
              className="primary-button"
              onClick={() => onExploreMore(id)}
            >
              Ask me more
            </button>
          )}
        </section>
      ))}
    </main>
  )
}
