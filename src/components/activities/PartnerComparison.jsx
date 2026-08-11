import { useMemo, useState } from 'react'
import { compareActivityProfiles, comparisonStateLabels } from '../../lib/activityComparison.js'
import { comparisonProfileFromActivityState } from '../../lib/activityProfile.js'
import { buildPartnerShareExport, parsePartnerShareExport } from '../../lib/profileExports.js'

const ORDER = ['hard_limit_conflict', 'conditional_discussion', 'preference_mismatch', 'strong_match', 'willing_match', 'mutual_curiosity', 'aligned_no_interest', 'insufficient_data']

export default function PartnerComparison({ catalog, activityState }) {
  const [partnerText, setPartnerText] = useState('')
  const [partnerProfile, setPartnerProfile] = useState(null)
  const [error, setError] = useState('')
  const ownProfile = useMemo(() => comparisonProfileFromActivityState(activityState), [activityState])
  const comparison = useMemo(() => partnerProfile ? compareActivityProfiles(catalog, ownProfile, partnerProfile) : null, [catalog, ownProfile, partnerProfile])

  const load = () => {
    try {
      const parsed = JSON.parse(partnerText)
      const share = parsePartnerShareExport(parsed, catalog)
      setPartnerProfile(share)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'I couldn’t read that share file.')
    }
  }

  const copyMine = async () => {
    const share = buildPartnerShareExport({ activities: activityState, playPreferences: {} }, catalog, { exportedAt: new Date().toISOString() })
    const text = JSON.stringify(share, null, 2)
    try { await navigator.clipboard.writeText(text) } catch { setPartnerText(text) }
  }

  return (
    <section className="activity-comparison-section no-print">
      <div className="activity-results-section-heading"><span className="kicker">Compare with a partner</span><h2>See where your answers line up</h2><p>Paste a partner’s Activity Explorer share file below. We’ll compare only the activity answers — not either person’s Fantasy Profile.</p></div>

      {!comparison ? (
        <div className="activity-comparison-loader">
          <div className="activity-comparison-copy-actions"><button type="button" className="secondary-button" onClick={copyMine}>Copy my share data</button></div>
          <label><span>Paste your partner’s share data</span><textarea rows="8" value={partnerText} onChange={(event) => setPartnerText(event.target.value)} placeholder={'{"format":"kink-exploration-activity-profile","activities":{"answers":{...}}}'} /></label>
          {error && <p className="activity-error">{error}</p>}
          <button type="button" className="primary-button" onClick={load}>Compare our answers</button>
        </div>
      ) : (
        <div className="activity-comparison-results">
          <div className="activity-comparison-actions"><button type="button" className="secondary-button" onClick={() => setPartnerProfile(null)}>Use different partner data</button></div>
          <p className="muted">{comparison.note}</p>
          <div className="activity-comparison-summary">{ORDER.map((state) => <div key={state} className={state === 'hard_limit_conflict' ? 'danger' : ''}><strong>{comparison.counts[state] || 0}</strong><span>{comparisonStateLabels[state]}</span></div>)}</div>
          {comparison.hardLimitConflicts.length > 0 && <div className="activity-hard-limit-banner">Hard-limit conflicts are shown first. A match somewhere else never cancels out a hard limit.</div>}
          <div className="activity-comparison-list">
            {comparison.rows.slice(0, 120).map((row) => (
              <article key={row.key} className={`activity-comparison-row comparison-${row.state}`}>
                <div><strong>{row.label}</strong>{row.directional && <span>Partner’s side: {row.partnerLabel}</span>}{row.experienceNote && <small>{row.experienceNote}</small>}</div>
                <span className={row.state === 'hard_limit_conflict' ? 'danger-pill' : 'soft-pill'}>{comparisonStateLabels[row.state]}</span>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
