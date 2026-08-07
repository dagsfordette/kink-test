# Catalog audit and validation

Plan 01 adds deterministic tooling for inspecting the questionnaire before later plans change taxonomy, branching, semantics, or scoring.

## Commands

```bash
npm run audit
npm run audit:check
npm run validate:catalog
npm run test:catalog
```

`npm run audit` reads `src/data/catalog.json` and rewrites both baseline files:

- `reports/catalog-audit.json` — complete machine-readable audit and diagnostics.
- `reports/catalog-audit.md` — human-readable baseline summary.

The audit contains no current timestamp, so identical catalog input produces byte-for-byte identical output and can be diffed in later plans.

`npm run audit:check` regenerates the audit in memory and exits non-zero if the committed JSON or Markdown baseline is stale.

`npm run validate:catalog` exits non-zero only for fatal mechanical/schema problems. Editorial issues are warnings so the current baseline can remain buildable while content improvements are handled in later plans.

## What the audit measures

The report records category/concept totals, primary and cross-category placement, explicit Quick/Standard/Exhaustive catalog coverage, perspectives, semantic metadata, detail-profile usage, exact and near-duplicate labels, definition/boilerplate status, risk metadata, category gates, child branches, result-category contribution, and the active scoring/result aggregation model.

Depth-mode counts now come from explicit `category.depthConceptIds` membership. Quick is curated for representative concepts, Standard is a broader common/moderately-specialized set, and Exhaustive must contain every directly discoverable concept. Cross-listed concepts count as navigation placements without creating duplicate answer identities.

Plan 06 scoring diagnostics now verify equal concept weighting: perspective records are combined within a canonical concept before category aggregation, so multi-perspective concepts no longer receive extra default category weight.

## Validation classes

### Fatal errors

| Class | Meaning |
|---|---|
| `DUPLICATE_ID` | Two objects in an ID-addressed catalog collection use the same ID. |
| `BROKEN_REFERENCE` | A concept points to a missing category, concept, profile, option set, specifier, semantic type, or unsupported relation type. |
| `MISSING_CATEGORY_ID` | A concept has no category placement. |
| `INVALID_PERSPECTIVE` | A concept or perspective-specific profile mapping uses an unsupported perspective value. |
| `INVALID_MODE_OR_TIER` | Optional legacy `mode`/`tier` metadata is present but uses a value outside Quick/Standard/Exhaustive. |
| `LEGACY_RISK_LEVEL_PRESENT` | A concept still contains the one-dimensional `riskLevel` field removed by Plan 07. |
| `RISK_DOMAIN_SCHEMA_INVALID` | Required Plan 07 risk domains are missing/malformed, migration metadata is absent, or a concept has invalid `riskDomains`. |
| `RISK_PROMPT_MAPPING_INVALID` | A risk domain lacks a mapped prompt or a mapped prompt is not explicitly high-level/non-procedural. |
| `NEGOTIATION_PREFERENCES_SCHEMA_INVALID` | The general communication/privacy/aftercare/marks/partner-context model is missing, malformed, or allowed to affect scoring. |
| `CATEGORY_GATE_MISSING` | A category lacks the routing prompt required by the Plan 05 gate model. |
| `DEPTH_MODE_SCHEMA_INVALID` | The Quick/Standard/Exhaustive registry or its written mode definitions are missing/malformed. |
| `CATEGORY_DEPTH_INVALID` | A category depth list is missing, non-nested, references invalid placements, or Exhaustive does not cover every directly discoverable concept. |
| `CATEGORY_GATE_SCHEMA_INVALID` | The dedicated category-routing data model is malformed, collapses Skip/Not interested/Hard limit semantics, or allows gate data to contribute to scoring. |
| `RESULTS_MODEL_INVALID` | The Plan 06 aggregation order, equal-concept weighting, separate boundary treatment, result dimensions, or qualitative-primary-output contract is malformed. |
| `ORPHANED_DETAIL_PROFILE_REFERENCE` | A concept references a detail-profile ID that is not defined. |
| `DETAIL_PROFILE_SEMANTIC_MISMATCH` | A referenced detail profile excludes the concept's semantic type. |

### Editorial/content warnings

| Class | Meaning |
|---|---|
| `DUPLICATE_EXACT_LABEL` | Separate concept IDs share the same normalized label. |
| `NEAR_DUPLICATE_LABEL` | Two labels cross the deterministic similarity threshold (0.90). This is heuristic and needs human review. |
| `DUPLICATE_CONCEPT_PLACEMENT` | Exact-label concepts are represented by separate IDs across categories where canonical reuse may be preferable. |
| `INCONSISTENT_CAPITALIZATION` | A category/concept label begins with lowercase text. |
| `EMPTY_DESCRIPTION` | A concept has no usable description text. |
| `BOILERPLATE_DESCRIPTION` | A concept uses the catalog's generic “Neutral adult self-assessment item covering …” description. |
| `SPECIALIST_TERM_WITHOUT_DEFINITION` | A conservative specialist-term heuristic matched a label whose description is missing or boilerplate. This is a review queue, not a semantic judgment. |
| `UNUSED_DETAIL_PROFILE` | A defined detail profile is not referenced by any concept. |

## Definitions and specialist-term heuristic

For baseline purposes, a “substantive definition” is a non-empty description that is neither the generic generated description nor a branch-gate description. This deliberately does not claim that the prose is editorially sufficient; it only separates clearly generated placeholders from bespoke explanatory text.

The specialist-term detector uses a small, explicit pattern list in `scripts/catalog-audit-lib.mjs`. It is intentionally conservative and deterministic. Future editorial work can update the list without changing the severity model.

## Category gate result behavior

Plan 05 stores category routing under the dedicated top-level `categoryGates` object. Plan 06 passes gates to `buildResults` only so category-wide boundaries and skipped-state coverage can be displayed; `resultsModel.categoryGateContribution` remains `none`, so gate state cannot alter concept/category preference aggregation. A category-wide hard limit is stored as a category-scoped boundary record; `not_interested` is a separate routing state; and `skip` is explicitly marked unanswered. Legacy `categoryId::overall` records are migrated out of the concept-answer map on load/import.

## Determinism

The report derives only from checked-in catalog data and fixed validator rules. It does not include wall-clock generation time, filesystem metadata, random values, or network data. Re-running `npm run audit` on unchanged inputs should yield no diff.

## Plan 02 taxonomy validation classes

### `DOMAIN_SCHEMA_INVALID` — error
The catalog must define the eight Plan 02 top-level navigation domains with unique IDs and labels.

### `CATEGORY_DOMAIN_MISSING_OR_INVALID` — error
Every detailed category must declare exactly one `domainId`, and that ID must reference a defined domain.

### `CANONICAL_CONCEPT_INVALID` — error
Every concept must declare `canonicalId`. The target must exist in the catalog. Cross-category UI placements use this identity for answer storage.

### `TAXONOMY_PLACEMENT_MISMATCH` — error
Canonical ownership metadata is inconsistent. This covers missing/invalid `primaryCategory`, malformed `relatedCategories`, domain ownership that disagrees with the primary category, missing `semanticTags`, or a legacy `categoryIds` mirror that differs from `primaryCategory + relatedCategories`.

## Plan 03 semantic-question validation classes

### `SEMANTIC_TYPE_SCHEMA_INVALID` — error
The Plan 03 semantic registry is incomplete or malformed. Required semantic types must exist before concepts may reference them.

### `QUESTION_DIMENSION_SCHEMA_INVALID` — error
A required base question dimension is missing, or a semantic type declares an unknown/non-boolean dimension entry.

### `QUESTION_MODEL_INVALID` — error
A concept is missing its semantic question model, its `questionModel.template` differs from `semanticType`, its semantic tag is inconsistent, or a future override uses an unknown/non-boolean dimension.

### `RESPONSE_SCALE_INVALID` — error
A required Plan 03 response is missing from the willingness/boundary model. This includes explicit `fantasy_only` support and clarified non-absolute wording for boundary value `none`.

## Plan 04 adaptive-detail validation classes

### `ADAPTIVE_DETAIL_SCHEMA_INVALID` — error
The Plan 04 adaptive-detail registry is missing or malformed. Required subtype response states and parent branch states must exist; `not_interested`/`hard_limit` must collapse by default; `unsure`/`fantasy_only` must remain explorable; fantasy-only rules may not expose `real_world`-only fields; and a manual override label must be defined.

### `DETAIL_PROFILE_FIELD_INVALID` — error
A detail-profile field uses an unsupported field type, references an unknown reusable detail dimension, declares an invalid fantasy/real-world relevance scope, or defines a preference matrix without options.

### `PRIORITY_DETAIL_PROFILE_INVALID` — error
One of Plan 04's representative high-value profiles is missing, is not configured for `adaptive_parent_state`, or no longer contains a subtype preference matrix.

## Plan 05 depth/gate validation classes

### `DEPTH_MODE_SCHEMA_INVALID` — error
The Plan 05 depth registry must define exactly Quick, Standard, and Exhaustive with documented purpose and catalog policy.

### `CATEGORY_DEPTH_INVALID` — error
Each category must declare explicit nested mode lists. Quick must be a subset of Standard; Standard a subset of Exhaustive; and Exhaustive must equal the full directly discoverable concept set. Representative priority checks guard against known niche-first regressions.

### `CATEGORY_GATE_SCHEMA_INVALID` — error
The routing model must contain Interested, Maybe / unsure, Not interested, Hard limit, and Skip. Skip must remain unanswered, Hard limit must create a category-scoped boundary, gates must not score, and manual expansion must remain available.

## Plan 06 scoring/results validation class

### `RESULTS_MODEL_INVALID` — error
The results model must declare v2.0.0 aggregation in the order perspective → concept → category → domain, use equal concept weighting at the category layer, keep hard limits out of preference averages, preserve no-score category routing, declare the required result dimensions, and mark the internal numeric index as non-primary output.

## Plan 07 negotiation/risk validation classes

### `LEGACY_RISK_LEVEL_PRESENT` — error
`riskLevel` must not return on concept records. Plan 07 replaces standard/elevated/high severity with multi-valued descriptive concern domains.

### `RISK_DOMAIN_SCHEMA_INVALID` — error
The catalog must define exactly the eight Plan 07 domains (`physical`, `medical`, `psychological`, `consent_complexity`, `privacy`, `digital_security`, `reputational`, `financial`). Every concept must declare a `riskDomains` array, even when empty, and every referenced domain must exist. The catalog must also document removal of the legacy `riskLevel` field.

### `RISK_PROMPT_MAPPING_INVALID` — error
Every risk domain must map to at least one prompt. Each mapped prompt must explicitly identify its domain and declare `instructionLevel: high_level_non_procedural`, preventing the questionnaire from drifting into procedural safety instructions.

### `NEGOTIATION_PREFERENCES_SCHEMA_INVALID` — error
The Plan 07 general profile must contain communication, stop/check-in, aftercare, marks, privacy, and partner-context sections; use dedicated `negotiationPreferences` storage; contribute no score; and remain a separate descriptive results profile.

## Plan 08 content/editorial validation classes

### `EDITORIAL_MODEL_INVALID` — error
Plan 08 requires `editorialModel` v1.0.0, a checked-in style-guide reference, and retirement of the old generated-description pattern. Every non-gate user-facing concept must have a non-empty, non-boilerplate description. Sensitive adult-only roleplay additions must state adult participation explicitly.

### `CONTENT_EXPANSION_INVALID` — error
The Plan 08 machine-readable expansion record must exist, declare its added canonical concept IDs, and reference only concepts that actually exist in the catalog.

After Plan 08, definition coverage excludes legacy branch-gate compatibility markers because those objects are routing artifacts rather than user-facing concepts. `reports/definition-coverage.md` is the focused editorial report; the deterministic catalog audit contains the same coverage counts and remaining warnings.
