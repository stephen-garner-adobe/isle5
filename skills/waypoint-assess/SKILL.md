---
name: waypoint-assess
description: Use when performing a storefront-wide Adobe Commerce assessment in repositories like isle5, especially when combining blocks, drop-ins, routes, docs, config, visual evidence, and remediation grouping into one operational assessment.
---

# Waypoint Assess

Use this skill as the storefront-wide assessment orchestrator.

Core workflow:
1. Read `AGENTS.md` and relevant repo docs first.
2. Inspect blocks, scripts, config, Cypress coverage, and available visual evidence.
3. Separate findings by lane or concern domain: security, block/docs, route coverage, visual evidence, config readiness, and confidence.
4. Group findings into action packages with validators, approval requirements, and next commands.
5. For risky code changes, emit Codex-ready plans rather than direct unsafe mutation.

Inspect:
- `AGENTS.md`
- `README.md`
- `blocks/`
- `scripts/`
- `cypress/`
- config and git surfaces

Produce:
- structured findings
- confidence/readiness state
- grouped remediation packages
- next-step commands for Codex or developers

Avoid:
- acting like a generic lint wrapper
- mutating risky code directly when the right outcome is a Codex-ready plan

