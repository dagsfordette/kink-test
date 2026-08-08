## Qualifier audit cleanup — 2026-08-08

- Implemented the 412-question qualifier/subquestion audit across the adaptive detail system.
- Added concept-scoped fields/options and conditional option visibility so shared profiles can stay reusable without leaking sibling questions into leaf concepts.
- Reworked power/service, bondage/rope/sensory control, impact/pain/rough play, sexual activity/device, anal, orgasm/chastity, humiliation/objectification, observation, multi-partner, psychological, relationship, remote/digital, roleplay, pet/primal, fantasy, body-feature, sensory-fetish, and sexual-setting qualifiers.
- Added physical privacy/location to sexual activities/devices and recording/storage/access qualifiers for private media and remote interactions.
- Replaced the former free-text-only praise/worship, medical/edge, and fluids/mess follow-ups with structured qualifiers while retaining optional notes.
- Added a regression suite that parses the complete audit and verifies all 412 flagged concepts retain at least two structured, concept-relevant qualifiers.

## Profile-first restructuring patch — 2026-08-08

- Reordered onboarding to: landing page → profile → negotiation/privacy/care → main inventory.
- Added an explicit personal profile for gender and anatomy, kept separate so gender never implies body configuration.
- Expanded the profile with general partner gender, gender-expression, anatomy, and body-feature preferences.
- Added conservative profile pruning for clearly anatomy-specific concept perspectives, while keeping prior answers visible and offering a “Show filtered questions” override.
- Added dedicated profile-pruning regression tests and kept profile data outside interest scoring.

## UI refinement patch — 2026-08-08

- Simplified the questionnaire UI and removed internal semantic/taxonomy badges from user-facing cards and reports.
- Added the two-step pre-question setup framework for profile and negotiation/privacy/care preferences.
- Reworded category prompts in plain language and removed depth/routing implementation terminology from the main test UI.
- Added a safe “Yes to all shown” bulk action that only fills unanswered items.
- Made optional follow-up prompts more specific to the individual concept.
- Restored a prominent Soft limit choice at concept level by showing boundaries as chips.
- Fixed card-header badge wrapping/overlap and reduced visual noise across detail and negotiation sections.

# Changelog

## 0.4.2 — Plan 09: User Testing, Compatibility, and Release Process

- Added a structured adult user-testing protocol and findings template covering comprehension, scale clarity, adaptive branching, exhaustiveness, repetition, fatigue, and result/comparison interpretation.
- Added an optional local-only partner comparison on Results using named interaction states rather than a single compatibility percentage.
- Added directional pairing, fantasy/real-world mismatch, conditional match, insufficient-data, and hard-limit-conflict semantics; category, concept, and matching subtype hard limits take precedence.
- Added eight synthetic regression personas: broad enthusiast, mostly conventional, fantasy-heavy/reality-light, dominant giver, submissive receiver, switch, many hard limits, and highly conditional.
- Centralized versioned JSON response creation/import normalization in `responseFormat.js` and added explicit migration tests.
- Added structural branching evidence showing default suppression of irrelevant descendant detail while retaining manual override and fantasy-relevant refinement.
- Added print/export regression tests, release-process tests, a release checklist, and a version/migration policy.
- Added `release:verify` and `release:check`; GitHub Pages deployment now uses the same full release gate before deployment.

## 0.4.1 — Plan 08: Content Expansion and Editorial Quality

- Added 40 new canonical concepts across sexual/anal activity, impact, toys/devices, chastity, orgasm control, roleplay, psychological play, body-part interests, materials/clothing, emotions, relationship dynamics, and transformation fantasy.
- Added `remote_toy` and `transformation_fantasy` adaptive detail profiles instead of duplicating wearable/remote-toy and broad transformation permutations.
- Kept the entire Plan 07 Quick catalog unchanged; common additions enter Standard and all additions are discoverable in Exhaustive for every canonical placement.
- Retired the generic `Neutral adult self-assessment item covering …` description pattern and rewrote 480 existing descriptions.
- Added plain-language definitions for specialist terminology including compersion, predicament bondage, dollification, brat-taming, ruined orgasm, primal play, protocol, service submission, objectification, CNC, mummification, edging, chastity, and urethral sounding.
- Normalized/disambiguated 31 existing labels, eliminating exact duplicate-label groups and capitalization warnings.
- Added a project-wide editorial style guide, approved content-gap review, definition-coverage report, migration report, Plan 08 validator rules, and dedicated regression tests.
- Preserved all 554 pre-existing concept IDs in original order, plus all 32 category IDs, 8 domain IDs, and existing answer identities.

## 0.4.0 — Plan 07: Negotiation, Risk, Privacy, and Care

- Added a first-class general negotiation/preferences section covering communication, stop/check-in methods, aftercare, marks, privacy/recording, and partner/context familiarity.
- Stored the general profile under dedicated `negotiationPreferences` state; it contributes no interest score and is exported/imported separately from concept answers and category gates.
- Added prominent negotiation/privacy/care summaries to on-screen results and the print/PDF report.
- Replaced every concept's one-dimensional `riskLevel` with multi-valued descriptive `riskDomains` metadata.
- Added eight risk domains: physical, medical, psychological, consent complexity, privacy, digital security, reputational, and financial.
- Added domain-specific, high-level/non-procedural prompts for physical/medical precautions, consent complexity, recording/privacy handling, digital storage/screenshots/identification/redistribution, reputational exposure, and explicit financial limits.
- Added a machine-readable migration report from the legacy 423 standard / 97 elevated / 34 high labels to descriptive domains without treating domain assignment as severity.
- Added Plan 07 validator rules, audit coverage, result/scoring regression checks, and dedicated negotiation/risk tests.

## 0.3.9 — Plan 06: Scoring, Results, and Boundary Semantics

- Replaced perspective-record category weighting with perspective → concept → category → domain aggregation.
- Each canonical concept now contributes at most one value per result dimension to its primary category, preventing multi-perspective concepts from receiving automatic extra weight.
- Kept perspective-level rows visible and added explicit perspective/asymmetry sub-results.
- Separated fantasy interest, real-world desire, experienced preference, experience, willingness, conditions, and boundaries instead of collapsing them into one master score.
- Kept concept, adaptive-detail/subtype, and category-wide hard limits outside preference averages and surfaced them in separate result sections.
- Added fantasy-only interests, curiosities/openness, conditional interests, common conditional refinements, and insufficient-data sections.
- Replaced primary numeric interest percentages with qualitative labels while retaining a documented internal linear index only for compatibility/visual positioning.
- Added non-destructive result-time normalization for legacy willingness values.
- Updated the print/PDF report, catalog results-model schema, validator/audit diagnostics, migration report, and controlled Plan 06 regression tests.

## 0.3.8 — Plan 05: Depth Modes and Category Gates

- Replaced positional `slice(0, N)` depth behavior with explicit per-category Quick, Standard, and Exhaustive concept catalogs.
- Curated Quick representatives across all 32 categories, including the Plan 05 priority fixes for power exchange, bondage, impact, anal, toys, and higher-risk/medical material.
- Removed the fourth Detailed mode from the UI; legacy `detailed` settings/imports normalize to Standard.
- Replaced category mini-questionnaires with five routing states: Interested, Maybe / unsure, Not interested, Hard limit for this area, and Skip for now.
- Added dedicated `categoryGates` storage; gate records no longer share the concept-answer map or contribute to preference scores.
- Added category-scoped hard-limit boundaries and separate category hard-limit reporting.
- Added manual category browsing and per-category Exhaustive override without mutating the selected global mode or routing state.
- Added migration for legacy `categoryId::overall` gate records.
- Added Plan 05 validator rules, deterministic audit coverage, migration report, and depth/gate regression tests.

## v0.3.7 — Dynamic detail question system

- Added a formal adaptive-detail schema with reusable detail primitives, explicit parent states, and five independent subtype response states: appealing, acceptable, conditional, not interested, and hard limit.
- Added deterministic branch activation for interested/open/unsure/fantasy-only/not-interested/hard-limit states.
- Added manual per-concept branch expansion without changing or deleting the parent answer.
- Added fantasy-only field filtering so real-world implementation details can be suppressed while fantasy-relevant details remain available.
- Added the `preference_matrix` detail control and legacy-array compatibility.
- Migrated high-value impact, bondage, body-part, material, roleplay, emotion, and sexual-activity profiles while keeping genuinely distinct interests as first-class concepts.
- Rebound 28 body-part concepts and 22 material concepts to semantic-specific detail profiles without changing canonical IDs or answer keys.
- Preserved previous impact detail fields as compatibility-only fields when prior saved data exists.
- Added Plan 04 schema validation, migration reporting, adaptive regression tests, and audit diagnostics; scoring remains unchanged.

## v0.3.6 — Semantic question model

- Expanded the semantic registry to Plan 03 types including role, fantasy, body part, material, setting, relationship dynamic, device, and communication preference.
- Reclassified 160 existing concepts without changing canonical IDs, category ownership, or answer keys.
- Added an authoritative type-to-question-dimension mapping and explicit `questionModel.template` on every concept.
- Separated fantasy appeal, real-world desire, experience, willingness/openness, and boundary in the renderer.
- Added an explicit **Fantasy only** willingness stance and replaced **No limit** with **No special boundary**.
- Suppressed physical-experience questions for impossible fantasies and activity-shaped experience questions for stimulus/body-part/material concepts.
- Preserved legacy willingness values without silently rewriting them.
- Added semantic schema validation, migration reporting, and focused regression tests; scoring remains unchanged.

## v0.3.5 — Taxonomy and information architecture

- Added eight top-level navigation domains while preserving all 32 detailed category IDs.
- Added explicit canonical ownership metadata to all 554 concepts: `canonicalId`, `primaryCategory`, `relatedCategories`, `domain`, and `semanticTags`.
- Updated desktop/mobile navigation to Domain → Category → Concept/details.
- Cross-listed concepts now appear in related categories while reading/writing the same canonical answer keys.
- Added curated Remote/Digital ↔ Exhibition/Observation and other cross-navigation references.
- Added taxonomy validation/tests, an overlap review, and a machine-readable no-ID-change migration map.
- Scoring and question dimensions remain unchanged.

## v0.3.4 — Structural audit and catalog validation

- Added a one-command deterministic catalog audit with JSON and Markdown baseline reports.
- Added fatal schema/reference validation plus non-fatal editorial warnings.
- Added duplicate/near-duplicate label, definition, detail-profile, risk metadata, branch, and category-gate diagnostics.
- Added scoring diagnostics that expose current perspective-record weighting without changing the scoring algorithm.
- Added Node-based validator tests and documentation for every warning/error class.

## v0.3.3 — Semantic concept types + body/anatomy model

- Added first-class semantic types: **activity, dynamic, emotion, motivation, stimulus, context**.
- Assigned a semantic type to every concept and category.
- Renderer wording now follows semantic meaning: activities can be “done”, dynamics can be “wanted/explored”, stimuli can be “sought out”, and contexts can be “chosen”.
- Detail profiles declare `appliesToSemanticTypes`, preventing mismatched generic follow-ups.
- Body/anatomy compatibility is now a reusable follow-up family limited to explicitly bound activities and stimuli.
- Added separate partner gender, gender expression, anatomy, body-build, relative-height, body-hair, grooming, and body-feature preference fields.
- Motivation exists in the schema but defaults to `directQuestioning: false`, preserving it for future inference rather than demanding self-analysis.
- Results and PDF output now include a semantic-layer view in addition to category scores.
- Added `SEMANTIC_MODEL.md` documenting the model.

## v0.3.1 — Consent wording cleanup

- Consent is now stated once as a global premise of the adult inventory rather than repeated throughout ordinary activity names.
- Removed redundant phrases such as “consensual rough sex”, “consensual group sex”, and “with a consenting partner”.
- Kept explicit consent wording only where it disambiguates the concept, especially consensual non-consent (CNC), recording/observation, and fantasies that could otherwise imply involving unsuspecting bystanders.
- Simplified emotion wording from “consensually evoking” to more natural language such as “bringing out” a reaction in a partner.
- Internal IDs remain stable, so existing v0.3 response data can still map to the same concepts.

## 0.3.0

- Merged **Giving oral sex** and **Receiving oral sex** into a single **Oral sex** concept with **Giving** and **Receiving** perspectives.
- Added perspective-specific detail profiles, so one concept can ask different follow-up questions depending on the selected perspective.
- Added a new **Emotions & arousal states** category with 38 emotional turn-on concepts.
- Emotional items distinguish **Feeling it** from **Seeing / evoking it** in a consenting partner.
- Added emotional follow-up questions for triggers, erotic meaning, emotional blends, intentional vs spontaneous reactions, and partner-response appeal.
- Concept cards now respect per-concept dimension settings, allowing semantically awkward controls such as boundary/willingness to be omitted where appropriate.
- Emotional items use custom wording such as **Does this emotional state turn you on?** and **Experienced erotically**.
- Added automatic migration of local v2 oral-sex answers into the merged v3 concept.

## 0.2.0

- Reworked generic detail matrices into question-specific semantic detail profiles.
- Fixed dominance/submission role modeling.
- Added inline adaptive follow-ups and revised willingness/boundary UI.
- Added a sexual context / locations category.
