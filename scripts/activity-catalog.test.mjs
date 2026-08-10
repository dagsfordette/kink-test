import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  EXPECTED_EXPERIENCE_STATES,
  EXPECTED_STANCE_STATES,
  validateActivityCatalog,
} from './activity-catalog-validation.mjs'

const catalog = JSON.parse(readFileSync(new URL('../src/data/activityCatalog.json', import.meta.url), 'utf8'))
const fantasyProfile = JSON.parse(readFileSync(new URL('../src/data/fantasyProfile.json', import.meta.url), 'utf8'))
const activityById = new Map(catalog.activities.map((row) => [row.id, row]))
const categoryIds = new Set(catalog.categories.map((row) => row.id))
const detailProfileIds = new Set(catalog.detailProfiles.map((row) => row.id))

test('Activity Explorer dataset passes structural validation', () => {
  assert.deepEqual(validateActivityCatalog(catalog, fantasyProfile), [])
  assert.deepEqual(catalog.stanceScale.map((row) => row.id), EXPECTED_STANCE_STATES)
  assert.deepEqual(catalog.experienceScale.map((row) => row.id), EXPECTED_EXPERIENCE_STATES)
})

test('activity IDs are unique', () => {
  const ids = catalog.activities.map((row) => row.id)
  assert.equal(new Set(ids).size, ids.length)
})

test('complements resolve and are reciprocal', () => {
  const directional = catalog.activities.filter((row) => row.complementId)
  assert.ok(directional.length > 0)
  for (const activity of directional) {
    const complement = activityById.get(activity.complementId)
    assert.ok(complement, `${activity.id} complement should resolve`)
    assert.equal(complement.complementId, activity.id)
  }
  assert.equal(activityById.get('give_commands').complementId, 'receive_commands')
  assert.equal(activityById.get('receive_commands').complementId, 'give_commands')
})

test('priority tiers use only starter, extended, or specialized', () => {
  const allowed = new Set(['starter', 'extended', 'specialized'])
  for (const activity of catalog.activities) assert.ok(allowed.has(activity.priority), `${activity.id} has valid priority`)
  for (const tier of allowed) assert.ok(catalog.activities.some((row) => row.priority === tier), `${tier} should be represented`)
})

test('every activity category is valid and every category is reachable', () => {
  for (const activity of catalog.activities) assert.ok(categoryIds.has(activity.categoryId), `${activity.id} category should resolve`)
  for (const category of catalog.categories) assert.ok(catalog.activities.some((row) => row.categoryId === category.id), `${category.id} should contain activities`)
})

test('detail profile references resolve, including nested activity references', () => {
  for (const activity of catalog.activities) {
    if (activity.detailProfileId) assert.ok(detailProfileIds.has(activity.detailProfileId), `${activity.id} detail profile should resolve`)
  }
  const activityIds = new Set(catalog.activities.map((row) => row.id))
  const visit = (value) => {
    if (Array.isArray(value)) return value.forEach(visit)
    if (!value || typeof value !== 'object') return
    for (const [key, child] of Object.entries(value)) {
      assert.notEqual(key, 'appliesToConceptIds')
      assert.notEqual(key, 'excludeForConceptIds')
      if ((key === 'appliesToActivityIds' || key === 'excludeForActivityIds') && Array.isArray(child)) {
        for (const id of child) assert.ok(activityIds.has(id), `${id} nested detail reference should resolve`)
      }
      visit(child)
    }
  }
  visit(catalog.detailProfiles)
})

test('Fantasy Profile suggestion targets resolve to Activity Explorer categories', () => {
  for (const suggestion of fantasyProfile.suggestionRules) {
    for (const categoryId of suggestion.activityCategoryIds) assert.ok(categoryIds.has(categoryId), `${suggestion.id} target ${categoryId} should resolve`)
  }
})

test('new catalog contains no legacy universal stance/fantasy/willingness/boundary scales', () => {
  assert.equal('scales' in catalog, false)
  for (const key of ['willingness', 'boundary', 'realWorldDesire', 'experienceLevel']) assert.equal(key in catalog, false)
  const legacyScaleStateIds = [
    'actively_want', 'interested_in_trying', 'open_to_it', 'fantasy_only', 'not_interested',
    'strongly_want', 'prefer_not', 'do_not_want', 'conditional',
  ]
  const authoritativeIds = new Set([...catalog.stanceScale, ...catalog.experienceScale].map((row) => row.id))
  for (const id of legacyScaleStateIds) assert.equal(authoritativeIds.has(id), false)
})

test('pure emotion and fantasy-only catalog areas are retired', () => {
  assert.equal(categoryIds.has('emotional_arousal'), false)
  assert.equal(categoryIds.has('fantasy_transform'), false)
  assert.equal(/\bfantasy\b/i.test(JSON.stringify(catalog)), false)
  assert.equal(catalog.activities.some((row) => /^emotion_/.test(row.id) || /^Feeling\b/.test(row.label)), false)
})
