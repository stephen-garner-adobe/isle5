# Severity and Confidence Model

Shared classification system for all skills and agents. Every finding must carry both a severity and a confidence level.

## Severity

| Level | Criteria | AGENTS.md mapping | Shipping impact |
|-------|----------|-------------------|-----------------|
| **blocker** | Violates a MUST / REQUIRED / MANDATORY rule. Will cause accessibility, security, or runtime failures in production. | Rules using "must", "required", "mandatory", "never" language. All items in the Security Requirements and Accessibility sections. All items in the Before Shipping Checklist. | Blocks shipping. Must fix before merge. |
| **warning** | Violates a SHOULD / RECOMMENDED rule. Degrades quality, developer experience, or maintainability. May cause subtle bugs under edge conditions. | Rules using "should", "recommended", "prefer" language. Most Metadata Contract and README rules. | Should fix before shipping. Can ship with documented exception per the Exceptions Process. |
| **advisory** | Violates a MAY / OPTIONAL preference or represents an improvement opportunity. No functional impact. | Rules using "may", "consider", "optionally" language. Style preferences. Documentation completeness beyond required sections. | Can ship without fixing. Track for future improvement. |

## Confidence

| Level | Criteria | Evidence requirement |
|-------|----------|---------------------|
| **verified** | Directly observed in code or artifacts. The assessor read the file and confirmed the condition. | Must include `file:line` reference or artifact path. |
| **inferred** | Likely true based on patterns, naming conventions, or absence of expected artifacts, but not directly confirmed in code. | Must describe the inference chain (e.g., "no `events.off()` found in block, but `events.on()` is called at line 34"). |
| **unchecked** | Could not verify with available artifacts. Requires manual review, runtime testing, or access to external systems. | Must state what would be needed to verify (e.g., "requires running Cypress at 360px viewport to confirm overflow"). |

## Priority ordering

When multiple findings compete for remediation attention:

1. **Blockers before warnings before advisories** — severity is the primary sort.
2. **Within same severity, verified before inferred before unchecked** — act on certainties first.
3. **Within same severity and confidence, upstream dependencies first** — fix config before data flow before routes (see `delegation-protocol.md` dependency chains).

## Rule priority from AGENTS.md

AGENTS.md defines this rule priority (highest to lowest). Use it to break ties when two findings have the same severity:

1. Security and data safety
2. Accessibility and semantic correctness
3. Runtime performance and loading-phase correctness
4. Metadata contract correctness and authoring predictability
5. Maintainability and documentation completeness
6. Visual/style preferences
