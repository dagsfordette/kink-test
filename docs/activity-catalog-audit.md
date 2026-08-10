# Activity Explorer catalog audit

This audit summarizes the Plan 2 migration from the legacy universal catalog into the real-world **Activity Explorer** catalog. Plan 4 has now retired the legacy universal runtime and `src/data/catalog.json`; `src/data/activityCatalog.json` is the authoritative Activity Explorer dataset used by the application.

## Counts

- Original concept count: **549**
- Removed concept count: **66**
- Flattened activity count before duplicate-source merges: **995**
- Merged duplicate count: **4 source concepts**
- Final activity count: **987**
- Final category count: **30**
- Retained detail profile count: **28**

### Count by priority tier

| Priority | Activities |
| --- | ---: |
| starter | 336 |
| extended | 324 |
| specialized | 327 |

### Count by category

| Category | ID | Activities |
| --- | --- | ---: |
| Power exchange | `power_exchange` | 39 |
| Service & protocol | `service_protocol` | 28 |
| Bondage & restraint | `bondage_restraint` | 56 |
| Rope bondage | `rope_bondage` | 24 |
| Sensory deprivation & control | `sensory_deprivation` | 22 |
| Impact play | `impact_play` | 26 |
| Pain play | `pain_play` | 32 |
| Sensation play | `sensation_play` | 30 |
| Rough / physical play | `rough_physical` | 24 |
| Sexual activities | `sexual_activities` | 36 |
| Anal play | `anal_play` | 23 |
| Toys & devices | `toys_devices` | 35 |
| Orgasm control | `orgasm_control` | 30 |
| Chastity | `chastity` | 15 |
| Humiliation & degradation | `humiliation_degradation` | 26 |
| Praise, worship & adoration | `praise_worship` | 26 |
| Objectification & dollification | `objectification` | 22 |
| Exhibitionism & observation | `exhibition_observation` | 13 |
| Multi-partner / partner-sharing | `multi_partner` | 13 |
| Roleplay | `roleplay` | 29 |
| Pet play & primal play | `pet_primal` | 28 |
| Medical-themed & edge activities | `medical_edge` | 24 |
| Materials, clothing & object interests | `fetish_materials` | 84 |
| Body-area interests | `body_part_fetishes` | 105 |
| Fluids & messy play | `fluids_mess` | 36 |
| Sensory & stimulus interests | `sensory_fetishes` | 42 |
| Psychological play | `psychological_play` | 40 |
| Relationship structures & ongoing dynamics | `relationship_dynamics` | 32 |
| Remote / digital dynamics | `remote_digital` | 36 |
| Sexual settings & contexts | `sexual_context` | 11 |

## Important renames and structural changes

- Perspective tabs were flattened into independent activity rows. Directional rows use reciprocal `complementId` links where a clear partner-side complement exists.
- `giving_commands` became **Giving my partner commands or directions** (`give_commands`) and **Following my partner's commands or directions** (`receive_commands`).
- Bare labels such as **Obedience**, material names, and body-area names were rewritten into direct real-world wording. For example, material/body-area entries now say what is being incorporated or focused on.
- The old Quick / Standard / Exhaustive modes are not present in the new model. Their lists are used only as evidence for internal `starter`, `extended`, and `specialized` priority tiers.
- Legacy category gates, fantasy appeal, real-world desire, willingness, and boundary scales are absent from the new dataset. The seven-state stance scale and independent experience scale are authoritative.
- The pure **Emotions & arousal states** category was retired. The pure **Fantasy / transformation themes** category was also retired; its two real-world roleplay entries (gender-expression roleplay and costume/alternate-identity roleplay) moved to `roleplay`.
- Fantasy Profile suggestion targets were updated only where retired Activity Explorer categories had been referenced: `roleplay` now targets `roleplay`, and `psychological_play` now targets `psychological_play`. Fantasy Profile questions and scoring taxonomy were not rewritten.

## Important duplicate merges

- `butt_plugs` → `anal_plugs` (same real-world object/activity; the anal-focused entry keeps the richer negotiation metadata).
- `anal_beads_device` → `anal_beads`.
- `collaring_relationship` → `collared_relationship`.
- `furniture_roleplay` → `human_furniture`.

## Important removed fantasy/emotion areas

- All 44 legacy pure-emotion concepts were removed, including the dedicated 42-item Emotions & arousal states category plus the two emotion-typed Psychological play entries.
- Fantasy-only exposure and anonymous-partner entries were removed rather than converted into Activity Explorer answers.
- Impossible transformation themes such as giant/tiny, body-swap, magical transformation, robot transformation, and gender/body transformation fantasies were removed from Activity Explorer.
- Reproductive/ownership/public-use/anonymous-use fantasy-only entries were removed rather than turned into real-world stances.
- Smothering, cutting, and scarification fantasy-only entries were removed; the catalog does not convert those fantasy items into procedural real-world guidance.
- Two fantasy-typed legacy concepts were retained only because they can be reframed as concrete, negotiable real-world **roleplay**: sleep-vulnerability roleplay is explicitly limited to participants who remain awake and responsive, and blackmail-themed roleplay is explicitly limited to fictional or pre-agreed leverage.

## Detail and risk metadata

Useful real-world detail fields were retained and cleaned. Fields marked fantasy-only were dropped; body-preference details were folded into composite detail profiles where an activity previously used both a standard detail profile and the partner-body profile. Old concept-specific detail references were translated to the new flattened activity IDs.

Risk metadata remains high-level and non-procedural. The retained domains are physical, medical, psychological, consent complexity, privacy, digital security, reputational, and financial.

## Removed source concept IDs

- `public_exposure_fantasy_only`
- `anonymous_partner_fantasy`
- `smothering_fantasy`
- `cutting_fantasy`
- `scarification_fantasy`
- `anticipation`
- `waiting_suspense`
- `size_difference_fantasy`
- `giant_tiny_fantasy`
- `transformation_fantasy`
- `body_swap_fantasy`
- `doll_transformation_fantasy`
- `robot_transformation_fantasy`
- `monster_transformation_fantasy`
- `nonhuman_character_fantasy`
- `magical_control_fantasy`
- `hypnosis_fantasy`
- `breeding_fantasy`
- `pregnancy_fantasy`
- `ownership_fantasy`
- `public_use_fantasy`
- `anonymous_use_fantasy`
- `emotion_fear`
- `emotion_humiliation`
- `emotion_embarrassment`
- `emotion_happiness`
- `emotion_enthusiasm`
- `emotion_excitement`
- `emotion_anticipation`
- `emotion_surprise`
- `emotion_vulnerability`
- `emotion_exposure`
- `emotion_safety`
- `emotion_trust`
- `emotion_closeness`
- `emotion_desired`
- `emotion_admired`
- `emotion_adored`
- `emotion_praised`
- `emotion_pride`
- `emotion_usefulness`
- `emotion_obedience`
- `emotion_surrender`
- `emotion_controlled`
- `emotion_power`
- `emotion_responsibility`
- `emotion_possessiveness`
- `emotion_objectification`
- `emotion_being_used`
- `emotion_naughtiness`
- `emotion_playfulness`
- `emotion_defiance`
- `emotion_intensity`
- `emotion_relief`
- `emotion_calm`
- `emotion_tenderness`
- `emotion_care`
- `emotion_protectiveness`
- `emotion_jealousy`
- `emotion_shame`
- `forced_orgasm_fantasy`
- `emotion_helplessness`
- `emotion_desperation`
- `emotion_frustration`
- `emotion_awe_reverence`
- `gender_transformation_fantasy`
