# Qualifier / subquestion audit

Source reviewed: `src/data/catalog.json` plus the adaptive-detail rendering logic in `src/components/AdaptiveDetails.jsx`. No project files were modified.

**Visible question concepts reviewed:** 562  
**Questions flagged for at least one definite or material cleanup:** 412

## What I counted as needing an update

- A qualifier is unrelated to the named main question.
- A qualifier is really a list of sibling questions, so it changes the subject instead of adding depth.
- A qualifier directly contradicts or merely repeats a fixed property in the main question.
- A clearly important condition is missing from an otherwise structured detail set.
- I did **not** flag something merely because more optional nuance could always be added.

## Main systemic findings

1. **Sibling leakage is the largest problem.** Several shared profiles were designed like category-level refinements, but are attached to specific leaf questions.
2. **The `sexual_activity` profile lacks physical location/privacy.** Its current `Context` is relationship/scene context, so it cannot represent “only at home/private.”
3. **Forty questions use only a generic free-text detail field.** Those are not wrong, but they lack structured qualifiers despite being topics where a few structured conditions materially change the answer.
4. **Roleplay and relationship profiles need field-level conditionality.** `Authority / power level`, scope, and remote/privacy fields should not appear uniformly.

## Complete flagged list

### Power exchange (13)

- **Reward-based control** (`reward_system`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Punishment-based control** (`punishment_dynamic`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Formal titles / honorifics** (`formal_titles`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Collaring as a relationship or scene symbol** (`collaring_dynamic`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Surrendering selected decisions** (`decision_surrender`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Controlling selected decisions** (`decision_control`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Control over sexual access** (`sexual_access_control`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Masturbation permission / control** (`masturbation_control`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Clothing / presentation control** (`clothing_control`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Posture / position control** (`posture_control`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Speech / permission-to-speak control** (`speech_control`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Eye-contact rules** (`eye_contact_rules`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Movement / position rules** (`movement_rules`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).

### Service & protocol (15)

- **Service-oriented submission** (`service_submission`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Receiving service in a dominant role** (`service_receiving`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Domestic service** (`domestic_service`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Personal service** (`personal_service`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Sexual service** (`sexual_service`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Formal protocol** (`formal_protocol`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Rituals and repeated routines** (`rituals`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Greeting / departure protocol** (`greeting_protocol`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Prescribed positions** (`position_protocol`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Assigned tasks** (`task_assignment`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Reporting task completion** (`task_reporting`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Standing rules between scenes** (`standing_rules`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Etiquette / protocol training** (`etiquette_training`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Waiting / attending service** (`waiting_attending`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).
- **Presentation / grooming requirements** (`presentation_grooming`)
  - **Missing important qualifier:** The current power-exchange qualifiers (`where`, `tone`, `structure`) are relevant but too generic for this specific control/service/protocol item. The defining content of the item itself is not refined (for example titles, decision domains, clothing/speech/movement rules, service/task types, ritual/protocol elements, reporting format, or grooming requirements).

### Bondage & restraint (23)

- **Wrist restraint** (`wrist_restraint`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Ankle restraint** (`ankle_restraint`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Arm restraint** (`arm_restraint`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Leg restraint** (`leg_restraint`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Full-body restraint** (`full_body_restraint`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Hands restrained behind the back** (`hands_behind_back`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Arms restrained overhead** (`arms_overhead`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Spread-position restraint** (`spread_position_restraint`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Standing restraint** (`standing_restraint`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Kneeling restraint** (`kneeling_restraint`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Compact full-limb restraint** (`hogtie_style_restraint`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Cuffs** (`cuffs`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Leather restraints** (`leather_restraints`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Fabric restraints** (`fabric_restraints`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Spreader bars** (`spreader_bars`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Stocks** (`stocks`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Bondage harness** (`bondage_harness`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Wrapping / mummification restraint** (`mummification`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Straitjacket-style restraint** (`straitjacket_style`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Cage / enclosure confinement** (`cage_confinement`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Predicament bondage** (`predicament_bondage`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Partial immobilization** (`partial_immobilization`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Full immobilization** (`full_immobilization`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.

### Rope bondage (12)

- **Rope bondage** (`rope_bondage_general`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Decorative / aesthetic rope** (`decorative_rope`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Functional restrictive rope** (`functional_rope`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Rope harnesses** (`rope_harness`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Chest harness rope** (`chest_harness_rope`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Hip harness rope** (`hip_harness_rope`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Limb-focused rope** (`limb_rope`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Floor-based rope bondage** (`floor_rope`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Partial suspension rope** (`partial_suspension`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Full suspension rope** (`full_suspension`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Rope pressure / texture sensation** (`rope_sensation`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Rope as ritual or protocol** (`rope_protocol`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.

### Sensory deprivation & control (11)

- **Blindfolds** (`blindfolds`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Hoods** (`hoods`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Earplugs / hearing reduction** (`earplugs`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Headphones / controlled audio** (`headphones_sensory_control`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Mittens / reduced hand dexterity** (`mittens_hand_control`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Darkness / visual deprivation** (`darkness`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Silence / reduced communication by agreement** (`silence`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Combined sensory deprivation** (`sensory_deprivation_combo`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Sensory overload** (`sensory_overload`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Not knowing the next negotiated action** (`unknown_next_action`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.
- **Highly controlled sensory environment** (`controlled_environment`)
  - **Needs update:** The shared `bondage` profile is too broad for this leaf. Area-specific questions are asked about other restraint areas; position-specific questions about other positions; method-specific questions about other methods; rope questions are offered non-rope methods; and sensory-deprivation questions inherit restraint-area/method/mobility fields that do not describe the main interest. This needs concept-specific filtering or a different profile.

### Impact play (11)

- **Hand spanking** (`hand_spanking`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Paddling** (`paddling`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Flogging** (`flogging`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Caning** (`caning`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Whipping** (`whipping`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Strapping** (`strapping`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Body slapping** (`slapping_body`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Thuddy impact** (`thudding_impact`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Stingy impact** (`stingy_impact`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Rhythmic impact** (`rhythmic_impact`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Riding-crop play** (`riding_crop_play`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.

### Pain play (15)

- **Controlled pain** (`pain_general`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Pinching** (`pinching`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Nipple pain** (`nipple_pain`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Genital pain** (`genital_pain`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Pressure-based pain** (`pressure_pain`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Scratching** (`scratching`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Biting** (`biting`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Hair pulling** (`hair_pulling`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Clamps** (`clamps`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Light clamp / clothespin-style sensation** (`clothespin_style_clamps`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Trampling / body-weight pressure** (`trampling`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Kneeling / posture discomfort** (`kneeling_discomfort`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Controlled muscle fatigue** (`muscle_fatigue`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Rough gripping** (`rough_gripping`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Temporary marks / visible reminders** (`temporary_marks`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.

### Sensation play (15)

- **Light touch** (`light_touch`)
  - **Needs update:** The `qualities` qualifier lists other sensation categories (pressure, vibration, cold, warmth, tickling, suction, etc.) even when the main question already fixes the sensation. Body area and strength are useful, but the qualities list needs filtering/replacement per concept.
- **Feathers / brushes** (`feathers_brushes`)
  - **Needs update:** The `qualities` qualifier lists other sensation categories (pressure, vibration, cold, warmth, tickling, suction, etc.) even when the main question already fixes the sensation. Body area and strength are useful, but the qualities list needs filtering/replacement per concept.
- **Tickling** (`tickling`)
  - **Needs update:** The `qualities` qualifier lists other sensation categories (pressure, vibration, cold, warmth, tickling, suction, etc.) even when the main question already fixes the sensation. Body area and strength are useful, but the qualities list needs filtering/replacement per concept.
- **Massage** (`massage`)
  - **Needs update:** The `qualities` qualifier lists other sensation categories (pressure, vibration, cold, warmth, tickling, suction, etc.) even when the main question already fixes the sensation. Body area and strength are useful, but the qualities list needs filtering/replacement per concept.
- **Ice / cold sensation** (`ice_play`)
  - **Needs update:** The `qualities` qualifier lists other sensation categories (pressure, vibration, cold, warmth, tickling, suction, etc.) even when the main question already fixes the sensation. Body area and strength are useful, but the qualities list needs filtering/replacement per concept.
- **Warmth / heat sensation** (`warmth_play`)
  - **Needs update:** The `qualities` qualifier lists other sensation categories (pressure, vibration, cold, warmth, tickling, suction, etc.) even when the main question already fixes the sensation. Body area and strength are useful, but the qualities list needs filtering/replacement per concept.
- **Wax play** (`wax_play`)
  - **Needs update:** The `qualities` qualifier lists other sensation categories (pressure, vibration, cold, warmth, tickling, suction, etc.) even when the main question already fixes the sensation. Body area and strength are useful, but the qualities list needs filtering/replacement per concept.
- **Texture play** (`texture_play`)
  - **Needs update:** The `qualities` qualifier lists other sensation categories (pressure, vibration, cold, warmth, tickling, suction, etc.) even when the main question already fixes the sensation. Body area and strength are useful, but the qualities list needs filtering/replacement per concept.
- **Pressure sensation** (`pressure_sensation`)
  - **Needs update:** The `qualities` qualifier lists other sensation categories (pressure, vibration, cold, warmth, tickling, suction, etc.) even when the main question already fixes the sensation. Body area and strength are useful, but the qualities list needs filtering/replacement per concept.
- **Vibration** (`vibration`)
  - **Needs update:** The `qualities` qualifier lists other sensation categories (pressure, vibration, cold, warmth, tickling, suction, etc.) even when the main question already fixes the sensation. Body area and strength are useful, but the qualities list needs filtering/replacement per concept.
- **Suction** (`suction`)
  - **Needs update:** The `qualities` qualifier lists other sensation categories (pressure, vibration, cold, warmth, tickling, suction, etc.) even when the main question already fixes the sensation. Body area and strength are useful, but the qualities list needs filtering/replacement per concept.
- **Hot / cold contrast** (`temperature_contrast`)
  - **Needs update:** The `qualities` qualifier lists other sensation categories (pressure, vibration, cold, warmth, tickling, suction, etc.) even when the main question already fixes the sensation. Body area and strength are useful, but the qualities list needs filtering/replacement per concept.
- **Sensory teasing** (`sensory_teasing`)
  - **Needs update:** The `qualities` qualifier lists other sensation categories (pressure, vibration, cold, warmth, tickling, suction, etc.) even when the main question already fixes the sensation. Body area and strength are useful, but the qualities list needs filtering/replacement per concept.
- **Body tracing / slow touch** (`body_tracing`)
  - **Needs update:** The `qualities` qualifier lists other sensation categories (pressure, vibration, cold, warmth, tickling, suction, etc.) even when the main question already fixes the sensation. Body area and strength are useful, but the qualities list needs filtering/replacement per concept.
- **Oil / lubricant sensation** (`oil_lubricant_sensation`)
  - **Needs update:** The `qualities` qualifier lists other sensation categories (pressure, vibration, cold, warmth, tickling, suction, etc.) even when the main question already fixes the sensation. Body area and strength are useful, but the qualities list needs filtering/replacement per concept.

### Rough / physical play (12)

- **Rough sex** (`rough_sex_general`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Wrestling** (`wrestling`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Grappling / physical struggle** (`grappling`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Pinning / holding down** (`pinning`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Body-weight control** (`body_weight_control`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Chasing / pursuit roleplay** (`chasing_roleplay`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Primal-style struggle** (`primal_struggle`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Hair-based control** (`hair_control`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Face / jaw holding** (`face_holding`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Forceful but positioning** (`forceful_positioning`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Clothing grabbing** (`clothing_grabbing`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.
- **Wall pinning roleplay** (`wall_pin_roleplay`)
  - **Needs update:** The shared `impact` profile is not concept-aware. Specific implements are offered alternative implements; specific impact characters are offered alternative characters; and non-impact pain/rough-play concepts still receive `impact implements`, `impact character & rhythm`, and impact-mark questions. The profile needs filtering or separate pain/rough-play profiles.

### Sexual activities (20)

- **Kissing** (`kissing`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Extended making out** (`making_out`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
- **Oral sex** (`oral_sex`)
  - **Needs update:** The oral profiles are much better than the generic sexual-activity profile, but anatomy-dependent options are not conditionally filtered: `deep oral / deep-throating` and `face-fucking` can appear alongside vulva/clitoris or anal-focused selections. Partner-body anatomy also duplicates the oral-focus anatomy question. The anatomy choice should control later style/position options.
- **Manual genital stimulation of a partner** (`manual_giving`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Receiving manual genital stimulation** (`manual_receiving`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Vaginal penetration** (`vaginal_penetration`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Giving anal penetration** (`anal_penetration_giving`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Receiving anal penetration** (`anal_penetration_receiving`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Mutual masturbation** (`mutual_masturbation`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Directed partner masturbation** (`partner_masturbation_control`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Facesitting** (`facesitting`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
- **Sexual body worship** (`body_worship_sexual`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
- **Rough oral-sex roleplay** (`rough_oral_roleplay`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Strap-on penetration** (`strap_on_penetration`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Pegging** (`pegging`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Multiple-penetration fantasy / activity** (`double_penetration_fantasy`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Vaginal fisting** (`fisting_vaginal`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Anal fisting** (`fisting_anal`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Intercrural / thigh sex** (`intercrural_sex`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Chest / breast-focused nonpenetrative sex** (`chest_breast_nonpenetrative_sex`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.

### Anal play (11)

- **External anal touch** (`anal_touch`)
  - **Needs update:** The `anal` detail profile leaks sibling activities into a specific leaf question: `What parts appeal?` offers external touch, fingers, toys, penetration, and oral even when the main question already fixes one of those. `Intensity / depth` and `positions` also do not fit every leaf (especially external touch, worship/service, enema, and rimming).
- **Anal fingering** (`anal_fingering`)
  - **Needs update:** The `anal` detail profile leaks sibling activities into a specific leaf question: `What parts appeal?` offers external touch, fingers, toys, penetration, and oral even when the main question already fixes one of those. `Intensity / depth` and `positions` also do not fit every leaf (especially external touch, worship/service, enema, and rimming).
- **Anal toys** (`anal_toys`)
  - **Needs update:** The `anal` detail profile leaks sibling activities into a specific leaf question: `What parts appeal?` offers external touch, fingers, toys, penetration, and oral even when the main question already fixes one of those. `Intensity / depth` and `positions` also do not fit every leaf (especially external touch, worship/service, enema, and rimming).
- **Anal plugs** (`anal_plugs`)
  - **Needs update:** The `anal` detail profile leaks sibling activities into a specific leaf question: `What parts appeal?` offers external touch, fingers, toys, penetration, and oral even when the main question already fixes one of those. `Intensity / depth` and `positions` also do not fit every leaf (especially external touch, worship/service, enema, and rimming).
- **Anal-bead play** (`anal_beads`)
  - **Needs update:** The `anal` detail profile leaks sibling activities into a specific leaf question: `What parts appeal?` offers external touch, fingers, toys, penetration, and oral even when the main question already fixes one of those. `Intensity / depth` and `positions` also do not fit every leaf (especially external touch, worship/service, enema, and rimming).
- **Gradual anal-size progression as a preference** (`anal_training_progression`)
  - **Needs update:** The `anal` detail profile leaks sibling activities into a specific leaf question: `What parts appeal?` offers external touch, fingers, toys, penetration, and oral even when the main question already fixes one of those. `Intensity / depth` and `positions` also do not fit every leaf (especially external touch, worship/service, enema, and rimming).
- **Anal-focused worship / attention** (`anal_worship`)
  - **Needs update:** The `anal` detail profile leaks sibling activities into a specific leaf question: `What parts appeal?` offers external touch, fingers, toys, penetration, and oral even when the main question already fixes one of those. `Intensity / depth` and `positions` also do not fit every leaf (especially external touch, worship/service, enema, and rimming).
- **Anal-focused service roleplay** (`anal_service`)
  - **Needs update:** The `anal` detail profile leaks sibling activities into a specific leaf question: `What parts appeal?` offers external touch, fingers, toys, penetration, and oral even when the main question already fixes one of those. `Intensity / depth` and `positions` also do not fit every leaf (especially external touch, worship/service, enema, and rimming).
- **Enema-related fetish / play** (`enema_fetish`)
  - **Needs update:** The `anal` detail profile leaks sibling activities into a specific leaf question: `What parts appeal?` offers external touch, fingers, toys, penetration, and oral even when the main question already fixes one of those. `Intensity / depth` and `positions` also do not fit every leaf (especially external touch, worship/service, enema, and rimming).
- **Rimming / oral-anal play** (`rimming`)
  - **Needs update:** The `anal` detail profile leaks sibling activities into a specific leaf question: `What parts appeal?` offers external touch, fingers, toys, penetration, and oral even when the main question already fixes one of those. `Intensity / depth` and `positions` also do not fit every leaf (especially external touch, worship/service, enema, and rimming).
- **Prostate-focused play** (`prostate_focused_play`)
  - **Needs update:** The `anal` detail profile leaks sibling activities into a specific leaf question: `What parts appeal?` offers external touch, fingers, toys, penetration, and oral even when the main question already fixes one of those. `Intensity / depth` and `positions` also do not fit every leaf (especially external touch, worship/service, enema, and rimming).

### Toys & devices (18)

- **Vibrators** (`vibrators`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
- **Dildos** (`dildos`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Strap-ons** (`strap_ons`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Butt plugs** (`butt_plugs`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Anal beads (device)** (`anal_beads_device`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Nipple clamps** (`nipple_clamps`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Genital clamps** (`genital_clamps`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Chastity devices** (`chastity_devices`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Bondage furniture** (`bondage_furniture`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Sex swings** (`sex_swings`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Vacuum / pump devices** (`vacuum_pumps`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Suction cups** (`suction_cups`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Electrical stimulation devices** (`electrostimulation`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
- **Urethral sounding** (`urethral_sounding`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Catheter-related fetish / play** (`catheter_fetish`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Masturbation sleeves** (`masturbation_sleeves`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Prostate-focused toys** (`prostate_toys`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.
  - **Needs update:** `Body-area focus` is too generic or contradictory here because the main activity/device already fixes the relevant anatomy, or needs a much more specific target distinction. For example vaginal penetration should not offer mouth/chest/thighs as alternative body-area focuses; strap-on/dildo questions need vaginal-vs-anal target rather than generic `genitals`/`buttocks`; clamps and prostate/urethral items need their own anatomy-specific refinements.
- **Powered sex machines** (`powered_sex_machines`)
  - **Missing important qualifier:** The profile has relationship/scene context but no physical location/privacy qualifier, so it cannot express activity-specific conditions such as “only at home/private.” That is a meaningful missing qualifier for this whole group.

### Orgasm control (16)

- **Edging** (`edging`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.
- **Orgasm delay** (`orgasm_delay`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.
- **Orgasm permission** (`orgasm_permission`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.
- **Orgasm denial** (`orgasm_denial`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.
- **Controlling when a partner orgasms** (`forced_orgasm_timing`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.
- **Repeated orgasm** (`repeated_orgasm`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.
- **Continued stimulation after orgasm** (`post_orgasm_stimulation`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.
- **Ruined-orgasm fantasy / play** (`ruined_orgasm_fantasy`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.
- **Tease and denial** (`tease_denial`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.
- **Rules about number of orgasms** (`orgasm_count_rules`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.
- **Masturbation denial** (`masturbation_denial`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.
- **Masturbation schedule / permission** (`masturbation_schedule`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.
- **Forced-orgasm fantasy** (`forced_orgasm_fantasy`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.
- **Overstimulation** (`overstimulation`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.
- **Orgasm on command** (`orgasm_on_command`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.
- **Conditioned-orgasm fantasy / training** (`conditioned_orgasm`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.

### Chastity (8)

- **Temporary chastity** (`temporary_chastity`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.
- **Device-based chastity** (`device_chastity`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.
- **Keyholder dynamic** (`keyholder_dynamic`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.
- **Remote chastity control** (`remote_chastity_control`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.
- **Longer-term chastity fantasy** (`long_term_chastity_fantasy`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.
- **Chastity-related teasing** (`chastity_teasing`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.
- **Honor-system / non-device chastity** (`honor_system_chastity`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.
- **Self-directed chastity** (`self_directed_chastity`)
  - **Needs update:** The `modes` qualifier is a list of sibling orgasm-control/chastity concepts (edging, permission, denial, repeated orgasm, post-orgasm continuation, etc.), so it becomes self-referential or changes the subject on almost every specific question. Duration is useful only for some subtypes; the profile needs subtype-specific depth.

### Humiliation & degradation (14)

- **Verbal degradation** (`verbal_degradation`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.
- **Degrading names** (`degrading_names`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.
- **Mockery / ridicule** (`mockery`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.
- **Embarrassment roleplay** (`embarrassment_roleplay`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.
- **Sexual objectification** (`sexual_objectification`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.
- **Being 'used' in roleplay** (`use_roleplay`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.
- **Failure / punishment humiliation roleplay** (`failure_punishment_roleplay`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.
- **Humiliating forced-choice roleplay within negotiated limits** (`forced_choice_roleplay`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.
- **Appearance-focused humiliation by prior agreement** (`appearance_humiliation`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.
- **Performance-focused humiliation** (`performance_humiliation`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.
- **Exposure / embarrassment fantasy without involving nonconsenting observers** (`exposure_humiliation_fantasy`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.
- **Humiliating service tasks** (`service_humiliation`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.
- **Dehumanization roleplay** (`dehumanization_roleplay`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.
- **Human-furniture roleplay** (`furniture_roleplay`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.

### Praise, worship & adoration (13)

- **Praise kink** (`praise_kink`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Verbal adoration** (`verbal_adoration`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Body worship** (`body_worship`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Foot worship** (`foot_worship`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Boot worship** (`boot_worship`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Hand worship** (`hand_worship`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Genital worship** (`genital_worship`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Breast / chest worship** (`breast_chest_worship`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Muscle worship** (`muscle_worship`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Authority / dominance admiration** (`authority_admiration`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Praise for service** (`service_praise`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Praise for obedience** (`obedience_praise`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Possessive affectionate language** (`possessive_affection`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.

### Objectification & dollification (11)

- **Objectification as a dynamic** (`objectification_general`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.
- **Human furniture** (`human_furniture`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.
- **Dollification** (`dollification`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.
- **Mannequin / display roleplay** (`mannequin_roleplay`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.
- **Statue / stillness roleplay** (`statue_roleplay`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.
- **Being treated as a sexual 'toy' in roleplay** (`toy_roleplay`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.
- **Property / possession roleplay** (`property_roleplay`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.
- **Display / presentation roleplay** (`display_roleplay`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.
- **Inspection roleplay** (`inspection_roleplay`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.
- **Robot / programmed-person roleplay** (`robot_roleplay`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.
- **Puppet / controlled-movement roleplay** (`puppet_roleplay`)
  - **Needs update:** The `forms` qualifier is a sibling taxonomy of humiliation styles and becomes repetitive or off-topic on specific humiliation questions. The objectification/dollification/human-furniture subset especially needs a different profile focused on use/display/stillness/control rather than generic humiliation forms.

### Exhibitionism & observation (10)

- **Watching sexual activity** (`consensual_voyeurism`)
  - **Needs update:** The `exhibition` profile assumes a generic being-seen scenario. On watching-side questions, `Who may be present?` and `How identifiable would you want to be?` are misframed; on fixed activities such as watched masturbation the activity menu is redundant; photography/video/camera questions are missing recording/storage/sharing/access-control details; mirror play should not ask about an audience or identifiability.
- **A partner watching** (`partner_watches`)
  - **Needs update:** The `exhibition` profile assumes a generic being-seen scenario. On watching-side questions, `Who may be present?` and `How identifiable would you want to be?` are misframed; on fixed activities such as watched masturbation the activity menu is redundant; photography/video/camera questions are missing recording/storage/sharing/access-control details; mirror play should not ask about an audience or identifiability.
- **Watching a partner** (`watching_partner`)
  - **Needs update:** The `exhibition` profile assumes a generic being-seen scenario. On watching-side questions, `Who may be present?` and `How identifiable would you want to be?` are misframed; on fixed activities such as watched masturbation the activity menu is redundant; photography/video/camera questions are missing recording/storage/sharing/access-control details; mirror play should not ask about an audience or identifiability.
- **Masturbating while being watched** (`masturbation_observed`)
  - **Needs update:** The `exhibition` profile assumes a generic being-seen scenario. On watching-side questions, `Who may be present?` and `How identifiable would you want to be?` are misframed; on fixed activities such as watched masturbation the activity menu is redundant; photography/video/camera questions are missing recording/storage/sharing/access-control details; mirror play should not ask about an audience or identifiability.
- **Watching a partner masturbate** (`watching_masturbation`)
  - **Needs update:** The `exhibition` profile assumes a generic being-seen scenario. On watching-side questions, `Who may be present?` and `How identifiable would you want to be?` are misframed; on fixed activities such as watched masturbation the activity menu is redundant; photography/video/camera questions are missing recording/storage/sharing/access-control details; mirror play should not ask about an audience or identifiability.
- **Private sexual photography** (`private_photography`)
  - **Needs update:** The `exhibition` profile assumes a generic being-seen scenario. On watching-side questions, `Who may be present?` and `How identifiable would you want to be?` are misframed; on fixed activities such as watched masturbation the activity menu is redundant; photography/video/camera questions are missing recording/storage/sharing/access-control details; mirror play should not ask about an audience or identifiability.
- **Private sexual video** (`private_video`)
  - **Needs update:** The `exhibition` profile assumes a generic being-seen scenario. On watching-side questions, `Who may be present?` and `How identifiable would you want to be?` are misframed; on fixed activities such as watched masturbation the activity menu is redundant; photography/video/camera questions are missing recording/storage/sharing/access-control details; mirror play should not ask about an audience or identifiability.
- **Remote camera play** (`remote_camera_play`)
  - **Needs update:** The `exhibition` profile assumes a generic being-seen scenario. On watching-side questions, `Who may be present?` and `How identifiable would you want to be?` are misframed; on fixed activities such as watched masturbation the activity menu is redundant; photography/video/camera questions are missing recording/storage/sharing/access-control details; mirror play should not ask about an audience or identifiability.
- **Being watched at an adult play event** (`consensual_group_observation`)
  - **Needs update:** The `exhibition` profile assumes a generic being-seen scenario. On watching-side questions, `Who may be present?` and `How identifiable would you want to be?` are misframed; on fixed activities such as watched masturbation the activity menu is redundant; photography/video/camera questions are missing recording/storage/sharing/access-control details; mirror play should not ask about an audience or identifiability.
- **Mirror / self-observation play** (`mirror_play`)
  - **Needs update:** The `exhibition` profile assumes a generic being-seen scenario. On watching-side questions, `Who may be present?` and `How identifiable would you want to be?` are misframed; on fixed activities such as watched masturbation the activity menu is redundant; photography/video/camera questions are missing recording/storage/sharing/access-control details; mirror play should not ask about an audience or identifiability.

### Multi-partner / partner-sharing (13)

- **Threesome** (`threesome`)
  - **Needs update:** The generic `group size` / `role` fields do not stay inside the named scenario. Threesome/foursome can be contradicted by other group sizes, while partner-sharing/watching/cuckolding/swinging/compersion/party/anonymous scenarios need relationship- and participation-specific roles rather than the same generic attention menu.
- **Four-person sexual activity** (`foursome`)
  - **Needs update:** The generic `group size` / `role` fields do not stay inside the named scenario. Threesome/foursome can be contradicted by other group sizes, while partner-sharing/watching/cuckolding/swinging/compersion/party/anonymous scenarios need relationship- and participation-specific roles rather than the same generic attention menu.
- **Being the focus of multiple partners** (`being_center_of_attention`)
  - **Needs update:** The generic `group size` / `role` fields do not stay inside the named scenario. Threesome/foursome can be contradicted by other group sizes, while partner-sharing/watching/cuckolding/swinging/compersion/party/anonymous scenarios need relationship- and participation-specific roles rather than the same generic attention menu.
- **Partner sharing** (`partner_sharing`)
  - **Needs update:** The generic `group size` / `role` fields do not stay inside the named scenario. Threesome/foursome can be contradicted by other group sizes, while partner-sharing/watching/cuckolding/swinging/compersion/party/anonymous scenarios need relationship- and participation-specific roles rather than the same generic attention menu.
- **Watching a partner with another adult** (`watch_partner_with_other`)
  - **Needs update:** The generic `group size` / `role` fields do not stay inside the named scenario. Threesome/foursome can be contradicted by other group sizes, while partner-sharing/watching/cuckolding/swinging/compersion/party/anonymous scenarios need relationship- and participation-specific roles rather than the same generic attention menu.
- **A partner watching you with another adult** (`partner_watches_with_other`)
  - **Needs update:** The generic `group size` / `role` fields do not stay inside the named scenario. Threesome/foursome can be contradicted by other group sizes, while partner-sharing/watching/cuckolding/swinging/compersion/party/anonymous scenarios need relationship- and participation-specific roles rather than the same generic attention menu.
- **Cuckolding-style roleplay** (`cuckolding_roleplay`)
  - **Needs update:** The generic `group size` / `role` fields do not stay inside the named scenario. Threesome/foursome can be contradicted by other group sizes, while partner-sharing/watching/cuckolding/swinging/compersion/party/anonymous scenarios need relationship- and participation-specific roles rather than the same generic attention menu.
- **Hotwife / hot-partner dynamic** (`hotwife_hotpartner_dynamic`)
  - **Needs update:** The generic `group size` / `role` fields do not stay inside the named scenario. Threesome/foursome can be contradicted by other group sizes, while partner-sharing/watching/cuckolding/swinging/compersion/party/anonymous scenarios need relationship- and participation-specific roles rather than the same generic attention menu.
- **Stag/vixen-style dynamic** (`stag_vixen_dynamic`)
  - **Needs update:** The generic `group size` / `role` fields do not stay inside the named scenario. Threesome/foursome can be contradicted by other group sizes, while partner-sharing/watching/cuckolding/swinging/compersion/party/anonymous scenarios need relationship- and participation-specific roles rather than the same generic attention menu.
- **Compersion-focused partner-sharing** (`compersion_play`)
  - **Needs update:** The generic `group size` / `role` fields do not stay inside the named scenario. Threesome/foursome can be contradicted by other group sizes, while partner-sharing/watching/cuckolding/swinging/compersion/party/anonymous scenarios need relationship- and participation-specific roles rather than the same generic attention menu.
- **Swinging** (`swinging`)
  - **Needs update:** The generic `group size` / `role` fields do not stay inside the named scenario. Threesome/foursome can be contradicted by other group sizes, while partner-sharing/watching/cuckolding/swinging/compersion/party/anonymous scenarios need relationship- and participation-specific roles rather than the same generic attention menu.
- **Adult sex-party environment** (`sex_party`)
  - **Needs update:** The generic `group size` / `role` fields do not stay inside the named scenario. Threesome/foursome can be contradicted by other group sizes, while partner-sharing/watching/cuckolding/swinging/compersion/party/anonymous scenarios need relationship- and participation-specific roles rather than the same generic attention menu.
- **Anonymous adult-partner fantasy** (`anonymous_partner_fantasy`)
  - **Needs update:** The generic `group size` / `role` fields do not stay inside the named scenario. Threesome/foursome can be contradicted by other group sizes, while partner-sharing/watching/cuckolding/swinging/compersion/party/anonymous scenarios need relationship- and participation-specific roles rather than the same generic attention menu.

### Roleplay (6)

- **Stranger-meeting roleplay** (`stranger_roleplay`)
  - **Needs update:** `Authority / power level` is unconditional in the shared roleplay profile even though authority is not inherent to this concept. Some of these also do not benefit from costume/script questions in the same way as character-roleplay. The profile needs field-level relevance rules.
- **Age-difference roleplay between adults** (`adult_age_difference_roleplay`)
  - **Needs update:** `Authority / power level` is unconditional in the shared roleplay profile even though authority is not inherent to this concept. Some of these also do not benefit from costume/script questions in the same way as character-roleplay. The profile needs field-level relevance rules.
- **Historical / period roleplay** (`historical_roleplay`)
  - **Needs update:** `Authority / power level` is unconditional in the shared roleplay profile even though authority is not inherent to this concept. Some of these also do not benefit from costume/script questions in the same way as character-roleplay. The profile needs field-level relevance rules.
- **Fantasy-character roleplay** (`fantasy_character_roleplay`)
  - **Needs update:** `Authority / power level` is unconditional in the shared roleplay profile even though authority is not inherent to this concept. Some of these also do not benefit from costume/script questions in the same way as character-roleplay. The profile needs field-level relevance rules.
- **Transformation roleplay** (`transformation_roleplay`)
  - **Needs update:** `Authority / power level` is unconditional in the shared roleplay profile even though authority is not inherent to this concept. Some of these also do not benefit from costume/script questions in the same way as character-roleplay. The profile needs field-level relevance rules.
- **Pre-negotiated sleep / unconsciousness fantasy** (`negotiated_sleep_vulnerability_fantasy`)
  - **Needs update:** A pure-fantasy concept is inheriting the general roleplay profile, including `Costume / presentation`, `Authority / power level`, and enactment choices. Those are not universally meaningful for imagined transformations, body swaps, pregnancy/breeding, size fantasies, hypnosis, ownership/use fantasies, etc. These need fantasy-specific subtype/framing qualifiers and fantasy-only field filtering.

### Pet play & primal play (12)

- **Pet play** (`pet_play_general`)
  - **Missing important qualifier:** The roleplay profile captures tone/script/costume but misses pet-play-specific depth such as handler/pet role emphasis, behavior style, gear/symbolism, training/service emphasis, and human-vs-animalistic presentation. The current authority field is also not equally relevant across this group.
- **Puppy play** (`puppy_play`)
  - **Missing important qualifier:** The roleplay profile captures tone/script/costume but misses pet-play-specific depth such as handler/pet role emphasis, behavior style, gear/symbolism, training/service emphasis, and human-vs-animalistic presentation. The current authority field is also not equally relevant across this group.
- **Kitten play** (`kitten_play`)
  - **Missing important qualifier:** The roleplay profile captures tone/script/costume but misses pet-play-specific depth such as handler/pet role emphasis, behavior style, gear/symbolism, training/service emphasis, and human-vs-animalistic presentation. The current authority field is also not equally relevant across this group.
- **Pony play** (`pony_play`)
  - **Missing important qualifier:** The roleplay profile captures tone/script/costume but misses pet-play-specific depth such as handler/pet role emphasis, behavior style, gear/symbolism, training/service emphasis, and human-vs-animalistic presentation. The current authority field is also not equally relevant across this group.
- **Collar / leash pet-play symbolism** (`collar_leash_petplay`)
  - **Missing important qualifier:** The roleplay profile captures tone/script/costume but misses pet-play-specific depth such as handler/pet role emphasis, behavior style, gear/symbolism, training/service emphasis, and human-vs-animalistic presentation. The current authority field is also not equally relevant across this group.
- **Training / commands in pet play** (`training_petplay`)
  - **Missing important qualifier:** The roleplay profile captures tone/script/costume but misses pet-play-specific depth such as handler/pet role emphasis, behavior style, gear/symbolism, training/service emphasis, and human-vs-animalistic presentation. The current authority field is also not equally relevant across this group.
- **Pet-style service** (`pet_service`)
  - **Missing important qualifier:** The roleplay profile captures tone/script/costume but misses pet-play-specific depth such as handler/pet role emphasis, behavior style, gear/symbolism, training/service emphasis, and human-vs-animalistic presentation. The current authority field is also not equally relevant across this group.
- **Primal play** (`primal_play`)
  - **Needs update:** `Authority / power level` is unconditional in the shared roleplay profile even though authority is not inherent to this concept. Some of these also do not benefit from costume/script questions in the same way as character-roleplay. The profile needs field-level relevance rules.
- **Chasing in primal play** (`chasing_primal`)
  - **Needs update:** `Authority / power level` is unconditional in the shared roleplay profile even though authority is not inherent to this concept. Some of these also do not benefit from costume/script questions in the same way as character-roleplay. The profile needs field-level relevance rules.
- **Wrestling in primal play** (`wrestling_primal`)
  - **Needs update:** `Authority / power level` is unconditional in the shared roleplay profile even though authority is not inherent to this concept. Some of these also do not benefit from costume/script questions in the same way as character-roleplay. The profile needs field-level relevance rules.
- **Biting in primal play** (`biting_primal`)
  - **Needs update:** `Authority / power level` is unconditional in the shared roleplay profile even though authority is not inherent to this concept. Some of these also do not benefit from costume/script questions in the same way as character-roleplay. The profile needs field-level relevance rules.
- **Animalistic vocalization / growling** (`growling_vocalization`)
  - **Needs update:** `Authority / power level` is unconditional in the shared roleplay profile even though authority is not inherent to this concept. Some of these also do not benefit from costume/script questions in the same way as character-roleplay. The profile needs field-level relevance rules.

### Medical-themed & higher-risk edge play (15)

- **Needle play** (`needle_play`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Blood-related play** (`blood_play`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Medical-instrument fetish / play** (`medical_instruments`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Medical examination roleplay** (`medical_examination_roleplay`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Electrical sensation play** (`electrical_play`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Fire-related edge play** (`fire_play`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Breath-restriction / choking-related play** (`breath_restriction`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Smothering fantasy / roleplay** (`smothering_fantasy`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Extreme temperature play** (`temperature_extreme`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Cutting-related fantasy / edge play** (`cutting_fantasy`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Scarification-related fantasy** (`scarification_fantasy`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Higher-intensity wax / heat play** (`wax_high_heat`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Temporary piercing-related play** (`piercing_play`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Blood-drawing fetish / roleplay** (`blood_drawing_fetish`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Clinical-style restraint roleplay** (`clinical_restraint`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.

### Body-part fetishes (5)

- **Height / body-size difference** (`height_size_fetish`)
  - **Needs update:** The body-part profile is the wrong shape: looking/touching/kissing/scent/worship does not meaningfully refine height or body-size difference. It needs relative-size/height/build and role/difference preferences.
- **Tattoos** (`tattoo_fetish`)
  - **Needs update:** These are body features rather than ordinary body parts. `Scent`, `receiving attention to this area`, and some touch/kissing options are poorly matched; location/style/amount/visibility are the more important missing refinements.
- **Piercings** (`piercing_fetish`)
  - **Needs update:** These are body features rather than ordinary body parts. `Scent`, `receiving attention to this area`, and some touch/kissing options are poorly matched; location/style/amount/visibility are the more important missing refinements.
- **Natural body scent** (`scented_body_area_fetish`)
  - **Needs update:** The main interest is already natural body scent, but the body-part interaction profile emphasizes looking/touching/kissing/worship and treats scent as just one option. Source/body-area, natural-vs-product-modified scent, intensity, and proximity/context are the meaningful missing dimensions.
- **Eyes** (`eyes_fetish`)
  - **Needs update:** The body-part interaction profile overemphasizes touch/kissing/scent for an eye-focused interest. Gaze/eye contact, visual features, expression, and looking/being-looked-at context are the important missing distinctions.

### Fluids & messy play (12)

- **Saliva / spitting play** (`saliva_play`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Semen-focused fetish / play** (`semen_focus`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Sweat fetish** (`sweat_fetish`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Urine-related play** (`urine_play`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Food-related messy play** (`food_play`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Oil / lubricant messy play** (`oil_play`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Mud / messy-substance play** (`mud_messy_play`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Water / wet play** (`water_play`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Body-paint / washable substance play** (`body_paint_play`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Blood-related fetish** (`blood_fetish`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Feces-related fetish** (`feces_fetish`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.
- **Messy / soaked clothing play** (`messy_clothing`)
  - **Missing important qualifier:** This question only gets the generic free-text field `Anything specific ...?`. That avoids irrelevant options, but it is missing structured depth that is important for this topic. Praise/worship needs tone/style/role/intensity; medical/edge interests need role/body-area/intensity/context/boundary refinements; fluids/mess interests need source/target/contact/context/intensity-type refinements.

### Sensory & body-sensation fetishes (14)

- **Scent / smell fetish** (`scent_fetish`)
  - **Needs update:** The generic fetish `interaction` options are built around visible/wearable/touchable objects (seeing, wearing, partner wearing, touching, smell, texture, worship). They do not fit many sensory stimuli such as voice, accent, whispering, sound, temperature, pressure, wetness, tickling, or massage. These need stimulus-specific qualifiers.
- **Natural body-odor fetish** (`body_odor_fetish`)
  - **Needs update:** The generic fetish `interaction` options are built around visible/wearable/touchable objects (seeing, wearing, partner wearing, touching, smell, texture, worship). They do not fit many sensory stimuli such as voice, accent, whispering, sound, temperature, pressure, wetness, tickling, or massage. These need stimulus-specific qualifiers.
- **Perfume / fragrance fetish** (`perfume_fetish`)
  - **Needs update:** The generic fetish `interaction` options are built around visible/wearable/touchable objects (seeing, wearing, partner wearing, touching, smell, texture, worship). They do not fit many sensory stimuli such as voice, accent, whispering, sound, temperature, pressure, wetness, tickling, or massage. These need stimulus-specific qualifiers.
- **Voice fetish** (`voice_fetish`)
  - **Needs update:** The generic fetish `interaction` options are built around visible/wearable/touchable objects (seeing, wearing, partner wearing, touching, smell, texture, worship). They do not fit many sensory stimuli such as voice, accent, whispering, sound, temperature, pressure, wetness, tickling, or massage. These need stimulus-specific qualifiers.
- **Accent / speech-style fetish** (`accent_fetish`)
  - **Needs update:** The generic fetish `interaction` options are built around visible/wearable/touchable objects (seeing, wearing, partner wearing, touching, smell, texture, worship). They do not fit many sensory stimuli such as voice, accent, whispering, sound, temperature, pressure, wetness, tickling, or massage. These need stimulus-specific qualifiers.
- **Whispering / close-voice fetish** (`whispering_fetish`)
  - **Needs update:** The generic fetish `interaction` options are built around visible/wearable/touchable objects (seeing, wearing, partner wearing, touching, smell, texture, worship). They do not fit many sensory stimuli such as voice, accent, whispering, sound, temperature, pressure, wetness, tickling, or massage. These need stimulus-specific qualifiers.
- **Specific sound fetish** (`sound_fetish`)
  - **Needs update:** The generic fetish `interaction` options are built around visible/wearable/touchable objects (seeing, wearing, partner wearing, touching, smell, texture, worship). They do not fit many sensory stimuli such as voice, accent, whispering, sound, temperature, pressure, wetness, tickling, or massage. These need stimulus-specific qualifiers.
- **Texture fetish** (`texture_fetish`)
  - **Needs update:** The generic fetish `interaction` options are built around visible/wearable/touchable objects (seeing, wearing, partner wearing, touching, smell, texture, worship). They do not fit many sensory stimuli such as voice, accent, whispering, sound, temperature, pressure, wetness, tickling, or massage. These need stimulus-specific qualifiers.
- **Temperature fetish** (`temperature_fetish`)
  - **Needs update:** The generic fetish `interaction` options are built around visible/wearable/touchable objects (seeing, wearing, partner wearing, touching, smell, texture, worship). They do not fit many sensory stimuli such as voice, accent, whispering, sound, temperature, pressure, wetness, tickling, or massage. These need stimulus-specific qualifiers.
- **Pressure / compression fetish** (`pressure_fetish`)
  - **Needs update:** The generic fetish `interaction` options are built around visible/wearable/touchable objects (seeing, wearing, partner wearing, touching, smell, texture, worship). They do not fit many sensory stimuli such as voice, accent, whispering, sound, temperature, pressure, wetness, tickling, or massage. These need stimulus-specific qualifiers.
- **Tight-clothing sensation fetish** (`tight_clothing_sensation`)
  - **Needs update:** The generic fetish `interaction` options are built around visible/wearable/touchable objects (seeing, wearing, partner wearing, touching, smell, texture, worship). They do not fit many sensory stimuli such as voice, accent, whispering, sound, temperature, pressure, wetness, tickling, or massage. These need stimulus-specific qualifiers.
- **Wetness sensation fetish** (`wetness_fetish`)
  - **Needs update:** The generic fetish `interaction` options are built around visible/wearable/touchable objects (seeing, wearing, partner wearing, touching, smell, texture, worship). They do not fit many sensory stimuli such as voice, accent, whispering, sound, temperature, pressure, wetness, tickling, or massage. These need stimulus-specific qualifiers.
- **Tickling fetish** (`tickling_fetish`)
  - **Needs update:** The generic fetish `interaction` options are built around visible/wearable/touchable objects (seeing, wearing, partner wearing, touching, smell, texture, worship). They do not fit many sensory stimuli such as voice, accent, whispering, sound, temperature, pressure, wetness, tickling, or massage. These need stimulus-specific qualifiers.
- **Massage fetish** (`massage_fetish`)
  - **Needs update:** The generic fetish `interaction` options are built around visible/wearable/touchable objects (seeing, wearing, partner wearing, touching, smell, texture, worship). They do not fit many sensory stimuli such as voice, accent, whispering, sound, temperature, pressure, wetness, tickling, or massage. These need stimulus-specific qualifiers.

### Psychological play (23)

- **Anticipation / suspense** (`anticipation`)
  - **Needs update:** The `elements` qualifier is effectively a sibling-topic menu (anticipation, uncertainty, fear, obedience, teasing, control, surrender, challenge), so specific psychological-play questions are asked about other psychological-play questions. `Reassurance style` is also not equally relevant to every concept.
- **Surprise within negotiated limits** (`surprise_within_limits`)
  - **Needs update:** The `elements` qualifier is effectively a sibling-topic menu (anticipation, uncertainty, fear, obedience, teasing, control, surrender, challenge), so specific psychological-play questions are asked about other psychological-play questions. `Reassurance style` is also not equally relevant to every concept.
- **Fear-based roleplay** (`fear_roleplay`)
  - **Needs update:** The `elements` qualifier is effectively a sibling-topic menu (anticipation, uncertainty, fear, obedience, teasing, control, surrender, challenge), so specific psychological-play questions are asked about other psychological-play questions. `Reassurance style` is also not equally relevant to every concept.
- **Interrogation dynamics** (`interrogation_psych`)
  - **Needs update:** The `elements` qualifier is effectively a sibling-topic menu (anticipation, uncertainty, fear, obedience, teasing, control, surrender, challenge), so specific psychological-play questions are asked about other psychological-play questions. `Reassurance style` is also not equally relevant to every concept.
- **Mind games** (`mind_games`)
  - **Needs update:** The `elements` qualifier is effectively a sibling-topic menu (anticipation, uncertainty, fear, obedience, teasing, control, surrender, challenge), so specific psychological-play questions are asked about other psychological-play questions. `Reassurance style` is also not equally relevant to every concept.
- **Difficult-choice dynamics** (`difficult_choices`)
  - **Needs update:** The `elements` qualifier is effectively a sibling-topic menu (anticipation, uncertainty, fear, obedience, teasing, control, surrender, challenge), so specific psychological-play questions are asked about other psychological-play questions. `Reassurance style` is also not equally relevant to every concept.
- **Behavioral conditioning** (`behavioral_conditioning`)
  - **Needs update:** The `elements` qualifier is effectively a sibling-topic menu (anticipation, uncertainty, fear, obedience, teasing, control, surrender, challenge), so specific psychological-play questions are asked about other psychological-play questions. `Reassurance style` is also not equally relevant to every concept.
- **Ritualized psychological control** (`ritualized_control`)
  - **Needs update:** The `elements` qualifier is effectively a sibling-topic menu (anticipation, uncertainty, fear, obedience, teasing, control, surrender, challenge), so specific psychological-play questions are asked about other psychological-play questions. `Reassurance style` is also not equally relevant to every concept.
- **Attention / focus control** (`attention_control`)
  - **Needs update:** The `elements` qualifier is effectively a sibling-topic menu (anticipation, uncertainty, fear, obedience, teasing, control, surrender, challenge), so specific psychological-play questions are asked about other psychological-play questions. `Reassurance style` is also not equally relevant to every concept.
- **Being made to wait** (`waiting_suspense`)
  - **Needs update:** The `elements` qualifier is effectively a sibling-topic menu (anticipation, uncertainty, fear, obedience, teasing, control, surrender, challenge), so specific psychological-play questions are asked about other psychological-play questions. `Reassurance style` is also not equally relevant to every concept.
- **Negotiated uncertainty** (`uncertainty_within_limits`)
  - **Needs update:** The `elements` qualifier is effectively a sibling-topic menu (anticipation, uncertainty, fear, obedience, teasing, control, surrender, challenge), so specific psychological-play questions are asked about other psychological-play questions. `Reassurance style` is also not equally relevant to every concept.
- **Testing obedience** (`testing_obedience`)
  - **Needs update:** The `elements` qualifier is effectively a sibling-topic menu (anticipation, uncertainty, fear, obedience, teasing, control, surrender, challenge), so specific psychological-play questions are asked about other psychological-play questions. `Reassurance style` is also not equally relevant to every concept.
- **Bratting / playful disobedience** (`bratting`)
  - **Needs update:** The `elements` qualifier is effectively a sibling-topic menu (anticipation, uncertainty, fear, obedience, teasing, control, surrender, challenge), so specific psychological-play questions are asked about other psychological-play questions. `Reassurance style` is also not equally relevant to every concept.
- **Brat-taming dynamic** (`brat_taming`)
  - **Needs update:** The `elements` qualifier is effectively a sibling-topic menu (anticipation, uncertainty, fear, obedience, teasing, control, surrender, challenge), so specific psychological-play questions are asked about other psychological-play questions. `Reassurance style` is also not equally relevant to every concept.
- **Challenge / competition dynamic** (`challenge_competition`)
  - **Needs update:** The `elements` qualifier is effectively a sibling-topic menu (anticipation, uncertainty, fear, obedience, teasing, control, surrender, challenge), so specific psychological-play questions are asked about other psychological-play questions. `Reassurance style` is also not equally relevant to every concept.
- **Psychological teasing** (`teasing_psychological`)
  - **Needs update:** The `elements` qualifier is effectively a sibling-topic menu (anticipation, uncertainty, fear, obedience, teasing, control, surrender, challenge), so specific psychological-play questions are asked about other psychological-play questions. `Reassurance style` is also not equally relevant to every concept.
- **Possession fantasy** (`possession_fantasy`)
  - **Needs update:** The `elements` qualifier is effectively a sibling-topic menu (anticipation, uncertainty, fear, obedience, teasing, control, surrender, challenge), so specific psychological-play questions are asked about other psychological-play questions. `Reassurance style` is also not equally relevant to every concept.
- **Jealousy play** (`jealousy_play`)
  - **Needs update:** The `elements` qualifier is effectively a sibling-topic menu (anticipation, uncertainty, fear, obedience, teasing, control, surrender, challenge), so specific psychological-play questions are asked about other psychological-play questions. `Reassurance style` is also not equally relevant to every concept.
- **Embarrassment as psychological play** (`embarrassment_psych`)
  - **Needs update:** The `elements` qualifier is effectively a sibling-topic menu (anticipation, uncertainty, fear, obedience, teasing, control, surrender, challenge), so specific psychological-play questions are asked about other psychological-play questions. `Reassurance style` is also not equally relevant to every concept.
- **Confession / disclosure roleplay** (`confession_roleplay`)
  - **Needs update:** The `elements` qualifier is effectively a sibling-topic menu (anticipation, uncertainty, fear, obedience, teasing, control, surrender, challenge), so specific psychological-play questions are asked about other psychological-play questions. `Reassurance style` is also not equally relevant to every concept.
- **Erotic hypnosis as an activity** (`erotic_hypnosis_activity`)
  - **Needs update:** The `elements` qualifier is effectively a sibling-topic menu (anticipation, uncertainty, fear, obedience, teasing, control, surrender, challenge), so specific psychological-play questions are asked about other psychological-play questions. `Reassurance style` is also not equally relevant to every concept.
- **Consensual blackmail / coercion fantasy** (`consensual_blackmail_fantasy`)
  - **Needs update:** The `elements` qualifier is effectively a sibling-topic menu (anticipation, uncertainty, fear, obedience, teasing, control, surrender, challenge), so specific psychological-play questions are asked about other psychological-play questions. `Reassurance style` is also not equally relevant to every concept.
- **Negotiated misdirection / deception** (`negotiated_misdirection`)
  - **Needs update:** The `elements` qualifier is effectively a sibling-topic menu (anticipation, uncertainty, fear, obedience, teasing, control, surrender, challenge), so specific psychological-play questions are asked about other psychological-play questions. `Reassurance style` is also not equally relevant to every concept.

### Emotions & arousal states (10)

- **Fear / being scared** (`emotion_fear`)
  - **Minor cleanup:** Minor cleanup: the shared `What do you like this feeling mixed with?` matrix includes the same feeling (or its direct equivalent) as an option for this question, creating a self-referential choice. Filter the parent emotion out of its own blend options.
- **Humiliation** (`emotion_humiliation`)
  - **Minor cleanup:** Minor cleanup: the shared `What do you like this feeling mixed with?` matrix includes the same feeling (or its direct equivalent) as an option for this question, creating a self-referential choice. Filter the parent emotion out of its own blend options.
- **Embarrassment** (`emotion_embarrassment`)
  - **Minor cleanup:** Minor cleanup: the shared `What do you like this feeling mixed with?` matrix includes the same feeling (or its direct equivalent) as an option for this question, creating a self-referential choice. Filter the parent emotion out of its own blend options.
- **Excitement / thrill** (`emotion_excitement`)
  - **Minor cleanup:** Minor cleanup: the shared `What do you like this feeling mixed with?` matrix includes the same feeling (or its direct equivalent) as an option for this question, creating a self-referential choice. Filter the parent emotion out of its own blend options.
- **Vulnerability** (`emotion_vulnerability`)
  - **Minor cleanup:** Minor cleanup: the shared `What do you like this feeling mixed with?` matrix includes the same feeling (or its direct equivalent) as an option for this question, creating a self-referential choice. Filter the parent emotion out of its own blend options.
- **Safety / security** (`emotion_safety`)
  - **Minor cleanup:** Minor cleanup: the shared `What do you like this feeling mixed with?` matrix includes the same feeling (or its direct equivalent) as an option for this question, creating a self-referential choice. Filter the parent emotion out of its own blend options.
- **Closeness / intimacy** (`emotion_closeness`)
  - **Minor cleanup:** Minor cleanup: the shared `What do you like this feeling mixed with?` matrix includes the same feeling (or its direct equivalent) as an option for this question, creating a self-referential choice. Filter the parent emotion out of its own blend options.
- **Surrender** (`emotion_surrender`)
  - **Minor cleanup:** Minor cleanup: the shared `What do you like this feeling mixed with?` matrix includes the same feeling (or its direct equivalent) as an option for this question, creating a self-referential choice. Filter the parent emotion out of its own blend options.
- **Power / control** (`emotion_power`)
  - **Minor cleanup:** Minor cleanup: the shared `What do you like this feeling mixed with?` matrix includes the same feeling (or its direct equivalent) as an option for this question, creating a self-referential choice. Filter the parent emotion out of its own blend options.
- **Playfulness** (`emotion_playfulness`)
  - **Minor cleanup:** Minor cleanup: the shared `What do you like this feeling mixed with?` matrix includes the same feeling (or its direct equivalent) as an option for this question, creating a self-referential choice. Filter the parent emotion out of its own blend options.

### Relationship-oriented dynamics (15)

- **Bedroom-only D/s** (`bedroom_only_ds`)
  - **Needs update:** `Preferred scope` can contradict or simply restate the main question (for example a `Bedroom-only D/s` question still offers relationship-wide/ongoing scope; `24/7 D/s` still offers scene-only). The scope field needs to be fixed/filtered for these concepts.
- **Scene-only D/s** (`scene_only_ds`)
  - **Needs update:** `Preferred scope` can contradict or simply restate the main question (for example a `Bedroom-only D/s` question still offers relationship-wide/ongoing scope; `24/7 D/s` still offers scene-only). The scope field needs to be fixed/filtered for these concepts.
- **Ongoing D/s relationship** (`ongoing_ds`)
  - **Needs update:** `Preferred scope` can contradict or simply restate the main question (for example a `Bedroom-only D/s` question still offers relationship-wide/ongoing scope; `24/7 D/s` still offers scene-only). The scope field needs to be fixed/filtered for these concepts.
- **Total-power-exchange fantasy / highly structured dynamic** (`total_power_exchange_fantasy`)
  - **Needs update:** `Preferred scope` can contradict or simply restate the main question (for example a `Bedroom-only D/s` question still offers relationship-wide/ongoing scope; `24/7 D/s` still offers scene-only). The scope field needs to be fixed/filtered for these concepts.
- **Collared relationship** (`collared_relationship`)
  - **Missing important qualifier:** The generic scope/protocol/areas profile misses the defining collar-specific details: symbolism/meaning, visibility, wear context/duration, and whether it is ceremonial, private, or ongoing.
- **Service-oriented relationship** (`service_relationship`)
  - **Missing important qualifier:** The generic relationship profile does not capture what kinds of service make the relationship appealing or how often/where service applies. Service type/frequency is an important missing qualifier.
- **Adult nurturing/caretaking dominance** (`caregiver_style_adult_dynamic`)
  - **Missing important qualifier:** The generic relationship profile does not distinguish caretaking/nurturing elements from authority/protocol elements. Caregiving style, dependence/independence, tone, and adult-only role framing need their own refinements.
- **Sexual submission** (`sexual_submission`)
  - **Needs update:** The `areas` qualifier offers nonsexual relationship areas (tasks, clothing, schedule, permissions, rituals) even though the main question is specifically sexual submission. This should be restricted to sexual contexts/acts and the kinds of sexual control involved.
- **Daily assigned tasks** (`daily_tasks`)
  - **Missing important qualifier:** The generic `areas` field mostly repeats the main concept and does not capture the important subtype details: task type/frequency for daily tasks, format/frequency for check-ins, and which permission domains/conditions for relationship permissions.
- **Regular check-ins / reporting** (`check_ins`)
  - **Missing important qualifier:** The generic `areas` field mostly repeats the main concept and does not capture the important subtype details: task type/frequency for daily tasks, format/frequency for check-ins, and which permission domains/conditions for relationship permissions.
- **Negotiated relationship permissions** (`relationship_permissions`)
  - **Missing important qualifier:** The generic `areas` field mostly repeats the main concept and does not capture the important subtype details: task type/frequency for daily tasks, format/frequency for check-ins, and which permission domains/conditions for relationship permissions.
- **Financial domination / financial-control fantasy** (`financial_domination`)
  - **Missing important qualifier:** The generic relationship profile misses the defining financial-control distinctions: fantasy vs real-world enactment, spending/transfer boundaries, budget/limits, frequency, and control scope. These are important even if separate risk prompts exist.
- **Adult caregiver/little-style dynamic** (`caregiver_little_adult_dynamic`)
  - **Missing important qualifier:** The generic relationship profile does not distinguish caretaking/nurturing elements from authority/protocol elements. Caregiving style, dependence/independence, tone, and adult-only role framing need their own refinements.
- **24/7 D/s dynamic** (`twenty_four_seven_ds`)
  - **Needs update:** `Preferred scope` can contradict or simply restate the main question (for example a `Bedroom-only D/s` question still offers relationship-wide/ongoing scope; `24/7 D/s` still offers scene-only). The scope field needs to be fixed/filtered for these concepts.
- **Negotiated availability / “free-use” fantasy** (`negotiated_availability_free_use_fantasy`)
  - **Missing important qualifier:** The generic relationship profile does not capture the defining conditions: when availability applies, who may initiate, excluded situations, interruption/opt-out conditions, and fantasy-vs-enactment scope.

### Remote / digital dynamics (11)

- **Sexting** (`sexting`)
  - **Missing important qualifier:** These remote/digital questions are using the generic relationship-dynamic profile. `Scope / protocol / areas` is not enough and is sometimes off-topic; remote-specific qualifiers such as synchronous vs asynchronous use, platform/channel, privacy, recording/storage, device/account access, timing, and distance-specific boundaries are missing.
- **Remote voice-command play** (`voice_commands_remote`)
  - **Missing important qualifier:** These remote/digital questions are using the generic relationship-dynamic profile. `Scope / protocol / areas` is not enough and is sometimes off-topic; remote-specific qualifiers such as synchronous vs asynchronous use, platform/channel, privacy, recording/storage, device/account access, timing, and distance-specific boundaries are missing.
- **Video-call play** (`video_call_play`)
  - **Missing important qualifier:** These remote/digital questions are using the generic relationship-dynamic profile. `Scope / protocol / areas` is not enough and is sometimes off-topic; remote-specific qualifiers such as synchronous vs asynchronous use, platform/channel, privacy, recording/storage, device/account access, timing, and distance-specific boundaries are missing.
- **Remote task assignment** (`remote_tasking`)
  - **Missing important qualifier:** These remote/digital questions are using the generic relationship-dynamic profile. `Scope / protocol / areas` is not enough and is sometimes off-topic; remote-specific qualifiers such as synchronous vs asynchronous use, platform/channel, privacy, recording/storage, device/account access, timing, and distance-specific boundaries are missing.
- **Remote orgasm control** (`remote_orgasm_control`)
  - **Missing important qualifier:** These remote/digital questions are using the generic relationship-dynamic profile. `Scope / protocol / areas` is not enough and is sometimes off-topic; remote-specific qualifiers such as synchronous vs asynchronous use, platform/channel, privacy, recording/storage, device/account access, timing, and distance-specific boundaries are missing.
- **Remote chastity dynamic** (`remote_chastity_dynamic`)
  - **Missing important qualifier:** These remote/digital questions are using the generic relationship-dynamic profile. `Scope / protocol / areas` is not enough and is sometimes off-topic; remote-specific qualifiers such as synchronous vs asynchronous use, platform/channel, privacy, recording/storage, device/account access, timing, and distance-specific boundaries are missing.
- **Scheduled dominance / submission messages** (`scheduled_messages`)
  - **Missing important qualifier:** These remote/digital questions are using the generic relationship-dynamic profile. `Scope / protocol / areas` is not enough and is sometimes off-topic; remote-specific qualifiers such as synchronous vs asynchronous use, platform/channel, privacy, recording/storage, device/account access, timing, and distance-specific boundaries are missing.
- **Private photo exchange** (`photo_exchange_private`)
  - **Missing important qualifier:** These remote/digital questions are using the generic relationship-dynamic profile. `Scope / protocol / areas` is not enough and is sometimes off-topic; remote-specific qualifiers such as synchronous vs asynchronous use, platform/channel, privacy, recording/storage, device/account access, timing, and distance-specific boundaries are missing.
- **Private video exchange** (`video_exchange_private`)
  - **Missing important qualifier:** These remote/digital questions are using the generic relationship-dynamic profile. `Scope / protocol / areas` is not enough and is sometimes off-topic; remote-specific qualifiers such as synchronous vs asynchronous use, platform/channel, privacy, recording/storage, device/account access, timing, and distance-specific boundaries are missing.
- **Remote observation** (`remote_observation`)
  - **Missing important qualifier:** These remote/digital questions are using the generic relationship-dynamic profile. `Scope / protocol / areas` is not enough and is sometimes off-topic; remote-specific qualifiers such as synchronous vs asynchronous use, platform/channel, privacy, recording/storage, device/account access, timing, and distance-specific boundaries are missing.
- **Long-distance protocol / rules** (`long_distance_protocol`)
  - **Missing important qualifier:** These remote/digital questions are using the generic relationship-dynamic profile. `Scope / protocol / areas` is not enough and is sometimes off-topic; remote-specific qualifiers such as synchronous vs asynchronous use, platform/channel, privacy, recording/storage, device/account access, timing, and distance-specific boundaries are missing.

### Fantasy / transformation themes (17)

- **Size-difference fantasy** (`size_difference_fantasy`)
  - **Needs update:** A pure-fantasy concept is inheriting the general roleplay profile, including `Costume / presentation`, `Authority / power level`, and enactment choices. Those are not universally meaningful for imagined transformations, body swaps, pregnancy/breeding, size fantasies, hypnosis, ownership/use fantasies, etc. These need fantasy-specific subtype/framing qualifiers and fantasy-only field filtering.
- **Giant / tiny fantasy** (`giant_tiny_fantasy`)
  - **Needs update:** A pure-fantasy concept is inheriting the general roleplay profile, including `Costume / presentation`, `Authority / power level`, and enactment choices. Those are not universally meaningful for imagined transformations, body swaps, pregnancy/breeding, size fantasies, hypnosis, ownership/use fantasies, etc. These need fantasy-specific subtype/framing qualifiers and fantasy-only field filtering.
- **Body-swap fantasy** (`body_swap_fantasy`)
  - **Needs update:** A pure-fantasy concept is inheriting the general roleplay profile, including `Costume / presentation`, `Authority / power level`, and enactment choices. Those are not universally meaningful for imagined transformations, body swaps, pregnancy/breeding, size fantasies, hypnosis, ownership/use fantasies, etc. These need fantasy-specific subtype/framing qualifiers and fantasy-only field filtering.
- **Gender-expression roleplay between adults** (`gender_expression_roleplay`)
  - **Needs update:** `Authority / power level` is unconditional in the shared roleplay profile even though authority is not inherent to this concept. Some of these also do not benefit from costume/script questions in the same way as character-roleplay. The profile needs field-level relevance rules.
- **Costume / alternate-identity roleplay** (`costume_identity_roleplay`)
  - **Needs update:** `Authority / power level` is unconditional in the shared roleplay profile even though authority is not inherent to this concept. Some of these also do not benefit from costume/script questions in the same way as character-roleplay. The profile needs field-level relevance rules.
- **Doll-transformation fantasy** (`doll_transformation_fantasy`)
  - **Needs update:** A pure-fantasy concept is inheriting the general roleplay profile, including `Costume / presentation`, `Authority / power level`, and enactment choices. Those are not universally meaningful for imagined transformations, body swaps, pregnancy/breeding, size fantasies, hypnosis, ownership/use fantasies, etc. These need fantasy-specific subtype/framing qualifiers and fantasy-only field filtering.
- **Robot / programming fantasy** (`robot_transformation_fantasy`)
  - **Needs update:** A pure-fantasy concept is inheriting the general roleplay profile, including `Costume / presentation`, `Authority / power level`, and enactment choices. Those are not universally meaningful for imagined transformations, body swaps, pregnancy/breeding, size fantasies, hypnosis, ownership/use fantasies, etc. These need fantasy-specific subtype/framing qualifiers and fantasy-only field filtering.
- **Fictional monster transformation fantasy** (`monster_transformation_fantasy`)
  - **Needs update:** A pure-fantasy concept is inheriting the general roleplay profile, including `Costume / presentation`, `Authority / power level`, and enactment choices. Those are not universally meaningful for imagined transformations, body swaps, pregnancy/breeding, size fantasies, hypnosis, ownership/use fantasies, etc. These need fantasy-specific subtype/framing qualifiers and fantasy-only field filtering.
- **Fictional nonhuman-character fantasy** (`nonhuman_character_fantasy`)
  - **Needs update:** A pure-fantasy concept is inheriting the general roleplay profile, including `Costume / presentation`, `Authority / power level`, and enactment choices. Those are not universally meaningful for imagined transformations, body swaps, pregnancy/breeding, size fantasies, hypnosis, ownership/use fantasies, etc. These need fantasy-specific subtype/framing qualifiers and fantasy-only field filtering.
- **Magical-control fantasy** (`magical_control_fantasy`)
  - **Needs update:** A pure-fantasy concept is inheriting the general roleplay profile, including `Costume / presentation`, `Authority / power level`, and enactment choices. Those are not universally meaningful for imagined transformations, body swaps, pregnancy/breeding, size fantasies, hypnosis, ownership/use fantasies, etc. These need fantasy-specific subtype/framing qualifiers and fantasy-only field filtering.
- **Hypnosis fantasy** (`hypnosis_fantasy`)
  - **Needs update:** A pure-fantasy concept is inheriting the general roleplay profile, including `Costume / presentation`, `Authority / power level`, and enactment choices. Those are not universally meaningful for imagined transformations, body swaps, pregnancy/breeding, size fantasies, hypnosis, ownership/use fantasies, etc. These need fantasy-specific subtype/framing qualifiers and fantasy-only field filtering.
- **Breeding / fertility fantasy** (`breeding_fantasy`)
  - **Needs update:** A pure-fantasy concept is inheriting the general roleplay profile, including `Costume / presentation`, `Authority / power level`, and enactment choices. Those are not universally meaningful for imagined transformations, body swaps, pregnancy/breeding, size fantasies, hypnosis, ownership/use fantasies, etc. These need fantasy-specific subtype/framing qualifiers and fantasy-only field filtering.
- **Pregnancy-related fantasy** (`pregnancy_fantasy`)
  - **Needs update:** A pure-fantasy concept is inheriting the general roleplay profile, including `Costume / presentation`, `Authority / power level`, and enactment choices. Those are not universally meaningful for imagined transformations, body swaps, pregnancy/breeding, size fantasies, hypnosis, ownership/use fantasies, etc. These need fantasy-specific subtype/framing qualifiers and fantasy-only field filtering.
- **Ownership fantasy** (`ownership_fantasy`)
  - **Needs update:** A pure-fantasy concept is inheriting the general roleplay profile, including `Costume / presentation`, `Authority / power level`, and enactment choices. Those are not universally meaningful for imagined transformations, body swaps, pregnancy/breeding, size fantasies, hypnosis, ownership/use fantasies, etc. These need fantasy-specific subtype/framing qualifiers and fantasy-only field filtering.
- **Public-use fantasy without nonconsenting participants** (`public_use_fantasy`)
  - **Needs update:** A pure-fantasy concept is inheriting the general roleplay profile, including `Costume / presentation`, `Authority / power level`, and enactment choices. Those are not universally meaningful for imagined transformations, body swaps, pregnancy/breeding, size fantasies, hypnosis, ownership/use fantasies, etc. These need fantasy-specific subtype/framing qualifiers and fantasy-only field filtering.
- **Anonymous-use fantasy in an imagined adult setting** (`anonymous_use_fantasy`)
  - **Needs update:** A pure-fantasy concept is inheriting the general roleplay profile, including `Costume / presentation`, `Authority / power level`, and enactment choices. Those are not universally meaningful for imagined transformations, body swaps, pregnancy/breeding, size fantasies, hypnosis, ownership/use fantasies, etc. These need fantasy-specific subtype/framing qualifiers and fantasy-only field filtering.
- **Gender-transformation fantasy** (`gender_transformation_fantasy`)
  - **Needs update:** It inherits the broad transformation profile, whose subtype list includes unrelated nonhuman and object/doll-like transformations. A gender-transformation question should focus on gendered traits, sex characteristics, presentation, degree/direction, and permanence/reversibility rather than the full transformation taxonomy.

### Sexual context & locations (11)

- **Bedroom sex** (`bedroom_context`)
  - **Needs update:** The `location_types` qualifier lists the other location questions (bedroom, shower, hotel, car, outdoors, club, party, etc.). On a specific setting such as `Bedroom sex`, that directly contradicts/repeats the main question. Privacy is relevant; the first field should be setting-specific.
- **Shower / bath sex** (`shower_bath_context`)
  - **Needs update:** The `location_types` qualifier lists the other location questions (bedroom, shower, hotel, car, outdoors, club, party, etc.). On a specific setting such as `Bedroom sex`, that directly contradicts/repeats the main question. Privacy is relevant; the first field should be setting-specific.
- **Sex elsewhere at home** (`other_home_context`)
  - **Needs update:** The `location_types` qualifier lists the other location questions (bedroom, shower, hotel, car, outdoors, club, party, etc.). On a specific setting such as `Bedroom sex`, that directly contradicts/repeats the main question. Privacy is relevant; the first field should be setting-specific.
- **Hotel sex** (`hotel_context`)
  - **Needs update:** The `location_types` qualifier lists the other location questions (bedroom, shower, hotel, car, outdoors, club, party, etc.). On a specific setting such as `Bedroom sex`, that directly contradicts/repeats the main question. Privacy is relevant; the first field should be setting-specific.
- **Sex in a car in a private context** (`car_private_context`)
  - **Needs update:** The `location_types` qualifier lists the other location questions (bedroom, shower, hotel, car, outdoors, club, party, etc.). On a specific setting such as `Bedroom sex`, that directly contradicts/repeats the main question. Privacy is relevant; the first field should be setting-specific.
- **Sex in a private outdoor setting** (`private_outdoors_context`)
  - **Needs update:** The `location_types` qualifier lists the other location questions (bedroom, shower, hotel, car, outdoors, club, party, etc.). On a specific setting such as `Bedroom sex`, that directly contradicts/repeats the main question. Privacy is relevant; the first field should be setting-specific.
- **Sex while camping** (`camping_context`)
  - **Needs update:** The `location_types` qualifier lists the other location questions (bedroom, shower, hotel, car, outdoors, club, party, etc.). On a specific setting such as `Bedroom sex`, that directly contradicts/repeats the main question. Privacy is relevant; the first field should be setting-specific.
- **Sex at an adult sex club** (`sex_club_context`)
  - **Needs update:** The `location_types` qualifier lists the other location questions (bedroom, shower, hotel, car, outdoors, club, party, etc.). On a specific setting such as `Bedroom sex`, that directly contradicts/repeats the main question. Privacy is relevant; the first field should be setting-specific.
- **Sex at an adult play party** (`play_party_context`)
  - **Needs update:** The `location_types` qualifier lists the other location questions (bedroom, shower, hotel, car, outdoors, club, party, etc.). On a specific setting such as `Bedroom sex`, that directly contradicts/repeats the main question. Privacy is relevant; the first field should be setting-specific.
- **Sex in novel or unusual private locations** (`novel_location_context`)
  - **Needs update:** The `location_types` qualifier lists the other location questions (bedroom, shower, hotel, car, outdoors, club, party, etc.). On a specific setting such as `Bedroom sex`, that directly contradicts/repeats the main question. Privacy is relevant; the first field should be setting-specific.
- **Semi-public sex fantasy without involving nonconsenting people** (`semi_public_fantasy_context`)
  - **Needs update:** The `location_types` qualifier lists the other location questions (bedroom, shower, hotel, car, outdoors, club, party, etc.). On a specific setting such as `Bedroom sex`, that directly contradicts/repeats the main question. Privacy is relevant; the first field should be setting-specific.

## Questions I did not flag

Not being flagged means I did not find a clear relevance problem under the threshold above; it does not mean the question could never be improved. The strongest currently coherent detail sets are the dedicated `remote_toy` profile, the general `transformation_fantasy` profile, the material-interest profile, and most of the emotion self/partner profiles (apart from the self-referential blend cleanup noted above).
