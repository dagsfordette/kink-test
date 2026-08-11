export default function ActivityFilters({ catalog, navigation, onChange, onBrowseEverything }) {
  return (
    <section className="activity-filter-panel no-print" aria-label="Activity filters">
      <div className="activity-search-row">
        <label className="activity-search-field">
          <span className="sr-only">Search activities</span>
          <input value={navigation.search} onChange={(event) => onChange({ search: event.target.value })} placeholder="Search activities…" />
        </label>
        <button type="button" className="secondary-button compact" onClick={onBrowseEverything}>Clear filters</button>
      </div>
      <div className="activity-filter-grid">
        <label><span>Answered?</span><select value={navigation.answerFilter} onChange={(event) => onChange({ answerFilter: event.target.value })}><option value="all">Any</option><option value="unanswered">Not answered yet</option><option value="answered">Answered</option></select></label>
        <label><span>My answer</span><select value={navigation.stanceFilter} onChange={(event) => onChange({ stanceFilter: event.target.value })}><option value="all">Any answer</option>{catalog.stanceScale.map((row) => <option key={row.id} value={row.id}>{row.label}</option>)}</select></label>
        <label><span>Experience</span><select value={navigation.experienceFilter} onChange={(event) => onChange({ experienceFilter: event.target.value })}><option value="all">Any</option><option value="unanswered">Not answered</option>{catalog.experienceScale.map((row) => <option key={row.id} value={row.id}>{row.label}</option>)}</select></label>
        <label><span>How much to show</span><select value={navigation.depth} onChange={(event) => onChange({ depth: event.target.value })}><option value="starter">Starter list</option><option value="extended">More activities</option><option value="specialized">More specific activities</option><option value="all">Everything</option></select></label>
      </div>
      <label className="activity-show-hidden"><input type="checkbox" checked={navigation.showHidden} onChange={(event) => onChange({ showHidden: event.target.checked })} /> Show things I hid</label>
    </section>
  )
}
