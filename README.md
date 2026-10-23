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

## Body-area map

Body-area interests now opens a front/back body map with separate “My body” and
“My partner’s body” views. Numbered regions and the equivalent text controls
open smaller areas; search covers all 41 areas and features. Features and scent
have their own section. Only the selected area's preferences are shown. The
underlying 123 individual answers still feed review, boundaries and sharing.
Unanswered areas remain unanswered; mixed preferences have a distinct map colour.

Verification: 22 automated tests passed; catalog validation and production build
passed. Browser checks covered region selection, front/back switching, keyboard
activation, search, independent perspectives, soft/hard limits, experience and
notes, and persistence after reload. Mobile layout is implemented but has not
been browser-verified. The existing large-bundle build warning remains.
