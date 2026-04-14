# Finding Schema

Universal output shape for every skill and agent in this system. All audit findings, gap reports, and remediation notes must use this structure so that agents can aggregate, deduplicate, and order them reliably.

## Required fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier: `{skill-name}/{domain}/{sequential-number}` (e.g., `storefront-block-author/security/1`) |
| `domain` | string | Concern domain from the taxonomy: `structure`, `metadata-contract`, `security`, `accessibility`, `performance`, `lifecycle`, `error-handling`, `authoring`, `da-live-contract`, `documentation`, `route-coverage`, `visual-geometry`, `css-discipline`, `config`, `endpoint`, `pipeline`, `drop-in-lifecycle`, `event-bus`, `data-flow`, `cross-block`, `analytics`, `seo`, `error-paths`, `ci-cd`, `upstream-drift` |
| `severity` | enum | `blocker` / `warning` / `advisory` (see `severity-model.md`) |
| `confidence` | enum | `verified` / `inferred` / `unchecked` (see `severity-model.md`) |
| `summary` | string | One-line finding description, actionable and specific |
| `evidence` | string | File path with line reference (`blocks/hero-cta/hero-cta.js:42`) or artifact reference (`cypress/screenshots/header-360.png`) |
| `principle` | string | AGENTS.md rule citation — section heading and key phrase (e.g., `Security Requirements > URL Safety: never trust authored href/src blindly`) |
| `remediation` | string | Specific action to resolve, or delegation note (`delegate to storefront-block-author for implementation fix`) |

## Optional fields

| Field | Type | Description |
|-------|------|-------------|
| `cross-deps` | string[] | IDs of findings this finding depends on or affects (e.g., `["commerce-config-doctor/config/1"]` when a config error makes route findings moot) |
| `delegate-to` | string | Skill or agent name when remediation requires specialist depth outside the current skill's domain |

## Usage rules

1. Every audit skill must emit findings in this shape. Generative skills (`commerce-optimizer-catalog-builder`) produce artifacts, not findings.
2. Findings must be self-contained — a reader should understand the problem, its location, and the fix from one finding alone.
3. Findings referencing the same file and line from different skills must use consistent `evidence` strings so agents can detect overlap.
4. When a finding makes downstream findings moot, use `cross-deps` to express the dependency so remediation ordering is correct.
5. When a finding falls outside the emitting skill's remediation scope, set `delegate-to` and keep `remediation` as a delegation note, not an implementation instruction.

## Example

```
id: storefront-block-author/security/1
domain: security
severity: blocker
confidence: verified
summary: hero-cta block uses innerHTML with unsanitized author content at line 87
evidence: blocks/hero-cta/hero-cta.js:87
principle: Security Requirements > HTML Injection Safety: do not inject unsanitized author content with innerHTML
remediation: Replace innerHTML assignment with createElement/textContent DOM construction
```
