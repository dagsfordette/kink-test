import { useMemo, useState } from 'react'
import ProfilePreferences from './ProfilePreferences.jsx'
import ConceptCard from './ConceptCard.jsx'
import NegotiationPreferences from './NegotiationPreferences.jsx'
import PowerExchangeOverview, { PowerExchangeCare } from './PowerExchangeOverview.jsx'
import { answerKey, isAnswered, questionDimensions } from '../lib/profile.js'
import { categoriesByDomain, conceptsForCategory } from '../lib/taxonomy.js'
import { applicablePerspectives, profileHasPruningData } from '../lib/profilePruning.js'
import {
  categoryGatePolicy,
  conceptsForDepth,
  createCategoryGateRecord,
  normalizeCategoryGateRecord,
  normalizeDepthMode,
} from '../lib/depthModes.js'
import { patchPowerExchangePreference, powerExchangeModel, shouldShowExtendedPowerExchange, splitConceptsForPowerExchangeRole } from '../lib/powerExchange.js'

function scrollToTop() {
  if (typeof window === 'undefined') return
  window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }))
}

const gateOptions = [
  ['interested', 'Interested'],
  ['maybe', 'Maybe / unsure'],
  ['not_interested', 'Not interested'],
  ['hard_limit', 'Hard limit'],
  ['skip', 'Skip for now'],
]

function gateExplanation(state, category) {
  if (category?.id === 'power_exchange') return 'Power exchange is about consensually giving, taking, or sharing authority within agreed roles, rules, or situations.'
  if (state === 'interested') return 'Explore the questions for this topic.'
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

function answeredOrApplicablePerspectives(concept, preferences, answers, showFiltered = false) {
  const all = concept.perspectives || ['mutual']
  if (showFiltered) return all
  const profileApplicable = new Set(applicablePerspectives(concept, preferences))
  const conceptId = concept.id
  return all.filter((perspective) => profileApplicable.has(perspective) || isAnswered(answers[answerKey(conceptId, perspective)]))
}

export default function TestView({
  catalog,
  answers,
  setAnswer,
  categoryGates,
  setCategoryGate,
  negotiationPreferences,
  setNegotiationPreferences,
  powerExchangePreferences,
  setPowerExchangePreferences,
  settings,
  setSettings,
  currentCategoryId,
  setCurrentCategoryId,
  onResults,
  onExport,
  onImport,
  onReset,
  onBackToWelcome,
}) {
  const [manualOpen, setManualOpen] = useState({})
  const [exhaustiveOverride, setExhaustiveOverride] = useState({})
  const [generalPage, setGeneralPage] = useState(null)
  const [showProfileFiltered, setShowProfileFiltered] = useState(false)
  const domains = catalog.domains || []
  const groupedCategories = useMemo(() => categoriesByDomain(catalog), [catalog])
  const categories = useMemo(() => {
    if (!domains.length) return catalog.categories
    return domains.flatMap((domain) => groupedCategories[domain.id] || [])
  }, [catalog.categories, domains, groupedCategories])
  const currentCategory = categories.find((c) => c.id === currentCategoryId) || categories[0]
  const currentDomain = domains.find((domain) => domain.id === currentCategory?.domainId)
  const mode = normalizeDepthMode(settings.mode)
  const profileFilteringActive = profileHasPruningData(negotiationPreferences)

  const conceptsByCategory = useMemo(() => {
    const result = {}
    for (const category of categories) {
      result[category.id] = conceptsForCategory(catalog, category.id)
    }
    return result
  }, [catalog, categories])

  const categoryGate = normalizeCategoryGateRecord(categoryGates?.[currentCategory.id])
  const gatePolicy = categoryGatePolicy(categoryGate)
  const branchOpen = manualOpen[currentCategory.id] === true || gatePolicy.defaultOpen
  const allConcepts = conceptsByCategory[currentCategory.id] || []
  const currentOverride = exhaustiveOverride[currentCategory.id] === true
  const depthConcepts = branchOpen
    ? conceptsForDepth(currentCategory, allConcepts, mode, {
        representativeOnly: gatePolicy.representativeOnly && !currentOverride,
        exhaustiveOverride: currentOverride,
      })
    : []

  const isPowerExchange = currentCategory.id === 'power_exchange'
  const powerModel = powerExchangeModel(catalog)
  const extendedPowerExchangeOpen = isPowerExchange && shouldShowExtendedPowerExchange(catalog, powerExchangePreferences, answers)
  const extendedPowerExchangeIds = new Set(powerModel.extendedConceptIds || [])
  const perspectiveSourceConcepts = isPowerExchange ? allConcepts : depthConcepts

  const conceptPerspectives = useMemo(() => {
    const result = {}
    for (const concept of perspectiveSourceConcepts) {
      result[concept.id] = answeredOrApplicablePerspectives(
        concept,
        negotiationPreferences,
        answers,
        showProfileFiltered,
      )
    }
    return result
  }, [answers, perspectiveSourceConcepts, negotiationPreferences, showProfileFiltered])

  const visibleConcepts = depthConcepts.filter((concept) => (conceptPerspectives[concept.id] || []).length > 0)
  const powerSpecificConcepts = isPowerExchange ? visibleConcepts.filter((concept) => !extendedPowerExchangeIds.has(concept.id)) : []
  const powerRoleSplit = isPowerExchange ? splitConceptsForPowerExchangeRole(powerSpecificConcepts, powerExchangePreferences?.roleOrientation) : { primary: [], otherRole: [] }
  const powerExtendedConcepts = isPowerExchange && extendedPowerExchangeOpen
    ? allConcepts.filter((concept) => extendedPowerExchangeIds.has(concept.id) && (conceptPerspectives[concept.id] || []).length > 0)
    : []
  const displayedConcepts = isPowerExchange ? [...powerRoleSplit.primary, ...powerExtendedConcepts] : visibleConcepts

  let profileHiddenPerspectives = 0
  let profileHiddenConcepts = 0
  if (!showProfileFiltered && profileFilteringActive) {
    for (const concept of depthConcepts) {
      const allPerspectives = concept.perspectives || ['mutual']
      const visiblePerspectives = conceptPerspectives[concept.id] || []
      profileHiddenPerspectives += Math.max(0, allPerspectives.length - visiblePerspectives.length)
      if (visiblePerspectives.length === 0 && allPerspectives.length > 0) profileHiddenConcepts += 1
    }
  }

  const answeredInCategory = allConcepts.reduce((count, concept) => {
    const conceptId = concept.id
    const perspectives = answeredOrApplicablePerspectives(concept, negotiationPreferences, answers, showProfileFiltered)
    return count + Number(perspectives.some((p) => isAnswered(answers[answerKey(conceptId, p)])))
  }, 0)

  const overallAnswered = Object.values(answers).filter(isAnswered).length
  const totalPotential = catalog.concepts.length
  const [collapsedTitle, collapsedText] = collapsedCopy(gatePolicy.state)

  const chooseGate = (state) => {
    const selected = categoryGate?.state === state
    setCategoryGate(currentCategory.id, selected ? undefined : createCategoryGateRecord(state))
    if (!selected && ['not_interested', 'hard_limit', 'skip'].includes(state)) {
      setManualOpen((prev) => ({ ...prev, [currentCategory.id]: false }))
    }
  }

  const markVisibleYes = () => {
    for (const concept of displayedConcepts) {
      const conceptId = concept.id
      const perspectives = conceptPerspectives[conceptId] || []
      for (const perspective of perspectives) {
        const key = answerKey(conceptId, perspective)
        if (isAnswered(answers[key])) continue
        setAnswer(key, makePositiveAnswer(catalog, concept))
      }
    }
  }

  const onboardingStep = ['profile', 'negotiation', 'marks'].includes(settings.onboardingStep) ? settings.onboardingStep : 'profile'
  const onboardingProgress = onboardingStep === 'profile' ? '1 of 3' : onboardingStep === 'negotiation' ? '2 of 3' : '3 of 3'
  if (!settings.onboardingComplete) {
    return (
      <div className="setup-shell">
        <header className="setup-header">
          <div className="brand-lockup">
            <span className="brand-mark small">◇</span>
            <div><strong>Kink Exploration</strong><span>Setup · {onboardingProgress}</span></div>
          </div>
          <button type="button" className="text-button" onClick={onImport}>Import</button>
        </header>
        <main className="setup-main">
          {onboardingStep === 'profile' ? (
            <>
              <ProfilePreferences catalog={catalog} preferences={negotiationPreferences} setPreferences={setNegotiationPreferences} setupMode />
              <div className="setup-actions">
                <button type="button" className="secondary-button" onClick={onBackToWelcome}>Back</button>
                <span>Anything left blank stays optional.</span>
                <button type="button" className="primary-button" onClick={() => { setSettings((prev) => ({ ...prev, onboardingStep: 'negotiation' })); scrollToTop() }}>Continue to negotiation & care</button>
              </div>
            </>
          ) : onboardingStep === 'negotiation' ? (
            <>
              <NegotiationPreferences catalog={catalog} preferences={negotiationPreferences} setPreferences={setNegotiationPreferences} setupMode />
              <div className="setup-actions">
                <button type="button" className="secondary-button" onClick={() => { setSettings((prev) => ({ ...prev, onboardingStep: 'profile' })); scrollToTop() }}>Back to tailoring</button>
                <span>Everything here is optional and editable later.</span>
                <button type="button" className="primary-button" onClick={() => { setSettings((prev) => ({ ...prev, onboardingStep: 'marks' })); scrollToTop() }}>Continue to marks & after-effects</button>
              </div>
            </>
          ) : (
            <>
              <NegotiationPreferences
                catalog={catalog}
                preferences={negotiationPreferences}
                setPreferences={setNegotiationPreferences}
                setupMode
                setupStep="3 of 3"
                sectionIds={['marks']}
                heading="Marks & visible after-effects"
                description="Set broad boundaries for how long visible marks may last and how much marking is generally okay on different body areas. Marks can come from activities like spankings, being given a hickey, or being written on. More details on this later."
                footnote="These are broad defaults. A specific activity or situation can still have a stricter boundary."
                standaloneSection
              />
              <div className="setup-actions">
                <button type="button" className="secondary-button" onClick={() => { setSettings((prev) => ({ ...prev, onboardingStep: 'negotiation' })); scrollToTop() }}>Back to negotiation & care</button>
                <span>Everything here is optional and editable later.</span>
                <button type="button" className="primary-button" onClick={() => { setSettings((prev) => ({ ...prev, onboardingComplete: true, onboardingStep: 'main' })); scrollToTop() }}>Continue to questions</button>
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
          <div><strong>Kink Exploration</strong><span>Private prototype</span></div>
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
          <nav className="domain-navigation" aria-label="Exploration topics">
            <section className="domain-nav-group negotiation-nav-group">
              <div className="domain-nav-heading"><span>Your setup</span></div>
              <div className="domain-category-list">
                <button type="button" className={generalPage === 'profile' ? 'active' : ''} onClick={() => { setGeneralPage('profile'); scrollToTop() }}>
                  <span>Tailor questions</span>
                </button>
                <button type="button" className={generalPage === 'negotiation' ? 'active' : ''} onClick={() => { setGeneralPage('negotiation'); scrollToTop() }}>
                  <span>Negotiation & care</span>
                </button>
                <button type="button" className={generalPage === 'marks' ? 'active' : ''} onClick={() => { setGeneralPage('marks'); scrollToTop() }}>
                  <span>Marks & after-effects</span>
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
                        const conceptId = concept.id
                        const perspectives = answeredOrApplicablePerspectives(concept, negotiationPreferences, answers, showProfileFiltered)
                        return n + Number(perspectives.some((p) => isAnswered(answers[answerKey(conceptId, p)])))
                      }, 0)
                      const gateState = categoryGates?.[category.id]?.state
                      return (
                        <button
                          type="button"
                          className={!generalPage && category.id === currentCategory.id ? 'active' : ''}
                          onClick={() => { setGeneralPage(null); setCurrentCategoryId(category.id); scrollToTop() }}
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
                if (e.target.value === '__profile__') { setGeneralPage('profile'); scrollToTop() }
                else if (e.target.value === '__negotiation__') { setGeneralPage('negotiation'); scrollToTop() }
                else if (e.target.value === '__marks__') { setGeneralPage('marks'); scrollToTop() }
                else { setGeneralPage(null); setCurrentCategoryId(e.target.value); scrollToTop() }
              }}>
                <option value="__profile__">Tailor questions</option>
                <option value="__negotiation__">Negotiation & care</option>
                <option value="__marks__">Marks & visible after-effects</option>
                {domains.length ? domains.map((domain) => (
                  <optgroup label={domain.label} key={domain.id}>
                    {(groupedCategories[domain.id] || []).map((category) => <option value={category.id} key={category.id}>{category.label}</option>)}
                  </optgroup>
                )) : categories.map((category) => <option value={category.id} key={category.id}>{category.label}</option>)}
              </select>
            </label>
          </div>

          {generalPage === 'profile' ? (
            <>
              <ProfilePreferences catalog={catalog} preferences={negotiationPreferences} setPreferences={setNegotiationPreferences} />
              <div className="category-nav no-print">
                <button type="button" className="secondary-button" onClick={() => setGeneralPage(null)}>Back to questions</button>
                <button type="button" className="primary-button" onClick={onResults}>View results</button>
              </div>
            </>
          ) : generalPage === 'negotiation' ? (
            <>
              <NegotiationPreferences catalog={catalog} preferences={negotiationPreferences} setPreferences={setNegotiationPreferences} />
              <div className="category-nav no-print">
                <button type="button" className="secondary-button" onClick={() => { setGeneralPage(null); scrollToTop() }}>Back to questions</button>
                <button type="button" className="primary-button" onClick={onResults}>View results</button>
              </div>
            </>
          ) : generalPage === 'marks' ? (
            <>
              <NegotiationPreferences
                catalog={catalog}
                preferences={negotiationPreferences}
                setPreferences={setNegotiationPreferences}
                sectionIds={['marks']}
                heading="Marks & visible after-effects"
                description="Set broad boundaries for how long visible marks may last and how much marking is generally okay on different body areas. Marks can come from activities like spankings, being given a hickey, or being written on. More details on this later."
                footnote="These are broad defaults. A specific activity or situation can still have a stricter boundary."
                standaloneSection
              />
              <div className="category-nav no-print">
                <button type="button" className="secondary-button" onClick={() => { setGeneralPage(null); scrollToTop() }}>Back to questions</button>
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
                  <p>{gateExplanation(gatePolicy.state, currentCategory)}</p>
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
                  {isPowerExchange && (
                    <PowerExchangeOverview
                      catalog={catalog}
                      preferences={powerExchangePreferences}
                      setPreferences={setPowerExchangePreferences}
                    />
                  )}

                  {profileFilteringActive && (profileHiddenPerspectives > 0 || showProfileFiltered) && (
                    <div className="profile-filter-bar">
                      <div>
                        <strong>{showProfileFiltered ? 'All questions are temporarily visible.' : 'Some questions are tailored to your optional setup.'}</strong>
                        <span>
                          {showProfileFiltered
                            ? 'Use your tailoring again whenever you want a more focused view.'
                            : 'You can show every question here if you want to browse beyond those optional answers.'}
                        </span>
                      </div>
                      <button type="button" className="text-button" onClick={() => setShowProfileFiltered((value) => !value)}>
                        {showProfileFiltered ? 'Use my tailoring' : 'Show all questions'}
                      </button>
                    </div>
                  )}

                  {isPowerExchange ? (
                    <>
                      <section className="power-exchange-question-section" aria-labelledby="power-exchange-specific-heading">
                        <div className="power-exchange-section-heading compact">
                          <span className="kicker">Specific expressions</span>
                          <h2 id="power-exchange-specific-heading">What kinds of Power Exchange appeal to you?</h2>
                        </div>
                        <div className="concept-grid">
                          {powerRoleSplit.primary.map((concept) => (
                            <ConceptCard
                              key={concept.id}
                              concept={concept}
                              answers={answers}
                              setAnswer={setAnswer}
                              catalog={catalog}
                              perspectivesOverride={conceptPerspectives[concept.id]}
                              showDefinition={gatePolicy.representativeOnly && !currentOverride}
                              powerExchangeMode
                              powerExchangePreferences={powerExchangePreferences}
                            />
                          ))}
                        </div>

                        {powerRoleSplit.otherRole.length > 0 && (
                          <details className="other-role-interests">
                            <summary>Explore other-role interests ({powerRoleSplit.otherRole.length})</summary>
                            <p>You can still explore interests from another role if they appeal to you.</p>
                            <div className="concept-grid">
                              {powerRoleSplit.otherRole.map((concept) => (
                                <ConceptCard
                                  key={concept.id}
                                  concept={concept}
                                  answers={answers}
                                  setAnswer={setAnswer}
                                  catalog={catalog}
                                  perspectivesOverride={conceptPerspectives[concept.id]}
                                  showDefinition
                                  powerExchangeMode
                                  powerExchangePreferences={powerExchangePreferences}
                                />
                              ))}
                            </div>
                          </details>
                        )}
                      </section>

                      {!extendedPowerExchangeOpen && (
                        <section className="extended-dynamics-closed">
                          <div>
                            <span className="kicker">Optional depth</span>
                            <h2>Ongoing & extended dynamics</h2>
                            <p>Open this if you want to explore ongoing D/s, 24/7 structures, very broad delegated authority, protocol-heavy relationships, or negotiated sexual availability.</p>
                          </div>
                          <button type="button" className="secondary-button" onClick={() => setPowerExchangePreferences((prev) => patchPowerExchangePreference(catalog, prev, 'exploreExtended', true))}>Explore extended dynamics</button>
                        </section>
                      )}

                      {extendedPowerExchangeOpen && (
                        <section className="power-exchange-question-section extended-dynamics-section" aria-labelledby="extended-dynamics-heading">
                          <div className="power-exchange-section-heading compact">
                            <span className="kicker">Ongoing & extended dynamics</span>
                            <h2 id="extended-dynamics-heading">Longer-running and broader agreements</h2>
                            <p>These are distinct models rather than synonyms for “highly structured.” Their follow-ups focus on what continues, what pauses, and what the agreement actually covers.</p>
                          </div>
                          <div className="concept-grid">
                            {powerExtendedConcepts.map((concept) => (
                              <ConceptCard
                                key={concept.id}
                                concept={concept}
                                answers={answers}
                                setAnswer={setAnswer}
                                catalog={catalog}
                                perspectivesOverride={conceptPerspectives[concept.id]}
                                showDefinition
                                powerExchangeMode
                                powerExchangePreferences={powerExchangePreferences}
                              />
                            ))}
                          </div>
                        </section>
                      )}

                      <PowerExchangeCare catalog={catalog} preferences={powerExchangePreferences} setPreferences={setPowerExchangePreferences} />
                    </>
                  ) : (
                    <>
                      <div className="question-list-toolbar">
                        <div>
                          <strong>{visibleConcepts.length} question{visibleConcepts.length === 1 ? '' : 's'}</strong>
                          {gatePolicy.representativeOnly && !currentOverride && <span>Starting with a smaller set. You can show the rest below.</span>}
                        </div>
                        <button type="button" className="secondary-button bulk-yes-button" title="Fills only unanswered visible items and keeps existing answers or limits unchanged." onClick={markVisibleYes}>Yes to all shown</button>
                      </div>
                      <div className="concept-grid">
                        {visibleConcepts.map((concept) => (
                          <ConceptCard
                            key={concept.id}
                            concept={concept}
                            answers={answers}
                            setAnswer={setAnswer}
                            catalog={catalog}
                            perspectivesOverride={conceptPerspectives[concept.id]}
                            showDefinition={gatePolicy.representativeOnly && !currentOverride}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {!currentOverride && depthConcepts.length < allConcepts.length && (
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
                    else { setCurrentCategoryId(categories[index + 1].id); scrollToTop() }
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
