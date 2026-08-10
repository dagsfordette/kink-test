export default function FantasyAnswerReview({ profile, fantasy, onBack, onEdit }) {
  const labels = new Map(profile.responseScale.map((row) => [row.id, row.label]))
  const questionMap = new Map(profile.questions.map((question) => [question.id, question]))
  const rows = fantasy.questionSequence
    .filter((id) => Object.prototype.hasOwnProperty.call(fantasy.answers, id))
    .map((id, index) => ({ index, id, question: questionMap.get(id), response: fantasy.answers[id] }))
    .filter((row) => row.question)

  return (
    <main className="fantasy-shell fantasy-review-shell">
      <button type="button" className="text-button fantasy-back-link" onClick={onBack}>← Back to results</button>
      <header className="fantasy-review-header">
        <span className="kicker">Fantasy Profile</span>
        <h1>Review your answers</h1>
        <p>Change any response. If an earlier change alters which adaptive questions are relevant, the later route will be rebuilt and stale adaptive answers will be removed.</p>
      </header>
      <div className="fantasy-review-list">
        {rows.map((row) => (
          <button type="button" key={row.id} className="fantasy-review-row" onClick={() => onEdit(row.id)}>
            <span className="fantasy-review-index">{row.index + 1}</span>
            <span className="fantasy-review-copy">
              <strong>{row.question.statement}</strong>
              <span>{labels.get(row.response)}</span>
            </span>
            <span aria-hidden="true">›</span>
          </button>
        ))}
      </div>
    </main>
  )
}
