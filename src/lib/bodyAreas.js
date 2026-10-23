export const bodyRegions = [
  { id: 'head', label: 'Head & face', x: 150, y: 49, areas: ['hair', 'scalp', 'face', 'eyes', 'ears', 'lips', 'mouth', 'tongue', 'teeth'] },
  { id: 'neck', label: 'Neck & shoulders', x: 150, y: 100, areas: ['neck', 'shoulders'] },
  { id: 'chest', label: 'Chest', x: 150, y: 145, areas: ['chest', 'breasts', 'nipples', 'areolas'] },
  { id: 'arms', label: 'Arms & hands', x: 65, y: 208, areas: ['arms', 'hands', 'fingers'] },
  { id: 'middle', label: 'Torso', x: 150, y: 203, areas: ['abdomen', 'navel', 'waist', 'back', 'armpit'] },
  { id: 'hips', label: 'Hips & buttocks', x: 150, y: 260, areas: ['hips', 'buttocks'] },
  { id: 'intimate', label: 'Genitals', x: 150, y: 294, areas: ['genital'] },
  { id: 'legs', label: 'Legs', x: 124, y: 366, areas: ['legs', 'thighs', 'calves', 'knees'] },
  { id: 'feet', label: 'Feet', x: 117, y: 475, areas: ['feet', 'toes', 'ankles'] },
  { id: 'features', label: 'Features & scent', areas: ['body_hair', 'pubic_hair', 'facial_hair', 'muscle', 'height_size', 'tattoo', 'piercing', 'scented_body_area'] }
]
const labels = { genital: 'Genitals', armpit: 'Armpits', muscle: 'Musculature', height_size: 'Height / body-size difference', tattoo: 'Tattoos', piercing: 'Piercings', scented_body_area: 'Body scent' }
export const bodyAreaLabel = (id) => labels[id] || (id.replaceAll('_', ' ').replace(/^./, (c) => c.toUpperCase()))
export const bodyActivityIds = (area, owner) => (owner === 'self' ? ['receive'] : ['observe', 'give']).map((p) => `${p}_${area}_fetish`)
export function bodyAreaStatus(answers) {
  const values = answers.map((a) => a?.stance).filter(Boolean)
  if (!values.length) return 'unanswered'
  const kinds = new Set(values.map((v) => ['hard_limit', 'soft_limit'].includes(v) ? 'limit' : ['love', 'want', 'curious'].includes(v) ? 'interest' : 'other'))
  return kinds.size > 1 ? 'mixed' : [...kinds][0]
}
