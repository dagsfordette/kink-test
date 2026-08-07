import { migrateLegacyCategoryGates, normalizeDepthMode } from './depthModes.js'
import { normalizeNegotiationPreferences } from './negotiation.js'

export const RESPONSE_FORMAT = 'adult-kink-inventory-response'
export const RESPONSE_SCHEMA_VERSION = '1.8.0'

export function migrateAnswers(rawAnswers = {}) {
  const answers = { ...rawAnswers }
  const moves = [
    ['oral_giving::give', 'oral_sex::give'],
    ['oral_receiving::receive', 'oral_sex::receive'],
  ]
  for (const [from, to] of moves) {
    if (answers[from] && !answers[to]) answers[to] = answers[from]
    delete answers[from]
  }
  return answers
}

export function createResponsePayload(catalog, { settings = {}, answers = {}, categoryGates = {}, negotiationPreferences = {}, exportedAt = new Date().toISOString() } = {}) {
  return {
    format: RESPONSE_FORMAT,
    schemaVersion: RESPONSE_SCHEMA_VERSION,
    questionnaireId: catalog.questionnaire.id,
    questionnaireVersion: catalog.questionnaire.version,
    exportedAt,
    settings: { mode: normalizeDepthMode(settings.mode) },
    answers,
    categoryGates,
    negotiationPreferences,
  }
}

export function normalizeResponsePayload(catalog, data, { allowMissingFormat = true } = {}) {
  if (!data || typeof data !== 'object') throw new Error('This JSON does not look like an inventory export.')
  if (data.questionnaireId !== catalog.questionnaire.id) throw new Error('This JSON belongs to a different questionnaire.')
  if (!allowMissingFormat && data.format !== RESPONSE_FORMAT) throw new Error('Unsupported inventory response format.')
  if (typeof data.answers !== 'object' || !data.answers || Array.isArray(data.answers)) throw new Error('This JSON does not contain a valid answer map.')

  const migratedAnswers = migrateAnswers(data.answers)
  const migrated = migrateLegacyCategoryGates(catalog, migratedAnswers, data.categoryGates || {})
  return {
    sourceSchemaVersion: data.schemaVersion || 'legacy/unversioned',
    sourceQuestionnaireVersion: data.questionnaireVersion || null,
    settings: { mode: normalizeDepthMode(data.settings?.mode || 'standard') },
    answers: migrated.answers,
    categoryGates: migrated.categoryGates,
    negotiationPreferences: normalizeNegotiationPreferences(catalog, data.negotiationPreferences || {}),
  }
}
