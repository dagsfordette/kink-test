import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { relationshipGraph, scopeMembers } from '../src/lib/relationships.js'
import { ANATOMY_FEATURES, ROLE_VALUES } from '../src/lib/explorationState.js'

const load = (name) =>
  JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url)))
const catalog = load('activityCatalog'),
  fantasy = load('fantasyProfile')
function unique(rows) {
  const ids = new Set(rows.map((row) => row.id))
  assert.equal(ids.size, rows.length, 'IDs must be unique')
  return ids
}
const activities = unique(catalog.activities),
  categories = unique(catalog.categories)
const profiles = unique(catalog.detailProfiles),
  dimensions = unique(fantasy.dimensions)
const questions = unique(fantasy.questions)
unique(catalog.routingPrompts)
const graph = relationshipGraph(catalog)
assert.ok(graph.valid, graph.errors.join('; '))
function requirement(rule) {
  if (!rule) return
  if (rule.all || rule.any) {
    const children = rule.all || rule.any
    assert.ok(Array.isArray(children) && children.length)
    children.forEach(requirement)
  } else {
    assert.ok(
      ['self', 'partner', 'other', 'unspecified'].includes(rule.participant)
    )
    assert.ok(
      [...ANATOMY_FEATURES, 'prostate', 'testicles', 'breasts', 'nipples', 'vulva', 'clitoris', 'anus'].includes(rule.anatomy) ||
        typeof rule.deviceId === 'string'
    )
  }
}
for (const a of catalog.activities) {
  assert.ok(
    a.label && categories.has(a.categoryId) && profiles.has(a.detailProfileId),
    a.id
  )
  requirement(a.applicability)
  assert.equal(
    a.boundaryCapability,
    graph.children.get(a.id).length ? 'subtype_branch' : 'activity_only',
    a.id
  )
  for (const config of a.roleConfigurations)
    for (const [dimension, values] of Object.entries(config)) {
      assert.ok(
        ROLE_VALUES[dimension] &&
          values.every((value) => ROLE_VALUES[dimension].includes(value)),
        a.id
      )
    }
  for (const link of a.fantasyConnections)
    assert.ok(dimensions.has(link.dimensionId), a.id)
}
for (const profile of catalog.detailProfiles) {
  unique(profile.fields)
  for (const field of profile.fields) {
    assert.ok(
      [
        'text',
        'single_select',
        'paired_select',
        'preference_matrix',
        'multi_select'
      ].includes(field.type),
      field.id
    )
    unique(field.options || [])
    for (const id of [
      ...(field.appliesToActivityIds || []),
      ...(field.excludeForActivityIds || [])
    ])
      assert.ok(activities.has(id), id)
    if (field.showWhen)
      assert.ok(
        profile.fields.some((f) => f.id === field.showWhen.field),
        field.id
      )
  }
}
for (const prompt of catalog.routingPrompts) {
  assert.equal(prompt.allowsHardBoundary, false)
  assert.ok(prompt.categoryIds.every((id) => categories.has(id)))
  assert.ok(scopeMembers(catalog, prompt.scope).length, prompt.id)
}
for (const rule of catalog.relevanceRules)
  assert.ok(
    rule.activityIds.every((id) => activities.has(id)),
    rule.id
  )
for (const rule of catalog.roleSuggestionRules)
  assert.ok(
    rule.sourceQuestionIds.every((id) => questions.has(id)),
    rule.id
  )
for (const question of fantasy.questions)
  for (const signal of question.signals || [])
    assert.ok(dimensions.has(signal.dimensionId), question.id)
console.log(
  `Catalog OK: ${activities.size} activities, ${questions.size} fantasy questions, ${catalog.routingPrompts.length} topics`
)
