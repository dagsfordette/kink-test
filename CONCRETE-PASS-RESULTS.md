# Concrete wording pass: results

Reviewed all 1,000 activities individually across all 33 categories. The body-area category has no catalog cards and remains a body-paint interface.

Compared with the previous delivery:

- 438 descriptions rewritten, 2 added, and 114 removed.
- 446 entries retained after an explicit decision for each.
- 318 descriptions are now blank. Most have clear, self-explanatory titles; 12 are listed below as intentionally broad or needing clarification.
- All 682 nonempty descriptions are no longer than 24 words. No exact duplicate descriptions remain. These checks support consistency, not a claim of perfect wording.

## What changed

- Pain now says what happens: pinching, biting, squeezing, or pressure.
- Speech rules name staying quiet, asking before speaking, or answering a question.
- Worship names looking, complimenting, touching, kissing, or massaging.
- Sensory interests name smelling, listening, wearing, touching, or moving a material against skin.
- Rules and ongoing arrangements use examples such as check-ins, forms of address, tasks, or permission requests.
- Repetitive descriptions were removed from clear titles, including vibration and many clothing-wearing or watching entries.
- Some subjects are underdefined in the catalog. Their descriptions were removed or retained with a recorded question rather than expanded with a guessed meaning.

## Verification

Only activity description values changed in the catalog. IDs, titles, ordering, categories, relationships, roles, filtering rules, and answer structures match the previous delivery. No UI or styling changes were made.

All 34 existing tests passed. Catalog validation passed for 1,000 activities, 193 fantasy questions, and 38 routing topics. Production build passed with the existing large-bundle warning. All 33 cumulative checkpoint ZIPs were checked for archive integrity and their exact catalog contents. Browser appearance and interaction were not checked in this text-only pass.

## Clarifications and intentionally broad entries

These are reviewed entries, not silently completed definitions. Their current descriptions are shown so it is clear which questions remain.

### Making my partner wet during sexual or kink activity

ID: `give_wetness_fetish`

Does “wet” mean arousal-related wetness, water, fluids, or some other contact?

Current description: [Blank]

### Having my partner make me wet during sexual or kink activity

ID: `receive_wetness_fetish`

Which source of wetness and which action does this cover?

Current description: [Blank]

### Using wetness as a shared focus during sexual or kink activity

ID: `mutual_wetness_fetish`

Which shared actions and sources of wetness are intended?

Current description: [Blank]

### Making vehicles a focus during sexual or kink activity

ID: `vehicle_fetish`

The catalog gives an object of interest but not a physical activity. Is this an appearance interest, handling, location, or something else?

Current description: [Blank]

### Making statues a focus during sexual or kink activity

ID: `statue_fetish`

The catalog does not specify what participants actually do with or around a statue.

Current description: [Blank]

### Making plants or nature a focus during sexual or kink activity

ID: `plant_nature_erotic_focus`

The catalog does not specify whether this concerns setting, appearance, scent, touch, or another activity.

Current description: [Blank]

### Making another specific object a focus during sexual or kink activity

ID: `other_object_fetish`

An intentionally broad catch-all; the person would need to specify the object and its use.

Current description: [Blank]

### Using feces with my partner as part of sexual or kink play

ID: `give_feces_fetish`

The substance is named, but the intended acts and source are not established.

Current description: [Blank]

### Having feces used with me as part of sexual or kink play

ID: `receive_feces_fetish`

The substance is named, but the intended contact or receiving action is not established.

Current description: [Blank]

### Using feces together as part of sexual or kink play

ID: `mutual_feces_fetish`

The substance is named, but the shared activity is not established.

Current description: [Blank]

### Vomit play or vomit fetish

ID: `vomit_play`

The label does not establish the intended act or whether it concerns observing, producing, or handling.

Current description: [Blank]

### My partner having sexual contact with others while I stay informed or involved

ID: `compersion_play`

The visible title describes involvement in partner sharing without requiring positive feelings; decide whether the internal term or scope should change.

Current description: [Blank]

### Age-difference roleplay

ID: `adult_age_difference_roleplay`

The portrayed ages are unspecified. Existing text was retained rather than inventing age-specific scenarios.

Current description: Acting out a fictional age difference between the roles.

### Age-play roleplay

ID: `adult_age_play_roleplay`

The portrayed ages are unspecified. Existing text was retained rather than inventing age-specific scenarios.

Current description: Acting as a different age or using an age-based role.

### Teacher-and-student roleplay

ID: `teacher_student_adult_roleplay`

The educational setting and portrayed ages are unspecified. Existing wording retained.

Current description: Acting as a teacher and student in a fictional scenario.

### Taking the caregiver role in an ongoing caregiver/little relationship

ID: `direct_caregiver_little_adult_dynamic`

The intended difference from the separate nurturing-care authority entry remains unclear. Existing wording retained.

Current description: Providing reassurance, routines, rules, or caretaking while taking the caregiver role in an ongoing caregiver/little relationship.

### Taking the little role in an ongoing caregiver/little relationship

ID: `follow_caregiver_little_adult_dynamic`

The intended difference from receiving nurturing-care authority remains unclear. Existing wording retained.

Current description: Receiving reassurance, routines, rules, or caretaking while taking the little role in an ongoing caregiver/little relationship.

## Packaging

The final source ZIP includes all updates. Each numbered ZIP contains the full source after that category’s review, including earlier categories. Verification wording corrections appear from their applicable category onward.
