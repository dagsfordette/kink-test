import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const EXPECTED_STANCE_STATES = [
  'love',
  'want',
  'curious',
  'if_partner_wants',
  'dont_want',
  'soft_limit',
  'hard_limit',
]

export const EXPECTED_EXPERIENCE_STATES = [
  'not_tried',
  'tried_once',
  'some_experience',
  'experienced',
  'very_experienced',
]

export const EXPECTED_STANCE_MEANINGS = {
  love: "This is a core part of what I'm into.",
  want: 'I actively want to do or try this.',
  curious: "I'm interested enough to explore this.",
  if_partner_wants: 'I would not seek this out myself, but I may be open to it for a partner.',
  dont_want: 'I would rather not do this.',
  soft_limit: 'This may only be possible under specific circumstances or boundaries.',
  hard_limit: 'I do not want this to happen.',
}

const VALID_PRIORITIES = new Set(['starter', 'extended', 'specialized'])
const AMBIGUOUS_BARE_LABELS = new Set(['Obedience', 'Latex', 'Feet', 'Commands'])

function duplicateIds(rows = []) {
  const seen = new Set()
  const duplicates = new Set()
  for (const row of rows) {
    if (!row?.id) continue
    if (seen.has(row.id)) duplicates.add(row.id)
    seen.add(row.id)
  }
  return [...duplicates]
}

function walk(value, visit, path = '$') {
  visit(value, path)
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visit, `${path}[${index}]`))
    return
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) walk(child, visit, `${path}.${key}`)
  }
}

export function validateActivityCatalog(catalog, fantasyProfile = null) {
  const errors = []
  const error = (message) => errors.push(message)

  const categories = catalog?.categories || []
  const activities = catalog?.activities || []
  const detailProfiles = catalog?.detailProfiles || []
  const riskDomains = catalog?.riskDomains || []

  const categoryIds = new Set(categories.map((row) => row.id))
  const activityIds = new Set(activities.map((row) => row.id))
  const detailProfileIds = new Set(detailProfiles.map((row) => row.id))
  const riskDomainIds = new Set(riskDomains.map((row) => row.id))
  const activityById = new Map(activities.map((row) => [row.id, row]))

  const stanceIds = (catalog?.stanceScale || []).map((row) => row.id)
  if (JSON.stringify(stanceIds) !== JSON.stringify(EXPECTED_STANCE_STATES)) {
    error('Activity Explorer stance scale must contain exactly the seven required semantic states in order.')
  }
  for (const row of catalog?.stanceScale || []) {
    if (row.meaning !== EXPECTED_STANCE_MEANINGS[row.id]) error(`Stance ${row.id} has the wrong user-facing meaning.`)
    if ('score' in row || 'value' in row || 'weight' in row) error(`Stance ${row.id} must not be represented as a numerical rating.`)
  }

  const experienceIds = (catalog?.experienceScale || []).map((row) => row.id)
  if (JSON.stringify(experienceIds) !== JSON.stringify(EXPECTED_EXPERIENCE_STATES)) {
    error('Activity Explorer experience scale must contain exactly the required independent experience states in order.')
  }
  for (const row of catalog?.experienceScale || []) {
    if ('score' in row || 'value' in row || 'weight' in row) error(`Experience state ${row.id} must not imply stance or a score.`)
  }

  if (catalog?.scales || catalog?.questionnaire?.scales) error('Legacy universal scale definitions must not appear in Activity Explorer.')
  for (const key of ['willingness', 'boundary', 'realWorldDesire', 'experienceLevel']) {
    if (Object.hasOwn(catalog || {}, key)) error(`Legacy ${key} model must not appear in Activity Explorer.`)
  }

  for (const [name, rows] of [['category', categories], ['activity', activities], ['detail profile', detailProfiles], ['risk domain', riskDomains]]) {
    const duplicates = duplicateIds(rows)
    if (duplicates.length) error(`Duplicate ${name} ids: ${duplicates.join(', ')}`)
  }

  for (const category of categories) {
    if (!category.label || !category.description) error(`Category ${category.id} needs a user-facing label and description.`)
    if (!activities.some((activity) => activity.categoryId === category.id)) error(`Category ${category.id} has no reachable activities.`)
  }

  if (categoryIds.has('emotional_arousal')) error('The pure emotion category emotional_arousal must not remain.')
  if (categoryIds.has('fantasy_transform')) error('The fantasy-only transformation category fantasy_transform must not remain.')

  for (const activity of activities) {
    if (!categoryIds.has(activity.categoryId)) error(`Activity ${activity.id} references unknown category ${activity.categoryId}.`)
    if (!VALID_PRIORITIES.has(activity.priority)) error(`Activity ${activity.id} has invalid priority ${activity.priority}.`)
    if (!activity.label || activity.label.length < 4) error(`Activity ${activity.id} needs understandable user-facing wording.`)
    if (!activity.description || activity.description.length < 20) error(`Activity ${activity.id} needs a useful real-world description.`)
    if (AMBIGUOUS_BARE_LABELS.has(activity.label)) error(`Activity ${activity.id} uses an ambiguous bare label: ${activity.label}.`)
    if (/\bfantasy\b/i.test(activity.label) || /\bfantasy\b/i.test(activity.description)) error(`Activity ${activity.id} still uses fantasy-only wording.`)
    if (/^feeling\b/i.test(activity.label) || /^emotion\b/i.test(activity.id) || activity.tags?.includes('emotion')) error(`Activity ${activity.id} appears to be a pure emotion item.`)
    if (/^interest in\b/i.test(activity.label)) error(`Activity ${activity.id} is phrased as abstract interest instead of a real-world activity.`)
    if (activity.complementId) {
      if (!activityIds.has(activity.complementId)) error(`Activity ${activity.id} references unknown complement ${activity.complementId}.`)
      const complement = activityById.get(activity.complementId)
      if (complement && complement.complementId !== activity.id) error(`Complement relationship is not reciprocal: ${activity.id} -> ${activity.complementId}.`)
    }
    if (activity.detailProfileId && !detailProfileIds.has(activity.detailProfileId)) {
      error(`Activity ${activity.id} references unknown detail profile ${activity.detailProfileId}.`)
    }
    for (const riskDomainId of activity.riskDomains || []) {
      if (!riskDomainIds.has(riskDomainId)) error(`Activity ${activity.id} references unknown risk domain ${riskDomainId}.`)
    }
  }

  for (const profile of detailProfiles) {
    const fieldIds = new Set()
    for (const field of profile.fields || []) {
      if (!field.id || !field.label || !field.type) error(`Detail profile ${profile.id} contains an incomplete field.`)
      if (fieldIds.has(field.id)) error(`Detail profile ${profile.id} has duplicate field id ${field.id}.`)
      fieldIds.add(field.id)
    }
  }

  walk(detailProfiles, (value, path) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return
    for (const [key, child] of Object.entries(value)) {
      if (key === 'appliesToConceptIds' || key === 'excludeForConceptIds') error(`${path}.${key} still uses legacy concept references.`)
      if ((key === 'appliesToActivityIds' || key === 'excludeForActivityIds') && Array.isArray(child)) {
        for (const activityId of child) if (!activityIds.has(activityId)) error(`${path}.${key} references unknown activity ${activityId}.`)
      }
      if (key === 'relevance' && child === 'fantasy') error(`${path} still contains a fantasy-only detail field.`)
    }
  })

  const serialized = JSON.stringify(catalog)
  if (/\bfantasy\b/i.test(serialized)) error('Activity Explorer catalog still contains fantasy-only identifiers or copy.')
  if (/depthConceptIds|categoryGate|category_gate/.test(serialized)) error('Legacy category-gate/depth-mode data must not appear in Activity Explorer.')
  if (/Test 1|Test 2|first test|second test/i.test(serialized)) error('Retired test terminology appears in Activity Explorer.')

  if (fantasyProfile) {
    for (const suggestion of fantasyProfile.suggestionRules || []) {
      for (const categoryId of suggestion.activityCategoryIds || []) {
        if (!categoryIds.has(categoryId)) error(`Fantasy Profile suggestion ${suggestion.id} targets missing Activity Explorer category ${categoryId}.`)
      }
    }
  }

  return errors
}

function runCli() {
  const catalog = JSON.parse(readFileSync(new URL('../src/data/activityCatalog.json', import.meta.url), 'utf8'))
  const fantasyProfile = JSON.parse(readFileSync(new URL('../src/data/fantasyProfile.json', import.meta.url), 'utf8'))
  const errors = validateActivityCatalog(catalog, fantasyProfile)
  if (errors.length) {
    console.error(`Activity Explorer catalog validation failed with ${errors.length} error(s):`)
    for (const row of errors) console.error(`- ${row}`)
    process.exitCode = 1
    return
  }
  console.log(`Activity Explorer catalog validation passed: ${catalog.activities.length} activities, ${catalog.categories.length} categories, ${catalog.detailProfiles.length} detail profiles.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(fileURLToPath(pathToFileURL(process.argv[1]))).href) runCli()
