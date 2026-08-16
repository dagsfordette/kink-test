import { useEffect, useMemo, useRef, useState } from 'react'
import ActivityCategoryNav from './ActivityCategoryNav.jsx'
import ActivityFilters from './ActivityFilters.jsx'
import ActivityCard from './ActivityCard.jsx'
import { activityProgress, filterActivities } from '../../lib/activityProfile.js'

const PAGE_SIZE = 48

export default function ActivityExplorer({ catalog, activityState, onNavigation, onStance, onExperience, onDetails, onNote, onClear, onToggleHidden, onToggleSkipped, onResults, onPlayPreferences }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const mainRef = useRef(null)
  const navigation = activityState.navigation
  const category = catalog.categories.find((row) => row.id === navigation.categoryId)
  const rows = useMemo(() => filterActivities(catalog, activityState), [catalog, activityState])
  const hidden = new Set(navigation.hiddenActivityIds || [])
  const skipped = new Set(navigation.skippedCategoryIds || [])
  const adaptiveHidden = new Set(navigation.adaptiveHiddenCategoryIds || [])
  const pathProgress = activityProgress(catalog, activityState, 'all')
  const categoryProgress = category ? activityProgress(catalog, activityState, category.id) : pathProgress

  const pathCategories = useMemo(() => {
    const excluded = new Set(navigation.showHidden ? [] : [...skipped, ...adaptiveHidden])
    const visible = catalog.categories.filter((row) => !excluded.has(row.id))
    const startIndex = visible.findIndex((row) => row.id === navigation.entryCategoryId)
    return startIndex > 0 ? [...visible.slice(startIndex), ...visible.slice(0, startIndex)] : visible
  }, [catalog.categories, navigation.showHidden, navigation.entryCategoryId, navigation.skippedCategoryIds, navigation.adaptiveHiddenCategoryIds])

  const currentPathIndex = pathCategories.findIndex((row) => row.id === navigation.categoryId)
  const nextCategory = currentPathIndex >= 0 && currentPathIndex < pathCategories.length - 1 ? pathCategories[currentPathIndex + 1] : null

  useEffect(() => setVisibleCount(PAGE_SIZE), [navigation.categoryId, navigation.search, navigation.answerFilter, navigation.stanceFilter, navigation.experienceFilter, navigation.depth, navigation.showHidden])

  const selectCategory = (categoryId) => {
    onNavigation({ categoryId, search: '' })
    mainRef.current?.scrollTo?.({ top: 0 })
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  const browseEverything = () => onNavigation({ categoryId: 'all', depth: 'all', search: '', answerFilter: 'all', stanceFilter: 'all', experienceFilter: 'all', showHidden: true })

  const skipCurrentCategory = () => {
    if (!category) return
    const wasSkipped = skipped.has(category.id)
    onToggleSkipped(category.id)
    if (!wasSkipped && nextCategory) selectCategory(nextCategory.id)
  }

  return (
    <div className="activity-explorer-root">
      <header className="activity-app-header no-print">
        <div className="activity-context-label"><strong>Activity Explorer</strong><span>What would you actually be up for?</span></div>
        <div className="activity-header-progress"><span>{pathProgress.answered} of {pathProgress.total} answered in this path</span><div><i style={{ width: `${pathProgress.percent}%` }} /></div></div>
        <div className="activity-header-actions"><button type="button" onClick={onPlayPreferences}>Play Preferences</button><button type="button" className="primary-button compact" onClick={onResults}>My answers</button></div>
      </header>

      <div className="activity-workspace">
        <ActivityCategoryNav catalog={catalog} activityState={activityState} categoryId={navigation.categoryId} onSelect={selectCategory} onPlayPreferences={onPlayPreferences} onResults={onResults} />
        <main className="activity-main" ref={mainRef}>
          {adaptiveHidden.size > 0 && !navigation.showHidden && (
            <div className="activity-adaptive-note no-print">
              <span><strong>Focused first pass.</strong> {adaptiveHidden.size} {adaptiveHidden.size === 1 ? 'category is' : 'categories are'} tucked away based on your Fantasy Profile.</span>
              <button type="button" className="text-button" onClick={() => onNavigation({ showHidden: true })}>Show all categories</button>
            </div>
          )}

          <section className="activity-category-intro">
            <div><span className="kicker">{navigation.categoryId === 'all' ? 'Your current path' : 'Category'}</span><h1>{category?.label || 'Browse your current path'}</h1><p>{category?.description || 'Move through the categories in this pass, or use search and filters whenever you want to branch out.'}</p>{category && <small className="activity-category-progress-copy">{categoryProgress.answered} of {categoryProgress.total} answered here</small>}</div>
            {category && <button type="button" className={`secondary-button ${skipped.has(category.id) ? 'selected' : ''}`} onClick={skipCurrentCategory}>{skipped.has(category.id) ? 'Put this category back' : 'Skip this category for now'}</button>}
          </section>

          {navigation.categoryId === 'all' && !navigation.search && (
            <section className="activity-depth-guide">
              <div><span className="kicker">Your question path</span><h2>{pathProgress.total} activities are currently in scope</h2><p>Start anywhere, then work through the visible categories. Hidden categories are not treated as unanswered unless you bring them back.</p></div>
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
                focused={false}
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

          {category && nextCategory && !navigation.search && (
            <section className="activity-path-next no-print">
              <div><span className="kicker">Keep going</span><h2>Next: {nextCategory.label}</h2><p>You can move on whenever you’re ready. Unanswered activities stay available if you come back.</p></div>
              <button type="button" className="primary-button" onClick={() => selectCategory(nextCategory.id)}>Continue</button>
            </section>
          )}
          {category && !nextCategory && pathCategories.length > 0 && !navigation.search && (
            <section className="activity-path-next no-print">
              <div><span className="kicker">End of this pass</span><h2>You’ve reached the last visible category.</h2><p>Review your answers, or reveal everything if you want to explore beyond the focused path.</p></div>
              <div className="activity-path-next-actions"><button type="button" className="primary-button" onClick={onResults}>Review my answers</button><button type="button" className="secondary-button" onClick={browseEverything}>Show everything</button></div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
