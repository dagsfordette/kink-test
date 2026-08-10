# Kink Exploration prototype

A local-first React/Vite prototype built around two deliberately different adult self-exploration jobs:

- **Fantasy Profile** — private reflection on fantasies, emotions, roles, and erotic themes: *What turns my imagination on?*
- **Activity Explorer** — real-world activity stance, experience, boundaries, conditions, and partner discussion: *What do I actually want, consider, or limit in real life?*

The integrated product principle is: **Discover yourself broadly. Explore reality precisely.** Neither experience is required before the other.

## Run locally

Requirements: Node 24+.

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm test
npm run validate:activity-catalog
npm run validate:fantasy-profile
npm run build
npm run preview
```

## Current project structure

```text
src/
  App.jsx
  components/
    product/                 Home, shared navigation, My Profile, print report
    fantasy/                 Fantasy Profile UI
    activities/              Activity Explorer + partner comparison UI
  data/
    fantasyProfile.json      Fantasy questionnaire/scoring data
    activityCatalog.json     Real-world activity catalog
  lib/
    appState.js              Current v2.0.0 integrated product state
    appStorage.js            Current storage key only; no legacy reads/migration
    profileExports.js        Private backup + partner-share formats
    profileIntegration.js    Neutral fantasy-to-reality observations
    playPreferences.js       Reusable negotiation preferences
    fantasy*.js              Fantasy routing/scoring/results helpers
    activityProfile.js       Activity answers/navigation/filters/results
    activityRecommendations.js
    activityComparison.js
```

## Product navigation

The app opens on **Home** with two independent cards for Fantasy Profile and Activity Explorer. Shared navigation keeps four top-level destinations visible: Home, Fantasy Profile, Activity Explorer, and My Profile.

**My Profile** keeps fantasy and real-world information visually separate, then adds neutral observations only when both datasets exist. Differences between fantasy and real-world stances are never treated as contradictions or problems to fix.

## Activity Explorer model

Each answered activity stores exactly one real-world `stance`, plus optional independent `experience`, optional `details`, and an optional note.

The seven semantic stance states are:

```text
love
want
curious
if_partner_wants
dont_want
soft_limit
hard_limit
```

Experience is independent and never inferred. Category skipping and “hide for now” are navigation/relevance state only. Starter, extended, and specialized are content-order layers; the full catalog remains reachable.

## Fantasy-informed recommendations

When Fantasy Profile is complete, Activity Explorer may recommend varied real-world activities related to supported fantasy themes. Recommendations are recalculated from the current Fantasy Profile answers, but they only promote activities and explain why they may be worth considering. They never create, change, hide, or limit Activity Explorer answers.

## Privacy and exports

The app intentionally uses two incompatible export surfaces:

- `kink-exploration-private-profile` — private backup containing Fantasy Profile progress/answers/result metadata, Activity Explorer answers/navigation, Play Preferences, tailoring settings, and version metadata.
- `kink-exploration-activity-profile` — partner-share Activity Explorer data only. Fantasy answers, question sequence, themes, scores, and recommendation explanations are excluded. Play Preferences are included only when explicitly selected.

Partner Comparison accepts only the partner-share Activity Profile format. It does not accept private backups or arbitrary legacy profile JSON.

## Storage

The current integrated app state uses version `2.0.0` and the browser storage key:

```text
kink-exploration:profile:v2
```

There is no legacy storage read or migration path.

## Partner comparison

Directional activities use reciprocal `complementId` links; mutual activities compare the same activity ID. Hard-limit conflicts take precedence. Experience gaps are informational only. No overall compatibility percentage or score is calculated.

## Printing

- **Private report** from My Profile may include Fantasy Profile, Activity Explorer, and Play Preferences, with fantasy content explicitly labeled as fantasy.
- **Partner report** from Activity Explorer results contains real-world Activity Explorer data only; hard limits print first and prominently.

## Validation and tests

The automated suite covers dataset validation, Fantasy routing/scoring, exact Activity Explorer stances, independent experience, recommendation non-mutation, reciprocal complements, hard-limit precedence, export privacy, strict partner-share import, storage integrity, and the absence of a legacy universal runtime catalog.

This is not a psychometric, medical, diagnostic, or compatibility instrument. It is an adult self-reflection and communication prototype.
