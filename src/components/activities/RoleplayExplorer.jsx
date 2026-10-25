import CollectionActivityControls from './CollectionActivityControls.jsx'
import { activityDetailsAllowed } from '../../lib/collectionActivityAnswers.js'
import { useState } from 'react'
import {
  ROLEPLAY_ROLES, ROLEPLAY_THEMES, ROLEPLAY_RATINGS, ROLEPLAY_SIDES,
  normalizeRoleplayInterests, setRoleplayRating, setRoleplayDetails, setRoleplayThemeRating, setRoleplayThemeDetails,
  roleplayRoleLabel, roleplayRatingLabel, roleplaySideLabel
} from '../../lib/roleplayInterests.js'

export default function RoleplayExplorer({ activityState, onExploration }) {
  const e = activityState.exploration, interests = e.roleplayInterests || { roles: {}, themes: {} }
  const groups = [...new Set(ROLEPLAY_ROLES.map(role => role.group))]
  const [section, setSection] = useState('roles'), [group, setGroup] = useState(groups[0]), [selected, setSelected] = useState('teacher')
  const role = ROLEPLAY_ROLES.find(role => role.id === selected)
  const save = next => onExploration({ ...e, roleplayInterests: next })
  const detail = (side, patch) => save(setRoleplayDetails(interests, role.id, side, patch))
  return <section className="roleplay-explorer" aria-label="Roleplay preferences">
    <p className="muted">Unmarked means no answer recorded.</p>
    <div className="activity-detail-chips" role="group" aria-label="Roleplay section">
      {[['roles', 'Roles'], ['themes', 'Scenarios & themes']].map(([id, label]) => <button type="button" key={id} className={`chip ${section === id ? 'selected' : ''}`} aria-pressed={section === id} onClick={() => setSection(id)}>{label}</button>)}
    </div>
    {section === 'roles' ? <>
      <div className="roleplay-group-picker" role="group" aria-label="Role groups">
        {groups.map(label => <button type="button" key={label} className={`chip ${group === label ? 'selected' : ''}`} aria-pressed={group === label} onClick={() => { setGroup(label); setSelected(ROLEPLAY_ROLES.find(role => role.group === label).id) }}>{label}</button>)}
      </div>
      <div className="roleplay-role-picker" role="group" aria-label="Explore a role">
        {ROLEPLAY_ROLES.filter(role => role.group === group).map(item => <button type="button" key={item.id} className={`roleplay-role-choice ${selected === item.id ? 'selected' : ''}`} aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}>
          {item.label}
          {ROLEPLAY_SIDES.some(side => interests.roles?.[item.id]?.[side]) && <small>{ROLEPLAY_SIDES.filter(side => interests.roles?.[item.id]?.[side]).map(side => `${side === 'self' ? 'Me' : 'Partner'}: ${roleplayRatingLabel(interests.roles[item.id][side].rating)}`).join(' · ')}</small>}
        </button>)}
      </div>
      <header className="roleplay-role-heading"><h2>{role.label}</h2><p>{role.description}</p></header>
      <div className="roleplay-rating-list">
        {ROLEPLAY_SIDES.map(side => <div className="roleplay-rating-row" key={side}>
          <h3>{roleplaySideLabel(role, side)}</h3>
          <CollectionActivityControls answer={interests.roles?.[role.id]?.[side]} label={roleplaySideLabel(role, side)} onRating={rating => save(setRoleplayRating(interests, role.id, side, rating))} onDetails={patch => detail(side, patch)} />
        </div>)}
      </div>
      {ROLEPLAY_SIDES.map(side => {
        const answer = interests.roles?.[role.id]?.[side]
        if (!activityDetailsAllowed(answer?.rating)) return null
        const options = side === 'self' ? role.selfAppeal : role.partnerAppeal
        return <section key={`${role.id}-${side}`} className="roleplay-expanded" aria-label={`${roleplaySideLabel(role, side)}: optional details`}>
          <h3>{roleplaySideLabel(role, side)}</h3>
          <fieldset><legend>{side === 'self' ? 'My partner’s role' : 'My role'} <small>Optional</small></legend>
            <div className="activity-detail-chips">{role.counterparts.map(id => <button type="button" key={id} className={`chip ${answer.pairs?.includes(id) ? 'selected' : ''}`} aria-pressed={answer.pairs?.includes(id) || false} onClick={() => detail(side, { pairs: answer.pairs?.includes(id) ? answer.pairs.filter(pair => pair !== id) : [...(answer.pairs || []), id] })}>{roleplayRoleLabel(id)}</button>)}</div>
          </fieldset>
          {(answer.pairs || []).map(id => <label className="roleplay-pair-rating" key={id}>
            <span>With: {roleplayRoleLabel(id)}</span>
            <select aria-label={`${roleplaySideLabel(role, side)} with ${roleplayRoleLabel(id)}`} value={answer.pairRatings?.[id] || ''} onChange={event => {
              const pairRatings = { ...answer.pairRatings }
              if (event.target.value) pairRatings[id] = event.target.value
              else delete pairRatings[id]
              detail(side, { pairRatings })
            }}>
              <option value="">General preference · {roleplayRatingLabel(answer.rating)}</option>
              {ROLEPLAY_RATINGS.map(([id, label]) => <option value={id} key={id}>{label}</option>)}
            </select>
            {answer.pairRatings?.[id] === 'soft_limit' && <span>My conditions for this pairing <small>Optional · private</small><textarea rows="2" maxLength={2000} value={answer.pairConditions?.[id] || ''} onChange={event => detail(side, { pairConditions: { ...answer.pairConditions, [id]: event.target.value } })} /></span>}
          </label>)}
          <fieldset><legend>What appeals? <small>Optional</small></legend><div className="activity-detail-chips">
            {options.map(text => <button type="button" key={text} className={`chip ${answer.appeal?.includes(text) ? 'selected' : ''}`} aria-pressed={answer.appeal?.includes(text) || false} onClick={() => detail(side, { appeal: answer.appeal?.includes(text) ? answer.appeal.filter(value => value !== text) : [...(answer.appeal || []), text] })}>{text}</button>)}
          </div></fieldset>
          <details><summary>Something else / notes</summary><label>Other roles, scenarios, or preferences<textarea rows="2" maxLength={2000} value={answer.note || ''} onChange={event => detail(side, { note: event.target.value })} placeholder="Anything more specific…" /></label></details>
        </section>
      })}
    </> : <div className="roleplay-theme-grid">
      {ROLEPLAY_THEMES.map(theme => {
        const answer = interests.themes?.[theme.id]
        return <article key={theme.id} className="roleplay-theme-card"><h2>{theme.label}</h2><p>{theme.description}</p>
          <CollectionActivityControls answer={answer} label={theme.label} onRating={rating => save(setRoleplayThemeRating(interests, theme.id, rating))} onDetails={patch => save(setRoleplayThemeDetails(interests, theme.id, patch))} />
          {activityDetailsAllowed(answer?.rating) && <details><summary>Make it more specific</summary><label>Characters, roles, or scenarios you have in mind<textarea rows="2" maxLength={2000} value={answer.note || ''} onChange={event => save(normalizeRoleplayInterests({ ...interests, themes: { ...interests.themes, [theme.id]: { ...answer, note: event.target.value } } }))} /></label></details>}
        </article>
      })}
    </div>}
  </section>
}
