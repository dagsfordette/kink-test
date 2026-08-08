import { boundaryLabels, buildResults, perspectiveLabels, willingnessLabel } from '../lib/profile.js'
import { negotiationPreferenceSummary } from '../lib/negotiation.js'

function pretty(value) {
  return value ? value.replaceAll('_', ' ') : '—'
}

function preferenceLabel(value) {
  const labels = {
    love_it: 'Love it', like_it: 'Like it', neutral: 'Neutral', dislike_it: 'Dislike it', hate_it: 'Hate it', unknown: 'Not sure',
    strongly_want: 'Strongly want', want: 'Want', unsure: 'Unsure / depends', prefer_not: 'Prefer not', do_not_want: 'Do not want',
  }
  return value ? (labels[value] || pretty(value)) : '—'
}

function detailText(details) {
  if (!details || !Object.keys(details).length) return '—'
  return Object.entries(details).map(([key, value]) => {
    let rendered
    if (Array.isArray(value)) rendered = value.map(pretty).join(', ')
    else if (value && typeof value === 'object') rendered = Object.entries(value).map(([k,v]) => `${pretty(k)}: ${pretty(v)}`).join('; ')
    else rendered = pretty(value)
    return `${pretty(key)}: ${rendered}`
  }).join(' | ')
}

export default function PrintReport({ catalog, answers, categoryGates, negotiationPreferences }) {
  const results = buildResults(catalog, answers, categoryGates, negotiationPreferences)
  const profileSummary = negotiationPreferenceSummary(catalog, negotiationPreferences, { onlyPretestOnly: true })
  const now = new Date().toLocaleString()
  const categoryRows = results.categoryStats.filter((row) => row.conceptsAnswered > 0)
  const domainRows = results.domainStats.filter((row) => row.categoriesAnswered > 0)

  return (
    <article className="print-report">
      <header>
        <p>Private Adult Kink & BDSM Preference Inventory</p>
        <h1>Preference summary</h1>
        <span>Generated locally · {now}</span>
      </header>

      <section className="print-summary">
        <div><strong>{results.counts.conceptsAnswered}</strong><span>concepts answered</span></div>
        <div><strong>{results.counts.conceptsTried}</strong><span>concepts tried</span></div>
        <div><strong>{results.counts.conceptHardLimits}</strong><span>concept hard limits</span></div>
        <div><strong>{results.counts.categoryHardLimits}</strong><span>category hard limits</span></div>
        <div><strong>{results.counts.fantasyOnly}</strong><span>fantasy only</span></div>
        <div><strong>{results.negotiationPreferences.answeredFields}</strong><span>care / negotiation fields</span></div>
      </section>

      {results.negotiationPreferences.hasData && (
        <section>
          <h2>Negotiation, privacy & care preferences</h2>
          <p>These general preferences are descriptive and are not part of interest scoring. Concept-specific conditions and hard limits remain separate.</p>
          <table>
            <thead><tr><th>Area</th><th>Preference</th><th>Answer</th></tr></thead>
            <tbody>{results.negotiationPreferences.sections.flatMap((section) => section.fields.map((field) => <tr key={`${section.id}-${field.id}`}><td>{section.label}</td><td>{field.label}</td><td>{field.values.join('; ')}</td></tr>))}</tbody>
          </table>
        </section>
      )}

      {profileSummary.hasData && (
        <section>
          <h2>Profile & attraction preferences</h2>
          <table>
            <thead><tr><th>Area</th><th>Preference</th><th>Answer</th></tr></thead>
            <tbody>{profileSummary.sections.flatMap((section) => section.fields.map((field) => <tr key={`${section.id}-${field.id}`}><td>{section.label}</td><td>{field.label}</td><td>{field.values.join('; ')}</td></tr>))}</tbody>
          </table>
        </section>
      )}

      <section>
        <h2>How this summary is aggregated</h2>
        <p>Perspective answers are first combined within each concept. Concepts are then weighted equally within categories. Hard limits are shown separately and are never converted into low-preference points. Qualitative labels are shown instead of psychometric percentages.</p>
      </section>

      {domainRows.length > 0 && (
        <section>
          <h2>Domain overview</h2>
          <table>
            <thead><tr><th>Domain</th><th>Fantasy interest</th><th>Real-world interest</th><th>Category coverage</th></tr></thead>
            <tbody>{domainRows.map((row) => <tr key={row.id}><td>{row.label}</td><td>{row.fantasy.label}</td><td>{row.realWorld.label}</td><td>{row.categoriesAnswered}</td></tr>)}</tbody>
          </table>
        </section>
      )}

      <section>
        <h2>Category overview</h2>
        <table>
          <thead><tr><th>Category</th><th>Fantasy interest</th><th>Real-world interest</th><th>Experience</th><th>Concepts answered</th></tr></thead>
          <tbody>{categoryRows.map((row) => <tr key={row.id}><td>{row.label}</td><td>{row.fantasy.label}</td><td>{row.realWorld.label}</td><td>{row.experience.triedConcepts}/{row.experience.answeredConcepts} tried</td><td>{row.conceptsAnswered}</td></tr>)}</tbody>
        </table>
      </section>

      {results.fantasyOnlyInterests.length > 0 && (
        <section>
          <h2>Fantasy-only interests</h2>
          <table>
            <thead><tr><th>Concept</th><th>Perspective</th><th>Fantasy appeal</th><th>Willingness</th></tr></thead>
            <tbody>{results.fantasyOnlyInterests.map((row) => <tr key={row.key}><td>{row.concept.label}</td><td>{perspectiveLabels[row.perspective] || row.perspective}</td><td>{preferenceLabel(row.answer.preference?.fantasy)}</td><td>Fantasy only</td></tr>)}</tbody>
          </table>
        </section>
      )}

      {results.asymmetries.length > 0 && (
        <section>
          <h2>Perspective asymmetries</h2>
          <table>
            <thead><tr><th>Concept</th><th>Dimension</th><th>Higher-interest perspective</th><th>Lower-interest perspective</th></tr></thead>
            <tbody>{results.asymmetries.map((row, index) => <tr key={`${row.conceptId}-${row.dimension}-${index}`}><td>{row.concept.label}</td><td>{row.dimension === 'realWorld' ? 'Real-world interest' : row.dimension === 'fantasy' ? 'Fantasy interest' : 'Willingness'}</td><td>{perspectiveLabels[row.high.perspective] || row.high.perspective}</td><td>{perspectiveLabels[row.low.perspective] || row.low.perspective}</td></tr>)}</tbody>
          </table>
        </section>
      )}

      {results.conditionalInterests.length > 0 && (
        <section>
          <h2>Conditional interests</h2>
          <table>
            <thead><tr><th>Concept</th><th>Perspective</th><th>Boundary</th><th>Conditional details</th></tr></thead>
            <tbody>{results.conditionalInterests.map((row) => <tr key={row.key}><td>{row.concept.label}</td><td>{perspectiveLabels[row.perspective] || row.perspective}</td><td>{row.answer.boundary ? (boundaryLabels[row.answer.boundary] || pretty(row.answer.boundary)) : '—'}</td><td>{row.detailBoundaries.conditional.map((entry) => `${entry.fieldLabel}: ${entry.optionLabel}`).join('; ') || '—'}</td></tr>)}</tbody>
          </table>
        </section>
      )}

      {results.hardLimits.length > 0 && (
        <section>
          <h2>Concept hard limits</h2>
          <table>
            <thead><tr><th>Concept</th><th>Perspective</th><th>Boundary</th></tr></thead>
            <tbody>{results.hardLimits.map((row) => <tr key={row.key}><td>{row.concept.label}</td><td>{perspectiveLabels[row.perspective] || row.perspective}</td><td>Hard limit</td></tr>)}</tbody>
          </table>
        </section>
      )}

      {results.detailHardLimits.length > 0 && (
        <section>
          <h2>Detailed hard limits</h2>
          <table>
            <thead><tr><th>Concept</th><th>Perspective</th><th>Detail family</th><th>Hard-limit subtype</th></tr></thead>
            <tbody>{results.detailHardLimits.map((entry) => <tr key={entry.key}><td>{entry.concept.label}</td><td>{perspectiveLabels[entry.perspective] || entry.perspective}</td><td>{entry.fieldLabel}</td><td>{entry.optionLabel}</td></tr>)}</tbody>
          </table>
        </section>
      )}

      {results.categoryHardLimits.length > 0 && (
        <section>
          <h2>Category-wide hard limits</h2>
          <table>
            <thead><tr><th>Category</th><th>Boundary</th></tr></thead>
            <tbody>{results.categoryHardLimits.map((row) => <tr key={row.categoryId}><td>{row.label}</td><td>Hard limit for this area</td></tr>)}</tbody>
          </table>
        </section>
      )}

      <section>
        <h2>Perspective-level answered items</h2>
        <table>
          <thead><tr><th>Concept</th><th>Perspective</th><th>Fantasy</th><th>Real world</th><th>Experienced</th><th>Willingness</th><th>Boundary</th><th>Tried</th><th>Follow-up detail</th></tr></thead>
          <tbody>
            {results.records.filter((row) => row.perspective !== 'overall').map((row) => (
              <tr key={row.key}>
                <td>{row.concept.label}</td>
                <td>{perspectiveLabels[row.perspective] || row.perspective}</td>
                <td>{preferenceLabel(row.answer.preference?.fantasy)}</td>
                <td>{preferenceLabel(row.answer.preference?.realWorld)}</td>
                <td>{preferenceLabel(row.answer.preference?.experienced)}</td>
                <td>{row.answer.willingness ? willingnessLabel(row.answer.willingness, row.answer.experience?.tried, row.semanticType) : '—'}</td>
                <td>{row.answer.boundary ? (boundaryLabels[row.answer.boundary] || pretty(row.answer.boundary)) : '—'}</td>
                <td>{row.answer.experience?.tried === true ? 'Yes' : row.answer.experience?.tried === false ? 'No' : '—'}</td>
                <td>{detailText(row.answer.details)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {results.insufficientData.length > 0 && (
        <section>
          <h2>Areas with insufficient data</h2>
          <p>{results.insufficientData.map((row) => `${row.label} (${row.reason.toLowerCase()})`).join('; ')}.</p>
        </section>
      )}

      {results.notes.length > 0 && (
        <section>
          <h2>Notes</h2>
          {results.notes.map((row) => <div className="print-note" key={row.key}><strong>{row.concept.label} · {perspectiveLabels[row.perspective] || row.perspective}</strong><p>{row.answer.note.text}</p></div>)}
        </section>
      )}

      <footer>This report is descriptive self-assessment output, not medical, psychological, or relationship advice. Consent and boundaries must always be communicated directly.</footer>
    </article>
  )
}
