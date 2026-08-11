const SHARE_STANCE_ORDER = ['hard_limit', 'soft_limit', 'love', 'want', 'curious', 'if_partner_wants', 'dont_want']

export default function PartnerPrintReport({ catalog, activities, playPreferences, includePlayPreferences = false, embedded = false }) {
  const stanceById = new Map(catalog.stanceScale.map((row) => [row.id, row.label]))
  const experienceById = new Map(catalog.experienceScale.map((row) => [row.id, row.label]))
  const categoryById = new Map(catalog.categories.map((row) => [row.id, row.label]))
  const answered = catalog.activities.filter((activity) => activities.answers?.[activity.id]?.stance)

  return (
    <section className="partner-print-report print-only">
      {!embedded && <header><span>Kink Exploration · Activity Explorer</span><h1>My activity answers</h1><p>This report contains Activity Explorer answers only. Fantasy Profile is not included.</p></header>}
      {embedded && <h2>Activity Explorer <small>What I’d be up for</small></h2>}
      {SHARE_STANCE_ORDER.map((stanceId) => {
        const rows = answered.filter((activity) => activities.answers[activity.id].stance === stanceId)
        if (!rows.length) return null
        return (
          <section key={stanceId} className={stanceId === 'hard_limit' ? 'print-hard-limits' : ''}>
            <h2>{stanceById.get(stanceId)} <small>{rows.length}</small></h2>
            {rows.map((activity) => {
              const answer = activities.answers[activity.id]
              return <div className="print-activity-row" key={activity.id}><strong>{activity.label}</strong><span>{categoryById.get(activity.categoryId)}{answer.experience ? ` · ${experienceById.get(answer.experience)}` : ''}</span>{answer.note && <p>{answer.note}</p>}</div>
            })}
          </section>
        )
      })}
      {includePlayPreferences && Object.values(playPreferences || {}).some((value) => value?.trim()) && (
        <section><h2>Play Preferences</h2>{Object.entries(playPreferences).filter(([, value]) => value?.trim()).map(([key, value]) => <div className="print-preference-row" key={key}><strong>{key.replace(/([A-Z])/g, ' $1')}</strong><p>{value}</p></div>)}</section>
      )}
    </section>
  )
}
