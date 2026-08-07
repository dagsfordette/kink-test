# Semantic concept and question model

The authoritative Plan 03 documentation is [`docs/semantic-question-model.md`](docs/semantic-question-model.md).

## Core rule

Every directly questioned concept has a `semanticType`, and that semantic type determines which base question dimensions are meaningful. The questionnaire separately stores:

- fantasy/idea appeal;
- real-world desire;
- experience (only when semantically meaningful);
- preference based on actual experience (only when meaningful);
- openness/willingness;
- boundary.

Fantasy-only is an explicit willingness stance. Hard limits remain boundaries and are not negative preference scores.

The prior `dimensions` field is retained only for compatibility/debugging. Plan 03 rendering uses the semantic type's `questionDimensions` template plus any future explicit `questionModel.overrides`.
