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

Activity entry uses the shared body and attraction setup once. The explorer has one guided flow: choose a topic, answer one activity at a time, then Continue. Back, Skip for now, pause/resume, and saved-answer review remain available. There is no activity browser, sidebar, search, pagination, or excluded-activity list. The body-area topic opens the existing painting surface.

Answers save automatically without advancing the card. The guided path and back history survive reloads and private-backup restoration. Simpler activities come first, with broader activities before their subtypes. Declining a broad activity sets aside unanswered subtype follow-ups without writing answers or boundaries for them. Existing answered activities remain editable through Review answers.

Optional “Explore variations” examples are available before answering. Power exchange (39 activities), Service & protocol (30), and Bondage & restraint (58) have curated examples, learning order, and a concrete main detail question that opens after interest or uncertainty. Additional detail, experience, notes, and shared preferences stay optional. Selected detail interests can prioritize related questions while preserving prerequisites; unselected choices do not exclude activities. Other categories retain their existing detail controls.

Power exchange and service can remember tone and scope separately for directing and following. Ongoing service rules do not ask scene-only scope. Restraint can remember atmosphere separately for restraining and being restrained; equipment, body position, duration, and restriction are never generalized. Remembered values require “Use for this activity”, never create inferred answers, and can be updated explicitly. Keeping a choice specific, choosing “It depends”, or remaining unsure never narrows the path. Shared suggestions and guided history stay private.

Fantasy scores filter by theme, perspective and the catalog’s explorationIntensity (1 mild, 2 moderate, 3 intense). Clear strong preferences permit the full range on that side and can hide the opposite power direction; weaker preferences retain mild activities. Specific theme interests take precedence over broad power inferences. Mixed/sparse evidence remains open; optional topic preferences are under “What shapes this path?”. Manual topic choices apply to that category. Not sure leaves it unrestricted. These filters are not saved boundaries or a risk assessment.

Attraction preferences filter declared partner-anatomy requirements and relevant body-hair interests. Broad preferences do not exclude generic activities that can fit any partner; gender is not used to guess anatomy. Your own body facts filter activities involving your body. Topic preferences can be adjusted under “What shapes this path?”.

Verification for this revision: 47 automated tests, catalog validation for all 1,000 activities, production build, and DOM interaction checks. DOM checks additionally cover all three updated categories, automatic main follow-ups, detail-led recommendations, all shared-preference offer choices, category-specific reuse, and topic selection, one-card presentation, variations, explicit preference reuse, back/skip, reload, pause/resume, review/edit return, explicit application of remembered values, body-map entry, completion/back/revisit, and entry confirmation. These are not real-browser visual checks. A browser was unavailable in this environment; desktop/mobile rendering, pointer painting, and print layout have not been reverified for this revision. The existing large-bundle warning remains.

## Body-area painting

Body-area interests is a freehand painting surface, with no body-area activity
questions. Brushes: No, Enjoy, Love, This is a fetish, and Eraser. Unmarked areas
have no rating. Brush size, undo/redo, clear-view and keyboard painting are
available. Mouse, pen and touch pointer events use normalized portrait coordinates.

The existing realistic male/female front/back models remain. Anatomy/partner
preferences select the model automatically. When unspecified, the female
model is the default. Old manual model selections are no longer used. Each
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

Earlier body-map verification (before this guided-flow revision): real pointer drawing and placement, keyboard painting, erasing,
undo/redo, clear-view, reload persistence, independent views/owners/models, and
painted-map review/profile rendering. Touch/mobile and print layout remain
browser-unverified. The existing large-bundle warning remains.

Bundled generated artwork: `public/body-figure-realistic.webp` (female) and
`public/body-figure-male.webp` (male). No external image service is used at runtime.

### Activity example images

Cards with reference images have a collapsed **Show example image** section. Images load only after it is opened, include alternative text and source/license credits, and can be opened larger. They are local files, so exploring activities makes no requests to image providers. The initial set contains seven non-graphic object/material photographs across 19 activity cards; other cards have no image section.

To add examples, put an optimized image in `public/activity-images/` and add an entry to `src/data/activityImages.json` with a unique `id`, `src` relative to `public/`, exact `activityIds`, `alt`, `caption`, pixel `width`/`height`, `title`, `credit`, `sourceUrl`, `license`, `licenseUrl`, `changes`, and `verifiedOn`. Multiple entries may reference the same activity. Map each perspective explicitly; images do not inherit through category or boundary relationships. Keep `IMAGE-CREDITS.md` updated. Verify the individual file's license, required credit and suitability before bundling it.
