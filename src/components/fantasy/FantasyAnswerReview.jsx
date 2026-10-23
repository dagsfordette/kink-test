export default function FantasyAnswerReview({
  profile,
  fantasy,
  onBack,
  onEdit
}) {
  const labels = new Map(
    profile.responseScale.map((row) => [row.id, row.label])
  )
  const questionMap = new Map(
    profile.questions.map((question) => [question.id, question])
  )
  const rows = fantasy.questionSequence
    .filter((id) => Object.prototype.hasOwnProperty.call(fantasy.answers, id))
    .map((id, index) => ({
      index,
      id,
      question: questionMap.get(id),
      response: fantasy.answers[id]
    }))
    .filter((row) => row.question)

  const activeIds = new Set(fantasy.questionSequence)
  const inactiveRows = profile.questions.filter(
    (question) =>
      !activeIds.has(question.id) &&
      Object.prototype.hasOwnProperty.call(fantasy.answers, question.id)
  )

  return (
    <main className="fantasy-shell fantasy-review-shell">
      <button
        type="button"
        className="text-button fantasy-back-link"
        onClick={onBack}
      >
        ← Back to results
      </button>
      <header className="fantasy-review-header">
        <span className="kicker">Fantasy Profile</span>
        <h1>Review your answers</h1>
        <p>
          Tap any answer to change it. If that changes which follow-up questions
          make sense, the rest of the questionnaire updates automatically.
          Previous answers are kept, even when their questions leave the current
          path.
        </p>
      </header>
      <div className="fantasy-review-list">
        {rows.map((row) => (
          <button
            type="button"
            key={row.id}
            className="fantasy-review-row"
            onClick={() => onEdit(row.id)}
          >
            <span className="fantasy-review-index">{row.index + 1}</span>
            <span className="fantasy-review-copy">
              <strong>{row.question.statement}</strong>
              <span>{labels.get(row.response)}</span>
            </span>
            <span aria-hidden="true">›</span>
          </button>
        ))}
      </div>
      {inactiveRows.length > 0 && (
        <section className="fantasy-review-list">
          <h2>
            Saved answers outside your current path ({inactiveRows.length})
          </h2>
          <p>
            These answers are kept for reuse if the questions return. They do
            not contribute to your current results.
          </p>
          {inactiveRows.map((question) => (
            <div key={question.id} className="fantasy-review-row">
              <span className="fantasy-review-copy">
                <strong>{question.statement}</strong>
                <span>{labels.get(fantasy.answers[question.id])}</span>
              </span>
            </div>
          ))}
        </section>
      )}
    </main>
  )
}
