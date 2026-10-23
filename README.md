# Kink Exploration prototype

React + Vite. Requires Node 24 or newer.

```sh
npm ci
npm run dev
```

`npm run build` creates `dist/`. `npm run preview` serves the build. The included GitHub Pages workflow deploys `main`.

`src/components/` contains the screens; `src/lib/` holds state, filtering, scoring and sharing logic. Edit activity questions, detail controls and relationships in `src/data/activityCatalog.json`; fantasy questions live in `src/data/fantasyProfile.json`.

Run `npm test` for the small regression suite and `npm run check:catalog` after editing question data.

This version starts fresh: browser profile v4, partner format v2, catalog 3.0.0. Earlier saves and exports are unsupported. Current private backups can be restored. Partner output excludes private notes, details and body/fantasy data; Play Preferences require opt-in. Default printing uses the partner report; private printing is a separate action.

Activity entry uses the shared body and attraction setup once. Edit them later from My Profile. The explorer opens in a category and contains activity cards, Review answers, and collapsed filter controls. Short-session controls, the top search, duplicate body/role setup and per-card availability panels are removed. Play Preferences and boundary management remain available from the profile/review screens.

Activity stances, experience buttons, details and notes save automatically. Answered cards stay editable in the list. Declining a broad activity sets aside unanswered subtype follow-ups; it does not write answers or boundaries for them. Saved answers remain reviewable.

Fantasy scores filter by theme, perspective and the catalog’s explorationIntensity (1 mild, 2 moderate, 3 intense). Clear strong preferences permit the full range on that side and can hide the opposite power direction; weaker preferences retain mild activities. Specific theme interests take precedence over broad power inferences. Mixed/sparse evidence remains open and prompts a concrete clarification. Manual topic choices apply to that category. Not sure leaves it unrestricted. These filters are not saved boundaries or a risk assessment.

Attraction preferences filter declared partner-anatomy requirements and relevant body-hair interests. Broad preferences do not exclude generic activities that can fit any partner; gender is not used to guess anatomy. Your own body facts filter activities involving your body. Show excluded activities and per-item Include anyway allow inspection and adjustment of inferred filters.

Verification: automated tests cover graded fantasy filtering, theme overrides, attraction/self-anatomy separation, auto-save/undo, cascade filtering, setup routing, sharing safeguards and fantasy routing. Catalog validation covers all 1,080 activities. The production build emits the existing large-bundle warning. Browser checks confirmed direct entry through body and attraction setup, the simplified activity opening, retained soft-limit cards, and experience-button selection. A preview-only UUID failure was fixed. Final note/reload, mobile layout and full fantasy-to-activity browser checks were interrupted by workspace disconnections and remain browser-unverified.

## Body-area painting

Body-area interests is a freehand painting surface, with no body-area activity
questions. Brushes: No, Enjoy, Love, This is a fetish, and Eraser. Unmarked areas
have no rating. Brush size, undo/redo, clear-view and keyboard painting are
available. Mouse, pen and touch pointer events use normalized portrait coordinates.

The existing realistic male/female front/back models remain. Anatomy/partner
preferences select the model automatically. When unspecified, an existing saved
model is retained, with the female model as the default. Each
self/partner, male/female, front/back combination has a separate painting, so
changing models never silently moves a marking onto a different body location.
Undo/redo history lasts while the editor is open; paintings persist across reload.

Scent and tattoos have standalone categories. Other feature-specific interests,
including height/size differences, body hair, musculature and piercings, live in
Appearance & body features. The catalogue is version 3.2.0 and has 1000 activity
records; none belongs to the painted body category. The old body-area questions
are removed; their ratings are not converted into spatial paint markings.

Painted maps appear in review, profile, partner sharing, visual partner comparison
and print reports. Painting never creates or overwrites specific activity answers.
Private backups contain the painting data. Public shares contain only the final
visible ratings as validated raster runs, excluding erased/overpainted history.
No pixel-overlap compatibility score or inferred permission is generated.

Verification: 29 automated tests, catalog validation and production build pass.
Browser-verified: real pointer drawing and placement, keyboard painting, erasing,
undo/redo, clear-view, reload persistence, independent views/owners/models, and
painted-map review/profile rendering. Touch/mobile and print layout remain
browser-unverified. The existing large-bundle warning remains.

Bundled generated artwork: `public/body-figure-realistic.webp` (female) and
`public/body-figure-male.webp` (male). No external image service is used at runtime.
