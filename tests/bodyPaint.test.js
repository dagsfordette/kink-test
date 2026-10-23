import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { normalizeBodyPaint, setPaintView, rasterizePaint, publicBodyMaps, parsePublicBodyMaps } from '../src/lib/bodyPaint.js'
import { createExploration, normalizeExploration } from '../src/lib/explorationState.js'
import { createActivityState } from '../src/lib/activityProfile.js'
import { buildPartnerShareExport, parsePartnerShareExport } from '../src/lib/profileExports.js'
const catalog = JSON.parse(fs.readFileSync(new URL('../src/data/activityCatalog.json', import.meta.url)))
const stroke = (brush) => ({ brush, size: 18, points: [[150, 90], [150, 110]] })
test('paint remains separate across owner, model and view and survives normalization', () => {
  let paint = setPaintView({}, 'self', 'female', 'front', [stroke('no')])
  paint = setPaintView(paint, 'partner', 'male', 'back', [stroke('fetish')])
  assert.deepEqual(normalizeExploration({ bodyPaint: paint }, catalog).bodyPaint, paint)
  assert.equal(paint.self.female.back, undefined)
  assert.equal(paint.partner.male.front, undefined)
})
test('clear restores an unrated canvas without making any activity answers', () => {
  const activity = createActivityState(catalog)
  let paint = setPaintView({}, 'self', 'male', 'front', [stroke('love')])
  paint = setPaintView(paint, 'self', 'male', 'front', [])
  assert.deepEqual(normalizeBodyPaint(paint), {})
  assert.deepEqual(activity.answers, {})
  assert.deepEqual(normalizeBodyPaint(undefined), {})
})
test('paint exports and imports with exact geometry and no unrecognized/private fields', () => {
  const paint = { self: { female: { front: [{ ...stroke('no'), note: 'private', details: { secret: true } }, stroke('erase')] } } }
  const state = { activities: createActivityState(catalog), exploration: { ...createExploration(), bodyPaint: paint } }
  const share = buildPartnerShareExport(state, catalog)
  assert.deepEqual(share.bodyMaps, {})
  assert.equal(JSON.stringify(share).includes('private'), false)
  assert.deepEqual(parsePartnerShareExport(share, catalog).bodyMaps, share.bodyMaps)
  assert.deepEqual(share.activities.answers, {})
})
test('invalid brush strokes fail strict partner parsing instead of dropping negative markings', () => {
  for (const invalid of [{ ...stroke('no'), points: [[NaN, 20]] }, { ...stroke('no'), points: [[999, 20]] }, stroke('unknown'), { ...stroke('no'), size: 1000 }])
    assert.throws(() => normalizeBodyPaint({ self: { male: { front: [invalid] } } }, { strict: true }), /body-map/)
})
test('scent and tattoos have standalone categories and the map has no activity questions', () => {
  assert.equal(catalog.activities.some((a) => a.categoryId === 'body_part_fetishes'), false)
  assert.ok(catalog.activities.some((a) => a.categoryId === 'tattoo_interests'))
  assert.ok(catalog.activities.some((a) => a.categoryId === 'body_scent'))
})

test('erasing and overpainting remove old ratings from the public map', () => {
  const paint = setPaintView({}, 'self', 'male', 'front', [stroke('no'), stroke('love')])
  const shared = publicBodyMaps(paint)
  assert.ok(shared.self.male.front.runs.length)
  assert.ok(shared.self.male.front.runs.every((r) => r[2] === 3))
  assert.deepEqual(parsePublicBodyMaps(shared), shared)
  assert.deepEqual(rasterizePaint([stroke('no'), stroke('erase')]).runs, [])
  assert.throws(() => parsePublicBodyMaps({ self: { male: { front: { width: 300, height: 510, runs: [[0, 1, 99]] } } } }), /shared body maps/)
})
