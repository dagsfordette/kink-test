# Plan 09 — Structured User-Test Script

## Purpose

Use this script to test comprehension, scale clarity, adaptive branching, expressive coverage, repetition, and fatigue. It is a research protocol, not a diagnostic or clinical instrument. Participants must be adults and should be reminded that they can skip any item or stop at any time.

## Recruitment matrix

Run rounds that include all of these experience/interest profiles rather than treating one group as representative:

1. Adults unfamiliar with kink terminology.
2. Moderately experienced adults.
3. Highly experienced adults.
4. Adults whose interests are mostly conventional/common.
5. Adults with specialized or uncommon interests.

Record only the minimum demographic/context information needed to interpret usability findings. Do not collect identifying sexual-history detail unless it is necessary for the study and explicitly consented to.

## Session setup

- Use a fresh browser profile or exported test fixture rather than the researcher's personal response data.
- Let the participant choose Quick, Standard, or Exhaustive based on the task assigned for the session.
- Remind the participant that the questionnaire is local-first and that research notes are separate from their inventory answers.
- For moderated sessions, ask the participant to think aloud without explaining or defending why an interest appeals to them.

## Tasks and prompts

### 1. Comprehension

At a mix of common and specialist concepts, ask: **“Tell me what you think this question means.”**

Record whether the participant can explain the concept in their own words without needing outside terminology. If they use the definition, note whether it resolves confusion.

### 2. Scale clarity

Ask the participant to explain the difference between:

- Interested / actively want
- Open to it
- Unsure
- Fantasy only
- Not interested
- Hard limit

Then give short hypothetical examples and ask which response they would choose. Flag any pair of states the participant treats as interchangeable.

### 3. Dynamic branching

Use at least four parent states on concepts with adaptive details:

- Interested/open
- Unsure
- Fantasy only
- Not interested or hard limit

Observe whether useful detail appears when expected, whether irrelevant implementation detail stays collapsed, and whether the participant notices **Answer detailed questions anyway** when they want to express an exception.

Ask: **“Did the test ever stop you from expressing something important because of an earlier answer?”**

### 4. Exhaustiveness and exceptions

Ask:

- **“Was there anything important you could not express?”**
- **“Were there areas where the test grouped things that should have stayed distinct?”**
- **“Did you find a place to express unusual conditions, subtypes, or hard limits?”**

For specialized-interest participants, explicitly ask them to try to locate two uncommon interests in Exhaustive mode and one uncommon subtype through an adaptive detail branch.

### 5. Repetition

Ask: **“Which questions felt like the same preference asked repeatedly?”**

For every repetition report, classify it as one of:

- legitimate perspective distinction,
- legitimate first-class concept distinction,
- adaptive detail that could replace repetition,
- true duplicate/editorial issue,
- unclear.

Do not delete content solely because two labels sound related.

### 6. Fatigue

For Standard and Exhaustive sessions, record the category and approximate answered-item count at which the participant begins to rush, skip, stop reading definitions, or choose repeated answers without reflection.

Ask at the end: **“Where did you start feeling tired or tempted to rush?”**

Treat fatigue as routing/UI evidence first. It does not automatically justify removing legitimate content from Exhaustive mode.

### 7. Results and partner comparison

Ask the participant to interpret one category result, one fantasy-only result, one condition/boundary result, and—when a synthetic partner file is available—one comparison state.

Confirm that the participant understands:

- there is no single compatibility percentage,
- hard-limit conflicts are shown separately and override positive matches,
- fantasy/real-world mismatch is not the same as a hard-limit conflict,
- insufficient data is not a negative result.

## Exit questions

1. What felt clearest?
2. What was hardest to understand?
3. What felt repetitive?
4. What important preference or exception was hardest to express?
5. What would make you more confident using this output in a conversation with a partner?

## Success signals

A release candidate is ready to advance when no recurring comprehension problem blocks ordinary use, branching failures do not suppress exceptions, hard-limit semantics are consistently understood, and new repetition/fatigue findings can be traced to a specific routing, wording, or content decision.
