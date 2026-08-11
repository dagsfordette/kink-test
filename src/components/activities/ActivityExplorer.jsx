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
        <div className="activity-context-label"><strong>Activity Explorer</strong><span>What would you actually be up for?</span></div>
        <div className="activity-header-progress"><span>{progress.answered} of {progress.total} answered {navigation.categoryId !== 'all' ? 'here' : ''}</span><div><i style={{ width: `${progress.percent}%` }} /></div></div>
        <div className="activity-header-actions"><button type="button" onClick={onPlayPreferences}>Play Preferences</button><button type="button" className="primary-button compact" onClick={onResults}>My answers</button></div>
      </header>

      <div className="activity-workspace">
        <ActivityCategoryNav catalog={catalog} activityState={activityState} categoryId={navigation.categoryId} onSelect={selectCategory} onPlayPreferences={onPlayPreferences} onResults={onResults} />
        <main className="activity-main" ref={mainRef}>
          <section className="activity-category-intro">
            <div><span className="kicker">{navigation.categoryId === 'all' ? 'All activities' : 'Category'}</span><h1>{category?.label || 'Browse everything'}</h1><p>{category?.description || 'Use the categories, search, or filters to find whatever you want to look at next.'}</p></div>
            {category && <button type="button" className={`secondary-button ${skipped.has(category.id) ? 'selected' : ''}`} onClick={() => onToggleSkipped(category.id)}>{skipped.has(category.id) ? 'Put this category back' : 'Skip this category for now'}</button>}
          </section>

          {fantasyComplete && recommendations.length > 0 && !navigation.search && navigation.answerFilter === 'all' && navigation.stanceFilter === 'all' && (
            <section className="activity-recommendations">
              <div className="activity-section-heading"><span className="kicker">Based on your Fantasy Profile</span><h2>A few things you may want to look at first</h2><p>These are starting points, not assumptions. You still decide how you feel about every activity yourself.</p></div>
              <div className="activity-recommendation-grid">{recommendations.slice(0, 8).map((row) => <button type="button" key={row.activity.id} onClick={() => openRecommendation(row)}><strong>{row.activity.label}</strong><span>{row.reason}</span></button>)}</div>
              <button type="button" className="text-button" onClick={browseEverything}>Show me everything</button>
            </section>
          )}

          {!fantasyComplete && navigation.categoryId === 'all' && !navigation.search && (
            <section className="activity-depth-guide">
              <div><span className="kicker">Not sure where to begin?</span><h2>Start with the shorter list</h2><p>The starter list covers the basics. Open up more specific activities when you want to go deeper.</p></div>
              <div className="activity-depth-actions"><button type="button" className="secondary-button" onClick={() => onNavigation({ depth: 'extended' })}>Show more</button><button type="button" className="secondary-button" onClick={() => onNavigation({ depth: 'specialized' })}>Show specific stuff</button><button type="button" className="primary-button" onClick={browseEverything}>Show everything</button></div>
            </section>
          )}

          <ActivityFilters catalog={catalog} navigation={navigation} onChange={onNavigation} onBrowseEverything={browseEverything} />

          <section className="activity-card-list">
            <div className="activity-list-heading"><span>{rows.length} {rows.length === 1 ? 'activity' : 'activities'}</span>{hidden.size > 0 && <small>{hidden.size} hidden for now</small>}</div>
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
            {rows.length === 0 && <div className="activity-empty-state"><h2>Nothing matches those filters.</h2><p>Try clearing a filter or showing more of the catalog.</p><button type="button" className="secondary-button" onClick={browseEverything}>Show everything</button></div>}
            {visibleCount < rows.length && <div className="activity-load-more"><button type="button" className="secondary-button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>Show more</button><span>{Math.min(visibleCount, rows.length)} of {rows.length}</span></div>}
          </section>
        </main>
      </div>
    </div>
  )
}
