import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compareActivityProfiles, comparisonStateLabels } from '../src/lib/activityComparison.js'

const catalog = JSON.parse(readFileSync(new URL('../src/data/activityCatalog.json', import.meta.url), 'utf8'))
const profile = (answers) => ({ activities: { answers } })

test('directional complements produce a strong match', () => {
  const left = profile({ give_commands: { stance: 'want' } })
  const right = profile({ receive_commands: { stance: 'love' } })
  const comparison = compareActivityProfiles(catalog, left, right)
  const row = comparison.rows.find((item) => item.activityId === 'give_commands')
  assert.equal(row.partnerActivityId, 'receive_commands')
  assert.equal(row.state, 'strong_match')
  assert.equal(comparison.counts.strong_match, 1)
  assert.equal(comparisonStateLabels.strong_match, 'Strong match')
  assert.match(comparison.note, /no overall compatibility percentage or score/i)
})

test('hard-limit conflicts always take precedence over positive desire', () => {
  const left = profile({ give_commands: { stance: 'want' } })
  const right = profile({ receive_commands: { stance: 'hard_limit' } })
  const comparison = compareActivityProfiles(catalog, left, right)
  assert.equal(comparison.counts.hard_limit_conflict, 1)
  assert.equal(comparison.rows[0].state, 'hard_limit_conflict')
})

test('soft limits classify as conditional discussion', () => {
  const comparison = compareActivityProfiles(catalog,
    profile({ give_commands: { stance: 'love' } }),
    profile({ receive_commands: { stance: 'soft_limit' } }),
  )
  assert.equal(comparison.counts.conditional_discussion, 1)
})

test("don't want against positive interest is a preference mismatch", () => {
  const comparison = compareActivityProfiles(catalog,
    profile({ give_commands: { stance: 'want' } }),
    profile({ receive_commands: { stance: 'dont_want' } }),
  )
  assert.equal(comparison.counts.preference_mismatch, 1)
})

test('if my partner wants can form a willing match', () => {
  const comparison = compareActivityProfiles(catalog,
    profile({ give_commands: { stance: 'love' } }),
    profile({ receive_commands: { stance: 'if_partner_wants' } }),
  )
  assert.equal(comparison.counts.willing_match, 1)
})

test('mutual curiosity is classified separately', () => {
  const comparison = compareActivityProfiles(catalog,
    profile({ give_commands: { stance: 'curious' } }),
    profile({ receive_commands: { stance: 'curious' } }),
  )
  assert.equal(comparison.counts.mutual_curiosity, 1)
})

test('missing one side is insufficient data', () => {
  const comparison = compareActivityProfiles(catalog,
    profile({ give_commands: { stance: 'want' } }),
    profile({}),
  )
  assert.equal(comparison.counts.insufficient_data, 1)
})

test('experience gaps are informational rather than incompatibility', () => {
  const comparison = compareActivityProfiles(catalog,
    profile({ give_commands: { stance: 'want', experience: 'not_tried' } }),
    profile({ receive_commands: { stance: 'love', experience: 'very_experienced' } }),
  )
  const row = comparison.rows.find((item) => item.activityId === 'give_commands')
  assert.equal(row.state, 'strong_match')
  assert.match(row.experienceNote, /substantially more experience/i)
})
