import { useState } from 'react'
import BodyPaintCanvas from './BodyPaintCanvas.jsx'
import { bodyRegions, suggestedBodyModel } from '../../lib/bodyAreas.js'
import { PAINT_BRUSHES, setPaintView } from '../../lib/bodyPaint.js'

export default function BodyAreaExplorer({ activityState, onExploration }) {
  const e = activityState.exploration
  const [owner, setOwner] = useState('partner'), [side, setSide] = useState('front')
  const [brush, setBrush] = useState('enjoy'), [size, setSize] = useState(18)
  const [past, setPast] = useState({}), [future, setFuture] = useState({})
  const [jumpTo, setJumpTo] = useState(null), [message, setMessage] = useState('')
  const model = suggestedBodyModel(owner, activityState) || 'female'
  const key = `${owner}-${model}-${side}`
  const strokes = e.bodyPaint?.[owner]?.[model]?.[side] || []
  const save = (next) => onExploration({ ...e, bodyPaint: setPaintView(e.bodyPaint, owner, model, side, next) })
  const commit = (next) => {
    setPast({ ...past, [key]: [...(past[key] || []), strokes].slice(-30) })
    setFuture({ ...future, [key]: [] }); save(next); setMessage('Saved')
  }
  return <section className="body-brush-editor" aria-label="Paint body preferences">
    <div className="body-owner" role="group" aria-label="Whose body?">
      {['partner', 'self'].map((id) => <button type="button" key={id} className={`chip ${owner === id ? 'selected' : ''}`} aria-pressed={owner === id} onClick={() => { setOwner(id); setMessage('') }}>{id === 'self' ? 'My body' : 'My partner’s body'}</button>)}
    </div>
    <div className="body-paint-layout">
      <div className="body-map-panel">
          <div className="body-side" role="group" aria-label="Body view">{['front', 'back'].map((value) => <button type="button" key={value} className={`chip ${side === value ? 'selected' : ''}`} aria-pressed={side === value} onClick={() => { setSide(value); setMessage('') }}>{value === 'front' ? 'Front' : 'Back'}</button>)}</div>
          <BodyPaintCanvas key={key} model={model} side={side} strokes={strokes} brush={brush} size={size} jumpTo={jumpTo}
            label={`${side} view of ${owner === 'self' ? 'my body' : 'my partner’s body'}. Paint with the selected brush. Arrow keys move; Space paints; Shift and arrows draw.`}
            onStroke={(stroke) => { if (strokes.length >= 1000) { setMessage('This view is full. Clear it or undo some strokes before painting more.'); return } commit([...strokes, stroke]) }} />
      </div>
      <div className="body-brush-controls">
        <fieldset className="body-brush-palette"><legend>Brushes</legend>
          {PAINT_BRUSHES.map((b) => <button type="button" key={b.id} aria-pressed={brush === b.id} className={`body-brush ${brush === b.id ? 'selected' : ''}`} onClick={() => setBrush(b.id)}><i style={{ background: b.color }} />{b.label}</button>)}
          <button type="button" aria-pressed={brush === 'erase'} className={`body-brush ${brush === 'erase' ? 'selected' : ''}`} onClick={() => setBrush('erase')}><i className="body-eraser-swatch" />Eraser</button>
        </fieldset>
        <label className="body-brush-size">Brush size<input type="range" min="6" max="40" step="2" value={size} onChange={(event) => setSize(Number(event.target.value))} /><span>{size}</span></label>
        <div className="body-paint-actions">
          <button type="button" className="secondary-button" disabled={!past[key]?.length} onClick={() => {
            const previous = past[key].at(-1); setPast({ ...past, [key]: past[key].slice(0, -1) }); setFuture({ ...future, [key]: [...(future[key] || []), strokes] }); save(previous); setMessage('Undone')
          }}>Undo</button>
          <button type="button" className="secondary-button" disabled={!future[key]?.length} onClick={() => {
            const next = future[key].at(-1); setFuture({ ...future, [key]: future[key].slice(0, -1) }); setPast({ ...past, [key]: [...(past[key] || []), strokes] }); save(next); setMessage('Redone')
          }}>Redo</button>
          <button type="button" className="text-button" disabled={!strokes.length} onClick={() => commit([])}>Clear this view</button>
        </div>
        <p className="body-paint-save" role="status">{message}</p>
        <p className="body-paint-caption">Each body and view has its own painting.</p>
        <details className="body-keyboard-help"><summary>Keyboard painting</summary>
          <p>Focus the body, then use arrow keys to move and Space to paint. Hold Shift with an arrow key to draw a line.</p>
          <label>Move brush to<select defaultValue="" onChange={(event) => {
            const r = bodyRegions.find((r) => r.id === event.target.value)
            if (r) {
              const maleY = { head:48, neck:94, chest:147, arms:253, middle:215, hips:265, intimate:289, legs:365, feet:464 }
              setJumpTo([r.x, model === 'male' ? maleY[r.id] : r.y])
            }
          }}><option value="">Choose an area</option>{bodyRegions.filter((r) => r.x && (side === 'front' || !['chest', 'intimate'].includes(r.id))).map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}</select></label>
        </details>
      </div>
    </div>
  </section>
}
