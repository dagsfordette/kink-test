# Plan 05 — Depth Modes and Category Gates

## Purpose

Plan 05 replaces two order-dependent behaviors in the prototype:

1. Depth modes no longer mean “take the first N concepts in a category.”
2. Category gates no longer act like miniature concept questionnaires.

Quick, Standard, and Exhaustive now have explicit catalog membership per category, and category routing is stored separately from concept answers.

## Depth-mode philosophy

### Quick

Quick is a representative scan. It is designed to:

- identify broad interest families,
- establish major role directions,
- expose recognizable examples,
- and activate useful adaptive follow-ups without letting specialist material dominate the first pass.

Quick membership is explicitly curated in each category under `category.depthConceptIds.quick`.

Representative examples include:

- Power exchange: both **Dominance** and **Submission**.
- Bondage: wrist/ankle restraint, cuffs, fabric restraints, bed restraint, and full-body restraint before specialist confinement methods.
- Impact: hand spanking, paddling, flogging, thuddy impact, stingy impact, and rhythmic impact.
- Anal: external touch, fingering, toys, plugs, beads, and anal-focused attention before enema-related interests.
- Toys: vibrators, dildos, plugs, strap-ons, nipple clamps, and app-controlled toy play before urethral/catheter concepts.
  - The current catalog has no dedicated wearable-toy canonical concept; Plan 05 does not add new content solely to satisfy depth classification. The existing cross-listed app-controlled toy concept is used as the broader remote/wearable-adjacent representative, while catheter and sounding remain out of Quick.
- Medical/edge: broad clinical examination/restraint themes are shown before needle, blood, fire, breath-restriction, or cutting-related material.

### Standard

Standard is the normal broad questionnaire. It includes every Quick item plus a curated set of common and moderately specialized distinctions in each category.

Standard membership is explicit under `category.depthConceptIds.standard`. It is not computed by array position at runtime.

### Exhaustive

Exhaustive maximizes expressive coverage. Every directly question-able concept discoverable in a category—including cross-listed canonical concepts—is present in `category.depthConceptIds.exhaustive`.

Specialist and higher-risk material omitted from Quick/Standard remains available here. Exhaustive does not create duplicate answer identities: cross-listed concepts continue to use the same canonical `conceptId::perspective` key.

## Current coverage

The Plan 05 catalog contains the following explicit category placements:

| Mode | Placements across categories |
|---|---:|
| Quick | 191 |
| Standard | 356 |
| Exhaustive | 691 |

These are navigation placements, not unique concept counts. Cross-listed canonical concepts can appear in more than one category while retaining one answer identity.

## Runtime selection

`src/lib/depthModes.js` is the runtime authority for depth selection.

- `normalizeDepthMode()` maps legacy `detailed` saves/imports to `standard`.
- `conceptsForDepth()` uses the category's explicit mode lists.
- A user can manually request an Exhaustive override for the current category without changing the global mode.
- A `Maybe / unsure` category gate intentionally starts from that category's Quick representative list even when the global mode is Standard or Exhaustive.

## Category gate model

Category routing is stored in a dedicated top-level `categoryGates` object rather than in `answers`.

Example:

```json
{
  "categoryGates": {
    "impact_play": {
      "state": "hard_limit",
      "boundary": {
        "level": "hard_limit",
        "scope": "category"
      }
    },
    "toys_devices": {
      "state": "maybe"
    }
  }
}
```

The five states are:

| State | Routing behavior | Counts as answered? | Category boundary? |
|---|---|---:|---|
| `interested` | Open the selected global depth mode | Yes | No |
| `maybe` | Open Quick representatives with definitions | Yes | No |
| `not_interested` | Collapse by default; manual browse remains available | Yes | No |
| `hard_limit` | Collapse by default and store a category-scoped hard limit | Yes | Hard limit |
| `skip` | Collapse by default | **No** | No |

Category gates contribute **no preference score**. They do not automatically answer fantasy appeal, real-world desire, experience, willingness, or concept-level boundaries.

## Hard limit vs not interested vs skip

These states are deliberately non-equivalent:

- **Not interested** is an answered routing preference and is not a boundary.
- **Hard limit** is a category-wide boundary, stored separately from concept-level hard limits.
- **Skip** is a navigation state only and remains unanswered rather than being interpreted as negative interest.

The results view surfaces category-wide hard limits separately from concept hard limits. Skipped categories are never included in concept scoring.

## Manual expansion

Collapsed areas can always be opened with **Browse anyway**. This does not alter the routing state.

Users can also choose **Browse all … in this category** to temporarily override the selected depth mode for one category. This is an explicit manual exploration path, not silent mode expansion.

## Legacy migration

Earlier builds stored category mini-questionnaire answers at `categoryId::overall` and offered a fourth `detailed` mode.

Plan 05 migration behavior:

- Existing `detailed` mode settings normalize to `standard`.
- Existing `categoryId::overall` records are interpreted once as a routing state when possible.
- The legacy overall record is then removed from the concept `answers` object.
- An already-present Plan 05 `categoryGates[categoryId]` record takes precedence over the legacy record.
- Canonical concept answers and their IDs are otherwise untouched.

Legacy branch-gate concepts remain in the catalog as compatibility markers, but the UI no longer writes gate answers to them.

## Validation contract

The validator now fails if:

- the depth-mode registry is missing or malformed,
- a category lacks explicit Quick/Standard/Exhaustive concept lists,
- Quick is not a subset of Standard or Standard is not a subset of Exhaustive,
- Exhaustive does not contain every directly discoverable concept,
- a depth list references a concept that is not discoverable in that category,
- priority Quick selections regress to known specialist edge examples,
- the category-gate model loses one of the five required states,
- Skip becomes a negative/answered state,
- Hard limit stops producing a category-scoped hard-limit boundary,
- or category gates begin contributing to preference scoring.

See `scripts/depth-modes-and-gates.test.mjs` and `reports/depth-mode-migration.json` for the executable and machine-readable checks.
