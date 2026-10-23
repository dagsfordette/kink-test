import { useEffect, useMemo, useRef, useState } from 'react'
import {
  compareActivityProfiles,
  comparisonPage,
  comparisonStateLabels
} from '../../lib/activityComparison.js'
import { comparisonProfileFromActivityState } from '../../lib/activityProfile.js'
import { PLAY_PREFERENCE_FIELDS } from '../../lib/playPreferences.js'
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
  const [filter, setFilter] = useState('all')
  const [requestedPage, setRequestedPage] = useState(0)
  const rangeRef = useRef(null)
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
  const page = comparisonPage(comparison?.rows || [], filter, requestedPage)
  const sharedPreferences = PLAY_PREFERENCE_FIELDS.filter(
    ([id]) => partnerProfile?.playPreferences?.[id]?.trim()
  )
  const movePage = (nextPage) => {
    setRequestedPage(nextPage)
    window.requestAnimationFrame(() => {
      rangeRef.current?.focus()
      rangeRef.current?.scrollIntoView({ block: 'nearest' })
    })
  }
  const pagination = (
    <nav className="exploration-pagination" aria-label="Comparison pages">
      <button type="button" disabled={page.page === 0}
        onClick={() => movePage(page.page - 1)}>
        Previous page
      </button>
      <span>Page {page.page + 1} of {page.pageCount}</span>
      <button type="button" disabled={page.page + 1 === page.pageCount}
        onClick={() => movePage(page.page + 1)}>
        Next page
      </button>
    </nav>
  )

  const load = () => {
    try {
      const parsed = JSON.parse(partnerText)
      const share = parsePartnerShareExport(parsed, catalog)
      setPartnerProfile(share)
      setFilter('all')
      setRequestedPage(0)
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
          Paste a partner’s Activity Explorer share file below. It includes
          activity answers, reviewed boundary scopes, and any Play Preferences
          your partner chose to share. Private activity notes, detailed activity
          preferences and Fantasy Profile are excluded. Both exports must use
          the same Activity Explorer catalogue version.
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
          <p className="muted">{comparison.note}</p>
          <p>{partnerProfile.contextNote}</p>
          <section className="partner-play-preferences" aria-label="Partner’s Play Preferences">
            <h2>Partner’s Play Preferences</h2>
            {!partnerProfile.playPreferences ? (
              <p>Your partner did not include Play Preferences in this share file.</p>
            ) : sharedPreferences.length === 0 ? (
              <p>Your partner shared this section without any entries.</p>
            ) : (
              sharedPreferences.map(([id, label]) => (
                <div key={id}>
                  <h3>{label}</h3>
                  <p>{partnerProfile.playPreferences[id]}</p>
                </div>
              ))
            )}
          </section>
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
          <label>
            Show results{' '}
            <select value={filter} onChange={(event) => {
              setFilter(event.target.value)
              setRequestedPage(0)
            }}>
              <option value="all">All results ({comparison.rows.length})</option>
              {ORDER.map((state) => (
                <option key={state} value={state}>
                  {comparisonStateLabels[state]} ({comparison.counts[state] || 0})
                </option>
              ))}
            </select>
          </label>
          <p role="status" ref={rangeRef} tabIndex={-1}>
            Showing {page.from}–{page.to} of {page.total} results
            {filter !== 'all' ? ` · ${comparisonStateLabels[filter]}` : ''}.
          </p>
          {page.total === 0 && <p>No results in this view. Choose another result type.</p>}
          {page.pageCount > 1 && pagination}
          <div className="activity-comparison-list">
            {page.rows.map((row) => (
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
          {page.pageCount > 1 && pagination}
        </div>
      )}
    </section>
  )
}
