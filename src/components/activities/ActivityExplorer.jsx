import { useEffect, useMemo, useRef } from 'react'
import ActivityCard from './ActivityCard.jsx'
import { TATTOO_GROUP, BODY_SCENT_GROUP } from '../../lib/featureInterests.js'
import SensoryExplorer from './SensoryExplorer.jsx'
import ToyExplorer from './ToyExplorer.jsx'
import FeatureExplorer from './FeatureExplorer.jsx'
import ContextExplorer from './ContextExplorer.jsx'
import RoleplayExplorer from './RoleplayExplorer.jsx'
import MaterialInterestsExplorer from './MaterialInterestsExplorer.jsx'
import BodyAreaExplorer from './BodyAreaExplorer.jsx'
import { filterQuestions, questionLimit } from '../../lib/explorationFilters.js'
import { createGuided, guidedQueue, resumeGuidedFlow, advanceGuidedFlow, backGuidedFlow, nextPreferencePrompt, finishPreferencePrompt, preferenceQuestion, sharedFields, validValue } from '../../lib/guidedExploration.js'

export default function ActivityExplorer({ catalog, activityState, onExploration, onNavigation, onUndo,
  onStance, onExperience, onDetails, onNote, onClear, onResults, onPause, boundaryCount = 0 }) {
  const e = activityState.exploration, g = e.guided || createGuided()
  const pending = g.pendingPreference
  const promptActivity = catalog.activities.find(a => a.id === pending?.activityId)
  const promptField = sharedFields(catalog, promptActivity).find(f => f.id === pending?.fieldId)
  const heading = useRef(null)
  const reviewing = Boolean(activityState.navigation.reviewActivityId)
  const activityId = reviewing ? activityState.navigation.reviewActivityId : g.done ? null : g.trail[g.cursor]
  const activity = catalog.activities.find(a => a.id === activityId)
  const answer = activityState.drafts?.[activityId] || activityState.answers[activityId]
  const category = catalog.categories.find(c => c.id === g.topicId)
  const toys = g.topicId === 'toys_devices' && !reviewing && !g.done
  const scent = g.topicId === 'body_scent' && !reviewing && !g.done
  const sensory = g.topicId === 'sensory_fetishes' && !reviewing && !g.done
  const tattoos = g.topicId === 'tattoo_interests' && !reviewing && !g.done
  const features = g.topicId === 'body_features' && !reviewing && !g.done
  const contexts = g.topicId === 'sexual_context' && !reviewing && !g.done
  const roleplay = g.topicId === 'roleplay' && !reviewing && !g.done
  const materials = g.topicId === 'fetish_materials' && !reviewing && !g.done
  const bodyMap = g.topicId === 'body_part_fetishes' && !reviewing && !g.done
  const queue = useMemo(() => guidedQueue(catalog, activityState, g), [catalog, activityState, g])
  const update = next => {
    onExploration({ ...e, guided: next, session: null })
    if (next.topicId !== g.topicId) onNavigation({ categoryId: next.topicId || 'all', reviewActivityId: null, search: '', showHidden: false })
  }
  useEffect(() => {
    const target = pending ? document.querySelector('.guided-preference-offer h2') : activityId ? document.getElementById(`activity-${activityId}`)?.querySelector('h3') : null
    ;(target || heading.current)?.focus()
  }, [activityId, g.topicId, reviewing, pending?.fieldId])
  useEffect(() => {
    if (reviewing) return
    if (pending) {
      if (!promptField || !['love','want','curious','if_partner_wants','not_sure'].includes(activityState.answers[pending.activityId]?.stance)) update({ ...g, pendingPreference: null })
      return
    }
    const resumed = resumeGuidedFlow(catalog, activityState, g)
    if (resumed !== g) update(resumed)
    else if (!g.done && activity && !answer?.stance && !g.skippedIds.includes(activity.id) && !queue.some(a => a.id === activity.id)) update(advanceGuidedFlow(catalog, activityState, g))
  }, [reviewing, activity, answer?.stance, queue, pending])
  const advance = (skip = false, next = g) => update(advanceGuidedFlow(catalog, activityState, { ...next, pendingPreference: null }, skip))
  const continueFlow = () => {
    if (reviewing) { onNavigation({ reviewActivityId: null }); return }
    const candidate = nextPreferencePrompt(catalog, activityState, g)
    if (candidate) update({ ...g, pendingPreference: candidate })
    else advance()
  }
  const decide = decision => {
    const next = finishPreferencePrompt(catalog, activityState, g, decision)
    if (next !== g) advance(false, next)
  }
  const canGoBack = g.cursor > 0 || g.topicHistory?.length > 0
  return <main className="activity-main guided-explorer no-print">
    <header className="activity-category-intro activity-heading-row">
      <div><h1 ref={heading} tabIndex={-1}>{reviewing ? 'Review this answer' : category?.label || 'Activity Explorer'}</h1>{!reviewing && category?.description && !g.done && <p>{category.description}</p>}</div>
      <button type="button" className="secondary-button" onClick={onResults}>Review answers{boundaryCount ? ` · ${boundaryCount} to check` : ''}</button>
    </header>
    {reviewing && <button type="button" className="text-button" onClick={() => onNavigation({ reviewActivityId: null })}>Return to my exploration</button>}
    {materials || roleplay || contexts || features || tattoos || sensory || scent || toys ? <>
      {toys ? <ToyExplorer catalog={catalog} activityState={activityState} onExploration={onExploration} /> : sensory ? <SensoryExplorer activityState={activityState} onExploration={onExploration} /> : features || tattoos || scent ? <FeatureExplorer key={g.topicId} groups={scent ? [BODY_SCENT_GROUP] : tattoos ? [TATTOO_GROUP] : undefined} activityState={activityState} onExploration={onExploration} /> : contexts ? <ContextExplorer activityState={activityState} onExploration={onExploration} /> : roleplay ? <RoleplayExplorer activityState={activityState} onExploration={onExploration} /> : <MaterialInterestsExplorer activityState={activityState} onExploration={onExploration} />}
      <nav className="guided-controls" aria-label="Category navigation">
        <button type="button" className="secondary-button" disabled={!canGoBack} onClick={() => update(backGuidedFlow(g))}>Back</button>
        <button type="button" className="text-button" onClick={onPause}>Pause for now</button>
        <button type="button" className="primary-button" onClick={() => advance()}>Continue</button>
      </nav>
    </> : bodyMap ? <>
      <BodyAreaExplorer activityState={activityState} onExploration={onExploration} />
      <nav className="guided-controls" aria-label="Question navigation">
        <button type="button" className="secondary-button" disabled={!canGoBack} onClick={() => update(backGuidedFlow(g))}>Back</button>
        <button type="button" className="text-button" onClick={onPause}>Pause for now</button>
        <button type="button" className="primary-button" onClick={() => advance()}>Continue</button>
      </nav>
    </> : pending && promptActivity && promptField && !reviewing ? <section className="activity-card guided-preference-offer">
      <h2 tabIndex={-1}>{preferenceQuestion(promptActivity, promptField)}</h2>
      <p>{promptField.id === 'tone' ? 'The same direction can feel playful or firm, with everyday or formal wording.' : promptField.id === 'role_scope' ? 'These dynamics can stay within scenes or extend into selected parts of everyday life.' : 'The same activity can have a playful, affectionate, focused, or formal atmosphere.'}</p>
      <p>Thinking about the activities you’ve explored:</p>
      <ul>{pending.exampleIds.slice(-2).map(id => <li key={id}>{catalog.activities.find(a => a.id === id)?.label}</li>)}</ul>
      <div className="activity-detail-chips" role="group" aria-label={promptField.label}>
        {promptField.options.map(option => {
          const selected = promptField.type === 'single_select' ? pending.value === option.id : pending.value.includes(option.id)
          return <button type="button" key={option.id} className={`chip ${selected ? 'selected' : ''}`} aria-pressed={selected} onClick={() => update({ ...g, pendingPreference: { ...pending,
            value: promptField.type === 'single_select' ? option.id : selected ? pending.value.filter(id => id !== option.id) : [...pending.value, option.id]
          } })}>{option.label}</button>
        })}
      </div>
      <div className="guided-controls">
        <button type="button" className="secondary-button" onClick={() => update({ ...g, pendingPreference: null })}>Back to activity</button>
        <button type="button" className="primary-button" disabled={!validValue(promptField, pending.value)} onClick={() => decide('remember')}>Remember and continue</button>
        <button type="button" className="text-button" onClick={() => decide('unsure')}>I’m not sure yet</button>
        <button type="button" className="text-button" onClick={() => decide('depends')}>It depends on the activity</button>
        <button type="button" className="text-button" onClick={onPause}>Pause for now</button>
      </div>
    </section> : activity ? <>
      <ActivityCard key={`${reviewing ? 'review' : 'guide'}-${activity.id}`} catalog={catalog} activity={activity} answer={answer} focused={reviewing} guided
        sharedPreferences={g.defaults} sharedDecisions={g.decisions} onStance={v => onStance(activity.id, v)} onExperience={v => onExperience(activity.id, v)}
        onDetails={v => onDetails(activity.id, v)} onNote={v => onNote(activity.id, v)} onClear={() => onClear(activity.id)} />
      <nav className="guided-controls" aria-label="Question navigation">
        {!reviewing && <button type="button" className="secondary-button" disabled={!canGoBack} onClick={() => update(backGuidedFlow(g))}>Back</button>}
        {!reviewing && <button type="button" className="text-button" onClick={() => advance(true)}>Skip for now</button>}
        {!reviewing && <button type="button" className="text-button" onClick={onPause}>Pause for now</button>}
        <button type="button" className="primary-button" disabled={!answer?.stance} onClick={continueFlow}>{reviewing ? 'Done editing' : 'Continue'}</button>
      </nav>
      {activityState.lastSave?.activityId === activity.id && <p className="activity-autosave" role="status">Saved. <button type="button" className="text-button" onClick={onUndo}>Undo last change</button></p>}
    </> : g.flowComplete ? <section className="activity-empty-state">
      <h2>You’ve reached the end for now.</h2>
      <div className="guided-offer-actions">
        {(g.trail.length > 0 || canGoBack || ['body_part_fetishes', 'fetish_materials', 'roleplay', 'sexual_context', 'body_features', 'tattoo_interests', 'sensory_fetishes', 'body_scent', 'toys_devices'].includes(g.topicId)) && <button type="button" className="secondary-button" onClick={() => update(backGuidedFlow(g))}>Back</button>}
        {g.skippedIds.some(id => !activityState.answers[id]?.stance) && <button type="button" className="primary-button" onClick={() => update(resumeGuidedFlow(catalog, activityState, { ...g, topicId: null, skippedIds: [], trail: [], cursor: -1, done: true, flowComplete: false }))}>Revisit skipped questions</button>}
        <button type="button" className="text-button" onClick={onPause}>Pause for now</button>
      </div>
    </section> : null}
    {!reviewing && !bodyMap && activity && !pending && <details className="guided-path-settings"><summary>What shapes this path?</summary>
      <p>Your fantasy answers, body preferences, and activity answers help choose relevant questions. You can change the topic preferences below.</p>
      {filterQuestions(g.topicId).map(q => <fieldset className="topic-preference" key={q.key}><legend>{q.text}</legend><div className="activity-detail-chips">
        {[[3,'Interested'],[1,'Mild only'],[0,'Not interested'],[-1,'Not sure']].map(([value,label]) => <button type="button" className={`chip ${questionLimit(q,e,activityState.fantasyEvidence) === value ? 'selected' : ''}`} aria-pressed={questionLimit(q,e,activityState.fantasyEvidence) === value} key={value} onClick={() => onExploration({ ...e, topicPreferences: { ...e.topicPreferences, [q.key]: value } })}>{label}</button>)}
      </div></fieldset>)}
      {Object.keys(g.decisions).some(key => key.startsWith(`${g.topicId}/`)) && <button type="button" className="text-button" onClick={() => update({ ...g,
        defaults: Object.fromEntries(Object.entries(g.defaults).filter(([key]) => !key.startsWith(`${g.topicId}/`))),
        decisions: Object.fromEntries(Object.entries(g.decisions).filter(([key]) => !key.startsWith(`${g.topicId}/`))),
        preferenceLastAsked: { ...g.preferenceLastAsked, [g.topicId]: 0 }
      })}>Reset shared preferences for this topic</button>}
    </details>}
  </main>
}
