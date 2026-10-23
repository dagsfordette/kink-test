import { BodyFacts } from '../activities/ExplorationSettings.jsx'
export default function AboutYou({ facts, onFacts, onContinue, onBack }) {
  return (
    <main className="basics-shell no-print">
      <section className="basics-card">
        <span className="kicker">Optional setup</span>
        <h1>About your body</h1>
        <p>Share only what helps. You can edit or reset this later.</p>
        <BodyFacts facts={facts} onChange={onFacts} />
        <div className="basics-actions">
          <button type="button" className="primary-button" onClick={onContinue}>
            Continue
          </button>
          <button type="button" className="text-button" onClick={onContinue}>
            Skip setup
          </button>
          <button type="button" onClick={onBack}>
            Back
          </button>
        </div>
      </section>
    </main>
  )
}
