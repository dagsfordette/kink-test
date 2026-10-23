// Scores use the fantasy scale (-2 to 2); these are exploration preferences, not boundaries.
const CATEGORY_THEMES = {
  power_exchange: ['control_permission', 'Making decisions and setting rules for my partner', 'Following my partner’s decisions and rules'],
  service_protocol: ['service_usefulness', 'Providing service for my partner', 'Having my partner provide service for me'],
  bondage_restraint: ['restraint_confinement', 'Restraining my partner', 'Having my partner restrain me'],
  rope_bondage: ['restraint_confinement', 'Tying my partner with rope', 'Having my partner tie me with rope'],
  sensory_deprivation: ['sensory_focus_alteration', 'Controlling my partner’s senses', 'Having my partner control my senses'],
  impact_play: ['pain_intensity', 'Spanking or striking my partner', 'Having my partner spank or strike me'],
  pain_play: ['pain_intensity', 'Giving my partner painful sensations', 'Receiving painful sensations from my partner'],
  sensation_play: ['sensory_focus_alteration', 'Giving my partner physical sensations', 'Receiving physical sensations from my partner'],
  rough_physical: ['primal_struggle_competition', 'Taking the more forceful role in physical play', 'Having my partner take the more forceful role'],
  orgasm_control: ['anticipation_denial', 'Controlling my partner’s orgasm', 'Having my partner control my orgasm'],
  chastity: ['control_permission', 'Controlling my partner’s chastity', 'Having my partner control my chastity'],
  humiliation_degradation: ['humiliation_embarrassment', 'Embarrassing or degrading my partner', 'Having my partner embarrass or degrade me'],
  praise_worship: ['praise_approval', 'Praising or adoring my partner', 'Being praised or adored by my partner'],
  objectification: ['objectification_use', 'Treating my partner as an object in play', 'Being treated as an object in play'],
  exhibition_observation: ['watching_observation', 'Watching sexual or kink activity', 'Being watched during sexual or kink activity'],
  multi_partner: ['group_social_multipartner', 'Sexual or kink activity with multiple partners'],
  roleplay: ['roleplay_transformation', 'Taking on characters or roles with a partner'],
  pet_primal: ['primal_struggle_competition', 'Taking the pursuing role in primal play', 'Taking the pursued role in primal play'],
  medical_edge: ['fear_adrenaline', 'Doing medical-themed or edge activities to my partner', 'Receiving medical-themed or edge activities'],
  fetish_materials: ['fetish_focus', 'Making clothing, materials or objects an erotic focus'],
  body_part_fetishes: ['fetish_focus', 'Making particular body areas an erotic focus'],
  fluids_mess: ['fetish_focus', 'Including fluids or messy substances in play'],
  sensory_fetishes: ['sensory_focus_alteration', 'Making particular sensory experiences an erotic focus'],
  psychological_play: ['control_permission', 'Guiding psychological play with my partner', 'Having my partner guide psychological play'],
  relationship_dynamics: ['control_permission', 'Taking authority in an ongoing relationship', 'Giving a partner authority in an ongoing relationship'],
  remote_digital: ['control_permission', 'Directing sexual or kink activity remotely', 'Following a partner’s direction remotely']
}
const POWER_CATEGORIES = new Set(['power_exchange', 'service_protocol', 'bondage_restraint', 'rope_bondage', 'sensory_deprivation', 'impact_play', 'pain_play', 'rough_physical', 'orgasm_control', 'chastity', 'humiliation_degradation', 'objectification', 'psychological_play', 'relationship_dynamics'])
export const POWER_QUESTIONS = [
  { key: 'power/give', text: 'Taking charge and guiding what happens', dimensionId: 'authority_responsibility', perspective: 'experience_self' },
  { key: 'power/receive', text: 'Letting a partner take charge and guide me', dimensionId: 'surrender', perspective: 'experience_self' }
]
const acceptedMetric = (metric) => metric?.observations >= 2 && !metric.contradictory && metric.band !== 'mixed' && metric.band !== 'insufficient'
export function metricFor(evidence, dimension, perspective) {
  const metric = evidence?.metrics?.[dimension]?.perspectives?.[perspective]
  return acceptedMetric(metric) ? metric : null
}
export function metricLimit(metric) {
  if (!metric) return null
  if (metric.score <= -1.1) return 0
  if (metric.score < 1.1) return 1
  return 3
}
function direction(activity) {
  const configs = activity.roleConfigurations || []
  const values = new Set(configs.flatMap((c) => [...(c.coordination || []), ...(c.power || [])]))
  if (values.has('directing') || values.has('dominant')) return 'give'
  if (values.has('following') || values.has('submissive')) return 'receive'
  const actions = new Set(configs.flatMap((c) => c.action || []))
  if (actions.has('giving')) return 'give'
  if (actions.has('receiving')) return 'receive'
  if (actions.has('observing')) return 'observe'
  if (actions.has('being_observed')) return 'be_observed'
  return 'mutual'
}
export function activityFacets(activity) {
  const theme = CATEGORY_THEMES[activity.categoryId]
  const links = (activity.fantasyConnections || []).filter((l) => l.specificity === 'direct' && l.essential && l.coverage === 'whole_activity')
  const facets = links.map((l) => ({ dimensionId: l.dimensionId, perspective: l.perspective }))
  if (theme && !facets.some((l) => l.dimensionId === theme[0])) {
    let perspective = theme[2] ? direction(activity) : 'overall'
    if (activity.categoryId === 'service_protocol') {
      const service = (activity.fantasyConnections || []).find((l) => l.dimensionId === 'service_usefulness')
      perspective = service?.perspective || perspective
    }
    facets.push({ dimensionId: theme[0], perspective })
  }
  return facets
}
function themeMetric(evidence, facet) {
  if (facet.perspective !== 'overall') return metricFor(evidence, facet.dimensionId, facet.perspective)
  const row = evidence?.metrics?.[facet.dimensionId]
  return acceptedMetric(row) ? row : null
}
export function filterQuestions(categoryId = 'all') {
  if (categoryId === 'power_exchange') return POWER_QUESTIONS
  const theme = CATEGORY_THEMES[categoryId]
  if (!theme) return categoryId === 'all' ? POWER_QUESTIONS : []
  const perspectives = categoryId === 'exhibition_observation' ? ['observe', 'be_observed'] : ['give', 'receive']
  return theme.slice(1).map((text, index) => ({ key: `${categoryId}/${theme[0]}/${theme[2] ? perspectives[index] : 'overall'}`, text, dimensionId: theme[0], perspective: theme[2] ? perspectives[index] : 'overall' }))
}
export function questionLimit(question, exploration, evidence) {
  const manual = exploration.topicPreferences?.[question.key]
  if (manual === -1) return null
  if ([0, 1, 3].includes(manual)) return manual
  return metricLimit(themeMetric(evidence, question))
}
function powerLimit(exploration, evidence, side) {
  const question = POWER_QUESTIONS[side === 'give' ? 0 : 1]
  if (exploration.topicPreferences?.[question.key] === -1) return null
  const raw = evidence?.metrics?.[question.dimensionId]?.perspectives?.[question.perspective]
  if (!Object.hasOwn(exploration.topicPreferences || {}, question.key) && raw?.contradictory) return null
  const own = questionLimit(question, exploration, evidence)
  if (own !== null) return own
  const opposite = POWER_QUESTIONS[side === 'give' ? 1 : 0]
  const other = questionLimit(opposite, exploration, evidence)
  return other === 3 ? 0 : other === 1 ? 1 : null
}
export function preferenceExclusion(activity, exploration, evidence) {
  const intensity = activity.explorationIntensity || 2
  const facets = activityFacets(activity)
  for (const facet of facets) {
    const key = `${activity.categoryId}/${facet.dimensionId}/${facet.perspective}`
    const manual = exploration.topicPreferences?.[key]
    const limit = manual === -1 ? null : [0, 1, 3].includes(manual) ? manual : metricLimit(themeMetric(evidence, facet))
    if (limit !== null && intensity > limit) return { code: 'theme_preference', message: `Outside your ${facet.dimensionId.replaceAll('_', ' ')} preference for this side of the activity.` }
  }
  // Specific enjoyment or an explicit topic choice takes precedence over a broad power preference.
  const specificInterest = facets.some((f) => {
    const manual = exploration.topicPreferences?.[`${activity.categoryId}/${f.dimensionId}/${f.perspective}`]
    return manual === -1 || manual > 0 || (manual === undefined && themeMetric(evidence, f)?.score >= 0.35)
  })
  if (!specificInterest && POWER_CATEGORIES.has(activity.categoryId)) {
    const side = direction(activity)
    if (side === 'give' || side === 'receive') {
      // Service direction is the inverse of power direction.
      const powerSide = activity.categoryId === 'service_protocol'
        ? (facets.find((f) => f.dimensionId === 'service_usefulness')?.perspective === 'give' ? 'receive' : 'give')
        : side
      const limit = powerLimit(exploration, evidence, powerSide)
      if (limit !== null && intensity > limit) return { code: 'power_preference', message: 'Outside the direction and intensity suggested by your power preferences.' }
    }
  }
  return null
}
function preferenceRequirement(req, attraction) {
  if (!req) return true
  if (req.all) return req.all.every((r) => preferenceRequirement(r, attraction))
  if (req.any) return req.any.some((r) => preferenceRequirement(r, attraction))
  if (req.participant !== 'partner' || !req.anatomy) return true
  const choices = attraction.partnerAnatomy || []
  if (!choices.length || choices.includes('depends_person')) return true
  const group = req.anatomy === 'breasts' ? ['breasts', 'flat_chest'] : ['penis', 'vagina', 'vulva_clitoris']
  if (!group.includes(req.anatomy) && !['vulva', 'clitoris'].includes(req.anatomy)) return true
  if (!choices.some((v) => group.includes(v))) return true
  const aliases = { vulva: ['vulva_clitoris', 'vagina'], clitoris: ['vulva_clitoris', 'vagina'], vagina: ['vagina', 'vulva_clitoris'] }
  return (aliases[req.anatomy] || [req.anatomy]).some((id) => choices.includes(id))
}
export function attractionFits(activity, attraction = {}) {
  if (!preferenceRequirement(activity.applicability, attraction)) return false
  const genders = attraction.partnerGender || []
  if (activity.partnerGenders?.length && genders.length && !genders.some((x) => ['other_varies', 'doesnt_matter'].includes(x)) && !activity.partnerGenders.some((g) => genders.includes(g))) return false
  const required = activity.attractionRequirements || {}
  return Object.entries(required).every(([key, allowed]) => {
    const selected = attraction[key] || []
    return !selected.length || selected.some((x) => ['doesnt_matter', 'varies', 'mixed_varies', 'depends_person', 'none_specific'].includes(x)) || allowed.some((x) => selected.includes(x))
  })
}
