# Adult Kink Inventory — React/Vite Prototype v0.4.1

A static, local-first prototype for an adaptive adult kink/BDSM preference inventory.

## What is included

- React + Vite single-page application
- Questionnaire catalog bundled locally (594 concepts)
- 8 top-level navigation domains containing all 32 detailed category areas
- Canonical concepts can be cross-listed in related categories without creating duplicate answer keys
- Explicit Quick / Standard / Exhaustive depth catalogs per category
- Five-state category routing gates stored separately from concept answers
- Adaptive category branching
- Semantic perspectives: giving / receiving where that makes sense, plus role-specific perspectives such as **as dominant** and **as submissive**
- Semantic type-to-question templates instead of one activity-shaped form
- Separate fields for:
  - fantasy / idea appeal
  - real-world desire
  - tried / experience level where meaningful
  - experienced preference where meaningful
  - openness / willingness, including **Fantasy only**
  - boundaries
  - notes
- Follow-up questions use explicit parent-state branching: interested/open/unsure/fantasy-only responses open relevant details, while not-interested/hard-limit responses collapse them by default
- Question-family-specific adaptive profiles, including per-subtype preference matrices with appealing / acceptable / conditional / not interested / hard limit states
- Dedicated oral-sex follow-ups covering applicability, focus/type, positions, preferred vs maximum roughness/depth, style/control, completion/orgasm preference, and the meaning/dynamic of the activity
- Tailored detail profiles for power exchange, bondage, impact play, sensation play, anal play, orgasm control, humiliation, exhibitionism, multi-partner activity, roleplay, fetishes, psychological play, and relationship dynamics
- Dedicated **Sexual context & locations** category instead of attaching a generic “setting” field to every sexual act
- LocalStorage persistence only
- JSON export/import
- PDF export through a dedicated print report (browser **Save as PDF**)
- Concept-weighted results with separate fantasy interest, real-world desire, experience, willingness, perspective, conditions, concept/detail/category boundaries, and qualitative category/domain summaries
- A separate general negotiation/care profile covering communication, stop/check-in methods, aftercare, marks, privacy/recording, and partner/context familiarity
- Descriptive multi-domain risk metadata (`physical`, `medical`, `psychological`, `consent_complexity`, `privacy`, `digital_security`, `reputational`, `financial`) instead of generic standard/elevated/high severity badges
- Contextual high-level safety/negotiation prompts tied to those risk domains; the questionnaire remains informational and non-procedural
- Dark/light theme
- Responsive desktop/mobile layout
- GitHub Pages workflow

## Interaction model

The prototype deliberately separates several different ideas:

1. **The activity itself** — e.g. giving oral sex.
2. **Physical preferences** — e.g. position, preferred/max roughness, whether orgasm is a goal.
3. **Erotic meaning / relationship dynamic** — e.g. ordinary mutual sex, giving pleasure, service/submission, worship, dominance/control, or humiliation.

This prevents the test from assuming that enjoying an act automatically means enjoying it as submission, dominance, or any other kink role.

Plan 03 separates willingness from fantasy appeal and real-world desire. The willingness model is **Actively want / Interested in trying / Open to it / Unsure / Fantasy only / Not interested / Hard limit**. Boundary value `none` is labeled **No special boundary** rather than the ambiguous “No limit”. Legacy saved willingness values remain readable until explicitly changed by the user.

## Privacy model

The prototype has no backend and sends no questionnaire answers anywhere. Answers remain in the current browser's `localStorage` unless the user explicitly exports a JSON file or prints/saves a PDF.

For a production deployment, carefully review any analytics, crash reporting, CDN, fonts, or third-party scripts before adding them. Even ordinary telemetry can be inappropriate for data this sensitive.

## Local development

Requirements: a current Node.js release and npm.

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
npm run preview
```

## GitHub Pages deployment

The repository includes `.github/workflows/deploy.yml`.

1. Create a GitHub repository and push this project to the `main` branch.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **GitHub Actions** as the source.
4. Push to `main` or manually run the workflow from Actions.

`vite.config.js` uses `base: './'`, so built assets use relative paths and work under a repository subpath.

## Taxonomy navigation

Plan 02 organizes the detailed catalog as **Domain → Category → Concept/details**. Every concept has explicit canonical ownership (`canonicalId`, `primaryCategory`, `relatedCategories`, `domain`, and `semanticTags`). Related-category placements reuse the same `conceptId::perspective` answer identity and do not change category scoring ownership. See `docs/taxonomy-and-information-architecture.md` and `docs/overlap-review.md`.

## Semantic question model

Plan 03 makes `semanticType` authoritative for base-question dimensions. Activities and devices may ask experience; impossible fantasies do not; body-part/material/stimulus concepts use attraction and real-world-interest questions instead of activity-shaped experience questions. The full schema, migration/default rules, and acceptance checks are documented in `docs/semantic-question-model.md`. The machine-readable migration is `reports/semantic-question-migration.json`.

## Dynamic detail question system

Plan 04 formalizes adaptive follow-ups. Concept details are driven by parent state, can be manually expanded even when automatically collapsed, and can hide implementation-only fields for a **Fantasy only** response. High-value impact, bondage, body-part, material, roleplay, emotion, and sexual-activity profiles now use reusable detail primitives and independent subtype preference matrices. Distinct interests remain canonical concepts when collapsing them would lose meaningful preference differences.

See `docs/dynamic-detail-question-system.md` and `reports/dynamic-detail-migration.json`.

## Depth modes and category gates

Plan 05 makes depth intentional rather than positional. Each category declares explicit `quick`, `standard`, and `exhaustive` concept lists. Quick emphasizes representative concepts; Standard broadens into common/moderately-specialized distinctions; Exhaustive includes every directly discoverable concept, including specialist material and canonical cross-listings.

Category gates are now routing-only: **Interested / Maybe / Not interested / Hard limit for this area / Skip for now**. Gate records live under `categoryGates`, never contribute to concept scores, and preserve category-wide hard limits separately from concept-level boundaries. Legacy `Detailed` mode imports normalize to Standard, and legacy `categoryId::overall` gate records migrate into the new routing model.

See `docs/depth-modes-and-category-gates.md` and `reports/depth-mode-migration.json`.


## Scoring, results, and boundary semantics

Plan 06 changes aggregation from perspective-record weighting to **perspective → concept → category → domain**. Each concept contributes at most one value per result dimension to its primary category, so a concept with Giving + Receiving does not automatically outweigh a Mutual-only or single-perspective concept. Perspective rows remain visible as sub-results.

Fantasy interest, real-world desire, experienced preference, experience, willingness, conditions, and boundaries remain separate. Hard limits are never converted into low-preference numbers; concept hard limits, subtype hard limits, and category-wide hard limits are reported independently. The primary UI uses qualitative labels such as **Strong interest**, **Moderate interest**, **Mixed / neutral**, and **Mostly not interested** rather than presenting the internal linear index as psychometric precision.

Legacy willingness values are normalized only while calculating results and are not rewritten in saved/imported answers. See `docs/scoring-results-and-boundaries.md` and `reports/scoring-results-migration.json`.

## Negotiation, risk, privacy, and care

Plan 07 adds a separate **Negotiation, privacy & care** questionnaire section. Its answers live under `negotiationPreferences`, contribute no interest score, and are surfaced prominently in both Results and the print/PDF report. The profile covers communication style, stop/check-in methods, aftercare, marks, recording/privacy constraints, and partner/context familiarity.

Concept safety metadata now uses descriptive `riskDomains` rather than `standard` / `elevated` / `high` labels. A concept can carry multiple domains, and each domain maps to a short high-level negotiation/care prompt. Digital/media prompts cover storage, screenshots, identification, redistribution, and deletion; financial prompts cover explicit money limits; consent-complex prompts emphasize prior negotiation and a clear pause/stop method; physical/medical prompts remain informational and non-procedural.

See `docs/negotiation-risk-privacy-and-care.md` and `reports/risk-and-negotiation-migration.json`.

## Content expansion and editorial quality

Plan 08 expands the catalog from **554 to 594 canonical concepts** without removing or reordering any Plan 07 ID. It adds high-value gaps across anal/sexual activities, impact, toys/devices, chastity, orgasm control, roleplay, psychological play, body-part interests, materials/clothing, emotions, relationship dynamics, and transformation fantasy. Wearable/remote-toy variants and broad transformation subtypes use adaptive details instead of duplicate canonical concepts.

The old `Neutral adult self-assessment item covering …` boilerplate is retired. All **562 definition-eligible, non-gate concepts** now have substantive descriptions; exact duplicate-label groups and capitalization warnings are resolved. Quick mode is unchanged, while Standard and Exhaustive receive the new breadth. See `docs/content-expansion-and-editorial-quality.md`, `docs/content-gap-review.md`, `docs/editorial-style-guide.md`, and `reports/definition-coverage.md`.

## Questionnaire data

The canonical UI data file is:

`src/data/catalog.json`

The catalog includes a `detailProfiles` collection. Concepts reference a `detailProfileId`, so the UI can generate activity-appropriate follow-ups without hard-coding every field into React components.

Follow-up answers are stored under:

```json
{
  "details": {
    "body_area_preferences": {
      "buttocks": "appealing",
      "face": "hard_limit"
    },
    "roughness": {
      "preferred": "moderate",
      "maximum": "rough"
    }
  }
}
```

This is separate from preference, willingness, experience, and boundary state.

## PDF export

The **Export PDF** button opens the browser's print dialog using a print-only report. Choose **Save as PDF**. This keeps response data local instead of uploading it to a conversion service.

## Prototype caveats

- The taxonomy is broad but not literally exhaustive of every kink or sexual preference.
- Result labels are descriptive self-assessment summaries rather than validated psychometric scores. An internal 0–100 linear index is retained only for compatibility/visual positioning and is not presented as a probability or compatibility percentage.
- The semantic detail profiles are much more specific than v0.1, but a production questionnaire would still benefit from reviewing individual concepts one by one rather than assuming every concept in a family needs identical follow-ups.
- Risk metadata is descriptive rather than moralized: physical, medical, psychological, consent-complexity, privacy, digital-security, reputational, and financial domains select high-level negotiation/care prompts. The prototype intentionally contains no procedural instructions.
- This prototype does not include accounts, synchronization, partner matching, analytics, or server-side storage.

## GitHub Actions note

The deployment workflow uses `npm install` rather than `npm ci` because the prototype does not include a generated `package-lock.json`. npm dependency caching is disabled, so the workflow does not require a lockfile.

## v0.3.1 model changes

- Directional acts can now be represented once with perspectives. **Oral sex**, for example, contains **Giving** and **Receiving** rather than being two unrelated concepts.
- A new **Emotions & arousal states** category measures what feelings themselves are erotic, separately from physical activities. Each emotion can be rated as **Feeling it** and **Seeing / evoking it** in a consenting partner.
- Emotional concepts intentionally omit generic willingness/boundary controls when they do not make semantic sense; their follow-ups focus on triggers, meaning, combinations, and partner reactions.


## Consent wording

The inventory treats informed adult consent as a global premise rather than repeating “consensual” in ordinary activity names. Explicit consent wording remains where it changes or clarifies the meaning of the concept.

## Semantic model (v0.3.3)

Every catalog concept now has a `semanticType`:

- `activity`
- `dynamic`
- `emotion`
- `motivation`
- `stimulus`
- `context`

The type changes renderer wording and controls which follow-up families are legal for that concept. This prevents concepts such as dominance, fear, latex, and hotel sex from all being treated as though they were interchangeable physical acts.

`motivation` is intentionally configured with `directQuestioning: false`; the current prototype does not ask users to explain why a preference is erotic.

See [`SEMANTIC_MODEL.md`](./SEMANTIC_MODEL.md) for the full design.

### Body/anatomy compatibility

Selected activities and stimuli can now expand an optional partner/body profile. Gender identity, gender expression, anatomy, and body traits are stored independently and are scoped to the specific activity/perspective. No dimension implies another.

## Catalog audit and validation

Structural audit tooling is available before making later taxonomy/scoring changes:

```bash
npm run audit
npm run audit:check
npm run validate:catalog
npm run test:catalog
```

The deterministic baseline outputs are committed under `reports/`. See [`docs/catalog-validation.md`](./docs/catalog-validation.md) for warning/error classes and scoring-diagnostic semantics.


## Plan 09 release and compatibility tooling

The Results screen can optionally load a second inventory JSON for an in-memory partner comparison. The comparison uses named interaction states—directional/shared matches, discussion areas, fantasy/real-world mismatches, conditional matches, hard-limit conflicts, and insufficient data—and intentionally does not calculate a compatibility percentage.

For release work, run `npm run release:verify` to execute the complete automated suite plus deterministic catalog audit. In a normal development/CI environment with Vite installed, `npm run release:check` additionally runs the production build. Human usability rounds should follow `docs/user-test-script.md` and record findings with `docs/user-test-findings-template.md`.
