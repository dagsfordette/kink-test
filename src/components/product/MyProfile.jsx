import BodyPaintSummary from '../activities/BodyPaintSummary.jsx'
import { useMemo, useState } from 'react'
import PartnerComparison from '../activities/PartnerComparison.jsx'
import PartnerPrintReport from './PartnerPrintReport.jsx'

const STANCE_SECTIONS = [
  'love',
  'want',
  'curious',
  'if_partner_wants',
  'not_sure',
  'soft_limit',
  'hard_limit',
  'dont_want'
]

function FantasySummary({ results, onOpenFantasy }) {
  if (!results)
    return (
      <p className="profile-empty">
        Do Fantasy Profile to add your fantasy results here.
      </p>
    )
  return (
    <div className="combined-profile-grid">
      <article>
        <span>What pulls you in</span>
        {results.drivers.length ? (
          results.drivers
            .slice(0, 4)
            .map((row) => <strong key={row.id}>{row.label}</strong>)
        ) : (
          <em>Nothing stood out clearly yet.</em>
        )}
      </article>
      <article>
        <span>Recurring themes</span>
        {results.patterns.length ? (
          results.patterns
            .slice(0, 4)
            .map((row) => <strong key={row.id}>{row.label}</strong>)
        ) : (
          <em>Nothing stood out clearly yet.</em>
        )}
      </article>
      <article>
        <span>Which side appealed more</span>
        {results.directions.length ? (
          results.directions
            .slice(0, 3)
            .map((row) => (
              <p key={`${row.dimensionId}-${row.text}`}>{row.text}</p>
            ))
        ) : (
          <em>No clear preference showed up.</em>
        )}
      </article>
      <article>
        <span>Terms to explore</span>
        {results.suggestions.length ? (
          results.suggestions
            .slice(0, 5)
            .map((row) => <strong key={row.id}>{row.label}</strong>)
        ) : (
          <em>No particular area stood out.</em>
        )}
      </article>
      <button
        type="button"
        className="text-button no-print"
        onClick={onOpenFantasy}
      >
        See full fantasy results →
      </button>
    </div>
  )
}

export default function MyProfile({
  catalog,
  fantasyComplete,
  fantasyResults,
  activities,
  playPreferences,
  observations,
  onFantasy,
  onActivities,
  onEditBody,
  onEditAttraction,
  onPlayPreferences,
  onPrivateExport,
  onDebugExport,
  onPartnerExport,
  onPrintPrivate,
  onEraseAllData,
  onPrivateImport,
  printingPrivate = false,
  onPrintPreferencesChange = () => {},
  printIncludePlayPreferences = false
}) {
  const includePlayPreferences = printIncludePlayPreferences
  const setIncludePlayPreferences = onPrintPreferencesChange
  const stanceLabels = useMemo(
    () => new Map(catalog.stanceScale.map((row) => [row.id, row.label])),
    [catalog]
  )
  const categoryLabels = useMemo(
    () => new Map(catalog.categories.map((row) => [row.id, row.label])),
    [catalog]
  )
  const activityByStance = useMemo(() => {
    const groups = Object.fromEntries(STANCE_SECTIONS.map((id) => [id, []]))
    for (const activity of catalog.activities) {
      const answer = activities.answers?.[activity.id]
      if (answer?.stance && groups[answer.stance])
        groups[answer.stance].push({ activity, answer })
    }
    return groups
  }, [catalog, activities.answers])
  const answeredCount = Object.values(activityByStance).reduce(
    (sum, rows) => sum + rows.length,
    0
  )

  return (
    <main className="combined-profile-shell">
      <label className="no-print">
        Restore private backup{' '}
        <input
          type="file"
          accept="application/json,.json"
          onChange={(e) => {
            if (e.target.files?.[0]) onPrivateImport(e.target.files[0])
            e.target.value = ''
          }}
        />
      </label>
      <div className="profile-settings-actions no-print">
        <button type="button" onClick={onEditBody}>About your body</button>
        <button type="button" onClick={onEditAttraction}>Attraction preferences</button>
        <button type="button" onClick={onPlayPreferences}>Play Preferences</button>
      </div>
      <header className="combined-profile-hero screen-only">
        <span className="kicker">My Profile</span>
        <h1>See what you’ve learned so far.</h1>
        <p>
          Your fantasy results and activity answers, side by side. They may
          overlap, but they don’t have to.
        </p>
      </header>
      <div className="screen-only"><BodyPaintSummary paint={activities.exploration?.bodyPaint} /></div>


      <div className="screen-only">
        <section className="combined-profile-section fantasy-profile-summary">
          <div className="combined-section-heading">
            <div>
              <span className="kicker">What draws you in</span>
              <h2>Fantasy Profile</h2>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={onFantasy}
            >
              {fantasyComplete
                ? 'See fantasy results'
                : 'Start Fantasy Profile'}
            </button>
          </div>
          <FantasySummary
            results={fantasyComplete ? fantasyResults : null}
            onOpenFantasy={onFantasy}
          />
        </section>

        <section className="combined-profile-section activity-profile-summary">
          <div className="combined-section-heading">
            <div>
              <span className="kicker">Where you stand</span>
              <h2>Activity Explorer</h2>
              <p>
                {answeredCount
                  ? `You’ve answered ${answeredCount} ${answeredCount === 1 ? 'activity' : 'activities'} so far.`
                  : 'You haven’t sorted any activities yet.'}
              </p>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={onActivities}
            >
              {answeredCount ? 'Keep sorting' : 'Explore activities'}
            </button>
          </div>
          {answeredCount ? (
            <div className="activity-profile-sections">
              {STANCE_SECTIONS.map((stanceId) => {
                const rows = activityByStance[stanceId]
                if (!rows.length) return null
                return (
                  <details
                    key={stanceId}
                    className={`profile-stance-group stance-group-${stanceId}`}
                    open={stanceId === 'hard_limit' || stanceId === 'love'}
                  >
                    <summary>
                      <strong>{stanceLabels.get(stanceId)}</strong>
                      <span>{rows.length}</span>
                    </summary>
                    <div>
                      {rows.map(({ activity, answer }) => (
                        <article key={activity.id}>
                          <div>
                            <strong>{activity.label}</strong>
                            <span>
                              {categoryLabels.get(activity.categoryId)}
                            </span>
                          </div>
                          {answer.experience && (
                            <span className="soft-pill">
                              {
                                catalog.experienceScale.find(
                                  (row) => row.id === answer.experience
                                )?.label
                              }
                            </span>
                          )}
                          {answer.note && <p>{answer.note}</p>}
                        </article>
                      ))}
                    </div>
                  </details>
                )
              })}
            </div>
          ) : (
            <p className="profile-empty">
              Activity Explorer will fill in as you mark what you want, might
              try, don’t want, or consider a limit.
            </p>
          )}
        </section>

        {fantasyComplete && answeredCount > 0 && (
          <section className="combined-profile-section integration-observations">
            <div className="combined-section-heading">
              <div>
                <span className="kicker">Where the two overlap</span>
                <h2>Things worth noticing</h2>
                <p>
                  Some fantasy themes may line up with your activity answers.
                  Others may not. Both are useful to see.
                </p>
              </div>
            </div>
            {observations.length ? (
              <div className="observation-list">
                {observations.map((row, index) => (
                  <p key={`${row.type}-${index}`}>{row.text}</p>
                ))}
              </div>
            ) : (
              <p className="profile-empty">
                There isn’t enough overlap yet to say much here.
              </p>
            )}
          </section>
        )}

        <section className="combined-profile-section privacy-export-section">
          <div className="combined-section-heading">
            <div>
              <span className="kicker">Save or share</span>
              <h2>What do you want to take with you?</h2>
              <p>
                You can keep a full backup for yourself, or make a smaller file
                that only contains the activity answers you may want to share
                with a partner.
              </p>
            </div>
          </div>
          <div className="export-card-grid">
            <article className="export-card private-export-card">
              <strong>Full private backup</strong>
              <p>
                Sensitive personal data, including private notes and detailed
                answers. Saved as an unencrypted JSON file that may sync with
                your downloads folder. Restore it using the private backup
                selector above.
              </p>
              <div>
                <button
                  type="button"
                  className="primary-button"
                  onClick={onPrivateExport}
                >
                  Download my backup
                </button>
                <button
                  type="button"
                  className="text-button"
                  onClick={onPrintPrivate}
                >
                  Print private report
                </button>
              </div>
            </article>
            <article className="export-card debug-export-card">
              <strong>Debug answer export</strong>
              <p>
                For testing only: includes every question and activity, all
                available answers, private notes, detailed preferences, full app
                state and scoring metadata, including unanswered items. Treat
                this download as sensitive and do not share it with a partner.
              </p>
              <button
                type="button"
                className="secondary-button"
                onClick={onDebugExport}
              >
                Download debug answers
              </button>
            </article>
            <article className="export-card partner-export-card">
              <strong>Share with a partner</strong>
              <p>
                <a href="#boundary-review">
                  Check boundary review status above
                </a>
              </p>
              <p>
                Includes painted body maps, activity stances, experience and reviewed boundary
                scope. Private notes, detailed preferences, and Fantasy Profile
                data are excluded. The downloaded file is unencrypted; optional
                Play Preferences may contain sensitive text.
              </p>
              <label className="share-toggle">
                <input
                  type="checkbox"
                  checked={includePlayPreferences}
                  onChange={(event) =>
                    setIncludePlayPreferences(event.target.checked)
                  }
                />
                <span>Also include my Play Preferences</span>
              </label>
              <button
                type="button"
                className="secondary-button"
                onClick={() => onPartnerExport(includePlayPreferences)}
              >
                Download share file
              </button>
            </article>
          </div>
        </section>

        <section className="combined-profile-section privacy-export-section screen-only">
          <div className="combined-section-heading">
            <div>
              <span className="kicker">Privacy controls</span>
              <h2>Erase data saved in this browser</h2>
              <p>
                Answers and notes are stored persistently in this browser, not
                encrypted by this app. Someone using the same browser profile
                may see them. Erasing removes this app’s saved profile from this
                browser, but cannot delete files you downloaded or copies you
                shared.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={onEraseAllData}
          >
            Erase all my local data
          </button>
        </section>

        {answeredCount > 0 && (
          <PartnerComparison
            catalog={catalog}
            activityState={activities}
            playPreferences={playPreferences}
            includePlayPreferences={includePlayPreferences}
          />
        )}
      </div>

      <PartnerPrintReport
        catalog={catalog}
        activities={activities}
        playPreferences={playPreferences}
        includePlayPreferences={includePlayPreferences}
      />
    </main>
  )
}

export function PrivateProfileReport({
  catalog,
  fantasyComplete,
  fantasyResults,
  activities,
  playPreferences
}) {
  return (
    <section className="private-print-report print-only">
      <header>
        <span>Kink Exploration · Private report</span>
        <h1>My private profile</h1>
        <p>
          This report includes your fantasy results as well as your activity
          answers. Fantasy is fantasy; your real-life boundaries are whatever
          you choose in Activity Explorer and in conversation.
        </p>
      </header>
      {fantasyComplete && (
        <section>
          <h2>
            Fantasy Profile <small>Fantasy only</small>
          </h2>
          <h3>Main pulls</h3>
          <p>
            {fantasyResults.drivers.map((row) => row.label).join(' · ') ||
              'Nothing stood out clearly.'}
          </p>
          <h3>Recurring themes</h3>
          <p>
            {fantasyResults.patterns.map((row) => row.label).join(' · ') ||
              'Nothing stood out clearly.'}
          </p>
          <h3>Which side appealed more</h3>
          {fantasyResults.directions.map((row) => (
            <p key={row.text}>{row.text}</p>
          ))}
          <h3>Terms to explore</h3>
          <p>
            {fantasyResults.suggestions.map((row) => row.label).join(' · ') ||
              'No suggestions.'}
          </p>
        </section>
      )}
      <PartnerPrintReport
        catalog={catalog}
        activities={activities}
        playPreferences={playPreferences}
        includePlayPreferences
        embedded
      />
    </section>
  )
}
