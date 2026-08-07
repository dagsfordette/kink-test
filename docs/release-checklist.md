# Plan 09 — Release Checklist

Use this checklist for every release that changes catalog data, question logic, adaptive routing, scoring/results, comparison logic, migrations, import/export, or print output.

## Before merging

- [ ] Stable canonical IDs are preserved whenever reasonable.
- [ ] Any changed ID/shape has an explicit migration path and test.
- [ ] New specialist content has a neutral definition and correct depth placement.
- [ ] Quick changes are intentional and reviewed as routing changes, not accidental catalog-order changes.
- [ ] Hard-limit, not-interested, skipped, unanswered, fantasy-only, and conditional states remain distinct.

## Automated release gate

Run `npm run release:check` in an environment with dependencies installed. It must complete:

- schema/catalog validation,
- catalog audit and deterministic-baseline verification,
- catalog/taxonomy/semantic tests,
- adaptive-branch tests,
- depth/gate tests,
- results/scoring regression tests,
- negotiation/risk tests,
- editorial/content tests,
- partner-comparison tests,
- eight synthetic regression fixtures,
- import/migration/response-format tests,
- user-testing branch-logic evidence tests,
- print/export preservation tests,
- release-process tests,
- production build.

GitHub Pages deployment uses the same `npm run release:check` gate.

## Human usability evidence

For material wording, branching, or interaction changes, run the structured protocol in `docs/user-test-script.md` and record findings using `docs/user-test-findings-template.md`.

Do not claim synthetic regression fixtures are human user testing. Do not delete legitimate Exhaustive content solely in response to fatigue; evaluate routing and UI first.

## Release notes

- [ ] Update `CHANGELOG.md`.
- [ ] Update app/package version.
- [ ] Update response schema version only when exported structure/semantics change.
- [ ] Update questionnaire/catalog version only when questionnaire content/schema warrants it.
- [ ] Record migration behavior and the oldest format actively covered by tests.
- [ ] If a compatibility state changes meaning, bump the comparison-model version and add fixtures for the old edge case.
