import { contributingAnswers, fantasyDirectionality, kinkAreasForTheme, nearbyFantasyThemes } from '../../lib/fantasyResults.js'
import { describeFantasyDimension, scoreFantasyProfile } from '../../lib/fantasyProfile.js'

export default function FantasyThemeDetail({ profile, answers, dimensionId, onBack, onOpenTheme, onExploreMore }) {
  const theme = profile.dimensions.find((dimension) => dimension.id === dimensionId)
  if (!theme) return null
  const evidence = scoreFantasyProfile(profile, answers)[dimensionId]
  const summary = describeFantasyDimension(profile, dimensionId, answers)
  const examples = contributingAnswers(profile, answers, dimensionId, 6)
  const nearby = nearbyFantasyThemes(profile, dimensionId, answers, 4)
  const kinkAreas = kinkAreasForTheme(profile, answers, dimensionId)
  const directions = fantasyDirectionality(profile, answers, 50).filter((row) => row.dimensionId === dimensionId)
  const unansweredDeepDiveCount = profile.questions.filter((question) => question.stage === 'deep_dive' && !Object.prototype.hasOwnProperty.call(answers, question.id) && question.signals?.some((signal) => signal.dimensionId === dimensionId)).length

  return (
    <main className="fantasy-shell fantasy-detail-shell">
      <button type="button" className="text-button fantasy-back-link" onClick={onBack}>← Back to results</button>
      <section className="fantasy-detail-hero">
        <span className="kicker">Fantasy theme</span>
        <h1>{theme.label}</h1>
        <p className="fantasy-detail-definition">{theme.description}</p>
        {evidence?.band !== 'insufficient' && <p className="fantasy-theme-summary">{summary}</p>}
      </section>

      <section className="fantasy-detail-section">
        <h2>What contributed</h2>
        {examples.length ? (
          <div className="fantasy-statement-list">
            {examples.map((row) => (
              <div key={row.questionId}>
                <p>“{row.statement}”</p>
                <span>{row.responseLabel}</span>
              </div>
            ))}
          </div>
        ) : <p className="muted">Your evidence here was mixed, neutral, or mostly skipped, so there are no positive examples to highlight.</p>}
      </section>

      {directions.length > 0 && (
        <section className="fantasy-detail-section">
          <h2>Directionality</h2>
          <div className="fantasy-direction-list">
            {directions.map((row) => <p key={row.text}>{row.text}</p>)}
          </div>
        </section>
      )}

      {nearby.length > 0 && (
        <section className="fantasy-detail-section">
          <h2>Nearby themes</h2>
          <div className="fantasy-nearby-list">
            {nearby.map((row) => <button type="button" className="secondary-button" key={row.id} onClick={() => onOpenTheme(row.id)}>{row.label}</button>)}
          </div>
        </section>
      )}

      {kinkAreas.length > 0 && (
        <section className="fantasy-detail-section">
          <h2>This theme sometimes connects to…</h2>
          <div className="fantasy-kink-pills">
            {kinkAreas.map((row) => <span key={row.id}>{row.label}</span>)}
          </div>
          <p className="muted">Possible vocabulary only — not an identity assignment.</p>
        </section>
      )}

      <section className="fantasy-more-card">
        <div>
          <span className="kicker">Optional</span>
          <h2>{unansweredDeepDiveCount ? 'Explore this more' : 'Theme explored'}</h2>
          <p>{unansweredDeepDiveCount ? 'Add a few unanswered deep-dive statements about this theme. This does not lengthen the initial questionnaire.' : 'There are no additional deep-dive statements for this theme right now.'}</p>
        </div>
        {unansweredDeepDiveCount > 0 && <button type="button" className="primary-button" onClick={() => onExploreMore(dimensionId)}>Explore this theme</button>}
      </section>
    </main>
  )
}
