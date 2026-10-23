import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { bodyRegions, bodyActivityIds, bodyAreaStatus } from '../src/lib/bodyAreas.js'
const catalog = JSON.parse(fs.readFileSync(new URL('../src/data/activityCatalog.json', import.meta.url)))
test('body map covers all 123 activities exactly once across both ownership views', () => {
  const ids = bodyRegions.flatMap((r) => r.areas.flatMap((area) => [...bodyActivityIds(area, 'self'), ...bodyActivityIds(area, 'partner')]))
  const expected = catalog.activities.filter((a) => a.categoryId === 'body_part_fetishes').map((a) => a.id)
  assert.equal(new Set(ids).size, ids.length)
  assert.deepEqual(ids.sort(), expected.sort())
})
test('map distinguishes mixed answers and limits without treating missing answers as rejection', () => {
  assert.equal(bodyAreaStatus([undefined, {}]), 'unanswered')
  assert.equal(bodyAreaStatus([{ stance: 'love' }, undefined]), 'interest')
  assert.equal(bodyAreaStatus([{ stance: 'hard_limit' }]), 'limit')
  assert.equal(bodyAreaStatus([{ stance: 'want' }, { stance: 'hard_limit' }]), 'mixed')
})
