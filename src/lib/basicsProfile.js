export const BASICS_FIELDS = [
  {
    id: 'partnerGender',
    label: 'Who are you generally into?',
    help: 'Choose any that tend to fit. You can leave this broad or skip it.',
    type: 'multi_select',
    options: [
      ['men', 'Men'], ['women', 'Women'], ['nonbinary', 'Non-binary people'], ['other_varies', 'Other / varies'], ['doesnt_matter', "Doesn't matter to me"],
    ],
  },
  {
    id: 'genderExpression',
    label: 'Gender expression you tend to be drawn to',
    type: 'multi_select',
    options: [
      ['masculine', 'Masculine'], ['feminine', 'Feminine'], ['androgynous', 'Androgynous'], ['mixed_varies', 'Mixed / varies'], ['doesnt_matter', "Doesn't matter to me"],
    ],
  },
  {
    id: 'partnerAnatomy',
    label: 'Anatomy that can matter for attraction or sexual compatibility',
    help: 'This is a general preference, not a requirement for every activity.',
    type: 'multi_select',
    options: [
      ['penis', 'Penis'], ['vulva_clitoris', 'Vulva / clitoris'], ['vagina', 'Vagina'], ['anus', 'Anus'], ['breasts', 'Breasts'], ['flat_chest', 'Flat / non-breasted chest'], ['depends_person', 'Depends on the person / activity'],
    ],
  },
  {
    id: 'bodyBuild',
    label: 'Body builds you tend to prefer',
    type: 'multi_select',
    options: [
      ['very_slim', 'Very slim'], ['slim', 'Slim'], ['medium', 'Medium / average'], ['athletic', 'Athletic'], ['muscular', 'Muscular'], ['stocky', 'Stocky'], ['fat_larger', 'Fat / larger body'], ['doesnt_matter', 'No strong preference'],
    ],
  },
  {
    id: 'heightRelative',
    label: 'Height relative to you',
    type: 'multi_select',
    options: [
      ['much_shorter', 'Much shorter'], ['shorter', 'Shorter'], ['similar', 'Similar height'], ['taller', 'Taller'], ['much_taller', 'Much taller'], ['doesnt_matter', 'No strong preference'],
    ],
  },
  {
    id: 'bodyHair',
    label: 'Body-hair preference',
    type: 'multi_select',
    options: [
      ['little_none', 'Little / none'], ['some', 'Some'], ['hairy', 'Hairy'], ['varies', 'Varies by person / body area'], ['doesnt_matter', 'No strong preference'],
    ],
  },
  {
    id: 'bodyFeatures',
    label: 'Body features that particularly affect attraction',
    type: 'multi_select',
    options: [
      ['face', 'Face'], ['hair', 'Hair'], ['chest_breasts', 'Chest / breasts'], ['arms_hands', 'Arms / hands'], ['waist_stomach', 'Waist / stomach'], ['hips_butt', 'Hips / butt'], ['legs', 'Legs'], ['feet', 'Feet'], ['genitals', 'Genitals'], ['musculature', 'Musculature'], ['tattoos', 'Tattoos'], ['piercings', 'Piercings'], ['none_specific', 'No particular body feature'],
    ],
  },
  {
    id: 'pubicHair',
    label: 'Pubic-hair / grooming preference',
    type: 'multi_select',
    options: [
      ['natural', 'Natural / ungroomed'], ['trimmed', 'Trimmed'], ['shaved', 'Shaved / hairless'], ['varies', 'Varies'], ['doesnt_matter', 'No strong preference'],
    ],
  },
  {
    id: 'penisSize',
    label: 'If penis size matters, what tends to fit?',
    type: 'multi_select',
    showWhen: { field: 'partnerAnatomy', contains: 'penis' },
    options: [
      ['smaller', 'Smaller'], ['average', 'Average / medium'], ['larger', 'Larger'], ['very_large', 'Very large'], ['doesnt_matter', 'Size does not matter much'],
    ],
  },
  {
    id: 'breastChest',
    label: 'If chest or breast anatomy matters, what tends to fit?',
    type: 'multi_select',
    showWhen: { field: 'partnerAnatomy', containsAny: ['breasts', 'flat_chest'] },
    options: [
      ['flat', 'Flat chest'], ['small', 'Small breasts'], ['medium', 'Medium breasts'], ['large', 'Large breasts'], ['varies', 'Varies'], ['doesnt_matter', 'No strong preference'],
    ],
  },
  {
    id: 'intensity',
    label: 'Your general intensity range',
    help: 'This is a baseline only. Individual activities can still be gentler or more intense.',
    type: 'paired_select',
    options: [
      ['very_light', 'Very light'], ['light', 'Light'], ['moderate', 'Moderate'], ['strong', 'Strong'], ['very_strong', 'Very strong / intense'], ['varies', 'Varies a lot by activity'],
    ],
  },
]

export function createBasicsProfile() {
  return { complete: false, values: {}, nextRoute: null }
}

export function normalizeBasicsProfile(saved) {
  const clean = createBasicsProfile()
  if (!saved || typeof saved !== 'object') return clean
  return {
    complete: Boolean(saved.complete),
    values: saved.values && typeof saved.values === 'object' && !Array.isArray(saved.values) ? saved.values : {},
    nextRoute: typeof saved.nextRoute === 'string' ? saved.nextRoute : null,
  }
}
