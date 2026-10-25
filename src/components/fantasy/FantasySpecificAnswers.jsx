export default function FantasySpecificAnswers({ rows }) {
  return (
    <div className="fantasy-statement-list">
      {rows.map((row) => (
        <div key={row.questionId}>
          <p>{row.statement}</p>
          <span>{row.responseLabel}</span>
        </div>
      ))}
    </div>
  )
}
