import CollectionActivitySummary from './CollectionActivitySummary.jsx'
import { ROLEPLAY_ROLES, ROLEPLAY_THEMES, ROLEPLAY_SIDES, hasRoleplayMarks, roleplayRoleLabel, roleplayRatingLabel, roleplaySideLabel } from '../../lib/roleplayInterests.js'

export default function RoleplaySummary({ interests, title = 'Roleplay interests', privateDetails = false, onEdit, person = 'self' }) {
  if (!hasRoleplayMarks(interests) && !onEdit) return null
  return <section className="roleplay-summary">
    <h2>{title}</h2>
    <p className="muted">Unmarked roles and themes have no answer recorded.</p>
    {ROLEPLAY_ROLES.flatMap(role => ROLEPLAY_SIDES.map(side => {
      const answer = interests?.roles?.[role.id]?.[side]
      if (!answer) return null
      return <div key={`${role.id}-${side}`} className="roleplay-summary-row">
        <div><strong>{roleplaySideLabel(role, side, person)}</strong><CollectionActivitySummary answer={answer} privateDetails={privateDetails} />
          {(answer.pairs || []).map(id => <div key={id}><p>With: {roleplayRoleLabel(id)} · {roleplayRatingLabel(answer.pairRatings?.[id] || answer.rating)}</p>{privateDetails && answer.pairRatings?.[id] === 'soft_limit' && answer.pairConditions?.[id] && <p>Conditions: {answer.pairConditions[id]}</p>}</div>)}
          {privateDetails && answer.appeal?.length > 0 && <p>{answer.appeal.join(' · ')}</p>}
          {privateDetails && answer.note && <p>{answer.note}</p>}
        </div><span className="soft-pill">{roleplayRatingLabel(answer.rating)}</span>
      </div>
    }))}
    {ROLEPLAY_THEMES.map(theme => {
      const answer = interests?.themes?.[theme.id]
      if (!answer) return null
      return <div key={theme.id} className="roleplay-summary-row"><div><strong>{theme.label}</strong><CollectionActivitySummary answer={answer} privateDetails={privateDetails} />{privateDetails && answer.note && <p>{answer.note}</p>}</div><span className="soft-pill">{roleplayRatingLabel(answer.rating)}</span></div>
    })}
    {onEdit && <button type="button" className="text-button no-print" onClick={onEdit}>Edit roleplay interests</button>}
  </section>
}
