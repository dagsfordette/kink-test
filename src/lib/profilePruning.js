import { negotiationFieldValue } from './negotiation.js'

const SELF_SECTION = 'personal_profile'
const ATTRACTION_SECTION = 'attraction_profile'

// Keep this deliberately conservative. These are concepts where the named anatomy is
// part of the concept itself, not merely one possible detail or implementation.
const ANATOMY_REQUIREMENTS = {
  vaginal_penetration: ['vagina'],
  fisting_vaginal: ['vagina'],
  prostate_focused_play: ['prostate'],
  prostate_toys: ['prostate'],
  masturbation_sleeves: ['penis'],
  breasts_fetish: ['breasts'],
}

const SELF_PERSPECTIVES = new Set(['receive', 'self'])
const PARTNER_PERSPECTIVES = new Set(['give', 'observe'])
const SELF_OPEN_ENDED = new Set(['prefer_not_say', 'other_reconstructed_varies'])
const PARTNER_OPEN_ENDED = new Set(['depends_person'])

function selected(preferences, sectionId, fieldId) {
  const value = negotiationFieldValue(preferences, sectionId, fieldId)
  return Array.isArray(value) ? value : []
}

function isRestrictiveSelection(values, openEnded) {
  return values.length > 0 && !values.some((value) => openEnded.has(value))
}

function matchesRequiredAnatomy(values, required) {
  return required.some((id) => values.includes(id))
}

export function profileHasPruningData(preferences = {}) {
  const selfAnatomy = selected(preferences, SELF_SECTION, 'self_anatomy')
  const partnerAnatomy = selected(preferences, ATTRACTION_SECTION, 'partner_anatomy')
  return isRestrictiveSelection(selfAnatomy, SELF_OPEN_ENDED) || isRestrictiveSelection(partnerAnatomy, PARTNER_OPEN_ENDED)
}

export function anatomyRequirementForConcept(concept) {
  return ANATOMY_REQUIREMENTS[concept?.id] || ANATOMY_REQUIREMENTS[concept?.canonicalId] || null
}

export function perspectiveMatchesProfile(concept, perspective, preferences = {}) {
  const required = anatomyRequirementForConcept(concept)
  if (!required) return true

  if (SELF_PERSPECTIVES.has(perspective)) {
    const selfAnatomy = selected(preferences, SELF_SECTION, 'self_anatomy')
    if (!isRestrictiveSelection(selfAnatomy, SELF_OPEN_ENDED)) return true
    return matchesRequiredAnatomy(selfAnatomy, required)
  }

  if (PARTNER_PERSPECTIVES.has(perspective)) {
    const partnerAnatomy = selected(preferences, ATTRACTION_SECTION, 'partner_anatomy')
    if (!isRestrictiveSelection(partnerAnatomy, PARTNER_OPEN_ENDED)) return true
    return matchesRequiredAnatomy(partnerAnatomy, required)
  }

  return true
}

export function applicablePerspectives(concept, preferences = {}) {
  return (concept?.perspectives || ['mutual']).filter((perspective) => perspectiveMatchesProfile(concept, perspective, preferences))
}

export function profilePruningSummary(concepts = [], preferences = {}) {
  let hiddenPerspectives = 0
  let hiddenConcepts = 0
  for (const concept of concepts) {
    const perspectives = concept?.perspectives || ['mutual']
    const applicable = applicablePerspectives(concept, preferences)
    hiddenPerspectives += Math.max(0, perspectives.length - applicable.length)
    if (applicable.length === 0 && perspectives.length > 0) hiddenConcepts += 1
  }
  return { hiddenPerspectives, hiddenConcepts }
}
