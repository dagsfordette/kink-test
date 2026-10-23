import { useEffect, useId, useRef, useState } from 'react'
import { bodyModelAsset } from '../../lib/bodyAreas.js'
import { drawBodyPaint, drawBodyRaster, PAINT_BRUSHES } from '../../lib/bodyPaint.js'

export default function BodyPaintCanvas({ model, side, strokes = [], raster, brush = 'enjoy', size = 18, onStroke, jumpTo, label }) {
  const id = useId().replaceAll(':', '')
  const canvas = useRef(null), draft = useRef(null)
  const [drawing, setDrawing] = useState(null)
  const [cursor, setCursor] = useState(null)
  useEffect(() => { if (jumpTo) setCursor(jumpTo) }, [jumpTo])
  useEffect(() => { draft.current = null; setDrawing(null); setCursor(null) }, [model, side])
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return
    ctx.setTransform(2, 0, 0, 2, 0, 0)
    if (raster) drawBodyRaster(ctx, raster)
    else drawBodyPaint(ctx, drawing ? [...strokes, drawing] : strokes)
  }, [strokes, drawing, raster])
  const point = (event) => {
    const r = event.currentTarget.getBoundingClientRect()
    return [Math.round(Math.max(0, Math.min(300, (event.clientX - r.left) * 300 / r.width)) * 10) / 10,
      Math.round(Math.max(0, Math.min(510, (event.clientY - r.top) * 510 / r.height)) * 10) / 10]
  }
  const finish = () => {
    if (draft.current) onStroke?.(draft.current)
    draft.current = null; setDrawing(null)
  }
  return <div className={`body-paint-surface ${onStroke ? 'body-paint-editable' : ''}`}>
    <svg viewBox="0 0 300 510" className="body-paint-art" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-fade-x`}><stop stopColor="black" /><stop offset=".12" stopColor="white" /><stop offset=".88" stopColor="white" /><stop offset="1" stopColor="black" /></linearGradient>
        <linearGradient id={`${id}-fade-y`} x2="0" y2="1"><stop stopColor="black" /><stop offset=".04" stopColor="white" /><stop offset=".92" stopColor="white" /><stop offset="1" stopColor="black" /></linearGradient>
        <mask id={`${id}-mask-x`} maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="510"><rect width="300" height="510" fill={`url(#${id}-fade-x)`} /></mask>
        <mask id={`${id}-mask-y`} maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="510"><rect width="300" height="510" fill={`url(#${id}-fade-y)`} /></mask>
      </defs>
      <g mask={`url(#${id}-mask-x)`}><g mask={`url(#${id}-mask-y)`}><image href={`${import.meta.env.BASE_URL}${bodyModelAsset(model)}`} x={side === 'front' ? 22.5 : -232.5} width="510" height="510" preserveAspectRatio="none" /></g></g>
    </svg>
    <canvas ref={canvas} width="600" height="1020" tabIndex={onStroke ? 0 : undefined} role="img" aria-label={label || `${side} ${model} body map. Use arrow keys to move the brush and Space to paint.`}
      onPointerDown={onStroke ? (event) => {
        if (event.button !== 0) return
        event.preventDefault(); const p = point(event)
        event.currentTarget.focus({ preventScroll: true }); event.currentTarget.setPointerCapture(event.pointerId)
        setCursor(p); draft.current = { brush, size, points: [p] }; setDrawing(draft.current)
      } : undefined}
      onPointerMove={onStroke ? (event) => {
        const p = point(event); setCursor(p)
        if (!draft.current) return
        const last = draft.current.points.at(-1)
        if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 1.5) return
        const points = draft.current.points.length < 512 ? [...draft.current.points, p] : [...draft.current.points.slice(0, -1), p]
        draft.current = { ...draft.current, points }; setDrawing(draft.current)
      } : undefined}
      onPointerUp={onStroke ? (event) => { finish(); event.currentTarget.releasePointerCapture(event.pointerId) } : undefined}
      onPointerCancel={() => { draft.current = null; setDrawing(null) }}
      onPointerLeave={() => { if (!draft.current) setCursor(null) }}
      onKeyDown={onStroke ? (event) => {
        const moves = { ArrowLeft: [-5, 0], ArrowRight: [5, 0], ArrowUp: [0, -5], ArrowDown: [0, 5] }
        if (moves[event.key]) {
          event.preventDefault(); const p = cursor || [150, 200], d = moves[event.key]
          const next = [Math.max(0, Math.min(300, p[0] + d[0])), Math.max(0, Math.min(510, p[1] + d[1]))]
          setCursor(next)
          if (event.shiftKey) onStroke({ brush, size, points: [p, next] })
        } else if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault(); onStroke({ brush, size, points: [cursor || [150, 200]] })
        }
      } : undefined} />
    {onStroke && cursor && <svg viewBox="0 0 300 510" className="body-paint-cursor" aria-hidden="true"><circle cx={cursor[0]} cy={cursor[1]} r={size / 2} fill="none" stroke={PAINT_BRUSHES.find((b) => b.id === brush)?.color || '#fff'} strokeWidth="1.5" /></svg>}
  </div>
}
