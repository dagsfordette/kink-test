# Taxonomy and information architecture

Plan 02 adds a navigation layer above the existing detailed category catalog. It does not change scoring, question dimensions, or the meaning of existing answer keys.

## Navigation hierarchy

The UI now uses:

**Domain → Category → Canonical concept/details**

Domains are broad navigation structures. Detailed categories remain intact and retain their existing category IDs.

| Domain ID | Domain | Categories |
|---|---|---|
| `power-roles-relationships` | Power, Roles & Relationships | `power_exchange`, `service_protocol`, `relationship_dynamics` |
| `restraint-control` | Restraint & Control | `bondage_restraint`, `rope_bondage`, `sensory_deprivation`, `orgasm_control`, `chastity` |
| `physical-sensation-intensity` | Physical Sensation & Intensity | `impact_play`, `pain_play`, `sensation_play`, `rough_physical`, `medical_edge` |
| `sexual-activities-devices` | Sexual Activities & Devices | `sexual_activities`, `anal_play`, `toys_devices`, `fluids_mess` |
| `psychological-emotional-dynamics` | Psychological & Emotional Dynamics | `humiliation_degradation`, `praise_worship`, `objectification`, `psychological_play`, `emotional_arousal` |
| `roleplay-fantasy` | Roleplay & Fantasy | `roleplay`, `pet_primal`, `fantasy_transform` |
| `fetishes-stimuli` | Fetishes & Stimuli | `fetish_materials`, `body_part_fetishes`, `sensory_fetishes` |
| `partners-observation-setting` | Partners, Observation & Setting | `exhibition_observation`, `multi_partner`, `remote_digital`, `sexual_context` |

Every category has exactly one `domainId`. The validator treats a missing or unknown domain as fatal.

## Canonical concept ownership

Every concept now declares these fields:

```json
{
  "id": "service_submission",
  "canonicalId": "service_submission",
  "primaryCategory": "service_protocol",
  "relatedCategories": ["power_exchange"],
  "domain": "power-roles-relationships",
  "semanticTags": [
    "semantic:dynamic",
    "domain:power-roles-relationships",
    "category:service_protocol",
    "category:power_exchange"
  ]
}
```

### Field meanings

- `id`: stable catalog ID.
- `canonicalId`: answer-storage identity. Plan 02 keeps all existing concepts self-canonical, while the runtime helper supports future aliases.
- `primaryCategory`: the category that owns scoring/results placement for the concept.
- `relatedCategories`: other categories where the same concept should be discoverable.
- `domain`: the domain of the primary category.
- `semanticTags`: machine-readable semantic/navigation tags.
- `categoryIds`: retained as a compatibility mirror of `[primaryCategory, ...relatedCategories]` for older code/readers.

## Cross-category answer behavior

A related placement never creates a second answer identity. `ConceptCard` writes answers using `canonicalId::perspective`, regardless of which category the user entered from.

For example, `service_submission` is visible from both Service & protocol and Power exchange, but both placements read and write:

```text
service_submission::as_submissive
```

The related placement is visually labeled with its primary category so users can understand why an item appears in more than one place.

## Navigation behavior

Desktop navigation groups categories beneath the eight domain headings. Mobile navigation uses a single category selector with domain `<optgroup>` labels. Previous/next traversal follows domain order while preserving the existing category IDs.

Within a category, primary concepts appear before related/cross-listed concepts. Quick, Standard, and Detailed mode limits continue to apply to the visible category list. Exhaustive mode exposes every directly-questioned non-gate concept through at least its primary category and also exposes relevant related placements.

## Runtime helpers

`src/lib/taxonomy.js` centralizes taxonomy behavior:

- `primaryCategoryId()`
- `relatedCategoryIds()`
- `discoverableCategoryIds()`
- `canonicalConceptId()`
- `conceptDomainId()`
- `categoriesByDomain()`
- `resolveCanonicalConcept()`
- `conceptsForCategory()`
- `isRelatedPlacement()`

This keeps navigation logic out of scoring and makes future taxonomy migrations explicit.

## Compatibility

Plan 02 does not rename or delete any category or concept IDs. Existing answer keys therefore remain valid without reinterpretation. See `reports/taxonomy-migration-map.json` for the machine-readable migration declaration.
