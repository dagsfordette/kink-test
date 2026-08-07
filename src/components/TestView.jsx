import { useMemo, useState } from 'react'
import AttractionPreferences from './AttractionPreferences.jsx'
import ConceptCard from './ConceptCard.jsx'
import NegotiationPreferences from './NegotiationPreferences.jsx'
import { answerKey, isAnswered, questionDimensions, semanticDirectQuestioning } from '../lib/profile.js'
import { canonicalConceptId, categoriesByDomain, conceptsForCategory } from '../lib/taxonomy.js'
import {
  categoryGatePolicy,
  conceptsForDepth,
  createCategoryGateRecord,
  normalizeCategoryGateRecord,
  normalizeDepthMode,
} from '../lib/depthModes.js'

const gateOptions = [
  ['interested', 'Interested'],
  ['maybe', 'Maybe / unsure'],
  ['not_interested', 'Not interested'],
  ['hard_limit', 'Hard limit'],
  ['skip', 'Skip for now'],
]

function gateExplanation(state) {
  if (state === 'interested') return 'Show the questions for this topic.'
  if (state === 'maybe') return 'Start with a smaller set of questions; you can open the rest whenever you want.'
  if (state === 'not_interested') return 'Keep this topic out of the way unless you choose to browse it.'
  if (state === 'hard_limit') return 'Treat this whole topic as a hard limit and keep its questions collapsed.'
  if (state === 'skip') return 'Leave this topic unanswered for now.'
  return 'Choose one to decide how much of this topic you want to see.'
}

function collapsedCopy(state) {
  if (state === 'hard_limit') return ['Hard limit saved.', 'This topic is collapsed, but you can still look through it without changing that boundary.']
  if (state === 'not_interested') return ['Topic collapsed.', 'You can still browse it for exceptions if you want.']
  if (state === 'skip') return ['Skipped for now.', 'This stays unanswered rather than counting as a negative preference.']
  return ['Choose an option above.', 'The detailed questions stay hidden until you decide how you feel about this topic.']
}

function makePositiveAnswer(catalog, concept) {
  const dimensions = questionDimensions(catalog, concept)
  const answer = {}
  if (dimensions.fantasyAppeal) answer.preference = { ...(answer.preference || {}), fantasy: 'like_it' }
  if (dimensions.realWorldDesire) answer.preference = { ...(answer.preference || {}), realWorld: 'want' }
  if (dimensions.willingness) answer.willingness = 'open_to_it'
  if (dimensions.boundary) answer.boundary = 'none'
  return answer
}

export default function TestView({
  catalog,
  answers,
  setAnswer,
  categoryGates,
  setCategoryGate,
  negotiationPreferences,
  setNegotiationPreferences,
  settings,
  setSettings,
  currentCategoryId,
  setCurrentCategoryId,
  onResults,
  onExport,
  onImport,
  onReset,
}) {
  const [manualOpen, setManualOpen] = useState({})
  const [exhaustiveOverride, setExhaustiveOverride] = useState({})
  const [generalPage, setGeneralPage] = useState(null)
  const domains = catalog.domains || []
  const groupedCategories = useMemo(() => categoriesByDomain(catalog), [catalog])
  const categories = useMemo(() => {
    if (!domains.length) return catalog.categories
    return domains.flatMap((domain) => groupedCategories[domain.id] || [])
  }, [catalog.categories, domains, groupedCategories])
  const currentCategory = categories.find((c) => c.id === currentCategoryId) || categories[0]
  const currentDomain = domains.find((domain) => domain.id === currentCategory?.domainId)
  const mode = normalizeDepthMode(settings.mode)

  const conceptsByCategory = useMemo(() => {
    const result = {}
    for (const category of categories) {
      result[category.id] = conceptsForCategory(catalog, category.id)
        .filter((concept) => semanticDirectQuestioning(catalog, concept))
    }
    return result
  }, [catalog, categories])

  const categoryGate = normalizeCategoryGateRecord(categoryGates?.[currentCategory.id])
  const gatePolicy = categoryGatePolicy(categoryGate)
  const branchOpen = manualOpen[currentCategory.id] === true || gatePolicy.defaultOpen
  const allConcepts = conceptsByCategory[currentCategory.id] || []
  const currentOverride = exhaustiveOverride[currentCategory.id] === true
  const visibleConcepts = branchOpen
    ? conceptsForDepth(currentCategory, allConcepts, mode, {
        representativeOnly: gatePolicy.representativeOnly && !currentOverride,
        exhaustiveOverride: currentOverride,
      })
    : []

  const answeredInCategory = allConcepts.reduce((count, concept) => {
    const conceptId = canonicalConceptId(concept)
    return count + Number((concept.perspectives || []).some((p) => isAnswered(answers[answerKey(conceptId, p)])))
  }, 0)

  const overallAnswered = Object.values(answers).filter(isAnswered).length
  const totalPotential = catalog.concepts.filter((c) => !c.tags?.includes('branch_gate')).length
  const [collapsedTitle, collapsedText] = collapsedCopy(gatePolicy.state)

  const chooseGate = (state) => {
    const selected = categoryGate?.state === state
    setCategoryGate(currentCategory.id, selected ? undefined : createCategoryGateRecord(state))
    if (!selected && ['not_interested', 'hard_limit', 'skip'].includes(state)) {
      setManualOpen((prev) => ({ ...prev, [currentCategory.id]: false }))
    }
  }

  const markVisibleYes = () => {
    for (const concept of visibleConcepts) {
      const conceptId = canonicalConceptId(concept)
      for (const perspective of concept.perspectives || ['mutual']) {
        const key = answerKey(conceptId, perspective)
        if (isAnswered(answers[key])) continue
        setAnswer(key, makePositiveAnswer(catalog, concept))
      }
    }
  }

  const onboardingStep = settings.onboardingStep === 'attraction' ? 'attraction' : 'negotiation'
  if (!settings.onboardingComplete) {
    return (
      <div className="setup-shell">
        <header className="setup-header">
          <div className="brand-lockup">
            <span className="brand-mark small">◇</span>
            <div><strong>Kink Inventory</strong><span>Setup · {onboardingStep === 'negotiation' ? '1 of 2' : '2 of 2'}</span></div>
          </div>
          <button type="button" className="text-button" onClick={onImport}>Import</button>
        </header>
        <main className="setup-main">
          {onboardingStep === 'negotiation' ? (
            <>
              <NegotiationPreferences catalog={catalog} preferences={negotiationPreferences} setPreferences={setNegotiationPreferences} />
              <div className="setup-actions">
                <span>Everything here is optional and editable later.</span>
                <button type="button" className="primary-button" onClick={() => setSettings((prev) => ({ ...prev, onboardingStep: 'attraction' }))}>Continue</button>
              </div>
            </>
          ) : (
            <>
              <AttractionPreferences catalog={catalog} preferences={negotiationPreferences} setPreferences={setNegotiationPreferences} />
              <div className="setup-actions">
                <button type="button" className="secondary-button" onClick={() => setSettings((prev) => ({ ...prev, onboardingStep: 'negotiation' }))}>Back</button>
                <button type="button" className="primary-button" onClick={() => setSettings((prev) => ({ ...prev, onboardingComplete: true, onboardingStep: 'main' }))}>Start questions</button>
              </div>
            </>
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="test-shell">
      <header className="app-header no-print">
        <div className="brand-lockup">
          <span className="brand-mark small">◇</span>
          <div><strong>Kink Inventory</strong><span>Private prototype</span></div>
        </div>
        <div className="header-progress">
          <span>{overallAnswered} answered</span>
          <div className="thin-progress"><span style={{ width: `${Math.min(100, Math.round((overallAnswered / Math.max(1, totalPotential)) * 100))}%` }} /></div>
        </div>
        <nav className="header-actions">
          <button type="button" onClick={onImport}>Import</button>
          <button type="button" onClick={onExport}>JSON</button>
          <button type="button" className="primary-button compact" onClick={onResults}>Results</button>
        </nav>
      </header>

      <div className="workspace">
        <aside className="category-sidebar no-print">
          <div className="sidebar-heading"><span>Topics</span></div>
          <nav className="domain-navigation" aria-label="Questionnaire topics">
            <section className="domain-nav-group negotiation-nav-group">
              <div className="domain-nav-heading"><span>Your defaults</span></div>
              <div className="domain-category-list">
                <button type="button" className={generalPage === 'negotiation' ? 'active' : ''} onClick={() => setGeneralPage('negotiation')}>
                  <span>Negotiation, privacy & care</span>
                </button>
                <button type="button" className={generalPage === 'attraction' ? 'active' : ''} onClick={() => setGeneralPage('attraction')}>
                  <span>Attraction & anatomy</span>
                </button>
              </div>
            </section>
            {(domains.length ? domains : [{ id: 'all', label: 'Categories', description: '' }]).map((domain) => {
              const domainCategories = domains.length ? (groupedCategories[domain.id] || []) : categories
              if (!domainCategories.length) return null
              return (
                <section className={`domain-nav-group ${domain.id === currentDomain?.id && !generalPage ? 'active-domain' : ''}`} key={domain.id}>
                  <div className="domain-nav-heading"><span>{domain.label}</span></div>
                  <div className="domain-category-list">
                    {domainCategories.map((category) => {
                      const categoryConcepts = conceptsByCategory[category.id] || []
                      const count = categoryConcepts.reduce((n, concept) => {
                        const conceptId = canonicalConceptId(concept)
                        return n + Number((concept.perspectives || []).some((p) => isAnswered(answers[answerKey(conceptId, p)])))
                      }, 0)
                      const gateState = categoryGates?.[category.id]?.state
                      return (
                        <button
                          type="button"
                          className={!generalPage && category.id === currentCategory.id ? 'active' : ''}
                          onClick={() => { setGeneralPage(null); setCurrentCategoryId(category.id) }}
                          key={category.id}
                        >
                          <span>{category.label}</span>
                          <span className="nav-status">
                            {gateState === 'hard_limit' && <small className="gate-status hard">Limit</small>}
                            {gateState === 'skip' && <small className="gate-status">Skip</small>}
                            {count > 0 && <small>{count}</small>}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </nav>
          <div className="sidebar-footer">
            <button type="button" className="danger-text" onClick={onReset}>Reset local data</button>
          </div>
        </aside>

        <main className="test-main">
          <div className="mobile-category-select no-print">
            <label>
              <span className="field-label">Section</span>
              <select value={generalPage ? `__${generalPage}__` : currentCategory.id} onChange={(e) => {
                if (e.target.value === '__negotiation__') setGeneralPage('negotiation')
                else if (e.target.value === '__attraction__') setGeneralPage('attraction')
                else { setGeneralPage(null); setCurrentCategoryId(e.target.value) }
              }}>
                <option value="__negotiation__">Negotiation, privacy & care</option>
                <option value="__attraction__">Attraction & anatomy</option>
                {domains.length ? domains.map((domain) => (
                  <optgroup label={domain.label} key={domain.id}>
                    {(groupedCategories[domain.id] || []).map((category) => <option value={category.id} key={category.id}>{category.label}</option>)}
                  </optgroup>
                )) : categories.map((category) => <option value={category.id} key={category.id}>{category.label}</option>)}
              </select>
            </label>
          </div>

          {generalPage === 'negotiation' ? (
            <>
              <NegotiationPreferences catalog={catalog} preferences={negotiationPreferences} setPreferences={setNegotiationPreferences} />
              <div className="category-nav no-print">
                <button type="button" className="secondary-button" onClick={() => setGeneralPage(null)}>Back to questions</button>
                <button type="button" className="primary-button" onClick={onResults}>View results</button>
              </div>
            </>
          ) : generalPage === 'attraction' ? (
            <>
              <AttractionPreferences catalog={catalog} preferences={negotiationPreferences} setPreferences={setNegotiationPreferences} />
              <div className="category-nav no-print">
                <button type="button" className="secondary-button" onClick={() => setGeneralPage(null)}>Back to questions</button>
                <button type="button" className="primary-button" onClick={onResults}>View results</button>
              </div>
            </>
          ) : (
            <>
              <section className="category-intro compact-category-intro">
                <div>
                  <h1>{currentCategory.label}</h1>
                </div>
                <div className="category-stat"><strong>{answeredInCategory}</strong><span>answered</span></div>
              </section>

              <section className="gate-card routing-gate simplified-gate">
                <div className="gate-copy">
                  <h2>How do you feel about {currentCategory.label.toLowerCase()}?</h2>
                  <p>{gateExplanation(gatePolicy.state)}</p>
                </div>
                <div className="gate-controls">
                  <div className="choice-chips large-chips gate-state-chips" aria-label={`${currentCategory.label} topic preference`}>
                    {gateOptions.map(([id, label]) => (
                      <button
                        type="button"
                        className={`chip gate-state-${id} ${categoryGate?.state === id ? 'selected' : ''}`}
                        aria-pressed={categoryGate?.state === id}
                        onClick={() => chooseGate(id)}
                        key={id}
                      >{label}</button>
                    ))}
                  </div>
                  {categoryGate?.state === 'hard_limit' && <div className="category-boundary-note">Saved as a category-wide hard limit.</div>}
                </div>
              </section>

              {!branchOpen && (
                <section className="collapsed-branch">
                  <div>
                    <h2>{collapsedTitle}</h2>
                    <p>{collapsedText}</p>
                  </div>
                  <button type="button" className="secondary-button" onClick={() => setManualOpen((prev) => ({ ...prev, [currentCategory.id]: true }))}>Browse anyway</button>
                </section>
              )}

              {branchOpen && (
                <>
                  <div className="question-list-toolbar">
                    <div>
                      <strong>{visibleConcepts.length} question{visibleConcepts.length === 1 ? '' : 's'}</strong>
                      {gatePolicy.representativeOnly && !currentOverride && <span>Starting with a smaller set. You can show the rest below.</span>}
                    </div>
                    <button type="button" className="secondary-button bulk-yes-button" title="Fills only unanswered items and keeps existing answers or limits unchanged." onClick={markVisibleYes}>Yes to all shown</button>
                  </div>
                  <div className="concept-grid">
                    {visibleConcepts.map((concept) => (
                      <ConceptCard
                        key={concept.id}
                        concept={concept}
                        answers={answers}
                        setAnswer={setAnswer}
                        catalog={catalog}
                        showDefinition={gatePolicy.representativeOnly && !currentOverride}
                      />
                    ))}
                  </div>

                  {!currentOverride && visibleConcepts.length < allConcepts.length && (
                    <div className="show-more-row simple-show-more">
                      <button type="button" className="secondary-button" onClick={() => setExhaustiveOverride((prev) => ({ ...prev, [currentCategory.id]: true }))}>
                        Show all {allConcepts.length} questions
                      </button>
                    </div>
                  )}

                  {currentOverride && mode !== 'exhaustive' && (
                    <div className="show-more-row simple-show-more">
                      <button type="button" className="text-button" onClick={() => setExhaustiveOverride((prev) => ({ ...prev, [currentCategory.id]: false }))}>Show fewer questions</button>
                    </div>
                  )}
                </>
              )}

              <div className="category-nav no-print">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={categories.findIndex((c) => c.id === currentCategory.id) === 0}
                  onClick={() => setCurrentCategoryId(categories[Math.max(0, categories.findIndex((c) => c.id === currentCategory.id) - 1)].id)}
                >Previous</button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    const index = categories.findIndex((c) => c.id === currentCategory.id)
                    if (index === categories.length - 1) onResults()
                    else setCurrentCategoryId(categories[index + 1].id)
                  }}
                >{categories.findIndex((c) => c.id === currentCategory.id) === categories.length - 1 ? 'View results' : 'Next'}</button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
