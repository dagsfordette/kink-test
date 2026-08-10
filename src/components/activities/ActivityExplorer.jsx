import { useEffect, useMemo, useRef, useState } from 'react'
import ActivityCategoryNav from './ActivityCategoryNav.jsx'
import ActivityFilters from './ActivityFilters.jsx'
import ActivityCard from './ActivityCard.jsx'
import { activityProgress, filterActivities } from '../../lib/activityProfile.js'

const PAGE_SIZE = 48

export default function ActivityExplorer({ catalog, activityState, recommendations, fantasyComplete, onNavigation, onStance, onExperience, onDetails, onNote, onClear, onToggleHidden, onToggleSkipped, onResults, onPlayPreferences }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [focusActivityId, setFocusActivityId] = useState(null)
  const mainRef = useRef(null)
  const navigation = activityState.navigation
  const category = catalog.categories.find((row) => row.id === navigation.categoryId)
  const rows = useMemo(() => filterActivities(catalog, activityState), [catalog, activityState])
  const hidden = new Set(navigation.hiddenActivityIds || [])
  const skipped = new Set(navigation.skippedCategoryIds || [])
  const progress = activityProgress(catalog, activityState, navigation.categoryId)

  useEffect(() => setVisibleCount(PAGE_SIZE), [navigation.categoryId, navigation.search, navigation.answerFilter, navigation.stanceFilter, navigation.experienceFilter, navigation.depth, navigation.showHidden])

  const selectCategory = (categoryId) => {
    onNavigation({ categoryId, search: '' })
    mainRef.current?.scrollTo?.({ top: 0 })
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  const openRecommendation = (row) => {
    setFocusActivityId(row.activity.id)
    onNavigation({ categoryId: row.activity.categoryId, search: '', depth: row.activity.priority === 'specialized' ? 'specialized' : row.activity.priority === 'extended' ? 'extended' : navigation.depth })
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => document.getElementById(`activity-${row.activity.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })))
  }

  const browseEverything = () => onNavigation({ categoryId: 'all', depth: 'all', search: '', answerFilter: 'all', stanceFilter: 'all', experienceFilter: 'all' })

  return (
    <div className="activity-explorer-root">
      <header className="activity-app-header no-print">
        <div className="activity-context-label"><strong>Activity Explorer</strong><span>Real-world stance mapping</span></div>
        <div className="activity-header-progress"><span>{progress.answered} of {progress.total} answered {navigation.categoryId !== 'all' ? 'in this category' : ''}</span><div><i style={{ width: `${progress.percent}%` }} /></div></div>
        <div className="activity-header-actions"><button type="button" onClick={onPlayPreferences}>Play Preferences</button><button type="button" className="primary-button compact" onClick={onResults}>Results</button></div>
      </header>

      <div className="activity-workspace">
        <ActivityCategoryNav catalog={catalog} activityState={activityState} categoryId={navigation.categoryId} onSelect={selectCategory} onPlayPreferences={onPlayPreferences} onResults={onResults} />
        <main className="activity-main" ref={mainRef}>
          <section className="activity-category-intro">
            <div><span className="kicker">{navigation.categoryId === 'all' ? 'All activities' : 'Category'}</span><h1>{category?.label || 'Browse everything'}</h1><p>{category?.description || 'Every Activity Explorer item remains reachable. Use search and filters to move through the full catalog.'}</p></div>
            {category && <button type="button" className={`secondary-button ${skipped.has(category.id) ? 'selected' : ''}`} onClick={() => onToggleSkipped(category.id)}>{skipped.has(category.id) ? 'Revisit this category' : 'Skip category for now'}</button>}
          </section>

          {fantasyComplete && recommendations.length > 0 && !navigation.search && navigation.answerFilter === 'all' && navigation.stanceFilter === 'all' && (
            <section className="activity-recommendations">
              <div className="activity-section-heading"><span className="kicker">Suggested from your Fantasy Profile</span><h2>Possible real-world expressions to consider</h2><p>These are recommendations only. Nothing here is pre-answered, and the rest of the catalog remains available.</p></div>
              <div className="activity-recommendation-grid">{recommendations.slice(0, 8).map((row) => <button type="button" key={row.activity.id} onClick={() => openRecommendation(row)}><strong>{row.activity.label}</strong><span>{row.reason}</span></button>)}</div>
              <button type="button" className="text-button" onClick={browseEverything}>Browse all activities</button>
            </section>
          )}

          {!fantasyComplete && navigation.categoryId === 'all' && !navigation.search && (
            <section className="activity-depth-guide">
              <div><span className="kicker">Start anywhere</span><h2>Starter activities appear first</h2><p>Expand into extended and specialized items when you want more detail. These are content layers, not separate questionnaires.</p></div>
              <div className="activity-depth-actions"><button type="button" className="secondary-button" onClick={() => onNavigation({ depth: 'extended' })}>Include extended</button><button type="button" className="secondary-button" onClick={() => onNavigation({ depth: 'specialized' })}>Include specialized</button><button type="button" className="primary-button" onClick={browseEverything}>Browse everything</button></div>
            </section>
          )}

          <ActivityFilters catalog={catalog} navigation={navigation} onChange={onNavigation} onBrowseEverything={browseEverything} />

          <section className="activity-card-list">
            <div className="activity-list-heading"><span>{rows.length} matching activities</span>{hidden.size > 0 && <small>{hidden.size} hidden for now</small>}</div>
            {rows.slice(0, visibleCount).map((activity) => (
              <ActivityCard
                key={activity.id}
                catalog={catalog}
                activity={activity}
                answer={activityState.answers[activity.id]}
                focused={focusActivityId === activity.id}
                hidden={hidden.has(activity.id)}
                onStance={(stance) => onStance(activity.id, stance)}
                onExperience={(experience) => onExperience(activity.id, experience)}
                onDetails={(details) => onDetails(activity.id, details)}
                onNote={(note) => onNote(activity.id, note)}
                onClear={() => onClear(activity.id)}
                onToggleHidden={() => onToggleHidden(activity.id)}
              />
            ))}
            {rows.length === 0 && <div className="activity-empty-state"><h2>No activities match these filters.</h2><p>Clear a filter, expand the content depth, or browse everything.</p><button type="button" className="secondary-button" onClick={browseEverything}>Browse everything</button></div>}
            {visibleCount < rows.length && <div className="activity-load-more"><button type="button" className="secondary-button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>Show more</button><span>{Math.min(visibleCount, rows.length)} of {rows.length}</span></div>}
          </section>
        </main>
      </div>
    </div>
  )
}
