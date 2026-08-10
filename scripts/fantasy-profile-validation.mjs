import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const EXPECTED_RESPONSE_STATES = [
  'strong_turn_on', 'turn_on', 'intriguing', 'neutral', 'turn_off', 'strong_turn_off', 'unsure',
]

export const EXPECTED_DIMENSIONS = [
  'surrender', 'authority_responsibility', 'helplessness_vulnerability', 'trust_safety',
  'anticipation_denial', 'fear_adrenaline', 'pain_intensity', 'humiliation_embarrassment',
  'praise_approval', 'being_desired_attention', 'possession_belonging', 'tenderness_care',
  'control_permission', 'rules_ritual_protocol', 'service_usefulness', 'restraint_confinement',
  'objectification_use', 'exposure_being_seen', 'watching_observation', 'sensory_focus_alteration',
  'roleplay_transformation', 'primal_struggle_competition', 'taboo_transgression',
  'novelty_experimentation', 'group_social_multipartner', 'fetish_focus',
]

const VALID_PERSPECTIVES = new Set(['receive', 'give', 'experience_self', 'evoke_partner', 'mutual', 'observe', 'be_observed', 'none'])
const VALID_STAGES = new Set(['core', 'discriminator', 'deep_dive'])
const VALID_INTENSITIES = new Set(['ordinary', 'strong', 'intense'])
const QUESTION_LABEL_LEAKS = /\b(power exchange|bondage|submissive|dominant|humiliation|degradation|fetish|chastity|primal|orgasm control|protocol)\b/i

function duplicates(rows = []) {
  const seen = new Set()
  const found = new Set()
  for (const row of rows) {
    if (!row?.id) continue
    if (seen.has(row.id)) found.add(row.id)
    seen.add(row.id)
  }
  return [...found]
}

export function validateFantasyProfile(profile, catalog) {
  const errors = []
  const error = (message) => errors.push(message)
  const dimensions = profile?.dimensions || []
  const questions = profile?.questions || []
  const suggestions = profile?.suggestionRules || []
  const dimensionIds = new Set(dimensions.map((row) => row.id))
  const suggestionIds = new Set(suggestions.map((row) => row.id))
  const categoryIds = new Set((catalog?.categories || []).map((row) => row.id))

  const responseStates = (profile?.responseScale || []).map((row) => row.id)
  if (JSON.stringify(responseStates) !== JSON.stringify(EXPECTED_RESPONSE_STATES)) {
    error('Fantasy Profile response scale must contain exactly the required semantic states in order.')
  }
  const unsure = (profile?.responseScale || []).find((row) => row.id === 'unsure')
  if (!unsure || unsure.score !== null) error('unsure must have a null score and contribute no evidence.')

  const actualDimensions = [...dimensionIds].sort()
  const expectedDimensions = [...EXPECTED_DIMENSIONS].sort()
  if (dimensions.length !== 26 || JSON.stringify(actualDimensions) !== JSON.stringify(expectedDimensions)) {
    error('Fantasy Profile must contain exactly the required 26 dimensions.')
  }
  const duplicateDimensionIds = duplicates(dimensions)
  if (duplicateDimensionIds.length) error(`Duplicate dimension ids: ${duplicateDimensionIds.join(', ')}`)
  for (const dimension of dimensions) {
    for (const field of ['label', 'resultLayer', 'description', 'positiveInterpretation', 'negativeInterpretation']) {
      if (!dimension[field]) error(`Dimension ${dimension.id} is missing ${field}.`)
    }
    if (!['driver', 'motif'].includes(dimension.resultLayer)) error(`Dimension ${dimension.id} has invalid resultLayer ${dimension.resultLayer}.`)
  }

  const duplicateQuestionIds = duplicates(questions)
  if (duplicateQuestionIds.length) error(`Duplicate question ids: ${duplicateQuestionIds.join(', ')}`)
  const stageCounts = Object.fromEntries([...VALID_STAGES].map((stage) => [stage, questions.filter((q) => q.stage === stage).length]))
  if (stageCounts.core !== 52) error(`Expected exactly 52 core questions; found ${stageCounts.core}.`)
  if (stageCounts.discriminator < 52) error(`Expected at least 52 discriminator questions; found ${stageCounts.discriminator}.`)
  if (stageCounts.deep_dive < 26) error(`Expected at least 26 deep-dive questions; found ${stageCounts.deep_dive}.`)

  const coverage = new Map(EXPECTED_DIMENSIONS.map((id) => [id, { total: new Set(), core: new Set() }]))
  for (const question of questions) {
    if (!question.statement || !/[.!?]$/.test(question.statement)) error(`Question ${question.id} needs a complete statement.`)
    if (!VALID_STAGES.has(question.stage)) error(`Question ${question.id} has invalid stage ${question.stage}.`)
    if (!VALID_INTENSITIES.has(question.intensity)) error(`Question ${question.id} has invalid intensity ${question.intensity}.`)
    if (!Array.isArray(question.signals) || !question.signals.length) error(`Question ${question.id} must have at least one scoring signal.`)
    if (!question.mirrorGroup) error(`Question ${question.id} needs a mirrorGroup for spacing logic.`)
    if (QUESTION_LABEL_LEAKS.test(question.statement)) error(`Question ${question.id} exposes a kink/category label in its wording.`)
    for (const signal of question.signals || []) {
      if (!dimensionIds.has(signal.dimensionId)) error(`Question ${question.id} references invalid dimension ${signal.dimensionId}.`)
      if (!VALID_PERSPECTIVES.has(signal.perspective)) error(`Question ${question.id} uses invalid perspective ${signal.perspective}.`)
      if (!Number.isFinite(signal.weight) || signal.weight <= 0) error(`Question ${question.id} has invalid signal weight for ${signal.dimensionId}.`)
      const row = coverage.get(signal.dimensionId)
      if (row) {
        row.total.add(question.id)
        if (question.stage === 'core') row.core.add(question.id)
      }
    }
    for (const dimensionId of question.discriminates || []) {
      if (!dimensionIds.has(dimensionId)) error(`Question ${question.id} discriminates unknown dimension ${dimensionId}.`)
    }
    for (const suggestionId of question.suggestionLinks || []) {
      if (!suggestionIds.has(suggestionId)) error(`Question ${question.id} references unknown suggestion ${suggestionId}.`)
    }
  }

  for (const [dimensionId, row] of coverage) {
    if (row.core.size < 2) error(`Dimension ${dimensionId} needs at least two core observations; found ${row.core.size}.`)
    if (row.total.size < 5) error(`Dimension ${dimensionId} needs at least five total observations; found ${row.total.size}.`)
  }

  const coreQuestions = questions.filter((question) => question.stage === 'core')
  for (let i = 1; i < coreQuestions.length; i += 1) {
    if (coreQuestions[i - 1].mirrorGroup === coreQuestions[i].mirrorGroup) {
      error(`Core sequence places mirrorGroup ${coreQuestions[i].mirrorGroup} consecutively.`)
    }
  }

  const duplicateSuggestionIds = duplicates(suggestions)
  if (duplicateSuggestionIds.length) error(`Duplicate suggestion ids: ${duplicateSuggestionIds.join(', ')}`)
  for (const suggestion of suggestions) {
    if (!suggestion.label || !suggestion.summary) error(`Suggestion ${suggestion.id} needs a label and summary.`)
    if (!Array.isArray(suggestion.activityCategoryIds) || !suggestion.activityCategoryIds.length) error(`Suggestion ${suggestion.id} needs activityCategoryIds.`)
    for (const categoryId of suggestion.activityCategoryIds || []) {
      if (!categoryIds.has(categoryId)) error(`Suggestion ${suggestion.id} references unknown catalog category ${categoryId}.`)
    }
    for (const group of ['requiredEvidence', 'supportingEvidence', 'contradictingEvidence']) {
      for (const condition of suggestion[group] || []) {
        if (!dimensionIds.has(condition.dimensionId)) error(`Suggestion ${suggestion.id} ${group} references unknown dimension ${condition.dimensionId}.`)
        if (!Array.isArray(condition.bands) || !condition.bands.length) error(`Suggestion ${suggestion.id} ${group} condition for ${condition.dimensionId} needs bands.`)
      }
    }
  }

  const linkedSuggestions = new Set(questions.flatMap((question) => question.suggestionLinks || []))
  for (const suggestion of suggestions) if (!linkedSuggestions.has(suggestion.id)) error(`Suggestion ${suggestion.id} is never linked from a question.`)

  if (!profile?.resultCopy?.language?.identityWarning) error('Result copy must include identity/diagnostic caution language.')
  return errors
}

function runCli() {
  const profile = JSON.parse(readFileSync(new URL('../src/data/fantasyProfile.json', import.meta.url), 'utf8'))
  const catalog = JSON.parse(readFileSync(new URL('../src/data/activityCatalog.json', import.meta.url), 'utf8'))
  const errors = validateFantasyProfile(profile, catalog)
  if (errors.length) {
    console.error(`Fantasy Profile validation failed with ${errors.length} error(s):`)
    for (const row of errors) console.error(`- ${row}`)
    process.exitCode = 1
    return
  }
  const counts = Object.groupBy
    ? Object.groupBy(profile.questions, (question) => question.stage)
    : null
  console.log(`Fantasy Profile validation passed: ${profile.dimensions.length} dimensions, ${profile.questions.length} questions, ${profile.suggestionRules.length} suggestion rules.`)
  if (counts) console.log(Object.fromEntries(Object.entries(counts).map(([key, rows]) => [key, rows.length])))
}

if (process.argv[1] && import.meta.url === pathToFileURL(fileURLToPath(pathToFileURL(process.argv[1]))).href) runCli()
