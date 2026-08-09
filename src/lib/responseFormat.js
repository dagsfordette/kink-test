import { normalizeCategoryGates, normalizeDepthMode } from './depthModes.js'
import { normalizeNegotiationPreferences } from './negotiation.js'
import { normalizePowerExchangePreferences } from './powerExchange.js'

export const RESPONSE_FORMAT = 'adult-kink-exploration-response'

export function createResponsePayload(catalog, { settings = {}, answers = {}, categoryGates = {}, negotiationPreferences = {}, powerExchangePreferences = {}, exportedAt = new Date().toISOString() } = {}) {
  return {
    format: RESPONSE_FORMAT,
    questionnaireId: catalog.questionnaire.id,
    questionnaireVersion: catalog.questionnaire.version,
    exportedAt,
    settings: { mode: normalizeDepthMode(settings.mode) },
    answers,
    categoryGates: normalizeCategoryGates(catalog, categoryGates),
    negotiationPreferences: normalizeNegotiationPreferences(catalog, negotiationPreferences),
    powerExchangePreferences: normalizePowerExchangePreferences(catalog, powerExchangePreferences),
  }
}

export function parseResponsePayload(catalog, data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('This JSON does not look like an exploration export.')
  if (data.format !== RESPONSE_FORMAT) throw new Error('Unsupported exploration response format.')
  if (data.questionnaireId !== catalog.questionnaire.id) throw new Error('This JSON belongs to a different questionnaire.')
  if (data.questionnaireVersion !== catalog.questionnaire.version) throw new Error('This JSON was created by a different questionnaire version.')
  if (!data.answers || typeof data.answers !== 'object' || Array.isArray(data.answers)) throw new Error('This JSON does not contain a valid answer map.')

  const conceptMap = new Map((catalog.concepts || []).map((concept) => [concept.id, concept]))
  for (const [key, answer] of Object.entries(data.answers)) {
    const splitAt = key.lastIndexOf('::')
    const conceptId = splitAt > 0 ? key.slice(0, splitAt) : ''
    const perspective = splitAt > 0 ? key.slice(splitAt + 2) : ''
    const concept = conceptMap.get(conceptId)
    if (!concept || !(concept.perspectives || ['mutual']).includes(perspective)) throw new Error(`Unsupported answer key: ${key}`)
    if (!answer || typeof answer !== 'object' || Array.isArray(answer)) throw new Error(`Invalid answer record: ${key}`)
  }

  return {
    settings: { mode: normalizeDepthMode(data.settings?.mode) },
    answers: { ...data.answers },
    categoryGates: normalizeCategoryGates(catalog, data.categoryGates),
    negotiationPreferences: normalizeNegotiationPreferences(catalog, data.negotiationPreferences),
    powerExchangePreferences: normalizePowerExchangePreferences(catalog, data.powerExchangePreferences),
  }
}
