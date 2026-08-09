import { comparisonStateLabels } from '../lib/partnerComparison.js'
import { perspectiveLabels } from '../lib/profile.js'

const ORDER = ['hard_limit_conflict','fantasy_real_world_mismatch','conditional_match','strong_directional_match','shared_mutual_interest','possible_discussion','insufficient_data']

function perspective(value) {
  return perspectiveLabels[value] || value?.replaceAll('_', ' ') || 'Overall'
}

export default function PartnerComparison({ comparison, onLoad, onClear }) {
  if (!comparison) {
    return (
      <article className="result-card wide comparison-card no-print">
        <div className="result-card-heading">
          <div><span className="kicker">Optional partner comparison</span><h2>Compare interaction states, not a percentage</h2></div>
          <button type="button" className="secondary-button" onClick={onLoad}>Load partner JSON</button>
        </div>
        <p className="muted">A partner export is held only in memory for this page. Comparison classifies directional matches, shared interests, discussion areas, fantasy/real-world mismatches, conditional matches, hard-limit conflicts, and insufficient data. It does not produce a compatibility score.</p>
      </article>
    )
  }

  return (
    <article className="result-card wide comparison-card no-print">
      <div className="result-card-heading">
        <div><span className="kicker">Optional partner comparison</span><h2>Interaction-state comparison</h2></div>
        <div className="results-actions"><button type="button" className="secondary-button" onClick={onLoad}>Replace partner JSON</button><button type="button" className="text-button" onClick={onClear}>Clear</button></div>
      </div>
      <p className="muted comparison-note">{comparison.note}</p>
      <div className="comparison-summary">
        {ORDER.map((state) => <div key={state} className={state === 'hard_limit_conflict' ? 'comparison-summary-danger' : ''}><strong>{comparison.counts[state] || 0}</strong><span>{comparisonStateLabels[state]}</span></div>)}
      </div>
      {comparison.hardLimitConflicts.length > 0 && <p className="category-boundary-note">Hard-limit conflicts are shown first and are never averaged away by positive matches elsewhere.</p>}
      <div className="comparison-list">
        {comparison.rows.slice(0, 80).map((row) => (
          <div className={`comparison-row comparison-${row.state}`} key={row.key}>
            <div><strong>{row.label}</strong><span>{row.scope === 'category' ? 'Category-wide boundary' : `${perspective(row.leftPerspective)} ↔ ${perspective(row.rightPerspective)}`}</span></div>
            <span className={row.state === 'hard_limit_conflict' ? 'danger-pill' : 'soft-pill'}>{comparisonStateLabels[row.state]}</span>
          </div>
        ))}
      </div>
      {comparison.rows.length > 80 && <p className="muted result-footnote">Showing the first 80 classified interactions; the model retains {comparison.rows.length} rows.</p>}
    </article>
  )
}
