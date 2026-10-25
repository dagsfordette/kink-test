import { hasRoleplayMarks } from '../../lib/roleplayInterests.js'

export default function ActivityIntro({
  activity,
  adultConfirmed,
  onAdultConfirmed,
  onStart,
  onResume,
  onResults
}) {
  const answeredCount = Object.keys(activity.answers || {}).length
  const hasProgress = answeredCount > 0 || Object.keys(activity.exploration?.sensoryInterests || {}).length > 0 || Object.keys(activity.exploration?.featureInterests || {}).length > 0 || Object.keys(activity.exploration?.contextInterests || {}).length > 0 || hasRoleplayMarks(activity.exploration?.roleplayInterests) || Object.keys(activity.exploration?.materialInterests || {}).length > 0 || activity.exploration?.guided?.topicId

  return (
    <main className="activity-shell activity-intro-shell">
      <section className="activity-intro-card activity-entry-card activity-entry-card-simple">
        <div className="activity-brand-mark" aria-hidden="true">
          ◇
        </div>
        <span className="kicker">Activity Explorer</span>
        <h1>Explore what you’d actually be up for.</h1>
        <p className="activity-lede">
          Explore one activity at a time.
        </p>

        {!adultConfirmed && (
          <label className="fantasy-adult-confirmation">
            <input
              type="checkbox"
              checked={adultConfirmed}
              onChange={(event) => onAdultConfirmed(event.target.checked)}
            />
            <span>
              I’m an adult and I’m okay continuing with sexual and kink-related
              activity content.
            </span>
          </label>
        )}

        <div className="activity-entry-primary-actions">
          <button
            type="button"
            className="primary-button"
            disabled={!adultConfirmed}
            onClick={hasProgress ? onResume : onStart}
          >
            {hasProgress
              ? 'Continue Activity Explorer'
              : 'Start Activity Explorer'}
          </button>
          {hasProgress && (
            <button type="button" className="text-button" onClick={onResults}>
              Review answers
            </button>
          )}
        </div>

        {answeredCount > 0 && (
          <p className="activity-entry-progress-note">
            {answeredCount} {answeredCount === 1 ? 'answer' : 'answers'} saved
            in this browser.
          </p>
        )}
        <p className="fine-print">
          Your answers stay in this browser unless you choose to export them.
          There is no compatibility score and no “right” way for your list to
          look.
        </p>
      </section>
    </main>
  )
}
