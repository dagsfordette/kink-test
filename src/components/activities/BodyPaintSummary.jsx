import BodyPaintCanvas from './BodyPaintCanvas.jsx'
import { paintedViews, PAINT_BRUSHES } from '../../lib/bodyPaint.js'
export default function BodyPaintSummary({ paint, title = 'Body-area preferences', person = 'self' }) {
  const views = paintedViews(paint)
  if (!views.length) return null
  return <section className="body-paint-summary">
    <h2>{title}</h2>
    <div className="body-legend">{PAINT_BRUSHES.map((b) => <span key={b.id}><i className="body-status-dot" style={{ background: b.color }} />{b.label}</span>)}</div>
    <p>Unmarked areas have no rating. These maps describe body-area preferences, not answers to specific activities.</p>
    <div className="body-paint-summary-grid">{views.map((v) => <article key={v.key}>
      <h3>{v.owner === 'self' ? (person === 'self' ? 'My body' : 'Their body') : (person === 'self' ? 'My partner’s body' : 'Their partner’s body')} · {v.model === 'male' ? 'Male' : 'Female'} · {v.side === 'front' ? 'Front' : 'Back'}</h3>
      <BodyPaintCanvas {...v} label={`${v.owner === 'self' ? (person === 'self' ? 'My body' : 'Their body') : (person === 'self' ? 'My partner’s body' : 'Their partner’s body')}, ${v.model}, ${v.side}: painted preferences`} />
    </article>)}</div>
  </section>
}
