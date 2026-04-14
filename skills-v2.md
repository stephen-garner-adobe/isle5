# Adobe Commerce Storefront Skills & Agents v2 Draft

This draft consolidates the current skill system into a smaller, harder-edged model that is easier to execute and maintain.

## Architecture

| Layer | Purpose | Files |
|-------|---------|-------|
| Contracts | Shared finding language and delegation rules | `skills/_contracts/*` |
| Specialist auditors | Bounded domain ownership | `skills/*/SKILL.md` |
| Orchestrators | Synthesis and dependency-ordered execution | `agents/*/AGENT.md` |
| Tooling | Executable assessment and gate runner | `tools/waypoint/*` |

## Specialist auditors

| Skill | Owns |
|-------|------|
| `implementation-auditor` | Runtime code quality in blocks and routes |
| `commerce-integration-auditor` | Config, endpoints, initializers, event bus, route prerequisites |
| `verification-auditor` | Lint/build/test/geometry evidence and gate summaries |
| `authoring-contract-auditor` | README, metadata, DA.live, `_block.json` parity |
| `upstream-drift-reviewer` | Upstream comparison and sync planning |

## Orchestrators

| Agent | Owns |
|-------|------|
| `assess` | Synthesis, readiness, dependency graph, remediation packages |
| `execute-remediation` | Ordered execution and post-fix verification routing |

## Design rules

- One owner per concern.
- Verification is a first-class domain, not a scattered responsibility.
- Contracts stay stable even if skill boundaries evolve.
- `tools/waypoint` should become the authoritative executable layer.

## Migration notes

- Keep old skills and agents during transition.
- Repoint overview/help text to this v2 model before deleting old files.
- Add machine-readable JSON output in `tools/waypoint` so findings can be tracked over time.
