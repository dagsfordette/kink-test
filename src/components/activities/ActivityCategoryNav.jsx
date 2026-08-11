import { activityProgress } from '../../lib/activityProfile.js'

export default function ActivityCategoryNav({ catalog, activityState, categoryId, onSelect, onPlayPreferences, onResults }) {
  const skipped = new Set(activityState.navigation.skippedCategoryIds || [])
  return (
    <aside className="activity-category-sidebar no-print">
      <div className="activity-sidebar-heading"><span>Categories</span><small>{Object.keys(activityState.answers || {}).length} answered</small></div>
      <nav>
        <button type="button" className={categoryId === 'all' ? 'active' : ''} onClick={() => onSelect('all')}>
          <span>Everything</span><small>{activityProgress(catalog, activityState, 'all').answered}</small>
        </button>
        {catalog.categories.map((category) => {
          const progress = activityProgress(catalog, activityState, category.id)
          return (
            <button type="button" key={category.id} className={categoryId === category.id ? 'active' : ''} onClick={() => onSelect(category.id)}>
              <span>{category.label}{skipped.has(category.id) ? <em>skipped</em> : null}</span>
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
