# Kink Exploration prototype

A local-first React/Vite prototype for adult self-exploration of interests, boundaries, preferences, and partner discussion points.

This repository is intentionally optimized for iteration rather than release compatibility. It supports the **current** catalog and export format only.

## Run locally

Requirements: Node 24+.

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm test              # focused runtime tests + catalog validation
npm run validate:catalog
npm run build
npm run preview
```

## Project structure

```text
src/
  App.jsx                  App state, import/export, screen routing
  components/              Questionnaire and results UI
  data/catalog.json        Current questionnaire/catalog data
  lib/                     Current runtime logic
scripts/
  catalog-validation.mjs   Lightweight catalog integrity checks
  catalog-validate.mjs     CLI validator
  *.test.mjs               Focused current-behavior tests
.github/workflows/deploy.yml
```

## Current data model

The catalog contains navigation domains, categories, current question concepts, semantic question types, adaptive detail profiles, risk/care prompts, negotiation preferences, and Power Exchange preferences.

Concepts store only fields used by the prototype: identity and copy, category placement, perspectives, semantic type, current detail-profile bindings, optional UI overrides, and risk domains. Historical schema mirrors, migration metadata, branch-gate marker concepts, deprecated detail fields, and hidden duplicate concepts are intentionally excluded.

Category routing uses three depth modes: `quick`, `standard`, and `exhaustive`. Category gates are routing choices (`interested`, `maybe`, `not_interested`, `hard_limit`, `skip`) and are stored separately from concept answers.

## Local storage and JSON

Answers are stored in browser `localStorage` under the current prototype storage key. JSON export/import is local-only and uses the current questionnaire version.

There is deliberately **no backward-compatibility layer**:

- imports must use the current export format and questionnaire version;
- unknown/removed answer keys are rejected rather than migrated;
- old willingness values and old detail-array shapes are not normalized;
- old local-storage keys are not read;
- schema changes should update the prototype directly instead of adding migration code.

If preserving old data becomes important later, add versioning/migrations when the product requirements justify them.

## Partner comparison

The Results screen can load a second current-format JSON export in memory and classify paired answers into descriptive interaction states. It does not calculate an overall compatibility percentage. The comparison file is not persisted by the app.

## Results and privacy

Results keep fantasy interest, real-world desire, experience, willingness, conditions, and boundaries distinct. Hard limits are reported separately from preference summaries.

The app is local-first: responses remain in the browser unless the user exports JSON, prints/saves a PDF through the browser print dialog, or deliberately shares a file.

## Catalog validation

`scripts/catalog-validation.mjs` checks the invariants that matter for the current prototype, including:

- unique IDs and valid domain/category references;
- current-only willingness states;
- valid semantic/detail/risk references;
- nested Quick → Standard → Exhaustive category lists;
- exhaustive reachability for every current concept;
- no deprecated detail fields or removed compatibility-era concept fields.

Keep validation focused on runtime integrity. Avoid adding release-process, migration-history, or generated audit documentation unless it becomes necessary for an actual release workflow.

## Deployment

The included GitHub Actions workflow runs the focused tests, builds the Vite app, and deploys `dist/` to GitHub Pages on pushes to `main` or manual dispatch.

`vite.config.js` uses relative asset paths so the build works under either a user/organization Pages site or a repository subpath.

## Prototype caveats

This is not a validated psychometric, medical, or diagnostic instrument. It is a self-reflection prototype for adults. The catalog and wording assume informed consent between adults and intentionally avoid procedural instructions for higher-risk activities.
