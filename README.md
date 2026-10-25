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

Activity entry uses the shared body and attraction setup once. The explorer starts with the most relevant available topic based on the existing fantasy recommendations and eligibility rules. It presents one activity at a time and moves to the next suitable topic automatically when the current topic is complete. Back, Skip for now, pause/resume, and saved-answer review remain available. There is no topic picker, Change topic button, activity counter, activity browser, sidebar, search, pagination, or excluded-activity list. The body-area topic opens the existing painting surface; Continue advances to the next topic.

Answers save automatically without advancing the card. The guided path and back history, including previous topics, survive reloads and private-backup restoration. Skipped activities remain skipped across automatic topic changes and can be revisited at the end. Simpler activities come first, with broader activities before their subtypes. Declining a broad activity sets aside unanswered subtype follow-ups without writing answers or boundaries for them. Existing answered activities remain editable through Review answers.

Optional “Explore variations” examples are available before answering. Power exchange (39 activities), Service & protocol (30), Bondage & restraint (58), Rope bondage (24), Sensory deprivation & control (22), and Impact play (28) have curated examples, learning order, and a concrete main detail question that opens after interest or uncertainty. Additional detail, notes, and shared preferences stay optional. The experience bar is always expanded and selectable before an interest or limit answer. Experience-only selections survive reload without creating an interest answer and carry forward when a stance is selected. Selected detail interests can prioritize related questions while preserving prerequisites; unselected choices do not exclude activities. Other categories retain their existing detail controls.

Broader preferences are occasional standalone questions after three relevant exploratory answers in the same role. At least three additional activity answers separate broader prompts; tone and scope are separate questions. The question refers to activities already explored, allows uncertainty or “depends”, and saves pending selections across pause/reload. Activity cards show a collapsed “Customize for this activity” control only after a broader preference has been addressed or a local choice already exists. Local exceptions do not change the general preference. Power exchange and service can remember tone and scope separately for directing and following. Ongoing service rules do not ask scene-only scope. Restraint can remember atmosphere separately for restraining and being restrained. Rope, sensory control, and impact also remember atmosphere separately for giving and receiving. Equipment, body position, duration, restriction, suspension, affected senses, force, and marks are never generalized. Remembered values require “Use for this activity”, never create inferred answers, and can be updated explicitly. Choosing “It depends” or remaining unsure never narrows the path. Shared suggestions and guided history stay private.

Fantasy scores filter by theme, perspective and the catalog’s explorationIntensity (1 mild, 2 moderate, 3 intense). Clear strong preferences permit the full range on that side and can hide the opposite power direction; weaker preferences retain mild activities. Specific theme interests take precedence over broad power inferences. Mixed/sparse evidence remains open; optional topic preferences are under “What shapes this path?”. Manual topic choices apply to that category. Not sure leaves it unrestricted. These filters are not saved boundaries or a risk assessment.

Attraction preferences filter declared partner-anatomy requirements and relevant body-hair interests. Broad preferences do not exclude generic activities that can fit any partner; gender is not used to guess anatomy. Your own body facts filter activities involving your body. Topic preferences can be adjusted under “What shapes this path?”.

Verification for this revision: 57 automated tests, catalog validation for all 1,000 activities, production build, and DOM interaction checks. DOM checks additionally cover standalone prompts, delayed scope, no premature broad controls across six categories, uncertainty, prompt reload/pause, and local exceptions. Earlier unchanged-flow checks covered experience-first selection, clearing and reload, automatic entry without a picker, recommendation order, relationship-to-power transitions, Back across topics, resuming existing questions, final completion, and all six adapted categories, automatic main follow-ups after interest or uncertainty, detail-led ordering, shared-preference offer choices, explicit reuse, role separation, one-card presentation, Back, reload, pause/resume, and review/edit return. These are not real-browser visual checks. A browser was unavailable in this environment; desktop/mobile rendering, pointer painting, and print layout have not been reverified for this revision. The existing large-bundle warning remains.

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

## Clothing and materials collection

The guided clothing/materials category now groups the existing content into 35 interests across Materials, Clothing, and Objects. Unmarked means no particular interest. Enjoy, Love, Fetish, and No / turn-off are explicit marks; selecting the same mark again clears it. Positive marks reveal optional perspectives and private notes. Continue never requires marking items or completing details.

Preferences persist in the browser and private backups, with an editable summary in Review answers. Partner exports, comparison views, and print reports include explicit ratings only; private perspectives and notes are excluded. The original category questions are excluded from question queues, unanswered counts, and activity comparison rows.

Validation: 63 automated tests pass, including reload/private-backup round trips, public sharing, optional details, neutral/negative distinctions, collection navigation and Back. Production build and catalog validation pass. React rendering smoke checks pass for unmarked, positive, and negative states. Browser layout and click-through remain unverified: no browser executable was available and the attempted download returned an invalid archive.

## Roleplay role picker

Roleplay now uses compact, independent ratings for being a character and having a partner play that character. Optional full-width details appear only for Curious, Enjoy, or Love. No and unmarked stay distinct. Counterpart roles and their rating overrides are optional, and do not answer other roles or activities automatically. Separate scenario/theme cards preserve the non-role parts of the existing category. All 29 original roleplay subjects are mapped to the new collection.

There are 29 roles across five groups and 13 scenario/theme cards. Users can Continue without marking any item or completing any details. Review includes an edit link, while private backups preserve every detail. Partner sharing and print include perspective ratings, selected counterparts, pairing overrides (including No), and theme ratings. Notes and appealing-element selections remain private. Clothing/material changes are included.

Validation for this update: 71 automated tests pass; production build and catalog validation pass. React rendering checks cover empty, one-positive, and both-positive perspective states, private/public summaries, pairing overrides, and integration in the guided explorer. Browser click-through and visual layout remain unverified because a browser executable is unavailable in this environment.

## Settings and contexts collection

All 11 existing sexual settings are now cards with Enjoy, Love, Particularly exciting, and No ratings. Unmarked means no particular preference. Positive marks reveal setting-specific optional choices and private notes. Users can Continue with any or all settings unmarked; settings no longer create an unanswered-activity backlog. Location ratings never answer watching, recording, or multi-partner activities.

Browser saves and private backups preserve setting details. Review supports editing the collection, and partner exports, comparison summaries, and print include explicit setting ratings only. Detailed selections and notes stay private. The previous Roleplay and clothing/materials updates are included.

Validation for this update: 77 automated tests pass, including coverage of every existing setting, neutral/negative distinctions, persistence, private/public exports, independent activity answers, and navigation. Production build, catalog validation, and React rendering checks pass. Browser layout and click-through remain unverified because no browser executable is available.

## Body features and grooming actions

The former appearance/body-features category now uses the approved compact action cards: four groups (Body hair, Pubic hair, Facial hair, Muscles) and 16 concrete actions. Each direction has its own Enjoy, Love, Fetish, or No rating. Shaving a partner’s pubic or facial hair and having a partner shave yours are four independent answers. No vague “make a focus” rows or repeated attraction questions appear in this collection. Piercing and height/build attraction remain in the introduction’s existing preferences.

All action ratings are optional; unmarked means no particular interest. Positive marks expose optional group notes. The collection supports automatic category progression, Back, resume, review editing, private backup/restore, partner share/import, comparison summaries, and print reports. Notes stay private, while explicit ratings—including No—are retained in partner output. Clothing/materials, Roleplay, and Settings/contexts updates are included.

Validation for this update: 83 automated tests pass, including shaving direction independence, neutral/negative distinctions, note handling, persistence, private/public exports, and collection navigation. Production build and catalog validation pass. React rendering checks cover both shaving directions, compact rows, positive-only notes, public summaries, print output, resume, and unrestricted Continue. Browser layout and click-through remain unverified because no browser executable is available.

## Tattoo action card

Tattoos now has one compact card with four independent actions: tracing a partner’s tattoos, having yours traced, kissing a partner’s tattoos, and having yours kissed. Each supports Enjoy, Love, Fetish, No, or an unmarked default of no particular interest. Optional private notes appear after a positive mark. The old admiration and vague focus questions are excluded from the guided queue and unanswered counts.

Tattoo actions reuse the body-feature card and persistence model while remaining a separate category and summary. Review editing, Back, resume, private backup/restore, partner sharing/import, comparison summaries, and printing are connected. Public outputs contain explicit ratings only, including No. Notes remain private. All earlier category updates are included.

Validation: 88 automated tests pass, production build and catalog validation pass, and React rendering checks cover the four-row card, single-option picker removal, private/public notes, separate body-feature/tattoo views, print output, and unrestricted Continue. Browser layout and click-through remain unverified because no browser executable is available.

## Sensory interest cards

Sensory interests now matches the approved mockup: six cards (speaking voice, accents, whispering, sounds of pleasure, ASMR-style audio, perfume/cologne) grouped into Voices & sounds and Fragrance, with nine independent ratings. Enjoy, Love, Fetish, and No are explicit marks; unmarked means no particular interest. Positive marks reveal optional qualities and notes. A single-item fragrance picker is omitted.

The old 43 sensory-category questions are excluded from the guided queue, unanswered counts, and ordinary activity-comparison rows. Natural body scent, touch, temperature, texture, pressure, massage, and tickling remain in their existing sections; no sensory-interest answer invents or changes answers there. Review editing, Back, resume, private backup/restore, partner sharing/import, comparison summaries, and print are connected. Public sensory output includes exact ratings only; qualities and notes remain private. All earlier category changes are included.

Validation: 94 automated tests, production build, catalog validation, and React rendering checks pass. Checks cover independent directions, positive-only details, private/public exports, no single-option picker, printing, and unrestricted Continue. Browser layout and click-through remain unverified because no browser executable is available.

## Body-scent card

Body scent now uses one compact card with two independent rows: enjoying a partner’s natural body scent and having a partner enjoy yours. Each supports Enjoy, Love, Fetish, No, or an unmarked default of no particular interest. Positive marks expose an optional private note for particular scents, areas, or preferences. There is no topic picker or repeated heading.

The card reuses the body-feature persistence model while remaining a separate category and summary. Natural body scent stays independent of perfume/fragrance interests. Review editing, Back, resume, private backup/restore, partner sharing/import, comparison summaries, and printing are connected. Public output retains explicit ratings only; notes remain private. All earlier category updates are included.

Validation: 99 automated tests, production build, catalog validation, and React rendering checks pass. Checks cover independent ratings, clearing vs No, private/public notes, backup/restore, separation from fragrance, blank completion, Back, printing, and unrestricted Continue. Browser layout and click-through remain unverified because no browser executable is available.

## Toys and devices collection

Toys & devices now uses 12 compact device cards and 35 independent perspective ratings. Solo use, using a device on a partner, and having a partner use it on you are separate where relevant. Sex swings retain two positioning perspectives. Enjoy, Love, Fetish, and No are explicit marks; unmarked means no particular interest. Positive marks expose optional device-specific private notes.

Existing anatomy, attraction, and activity filters shape the device rows; saved marks remain visible if preferences later change. Duplicate strap-on, chastity-device, and bondage-furniture questions stay in their existing Sexual activities, Chastity, and Bondage/restraint sections. Urethral-sounding and catheter questions retain their IDs and individual metadata under Medical-themed & edge activities. Electrical stimulation devices remain distinct from electrical edge-play questions.

Review editing, Back, resume, private backup/restore, partner sharing/import, comparison summaries, and printing are connected. Public toy output includes explicit perspective ratings only, including No; notes remain private. All earlier category updates are included.

Validation: 106 automated tests, production build, catalog validation, and React rendering checks pass. Checks cover independent perspectives, anatomy/attraction filtering and saved-answer retention, optional notes, private/public exports, blank completion, Back, and printing. Browser layout and click-through remain unverified because no browser executable is available.
