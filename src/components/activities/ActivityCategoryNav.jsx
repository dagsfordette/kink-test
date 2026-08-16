import { activityProgress } from '../../lib/activityProfile.js'

export default function ActivityCategoryNav({ catalog, activityState, categoryId, onSelect, onPlayPreferences, onResults }) {
  const skipped = new Set(activityState.navigation.skippedCategoryIds || [])
  const adaptiveHidden = new Set(activityState.navigation.adaptiveHiddenCategoryIds || [])
  const showHidden = activityState.navigation.showHidden

  return (
    <aside className="activity-category-sidebar no-print">
      <div className="activity-sidebar-heading"><span>Categories</span><small>{Object.keys(activityState.answers || {}).length} answered</small></div>
      <nav>
        <button type="button" className={categoryId === 'all' ? 'active' : ''} onClick={() => onSelect('all')}>
          <span>{showHidden ? 'Everything' : 'Current path'}</span><small>{activityProgress(catalog, activityState, 'all').answered}</small>
        </button>
        {catalog.categories.map((category) => {
          const progress = activityProgress(catalog, activityState, category.id)
          const isSkipped = skipped.has(category.id)
          const isAdaptiveHidden = adaptiveHidden.has(category.id)
          const hiddenFromNav = (isSkipped || isAdaptiveHidden) && !showHidden && categoryId !== category.id
          if (hiddenFromNav) return null
          return (
            <button type="button" key={category.id} className={categoryId === category.id ? 'active' : ''} onClick={() => onSelect(category.id)}>
              <span>{category.label}{isSkipped ? <em>skipped</em> : isAdaptiveHidden ? <em>adaptive</em> : null}</span>
              <small>{progress.answered}/{progress.total}</small>
            </button>
          )
        })}
      </nav>
      <div className="activity-sidebar-footer">
        <button type="button" className="text-button" onClick={onPlayPreferences}>Play Preferences</button>
        <button type="button" className="text-button" onClick={onResults}>My answers</button>
      </div>
    </aside>
  )
}
