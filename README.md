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

Browser saves use a shared write lock and revision checks. A stale tab pauses and offers a private backup before reloading; erasure invalidates older tabs and cancels pending saves. Erasure retries storage independently after a failed save while still checking for newer profiles. Browsers without Web Locks or working storage show a warning to download a private backup.

Verification: twenty-one regression tests, catalog validation and the production build pass. Partner comparison applies reviewed branch Hard limits on both profiles, respects exact exceptions, and explains inherited limits in comparison rows. Explicitly shared partner Play Preferences appear above comparison results; omitted and empty sections are distinguished. All comparison results are reachable through pages of 50, with result-type filters and visible ranges. Activity cards stay in place while editing; off-page drafts remain accessible, and Save & next follows the original successor across page boundaries. Browser interaction and layout remain unverified. The build still emits a large-bundle warning.
