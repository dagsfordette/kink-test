import { useState } from 'react'
import ActivityCard from './ActivityCard.jsx'
import { bodyRegions, bodyAreaLabel, bodyActivityIds, bodyAreaStatus } from '../../lib/bodyAreas.js'
import { evaluateActivity } from '../../lib/eligibility.js'

export default function BodyAreaExplorer({ catalog, activityState, context, onStance, onExperience, onDetails, onNote, onClear, onToggleHidden }) {
  const [owner, setOwner] = useState('partner')
  const [side, setSide] = useState('front')
  const [regionId, setRegionId] = useState('head')
  const [area, setArea] = useState(null)
  const [search, setSearch] = useState('')
  const byId = new Map(catalog.activities.map((a) => [a.id, a]))
  const idsFor = (key) => bodyActivityIds(key, owner)
  const statusFor = (keys) => bodyAreaStatus(keys.flatMap((key) => idsFor(key).map((id) => activityState.answers[id])))
  const available = (key) => idsFor(key).some((id) => {
    const a = byId.get(id)
    return a && (activityState.answers[id] || activityState.drafts?.[id] || evaluateActivity(a, context, { reveal: activityState.navigation.showHidden }).queueVisible)
  })
  const region = bodyRegions.find((r) => r.id === regionId)
  const chooseRegion = (id, view = side) => {
    const backAreas = { head: 'scalp', middle: 'back', hips: 'buttocks' }
    setRegionId(id); setArea((view === 'back' && backAreas[id]) || bodyRegions.find((r) => r.id === id).areas[0]); setSearch('')
  }
  const regions = search.trim() ? bodyRegions : [region]
  const cards = area ? idsFor(area).map((id) => byId.get(id)).filter(Boolean) : []
  return <section className="body-explorer" aria-label="Body-area explorer">
    <p>Choose an area to explore the attention you enjoy.</p>
    <div className="body-owner" role="group" aria-label="Whose body?">
      {[[ 'partner', 'My partner’s body' ], [ 'self', 'My body' ]].map(([id, label]) => <button type="button" key={id} aria-pressed={owner === id} className={`chip ${owner === id ? 'selected' : ''}`} onClick={() => { setOwner(id) }}>{label}</button>)}
    </div>
    <div className="body-layout">
      <div className="body-map-panel">
        <div className="body-side" role="group" aria-label="Body view">
          {['front', 'back'].map((id) => <button type="button" className={`chip ${side === id ? 'selected' : ''}`} aria-pressed={side === id} key={id} onClick={() => { setSide(id); chooseRegion(id === 'back' ? 'middle' : 'chest', id) }}>{id === 'front' ? 'Front' : 'Back'}</button>)}
        </div>
        <svg className="body-map" viewBox="0 0 300 510" role="group" aria-label={`${side} view of ${owner === 'self' ? 'my body' : 'my partner’s body'}`}>
          <ellipse cx="150" cy="48" rx="28" ry="36" className="body-silhouette" />
          <path className="body-silhouette" d="M136 82 L136 98 Q109 101 96 117 L69 195 L54 260 Q51 274 61 278 Q70 281 75 266 L94 214 L109 177 L110 232 Q101 257 108 289 L110 355 L102 463 L94 481 Q91 493 107 493 L129 489 L141 367 L150 300 L159 367 L171 489 L193 493 Q209 493 206 481 L198 463 L190 355 L192 289 Q199 257 190 232 L191 177 L206 214 L225 266 Q230 281 239 278 Q249 274 246 260 L231 195 L204 117 Q191 101 164 98 L164 82 Z" />
          {side === 'back' ? <path className="body-contour" d="M150 112 L150 239 M119 265 Q135 251 150 269 Q165 251 181 265" /> : <path className="body-contour" d="M120 145 Q133 153 143 146 M157 146 Q167 153 180 145 M146 211 Q150 215 154 211" />}
          {bodyRegions.filter((r) => r.x && (side === 'front' || !['chest', 'intimate'].includes(r.id))).map((r) => <g key={r.id} role="button" tabIndex="0" aria-label={`${r.label}: ${statusFor(r.areas)}`} aria-pressed={regionId === r.id} className={`body-hotspot body-status-${statusFor(r.areas)} ${regionId === r.id ? 'active' : ''}`} onClick={() => chooseRegion(r.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); chooseRegion(r.id) } }}>
            <title>{r.label}</title><circle cx={r.x} cy={r.y} r="15" /><text x={r.x} y={r.y + 4} textAnchor="middle">{bodyRegions.indexOf(r) + 1}</text>
          </g>)}
        </svg>
        <div className="body-legend">{[['unanswered', 'Unanswered'], ['interest', 'Interest'], ['limit', 'Limit'], ['mixed', 'Mixed'], ['other', 'Other answer']].map(([id, label]) => <span key={id}><i className={`body-status-dot body-status-${id}`} />{label}</span>)}</div>
        <p className="body-map-caption">Colours summarise saved answers for this body view. Open an area for the exact preferences.</p>
      </div>
      <div className="body-browser">
        <nav className="body-region-list" aria-label="Body regions and features">{bodyRegions.map((r, i) => <button type="button" key={r.id} className={`chip ${regionId === r.id ? 'selected' : ''}`} aria-pressed={regionId === r.id} onClick={() => chooseRegion(r.id)}>{r.x ? `${i + 1}. ` : ''}{r.label}</button>)}</nav>
        <label className="body-search">Find an area or feature<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try hands, tattoos, scent…" /></label>
        <div className="body-area-choices">{regions.map((r) => {
          const areas = r.areas.filter((key) => bodyAreaLabel(key).toLowerCase().includes(search.trim().toLowerCase()))
          return areas.length > 0 && <div key={r.id}><h2>{r.label}</h2><div className="activity-detail-chips">{areas.map((key) => <button type="button" key={key} className={`chip ${area === key ? 'selected' : ''}`} aria-pressed={area === key} onClick={() => { setArea(key); setRegionId(r.id) }}><i className={`body-status-dot body-status-${statusFor([key])}`} />{bodyAreaLabel(key)}{!available(key) ? ' · excluded' : ''}</button>)}</div></div>
        })}</div>
        {search && !bodyRegions.some((r) => r.areas.some((key) => bodyAreaLabel(key).toLowerCase().includes(search.trim().toLowerCase()))) && <p>No matching area or feature.</p>}
        {!area && <p className="body-prompt">Select an area above to see its preferences.</p>}
        {area && <section className="body-area-editor" aria-label={`${bodyAreaLabel(area)} preferences`}><h2>{bodyAreaLabel(area)} · {owner === 'self' ? 'my body' : 'my partner’s body'}</h2>
          {cards.map((activity) => {
            const derived = evaluateActivity(activity, context, { reveal: activityState.navigation.showHidden })
            const reasons = derived.reasons.filter((r) => r.suppresses && r.code !== 'already_answered')
            if (!available(area) || (!activityState.answers[activity.id] && !activityState.drafts?.[activity.id] && !derived.queueVisible)) return <div key={activity.id} className="eligibility-reason"><p>{activity.label}</p>{reasons.map((r, i) => <p key={i}>{r.message}</p>)}</div>
            return <div key={activity.id}>{reasons.map((r, i) => <p className="eligibility-reason" key={i}>{r.message}</p>)}<ActivityCard catalog={catalog} activity={activity} answer={activityState.answers[activity.id]} hidden={activityState.navigation.hiddenActivityIds.includes(activity.id)} onStance={(v) => onStance(activity.id, v)} onExperience={(v) => onExperience(activity.id, v)} onDetails={(v) => onDetails(activity.id, v)} onNote={(v) => onNote(activity.id, v)} onClear={() => onClear(activity.id)} onToggleHidden={() => onToggleHidden(activity.id)} /></div>
          })}
        </section>}
      </div>
    </div>
  </section>
}
