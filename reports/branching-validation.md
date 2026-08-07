# Plan 09 — Structural Branching Validation

This report is automated/structural evidence, not a substitute for human usability sessions.

## Measured catalog surface

- Adaptive concept-perspective branches with a detail profile: **1,122**
- Possible non-deprecated detail-field exposures across those branches: **4,441**

## Irrelevant-detail suppression

For a parent answer of **Not interested** or **Hard limit**, adaptive detail is closed by default. The structural harness therefore suppresses **4,441 / 4,441** possible descendant field exposures until the user explicitly chooses the manual override.

The manual override re-opens the branch without changing the parent state or deleting saved detail data. This demonstrates repetition reduction without making exceptions impossible to express.

## Fantasy-only relevance filtering

For **Fantasy only** parents:

- **4,052** fantasy/both-relevant field exposures remain available.
- **389** real-world-only field exposures are suppressed.

This preserves expressive fantasy detail while avoiding implementation-only follow-ups that contradict the parent state.

## Uncommon-preference coverage

The Plan 09 test harness verifies that specialist items omitted from Quick routing remain discoverable in Exhaustive mode (for example Needle play in the higher-risk/medical area), and that a collapsed adaptive branch can always be manually opened.

## Human validation

Use `docs/user-test-script.md` for comprehension, scale clarity, repetition, fatigue, and exception-finding sessions. Record actual participant evidence in a copy of `docs/user-test-findings-template.md`; do not mix synthetic fixtures with human findings.
