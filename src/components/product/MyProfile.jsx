import { useMemo, useState } from 'react'
import PartnerComparison from '../activities/PartnerComparison.jsx'
import PartnerPrintReport from './PartnerPrintReport.jsx'

const STANCE_SECTIONS = ['love', 'want', 'curious', 'if_partner_wants', 'soft_limit', 'hard_limit', 'dont_want']

function FantasySummary({ results, onOpenFantasy }) {
  if (!results) return <p className="profile-empty">Complete Fantasy Profile to add private self-discovery results here.</p>
  return (
    <div className="combined-profile-grid">
      <article><span>Strongest drivers</span>{results.drivers.length ? results.drivers.slice(0, 4).map((row) => <strong key={row.id}>{row.label}</strong>) : <em>No clear positive driver pattern yet.</em>}</article>
      <article><span>Fantasy patterns</span>{results.patterns.length ? results.patterns.slice(0, 4).map((row) => <strong key={row.id}>{row.label}</strong>) : <em>No clear positive motif pattern yet.</em>}</article>
      <article><span>Directionality</span>{results.directions.length ? results.directions.slice(0, 3).map((row) => <p key={`${row.dimensionId}-${row.text}`}>{row.text}</p>) : <em>No stable directional contrast stood out.</em>}</article>
      <article><span>Suggested kink areas</span>{results.suggestions.length ? results.suggestions.slice(0, 5).map((row) => <strong key={row.id}>{row.label}</strong>) : <em>No area has enough evidence to suggest.</em>}</article>
      <button type="button" className="text-button no-print" onClick={onOpenFantasy}>Open full Fantasy Profile →</button>
    </div>
  )
}

export default function MyProfile({ catalog, fantasyComplete, fantasyResults, activities, playPreferences, observations, onFantasy, onActivities, onPrivateExport, onPartnerExport, onPrintPrivate }) {
  const [includePlayPreferences, setIncludePlayPreferences] = useState(false)
  const stanceLabels = useMemo(() => new Map(catalog.stanceScale.map((row) => [row.id, row.label])), [catalog])
  const categoryLabels = useMemo(() => new Map(catalog.categories.map((row) => [row.id, row.label])), [catalog])
  const activityByStance = useMemo(() => {
    const groups = Object.fromEntries(STANCE_SECTIONS.map((id) => [id, []]))
    for (const activity of catalog.activities) {
      const answer = activities.answers?.[activity.id]
      if (answer?.stance && groups[answer.stance]) groups[answer.stance].push({ activity, answer })
    }
    return groups
  }, [catalog, activities.answers])
  const answeredCount = Object.values(activityByStance).reduce((sum, rows) => sum + rows.length, 0)

  return (
    <main className="combined-profile-shell">
      <header className="combined-profile-hero screen-only">
        <span className="kicker">My Profile</span>
        <h1>One profile, two different kinds of truth.</h1>
        <p>Fantasy describes imagination. Activity Explorer describes current real-world stances. Differences between them are ordinary information, not contradictions to resolve.</p>
      </header>

      <div className="screen-only">
        <section className="combined-profile-section fantasy-profile-summary">
          <div className="combined-section-heading"><div><span className="kicker">Private · imagination</span><h2>Fantasy Profile</h2><p>Non-diagnostic themes supported by your fantasy responses.</p></div><button type="button" className="secondary-button" onClick={onFantasy}>{fantasyComplete ? 'View Fantasy Profile' : 'Start Fantasy Profile'}</button></div>
          <FantasySummary results={fantasyComplete ? fantasyResults : null} onOpenFantasy={onFantasy} />
        </section>

        <section className="combined-profile-section activity-profile-summary">
          <div className="combined-section-heading"><div><span className="kicker">Shareable · real world</span><h2>Activity Explorer</h2><p>{answeredCount ? `${answeredCount} activities answered across interests, openness, and limits.` : 'No real-world activity stances have been answered yet.'}</p></div><button type="button" className="secondary-button" onClick={onActivities}>{answeredCount ? 'Continue exploring' : 'Start Activity Explorer'}</button></div>
          {answeredCount ? (
            <div className="activity-profile-sections">
              {STANCE_SECTIONS.map((stanceId) => {
                const rows = activityByStance[stanceId]
                if (!rows.length) return null
                return <details key={stanceId} className={`profile-stance-group stance-group-${stanceId}`} open={stanceId === 'hard_limit' || stanceId === 'love'}><summary><strong>{stanceLabels.get(stanceId)}</strong><span>{rows.length}</span></summary><div>{rows.map(({ activity, answer }) => <article key={activity.id}><div><strong>{activity.label}</strong><span>{categoryLabels.get(activity.categoryId)}</span></div>{answer.experience && <span className="soft-pill">{catalog.experienceScale.find((row) => row.id === answer.experience)?.label}</span>}{answer.note && <p>{answer.note}</p>}</article>)}</div></details>
              })}
            </div>
          ) : <p className="profile-empty">Activity Explorer works independently of Fantasy Profile and will remain blank until you choose real-world stances yourself.</p>}
        </section>

        {fantasyComplete && answeredCount > 0 && (
          <section className="combined-profile-section integration-observations">
            <div className="combined-section-heading"><div><span className="kicker">Fantasy → reality</span><h2>Descriptive observations</h2><p>These compare the two profiles without treating either one as more authentic.</p></div></div>
            {observations.length ? <div className="observation-list">{observations.map((row, index) => <p key={`${row.type}-${index}`}>{row.text}</p>)}</div> : <p className="profile-empty">There is not enough overlapping information yet to summarize a fantasy-to-reality pattern.</p>}
          </section>
        )}

        <section className="combined-profile-section privacy-export-section">
          <div className="combined-section-heading"><div><span className="kicker">Privacy & exports</span><h2>Choose what leaves this browser.</h2><p>Private backup and partner sharing are deliberately different formats.</p></div></div>
          <div className="export-card-grid">
            <article className="export-card private-export-card"><strong>Private backup</strong><p>Contains Fantasy Profile answers and progress, Activity Explorer answers, Play Preferences, tailoring settings, and version metadata. Treat this file as sensitive personal data.</p><div><button type="button" className="primary-button" onClick={onPrivateExport}>Download private backup</button><button type="button" className="text-button" onClick={onPrintPrivate}>Print private report</button></div></article>
            <article className="export-card partner-export-card"><strong>Partner-share Activity Profile</strong><p>Contains Activity Explorer data only. Fantasy answers, themes, scores, question sequence, and recommendation explanations are excluded by design.</p><label className="share-toggle"><input type="checkbox" checked={includePlayPreferences} onChange={(event) => setIncludePlayPreferences(event.target.checked)} /><span>Include my Play Preferences in this partner-share export</span></label><button type="button" className="secondary-button" onClick={() => onPartnerExport(includePlayPreferences)}>Download partner-share file</button></article>
          </div>
        </section>

        {answeredCount > 0 && <PartnerComparison catalog={catalog} activityState={activities} />}
      </div>

      <section className="private-print-report print-only">
        <header><span>Kink Exploration · Private report</span><h1>My private profile</h1><p>This report includes private fantasy information. Fantasy content describes imagination only and does not set consent or real-world boundaries.</p></header>
        {fantasyComplete && <section><h2>Fantasy Profile <small>Fantasy only</small></h2><h3>Drivers</h3><p>{fantasyResults.drivers.map((row) => row.label).join(' · ') || 'No clear positive pattern.'}</p><h3>Patterns</h3><p>{fantasyResults.patterns.map((row) => row.label).join(' · ') || 'No clear positive pattern.'}</p><h3>Directionality</h3>{fantasyResults.directions.map((row) => <p key={row.text}>{row.text}</p>)}<h3>Suggested areas</h3><p>{fantasyResults.suggestions.map((row) => row.label).join(' · ') || 'No suggestions.'}</p></section>}
        <PartnerPrintReport catalog={catalog} activities={activities} playPreferences={playPreferences} includePlayPreferences embedded />
      </section>
    </main>
  )
}
