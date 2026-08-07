# Plan 03 — Semantic Question Model

## Status

Implemented in prototype revision `0.3.6-semantic-question-model`.

Plan 03 changes the base questionnaire from a mostly activity-shaped form into a semantic question engine. It does **not** add the full adaptive subtype system planned for Plan 04 and does not change category scoring.

## Authoritative schema

Every concept declares:

- `semanticType`
- `questionModel.template`
- `semanticTags`, including `semantic:<semanticType>`

`questionModel.template` must equal `semanticType`. The semantic type's `questionDimensions` object is authoritative for base-question rendering. The older per-concept `dimensions` field remains in the catalog only as compatibility/debug metadata and is no longer used to decide which base controls render.

The base dimensions are:

| Dimension | Storage | Purpose |
|---|---|---|
| `fantasyAppeal` | `preference.fantasy` | Appeal as an idea, fantasy, cue, role, feeling, or context |
| `realWorldDesire` | `preference.realWorld` | Desire for a real-world version or closest real-world analogue |
| `experience` | `experience` | Whether relevant real-world experience exists |
| `experiencedPreference` | `preference.experienced` | Evaluation of actual experience, only where experience is meaningful |
| `willingness` | `willingness` | Openness/stance, including explicit `fantasy_only` |
| `boundary` | `boundary` | Boundary status, stored independently from interest/scoring |

Future plans may add semantic-specific detail dimensions without changing these base constructs.

## Semantic types

The required Plan 03 type registry contains:

- `activity`
- `role`
- `dynamic`
- `fantasy`
- `stimulus`
- `body_part`
- `material`
- `emotion`
- `setting`
- `relationship_dynamic`
- `device`
- `communication_preference`
- `risk_context`

The existing `motivation` schema type is retained with `directQuestioning: false`; it remains reserved for future optional/inferred interpretation.

### Current catalog distribution

- `activity`: 224
- `dynamic`: 109
- `emotion`: 41
- `body_part`: 29
- `role`: 27
- `relationship_dynamic`: 26
- `material`: 23
- `fantasy`: 21
- `stimulus`: 20
- `device`: 16
- `setting`: 13
- `communication_preference`: 5

`risk_context` is defined for schema completeness but is not yet assigned to a first-class catalog concept.

## Type templates

### Activity / role / dynamic / device / relationship dynamic / communication preference

These types can meaningfully expose experience, so their default base template includes:

- fantasy/idea appeal
- real-world desire
- experience
- preference based on actual experience
- willingness/openness
- boundary

Wording changes by semantic type; for example, relationship dynamics use relationship-oriented language rather than generic “do this” language.

### Fantasy

Fantasy concepts include:

- fantasy appeal
- real-world analogue interest
- real-world stance/willingness
- boundary

They suppress `experience` and `experiencedPreference`. Impossible transformations therefore never ask whether the user has physically tried them.

### Stimulus / body part / material

These types include:

- attraction/appeal
- real-world interest
- willingness/openness
- boundary

They suppress generic experience questions. Existing fetish detail profiles continue to capture interaction details such as seeing, wearing, touching, scent, texture, or focused attention.

### Emotion

Emotion concepts include:

- erotic appeal
- desire for the feeling/reaction in real life
- boundary

The existing `feel_self` and `evoke_partner` perspectives distinguish wanting to feel an emotion from wanting to see or evoke it in a partner. Emotion-specific adaptive details continue to capture context and emotional blends. Generic physical experience and willingness controls are suppressed.

### Setting

Setting concepts include:

- appeal
- real-world desire
- willingness/openness
- boundary

Generic physical experience is suppressed. Existing context details continue to capture privacy requirements.

## Response labels

### Willingness

The new first-class values are:

- Actively want
- Interested in trying
- Open to it
- Unsure
- Fantasy only
- Not interested
- Hard limit

`Fantasy only` is therefore a direct semantic stance rather than a generic condition.

Legacy willingness IDs from earlier `0.3.x` builds are **not** silently rewritten. If an old saved/imported answer uses a legacy ID, the UI preserves and labels that saved value until the user explicitly selects a new response.

### Boundaries

The previous label **No limit** is replaced by **No special boundary**. The stored ID remains `none` for compatibility.

A hard limit remains a boundary. It is never converted to a negative preference score.

## Migration/default rules

The machine-readable migration report is `reports/semantic-question-migration.json`.

Rules:

1. Canonical concept IDs do not change.
2. Category ownership/navigation does not change.
3. Existing answer keys (`conceptId::perspective`) do not change.
4. `questionModel.template` defaults to the concept's `semanticType`.
5. Type templates are authoritative; future exceptions must use explicit `questionModel.overrides`.
6. Legacy `dimensions` metadata is retained but ignored by the Plan 03 base renderer.
7. Legacy willingness values remain readable and are not automatically reinterpreted.
8. Scoring remains the Plan 01/02 behavior: actual-experience preference when available, otherwise fantasy preference. New real-world desire/willingness fields are not added to scoring in Plan 03.

## Verification

`npm run test:semantic` verifies, among other cases:

- impossible transformation fantasies suppress physical experience;
- body-part/material/stimulus concepts are not activity-shaped;
- activities/devices retain appropriate experience dimensions;
- fantasy-only exists as a first-class willingness value;
- hard limits do not become negative preference scores;
- new real-world desire data does not change category scoring;
- every directly questioned concept remains reachable in Exhaustive navigation.

`npm run validate:catalog` additionally treats missing semantic types, malformed question templates, invalid question dimensions, and required response-scale omissions as fatal schema errors.
