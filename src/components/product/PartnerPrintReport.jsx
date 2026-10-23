import { buildShareProjection } from '../../lib/boundaryReview.js'
const SHARE_STANCE_ORDER = [
  'hard_limit',
  'soft_limit',
  'love',
  'want',
  'curious',
  'if_partner_wants',
  'not_sure',
  'dont_want'
]

export default function PartnerPrintReport({
  catalog,
  activities,
  playPreferences,
  includePlayPreferences = false,
  embedded = false
}) {
  const projection = buildShareProjection(catalog, activities, {
    includePlayPreferences,
    playPreferences
  })
  if (!embedded && !projection.allowed)
    return (
      <section className="partner-print-report print-only">
        <h1>Review needed before sharing</h1>
        <p>
          Covering hard limits need review. No partner report was generated.
        </p>
      </section>
    )
  if (!embedded) {
    activities = { answers: projection.payload.activities.answers }
    playPreferences = projection.payload.playPreferences
  }
  const stanceById = new Map(
    catalog.stanceScale.map((row) => [row.id, row.label])
  )
  const experienceById = new Map(
    catalog.experienceScale.map((row) => [row.id, row.label])
  )
  const categoryById = new Map(
    catalog.categories.map((row) => [row.id, row.label])
  )
  const answered = catalog.activities.filter(
    (activity) => activities.answers?.[activity.id]?.stance
  )

  return (
    <section className="partner-print-report print-only">
      {!embedded && (
        <header>
          <span>Kink Exploration · Activity Explorer</span>
          <h1>My activity answers</h1>
          <p>
            This report contains Activity Explorer answers only. Fantasy Profile
            is not included.
          </p>
        </header>
      )}
      {embedded && (
        <h2>
          Activity Explorer <small>What I’d be up for</small>
        </h2>
      )}
      {!embedded && projection.payload.boundaryContext.length > 0 && (
        <section>
          <h2>Reviewed boundary scope</h2>
          {projection.payload.boundaryContext.map((c) => (
            <div key={c.ownerId}>
              <strong>{c.ownerLabel}</strong>
              <p>
                {c.mode === 'local'
                  ? 'Hard limit for this activity only; subtype activities are excluded.'
                  : 'Branch Hard limit covering the listed activities.'}
              </p>
              {c.mode === 'branch' && (
                <ul>
                  {c.members.map((id) => (
                    <li key={id}>
                      {catalog.activities.find((a) => a.id === id).label}
                    </li>
                  ))}
                </ul>
              )}
              {c.exceptions.map((x) => (
                <p key={x.childId}>
                  Exact exception: {x.childLabel}, within {c.ownerLabel} only.
                </p>
              ))}
            </div>
          ))}
        </section>
      )}
      {SHARE_STANCE_ORDER.map((stanceId) => {
        const rows = answered.filter(
          (activity) => activities.answers[activity.id].stance === stanceId
        )
        if (!rows.length) return null
        return (
          <section
            key={stanceId}
            className={stanceId === 'hard_limit' ? 'print-hard-limits' : ''}
          >
            <h2>
              {stanceById.get(stanceId)} <small>{rows.length}</small>
            </h2>
            {rows.map((activity) => {
              const answer = activities.answers[activity.id]
              return (
                <div className="print-activity-row" key={activity.id}>
                  <strong>{activity.label}</strong>
                  <span>
                    {categoryById.get(activity.categoryId)}
                    {answer.experience
                      ? ` · ${experienceById.get(answer.experience)}`
                      : ''}
                  </span>
                  {embedded && answer.note && <p>{answer.note}</p>}
                </div>
              )
            })}
          </section>
        )
      })}
      {includePlayPreferences &&
        Object.values(playPreferences || {}).some((value) => value?.trim()) && (
          <section>
            <h2>Play Preferences</h2>
            {Object.entries(playPreferences)
              .filter(([, value]) => value?.trim())
              .map(([key, value]) => (
                <div className="print-preference-row" key={key}>
                  <strong>{key.replace(/([A-Z])/g, ' $1')}</strong>
                  <p>{value}</p>
                </div>
              ))}
          </section>
        )}
    </section>
  )
}
