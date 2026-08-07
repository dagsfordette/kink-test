import { primaryCategoryId } from './taxonomy.js'
import { negotiationPreferenceSummary } from './negotiation.js'

export const preferenceScore = {
  love_it: 2,
  like_it: 1,
  neutral: 0,
  dislike_it: -1,
  hate_it: -2,
}

export const realWorldDesireScore = {
  strongly_want: 2,
  want: 1,
  unsure: 0,
  prefer_not: -1,
  do_not_want: -2,
}

export const perspectiveLabels = {
  give: 'Giving',
  receive: 'Receiving',
  mutual: 'Mutual',
  self: 'Self',
  observe: 'Watching',
  be_observed: 'Being watched',
  shared: 'Shared',
  overall: 'Overall',
  as_dominant: 'As dominant',
  as_submissive: 'As submissive',
  as_switch: 'As switch',
  as_owner: 'As owner',
  as_owned: 'As owned',
  feel_self: 'Feeling it',
  evoke_partner: 'Seeing / evoking it',
}

export function semanticDefinition(catalog, concept) {
  const semanticType = concept?.semanticType || 'activity'
  return {
    id: semanticType,
    ...(catalog?.semanticTypes?.[semanticType] || catalog?.semanticTypes?.activity || {}),
  }
}

export function semanticUi(catalog, concept) {
  const semantic = semanticDefinition(catalog, concept)
  return { ...(semantic.defaultUi || {}), ...(concept?.ui || {}) }
}

export function semanticFollowupPolicy(catalog, concept) {
  return semanticDefinition(catalog, concept).followupPolicy || {}
}

export function semanticDirectQuestioning(catalog, concept) {
  return semanticDefinition(catalog, concept).directQuestioning !== false
}

export function questionDimensions(catalog, concept) {
  const semantic = semanticDefinition(catalog, concept)
  const defaults = semantic.questionDimensions || {}
  const overrides = concept?.questionModel?.overrides || {}
  return { ...defaults, ...overrides }
}

export const willingnessLabels = {
  actively_want: 'Actively want',
  interested_in_trying: 'Interested in trying',
  open_to_it: 'Open to it',
  unsure: 'Unsure',
  fantasy_only: 'Fantasy only',
  not_interested: 'Not interested',
  hard_limit: 'Hard limit',
  // Legacy values remain readable; result aggregation normalizes them without rewriting saved data.
  unknown: 'Not sure',
  curious: 'Curious',
  want_to_try: 'Want to try',
  would_try: 'Would try',
  would_do: 'Would do / do again',
  would_not_try: 'Would not try',
}

const LEGACY_WILLINGNESS_RESULT_MAP = {
  unknown: 'unsure',
  curious: 'open_to_it',
  want_to_try: 'interested_in_trying',
  would_try: 'open_to_it',
  would_do: 'actively_want',
  would_not_try: 'not_interested',
}

export function normalizeWillingnessForResults(value) {
  return LEGACY_WILLINGNESS_RESULT_MAP[value] || value || null
}

export function willingnessLabel(value, tried, semanticType = 'activity') {
  if (['actively_want', 'interested_in_trying', 'open_to_it', 'unsure', 'fantasy_only', 'not_interested', 'hard_limit'].includes(value)) {
    return willingnessLabels[value]
  }
  if (semanticType === 'dynamic' || semanticType === 'relationship_dynamic') {
    if (value === 'want_to_try') return 'Want to explore'
    if (value === 'would_try') return 'Would explore'
    if (value === 'would_do') return tried ? 'Would want again' : 'Would want'
    if (value === 'would_not_try') return tried ? 'Would not want again' : 'Would not want'
  }
  if (['stimulus', 'body_part', 'material'].includes(semanticType)) {
    if (value === 'want_to_try') return 'Want to explore'
    if (value === 'would_try') return 'Would seek out'
    if (value === 'would_do') return tried ? 'Would seek out again' : 'Would seek out'
    if (value === 'would_not_try') return 'Would not seek out'
  }
  if (semanticType === 'setting') {
    if (value === 'would_try') return 'Would choose'
    if (value === 'would_do') return tried ? 'Would choose again' : 'Would choose'
    if (value === 'would_not_try') return tried ? 'Would not choose again' : 'Would not choose'
  }
  if (value === 'would_do') return tried ? 'Would do again' : 'Would do'
  if (value === 'would_not_try') return tried ? 'Would not do again' : 'Would not try'
  return willingnessLabels[value] || value?.replaceAll('_', ' ') || ''
}

export const boundaryLabels = {
  none: 'No special boundary',
  conditional: 'Conditional / depends on context',
  soft_limit: 'Soft limit',
  hard_limit: 'Hard limit',
}

export const resultInterestLabels = {
  strong_interest: 'Strong interest',
  moderate_interest: 'Moderate interest',
  mixed: 'Mixed / neutral',
  mostly_not_interested: 'Mostly not interested',
  strong_disinterest: 'Strong disinterest',
  insufficient_data: 'Insufficient data',
}

export function answerKey(conceptId, perspective) {
  return `${conceptId}::${perspective}`
}

export function hasDetailData(answer) {
  return Boolean(answer?.details && Object.keys(answer.details).length)
}

export function isAnswered(answer) {
  if (!answer) return false
  return Boolean(
    answer.experience?.tried !== undefined ||
    answer.preference?.fantasy ||
    answer.preference?.realWorld ||
    answer.preference?.experienced ||
    answer.willingness ||
    answer.boundary ||
    answer.note?.text ||
    hasDetailData(answer) ||
    Object.keys(answer.specifiers || {}).length,
  )
}

const POSITIVE_WILLINGNESS = new Set([
  'actively_want', 'interested_in_trying', 'open_to_it', 'unsure', 'fantasy_only',
  'curious', 'want_to_try', 'would_try', 'would_do',
])

export function shouldExpandDetails(answer) {
  if (!answer || answer.boundary === 'hard_limit' || answer.willingness === 'hard_limit') return false
  if (['love_it', 'like_it'].includes(answer.preference?.fantasy)) return true
  if (['love_it', 'like_it'].includes(answer.preference?.experienced)) return true
  if (['strongly_want', 'want'].includes(answer.preference?.realWorld)) return true
  return POSITIVE_WILLINGNESS.has(answer.willingness)
}

export function isInterested(answer) {
  return shouldExpandDetails(answer)
}

export function shouldCollapse(answer) {
  if (!answer) return false
  if (answer.boundary === 'hard_limit' || answer.willingness === 'hard_limit') return true
  if (answer.willingness === 'not_interested') return true
  const fantasy = answer.preference?.fantasy
  const experienced = answer.preference?.experienced
  const realWorld = answer.preference?.realWorld
  const negative = ['dislike_it', 'hate_it'].includes(experienced || fantasy)
  const realWorldNegative = ['prefer_not', 'do_not_want'].includes(realWorld)
  return (negative || realWorldNegative) && ['would_not_try', 'not_interested', undefined].includes(answer.willingness)
}

function legacyBestPreference(answer) {
  if (!answer) return null
  const experienced = answer.preference?.experienced
  if (experienced && preferenceScore[experienced] !== undefined) return experienced
  return answer.preference?.fantasy || null
}

function average(values) {
  const numeric = values.filter((value) => Number.isFinite(value))
  if (!numeric.length) return null
  return numeric.reduce((sum, value) => sum + value, 0) / numeric.length
}

function resultLabel(averageScore, count) {
  if (!count || averageScore === null) return resultInterestLabels.insufficient_data
  if (averageScore >= 1.5) return resultInterestLabels.strong_interest
  if (averageScore >= 0.5) return resultInterestLabels.moderate_interest
  if (averageScore > -0.5) return resultInterestLabels.mixed
  if (averageScore > -1.5) return resultInterestLabels.mostly_not_interested
  return resultInterestLabels.strong_disinterest
}

function summarizeScores(values) {
  const numeric = values.filter((value) => Number.isFinite(value))
  const avg = average(numeric)
  return {
    answeredConcepts: numeric.length,
    average: avg,
    // Compatibility/visual position only: linear transform of -2..2 to 0..100.
    // It is not shown as a psychometric percentage in the Plan 06 UI.
    index: avg === null ? null : Math.round(((avg + 2) / 4) * 100),
    label: resultLabel(avg, numeric.length),
  }
}

function profileForRecord(catalog, concept, perspective) {
  const profileId = concept.detailProfileByPerspective?.[perspective] || concept.detailProfileId
  return (catalog.detailProfiles || []).find((profile) => profile.id === profileId) || null
}

function optionLabel(field, optionId) {
  return field?.options?.find((option) => option.id === optionId)?.label || optionId.replaceAll('_', ' ')
}

function detailBoundaryEntries(catalog, concept, perspective, answer) {
  const details = answer?.details || {}
  const profile = profileForRecord(catalog, concept, perspective)
  if (!profile) return { conditional: [], hardLimits: [] }
  const conditional = []
  const hardLimits = []
  for (const field of profile.fields || []) {
    if (field.type !== 'preference_matrix') continue
    const values = details[field.id]
    if (!values || Array.isArray(values) || typeof values !== 'object') continue
    for (const [optionId, state] of Object.entries(values)) {
      if (!['conditional', 'hard_limit'].includes(state)) continue
      const entry = {
        fieldId: field.id,
        fieldLabel: field.label || field.id.replaceAll('_', ' '),
        optionId,
        optionLabel: optionLabel(field, optionId),
        state,
      }
      if (state === 'conditional') conditional.push(entry)
      else hardLimits.push(entry)
    }
  }
  return { conditional, hardLimits }
}

function interestScores(answer) {
  const fantasy = answer?.preference?.fantasy
  const realWorld = answer?.preference?.realWorld
  const experienced = answer?.preference?.experienced
  return {
    fantasy: fantasy && preferenceScore[fantasy] !== undefined ? preferenceScore[fantasy] : null,
    realWorld: realWorld && realWorldDesireScore[realWorld] !== undefined ? realWorldDesireScore[realWorld] : null,
    experienced: experienced && preferenceScore[experienced] !== undefined ? preferenceScore[experienced] : null,
  }
}

function conceptAggregate(concept, rows) {
  const resultRows = rows.filter((row) => row.perspective !== 'overall')
  const dimension = (id) => summarizeScores(resultRows.map((row) => row.dimensionScores[id]))
  const triedRows = resultRows.filter((row) => row.answer.experience?.tried !== undefined)
  const triedCount = triedRows.filter((row) => row.answer.experience?.tried === true).length
  return {
    conceptId: concept.id,
    concept,
    categoryId: primaryCategoryId(concept),
    semanticType: concept.semanticType || 'activity',
    rows: resultRows,
    answeredPerspectives: resultRows.length,
    fantasy: dimension('fantasy'),
    realWorld: dimension('realWorld'),
    experiencedPreference: dimension('experienced'),
    experience: {
      answeredPerspectives: triedRows.length,
      triedPerspectives: triedCount,
      tried: triedCount > 0,
    },
  }
}

function categoryAggregate(catalog, category, conceptResults) {
  const concepts = conceptResults.filter((row) => row.categoryId === category.id)
  const dimension = (id) => summarizeScores(concepts.map((row) => row[id]?.average))
  const experienceAnswered = concepts.filter((row) => row.experience.answeredPerspectives > 0)
  const triedConcepts = experienceAnswered.filter((row) => row.experience.tried).length
  return {
    id: category.id,
    label: category.label,
    domainId: category.domainId || category.domain || null,
    conceptsAnswered: concepts.length,
    answered: concepts.filter((row) => row.fantasy.answeredConcepts || row.realWorld.answeredConcepts || row.experiencedPreference.answeredConcepts).length,
    fantasy: dimension('fantasy'),
    realWorld: dimension('realWorld'),
    experiencedPreference: dimension('experiencedPreference'),
    experience: { answeredConcepts: experienceAnswered.length, triedConcepts },
  }
}

function semanticAggregate(catalog, id, definition, conceptResults) {
  const concepts = conceptResults.filter((row) => row.semanticType === id)
  const dimension = (dimensionId) => summarizeScores(concepts.map((row) => row[dimensionId]?.average))
  return {
    id,
    label: definition.label || id,
    conceptsAnswered: concepts.length,
    answered: concepts.filter((row) => row.fantasy.answeredConcepts || row.realWorld.answeredConcepts).length,
    fantasy: dimension('fantasy'),
    realWorld: dimension('realWorld'),
  }
}

function domainAggregate(domain, categoryStats) {
  const categories = categoryStats.filter((row) => row.domainId === domain.id)
  const dimension = (dimensionId) => summarizeScores(categories
    .flatMap((category) => category[dimensionId]?.answeredConcepts ? [category[dimensionId].average] : []))
  return {
    id: domain.id,
    label: domain.label,
    categoriesAnswered: categories.filter((row) => row.conceptsAnswered > 0).length,
    fantasy: dimension('fantasy'),
    realWorld: dimension('realWorld'),
  }
}

const WILLINGNESS_RANK = {
  hard_limit: -3,
  not_interested: -2,
  fantasy_only: -1,
  unsure: 0,
  open_to_it: 1,
  interested_in_trying: 2,
  actively_want: 3,
}

function asymmetries(conceptResults) {
  const rows = []
  for (const conceptResult of conceptResults) {
    if (conceptResult.rows.length < 2) continue
    for (const dimension of ['fantasy', 'realWorld']) {
      const scored = conceptResult.rows.filter((row) => Number.isFinite(row.dimensionScores[dimension]))
      if (scored.length < 2) continue
      const sorted = [...scored].sort((a, b) => b.dimensionScores[dimension] - a.dimensionScores[dimension])
      const delta = sorted[0].dimensionScores[dimension] - sorted.at(-1).dimensionScores[dimension]
      if (delta >= 2) rows.push({ concept: conceptResult.concept, conceptId: conceptResult.conceptId, dimension, delta, high: sorted[0], low: sorted.at(-1) })
    }
    const willingnessRows = conceptResult.rows.filter((row) => row.willingnessState && WILLINGNESS_RANK[row.willingnessState] !== undefined)
    if (willingnessRows.length >= 2) {
      const sorted = [...willingnessRows].sort((a, b) => WILLINGNESS_RANK[b.willingnessState] - WILLINGNESS_RANK[a.willingnessState])
      const delta = WILLINGNESS_RANK[sorted[0].willingnessState] - WILLINGNESS_RANK[sorted.at(-1).willingnessState]
      if (delta >= 2) rows.push({ concept: conceptResult.concept, conceptId: conceptResult.conceptId, dimension: 'willingness', delta, high: sorted[0], low: sorted.at(-1) })
    }
  }
  return rows.sort((a, b) => b.delta - a.delta || a.concept.label.localeCompare(b.concept.label))
}

function commonConditionalDetails(records) {
  const counts = new Map()
  for (const row of records) {
    for (const entry of row.detailBoundaries.conditional) {
      const key = `${entry.fieldLabel}::${entry.optionLabel}`
      const current = counts.get(key) || { ...entry, count: 0, examples: [] }
      current.count += 1
      if (current.examples.length < 3) current.examples.push({ concept: row.concept.label, perspective: row.perspective })
      counts.set(key, current)
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.optionLabel.localeCompare(b.optionLabel))
}

export function buildResults(catalog, answers = {}, categoryGates = {}, negotiationPreferences = {}) {
  const conceptMap = Object.fromEntries(catalog.concepts.map((concept) => [concept.id, concept]))
  const categoryMap = Object.fromEntries(catalog.categories.map((category) => [category.id, category]))
  const records = []

  for (const [key, answer] of Object.entries(answers || {})) {
    if (!isAnswered(answer)) continue
    const splitAt = key.lastIndexOf('::')
    if (splitAt < 0) continue
    const conceptId = key.slice(0, splitAt)
    const perspective = key.slice(splitAt + 2)
    const concept = conceptMap[conceptId]
    if (!concept) continue

    const preference = legacyBestPreference(answer)
    const dimensionScores = interestScores(answer)
    const detailBoundaries = detailBoundaryEntries(catalog, concept, perspective, answer)
    records.push({
      key,
      concept,
      perspective,
      answer,
      preference,
      // Compatibility field for older callers; Plan 06 aggregation does not average record.score.
      score: preference && preferenceScore[preference] !== undefined ? preferenceScore[preference] : null,
      dimensionScores,
      willingnessState: normalizeWillingnessForResults(answer.willingness),
      categoryId: primaryCategoryId(concept),
      semanticType: concept.semanticType || 'activity',
      detailBoundaries,
    })
  }

  const recordsByConcept = new Map()
  for (const row of records) {
    const group = recordsByConcept.get(row.concept.id) || []
    group.push(row)
    recordsByConcept.set(row.concept.id, group)
  }
  const conceptResults = [...recordsByConcept.entries()]
    .map(([conceptId, rows]) => conceptAggregate(conceptMap[conceptId], rows))
    .filter((row) => row.rows.length > 0)

  const allCategoryStats = catalog.categories.map((category) => categoryAggregate(catalog, category, conceptResults))
  const categoryStats = allCategoryStats.filter((row) => row.conceptsAnswered > 0)
  const semanticStats = Object.entries(catalog.semanticTypes || {})
    .map(([id, definition]) => semanticAggregate(catalog, id, definition, conceptResults))
    .filter((row) => row.conceptsAnswered > 0)
  const domainStats = (catalog.domains || []).map((domain) => domainAggregate(domain, allCategoryStats))

  const conceptHardLimits = records.filter((row) => row.answer.boundary === 'hard_limit' || row.willingnessState === 'hard_limit')
  const hardLimitKeys = new Set(conceptHardLimits.map((row) => row.key))
  const conditionalInterests = records.filter((row) =>
    ['conditional', 'soft_limit'].includes(row.answer.boundary) || row.detailBoundaries.conditional.length > 0)
  const detailHardLimits = records.flatMap((row) => row.detailBoundaries.hardLimits.map((entry) => ({ ...entry, key: `${row.key}::${entry.fieldId}::${entry.optionId}`, record: row, concept: row.concept, perspective: row.perspective })))

  const strongInterests = records
    .filter((row) => !hardLimitKeys.has(row.key) && Math.max(row.dimensionScores.fantasy ?? -Infinity, row.dimensionScores.realWorld ?? -Infinity) >= 1.5)
    .sort((a, b) => Math.max(b.dimensionScores.realWorld ?? -Infinity, b.dimensionScores.fantasy ?? -Infinity) - Math.max(a.dimensionScores.realWorld ?? -Infinity, a.dimensionScores.fantasy ?? -Infinity))
  const moderateInterests = records
    .filter((row) => !hardLimitKeys.has(row.key) && !strongInterests.includes(row) && Math.max(row.dimensionScores.fantasy ?? -Infinity, row.dimensionScores.realWorld ?? -Infinity) >= 0.5)
  const curiosities = records.filter((row) => ['interested_in_trying', 'open_to_it', 'unsure'].includes(row.willingnessState) && !hardLimitKeys.has(row.key))
  const fantasyOnlyInterests = records.filter((row) => row.willingnessState === 'fantasy_only' && !hardLimitKeys.has(row.key))
  const notInterested = records.filter((row) => row.willingnessState === 'not_interested' && !hardLimitKeys.has(row.key))
  const notes = records.filter((row) => row.answer.note?.text?.trim())
  const detailed = records.filter((row) => hasDetailData(row.answer))

  const categoryHardLimits = catalog.categories
    .filter((category) => categoryGates?.[category.id]?.state === 'hard_limit')
    .map((category) => ({ categoryId: category.id, label: category.label, state: 'hard_limit' }))

  const insufficientData = allCategoryStats
    .filter((row) => row.answered < 2 && !categoryHardLimits.some((limit) => limit.categoryId === row.id))
    .map((row) => ({
      ...row,
      gateState: categoryGates?.[row.id]?.state || null,
      reason: row.answered === 0 ? 'No scored concept interests yet' : 'Only one scored concept interest',
    }))

  const emotionalSelf = records
    .filter((row) => row.categoryId === 'emotional_arousal' && row.perspective === 'feel_self' && (row.dimensionScores.fantasy ?? -Infinity) > 0)
    .sort((a, b) => (b.dimensionScores.fantasy ?? -Infinity) - (a.dimensionScores.fantasy ?? -Infinity))
  const emotionalPartner = records
    .filter((row) => row.categoryId === 'emotional_arousal' && row.perspective === 'evoke_partner' && (row.dimensionScores.fantasy ?? -Infinity) > 0)
    .sort((a, b) => (b.dimensionScores.fantasy ?? -Infinity) - (a.dimensionScores.fantasy ?? -Infinity))

  return {
    aggregationVersion: catalog.resultsModel?.version || '2.0.0',
    records,
    conceptResults,
    categoryStats,
    semanticStats,
    domainStats,
    perspectiveStats: Object.entries(perspectiveLabels).map(([perspective, label]) => {
      const rows = records.filter((row) => row.perspective === perspective)
      return {
        perspective,
        label,
        records: rows.length,
        fantasy: summarizeScores(rows.map((row) => row.dimensionScores.fantasy)),
        realWorld: summarizeScores(rows.map((row) => row.dimensionScores.realWorld)),
      }
    }).filter((row) => row.records > 0),
    strongInterests,
    moderateInterests,
    topInterests: [...strongInterests, ...moderateInterests].slice(0, 24),
    curiosities,
    wantToTry: curiosities,
    fantasyOnlyInterests,
    asymmetries: asymmetries(conceptResults),
    conditionalInterests,
    hardLimits: conceptHardLimits,
    detailHardLimits,
    categoryHardLimits,
    softLimits: conditionalInterests,
    notInterested,
    commonConditions: commonConditionalDetails(records),
    insufficientData,
    notes,
    detailed,
    emotionalSelf,
    emotionalPartner,
    negotiationPreferences: negotiationPreferenceSummary(catalog, negotiationPreferences),
    categoryMap,
    counts: {
      answerRecords: records.length,
      conceptsAnswered: conceptResults.length,
      conceptsTried: conceptResults.filter((row) => row.experience.tried).length,
      conceptHardLimits: conceptHardLimits.length,
      detailHardLimits: detailHardLimits.length,
      categoryHardLimits: categoryHardLimits.length,
      fantasyOnly: fantasyOnlyInterests.length,
      conditional: conditionalInterests.length,
    },
  }
}
