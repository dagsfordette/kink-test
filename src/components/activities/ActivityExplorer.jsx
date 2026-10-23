import { useMemo, useRef, useState } from 'react'
import ActivityCategoryNav from './ActivityCategoryNav.jsx'
import ActivityCard from './ActivityCard.jsx'
import BodyAreaExplorer from './BodyAreaExplorer.jsx'
import { filterActivities } from '../../lib/activityProfile.js'
import { createEligibilityContext, evaluateActivity } from '../../lib/eligibility.js'
import { filterQuestions, questionLimit } from '../../lib/explorationFilters.js'

function PreferenceQuestions({ questions, exploration, evidence, onChange }) {
  return questions.map((question) => {
    const manual = exploration.topicPreferences || {}
    const selected = Object.hasOwn(manual, question.key) ? manual[question.key] : questionLimit(question, exploration, evidence)
    return (
      <fieldset className="topic-preference" key={question.key}>
        <legend>{question.text}</legend>
        <div className="activity-detail-chips">
          {[[3, 'Interested'], [1, 'Mild only'], [0, 'Not interested'], [-1, 'Not sure']].map(([value, label]) => (
            <button type="button" className={`chip ${selected === value ? 'selected' : ''}`} aria-pressed={selected === value} key={value}
              onClick={() => onChange({ ...exploration, topicPreferences: { ...exploration.topicPreferences, [question.key]: value } })}>{label}</button>
          ))}
          {Object.hasOwn(manual, question.key) && <button type="button" className="text-button" onClick={() => {
            const next = { ...exploration.topicPreferences }
            delete next[question.key]
            onChange({ ...exploration, topicPreferences: next })
          }}>Use fantasy result / reset</button>}
        </div>
      </fieldset>
    )
  })
}

export default function ActivityExplorer({ catalog, activityState, onExploration, onNavigation, onUndo,
  onStance, onExperience, onDetails, onNote, onClear, onToggleHidden, onResults, boundaryCount = 0 }) {
  const nav = activityState.navigation, e = activityState.exploration
  const headingRef = useRef(null)
  const [pageNumber, setPageNumber] = useState(0)
  const context = useMemo(() => createEligibilityContext(catalog, activityState, activityState.fantasyEvidence), [catalog, activityState])
  const rows = useMemo(() => filterActivities(catalog, activityState, {}, context), [catalog, activityState, context])
  const category = catalog.categories.find((c) => c.id === nav.categoryId)
  const reviewing = Boolean(nav.reviewActivityId)
  const bodyMap = nav.categoryId === 'body_part_fetishes' && !reviewing
  const counts = useMemo(() => {
    const result = Object.fromEntries(catalog.categories.map((c) => [c.id, { answered: 0, available: 0, excluded: 0 }]))
    for (const a of catalog.activities) {
      const count = result[a.categoryId]
      if (activityState.answers[a.id]) count.answered++
      else if (evaluateActivity(a, context, { ignoreSession: true }).queueVisible) count.available++
      else count.excluded++
    }
    return result
  }, [catalog, activityState, context])
  // Stable page membership: saving and cascading filters never pull a different card into an edited page.
  const scope = JSON.stringify([nav.categoryId, nav.showHidden, nav.reviewActivityId])
  const membership = useRef({ scope: null, ids: [] })
  if (membership.current.scope !== scope) membership.current = { scope, ids: rows.map((a) => a.id) }
  const known = new Set(membership.current.ids)
  for (const row of rows) if (!known.has(row.id)) membership.current.ids.push(row.id)
  const byId = new Map(rows.map((a) => [a.id, a]))
  const listIds = membership.current.ids
  const pageCount = Math.max(1, Math.ceil(listIds.length / 30))
  const page = Math.min(pageNumber, pageCount - 1)
  const visibleRows = listIds.slice(page * 30, (page + 1) * 30).map((id) => byId.get(id)).filter(Boolean)
  const questions = filterQuestions(nav.categoryId)
  const unansweredQuestions = questions.filter((q) => !Object.hasOwn(e.topicPreferences || {}, q.key) && questionLimit(q, e, activityState.fantasyEvidence) === null)
  const selectCategory = (id) => {
    setPageNumber(0)
    onNavigation({ categoryId: id, reviewActivityId: null, search: '', bypassPromptDeferral: true })
  }
  const pagination = <nav className="exploration-pagination" aria-label="Activity pages">
    <button type="button" disabled={page === 0} onClick={() => { setPageNumber(page - 1); headingRef.current?.scrollIntoView() }}>Previous page</button>
    <span>Page {page + 1} of {pageCount}</span>
    <button type="button" disabled={page + 1 === pageCount} onClick={() => { setPageNumber(page + 1); headingRef.current?.scrollIntoView() }}>Next page</button>
  </nav>
  return (
    <div className="activity-explorer-root no-print">
      <div className="activity-workspace">
        <ActivityCategoryNav catalog={catalog} counts={counts} activityState={activityState} categoryId={nav.categoryId} onSelect={selectCategory} />
        <main className="activity-main">
          <header className="activity-category-intro activity-heading-row">
            <h1 ref={headingRef} tabIndex={-1}>{reviewing ? 'Review this answer' : category?.label || 'Activities'}</h1>
            <button type="button" className="secondary-button" onClick={onResults}>Review answers{boundaryCount ? ` · ${boundaryCount} to check` : ''}</button>
          </header>
          {!reviewing && !bodyMap && unansweredQuestions.length > 0 && <section className="activity-clarification">
            <p>A quick preference to help narrow this down:</p>
            <PreferenceQuestions questions={unansweredQuestions} exploration={e} evidence={activityState.fantasyEvidence} onChange={onExploration} />
          </section>}
          {!bodyMap && <div className="activity-filter-toolbar">
            <span role="status">{rows.length} activities · {Object.keys(activityState.answers).length} answered</span>
            <details className="activity-filter-options">
              <summary>Adjust filters</summary>
              <PreferenceQuestions questions={questions} exploration={e} evidence={activityState.fantasyEvidence} onChange={onExploration} />
              <label><input type="checkbox" checked={nav.showHidden} onChange={(event) => onNavigation({ showHidden: event.target.checked })} /> Show excluded activities</label>
            </details>
          </div>}
          {reviewing && <button type="button" className="text-button" onClick={() => onNavigation({ reviewActivityId: null })}>Back to activities</button>}
          {!bodyMap && activityState.lastSave && <div className="activity-autosave" role="status">Saved automatically. <button type="button" className="text-button" onClick={onUndo}>Undo last change</button></div>}
          {!bodyMap && pageCount > 1 && pagination}
          {bodyMap ? <BodyAreaExplorer activityState={activityState} onExploration={onExploration} /> : <>
          {(!nav.categoryId || nav.categoryId === 'all') && <button type="button" className="body-map-entry secondary-button" onClick={() => selectCategory('body_part_fetishes')}>Explore body-area interests on the body map →</button>}
          <section className="activity-card-list" aria-label="Activities">
            {!visibleRows.length && <div className="activity-empty-state"><p>No activities on this page fit your current answers.</p><p>Choose another page or category, or adjust filters to see exclusions.</p></div>}
            {visibleRows.map((activity) => {
              const derived = evaluateActivity(activity, context, { reveal: nav.showHidden || reviewing })
              const excluded = derived.reasons.filter((r) => r.suppresses && r.code !== 'already_answered')
              return <div key={activity.id} className="exploration-item">
                {(nav.showHidden || reviewing) && excluded.map((r, i) => <p className="eligibility-reason" key={i}>{r.message}</p>)}
                <ActivityCard catalog={catalog} activity={activity} answer={activityState.answers[activity.id]} focused={reviewing}
                  hidden={nav.hiddenActivityIds.includes(activity.id)}
                  onStance={(v) => onStance(activity.id, v)} onExperience={(v) => onExperience(activity.id, v)}
                  onDetails={(v) => onDetails(activity.id, v)} onNote={(v) => onNote(activity.id, v)}
                  onClear={() => onClear(activity.id)} onToggleHidden={() => onToggleHidden(activity.id)} />
                {nav.showHidden && excluded.some((r) => ['theme_preference', 'power_preference'].includes(r.code)) &&
                  <button type="button" className="text-button" onClick={() => onExploration({ ...e, inferredFilterOverrides: { ...e.inferredFilterOverrides, [activity.id]: 'keep_in_exploration' } })}>Include anyway</button>}
              </div>
            })}
          </section></>}
          {!bodyMap && pageCount > 1 && pagination}
        </main>
      </div>
    </div>
  )
}
