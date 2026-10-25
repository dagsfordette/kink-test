import { paintedViews } from '../../lib/bodyPaint.js'
import { hasRoleplayMarks } from '../../lib/roleplayInterests.js'
import { TATTOO_GROUP, BODY_SCENT_GROUP, TOY_GROUPS, hasFeatureMarks } from '../../lib/featureInterests.js'
import SensorySummary from './SensorySummary.jsx'
import ToySummary from './ToySummary.jsx'
import BodyScentSummary from './BodyScentSummary.jsx'
import TattooSummary from './TattooSummary.jsx'
import FeatureSummary from './FeatureSummary.jsx'
import ContextSummary from './ContextSummary.jsx'
import RoleplaySummary from './RoleplaySummary.jsx'
import MaterialInterestsSummary from './MaterialInterestsSummary.jsx'
import BodyPaintSummary from './BodyPaintSummary.jsx'
import { buildShareProjection } from '../../lib/boundaryReview.js'
import { useMemo, useState } from 'react'
import { groupActivityResults } from '../../lib/activityProfile.js'
import PartnerComparison from './PartnerComparison.jsx'
import PartnerPrintReport from '../product/PartnerPrintReport.jsx'

const VIEWS = [
  ['stance', 'By answer'],
  ['category', 'By category'],
  ['experience', 'By experience'],
  ['notes', 'With notes'],
  ['conditions', 'With conditions']
]

export default function ActivityResults({
  catalog,
  activityState,
  playPreferences,
  onBack,
  onUnanswered,
  onEdit,
  onIntro,
  onPlayPreferences,
  onPartnerExport,
  onPrintPreferencesChange = () => {},
  printIncludePlayPreferences = false
}) {
  const [view, setView] = useState('stance')
  const includePlayPreferences = printIncludePlayPreferences
  const setIncludePlayPreferences = onPrintPreferencesChange
  const resultData = useMemo(
    () => groupActivityResults(catalog, activityState, view),
    [catalog, activityState, view]
  )
  const { groups, unansweredCount, answeredCount, consideredCount } = resultData
  const hasToys = hasFeatureMarks(activityState.exploration?.featureInterests, TOY_GROUPS)
  const hasScent = hasFeatureMarks(activityState.exploration?.featureInterests, [BODY_SCENT_GROUP])
  const hasSensory = Object.keys(activityState.exploration?.sensoryInterests || {}).length > 0
  const hasFeatures = hasFeatureMarks(activityState.exploration?.featureInterests)
  const hasTattoos = hasFeatureMarks(activityState.exploration?.featureInterests, [TATTOO_GROUP])
  const hasContexts = Object.keys(activityState.exploration?.contextInterests || {}).length > 0
  const hasRoleplay = hasRoleplayMarks(activityState.exploration?.roleplayInterests)
  const hasMaterials = Object.keys(activityState.exploration?.materialInterests || {}).length > 0
  const hasBodyMaps = paintedViews(activityState.exploration?.bodyPaint).length > 0
  const stanceLabels = new Map(
    catalog.stanceScale.map((row) => [row.id, row.label])
  )
  const experienceLabels = new Map(
    catalog.experienceScale.map((row) => [row.id, row.label])
  )

  return (
    <main className="activity-shell activity-results-shell">
      <div className="screen-only">
        <header className="activity-results-hero">
          <div>
            <span className="kicker">Activity Explorer</span>
            <h1>Review your answers.</h1>
            <p>
              See, edit, and share the answers you’ve given so far. Fantasy
              Profile never decides any of these answers for you.
            </p>
          </div>
          <div className="activity-results-actions no-print">
            <button type="button" className="primary-button" onClick={onBack}>
              Back to questions
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={onPlayPreferences}
            >
              Play Preferences
            </button>
            <button type="button" className="text-button" onClick={onIntro}>
              Activity Explorer intro
            </button>
          </div>
        </header>

        <BodyPaintSummary paint={activityState.exploration?.bodyPaint} />
        {(hasToys || activityState.exploration?.guided?.toysComplete) && <ToySummary interests={activityState.exploration?.featureInterests} privateDetails onEdit={() => onEdit("toy-interests")} />}
        {(hasScent || activityState.exploration?.guided?.scentComplete) && <BodyScentSummary interests={activityState.exploration?.featureInterests} privateDetails onEdit={() => onEdit("scent-interests")} />}
        {(hasSensory || activityState.exploration?.guided?.sensoryComplete) && <SensorySummary interests={activityState.exploration?.sensoryInterests} privateDetails onEdit={() => onEdit("sensory-interests")} />}
        {(hasTattoos || activityState.exploration?.guided?.tattoosComplete) && <TattooSummary interests={activityState.exploration?.featureInterests} privateDetails onEdit={() => onEdit("tattoo-interests")} />}
        {(hasFeatures || activityState.exploration?.guided?.featuresComplete) && <FeatureSummary interests={activityState.exploration?.featureInterests} privateDetails onEdit={() => onEdit("feature-interests")} />}
        {(hasContexts || activityState.exploration?.guided?.contextsComplete) && <ContextSummary interests={activityState.exploration?.contextInterests} privateDetails onEdit={() => onEdit("context-interests")} />}
        {(hasRoleplay || activityState.exploration?.guided?.roleplayComplete) && <RoleplaySummary interests={activityState.exploration?.roleplayInterests} privateDetails onEdit={() => onEdit("roleplay-interests")} />}
        {(hasMaterials || activityState.exploration?.guided?.materialsComplete) && <MaterialInterestsSummary interests={activityState.exploration?.materialInterests} privateDetails onEdit={() => onEdit("material-interests")} />}

        <section className="activity-unanswered-summary">
          <div>
            <h2>
              Not answered yet <span>— {unansweredCount}</span>
            </h2>
            <p>
              {unansweredCount === 1
                ? 'There’s 1 activity left in your current path without an answer.'
                : `There are ${unansweredCount} activities left in your current path without an answer.`}{' '}
              {consideredCount < catalog.activities.length
                ? 'Questions outside this path are not counted here.'
                : ''}
            </p>
          </div>
          {unansweredCount > 0 && (
            <button
              type="button"
              className="secondary-button"
              onClick={onUnanswered}
            >
              Back to unanswered questions
            </button>
          )}
        </section>

        {answeredCount === 0 && !hasToys && !hasScent && !hasSensory && !hasTattoos && !hasFeatures && !hasContexts && !hasRoleplay && !hasMaterials && !hasBodyMaps ? (
          <section className="activity-empty-state activity-results-empty">
            <h2>{hasBodyMaps ? 'Your body maps are saved.' : 'You haven’t answered anything yet.'}</h2>
            <p>
              {hasBodyMaps ? 'Keep painting, or explore the other activity categories.' : 'Start Activity Explorer and answer a few questions. Your review will build from there.'}
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={onUnanswered || onBack}
            >
              Start Activity Explorer
            </button>
          </section>
        ) : (
          <>
            <div className="activity-result-view-tabs no-print">
              {VIEWS.map(([id, label]) => (
                <button
                  type="button"
                  key={id}
                  className={view === id ? 'active' : ''}
                  onClick={() => setView(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            <section className="activity-result-groups">
              {groups.map((group) => (
                <article
                  key={group.key}
                  className={`activity-result-group result-${group.key}`}
                >
                  <header>
                    <h2>{group.label}</h2>
                    <span>{group.rows.length}</span>
                  </header>
                  <div className="activity-result-list">
                    {group.rows.map(({ activity, answer }) => (
                      <div key={activity.id} className="activity-result-row">
                        <div>
                          <strong>{activity.label}</strong>
                          <span>
                            {
                              catalog.categories.find(
                                (row) => row.id === activity.categoryId
                              )?.label
                            }
                          </span>
                          {answer?.note && <small>{answer.note}</small>}
                          <button
                            type="button"
                            className="text-button activity-result-edit no-print"
                            onClick={() => onEdit(activity.id)}
                          >
                            Edit answer
                          </button>
                        </div>
                        <div className="activity-result-badges">
                          {answer?.stance && (
                            <span
                              className={`soft-pill stance-text-${answer.stance}`}
                            >
                              {stanceLabels.get(answer.stance)}
                            </span>
                          )}
                          {answer?.experience && (
                            <span className="soft-pill">
                              {experienceLabels.get(answer.experience)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </section>

            <section className="activity-share-section no-print">
              <div className="activity-results-section-heading">
                <span className="kicker">Share with a partner</span>
                <h2>Share only what you want them to see.</h2>
                <p>
                  The share file includes sensory interests, toy/device, body-feature, tattoo and body-scent ratings, setting preferences, role and pairing ratings, clothing and material ratings, painted body maps, activity stances, experience and
                  reviewed boundary scope—not private notes, detailed
                  preferences, or Fantasy Profile. You can separately choose to
                  include Play Preferences, which may contain sensitive text.
                </p>
              </div>
              <p>
                <a href="#boundary-review">Boundary review</a> —{' '}
                {buildShareProjection(catalog, activityState).blockers.length}{' '}
                review items before sharing.
              </p>
              <div className="activity-share-actions">
                <label className="share-toggle">
                  <input
                    type="checkbox"
                    checked={includePlayPreferences}
                    onChange={(event) =>
                      setIncludePlayPreferences(event.target.checked)
                    }
                  />
                  <span>Include my Play Preferences</span>
                </label>
                <div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => onPartnerExport(includePlayPreferences)}
                  >
                    Download share file
                  </button>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      const checked = buildShareProjection(
                        catalog,
                        activityState
                      )
                      if (checked.allowed) window.print()
                      else
                        window.alert(
                          'Review boundary scope and saved interests before sharing.'
                        )
                    }}
                  >
                    Print share report
                  </button>
                </div>
              </div>
            </section>

            <PartnerComparison
              catalog={catalog}
              activityState={activityState}
              playPreferences={playPreferences}
              includePlayPreferences={includePlayPreferences}
            />
          </>
        )}
      </div>

      <PartnerPrintReport
        catalog={catalog}
        activities={activityState}
        playPreferences={playPreferences}
        includePlayPreferences={includePlayPreferences}
      />
    </main>
  )
}
