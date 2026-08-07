# Plan 09 — Version and Migration Policy

## Version surfaces

The project deliberately separates three version numbers.

### Application version

`package.json` follows semantic-version-style release numbering for the prototype. UI/process changes can bump this without changing saved-answer meaning.

### Questionnaire version

`catalog.questionnaire.version` tracks meaningful questionnaire/catalog changes. It is included in exports for provenance. Stable canonical IDs remain the primary compatibility mechanism.

### Response schema version

`RESPONSE_SCHEMA_VERSION` in `src/lib/responseFormat.js` tracks the exported JSON structure/semantics. Plan 09 uses `1.8.0`.

## Compatibility rules

1. Never silently reinterpret a stored answer into a different meaning.
2. Preserve canonical concept IDs and perspective keys when reasonable.
3. Add explicit migrations for renamed keys or rehomed data.
4. Migrations may normalize structural representation (for example legacy category `::overall` records into `categoryGates`) but must preserve the user's boundary/interest meaning.
5. Current imports accept compatible unversioned legacy exports when questionnaire identity and answer-map shape are valid.
6. A canonical current value wins over a legacy alias if both are present.
7. Unknown future schemas must not be assumed compatible merely because they are JSON; future releases should add explicit version-range handling when a breaking schema exists.

## Current covered migrations

- legacy `detailed` depth mode → `standard`;
- legacy `categoryId::overall` mini-questionnaire records → separate `categoryGates`;
- `oral_giving::give` → `oral_sex::give`;
- `oral_receiving::receive` → `oral_sex::receive`;
- legacy willingness values remain readable and are normalized only when results need comparison semantics;
- negotiation preferences are normalized independently from concept interest answers.

## Release discipline

Every migration must have a regression test using an input shaped like the older export. Removing a migration requires an explicit support-window decision in release notes rather than incidental code cleanup.
