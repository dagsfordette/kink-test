import { useMemo } from 'react'
import { semanticDefinition, semanticFollowupPolicy } from '../lib/profile.js'
import {
  fieldVisibleForBranch,
  normalizePreferenceMatrix,
  setPreferenceMatrixValue,
} from '../lib/adaptiveDetails.js'

function SelectField({ value, onChange, options, placeholder = 'Choose one', className = '' }) {
  return (
    <select className={className} value={value || ''} onChange={(e) => onChange(e.target.value || undefined)}>
      <option value="" disabled hidden>{placeholder}</option>
      {options.map((option) => <option value={option.id} key={option.id}>{option.label}</option>)}
    </select>
  )
}

function MultiSelect({ value = [], onChange, options }) {
  const selected = new Set(value || [])
  const optionMap = Object.fromEntries((options || []).map((option) => [option.id, option]))

  const toggle = (id) => {
    const next = new Set(selected)
    const option = optionMap[id]

    if (next.has(id)) {
      next.delete(id)
    } else if (option?.exclusive) {
      next.clear()
      next.add(id)
    } else {
      for (const selectedId of [...next]) {
        if (optionMap[selectedId]?.exclusive) next.delete(selectedId)
      }
      next.add(id)
    }

    onChange([...next])
  }

  return (
    <div className="detail-choice-grid">
      {options.map((option) => (
        <button
          type="button"
          key={option.id}
          className={`detail-choice ${selected.has(option.id) ? 'selected' : ''}`}
          aria-pressed={selected.has(option.id)}
          onClick={() => toggle(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function PreferenceMatrix({ catalog, value, onChange, options }) {
  const states = catalog.adaptiveDetailSystem?.detailResponseStates || []
  const matrix = normalizePreferenceMatrix(value)

  return (
    <div className="detail-preference-matrix">
      {options.map((option) => {
        const current = matrix[option.id] || ''
        return (
          <label className={`detail-matrix-row ${current === 'hard_limit' ? 'hard-limit-row' : ''}`} key={option.id}>
            <span>{option.label}</span>
            <select
              aria-label={`${option.label} detail preference`}
              value={current}
              onChange={(event) => onChange(setPreferenceMatrixValue(matrix, option.id, event.target.value || undefined))}
            >
              <option value="">No answer</option>
              {states.map((state) => <option value={state.id} key={state.id}>{state.label}</option>)}
            </select>
          </label>
        )
      })}
    </div>
  )
}

function fieldIsVisible(field, details = {}) {
  const rule = field.showWhen
  if (!rule) return true
  const current = details[rule.field]

  if (rule.operator === 'equals') return current === rule.value
  if (rule.operator === 'contains') return Array.isArray(current) && current.includes(rule.value)
  if (rule.operator === 'containsAny') return Array.isArray(current) && (rule.value || []).some((value) => current.includes(value))
  if (rule.operator === 'present') return Array.isArray(current) ? current.length > 0 : current !== undefined && current !== null && current !== ''
  return true
}

function matchesConceptScope(item, conceptId, perspective) {
  if (!item) return false
  if (item.appliesToConceptIds && !item.appliesToConceptIds.includes(conceptId)) return false
  if (item.excludeForConceptIds?.includes(conceptId)) return false
  if (item.appliesToPerspectives && !item.appliesToPerspectives.includes(perspective)) return false
  if (item.excludeForPerspectives?.includes(perspective)) return false
  return true
}

function optionIsVisible(option, details = {}) {
  return fieldIsVisible(option, details)
}

function semanticOptions(field, semanticType, conceptId, perspective, details) {
  return (field.options || []).filter((option) => {
    if (option.appliesToSemanticTypes && !option.appliesToSemanticTypes.includes(semanticType)) return false
    if (!matchesConceptScope(option, conceptId, perspective)) return false
    return optionIsVisible(option, details)
  })
}

function lowerFirst(value = '') {
  return value ? value.charAt(0).toLowerCase() + value.slice(1) : value
}

function contextualDetailLabel(profileId, field, concept) {
  const phrase = lowerFirst(concept?.label || 'this')
  const keyed = {
    'power_exchange:role_scope': `Where would ${phrase} fit for you?`,
    'power_exchange:tone': 'What tone would you want?',
    'power_exchange:structure': 'How structured would you want it to be?',
    'psychological:elements': `Which parts of ${phrase} appeal to you?`,
    'humiliation:forms': `Which forms of ${phrase} appeal to you?`,
    'orgasm_control:modes': `Which forms of ${phrase} appeal to you?`,
    'fetish:interaction': `What about ${phrase} appeals to you?`,
    'generic:detail_note': `Anything specific about ${phrase} you want to remember?`,
    'multi_partner:role': `What role in ${phrase} appeals to you?`,
    'sexual_context:location_types': `Which versions of ${phrase} appeal to you?`,
    'sexual_context:setting_appeal': `What about ${phrase} appeals to you?`,
    'partner_body_general:body_partner_gender': `Which genders does ${phrase} appeal to you with?`,
    'partner_body_general:body_gender_expression': `Which gender expressions fit ${phrase} for you?`,
    'partner_body_general:body_partner_anatomy': `Which anatomy is relevant to ${phrase} for you?`,
    'partner_body_general:body_feature_focus': `Which body features matter most for ${phrase}?`,
  }
  return keyed[`${profileId}:${field.id}`] || field.label
}

function DetailField({ catalog, profileId, concept, field, value, onChange, semanticType, perspective, details }) {
  const options = semanticOptions(field, semanticType, concept?.id, perspective, details)
  const label = contextualDetailLabel(profileId, field, concept)

  if (field.type === 'preference_matrix') {
    return (
      <div className="detail-field">
        <div className="detail-field-heading">
          <strong>{label}</strong>
          {field.help && <span>{field.help}</span>}
          
        </div>
        <PreferenceMatrix catalog={catalog} value={value} onChange={onChange} options={options} />
      </div>
    )
  }

  if (field.type === 'multi_select') {
    return (
      <div className="detail-field">
        <div className="detail-field-heading">
          <strong>{label}</strong>
          {field.help && <span>{field.help}</span>}
          
        </div>
        <MultiSelect value={value || []} onChange={onChange} options={options} />
      </div>
    )
  }

  if (field.type === 'single_select') {
    return (
      <label className="detail-field">
        <span className="detail-field-heading"><strong>{label}</strong>{field.help && <span>{field.help}</span>}</span>
        <SelectField value={value} onChange={onChange} options={options} placeholder={field.placeholder || 'Choose one'} />
      </label>
    )
  }

  if (field.type === 'paired_select') {
    const pair = value || {}
    return (
      <div className="detail-field">
        <div className="detail-field-heading">
          <strong>{label}</strong>
          {field.help && <span>{field.help}</span>}
          
        </div>
        <div className="paired-selects">
          <label>
            <span>{field.preferredLabel || 'Preferred'}</span>
            <SelectField value={pair.preferred} onChange={(next) => onChange({ ...pair, preferred: next })} options={options} placeholder={field.placeholder || 'Choose'} />
          </label>
          <label>
            <span>{field.maximumLabel || 'Maximum'}</span>
            <SelectField value={pair.maximum} onChange={(next) => onChange({ ...pair, maximum: next })} options={options} placeholder={field.placeholder || 'Choose'} />
          </label>
        </div>
      </div>
    )
  }

  if (field.type === 'text') {
    return (
      <label className="detail-field">
        <span className="detail-field-heading"><strong>{label}</strong></span>
        <textarea rows="2" value={value || ''} placeholder={field.placeholder || 'Optional'} onChange={(e) => onChange(e.target.value)} />
      </label>
    )
  }

  return null
}

function profileApplies(profile, semanticType) {
  if (!profile) return false
  const allowed = profile.appliesToSemanticTypes
  return !allowed || allowed.includes(semanticType)
}

function ProfileSection({ catalog, profile, details, patchDetail, semanticType, decision, concept, perspective, bodyProfile = false, excludedFieldIds = [] }) {
  if (!profile) return null
  const conceptScoped = (field) => matchesConceptScope(field, concept?.id, perspective)
  const excluded = new Set(excludedFieldIds || [])
  const activeFields = (profile.fields || []).filter((field) => !excluded.has(field.id) && conceptScoped(field) && fieldIsVisible(field, details) && fieldVisibleForBranch(field, decision))
  if (!activeFields.length) return null

  const title = bodyProfile ? `Partner / body fit for ${concept.label}` : `More about ${concept.label}`

  return (
    <section className="adaptive-details" aria-label={title}>
      <div className="adaptive-details-heading">
        <h4>{title}</h4>
      </div>
      {decision?.state === 'fantasy_only' && <p className="adaptive-branch-note">Only fantasy-relevant follow-ups are shown for this answer.</p>}
      <div className="detail-fields">
        {activeFields.map((field) => (
          <DetailField key={field.id} catalog={catalog} profileId={profile.id} concept={concept} field={field} value={details?.[field.id]} onChange={(value) => patchDetail(field.id, value)} semanticType={semanticType} perspective={perspective} details={details} />
        ))}
      </div>
    </section>
  )
}

export default function AdaptiveDetails({ catalog, concept, perspective, answer, update, decision, excludedFieldIds = [] }) {
  const profileMap = useMemo(() => Object.fromEntries((catalog.detailProfiles || []).map((p) => [p.id, p])), [catalog])
  const bodyProfileMap = useMemo(() => Object.fromEntries((catalog.bodyPreferenceProfiles || []).map((p) => [p.id, p])), [catalog])
  const semantic = semanticDefinition(catalog, concept)
  const policy = semanticFollowupPolicy(catalog, concept)

  const profileId = concept.detailProfileByPerspective?.[perspective] || concept.detailProfileId
  const candidateProfile = profileMap[profileId]
  const profile = policy.detailProfile !== false && profileApplies(candidateProfile, semantic.id) ? candidateProfile : null
  const bodyProfileId = concept.bodyPreferenceProfileByPerspective?.[perspective] || concept.bodyPreferenceProfileId
  const candidateBodyProfile = bodyProfileMap[bodyProfileId]
  const bodyAllowed = policy.bodyCompatibility === 'when_bound' && Boolean(bodyProfileId)
  const bodyProfile = bodyAllowed && profileApplies(candidateBodyProfile, semantic.id) ? candidateBodyProfile : null

  if (!profile && !bodyProfile) return null

  const patchDetail = (fieldId, value) => {
    const details = { ...(answer?.details || {}) }
    if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0) || (value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)) delete details[fieldId]
    else details[fieldId] = value
    update({ ...answer, details })
  }

  const details = answer?.details || {}

  return (
    <>
      <ProfileSection catalog={catalog} profile={profile} details={details} patchDetail={patchDetail} semanticType={semantic.id} decision={decision} concept={concept} perspective={perspective} excludedFieldIds={excludedFieldIds} />
      <ProfileSection catalog={catalog} profile={bodyProfile} details={details} patchDetail={patchDetail} semanticType={semantic.id} decision={decision} concept={concept} perspective={perspective} bodyProfile excludedFieldIds={excludedFieldIds} />
    </>
  )
}
