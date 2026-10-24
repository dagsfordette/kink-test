import { useEffect, useMemo, useRef, useState } from 'react'
import ActivityCard from './ActivityCard.jsx'
import BodyAreaExplorer from './BodyAreaExplorer.jsx'
import { orderedActivityCategories } from '../../lib/activityProfile.js'
import { filterQuestions, questionLimit } from '../../lib/explorationFilters.js'
import { createGuided, guidedQueue, chooseGuidedTopic, advanceGuided, preferenceOffer, preferenceKey, describePreference } from '../../lib/guidedExploration.js'

export default function ActivityExplorer({ catalog, activityState, onExploration, onNavigation, onUndo,
  onStance, onExperience, onDetails, onNote, onClear, onResults, onPause, boundaryCount = 0 }) {
  const e = activityState.exploration, g = e.guided || createGuided()
  const [choosing, setChoosing] = useState(!g.topicId)
  const [offer, setOffer] = useState(null)
  const heading = useRef(null)
  const reviewing = Boolean(activityState.navigation.reviewActivityId)
  const activityId = reviewing ? activityState.navigation.reviewActivityId : g.done ? null : g.trail[g.cursor]
  const activity = catalog.activities.find(a => a.id === activityId)
  const answer = activityState.answers[activityId]
  const category = catalog.categories.find(c => c.id === g.topicId)
  const bodyMap = g.topicId === 'body_part_fetishes' && !reviewing && !choosing
  const queue = useMemo(() => guidedQueue(catalog, activityState, g), [catalog, activityState, g])
  const update = next => onExploration({ ...e, guided: next, session: null })
  useEffect(() => {
    const target = offer ? document.querySelector('.guided-preference-offer h2') : !choosing && activityId ? document.getElementById(`activity-${activityId}`)?.querySelector('h3') : null
    ;(target || heading.current)?.focus()
  }, [activityId, choosing, reviewing, offer?.key])
  useEffect(() => {
    if (!reviewing && !choosing && !g.done && activity && !answer?.stance && !g.skippedIds.includes(activity.id) && !queue.some(a => a.id === activity.id)) {
      update(advanceGuided(catalog, activityState, g))
    }
  }, [reviewing, choosing, activity, answer?.stance, queue])
  const chooseTopic = id => {
    update(chooseGuidedTopic(catalog, activityState, g, id))
    onNavigation({ categoryId: id, reviewActivityId: null, search: '', showHidden: false })
    setOffer(null); setChoosing(false)
  }
  const advance = (skip = false, next = g) => { setOffer(null); update(advanceGuided(catalog, activityState, next, skip)) }
  const continueFlow = () => {
    if (reviewing) { onNavigation({ reviewActivityId: null }); return }
    const candidate = preferenceOffer(catalog, activity, answer, g)
    if (candidate) setOffer(candidate)
    else advance()
  }
  const decide = decision => {
    const next = { ...g, decisions: { ...g.decisions, [offer.key]: decision },
      defaults: decision === 'remember' ? { ...g.defaults, [offer.key]: offer.value } : g.defaults }
    const candidate = preferenceOffer(catalog, activity, answer, next)
    update(next)
    if (candidate) setOffer(candidate)
    else advance(false, next)
  }
  const categories = orderedActivityCategories(catalog, activityState)
  return <main className="activity-main guided-explorer no-print">
    <header className="activity-category-intro activity-heading-row">
      <div><span className="kicker">Activity Explorer</span><h1 ref={heading} tabIndex={-1}>{reviewing ? 'Review this answer' : choosing ? 'What would you like to explore?' : category?.label || 'Choose a topic'}</h1>{!reviewing && !choosing && category?.description && <p>{category.description}</p>}</div>
      <button type="button" className="secondary-button" onClick={onResults}>Review answers{boundaryCount ? ` · ${boundaryCount} to check` : ''}</button>
    </header>
    {reviewing ? <button type="button" className="text-button" onClick={() => onNavigation({ reviewActivityId: null })}>Return to my exploration</button> : !choosing && <div className="guided-topic-actions">
      <button type="button" className="text-button" onClick={() => { setOffer(null); setChoosing(true) }}>Change topic</button>
      <button type="button" className="text-button" onClick={onPause}>Pause for now</button>
    </div>}
    {!reviewing && choosing ? <>
      <p>Choose a topic. We’ll take it one activity at a time.</p>
      {g.topicId && <button type="button" className="primary-button" onClick={() => setChoosing(false)}>Resume {category?.label}</button>}
      <section className="guided-topic-grid" aria-label="Choose a topic">{categories.map(c => <button type="button" className="guided-topic" key={c.id} onClick={() => chooseTopic(c.id)}>
        <strong>{c.label}</strong><span>{c.description}</span><small>{Object.keys(activityState.answers).filter(id => catalog.activities.find(a => a.id === id)?.categoryId === c.id).length} answered</small>
      </button>)}</section>
    </> : bodyMap ? <><BodyAreaExplorer activityState={activityState} onExploration={onExploration} /><button type="button" className="primary-button" onClick={() => setChoosing(true)}>Done for now</button></> : offer && !reviewing ? <section className="activity-card guided-preference-offer">
      <h2 tabIndex={-1}>Would this fit other activities too?</h2>
      <p>For “{activity?.label}”, you chose:</p><p><strong>{describePreference(offer.field, offer.value)}</strong></p>
      <p>Remember this as a suggestion for other activities in this topic in the same role?</p>
      <div className="guided-offer-actions">
        <button type="button" className="primary-button" onClick={() => decide('remember')}>Remember this preference</button>
        <button type="button" className="secondary-button" onClick={() => decide('specific')}>Keep it specific to this activity</button>
        <button type="button" className="text-button" onClick={() => decide('depends')}>It depends on the activity</button>
        <button type="button" className="text-button" onClick={() => decide('unsure')}>I’m not sure yet</button>
      </div>
    </section> : activity ? <>
      {!reviewing && <p className="guided-progress" role="status">Activity {g.cursor + 1} in this visit · {queue.filter(a => a.id !== activity.id).length} more currently fit your answers</p>}
      <ActivityCard key={`${reviewing ? 'review' : 'guide'}-${activity.id}`} catalog={catalog} activity={activity} answer={answer} focused={reviewing} guided
        sharedPreferences={g.defaults} onRemember={(field, value) => {
          const key = preferenceKey(activity, field)
          update({ ...g, defaults: { ...g.defaults, [key]: value }, decisions: { ...g.decisions, [key]: 'remember' } })
        }} onStance={v => onStance(activity.id, v)} onExperience={v => onExperience(activity.id, v)}
        onDetails={v => onDetails(activity.id, v)} onNote={v => onNote(activity.id, v)} onClear={() => onClear(activity.id)} />
      <nav className="guided-controls" aria-label="Question navigation">
        {!reviewing && <button type="button" className="secondary-button" disabled={g.cursor <= 0} onClick={() => update({ ...g, cursor: g.cursor - 1 })}>Back</button>}
        {!reviewing && <button type="button" className="text-button" onClick={() => advance(true)}>Skip for now</button>}
        <button type="button" className="primary-button" disabled={!answer?.stance} onClick={continueFlow}>{reviewing ? 'Done editing' : 'Continue'}</button>
      </nav>
      {activityState.lastSave?.activityId === activity.id && <p className="activity-autosave" role="status">Saved. <button type="button" className="text-button" onClick={onUndo}>Undo last change</button></p>}
    </> : <section className="activity-empty-state">
      <h2>You’ve reached the end of this path.</h2><p>Your answers are saved. Choose another topic, revisit skipped questions, or pause here.</p>
      <div className="guided-offer-actions">{g.trail.length > 0 && <button type="button" className="secondary-button" onClick={() => update({ ...g, done: false })}>Back to last activity</button>}<button type="button" className="primary-button" onClick={() => setChoosing(true)}>Choose another topic</button>
      {queue.length > 0 && <button type="button" className="secondary-button" onClick={() => advance()}>Continue with available questions</button>}
      {g.skippedIds.some(id => !activityState.answers[id]?.stance) && <button type="button" className="secondary-button" onClick={() => {
        const next = { ...g, done: false, skippedIds: [], trail: [], cursor: -1 }, first = guidedQueue(catalog, activityState, next)[0]
        update(first ? { ...next, trail: [first.id], cursor: 0 } : next)
      }}>Revisit skipped questions</button>}
      <button type="button" className="text-button" onClick={onPause}>Pause for now</button></div>
    </section>}
    {!reviewing && !choosing && !bodyMap && <details className="guided-path-settings"><summary>What shapes this path?</summary>
      <p>Your fantasy answers, body preferences, and activity answers help choose relevant questions. You can change the topic preferences below.</p>
      {filterQuestions(g.topicId).map(q => <fieldset className="topic-preference" key={q.key}><legend>{q.text}</legend><div className="activity-detail-chips">
        {[[3,'Interested'],[1,'Mild only'],[0,'Not interested'],[-1,'Not sure']].map(([value,label]) => <button type="button" className={`chip ${questionLimit(q,e,activityState.fantasyEvidence) === value ? 'selected' : ''}`} aria-pressed={questionLimit(q,e,activityState.fantasyEvidence) === value} key={value} onClick={() => onExploration({ ...e, topicPreferences: { ...e.topicPreferences, [q.key]: value } })}>{label}</button>)}
      </div></fieldset>)}
      {Object.keys(g.decisions).some(key => key.startsWith(`${g.topicId}/`)) && <button type="button" className="text-button" onClick={() => update({ ...g,
        defaults: Object.fromEntries(Object.entries(g.defaults).filter(([key]) => !key.startsWith(`${g.topicId}/`))),
        decisions: Object.fromEntries(Object.entries(g.decisions).filter(([key]) => !key.startsWith(`${g.topicId}/`)))
      })}>Reset shared preferences for this topic</button>}
    </details>}
  </main>
}
