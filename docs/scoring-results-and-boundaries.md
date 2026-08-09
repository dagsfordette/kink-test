# Plan 06 — Scoring, Results, and Boundary Semantics

## Purpose

Plan 06 makes result aggregation concept-aware and keeps distinct psychological/behavioral dimensions separate. It does not treat the exploration as a validated psychometric instrument or compatibility score.

## Aggregation order

For each result dimension, the default aggregation order is:

1. **Perspective** — score the explicit answer for Giving, Receiving, Mutual, Self, Observing, or another semantic perspective.
2. **Concept** — average the answered perspective values for that canonical concept.
3. **Category** — average canonical concept values belonging to the category's `primaryCategory`.
4. **Domain** — summarize category-level values for the navigation domain.

This means a concept with two answered perspectives has one concept-level contribution to its category, not two. Cross-listings do not create additional score ownership.

## Result dimensions

The result engine keeps these dimensions separate:

- **Fantasy interest** — from `answer.preference.fantasy` on the -2..2 preference scale.
- **Real-world interest** — from `answer.preference.realWorld` using strongly want / want / unsure / prefer not / do not want mapped to +2..-2.
- **Experienced preference** — from `answer.preference.experienced` when that dimension is meaningful.
- **Experience** — whether the user has tried the concept/perspective; this is counted, not folded into an interest average.
- **Willingness** — categorical state such as actively want, open to it, fantasy only, not interested, or hard limit.
- **Perspective** — retained as visible sub-results and asymmetry detection.
- **Conditions** — concept conditional/soft boundaries plus adaptive-detail subtype states explicitly marked `conditional`.
- **Boundaries** — concept hard limits, detail/subtype hard limits, and category-wide hard limits are separate result records.

There is intentionally no single master score that combines all of these dimensions.

## Hard limits and other non-interest states

Hard limits are never assigned a negative preference value. If a user records both a positive fantasy preference and a hard limit, the fantasy preference remains what they explicitly answered while the hard limit appears in the boundary sections and the item is excluded from "strong interests" presentation.

These states remain distinct:

- hard limit,
- conditional / soft limit,
- not interested,
- fantasy only,
- skipped category,
- unanswered.

A category-wide hard limit from `categoryGates` is displayed separately and does not change concept interest aggregation.

## Qualitative labels and the compatibility index

The UI and print report use qualitative labels instead of presenting a percentage as psychometric precision:

| Average on -2..2 scale | Label |
|---:|---|
| 1.5 to 2.0 | Strong interest |
| 0.5 to <1.5 | Moderate interest |
| >-0.5 to <0.5 | Mixed / neutral |
| >-1.5 to -0.5 | Mostly not interested |
| -2.0 to -1.5 | Strong disinterest |
| no scored concepts | Insufficient data |

For compatibility and visual positioning only, the result object retains an internal index:

`round(((average + 2) / 4) * 100)`

This index is a linear transform of the answer scale. It is **not** a probability, percentile, compatibility percentage, diagnostic score, or validated psychometric measure, and Plan 06 does not show it as the primary result.

## Result sections

The Results view and print/PDF report now surface:

- category and domain qualitative summaries,
- perspective sub-results,
- strong interests,
- curiosities / openness,
- fantasy-only interests,
- giving/receiving and other perspective asymmetries,
- conditional interests,
- common conditional subtype patterns,
- concept hard limits,
- detailed/subtype hard limits,
- category-wide hard limits,
- areas with insufficient data,
- notes and perspective-level raw answers.

## Legacy compatibility

Existing saved answers are not rewritten by the results engine. Legacy willingness values are normalized in memory only for result classification:

| Legacy value | Result interpretation |
|---|---|
| `unknown` | `unsure` |
| `curious` | `open_to_it` |
| `want_to_try` | `interested_in_trying` |
| `would_try` | `open_to_it` |
| `would_do` | `actively_want` |
| `would_not_try` | `not_interested` |

The original stored value remains intact until the user explicitly changes that answer.

## Acceptance checks

Automated tests verify that:

- adding a second identically answered perspective does not increase a concept's category weight;
- hard limits never become negative preference points;
- fantasy-only responses have their own result section;
- category-wide hard limits are retained separately;
- fantasy and real-world interest can legitimately point in opposite directions;
- perspective asymmetries remain visible;
- adaptive-detail conditional and hard-limit states surface separately;
- legacy willingness normalization is non-destructive.
