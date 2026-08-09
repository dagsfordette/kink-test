import { useEffect, useMemo, useState } from 'react'
import ChoiceChips from './ChoiceChips.jsx'
import AdaptiveDetails from './AdaptiveDetails.jsx'
import PowerExchangeCardPreferences from './PowerExchangeCardPreferences.jsx'
import { answerKey, hasDetailData, perspectiveLabels, questionDimensions, semanticDefinition, semanticUi } from '../lib/profile.js'
import { countDetailResponses, detailBranchDecision, hasAdaptiveDetailFields } from '../lib/adaptiveDetails.js'
import { riskPromptsForConcept } from '../lib/risk.js'
import { applyPowerExchangeRealWorldState, POWER_EXCHANGE_REAL_WORLD_STATES, powerExchangeRealWorldState } from '../lib/powerExchange.js'


function PowerExchangeRealWorldQuestion({ answer, update }) {
  const state = powerExchangeRealWorldState(answer)
  const setState = (nextState) => {
    const selected = state === nextState ? undefined : nextState
    const next = applyPowerExchangeRealWorldState(answer, selected)
    if (selected !== 'soft_limit' && next.details?.soft_limit_conditions) {
      const details = { ...next.details }
      delete details.soft_limit_conditions
      if (Object.keys(details).length) next.details = details
      else delete next.details
    }
    update(next)
  }
  const patchSoftLimitConditions = (text) => {
    const details = { ...(answer?.details || {}) }
    if (text.trim()) details.soft_limit_conditions = text
    else delete details.soft_limit_conditions
    update({ ...answer, details })
  }

  return (
    <div className="field-block semantic-separator power-exchange-real-world">
      <span className="field-label">Real-world interest / boundary</span>
      <p className="field-help">Choose the one answer that best describes real-life willingness. Fantasy interest stays separate above.</p>
      <div className="choice-chips power-exchange-interest-scale" aria-label="Real-world Power Exchange interest and boundary">
        {POWER_EXCHANGE_REAL_WORLD_STATES.map((option) => (
          <button
            type="button"
            className={`chip power-exchange-state-${option.id} ${state === option.id ? 'selected' : ''}`}
            aria-pressed={state === option.id}
            onClick={() => setState(option.id)}
            key={option.id}
          >{option.label}</button>
        ))}
      </div>
      {state === 'soft_limit' && (
        <label className="soft-limit-conditions">
          <span className="field-label">What conditions could make this potentially okay?</span>
          <textarea
            rows="2"
            value={answer?.details?.soft_limit_conditions || ''}
            placeholder="Optional — context, relationship, intensity, timing, or another condition"
            onChange={(event) => patchSoftLimitConditions(event.target.value)}
          />
        </label>
      )}
    </div>
  )
}

const preferenceOptions = [
  { id: 'love_it', label: 'Love it', shortLabel: 'Love', tone: 'positive' },
  { id: 'like_it', label: 'Like it', shortLabel: 'Like', tone: 'positive' },
  { id: 'neutral', label: 'Neutral', shortLabel: 'Neutral' },
  { id: 'dislike_it', label: 'Dislike it', shortLabel: 'Dislike', tone: 'negative' },
  { id: 'hate_it', label: 'Hate it', shortLabel: 'Hate', tone: 'negative' },
]

function realWorldOptions(catalog) {
  return (catalog.scales?.realWorldDesire?.values || []).map((option) => ({
    ...option,
    shortLabel: option.label,
    tone: ['strongly_want', 'want'].includes(option.id) ? 'positive' : ['prefer_not', 'do_not_want'].includes(option.id) ? 'negative' : undefined,
  }))
}

function currentScaleOptions(catalog, scaleId) {
  return catalog.scales?.[scaleId]?.values || []
}

function boundaryOptions(catalog) {
  return currentScaleOptions(catalog, 'boundary').map((option) => ({
    ...option,
    shortLabel: option.id === 'none' ? 'None' : option.label,
    tone: option.id === 'hard_limit' ? 'negative' : ['soft_limit', 'conditional'].includes(option.id) ? 'warning' : undefined,
  }))
}

function WillingnessSelect({ catalog, value, onChange }) {
  const options = currentScaleOptions(catalog, 'willingness')
  return (
    <select value={value || ''} onChange={(event) => onChange(event.target.value || undefined)}>
      <option value="" disabled hidden>Choose willingness</option>
      {options.map((option) => <option value={option.id} key={option.id}>{option.label}</option>)}
    </select>
  )
}

function PerspectiveEditor({ catalog, concept, perspective, answer, update, manualDetailOpen, setManualDetailOpen, powerExchangeMode = false, powerExchangePreferences = {} }) {
  const semantic = semanticDefinition(catalog, concept)
  const ui = semanticUi(catalog, concept)
  const dimensions = questionDimensions(catalog, concept)
  const tried = answer?.experience?.tried
  const showExperience = dimensions.experience === true
  const showFantasy = dimensions.fantasyAppeal === true
  const showRealWorld = dimensions.realWorldDesire === true
  const showExperiencedPreference = dimensions.experiencedPreference === true
  const showWillingness = dimensions.willingness === true
  const showBoundary = dimensions.boundary === true
  const excludedDetailFieldIds = powerExchangeMode ? catalog.powerExchangeModel?.inheritedDetailFieldIds : []
  const profileAvailable = hasAdaptiveDetailFields(catalog, concept, perspective, excludedDetailFieldIds)
  const branchDecision = detailBranchDecision(catalog, answer, manualDetailOpen)
  const savedDetailCount = countDetailResponses(answer?.details)
  const [noteOpen, setNoteOpen] = useState(Boolean(answer?.note?.text))
  const powerExchangeState = powerExchangeMode ? powerExchangeRealWorldState(answer) : undefined
  const allowAdaptiveDetails = !powerExchangeMode || !['prefer_not', 'soft_limit', 'hard_limit'].includes(powerExchangeState)

  const patch = (partial) => update({ ...answer, ...partial })
  const patchPreference = (field, value) => patch({ preference: { ...(answer?.preference || {}), [field]: value } })
  const patchWillingness = (value) => {
    if (value === 'hard_limit') patch({ willingness: value, boundary: 'hard_limit' })
    else patch({ willingness: value })
  }
  const patchBoundary = (value) => {
    patch({
      boundary: value,
      ...(answer?.willingness === 'hard_limit' && value !== 'hard_limit' ? { willingness: undefined } : {}),
    })
  }

  return (
    <div className="perspective-editor">
      {showFantasy && (
        <div className="field-block">
          <span className="field-label">{ui.fantasyLabel || 'Fantasy appeal'}</span>
          <ChoiceChips
            value={answer?.preference?.fantasy}
            onChange={(value) => patchPreference('fantasy', value)}
            options={preferenceOptions}
            ariaLabel="Fantasy or idea appeal"
          />
        </div>
      )}

      {!powerExchangeMode && showRealWorld && (
        <div className="field-block semantic-separator">
          <span className="field-label">{ui.realWorldLabel || 'Real-world desire'}</span>
          <ChoiceChips
            value={answer?.preference?.realWorld}
            onChange={(value) => patchPreference('realWorld', value)}
            options={realWorldOptions(catalog)}
            ariaLabel="Real-world desire"
          />
          {semantic.id === 'fantasy' && <small className="field-help">For impossible or purely imagined scenarios, answer for the closest real-world version you would actually want.</small>}
        </div>
      )}

      {powerExchangeMode && (showRealWorld || showWillingness || showBoundary) && <PowerExchangeRealWorldQuestion answer={answer} update={update} />}

      {showExperience && (
        <div className="mini-row wrap-row semantic-separator">
          <label className="switch-label">
            <input
              type="checkbox"
              checked={tried === true}
              onChange={(event) => patch({
                experience: {
                  ...(answer?.experience || {}),
                  tried: event.target.checked,
                  ...(event.target.checked ? {} : { level: undefined }),
                },
              })}
            />
            <span>{ui.triedLabel || 'Tried / experienced'}</span>
          </label>

          {tried && (
            <label className="compact-field">
              <span>Experience level</span>
              <select
                className="compact-select"
                aria-label="Experience level"
                value={answer?.experience?.level || ''}
                onChange={(event) => patch({ experience: { ...answer.experience, level: event.target.value || undefined } })}
              >
                <option value="" disabled hidden>Choose level</option>
                {(catalog.scales?.experienceLevel?.values || []).map((option) => <option value={option.id} key={option.id}>{option.label}</option>)}
              </select>
            </label>
          )}
        </div>
      )}

      {tried && showExperiencedPreference && (
        <div className="field-block">
          <span className="field-label">{ui.experiencedLabel || 'How it felt in practice'}</span>
          <ChoiceChips
            value={answer?.preference?.experienced}
            onChange={(value) => patchPreference('experienced', value)}
            options={preferenceOptions}
            ariaLabel="Preference based on actual experience"
          />
        </div>
      )}

      {!powerExchangeMode && (showWillingness || showBoundary) && (
        <div className={`two-col-fields semantic-separator ${showWillingness && showBoundary ? '' : 'single-field'}`}>
          {showWillingness && (
            <label>
              <span className="field-label field-label-row"><span>{ui.willingnessLabel || 'Openness / willingness'}</span>{answer?.willingness && <button type="button" className="field-clear" onClick={() => patch({ willingness: undefined })}>Clear</button>}</span>
              <WillingnessSelect catalog={catalog} value={answer?.willingness} onChange={patchWillingness} />
            </label>
          )}
          {showBoundary && (
            <div className="boundary-field">
              <span className="field-label field-label-row"><span>{ui.boundaryLabel || 'Boundary'}</span>{answer?.boundary && <button type="button" className="field-clear" onClick={() => patchBoundary(undefined)}>Clear</button>}</span>
              <ChoiceChips value={answer?.boundary} onChange={patchBoundary} options={boundaryOptions(catalog)} ariaLabel="Boundary" />
            </div>
          )}
        </div>
      )}

      {powerExchangeMode && !['hard_limit', 'prefer_not', 'soft_limit'].includes(powerExchangeState) && powerExchangeState && (
        <PowerExchangeCardPreferences catalog={catalog} concept={concept} perspective={perspective} preferences={powerExchangePreferences} answer={answer} update={update} />
      )}

      {allowAdaptiveDetails && profileAvailable && !branchDecision.open && (
        <div className="detail-branch-collapsed">
          <div>
            <strong>Want to fine-tune this answer?</strong>
            <span>Optional follow-ups can capture what specifically works for {concept.label.toLowerCase()}.</span>
            {savedDetailCount > 0 && <small>{savedDetailCount} saved detail response{savedDetailCount === 1 ? '' : 's'}.</small>}
          </div>
          <button type="button" className="text-button detail-override-button" onClick={() => setManualDetailOpen(true)}>Add detail</button>
        </div>
      )}

      {allowAdaptiveDetails && profileAvailable && branchDecision.open && (
        <>
          {manualDetailOpen && !branchDecision.defaultOpen && (
            <div className="manual-detail-banner">
              <span>Optional details are open.</span>
              <button type="button" className="field-clear" onClick={() => setManualDetailOpen(false)}>Close</button>
            </div>
          )}
          <AdaptiveDetails catalog={catalog} concept={concept} perspective={perspective} answer={answer} update={update} decision={branchDecision} excludedFieldIds={excludedDetailFieldIds} />
        </>
      )}

      <div className="card-actions">
        <button type="button" className="text-button" onClick={() => setNoteOpen((value) => !value)}>
          {answer?.note?.text ? 'Edit note' : 'Add note'}
        </button>
      </div>

      {noteOpen && (
        <div className="note-box">
          <textarea
            rows="3"
            placeholder="Anything that would help you remember the nuance"
            value={answer?.note?.text || ''}
            onChange={(event) => patch({ note: { ...(answer?.note || {}), text: event.target.value } })}
          />
          <label className="note-visibility">
            <span>Note visibility</span>
            <select
              value={answer?.note?.visibility || 'private'}
              onChange={(event) => patch({ note: { ...(answer?.note || {}), visibility: event.target.value } })}
            >
              <option value="private">Private</option>
              <option value="shareable">Shareable</option>
            </select>
          </label>
        </div>
      )}
    </div>
  )
}

export default function ConceptCard({ catalog, concept, answers, setAnswer, showDefinition = false, perspectivesOverride, powerExchangeMode = false, powerExchangePreferences = {} }) {
  const perspectives = perspectivesOverride?.length ? perspectivesOverride : (concept.perspectives || ['mutual'])
  const [activePerspective, setActivePerspective] = useState(perspectives[0])
  useEffect(() => {
    if (!perspectives.includes(activePerspective)) setActivePerspective(perspectives[0])
  }, [activePerspective, perspectives])
  const [manualDetailOpen, setManualDetailOpen] = useState({})
  const conceptId = concept.id
  const key = answerKey(conceptId, activePerspective)
  const answer = answers[key] || {}
  const riskPrompts = riskPromptsForConcept(catalog, concept).filter((prompt) => !powerExchangeMode || prompt.id !== 'consent_complexity_negotiation')
  const activeDetailDecision = detailBranchDecision(catalog, answer, manualDetailOpen[activePerspective] === true)
  const excludedDetailFieldIds = powerExchangeMode ? catalog.powerExchangeModel?.inheritedDetailFieldIds : []
  const powerExchangeState = powerExchangeMode ? powerExchangeRealWorldState(answer) : undefined
  const cardExpanded = hasAdaptiveDetailFields(catalog, concept, activePerspective, excludedDetailFieldIds)
    && activeDetailDecision.open
    && (!powerExchangeMode || !['prefer_not', 'soft_limit', 'hard_limit'].includes(powerExchangeState))

  const answeredCount = useMemo(() => perspectives.filter((perspective) => {
    const response = answers[answerKey(conceptId, perspective)]
    return response && (response.preference?.fantasy || response.preference?.realWorld || response.preference?.experienced || response.willingness || response.boundary || response.experience?.tried !== undefined || hasDetailData(response))
  }).length, [answers, conceptId, perspectives])

  return (
    <article className={`concept-card ${cardExpanded ? 'has-expanded-details' : ''}`}>
      <header className="concept-header simplified-concept-header">
        <h3>{concept.label}</h3>
        {answeredCount > 0 && <span className="answered-badge">{perspectives.length > 1 ? `${answeredCount}/${perspectives.length}` : 'Answered'}</span>}
      </header>

      {showDefinition && concept.description && <p className="concept-definition">{concept.description}</p>}

      {riskPrompts.length > 0 && (
        <details className="risk-guidance">
          <summary>Care & consent notes</summary>
          <div className="risk-guidance-body">
            {riskPrompts.map((prompt) => <div key={prompt.id}><strong>{prompt.label}</strong><p>{prompt.text}</p></div>)}
            <small>These are discussion prompts, not instructions.</small>
          </div>
        </details>
      )}

      {perspectives.length > 1 && (
        <div className="perspective-tabs" role="tablist" aria-label={`${concept.label} perspectives`}>
          {perspectives.map((perspective) => (
            <button
              type="button"
              role="tab"
              aria-selected={activePerspective === perspective}
              className={activePerspective === perspective ? 'active' : ''}
              key={perspective}
              onClick={() => setActivePerspective(perspective)}
            >
              {perspectiveLabels[perspective] || perspective}
              {(answers[answerKey(conceptId, perspective)]?.boundary === 'hard_limit' || answers[answerKey(conceptId, perspective)]?.willingness === 'hard_limit') && <span className="limit-dot" />}
            </button>
          ))}
        </div>
      )}

      <PerspectiveEditor
        catalog={catalog}
        concept={concept}
        perspective={activePerspective}
        answer={answer}
        update={(next) => setAnswer(key, next)}
        manualDetailOpen={manualDetailOpen[activePerspective] === true}
        setManualDetailOpen={(value) => setManualDetailOpen((prev) => ({ ...prev, [activePerspective]: value }))}
        powerExchangeMode={powerExchangeMode}
        powerExchangePreferences={powerExchangePreferences}
      />
    </article>
  )
}
