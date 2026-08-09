import { boundaryLabels, buildResults, perspectiveLabels, willingnessLabel } from '../lib/profile.js'
import { categoryGateSummary } from '../lib/depthModes.js'
import PartnerComparison from './PartnerComparison.jsx'
import { negotiationPreferenceSummary } from '../lib/negotiation.js'

function pretty(value) {
  return value ? value.replaceAll('_', ' ') : null
}

function preferenceLabel(value) {
  const labels = {
    love_it: 'Love it', like_it: 'Like it', neutral: 'Neutral', dislike_it: 'Dislike it', hate_it: 'Hate it', unknown: 'Not sure',
    strongly_want: 'Strongly want', want: 'Want', unsure: 'Unsure / depends', prefer_not: 'Prefer not', do_not_want: 'Do not want',
  }
  return labels[value] || pretty(value)
}


function RecordList({ rows, empty }) {
  if (!rows.length) return <p className="muted">{empty}</p>
  return (
    <div className="record-list">
      {rows.map((row) => (
        <div className="record-row" key={row.key}>
          <div>
            <strong>{row.concept.label}</strong>
            <span>{perspectiveLabels[row.perspective] || row.perspective}</span>
          </div>
          <div className="record-meta">
            {row.answer.preference?.fantasy && <span>Fantasy: {preferenceLabel(row.answer.preference.fantasy)}</span>}
            {row.answer.preference?.realWorld && <span>Real world: {preferenceLabel(row.answer.preference.realWorld)}</span>}
            {row.answer.preference?.experienced && <span>Experienced: {preferenceLabel(row.answer.preference.experienced)}</span>}
            {row.answer.willingness && <span>{willingnessLabel(row.answer.willingness, row.answer.experience?.tried, row.semanticType)}</span>}
            {row.answer.boundary && row.answer.boundary !== 'none' && <span className={row.answer.boundary === 'hard_limit' ? 'danger-pill' : 'soft-pill'}>{boundaryLabels[row.answer.boundary] || pretty(row.answer.boundary)}</span>}
            {row.detailBoundaries?.conditional?.length > 0 && <span>{row.detailBoundaries.conditional.length} conditional detail{row.detailBoundaries.conditional.length === 1 ? '' : 's'}</span>}
            {row.answer.details && Object.keys(row.answer.details).length > 0 && <span>{Object.keys(row.answer.details).length} follow-up answers</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

function AggregateTable({ rows, labelHeader }) {
  const visible = rows.filter((row) => row.conceptsAnswered > 0 || row.categoriesAnswered > 0)
  if (!visible.length) return <p className="muted">Not enough scored concept answers yet.</p>
  return (
    <div className="aggregate-table" role="table">
      <div className="aggregate-row aggregate-head" role="row">
        <span>{labelHeader}</span><span>Fantasy</span><span>Real world</span><span>Experience</span>
      </div>
      {visible.map((row) => (
        <div className="aggregate-row" role="row" key={row.id}>
          <strong>{row.label}</strong>
          <span>{row.fantasy?.label || 'Insufficient data'}</span>
          <span>{row.realWorld?.label || 'Insufficient data'}</span>
          <span>{row.experience ? `${row.experience.triedConcepts}/${row.experience.answeredConcepts} tried` : `${row.categoriesAnswered || 0} categories`}</span>
        </div>
      ))}
    </div>
  )
}

function PerspectiveTable({ rows }) {
  if (!rows.length) return <p className="muted">No perspective-level preferences yet.</p>
  return (
    <div className="aggregate-table perspective-summary" role="table">
      <div className="aggregate-row aggregate-head" role="row"><span>Perspective</span><span>Fantasy</span><span>Real world</span><span>Records</span></div>
      {rows.map((row) => (
        <div className="aggregate-row" role="row" key={row.perspective}>
          <strong>{row.label}</strong><span>{row.fantasy.label}</span><span>{row.realWorld.label}</span><span>{row.records}</span>
        </div>
      ))}
    </div>
  )
}

function AsymmetryList({ rows }) {
  if (!rows.length) return <p className="muted">No strong giving/receiving or other perspective asymmetries detected yet.</p>
  return (
    <div className="record-list">
      {rows.map((row, index) => (
        <div className="record-row" key={`${row.conceptId}-${row.dimension}-${index}`}>
          <div><strong>{row.concept.label}</strong><span>{row.dimension === 'realWorld' ? 'Real-world interest' : row.dimension === 'fantasy' ? 'Fantasy interest' : 'Willingness'}</span></div>
          <div className="record-meta">
            <span>{perspectiveLabels[row.high.perspective] || row.high.perspective}: {row.dimension === 'willingness' ? willingnessLabel(row.high.answer.willingness, row.high.answer.experience?.tried, row.high.semanticType) : preferenceLabel(row.dimension === 'fantasy' ? row.high.answer.preference?.fantasy : row.high.answer.preference?.realWorld)}</span>
            <span>{perspectiveLabels[row.low.perspective] || row.low.perspective}: {row.dimension === 'willingness' ? willingnessLabel(row.low.answer.willingness, row.low.answer.experience?.tried, row.low.semanticType) : preferenceLabel(row.dimension === 'fantasy' ? row.low.answer.preference?.fantasy : row.low.answer.preference?.realWorld)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function NegotiationSummary({ summary, empty = 'No preferences recorded yet.' }) {
  if (!summary?.hasData) return <p className="muted">{empty}</p>
  return (
    <div className="negotiation-results-grid">
      {summary.sections.map((section) => (
        <div className="negotiation-result-section" key={section.id}>
          <strong>{section.label}</strong>
          {section.fields.map((field) => <div key={field.id}><span>{field.label}</span><p>{field.values.join(' · ')}</p></div>)}
        </div>
      ))}
    </div>
  )
}

export default function ResultsView({ catalog, answers, categoryGates, negotiationPreferences, onBack, onExportJson, onPrintPdf, comparison, onCompareJson, onClearComparison }) {
  const results = buildResults(catalog, answers, categoryGates, negotiationPreferences)
  const profileSummary = negotiationPreferenceSummary(catalog, negotiationPreferences, { onlyPretestOnly: true })
  const gateRows = categoryGateSummary(catalog, categoryGates)
  const skippedCategories = gateRows.filter((row) => row.state === 'skip')

  return (
    <main className="results-page">
      <header className="results-header no-print">
        <button type="button" className="text-button" onClick={onBack}>← Back to test</button>
        <div className="results-actions">
          <button type="button" className="secondary-button" onClick={onExportJson}>Export JSON</button>
          <button type="button" className="primary-button" onClick={onPrintPdf}>Export PDF</button>
        </div>
      </header>

      <section className="results-hero">
        <span className="kicker">Your private summary</span>
        <h1>A map of preferences, not a label.</h1>
        <p>Interests, experience, willingness, conditions, boundaries, and your general care preferences stay separate so the summary keeps the nuance of what you actually answered.</p>
        <div className="summary-metrics">
          <div><strong>{results.counts.conceptsAnswered}</strong><span>concepts answered</span></div>
          <div><strong>{results.counts.conceptsTried}</strong><span>concepts tried</span></div>
          <div><strong>{results.counts.fantasyOnly}</strong><span>fantasy only</span></div>
          <div><strong>{results.counts.conceptHardLimits}</strong><span>concept hard limits</span></div>
          <div><strong>{results.counts.categoryHardLimits}</strong><span>category hard limits</span></div>
          <div><strong>{results.negotiationPreferences.answeredFields}</strong><span>care / negotiation fields</span></div>
        </div>
      </section>

      <section className="results-grid">
        <PartnerComparison comparison={comparison} onLoad={onCompareJson} onClear={onClearComparison} />

        <article className="result-card wide negotiation-result-card">
          <div className="result-card-heading"><div><span className="kicker">Your defaults</span><h2>Negotiation & care</h2></div></div>
          <NegotiationSummary summary={results.negotiationPreferences} empty="No negotiation or care preferences recorded yet." />
        </article>

        <article className="result-card wide negotiation-result-card">
          <div className="result-card-heading"><div><span className="kicker">Your defaults</span><h2>Question tailoring</h2></div></div>
          <NegotiationSummary summary={profileSummary} empty="No question-tailoring preferences recorded yet." />
        </article>

        <article className="result-card wide">
          <div className="result-card-heading"><div><span className="kicker">Concept-weighted overview</span><h2>Categories</h2></div><span className="muted">Qualitative labels replace false-precision percentages</span></div>
          <AggregateTable rows={results.categoryStats} labelHeader="Category" />
        </article>

        <article className="result-card wide">
          <div className="result-card-heading"><div><span className="kicker">Broader pattern</span><h2>Domains</h2></div><span className="muted">Categories combine only after concept-level aggregation</span></div>
          <div className="aggregate-table" role="table">
            <div className="aggregate-row aggregate-head" role="row"><span>Domain</span><span>Fantasy</span><span>Real world</span><span>Coverage</span></div>
            {results.domainStats.filter((row) => row.categoriesAnswered > 0).map((row) => (
              <div className="aggregate-row" role="row" key={row.id}><strong>{row.label}</strong><span>{row.fantasy.label}</span><span>{row.realWorld.label}</span><span>{row.categoriesAnswered} categories</span></div>
            ))}
          </div>
        </article>

        <article className="result-card wide">
          <div className="result-card-heading"><div><span className="kicker">Role and direction</span><h2>Perspective sub-results</h2></div><span className="muted">Visible for nuance; not extra category weight</span></div>
          <PerspectiveTable rows={results.perspectiveStats} />
        </article>

        <article className="result-card">
          <span className="kicker">Strong positive responses</span>
          <h2>Strong interests</h2>
          <RecordList rows={results.strongInterests.slice(0, 24)} empty="No strong interests recorded yet." />
        </article>

        <article className="result-card">
          <span className="kicker">Exploration</span>
          <h2>Curiosities / openness</h2>
          <RecordList rows={results.curiosities.slice(0, 24)} empty="Nothing marked curious, open, or unsure yet." />
        </article>

        <article className="result-card">
          <span className="kicker">Fantasy ≠ plan</span>
          <h2>Fantasy-only interests</h2>
          <RecordList rows={results.fantasyOnlyInterests.slice(0, 24)} empty="Nothing explicitly marked Fantasy only yet." />
        </article>

        <article className="result-card">
          <span className="kicker">Perspective differences</span>
          <h2>Giving / receiving asymmetries</h2>
          <AsymmetryList rows={results.asymmetries.slice(0, 18)} />
        </article>

        <article className="result-card">
          <span className="kicker">Conditions</span>
          <h2>Conditional interests</h2>
          <RecordList rows={results.conditionalInterests.slice(0, 24)} empty="No conditional interests recorded yet." />
        </article>

        <article className="result-card">
          <span className="kicker">Repeated refinements</span>
          <h2>Common conditions</h2>
          {results.commonConditions.length ? (
            <div className="condition-list">{results.commonConditions.slice(0, 16).map((entry) => <div key={`${entry.fieldId}-${entry.optionId}`}><strong>{entry.optionLabel}</strong><span>{entry.fieldLabel} · conditional in {entry.count} answer{entry.count === 1 ? '' : 's'}</span></div>)}</div>
          ) : <p className="muted">No repeated conditional detail states yet.</p>}
        </article>

        <article className="result-card">
          <span className="kicker">Boundaries</span>
          <h2>Concept hard limits</h2>
          <RecordList rows={results.hardLimits} empty="No concept-level hard limits recorded yet." />
        </article>

        <article className="result-card">
          <span className="kicker">Subtype boundaries</span>
          <h2>Detailed hard limits</h2>
          {results.detailHardLimits.length ? (
            <div className="record-list">{results.detailHardLimits.slice(0, 24).map((entry) => <div className="record-row" key={entry.key}><div><strong>{entry.concept.label}</strong><span>{perspectiveLabels[entry.perspective] || entry.perspective} · {entry.fieldLabel}</span></div><div className="record-meta"><span className="danger-pill">{entry.optionLabel}: Hard limit</span></div></div>)}</div>
          ) : <p className="muted">No subtype hard limits recorded in detailed answers yet.</p>}
        </article>

        <article className="result-card">
          <span className="kicker">Category boundaries</span>
          <h2>Category-wide hard limits</h2>
          {results.categoryHardLimits.length ? (
            <div className="record-list">{results.categoryHardLimits.map((row) => <div className="record-row" key={row.categoryId}><div><strong>{row.label}</strong><span>Applies to this area as a category boundary</span></div><div className="record-meta"><span className="danger-pill">Hard limit</span></div></div>)}</div>
          ) : <p className="muted">No category-wide hard limits recorded yet.</p>}
          {skippedCategories.length > 0 && <p className="muted result-footnote">{skippedCategories.length} categor{skippedCategories.length === 1 ? 'y is' : 'ies are'} skipped for now and remain unanswered rather than negative.</p>}
        </article>

        <article className="result-card">
          <span className="kicker">Coverage</span>
          <h2>Areas with insufficient data</h2>
          {results.insufficientData.length ? (
            <div className="condition-list">{results.insufficientData.slice(0, 16).map((row) => <div key={row.id}><strong>{row.label}</strong><span>{row.reason}{row.gateState ? ` · gate: ${pretty(row.gateState)}` : ''}</span></div>)}</div>
          ) : <p className="muted">Every non-limited category has at least two scored concept interests.</p>}
          {results.insufficientData.length > 16 && <p className="muted result-footnote">And {results.insufficientData.length - 16} more areas with limited data.</p>}
        </article>

        <article className="result-card wide">
          <span className="kicker">Context</span>
          <h2>Your notes</h2>
          {results.notes.length ? (
            <div className="notes-list">
              {results.notes.map((row) => <div key={row.key}><div><strong>{row.concept.label}</strong><span>{perspectiveLabels[row.perspective] || row.perspective} · {row.answer.note.visibility || 'private'}</span></div><p>{row.answer.note.text}</p></div>)}
            </div>
          ) : <p className="muted">No notes yet.</p>}
        </article>
      </section>
    </main>
  )
}
