import FantasyProgress from './FantasyProgress.jsx'
import FantasyQuestionCard from './FantasyQuestionCard.jsx'

export default function FantasyQuestionnaire({ profile, fantasy, progress, onAnswer, onBack, onNext, onLeave, onRestart }) {
  const questionId = fantasy.questionSequence[fantasy.currentIndex]
  const question = profile.questions.find((row) => row.id === questionId)
  const selected = questionId ? fantasy.answers[questionId] : null
  const canGoBack = fantasy.currentIndex > 0
  const canGoNext = Boolean(selected) && fantasy.currentIndex < fantasy.questionSequence.length - 1

  if (!question) return null

  return (
    <main className="fantasy-shell fantasy-question-shell">
      <header className="fantasy-question-header">
        <button type="button" className="text-button" onClick={onLeave}>Save & exit</button>
        <span className="fantasy-header-title">Fantasy Profile</span>
        <button type="button" className="text-button danger-text" onClick={onRestart}>Restart</button>
      </header>

      <FantasyProgress progress={progress} />
      <FantasyQuestionCard question={question} responseScale={profile.responseScale} selected={selected} onAnswer={onAnswer} />

      <nav className="fantasy-question-nav" aria-label="Question navigation">
        <button type="button" className="secondary-button" disabled={!canGoBack} onClick={onBack}>← Back</button>
        {selected && <span className="fantasy-saved-state">Answer saved</span>}
        <button type="button" className="secondary-button" disabled={!canGoNext} onClick={onNext}>Next →</button>
      </nav>
    </main>
  )
}
