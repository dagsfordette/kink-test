import SensorySummary from './SensorySummary.jsx'
import ToySummary from './ToySummary.jsx'
import BodyScentSummary from './BodyScentSummary.jsx'
import TattooSummary from './TattooSummary.jsx'
import FeatureSummary from './FeatureSummary.jsx'
import ContextSummary from './ContextSummary.jsx'
import RoleplaySummary from './RoleplaySummary.jsx'
import MaterialInterestsSummary from './MaterialInterestsSummary.jsx'
import BodyPaintSummary from './BodyPaintSummary.jsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  compareActivityProfiles,
  comparisonStateLabels
} from '../../lib/activityComparison.js'
import { comparisonProfileFromActivityState } from '../../lib/activityProfile.js'
import {
  buildPartnerShareExport,
  parsePartnerShareExport
} from '../../lib/profileExports.js'

const EMPTY_PREFERENCES = Object.freeze({})
const ORDER = [
  'hard_limit_conflict',
  'conditional_discussion',
  'preference_mismatch',
  'strong_match',
  'willing_match',
  'mutual_curiosity',
  'aligned_no_interest',
  'insufficient_data'
]

export default function PartnerComparison({
  catalog,
  activityState,
  playPreferences = EMPTY_PREFERENCES,
  includePlayPreferences = false
}) {
  const [partnerText, setPartnerText] = useState('')
  const [partnerProfile, setPartnerProfile] = useState(null)
  const [error, setError] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const [manualCopy, setManualCopy] = useState('')
  const copyGeneration = useRef(0)
  useEffect(() => {
    copyGeneration.current++
    setManualCopy('')
    setCopyStatus('')
    return () => {
      copyGeneration.current++
    }
  }, [activityState, playPreferences, includePlayPreferences])
  const ownProfile = useMemo(
    () => comparisonProfileFromActivityState(activityState, catalog),
    [activityState, catalog]
  )
  const shareAllowed = !ownProfile.blocked
  const comparison = useMemo(
    () =>
      partnerProfile && shareAllowed
        ? compareActivityProfiles(catalog, ownProfile, partnerProfile)
        : null,
    [catalog, ownProfile, partnerProfile, shareAllowed]
  )

  const load = () => {
    try {
      const parsed = JSON.parse(partnerText)
      const share = parsePartnerShareExport(parsed, catalog)
      setPartnerProfile(share)
      setError('')
    } catch (err) {
      setPartnerProfile(null)
      setError(
        err instanceof Error ? err.message : 'I couldn’t read that share file.'
      )
    }
  }

  const copyMine = async () => {
    const generation = ++copyGeneration.current
    setManualCopy('')
    setCopyStatus('')
    if (!shareAllowed) {
      setError('Review covering hard limits before sharing.')
      return
    }
    try {
      const share = buildPartnerShareExport(
        {
          activities: activityState,
          exploration: activityState.exploration,
          playPreferences
        },
        catalog,
        { includePlayPreferences, exportedAt: new Date().toISOString() }
      )
      const text = JSON.stringify(share, null, 2)
      try {
        await navigator.clipboard.writeText(text)
        if (generation !== copyGeneration.current) return
        setError('')
        setCopyStatus('Share data copied.')
      } catch {
        if (generation !== copyGeneration.current) return
        setManualCopy(text)
        setCopyStatus(
          'Clipboard unavailable. Copy your share data from the separate box below.'
        )
        setError('')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="activity-comparison-section no-print">
      <div className="activity-results-section-heading">
        <span className="kicker">Compare with a partner</span>
        <h2>See where your answers line up</h2>
        <p>
          Paste a partner’s Activity Explorer share file below. Only activity
          stances, experience, sensory interests, toy/device, body-feature, tattoo and body-scent ratings, setting preferences, role and pairing ratings, clothing and material ratings, and painted body maps are shared, not private notes, detailed
          preferences or Fantasy Profile. Both exports must use the same
          Activity Explorer catalogue version.
        </p>
      </div>

      {!shareAllowed && (
        <p role="alert">
          Review covering hard limits before sharing or comparison. Private
          backups remain available.
        </p>
      )}
      {!comparison ? (
        <div className="activity-comparison-loader">
          <div className="activity-comparison-copy-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={copyMine}
            >
              Copy my share data
            </button>
          </div>
          {copyStatus && <p role="status">{copyStatus}</p>}
          {manualCopy && (
            <label>
              Your share data — copy manually
              <textarea readOnly rows="8" value={manualCopy} />
            </label>
          )}
          <label>
            <span>Paste your partner’s share data</span>
            <textarea
              rows="8"
              value={partnerText}
              onChange={(event) => setPartnerText(event.target.value)}
              placeholder={
                '{"format":"kink-exploration-activity-profile","activities":{"answers":{...}}}'
              }
            />
          </label>
          {error && (
            <p className="activity-error" role="alert">
              {error}
            </p>
          )}
          <button type="button" className="primary-button" onClick={load}>
            Compare answers
          </button>
        </div>
      ) : (
        <div className="activity-comparison-results">
          <div className="activity-comparison-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setPartnerProfile(null)}
            >
              Use different partner data
            </button>
          </div>
          <SensorySummary interests={ownProfile.sensoryInterests} title="Your sensory interests" />
          <SensorySummary interests={partnerProfile.sensoryInterests} title="Their sensory interests" person="other" />
          <ToySummary interests={ownProfile.featureInterests} title="Your toy and device interests" />
          <ToySummary interests={partnerProfile.featureInterests} title="Their toy and device interests" person="other" />
          <BodyScentSummary interests={ownProfile.featureInterests} title="Your body-scent interests" />
          <BodyScentSummary interests={partnerProfile.featureInterests} title="Their body-scent interests" person="other" />
          <TattooSummary interests={ownProfile.featureInterests} title="Your tattoo activities" />
          <TattooSummary interests={partnerProfile.featureInterests} title="Their tattoo activities" person="other" />
          <FeatureSummary interests={ownProfile.featureInterests} title="Your body-feature activities" />
          <FeatureSummary interests={partnerProfile.featureInterests} title="Their body-feature activities" person="other" />
          <ContextSummary interests={ownProfile.contextInterests} title="Your setting preferences" />
          <ContextSummary interests={partnerProfile.contextInterests} title="Their setting preferences" />
          <RoleplaySummary interests={ownProfile.roleplayInterests} title="Your roleplay interests" />
          <RoleplaySummary interests={partnerProfile.roleplayInterests} title="Their roleplay interests" person="other" />
          <MaterialInterestsSummary interests={ownProfile.materialInterests} title="Your clothing & material interests" />
          <MaterialInterestsSummary interests={partnerProfile.materialInterests} title="Their clothing & material interests" />
          <BodyPaintSummary paint={ownProfile.bodyMaps} title="Your body maps" />
          <BodyPaintSummary paint={partnerProfile.bodyMaps} title="Their body maps" person="other" />
          <p className="muted">{comparison.note}</p>
          <p>{partnerProfile.contextNote}</p>
          <section aria-label="Partner boundary context">
            {partnerProfile.boundaryContext?.map((c) => (
              <div key={c.ownerId}>
                <strong>{c.ownerLabel}</strong>
                <p>
                  {c.mode === 'local'
                    ? 'Hard limit: this activity only.'
                    : 'Branch Hard limit.'}
                </p>
                {c.members.map((id) => (
                  <p key={id}>
                    Covered:{' '}
                    {catalog.activities.find((a) => a.id === id)?.label}
                  </p>
                ))}
                {c.exceptions.map((x) => (
                  <p key={x.childId}>
                    Exact exception within {c.ownerLabel}: {x.childLabel}
                  </p>
                ))}
              </div>
            ))}
          </section>
          <div className="activity-comparison-summary">
            {ORDER.map((state) => (
              <div
                key={state}
                className={state === 'hard_limit_conflict' ? 'danger' : ''}
              >
                <strong>{comparison.counts[state] || 0}</strong>
                <span>{comparisonStateLabels[state]}</span>
              </div>
            ))}
          </div>
          {comparison.hardLimitConflicts.length > 0 && (
            <div className="activity-hard-limit-banner">
              Hard-limit conflicts are shown first. A match somewhere else never
              cancels out a hard limit.
            </div>
          )}
          <div className="activity-comparison-list">
            {comparison.rows.slice(0, 120).map((row) => (
              <article
                key={row.key}
                className={`activity-comparison-row comparison-${row.state}`}
              >
                <div>
                  <strong>{row.label}</strong>
                  {row.directional && (
                    <span>Partner’s side: {row.partnerLabel}</span>
                  )}
                  {row.leftBoundaryLabels.map((label) => (
                    <small key={label}>
                      Your branch Hard limit for {label} covers this activity.
                    </small>
                  ))}
                  {row.rightBoundaryLabels.map((label) => (
                    <small key={label}>
                      Your partner’s branch Hard limit for {label} covers their
                      activity.
                    </small>
                  ))}
                  {row.experienceNote && <small>{row.experienceNote}</small>}
                </div>
                <span
                  className={
                    row.state === 'hard_limit_conflict'
                      ? 'danger-pill'
                      : 'soft-pill'
                  }
                >
                  {comparisonStateLabels[row.state]}
                </span>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
