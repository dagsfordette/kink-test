# Plan 07 — Negotiation, Risk, Privacy, and Care

## Scope

Plan 07 adds two independent layers to the questionnaire:

1. A **general negotiation/preferences profile** for communication, stopping/check-ins, aftercare, marks, privacy/media handling, and partner/context familiarity.
2. **Descriptive risk-domain metadata** on concepts, with high-level prompts tied to the type of concern rather than a generic severity label.

Neither layer changes the Plan 06 concept/category/domain interest aggregation.

## General negotiation/preferences profile

The profile is stored under the top-level `negotiationPreferences` state key and is described by `catalog.negotiationPreferencesModel`.

It contains six sections:

- `communication` — verbal discussion, written discussion/checklists, detailed pre-negotiation, in-the-moment check-ins, and minimal interruption after negotiation.
- `stop_checkin` — safeword, traffic-light system, ordinary language, non-verbal signals, and context-dependent methods.
- `aftercare` — physical closeness, reassurance, water/food, quiet, space alone, conversation, later check-in, or no special aftercare.
- `marks` — no-visible-marks vs temporary-marks preferences plus location and duration concerns.
- `privacy` — photo/video preference, identification/face visibility, storage constraints, sharing constraints, and deletion expectations.
- `partner_context` — trusted partner, established partner, casual partner, context dependent, or fantasy only.

These fields are general defaults only. Concept-specific boundaries and conditions remain more specific and are never overwritten by a general preference.

### Storage and export

`negotiationPreferences` is persisted next to `answers` and `categoryGates` in local browser storage. JSON export schema 1.7.0 includes it as its own top-level object. Import normalizes known option IDs without rewriting concept answers.

### Results

`buildResults(catalog, answers, categoryGates, negotiationPreferences)` returns a separate `negotiationPreferences` summary. It is displayed near the top of the Results view and in the print/PDF report. `negotiationPreferencesModel.scoreContribution` is explicitly `none`.

## Risk domains

Plan 07 removes `riskLevel` from every concept and adds `riskDomains`, an array that may contain zero or more of:

- `physical`
- `medical`
- `psychological`
- `consent_complexity`
- `privacy`
- `digital_security`
- `reputational`
- `financial`

A domain means only that the topic may be relevant to negotiation or care. It is **not** a moral label, diagnostic claim, psychometric score, or severity ranking.

The migration is documented in `reports/risk-and-negotiation-migration.json`. The legacy catalog contained 423 `standard`, 97 `elevated`, and 34 `high` labels. Those labels are not preserved as hidden severity scores; concepts are reassigned to descriptive concern domains based on their category/content semantics.

## Risk prompt mapping

`catalog.riskPromptMap` maps each domain to one or more entries in `catalog.riskPrompts`. Every prompt declares `instructionLevel: high_level_non_procedural`.

Examples of the intended behavior:

- Digital/recording concepts surface storage, screenshots, identification, device/account access, redistribution, and deletion expectations.
- Financial dynamics surface explicit financial-limit and boundary prompts.
- Consent-complex scenarios emphasize prior negotiation and a mutually understood way to pause/check in/stop.
- Physical/medical concerns suggest that relevant knowledge, precautions, or professional guidance may matter without describing how to carry out an activity.

The concept card renders these prompts inside an optional expandable **Negotiation & care considerations** panel. The UI no longer shows generic “Higher risk” or “Extra care” badges.

## Compatibility

Plan 07 preserves:

- all 554 canonical concept IDs,
- all 32 category IDs,
- all 8 domain IDs,
- canonical category ownership and related-category placement,
- Quick/Standard/Exhaustive concept lists,
- category-gate behavior,
- adaptive-detail behavior,
- Plan 06 equal-concept scoring.

The legacy `riskLevel` field is intentionally removed because retaining it would continue the one-dimensional model Plan 07 replaces.

## Verification

Dedicated tests confirm that:

- required negotiation sections/options exist,
- privacy, marks, and aftercare survive into result summaries,
- negotiation preferences do not change scoring,
- every concept uses valid `riskDomains` and no concept retains `riskLevel`,
- digital/media, financial, consent-complexity, and physical/medical examples receive domain-appropriate prompts,
- all prompts are explicitly high-level/non-procedural,
- validator drift in either the negotiation model or risk prompt mapping is fatal.
