import { useMemo, useState } from 'react'
import { groupActivityResults } from '../../lib/activityProfile.js'
import PartnerComparison from './PartnerComparison.jsx'
import PartnerPrintReport from '../product/PartnerPrintReport.jsx'

const VIEWS = [
  ['stance', 'By stance'],
  ['category', 'By category'],
  ['experience', 'By experience'],
  ['notes', 'With notes'],
  ['conditions', 'With conditions'],
]

export default function ActivityResults({ catalog, activityState, playPreferences, onBack, onUnanswered, onIntro, onPlayPreferences, onPartnerExport }) {
  const [view, setView] = useState('stance')
  const [includePlayPreferences, setIncludePlayPreferences] = useState(false)
  const resultData = useMemo(() => groupActivityResults(catalog, activityState, view), [catalog, activityState, view])
  const { groups, unansweredCount } = resultData
  const stanceLabels = new Map(catalog.stanceScale.map((row) => [row.id, row.label]))
  const experienceLabels = new Map(catalog.experienceScale.map((row) => [row.id, row.label]))
  const answeredCount = catalog.activities.length - unansweredCount

  return (
    <main className="activity-shell activity-results-shell">
      <div className="screen-only">
        <header className="activity-results-hero">
          <div><span className="kicker">Activity Explorer</span><h1>Your real-world activity map.</h1><p>Practical groups for interests, limits, experience, notes, and conditions. Hard limits stay easy to locate and are never interpreted from Fantasy Profile.</p></div>
          <div className="activity-results-actions no-print"><button type="button" className="primary-button" onClick={onBack}>Continue exploring</button><button type="button" className="secondary-button" onClick={onPlayPreferences}>Play Preferences</button><button type="button" className="text-button" onClick={onIntro}>Activity Explorer intro</button></div>
        </header>

        <section className="activity-unanswered-summary">
          <div><h2>Unanswered <span>— {unansweredCount}</span></h2><p>{unansweredCount === 1 ? '1 activity still needs a stance.' : `${unansweredCount} activities still need a stance.`}</p></div>
          {unansweredCount > 0 && <button type="button" className="secondary-button" onClick={onUnanswered}>Continue with unanswered activities</button>}
        </section>

        {answeredCount === 0 ? (
          <section className="activity-empty-state activity-results-empty"><h2>No real-world stances yet.</h2><p>Activity Explorer stays blank until you choose your own stance for an activity.</p><button type="button" className="primary-button" onClick={onUnanswered || onBack}>Start exploring</button></section>
        ) : (
          <>
            <div className="activity-result-view-tabs no-print">{VIEWS.map(([id, label]) => <button type="button" key={id} className={view === id ? 'active' : ''} onClick={() => setView(id)}>{label}</button>)}</div>

            <section className="activity-result-groups">
              {groups.map((group) => (
                <article key={group.key} className={`activity-result-group result-${group.key}`}>
                  <header><h2>{group.label}</h2><span>{group.rows.length}</span></header>
                  <div className="activity-result-list">
                    {group.rows.map(({ activity, answer }) => (
                      <div key={activity.id} className="activity-result-row">
                        <div><strong>{activity.label}</strong><span>{catalog.categories.find((row) => row.id === activity.categoryId)?.label}</span>{answer?.note && <small>{answer.note}</small>}</div>
                        <div className="activity-result-badges">{answer?.stance && <span className={`soft-pill stance-text-${answer.stance}`}>{stanceLabels.get(answer.stance)}</span>}{answer?.experience && <span className="soft-pill">{experienceLabels.get(answer.experience)}</span>}</div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </section>

            <section className="activity-share-section no-print">
              <div className="activity-results-section-heading"><span className="kicker">Partner sharing</span><h2>Share the real-world profile, not private fantasy data.</h2><p>The partner-share format contains Activity Explorer answers only, plus Play Preferences only when you explicitly choose to include them.</p></div>
              <div className="activity-share-actions"><label className="share-toggle"><input type="checkbox" checked={includePlayPreferences} onChange={(event) => setIncludePlayPreferences(event.target.checked)} /><span>Include Play Preferences in export and print report</span></label><div><button type="button" className="secondary-button" onClick={() => onPartnerExport(includePlayPreferences)}>Download partner-share file</button><button type="button" className="text-button" onClick={() => window.print()}>Print partner report</button></div></div>
            </section>

            <PartnerComparison catalog={catalog} activityState={activityState} />
          </>
        )}
      </div>

      <PartnerPrintReport catalog={catalog} activities={activityState} playPreferences={playPreferences} includePlayPreferences={includePlayPreferences} />
    </main>
  )
}
