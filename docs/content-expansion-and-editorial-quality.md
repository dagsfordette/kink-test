# Plan 08 — Content Expansion and Editorial Quality

Plan 08 was implemented on top of v0.4.0 / Plan 07 without removing or renaming any canonical ID. The catalog grows from **554 to 594 concepts** while keeping all 32 categories and 8 domains.

## Architecture choices

Forty gaps became first-class concepts because they represent independently meaningful preferences. Two candidate families were deliberately **not** duplicated as more standalone concepts:

- **Wearable / remotely controlled toys** reuse the existing `app_controlled_toys` canonical concept and now use the `remote_toy` adaptive profile for form factor, control mode, and privacy conditions.
- **Broader transformation subtypes** reuse `transformation_fantasy` with a new `transformation_fantasy` adaptive profile. `gender_transformation_fantasy` remains first-class because users may independently distinguish that theme from transformation fantasy generally.

Quick membership is unchanged from Plan 07. Common additions are promoted to Standard; every new concept appears in Exhaustive for each canonical/related category placement.

## Editorial pass

The old generic description pattern was retired. **480 existing descriptions** were rewritten, including bespoke definitions for specialist terms, and **31 existing labels** were normalized or disambiguated. Exact normalized duplicate-label groups drop from four to zero. Branch-gate compatibility markers are excluded from definition coverage because they are routing artifacts rather than user-facing concepts.

The final audit reports:

- **562 / 562 definition-eligible concepts with substantive descriptions**;
- **0 boilerplate descriptions**;
- **0 exact duplicate-label groups**;
- **0 capitalization warnings**;
- **2 intentional near-duplicate warnings** (directional watching concepts, and foot vs boot worship).

## Compatibility

The ordered SHA-256 identity of the original 554 concept IDs is preserved. The 32 category IDs, 8 domain IDs, and the complete Quick depth catalog are also unchanged. New concepts are appended after the Plan 07 catalog so existing answer keys cannot be reinterpreted by index/order.

See `docs/content-gap-review.md`, `docs/editorial-style-guide.md`, `reports/content-expansion-migration.json`, and `reports/definition-coverage.md`.
