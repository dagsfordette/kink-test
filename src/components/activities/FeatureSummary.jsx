import CollectionActivitySummary from './CollectionActivitySummary.jsx'
import { FEATURE_GROUPS, featureRatingLabel, featureActionLabel, featureUsesActivityScale } from '../../lib/featureInterests.js'

export default function FeatureSummary({ interests = {}, title = 'Body features & attention', privateDetails = false, onEdit, person = 'self', groups = FEATURE_GROUPS, editLabel = 'Edit body-feature activities' }) {
  const marked = groups.filter(group => Object.keys(interests[group.id]?.answers || {}).length > 0 || Object.keys(interests[group.id]?.activityDetails || {}).length > 0)
  if (!marked.length && !onEdit) return null
  return <section className="feature-summary"><h2>{title}</h2>
    <p className="muted">{groups.every(group => !featureUsesActivityScale(group.id)) ? 'Unmarked interests mean no particular interest. No is an explicit dislike.' : 'Unmarked activities have no answer recorded.'}</p>
    {marked.map(group => <section key={group.id}>{groups.length > 1 && <h3>{group.label}</h3>}
      {group.rows.filter(([id]) => interests[group.id].answers[id] || interests[group.id].activityDetails?.[id]).map(([id, label]) => <div key={id} className="feature-summary-row">
        <div><strong>{featureActionLabel(label, person)}</strong><CollectionActivitySummary answer={{ rating: interests[group.id].answers[id], ...interests[group.id].activityDetails?.[id] }} privateDetails={privateDetails} /></div><span className="soft-pill">{featureRatingLabel(interests[group.id].answers[id], group.id)}</span>
      </div>)}
      {privateDetails && interests[group.id].note && <p>{interests[group.id].note}</p>}
    </section>)}
    {onEdit && <button type="button" className="text-button no-print" onClick={onEdit}>{editLabel}</button>}
  </section>
}
