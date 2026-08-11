export default function FantasyQuestionCard({ question, responseScale, selected, onAnswer }) {
  return (
    <section className="fantasy-question-card" aria-labelledby="fantasy-question-text">
      <div className="fantasy-question-prompt">As a fantasy, how does this land for you?</div>
      <h1 id="fantasy-question-text">{question.statement}</h1>
      <div className="fantasy-response-grid" role="radiogroup" aria-label="Fantasy response">
        {responseScale.map((choice) => (
          <button
            type="button"
            key={choice.id}
            role="radio"
            aria-checked={selected === choice.id}
            className={`fantasy-response ${selected === choice.id ? 'selected' : ''} ${choice.id === 'unsure' ? 'fantasy-response-unsure' : ''}`}
            onClick={() => onAnswer(choice.id)}
          >
            <span className="fantasy-response-dot" aria-hidden="true" />
            {choice.label}
          </button>
        ))}
      </div>
    </section>
  )
}
