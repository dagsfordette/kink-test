import { useMemo, useRef, useState } from 'react'
import ActivityCategoryNav from './ActivityCategoryNav.jsx'
import ActivityCard from './ActivityCard.jsx'
import ExplorationSettings from './ExplorationSettings.jsx'
import { filterActivities } from '../../lib/activityProfile.js'
import {
  createEligibilityContext,
  evaluateActivity,
  roleSuggestions
} from '../../lib/eligibility.js'
import {
  startSession,
  sessionProgress,
  choosePrompt,
  recordSessionAction
} from '../../lib/explorationSessions.js'
import { activityPage, explorationViewKey, nextActivityId } from '../../lib/explorationView.js'

export default function ActivityExplorer({
  catalog,
  activityState,
  onExploration,
  onNavigation,
  onSave,
  onDiscard,
  onUndo,
  onStance,
  onExperience,
  onDetails,
  onNote,
  onClear,
  onToggleHidden,
  onResults,
  onPlayPreferences
}) {
  const nav = activityState.navigation,
    e = activityState.exploration
  const listRef = useRef(null),
    headingRef = useRef(null),
    pendingFocus = useRef(null)
  const [paging, setPaging] = useState({ key: '', page: 0 })
  const context = useMemo(
    () =>
      createEligibilityContext(
        catalog,
        activityState,
        activityState.fantasyEvidence
      ),
    [catalog, activityState.answers, nav, e, activityState.fantasyEvidence]
  )
  const suggestions = useMemo(
    () => roleSuggestions(catalog, activityState.fantasyEvidence),
    [catalog, activityState.fantasyEvidence]
  )
  const progress = useMemo(
    () => sessionProgress(catalog, activityState, context),
    [catalog, context]
  )
  const reviewing = Boolean(nav.reviewActivityId)
  const available = new Set(progress?.availableIds)
  const rows = filterActivities(catalog, activityState, {}, context).filter(
    (a) =>
      reviewing ||
      activityState.drafts?.[a.id] ||
      !e.session ||
      (e.session.status === 'active' && available.has(a.id))
  )
  const viewKey = explorationViewKey(nav, e)
  const page = activityPage(
    rows,
    activityState.drafts,
    paging.key === viewKey ? paging.page : 0,
    { anchorId: paging.key === viewKey ? paging.anchorId : null }
  )
  const category = catalog.categories.find((c) => c.id === nav.categoryId)
  const counts = useMemo(() => {
    const result = Object.fromEntries(
      catalog.categories.map((c) => [
        c.id,
        { answered: 0, available: 0, excluded: 0 }
      ])
    )
    for (const a of catalog.activities) {
      const row = result[a.categoryId]
      if (activityState.answers[a.id]) row.answered++
      else if (
        evaluateActivity(a, context, { ignoreSession: true }).queueVisible
      )
        row.available++
      else row.excluded++
    }
    return result
  }, [catalog, context])
  const scopedCounts =
    nav.categoryId === 'all'
      ? Object.values(counts).reduce(
          (r, c) => ({
            answered: r.answered + c.answered,
            available: r.available + c.available,
            excluded: r.excluded + c.excluded
          }),
          { answered: 0, available: 0, excluded: 0 }
        )
      : counts[nav.categoryId]
  const prompts = catalog.routingPrompts.filter(
    (p) => nav.categoryId === 'all' || p.categoryIds.includes(nav.categoryId)
  )
  const focusAfter = (selector, fallbackHeading = false) => {
    pendingFocus.current = selector
    window.requestAnimationFrame(() => {
      const node =
        listRef.current?.querySelector(pendingFocus.current) ||
        (fallbackHeading ? headingRef.current : null)
      node?.focus()
      node?.scrollIntoView({ block: 'nearest' })
      pendingFocus.current = null
    })
  }
  const selectCategory = (id) => {
    onExploration({ ...e, session: null })
    onNavigation({
      categoryId: id,
      reviewActivityId: null,
      search: '',
      bypassPromptDeferral: true
    })
    focusAfter('h3', true)
  }
  const browse = () => {
    onExploration({ ...e, session: null })
    onNavigation({
      reviewActivityId: null,
      search: '',
      bypassPromptDeferral: true
    })
    focusAfter('h3', true)
  }
  const start = (topicId) => {
    onExploration(
      startSession(catalog, activityState, {
        size: e.sessionSize,
        topicId,
        categoryId: nav.categoryId
      })
    )
    onNavigation({
      reviewActivityId: null,
      search: '',
      bypassPromptDeferral: true
    })
    focusAfter('h3', true)
  }
  const promptChoice = (prompt, response) => {
    let next = choosePrompt(e, prompt, response)
    if (response === 'explore') {
      next = startSession(
        catalog,
        { ...activityState, exploration: next },
        { size: e.sessionSize, topicId: prompt.id }
      )
      next = choosePrompt(next, prompt, response)
      onNavigation({
        categoryId: 'all',
        reviewActivityId: null,
        search: '',
        bypassPromptDeferral: true
      })
      focusAfter('h3', true)
    }
    if (response === 'skip_for_now')
      onNavigation({ bypassPromptDeferral: false })
    onExploration(next)
  }
  const save = (id) => {
    const nextId = nextActivityId(rows, id)
    setPaging({ key: viewKey, page: page.page, anchorId: nextId })
    onSave(id)
    focusAfter(nextId ? `#activity-${nextId} h3` : 'h3', true)
  }
  const undo = () => {
    const id = activityState.lastSave?.activityId
    onUndo()
    focusAfter(`#activity-${id} h3`, true)
  }
  const movePage = (requested) => {
    setPaging({ key: viewKey, page: requested })
    focusAfter('h3', true)
  }
  const pagination = (
    <nav className="exploration-pagination" aria-label="Activity pages">
      <button
        type="button"
        disabled={page.page === 0}
        onClick={() => movePage(page.page - 1)}
      >
        Previous page
      </button>
      <span>
        Page {page.page + 1} of {page.pageCount}
      </span>
      <button
        type="button"
        disabled={page.page + 1 === page.pageCount}
        onClick={() => movePage(page.page + 1)}
      >
        Next page
      </button>
    </nav>
  )
  return (
    <div className="activity-explorer-root no-print">
      <header className="activity-app-header no-print">
        <div className="activity-context-label">
          <strong>Activity Explorer</strong>
          <span>What would you actually be up for?</span>
        </div>
        <div className="activity-header-actions">
          <button type="button" onClick={onPlayPreferences}>
            Play Preferences
          </button>
          <button
            type="button"
            className="primary-button compact"
            onClick={onResults}
          >
            Review answers
          </button>
        </div>
      </header>
      <div className="activity-workspace">
        <ActivityCategoryNav
          catalog={catalog}
          counts={counts}
          activityState={activityState}
          categoryId={nav.categoryId}
          onSelect={selectCategory}
          onPlayPreferences={onPlayPreferences}
          onResults={onResults}
        />
        <main className="activity-main">
          <section className="activity-category-intro">
            <div>
              <span className="kicker">
                Browse freely or try a short session
              </span>
              <h1 ref={headingRef} tabIndex={-1}>
                {reviewing
                  ? 'Review this answer'
                  : category?.label || 'Explore at your own pace'}
              </h1>
              <p>
                {category?.description ||
                  'Choose a category below, start a short session, or open the optional topics.'}
              </p>
            </div>
          </section>
          <ExplorationSettings
            catalog={catalog}
            exploration={e}
            suggestions={suggestions}
            onChange={onExploration}
          />
          <section
            className="session-panel no-print"
            aria-label="Short session"
          >
            <h2>
              {e.session
                ? e.session.topicId
                  ? catalog.routingPrompts.find(
                      (p) => p.id === e.session.topicId
                    )?.text
                  : `Short session · ${catalog.categories.find((c) => c.id === e.session.categoryId)?.label || 'All activities'}`
                : 'Try a short session'}
            </h2>
            <label>
              Session length{' '}
              <input
                aria-label="Session length"
                type="number"
                min="1"
                max="50"
                value={e.sessionSize}
                onChange={(event) =>
                  onExploration({
                    ...e,
                    sessionSize: Math.max(
                      1,
                      Math.min(50, Math.round(Number(event.target.value) || 10))
                    )
                  })
                }
              />
            </label>
            <button
              type="button"
              className="primary-button"
              onClick={() => start(null)}
            >
              {e.session ? 'Start fresh session' : 'Start short session'}
            </button>
            {e.session && (
              <>
                <p role="status">
                  {progress.answered} saved · {progress.skipped} skipped ·{' '}
                  {progress.remaining} left toward your target of{' '}
                  {e.session.target}.
                </p>
                <p>
                  {progress.poolSize} activities in this topic’s starting pool ·{' '}
                  {progress.filtered} currently excluded
                  {progress.savedOutside
                    ? ` · ${progress.savedOutside} saved outside this session`
                    : ''}
                  . Skipping leaves the activity unanswered.
                </p>
                {progress.done && (
                  <p>
                    {e.session.status === 'ended'
                      ? 'Paused here. Resume whenever you like.'
                      : progress.remainingSlots === 0
                        ? 'Your short session is finished.'
                        : 'No more available activities in this topic right now.'}{' '}
                    This does not mean you answered the whole category.
                  </p>
                )}
                {e.session.status === 'active' && !progress.done && (
                  <button
                    type="button"
                    onClick={() => {
                      onExploration({
                        ...e,
                        session: { ...e.session, status: 'ended' }
                      })
                      focusAfter('h3', true)
                    }}
                  >
                    Finish early
                  </button>
                )}
                {e.session.status === 'ended' && (
                  <button
                    type="button"
                    onClick={() => {
                      onExploration({
                        ...e,
                        session: { ...e.session, status: 'active' }
                      })
                      focusAfter('h3', true)
                    }}
                  >
                    Resume session
                  </button>
                )}
                <button type="button" onClick={browse}>
                  Browse / change topic
                </button>
              </>
            )}
          </section>
          <details className="topic-prompts no-print">
            <summary>Optional topics ({prompts.length})</summary>
            <p>
              Explore starts a short session within that topic. Not for now sets
              it aside for this session or browsing visit; choosing a category
              or starting a fresh session brings it back. Not sure keeps it
              available. These choices never save an activity answer.
            </p>
            {prompts.map((p) => (
              <article key={p.id}>
                <h3>{p.text}</h3>
                <p>{p.description}</p>
                <small>
                  {e.promptResponses[p.id]?.response?.replaceAll('_', ' ') ||
                    'No choice yet'}
                </small>
                <div>
                  {[
                    ['explore', 'Explore'],
                    ['skip_for_now', 'Not for now'],
                    ['not_sure', 'Not sure']
                  ].map(([id, label]) => (
                    <button
                      type="button"
                      key={id}
                      aria-label={`${label}: ${p.text}`}
                      onClick={() => promptChoice(p, id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </details>
          <div className="exploration-toolbar no-print">
            <label>
              Find an activity{' '}
              <input
                type="search"
                value={nav.search}
                onChange={(event) =>
                  onNavigation({ search: event.target.value })
                }
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={nav.showHidden}
                onChange={(event) =>
                  onNavigation({ showHidden: event.target.checked })
                }
              />{' '}
              Show excluded activities in this scope
            </label>
            <small>
              {scopedCounts?.answered || 0} saved in this category scope ·{' '}
              {scopedCounts?.excluded || 0} excluded. Showing exclusions keeps
              your facts and preferences intact.
            </small>
          </div>
          {reviewing && (
            <div className="activity-review-banner">
              <span>Saved answers stay reviewable regardless of filters.</span>
              <button
                type="button"
                onClick={() =>
                  onNavigation({
                    reviewActivityId: null,
                    ...(e.session
                      ? {
                          categoryId: e.session.topicId
                            ? 'all'
                            : e.session.categoryId,
                          search: ''
                        }
                      : {})
                  })
                }
              >
                Back to exploration
              </button>
            </div>
          )}
          {activityState.lastSave && (
            <div className="activity-review-banner" role="status">
              <span>Answer saved.</span>
              <button type="button" onClick={undo}>
                Undo last save
              </button>
            </div>
          )}
          <p role="status" className="exploration-results-count">
            Showing {page.from}–{page.to} of {page.total}{' '}
            {e.session ? 'session' : 'matching'} activities
            {page.pinned
              ? `, plus ${page.pinned} unfinished ${page.pinned === 1 ? 'edit' : 'edits'} from outside this page kept open`
              : ''}
            .
          </p>
          {page.pageCount > 1 && pagination}
          <section
            ref={listRef}
            className="activity-card-list"
            aria-label="Activities"
          >
            {rows.length === 0 && (
              <div className="activity-empty-state">
                <h2>
                  {progress?.done
                    ? 'A good place to stop.'
                    : 'No unanswered activities match this view.'}
                </h2>
                <p>
                  {nav.search
                    ? 'Try a different search or clear it. '
                    : 'Review your answers, show exclusions, or choose a new topic. '}
                  Saved answers, skipped activities and exclusions are separate.
                </p>
                {nav.search && (
                  <button
                    type="button"
                    onClick={() => onNavigation({ search: '' })}
                  >
                    Clear search
                  </button>
                )}
                <button type="button" onClick={onResults}>
                  Review answers
                </button>
                {e.session && (
                  <button type="button" onClick={browse}>
                    Browse / change topic
                  </button>
                )}
              </div>
            )}
            {page.rows.map((activity) => {
              const derived = evaluateActivity(activity, context, {
                  reveal: nav.showHidden || reviewing
                }),
                draft = Boolean(activityState.drafts?.[activity.id])
              return (
                <div key={activity.id} className="exploration-item">
                  {draft && (
                    <p className="draft-pin-label">
                      Unfinished edits · kept open until you save or discard
                    </p>
                  )}
                  {derived.reasons
                    .filter(
                      (r) =>
                        ![
                          'already_answered',
                          'outside_session',
                          'applicability_unknown'
                        ].includes(r.code)
                    )
                    .map((r, i) => (
                      <p className="eligibility-reason" key={`${r.code}-${i}`}>
                        {r.message}
                        {r.bypassed ? ' Shown by your request.' : ''}
                      </p>
                    ))}
                  {derived.reviewItems.some(
                    (r) => r.severity === 'blocking'
                  ) && (
                    <p role="alert">
                      This saved preference needs boundary scope review before
                      partner sharing.
                    </p>
                  )}
                  <ActivityCard
                    catalog={catalog}
                    activity={activity}
                    answer={
                      activityState.drafts?.[activity.id] ||
                      activityState.answers[activity.id]
                    }
                    draft={draft}
                    focused={reviewing}
                    hidden={nav.hiddenActivityIds.includes(activity.id)}
                    onSave={() => save(activity.id)}
                    onDiscard={() => onDiscard(activity.id)}
                    onStance={(v) => onStance(activity.id, v)}
                    onExperience={(v) => onExperience(activity.id, v)}
                    onDetails={(v) => onDetails(activity.id, v)}
                    onNote={(v) => onNote(activity.id, v)}
                    onClear={() => onClear(activity.id)}
                    onToggleHidden={() => onToggleHidden(activity.id)}
                  />
                  <details className="item-relevance-actions no-print">
                    <summary>Availability options</summary>
                    <p>
                      Adjust this activity’s place in exploration. Your body
                      facts and saved boundaries stay the same.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        onExploration({
                          ...e,
                          inferredFilterOverrides: {
                            ...e.inferredFilterOverrides,
                            [activity.id]:
                              e.inferredFilterOverrides[activity.id] ||
                              e.relevanceOverrides[activity.id]
                                ? undefined
                                : 'keep_in_exploration'
                          },
                          relevanceOverrides: {
                            ...e.relevanceOverrides,
                            [activity.id]:
                              e.inferredFilterOverrides[activity.id] ||
                              e.relevanceOverrides[activity.id]
                                ? undefined
                                : 'keep_in_exploration'
                          }
                        })
                      }
                    >
                      {e.inferredFilterOverrides[activity.id] ||
                      e.relevanceOverrides[activity.id]
                        ? 'Reset exploration override'
                        : 'Keep this activity in exploration'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onExploration({
                          ...e,
                          manualApplicability: {
                            ...e.manualApplicability,
                            [activity.id]: e.manualApplicability[activity.id]
                              ? undefined
                              : 'not_applicable'
                          }
                        })
                      }
                    >
                      {e.manualApplicability[activity.id]
                        ? 'Reset not applicable'
                        : 'Not applicable in this context'}
                    </button>
                  </details>
                  {e.session?.status === 'active' &&
                    available.has(activity.id) && (
                      <button
                        type="button"
                        className="session-skip"
                        onClick={() => {
                          onExploration(
                            recordSessionAction(e, activity.id, 'skip')
                          )
                          focusAfter('h3', true)
                        }}
                      >
                        {draft
                          ? 'Skip for this session (keep edits)'
                          : 'Skip in this session'}
                      </button>
                    )}
                </div>
              )
            })}
          </section>
          {page.pageCount > 1 && pagination}
        </main>
      </div>
    </div>
  )
}
