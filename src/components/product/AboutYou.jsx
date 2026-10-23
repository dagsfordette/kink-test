import { useState } from 'react'
import { BodyFacts } from '../activities/ExplorationSettings.jsx'
export default function AboutYou({ facts, onSave, onContinue, onBack }) {
  const [draft, setDraft] = useState(facts)
  return (
    <main className="basics-shell no-print">
      <section className="basics-card">
        <span className="kicker">Optional setup</span>
        <h1>About your body</h1>
        <p>Share only what helps. Changes apply when you save.</p>
        <BodyFacts facts={draft} onChange={setDraft} />
        <div className="basics-actions">
          <button type="button" className="primary-button" onClick={() => onSave(draft)}>
            Save &amp; continue
          </button>
          <button type="button" className="text-button" onClick={onContinue}>
            Skip without saving
          </button>
          <button type="button" onClick={onBack}>Back</button>
        </div>
      </section>
    </main>
  )
}
