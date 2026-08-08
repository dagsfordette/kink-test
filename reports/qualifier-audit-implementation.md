# Qualifier audit implementation

Source: `reports/kink-qualifier-audit.md`

## Result

- 412 audited concepts covered.
- Every audited concept resolves to at least two active structured qualifiers.
- Shared profiles now support concept-scoped fields and options through `appliesToConceptIds` / `excludeForConceptIds`.
- Options can also use `showWhen` for answer-dependent conditionality (used for anatomy-dependent oral-sex choices).
- The catalog validator reports 0 errors. The only remaining warnings are the two pre-existing near-duplicate-label editorial warnings.
- `scripts/qualifier-audit-regression.test.mjs` checks the complete flagged set plus the major systemic failure modes from the audit.

## Main changes

Sibling-topic menus were removed or narrowed in restraint, impact, sensation, anal, orgasm/chastity, humiliation/objectification, psychological play, multi-partner, remote/digital, roleplay, and sexual-setting profiles. Sexual activities/devices now include physical privacy/location conditions and use anatomy-specific targets where relevant. Praise/worship, medical/edge, and fluids/mess topics now have structured qualifiers instead of only a generic free-text field.

Roleplay authority/costume questions are no longer unconditional. Pet play and primal play have dedicated detail profiles. Pure fantasy themes use fantasy-specific profiles instead of inheriting enactment-oriented roleplay questions. Relationship scope is hidden where the main concept already fixes it, and emotion blend matrices omit the parent emotion itself.
