export default function FantasyProgress({ progress }) {
  return (
    <div
      className="fantasy-progress"
      aria-label={`${progress.answered} questions answered`}
    >
      <div className="fantasy-progress-copy">
        <span>{progress.stageLabel}</span>
        <span>{progress.answered} answered</span>
      </div>

    </div>
  )
}
