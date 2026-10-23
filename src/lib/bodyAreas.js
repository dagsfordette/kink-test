export const bodyRegions = [
  { id: 'head', label: 'Head & face', x: 155, y: 45 },
  { id: 'neck', label: 'Neck & shoulders', x: 155, y: 90 },
  { id: 'chest', label: 'Chest', x: 155, y: 136 },
  { id: 'arms', label: 'Arms & hands', x: 88, y: 245 },
  { id: 'middle', label: 'Torso', x: 155, y: 192 },
  { id: 'hips', label: 'Hips & buttocks', x: 178, y: 222 },
  { id: 'intimate', label: 'Genitals', x: 155, y: 253 },
  { id: 'legs', label: 'Legs', x: 124, y: 346 },
  { id: 'feet', label: 'Feet', x: 120, y: 464 }
]
export function suggestedBodyModel(owner, state) {
  if (owner === 'self') {
    const anatomy = state.exploration?.facts?.self?.anatomy || {}
    const penis = anatomy.penis === 'present', vagina = anatomy.vagina === 'present'
    return penis === vagina ? null : penis ? 'male' : 'female'
  }
  const attraction = state.attraction || {}
  const genders = attraction.partnerGender || []
  if (genders.length === 1 && ['men', 'women'].includes(genders[0]))
    return genders[0] === 'men' ? 'male' : 'female'
  const anatomy = attraction.partnerAnatomy || []
  if (anatomy.includes('depends_person')) return null
  const penis = anatomy.includes('penis')
  const vagina = anatomy.includes('vagina') || anatomy.includes('vulva_clitoris')
  return penis === vagina ? null : penis ? 'male' : 'female'
}

export const bodyModelAsset = (model) => model === 'male' ? 'body-figure-male.webp' : 'body-figure-realistic.webp'
