export const PAINT_BRUSHES = [
  { id: 'no', label: 'No', color: '#f08f98' },
  { id: 'enjoy', label: 'Enjoy', color: '#83d8bd' },
  { id: 'love', label: 'Love', color: '#f5a1d1' },
  { id: 'fetish', label: 'This is a fetish', color: '#c5a2ff' }
]
export const PAINT_OWNERS = ['self', 'partner']
export const PAINT_MODELS = ['male', 'female']
export const PAINT_SIDES = ['front', 'back']
const brushes = new Set([...PAINT_BRUSHES.map((b) => b.id), 'erase'])
const object = (x) => x && typeof x === 'object' && !Array.isArray(x)
export function normalizeBodyPaint(value, { strict = false } = {}) {
  if (value === undefined || value === null) return {}
  if (!object(value)) {
    if (strict) throw new Error('Invalid body-map painting.')
    return {}
  }
  const clean = {}
  const invalid = () => { if (strict) throw new Error('Invalid body-map painting.') }
  for (const owner of PAINT_OWNERS) {
    if (value[owner] !== undefined && !object(value[owner])) { invalid(); continue }
    for (const model of PAINT_MODELS) {
      if (value[owner]?.[model] !== undefined && !object(value[owner][model])) { invalid(); continue }
      for (const side of PAINT_SIDES) {
        const raw = value[owner]?.[model]?.[side]
        if (raw === undefined) continue
        if (!Array.isArray(raw) || raw.length > 1000) { invalid(); continue }
        const strokes = []
        for (const stroke of raw) {
          if (!brushes.has(stroke?.brush) || !Number.isFinite(stroke.size) || stroke.size < 2 || stroke.size > 80 ||
            !Array.isArray(stroke.points) || !stroke.points.length || stroke.points.length > 512 ||
            stroke.points.some((p) => !Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite) || p[0] < 0 || p[0] > 300 || p[1] < 0 || p[1] > 510)) { invalid(); continue }
          strokes.push({ brush: stroke.brush, size: stroke.size, points: stroke.points.map((p) => [...p]) })
        }
        if (strokes.length) {
          clean[owner] ||= {}; clean[owner][model] ||= {}; clean[owner][model][side] = strokes
        }
      }
    }
  }
  return clean
}
export function setPaintView(paint, owner, model, side, strokes) {
  return { ...paint, [owner]: { ...paint?.[owner], [model]: { ...paint?.[owner]?.[model], [side]: strokes } } }
}
export function paintedViews(paint) {
  const result = []
  for (const owner of PAINT_OWNERS) for (const model of PAINT_MODELS) for (const side of PAINT_SIDES) {
    const layer = paint?.[owner]?.[model]?.[side]
    const raster = Array.isArray(layer) ? rasterizePaint(layer) : layer
    if (raster?.runs?.length) result.push({ owner, model, side, raster, key: `${owner}-${model}-${side}` })
  }
  return result
}
export function drawBodyPaint(ctx, strokes) {
  ctx.clearRect(0, 0, 300, 510)
  for (const stroke of strokes) {
    ctx.lineWidth = stroke.size; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.beginPath(); ctx.moveTo(...stroke.points[0])
    if (stroke.points.length === 1) ctx.lineTo(stroke.points[0][0] + .01, stroke.points[0][1])
    else for (const p of stroke.points.slice(1)) ctx.lineTo(...p)
    // Replace the previous rating under this stroke, rather than blending ratings.
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'destination-out'; ctx.stroke()
    if (stroke.brush !== 'erase') {
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = .65
      ctx.strokeStyle = PAINT_BRUSHES.find((b) => b.id === stroke.brush).color; ctx.stroke()
    }
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'
}

// Public maps contain only the final painted cells, never erased/overpainted history.
export function rasterizePaint(strokes) {
  const pixels = new Uint8Array(300 * 510)
  for (const stroke of strokes) {
    const value = stroke.brush === 'erase' ? 0 : PAINT_BRUSHES.findIndex((b) => b.id === stroke.brush) + 1
    const radius = stroke.size / 2
    const stamp = ([x, y]) => {
      for (let row = Math.max(0, Math.ceil(y - radius)); row <= Math.min(509, Math.floor(y + radius)); row++) {
        const half = Math.sqrt(Math.max(0, radius * radius - (row - y) ** 2))
        const left = Math.max(0, Math.ceil(x - half)), right = Math.min(299, Math.floor(x + half))
        if (right >= left) pixels.fill(value, row * 300 + left, row * 300 + right + 1)
      }
    }
    stamp(stroke.points[0])
    for (let i = 1; i < stroke.points.length; i++) {
      const a = stroke.points[i - 1], b = stroke.points[i], steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1])))
      for (let n = 1; n <= steps; n++) stamp([a[0] + (b[0] - a[0]) * n / steps, a[1] + (b[1] - a[1]) * n / steps])
    }
  }
  const runs = []
  for (let start = 0; start < pixels.length;) {
    const value = pixels[start]; let end = start + 1
    while (end < pixels.length && pixels[end] === value) end++
    if (value) runs.push([start, end - start, value])
    start = end
  }
  return { width: 300, height: 510, runs }
}
export function publicBodyMaps(paint) {
  const source = normalizeBodyPaint(paint, { strict: true }), result = {}
  for (const owner of PAINT_OWNERS) for (const model of PAINT_MODELS) for (const side of PAINT_SIDES) {
    const strokes = source[owner]?.[model]?.[side]
    if (!strokes) continue
    const raster = rasterizePaint(strokes)
    if (raster.runs.length) { result[owner] ||= {}; result[owner][model] ||= {}; result[owner][model][side] = raster }
  }
  return result
}
export function parsePublicBodyMaps(raw) {
  if (raw === undefined) return {}
  if (!object(raw)) throw new Error('Invalid shared body maps.')
  const result = {}
  for (const owner of PAINT_OWNERS) for (const model of PAINT_MODELS) for (const side of PAINT_SIDES) {
    if (raw[owner] !== undefined && !object(raw[owner])) throw new Error('Invalid shared body maps.')
    if (raw[owner]?.[model] !== undefined && !object(raw[owner][model])) throw new Error('Invalid shared body maps.')
    const layer = raw[owner]?.[model]?.[side]
    if (layer === undefined) continue
    if (!object(layer) || layer.width !== 300 || layer.height !== 510 || !Array.isArray(layer.runs) || layer.runs.length > 153000) throw new Error('Invalid shared body maps.')
    let end = 0
    for (const run of layer.runs) {
      if (!Array.isArray(run) || run.length !== 3 || !run.every(Number.isInteger) || run[0] < end || run[1] < 1 || run[0] + run[1] > 153000 || run[2] < 1 || run[2] > 4) throw new Error('Invalid shared body maps.')
      end = run[0] + run[1]
    }
    if (layer.runs.length) { result[owner] ||= {}; result[owner][model] ||= {}; result[owner][model][side] = { width: 300, height: 510, runs: layer.runs.map((r) => [...r]) } }
  }
  return result
}
export function drawBodyRaster(ctx, raster) {
  ctx.clearRect(0, 0, 300, 510); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = .65
  for (const [start, length, value] of raster.runs) {
    ctx.fillStyle = PAINT_BRUSHES[value - 1].color
    let at = start, remaining = length
    while (remaining) {
      const x = at % 300, y = Math.floor(at / 300), width = Math.min(300 - x, remaining)
      ctx.fillRect(x, y, width, 1); remaining -= width; at += width
    }
  }
  ctx.globalAlpha = 1
}
