# Catalog Audit Baseline

Questionnaire: `adult-kink-inventory` v1.0.10  
Catalog schema: `2.1.0`  
Audit schema: `1.7.0`

## Summary

| Metric | Count |
|---|---:|
| Navigation domains | 8 |
| Categories | 32 |
| Concepts | 594 |
| Branch-gate concepts | 32 |
| Cross-category concepts | 182 |
| Detail profiles | 35 |
| Concepts with detail profiles | 562 |
| Priority adaptive profiles | 8 |
| Preference-matrix fields | 235 |
| Definition-eligible concepts | 562 |
| Substantive definitions | 562 |
| Without substantive definitions | 0 |
| Boilerplate descriptions | 0 |
| Exact duplicate label groups | 0 |
| Near-duplicate label pairs | 2 |
| Validation errors | 0 |
| Validation warnings | 2 |

## Navigation domains

| Domain | Categories | Primary concepts | Discoverable placements |
|---|---:|---:|---:|
| Power, Roles & Relationships | 3 | 69 | 143 |
| Restraint & Control | 5 | 75 | 97 |
| Physical Sensation & Intensity | 5 | 70 | 82 |
| Sexual Activities & Devices | 4 | 61 | 78 |
| Psychological & Emotional Dynamics | 5 | 103 | 118 |
| Roleplay & Fantasy | 3 | 58 | 96 |
| Fetishes & Stimuli | 3 | 77 | 78 |
| Partners, Observation & Setting | 4 | 49 | 55 |

## Depth-mode coverage

Counts reflect current UI placements when every category branch is open and “show all” has not been manually selected. Cross-listed canonical concepts can therefore appear in more than one category without creating extra answer identities.

| Mode | Concepts shown |
|---|---:|
| quick | 191 |
| standard | 391 |
| exhaustive | 747 |

## Concepts per category

| Domain | Category | Primary concepts | All catalog placements | Result contributors | Perspective records |
|---|---|---:|---:|---:|---:|
| Power, Roles & Relationships | Power exchange | 26 | 100 | 26 | 42 |
| Power, Roles & Relationships | Service & protocol | 15 | 15 | 15 | 28 |
| Restraint & Control | Bondage & restraint | 28 | 40 | 28 | 56 |
| Restraint & Control | Rope bondage | 12 | 12 | 12 | 24 |
| Restraint & Control | Sensory deprivation & control | 11 | 11 | 11 | 22 |
| Physical Sensation & Intensity | Impact play | 13 | 13 | 13 | 26 |
| Physical Sensation & Intensity | Pain play | 15 | 27 | 15 | 30 |
| Physical Sensation & Intensity | Sensation play | 15 | 15 | 15 | 30 |
| Physical Sensation & Intensity | Rough / physical play | 12 | 12 | 12 | 24 |
| Sexual Activities & Devices | Sexual activities | 20 | 31 | 20 | 36 |
| Sexual Activities & Devices | Anal play | 11 | 16 | 11 | 23 |
| Sexual Activities & Devices | Toys & devices | 18 | 19 | 18 | 39 |
| Restraint & Control | Orgasm control | 16 | 25 | 16 | 32 |
| Restraint & Control | Chastity | 8 | 9 | 8 | 15 |
| Psychological & Emotional Dynamics | Humiliation & degradation | 14 | 14 | 14 | 28 |
| Psychological & Emotional Dynamics | Praise, worship & adoration | 13 | 13 | 13 | 26 |
| Psychological & Emotional Dynamics | Objectification & dollification | 11 | 25 | 11 | 22 |
| Partners, Observation & Setting | Exhibitionism & observation | 12 | 16 | 12 | 14 |
| Partners, Observation & Setting | Multi-partner / partner-sharing | 14 | 14 | 14 | 14 |
| Roleplay & Fantasy | Roleplay | 26 | 61 | 26 | 27 |
| Roleplay & Fantasy | Pet play & primal play | 14 | 14 | 14 | 28 |
| Physical Sensation & Intensity | Medical-themed & higher-risk edge play | 15 | 15 | 15 | 30 |
| Fetishes & Stimuli | Materials & clothing fetishes | 28 | 28 | 28 | 84 |
| Fetishes & Stimuli | Body-part fetishes | 35 | 36 | 35 | 105 |
| Sexual Activities & Devices | Fluids & messy play | 12 | 12 | 12 | 36 |
| Fetishes & Stimuli | Sensory & body-sensation fetishes | 14 | 14 | 14 | 42 |
| Psychological & Emotional Dynamics | Psychological play | 23 | 24 | 23 | 44 |
| Psychological & Emotional Dynamics | Emotions & arousal states | 42 | 42 | 42 | 84 |
| Power, Roles & Relationships | Relationship-oriented dynamics | 28 | 28 | 28 | 46 |
| Partners, Observation & Setting | Remote / digital dynamics | 12 | 14 | 12 | 36 |
| Roleplay & Fantasy | Fantasy / transformation themes | 18 | 21 | 18 | 18 |
| Partners, Observation & Setting | Sexual context & locations | 11 | 11 | 11 | 11 |

## Perspectives

| Perspective | Concepts |
|---|---:|
| as_dominant | 42 |
| as_submissive | 45 |
| as_switch | 1 |
| be_observed | 2 |
| evoke_partner | 42 |
| feel_self | 42 |
| give | 383 |
| mutual | 144 |
| observe | 65 |
| overall | 2 |
| receive | 383 |
| self | 33 |

## Semantic metadata

Semantic types currently present in the catalog:

- `activity`: 230
- `body_part`: 36
- `communication_preference`: 5
- `device`: 19
- `dynamic`: 115
- `emotion`: 45
- `fantasy`: 25
- `material`: 29
- `relationship_dynamic`: 29
- `role`: 28
- `setting`: 13
- `stimulus`: 20

Authoritative question dimensions: `fantasyAppeal`, `realWorldDesire`, `experience`, `experiencedPreference`, `willingness`, `boundary`.
Legacy per-concept dimension flags retained for compatibility: `boundary`, `experience`, `experiencedPreference`, `fantasyPreference`, `willingness`.

## Adaptive detail system

Adaptive detail system: `1.0.0`; response states: `appealing`, `acceptable`, `conditional`, `not_interested`, `hard_limit`.
Priority profiles: `bondage`, `impact`, `sexual_activity`, `roleplay`, `body_part_interest`, `material_interest`, `emotion_self`, `emotion_partner`.
Reusable detail primitives: `body_area`, `implement`, `material`, `intensity`, `duration`, `rhythm_style`, `role`, `emotional_framing`, `visibility`, `location`, `audience`, `relationship_context`, `privacy`, `marks`, `recording_storage`, `fantasy_subtype`, `restraint_method`, `mobility`, `position`, `interaction_mode`, `script_style`, `realism`.

## Detail profiles

| Profile | Semantic applicability | References | Matrix fields |
|---|---|---:|---:|
| Power-exchange & service details (`power_exchange`) | dynamic | 41 | 26 |
| Restraint, rope & sensory-control details (`bondage`) | activity | 51 | 19 |
| Impact, pain & rough-play details (`impact`) | activity | 40 | 13 |
| Sensation-play details (`sensation`) | activity | 15 | 2 |
| Giving oral sex — details (`oral_giving`) | activity | 1 | 0 |
| Receiving oral sex — details (`oral_receiving`) | activity | 1 | 0 |
| Sexual-activity & device details (`sexual_activity`) | activity, device | 37 | 12 |
| Anal-play details (`anal`) | activity | 11 | 9 |
| Orgasm-control & chastity details (`orgasm_control`) | dynamic, fantasy | 24 | 11 |
| Humiliation & objectification details (`humiliation`) | dynamic, activity | 25 | 9 |
| Observation, exhibition & recording details (`exhibition`) | activity, fantasy | 12 | 9 |
| Multi-partner & partner-sharing details (`multi_partner`) | activity, fantasy | 14 | 10 |
| Roleplay details (`roleplay`) | activity, role, fantasy, stimulus | 22 | 2 |
| Sensory-fetish details (`fetish`) | stimulus | 14 | 8 |
| Body-part interest details (`body_part_interest`) | body_part | 35 | 9 |
| Material interest details (`material_interest`) | material | 28 | 2 |
| Psychological-play details (`psychological`) | dynamic, emotion, stimulus, activity, fantasy | 23 | 7 |
| Relationship-dynamic details (`relationship_dynamic`) | dynamic, relationship_dynamic, communication_preference, activity, setting | 28 | 13 |
| Structured interest details (`generic`) | activity, role, dynamic, fantasy, stimulus, body_part, material, emotion, setting, relationship_dynamic, device, communication_preference, risk_context | 40 | 12 |
| Sexual setting details (`sexual_context`) | setting, risk_context | 11 | 7 |
| Emotional-state details (`emotion_self`) | emotion | 42 | 3 |
| Partner reaction — details (`emotion_partner`) | emotion | 42 | 4 |
| Remote / wearable toy details (`remote_toy`) | activity, device | 1 | 2 |
| Transformation-fantasy details (`transformation_fantasy`) | fantasy | 2 | 3 |
| Remote / digital details (`remote_digital`) | communication_preference, activity, dynamic, relationship_dynamic, setting | 11 | 13 |
| Scenario roleplay details (`roleplay_scenario`) | activity, fantasy, role | 5 | 7 |
| Pet-play details (`pet_play`) | activity | 7 | 7 |
| Primal-play details (`primal_play`) | activity | 5 | 3 |
| Sleep-vulnerability fantasy details (`sleep_vulnerability_fantasy`) | fantasy | 1 | 2 |
| Size-difference fantasy details (`size_fantasy`) | fantasy | 2 | 2 |
| Specific transformation fantasy details (`specific_transformation_fantasy`) | fantasy | 5 | 2 |
| Identity / presentation roleplay details (`identity_roleplay`) | activity, role | 2 | 2 |
| Control-fantasy details (`control_fantasy`) | fantasy | 2 | 2 |
| Breeding / pregnancy fantasy details (`reproductive_fantasy`) | fantasy | 2 | 1 |
| Ownership / use fantasy details (`ownership_use_fantasy`) | fantasy | 3 | 2 |

## Cross-category concepts

182 concepts are canonically reused across more than one category. The explicit primaryCategory remains the current results/scoring category; related placements reuse the same canonical answer key.

- **Service-oriented submission** (`service_submission`): service_protocol, power_exchange
- **Receiving service in a dominant role** (`service_receiving`): service_protocol, power_exchange
- **Domestic service** (`domestic_service`): service_protocol, power_exchange
- **Personal service** (`personal_service`): service_protocol, power_exchange
- **Sexual service** (`sexual_service`): service_protocol, power_exchange
- **Formal protocol** (`formal_protocol`): service_protocol, power_exchange
- **Rituals and repeated routines** (`rituals`): service_protocol, power_exchange
- **Greeting / departure protocol** (`greeting_protocol`): service_protocol, power_exchange
- **Prescribed positions** (`position_protocol`): service_protocol, power_exchange
- **Assigned tasks** (`task_assignment`): service_protocol, power_exchange
- **Reporting task completion** (`task_reporting`): service_protocol, power_exchange
- **Standing rules between scenes** (`standing_rules`): service_protocol, power_exchange
- **Etiquette / protocol training** (`etiquette_training`): service_protocol, power_exchange
- **Waiting / attending service** (`waiting_attending`): service_protocol, power_exchange
- **Presentation / grooming requirements** (`presentation_grooming`): service_protocol, power_exchange
- **Rope bondage** (`rope_bondage_general`): rope_bondage, bondage_restraint
- **Decorative / aesthetic rope** (`decorative_rope`): rope_bondage, bondage_restraint
- **Functional restrictive rope** (`functional_rope`): rope_bondage, bondage_restraint
- **Rope harnesses** (`rope_harness`): rope_bondage, bondage_restraint
- **Chest harness rope** (`chest_harness_rope`): rope_bondage, bondage_restraint
- **Hip harness rope** (`hip_harness_rope`): rope_bondage, bondage_restraint
- **Limb-focused rope** (`limb_rope`): rope_bondage, bondage_restraint
- **Floor-based rope bondage** (`floor_rope`): rope_bondage, bondage_restraint
- **Partial suspension rope** (`partial_suspension`): rope_bondage, bondage_restraint
- **Full suspension rope** (`full_suspension`): rope_bondage, bondage_restraint
- **Rope pressure / texture sensation** (`rope_sensation`): rope_bondage, bondage_restraint
- **Rope as ritual or protocol** (`rope_protocol`): rope_bondage, bondage_restraint
- **Hand spanking** (`hand_spanking`): impact_play, pain_play
- **Paddling** (`paddling`): impact_play, pain_play
- **Flogging** (`flogging`): impact_play, pain_play
- **Caning** (`caning`): impact_play, pain_play
- **Whipping** (`whipping`): impact_play, pain_play
- **Strapping** (`strapping`): impact_play, pain_play
- **Body slapping** (`slapping_body`): impact_play, pain_play
- **Thuddy impact** (`thudding_impact`): impact_play, pain_play
- **Stingy impact** (`stingy_impact`): impact_play, pain_play
- **Rhythmic impact** (`rhythmic_impact`): impact_play, pain_play
- **Punishment-themed impact roleplay** (`punishment_impact_roleplay`): impact_play, pain_play
- **Temporary marks from impact** (`impact_marks`): impact_play, pain_play
- **Rough sex** (`rough_sex_general`): rough_physical, power_exchange
- **Wrestling** (`wrestling`): rough_physical, power_exchange
- **Grappling / physical struggle** (`grappling`): rough_physical, power_exchange
- **Pinning / holding down** (`pinning`): rough_physical, power_exchange
- **Body-weight control** (`body_weight_control`): rough_physical, power_exchange
- **Chasing / pursuit roleplay** (`chasing_roleplay`): rough_physical, power_exchange
- **Primal-style struggle** (`primal_struggle`): rough_physical, power_exchange
- **Hair-based control** (`hair_control`): rough_physical, power_exchange
- **Face / jaw holding** (`face_holding`): rough_physical, power_exchange
- **Forceful but positioning** (`forceful_positioning`): rough_physical, power_exchange
- **Clothing grabbing** (`clothing_grabbing`): rough_physical, power_exchange
- **Wall pinning roleplay** (`wall_pin_roleplay`): rough_physical, power_exchange
- **Giving anal penetration** (`anal_penetration_giving`): sexual_activities, anal_play
- **Receiving anal penetration** (`anal_penetration_receiving`): sexual_activities, anal_play
- **Pegging** (`pegging`): sexual_activities, anal_play
- **Anal fisting** (`fisting_anal`): sexual_activities, anal_play
- **External anal touch** (`anal_touch`): anal_play, sexual_activities
- **Anal fingering** (`anal_fingering`): anal_play, sexual_activities
- **Anal toys** (`anal_toys`): anal_play, sexual_activities
- **Anal plugs** (`anal_plugs`): anal_play, sexual_activities
- **Anal-bead play** (`anal_beads`): anal_play, sexual_activities
- **Gradual anal-size progression as a preference** (`anal_training_progression`): anal_play, sexual_activities
- **Anal-focused worship / attention** (`anal_worship`): anal_play, sexual_activities
- **Anal-focused service roleplay** (`anal_service`): anal_play, sexual_activities
- **Enema-related fetish / play** (`enema_fetish`): anal_play, sexual_activities
- **Temporary chastity** (`temporary_chastity`): chastity, orgasm_control
- **Device-based chastity** (`device_chastity`): chastity, orgasm_control
- **Keyholder dynamic** (`keyholder_dynamic`): chastity, orgasm_control
- **Remote chastity control** (`remote_chastity_control`): chastity, orgasm_control, remote_digital
- **Longer-term chastity fantasy** (`long_term_chastity_fantasy`): chastity, orgasm_control
- **Chastity-related teasing** (`chastity_teasing`): chastity, orgasm_control
- **Verbal degradation** (`verbal_degradation`): humiliation_degradation, objectification
- **Degrading names** (`degrading_names`): humiliation_degradation, objectification
- **Mockery / ridicule** (`mockery`): humiliation_degradation, objectification
- **Embarrassment roleplay** (`embarrassment_roleplay`): humiliation_degradation, objectification
- **Sexual objectification** (`sexual_objectification`): humiliation_degradation, objectification
- **Being 'used' in roleplay** (`use_roleplay`): humiliation_degradation, objectification
- **Failure / punishment humiliation roleplay** (`failure_punishment_roleplay`): humiliation_degradation, objectification
- **Humiliating forced-choice roleplay within negotiated limits** (`forced_choice_roleplay`): humiliation_degradation, objectification
- **Appearance-focused humiliation by prior agreement** (`appearance_humiliation`): humiliation_degradation, objectification
- **Performance-focused humiliation** (`performance_humiliation`): humiliation_degradation, objectification
- **Exposure / embarrassment fantasy without involving nonconsenting observers** (`exposure_humiliation_fantasy`): humiliation_degradation, objectification
- **Humiliating service tasks** (`service_humiliation`): humiliation_degradation, objectification
- **Dehumanization roleplay** (`dehumanization_roleplay`): humiliation_degradation, objectification
- **Human-furniture roleplay** (`furniture_roleplay`): humiliation_degradation, objectification
- **Remote camera play** (`remote_camera_play`): exhibition_observation, remote_digital
- **Pet play** (`pet_play_general`): pet_primal, roleplay
- **Puppy play** (`puppy_play`): pet_primal, roleplay
- **Kitten play** (`kitten_play`): pet_primal, roleplay
- **Pony play** (`pony_play`): pet_primal, roleplay
- **Owner/pet dynamic** (`owner_pet_dynamic`): pet_primal, roleplay
- **Collar / leash pet-play symbolism** (`collar_leash_petplay`): pet_primal, roleplay
- **Training / commands in pet play** (`training_petplay`): pet_primal, roleplay
- **Pet-style service** (`pet_service`): pet_primal, roleplay
- **Primal play** (`primal_play`): pet_primal, roleplay
- **Hunter/prey roleplay** (`hunter_prey_roleplay`): pet_primal, roleplay
- **Chasing in primal play** (`chasing_primal`): pet_primal, roleplay
- **Wrestling in primal play** (`wrestling_primal`): pet_primal, roleplay
- **Biting in primal play** (`biting_primal`): pet_primal, roleplay
- **Animalistic vocalization / growling** (`growling_vocalization`): pet_primal, roleplay
- **Anticipation / suspense** (`anticipation`): psychological_play, power_exchange
- **Surprise within negotiated limits** (`surprise_within_limits`): psychological_play, power_exchange
- **Fear-based roleplay** (`fear_roleplay`): psychological_play, power_exchange
- **Interrogation dynamics** (`interrogation_psych`): psychological_play, power_exchange
- **Mind games** (`mind_games`): psychological_play, power_exchange
- **Difficult-choice dynamics** (`difficult_choices`): psychological_play, power_exchange
- **Behavioral conditioning** (`behavioral_conditioning`): psychological_play, power_exchange
- **Ritualized psychological control** (`ritualized_control`): psychological_play, power_exchange
- **Attention / focus control** (`attention_control`): psychological_play, power_exchange
- **Being made to wait** (`waiting_suspense`): psychological_play, power_exchange
- **Negotiated uncertainty** (`uncertainty_within_limits`): psychological_play, power_exchange
- **Testing obedience** (`testing_obedience`): psychological_play, power_exchange
- **Bratting / playful disobedience** (`bratting`): psychological_play, power_exchange
- **Brat-taming dynamic** (`brat_taming`): psychological_play, power_exchange
- **Challenge / competition dynamic** (`challenge_competition`): psychological_play, power_exchange
- **Psychological teasing** (`teasing_psychological`): psychological_play, power_exchange
- **Possession fantasy** (`possession_fantasy`): psychological_play, power_exchange
- **Jealousy play** (`jealousy_play`): psychological_play, power_exchange
- **Embarrassment as psychological play** (`embarrassment_psych`): psychological_play, power_exchange
- **Confession / disclosure roleplay** (`confession_roleplay`): psychological_play, power_exchange
- **Bedroom-only D/s** (`bedroom_only_ds`): relationship_dynamics, power_exchange
- **Scene-only D/s** (`scene_only_ds`): relationship_dynamics, power_exchange
- **Ongoing D/s relationship** (`ongoing_ds`): relationship_dynamics, power_exchange
- **Total-power-exchange fantasy / highly structured dynamic** (`total_power_exchange_fantasy`): relationship_dynamics, power_exchange
- **Domestic-discipline dynamic** (`domestic_discipline`): relationship_dynamics, power_exchange
- **Protocol-heavy relationship** (`protocol_relationship`): relationship_dynamics, power_exchange
- **Collared relationship** (`collared_relationship`): relationship_dynamics, power_exchange
- **Service-oriented relationship** (`service_relationship`): relationship_dynamics, power_exchange
- **Mentor/training-style adult dynamic** (`mentor_training_dynamic`): relationship_dynamics, power_exchange
- **Adult nurturing/caretaking dominance** (`caregiver_style_adult_dynamic`): relationship_dynamics, power_exchange
- **Gentle dominance** (`gentle_dominance`): relationship_dynamics, power_exchange
- **Strict dominance** (`strict_dominance`): relationship_dynamics, power_exchange
- **Sadistic dominance** (`sadistic_dominance`): relationship_dynamics, power_exchange
- **Playful dominance** (`playful_dominance`): relationship_dynamics, power_exchange
- **Obedient submission** (`obedient_submission`): relationship_dynamics, power_exchange
- **Service submission** (`service_submission_style`): relationship_dynamics, power_exchange
- **Masochistic submission** (`masochistic_submission`): relationship_dynamics, power_exchange
- **Bratty submission** (`bratty_submission`): relationship_dynamics, power_exchange
- **Psychological surrender** (`psychological_submission`): relationship_dynamics, power_exchange
- **Sexual submission** (`sexual_submission`): relationship_dynamics, power_exchange
- **Written rules / negotiated contracts** (`formal_contracts`): relationship_dynamics, power_exchange
- **Daily assigned tasks** (`daily_tasks`): relationship_dynamics, power_exchange
- **Regular check-ins / reporting** (`check_ins`): relationship_dynamics, power_exchange
- **Negotiated relationship permissions** (`relationship_permissions`): relationship_dynamics, power_exchange
- **Financial domination / financial-control fantasy** (`financial_domination`): relationship_dynamics, power_exchange
- **Video-call play** (`video_call_play`): remote_digital, exhibition_observation
- **Remote orgasm control** (`remote_orgasm_control`): remote_digital, orgasm_control
- **Remote chastity dynamic** (`remote_chastity_dynamic`): remote_digital, chastity
- **Private photo exchange** (`photo_exchange_private`): remote_digital, exhibition_observation
- **Private video exchange** (`video_exchange_private`): remote_digital, exhibition_observation
- **Remote observation** (`remote_observation`): remote_digital, exhibition_observation
- **App-controlled toy play** (`app_controlled_toys`): remote_digital, toys_devices
- **Size-difference fantasy** (`size_difference_fantasy`): fantasy_transform, roleplay
- **Giant / tiny fantasy** (`giant_tiny_fantasy`): fantasy_transform, roleplay
- **Transformation fantasy** (`transformation_fantasy`): fantasy_transform, roleplay
- **Body-swap fantasy** (`body_swap_fantasy`): fantasy_transform, roleplay
- **Gender-expression roleplay between adults** (`gender_expression_roleplay`): fantasy_transform, roleplay
- **Costume / alternate-identity roleplay** (`costume_identity_roleplay`): fantasy_transform, roleplay
- **Doll-transformation fantasy** (`doll_transformation_fantasy`): fantasy_transform, roleplay
- **Robot / programming fantasy** (`robot_transformation_fantasy`): fantasy_transform, roleplay
- **Fictional monster transformation fantasy** (`monster_transformation_fantasy`): fantasy_transform, roleplay
- **Fictional nonhuman-character fantasy** (`nonhuman_character_fantasy`): fantasy_transform, roleplay
- **Magical-control fantasy** (`magical_control_fantasy`): fantasy_transform, roleplay
- **Hypnosis fantasy** (`hypnosis_fantasy`): fantasy_transform, roleplay
- **Breeding / fertility fantasy** (`breeding_fantasy`): fantasy_transform, roleplay
- **Pregnancy-related fantasy** (`pregnancy_fantasy`): fantasy_transform, roleplay
- **Ownership fantasy** (`ownership_fantasy`): fantasy_transform, roleplay
- **Public-use fantasy without nonconsenting participants** (`public_use_fantasy`): fantasy_transform, roleplay
- **Anonymous-use fantasy in an imagined adult setting** (`anonymous_use_fantasy`): fantasy_transform, roleplay
- **Rimming / oral-anal play** (`rimming`): anal_play, sexual_activities
- **Prostate-focused play** (`prostate_focused_play`): anal_play, sexual_activities
- **Chest / breast-focused nonpenetrative sex** (`chest_breast_nonpenetrative_sex`): sexual_activities, body_part_fetishes
- **Prostate-focused toys** (`prostate_toys`): toys_devices, anal_play
- **Honor-system / non-device chastity** (`honor_system_chastity`): chastity, orgasm_control
- **Self-directed chastity** (`self_directed_chastity`): chastity, orgasm_control
- **Conditioned-orgasm fantasy / training** (`conditioned_orgasm`): orgasm_control, psychological_play
- **Adult caregiver/little-style dynamic** (`caregiver_little_adult_dynamic`): relationship_dynamics, roleplay
- **Pre-negotiated sleep / unconsciousness fantasy** (`negotiated_sleep_vulnerability_fantasy`): roleplay, fantasy_transform
- **Erotic hypnosis as an activity** (`erotic_hypnosis_activity`): psychological_play, roleplay, fantasy_transform
- **Consensual blackmail / coercion fantasy** (`consensual_blackmail_fantasy`): psychological_play, roleplay
- **24/7 D/s dynamic** (`twenty_four_seven_ds`): relationship_dynamics, power_exchange
- **Negotiated availability / “free-use” fantasy** (`negotiated_availability_free_use_fantasy`): relationship_dynamics, fantasy_transform, power_exchange
- **Gender-transformation fantasy** (`gender_transformation_fantasy`): fantasy_transform, roleplay

## Duplicate and near-duplicate labels

No exact normalized duplicate-label groups detected.
- Near (1): Suspiciously similar concept labels: “A partner watching” / “Watching a partner”.
- Near (0.9167): Suspiciously similar concept labels: “Foot worship” / “Boot worship”.

## Definitions and descriptions

- Definition-eligible concepts (branch-gate compatibility markers excluded): **562**
- Substantive definitions: **562**
- Missing/non-substantive definitions: **0**
- Boilerplate descriptions: **0**
- Editorial model: **1.0.0**; Plan 08 additions: **40 concepts**.

## Risk metadata

Plan 07 uses descriptive concern domains rather than a one-dimensional severity label. A concept can carry more than one domain, and the domain controls high-level/non-procedural negotiation prompts.

| Risk domain | Concepts |
|---|---:|
| Consent complexity (`consent_complexity`) | 251 |
| Digital security considerations (`digital_security`) | 17 |
| Financial considerations (`financial`) | 2 |
| Medical / health considerations (`medical`) | 51 |
| Physical considerations (`physical`) | 220 |
| Privacy considerations (`privacy`) | 49 |
| Psychological / emotional considerations (`psychological`) | 212 |
| Reputational / social considerations (`reputational`) | 24 |

Concepts with one or more risk domains: **462/594**.

## Negotiation, privacy, and care profile

Storage: `negotiationPreferences` · score contribution: **none** · results treatment: **separate_descriptive_profile**.

- **Communication & negotiation** (`communication`): Preferred communication approaches
- **Stop & check-in communication** (`stop_checkin`): Preferred stop / check-in methods
- **Aftercare & recovery** (`aftercare`): Aftercare preferences
- **Marks & visible after-effects** (`marks`): General marks preference, Location restrictions, Duration concerns
- **Privacy, recording & sharing** (`privacy`): Photos / video, Identification, Storage constraints, Sharing constraints, Deletion expectations
- **Partner & context familiarity** (`partner_context`): Potentially acceptable contexts
- **About you** (`personal_profile`): How do you describe your gender?, Which anatomy or body parts apply to you?
- **Who interests you** (`attraction_profile`): Which genders are you generally interested in?, Which gender expressions tend to appeal to you?, Which anatomy or body parts are generally relevant to your attraction or compatibility?, Which body features especially catch your interest?

## Category gates and branching

Category routing records use **categoryGates** storage and contribute **none** to preference scoring.
Legacy branch-gate markers retained for import compatibility: **32/32**.
Child-of relationships: **562**.
Plan 05 category gates route navigation only. Category-wide hard limits are stored separately from concept answers, while Skip remains unanswered.

## Scoring diagnostics

Plan 06 aggregates perspective responses within each concept before category aggregation. Every contributing concept therefore has the same default category weight, regardless of perspective count. Hard limits and category gates are excluded from preference averages.

| Category | Concepts | Perspective records | Multi-perspective overweight anomalies |
|---|---:|---:|---:|
| Power exchange | 26 | 42 | 0 |
| Service & protocol | 15 | 28 | 0 |
| Bondage & restraint | 28 | 56 | 0 |
| Rope bondage | 12 | 24 | 0 |
| Sensory deprivation & control | 11 | 22 | 0 |
| Impact play | 13 | 26 | 0 |
| Pain play | 15 | 30 | 0 |
| Sensation play | 15 | 30 | 0 |
| Rough / physical play | 12 | 24 | 0 |
| Sexual activities | 20 | 36 | 0 |
| Anal play | 11 | 23 | 0 |
| Toys & devices | 18 | 39 | 0 |
| Orgasm control | 16 | 32 | 0 |
| Chastity | 8 | 15 | 0 |
| Humiliation & degradation | 14 | 28 | 0 |
| Praise, worship & adoration | 13 | 26 | 0 |
| Objectification & dollification | 11 | 22 | 0 |
| Exhibitionism & observation | 12 | 14 | 0 |
| Multi-partner / partner-sharing | 14 | 14 | 0 |
| Roleplay | 26 | 27 | 0 |
| Pet play & primal play | 14 | 28 | 0 |
| Medical-themed & higher-risk edge play | 15 | 30 | 0 |
| Materials & clothing fetishes | 28 | 84 | 0 |
| Body-part fetishes | 35 | 105 | 0 |
| Fluids & messy play | 12 | 36 | 0 |
| Sensory & body-sensation fetishes | 14 | 42 | 0 |
| Psychological play | 23 | 44 | 0 |
| Emotions & arousal states | 42 | 84 | 0 |
| Relationship-oriented dynamics | 28 | 46 | 0 |
| Remote / digital dynamics | 12 | 36 | 0 |
| Fantasy / transformation themes | 18 | 18 | 0 |
| Sexual context & locations | 11 | 11 | 0 |

Results model: **2.0.0** · weighting: **equal_concept** · primary output uses qualitative labels: **yes**.


## Validation findings

Fatal errors: **0**. Editorial warnings: **2**.

| Class | Errors | Warnings |
|---|---:|---:|
| `NEAR_DUPLICATE_LABEL` | 0 | 2 |

See `docs/catalog-validation.md` for the meaning and severity of every validation class. The complete machine-readable finding list is in `reports/catalog-audit.json`.

