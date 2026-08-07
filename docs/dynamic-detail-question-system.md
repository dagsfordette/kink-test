# Plan 04 — Dynamic Detail Question System

## Status

Implemented in prototype revision `0.3.7-dynamic-detail-question-system`.

Plan 04 turns the existing optional-detail mechanism into an explicit adaptive branch system. The objective is **relevance, not artificial questionnaire shortening**: users who reject a parent interest do not have to reject every subtype, while users who are interested, open, unsure, or fantasy-only can still give detailed subtype-level answers.

This plan does not change category scoring, canonical concept IDs, category IDs, domain IDs, or the existing `conceptId::perspective` answer-key format.

## Generic adaptive-detail schema

The catalog now declares `adaptiveDetailSystem` and `detailDimensions`.

`adaptiveDetailSystem` defines:

- the response states that a reusable detail matrix may store;
- the parent states used by the branching engine;
- automatic branch behavior for each parent state;
- fantasy-only relevance filtering;
- the manual expansion label;
- supported profile field types and relevance scopes;
- legacy array compatibility for fields migrated from `multi_select` to `preference_matrix`.

The detail response states are:

| ID | Meaning |
|---|---|
| `appealing` | Actively appealing within the parent interest |
| `acceptable` | Acceptable even if not especially desired |
| `conditional` | Depends on context, partner, intensity, or another condition |
| `not_interested` | Not personally interesting within this parent interest |
| `hard_limit` | Firm subtype boundary; not a negative preference score |

A preference matrix is stored under the existing `details` object:

```json
{
  "details": {
    "body_area_preferences": {
      "buttocks": "appealing",
      "upper_thighs": "conditional",
      "face": "hard_limit"
    }
  }
}
```

Leaving a detail option unanswered is different from selecting `not_interested` or `hard_limit`.

## Branch activation rules

The branching engine derives one parent state from the base answer and applies the catalog rule:

| Parent state | Default | Detail relevance |
|---|---|---|
| `strongly_interested` | Open | Fantasy + real-world |
| `interested` | Open | Fantasy + real-world |
| `open` | Open | Fantasy + real-world |
| `unsure` | Open | Fantasy + real-world |
| `fantasy_only` | Open | Fantasy-relevant only |
| `not_interested` | Collapsed | Available by manual override |
| `hard_limit` | Collapsed | Available by manual override |
| `unanswered` | Collapsed | Available by manual override |

`Unsure` deliberately opens a branch: detail distinctions can help a user discover that some subtypes are appealing while others are not.

`Fantasy only` keeps fields marked `both` or `fantasy` and suppresses fields marked `real_world`. For example, a fantasy-only impact response can still refine imagined body-area/style preferences while a real-world marks field stays hidden.

`Not interested` and `Hard limit` collapse by default. They do **not** clear prior detail answers.

## Manual override

Every concept with an adaptive profile exposes a manual path when its branch is collapsed. For explicit negative/boundary parent states the control is labeled:

**Answer detailed questions anyway**

This override opens the branch without altering the parent answer. It therefore supports cases such as:

- “I generally do not want this, but one subtype is acceptable.”
- “This is a hard limit overall, and I still want to record which subtypes are especially relevant to that boundary.”
- “I have not rated the parent yet, but I want to inspect the detailed vocabulary first.”

Using or closing the override never deletes `answer.details`.

## Reusable detail primitives

The Plan 04 registry includes reusable primitives for:

- body area;
- implement/device;
- material;
- intensity;
- duration;
- rhythm/style;
- role;
- emotional framing;
- visibility;
- location;
- audience;
- relationship context;
- privacy;
- marks;
- recording/storage;
- fantasy subtype;
- restraint method;
- mobility;
- position;
- interaction mode;
- script/improvisation style;
- realism/theatricality.

A profile field may additionally declare `relevance: both | fantasy | real_world`.

## Initial high-value migrations

### Impact play

The `impact` profile now captures:

- body-area preferences with independent subtype states;
- implement/method refinements;
- thuddy/stingy/rhythmic/style preferences;
- preferred/max intensity;
- real-world marks preferences;
- emotional framing.

Named impact activities and implements such as hand spanking, paddling, flogging, and caning remain first-class concepts because users can reasonably evaluate them independently.

### Bondage

The `bondage` profile now captures:

- restraint areas;
- restraint methods;
- positions;
- restraining/being-restrained role preferences;
- mobility level;
- restriction intensity;
- duration;
- visibility.

Named restraint methods and forms remain canonical where the distinction can materially change preference.

### Body-part interests

Body-part concepts are rebound from the generic fetish profile to `body_part_interest`. The body part itself remains a first-class concept. The adaptive profile captures **how** that specific body part appeals:

- looking;
- touching;
- kissing/licking;
- scent;
- worship/focused attention;
- receiving attention;
- humiliation/objectification context;
- contextual focus and centrality.

### Materials

Material concepts are rebound to `material_interest`. Each material remains first-class. Details capture:

- visual appeal;
- wearing;
- partner wearing;
- touching;
- scent;
- restrictive-clothing association;
- roleplay association;
- sensory qualities and importance.

### Roleplay

Distinct role families remain first-class concepts. The profile now captures:

- emotional tone;
- scripted vs improvised structure;
- realism vs theatricality;
- costume/presentation;
- preferred/max authority intensity;
- fantasy/enactment context.

Giving/receiving role direction remains a perspective where already modeled that way.

### Emotions

Distinct emotional states remain first-class concepts and retain `feel_self` / `evoke_partner` perspectives. Emotion profiles now support matrix responses for contexts/blends plus preferred/max emotional intensity and framing.

### Sexual activities

Distinct sexual activities remain first-class and giving/receiving remain perspectives where appropriate. The general sexual-activity profile now refines:

- body-area focus;
- style/rhythm;
- intensity/roughness;
- how the activity fits into sex;
- relationship/scene context.

## First-class concept vs adaptive detail

Plan 04 intentionally does **not** demote an item merely because it could technically be represented as a detail option.

The migration rule is:

- keep it canonical when strong like/dislike differences are plausible and meaningful for self-understanding or partner communication;
- use an adaptive detail when it mainly specifies how a parent concept is expressed;
- keep conditions as conditional/context data rather than duplicate concepts;
- keep direction as a perspective when it changes role rather than underlying concept identity.

The machine-readable decisions and affected concept lists are in `reports/dynamic-detail-migration.json`.

## Stored-answer compatibility

Plan 04 preserves all canonical IDs and answer keys.

Compatibility behavior:

1. A field changed from `multi_select` to `preference_matrix` can still read an old array. Each selected legacy option is displayed as `appealing` until the user changes it.
2. The old impact fields `preferred_locations`, `off_limit_locations`, and `marks` are retained as deprecated compatibility fields. They are hidden for new answers but rendered if prior data exists.
3. Changing a parent answer to `not_interested` or `hard_limit` only collapses the branch. It does not mutate or remove `details`.
4. Detail-level hard limits remain inside `details` and are not averaged into Plan 01–03 scoring.

The JSON export schema is bumped to `1.4.0` to reflect the new detail-matrix shape; earlier answer data remains importable.

## What Plan 04 deliberately leaves for later

- Plan 05: depth-mode and category-gate redesign.
- Plan 06: scoring/results use of adaptive details and detail-level boundaries.
- Plan 07: richer negotiation/risk/privacy/care behavior.
- Plan 08: full catalog content expansion/editorial pass.

## Verification

Run:

```bash
npm run test:adaptive
npm run validate:catalog
npm run audit
npm run audit:check
```

The adaptive test suite verifies:

- interested/open/unsure/fantasy-only activation;
- not-interested and hard-limit collapse behavior;
- manual override;
- fantasy-only filtering;
- independent subtype states including hard limits;
- legacy array compatibility;
- priority-profile bindings;
- preservation of representative first-class concepts;
- preservation of saved detail data after a parent collapses.

Catalog validation treats the Plan 04 schema, required branch states, detail response scale, valid detail dimensions/field types, and priority profile structure as fatal invariants.
