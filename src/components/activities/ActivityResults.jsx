import { useMemo, useState } from 'react'
import { groupActivityResults } from '../../lib/activityProfile.js'
import PartnerComparison from './PartnerComparison.jsx'
import PartnerPrintReport from '../product/PartnerPrintReport.jsx'

const VIEWS = [
  ['stance', 'By answer'],
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
          <div><span className="kicker">Activity Explorer</span><h1>Here’s where you landed.</h1><p>See your yeses, maybes, noes, limits, experience, and notes. This is your list — Fantasy Profile never decides any of these answers for you.</p></div>
          <div className="activity-results-actions no-print"><button type="button" className="primary-button" onClick={onBack}>Keep sorting</button><button type="button" className="secondary-button" onClick={onPlayPreferences}>Play Preferences</button><button type="button" className="text-button" onClick={onIntro}>How Activity Explorer works</button></div>
        </header>

        <section className="activity-unanswered-summary">
          <div><h2>Not answered yet <span>— {unansweredCount}</span></h2><p>{unansweredCount === 1 ? 'There’s 1 activity left without an answer.' : `There are ${unansweredCount} activities left without an answer.`}</p></div>
          {unansweredCount > 0 && <button type="button" className="secondary-button" onClick={onUnanswered}>Show me the unanswered ones</button>}
        </section>

        {answeredCount === 0 ? (
          <section className="activity-empty-state activity-results-empty"><h2>You haven’t answered anything yet.</h2><p>Pick a few activities and mark how you feel about them. Your results will build from there.</p><button type="button" className="primary-button" onClick={onUnanswered || onBack}>Browse activities</button></section>
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
              <div className="activity-results-section-heading"><span className="kicker">Share with a partner</span><h2>Share only what you want them to see.</h2><p>The share file contains your Activity Explorer answers. Your Fantasy Profile stays private. You can choose whether to include Play Preferences too.</p></div>
              <div className="activity-share-actions"><label className="share-toggle"><input type="checkbox" checked={includePlayPreferences} onChange={(event) => setIncludePlayPreferences(event.target.checked)} /><span>Include my Play Preferences</span></label><div><button type="button" className="secondary-button" onClick={() => onPartnerExport(includePlayPreferences)}>Download share file</button><button type="button" className="text-button" onClick={() => window.print()}>Print share report</button></div></div>
            </section>

            <PartnerComparison catalog={catalog} activityState={activityState} />
          </>
        )}
      </div>

      <PartnerPrintReport catalog={catalog} activities={activityState} playPreferences={playPreferences} includePlayPreferences={includePlayPreferences} />
    </main>
  )
}
