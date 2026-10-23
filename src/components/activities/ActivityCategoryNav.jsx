import {
  activityProgress,
  orderedActivityCategories
} from '../../lib/activityProfile.js'
export default function ActivityCategoryNav({
  catalog,
  counts,
  activityState,
  categoryId,
  onSelect
}) {
  return (
    <aside className="activity-category-sidebar no-print">
      <label className="mobile-category-picker">
        Category
        <select
          value={categoryId}
          onChange={(event) => onSelect(event.target.value)}
        >
          <option value="all">All activities</option>
          {catalog.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <div className="activity-sidebar-heading">
        <span>Categories</span>
        <small>Choose freely</small>
      </div>
      <nav>
        <button
          type="button"
          className={categoryId === 'all' ? 'active' : ''}
          onClick={() => onSelect('all')}
        >
          All activities
        </button>
        {orderedActivityCategories(catalog, activityState).map((category) => {
          const p =
            counts?.[category.id] ||
            activityProgress(catalog, activityState, category.id)
          return (
            <button
              type="button"
              key={category.id}
              aria-current={categoryId === category.id ? 'page' : undefined}
              className={categoryId === category.id ? 'active' : ''}
              onClick={() => onSelect(category.id)}
            >
              <span>{category.label}</span>
              <small>
                {p.answered} answered · {p.available ?? p.total - p.answered}{' '}
                available
              </small>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
