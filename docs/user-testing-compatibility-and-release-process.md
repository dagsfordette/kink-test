# Plan 09 — User Testing, Compatibility, and Release Process

## Implemented scope

Plan 09 establishes the evidence and release layer around the architecture from Plans 01–08. It does not modify catalog content, taxonomy ownership, depth membership, semantic typing, risk metadata, or the Plan 06 scoring aggregation.

### Structured user testing

- `docs/user-test-script.md` defines adult participant cohorts and tasks for comprehension, scale clarity, dynamic branching, exhaustiveness, repetition, fatigue, and result/comparison interpretation.
- `docs/user-test-findings-template.md` keeps human findings distinct from automated/synthetic evidence.
- `reports/branching-validation.md` provides structural evidence that adaptive branching suppresses irrelevant detail by default while preserving manual override and fantasy-relevant refinements.

No human participant findings are fabricated or bundled with this implementation. The repository now contains a repeatable protocol for collecting them.

### Partner comparison

- `src/lib/compatibility.js` implements named interaction states rather than a compatibility percentage.
- Results can load a second inventory JSON into memory without replacing the user's own answers or persisting the partner response.
- Category, concept, and matching subtype hard limits take precedence over positive match states.
- Directional pairs include giving/receiving, dominant/submissive, owner/owned, observing/being observed, and emotional self/partner directions.

### Regression fixtures

`fixtures/regression-fixtures.json` covers eight representative synthetic response profiles required by the plan. Each has expected result properties and is executed in CI.

### Response compatibility

`src/lib/responseFormat.js` centralizes response creation and import normalization. The current response schema is `1.8.0`; tested migrations preserve legacy depth, category-gate, and renamed-answer behavior without silently rewriting current answers.

### Release process

- `npm run release:verify` runs all automated regression tests, catalog validation, and deterministic audit verification.
- `npm run release:check` adds the Vite production build.
- `.github/workflows/deploy.yml` uses `release:check` before deployment.
- `docs/release-checklist.md` and `docs/version-and-migration-policy.md` define the human/release discipline around future catalog growth.

## Acceptance evidence

- Dynamic branching reduction is measured across 1,122 adaptive concept-perspective branches and 4,441 possible non-deprecated detail-field exposures.
- Manual override is regression-tested after collapsed parent states.
- Fantasy-only relevance filtering is regression-tested.
- Exhaustive routing is regression-tested for specialist content omitted from Quick.
- Hard-limit precedence is regression-tested in concept, subtype, and category comparison cases.
- Future changes are protected by the full synthetic persona, migration, print/export, comparison, branching, catalog, and audit suite.
