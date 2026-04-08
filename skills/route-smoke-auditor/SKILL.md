---
name: route-smoke-auditor
description: Use when validating Adobe Commerce Storefront route-critical flows in repositories like isle5, especially home, PLP, PDP, cart, checkout, login, account, and search coverage through Cypress specs and route-to-block expectations.
---

# Route Smoke Auditor

Use this skill for route-level readiness and smoke coverage checks.

Core workflow:
1. Inspect `cypress/` specs and the route inventory implied by `AGENTS.md`.
2. Map critical routes to expected blocks or drop-ins.
3. Identify missing, weak, or obviously stale smoke coverage.
4. Separate route reachability concerns from static code-quality concerns.
5. Report prerequisite-gated routes explicitly instead of treating them as passed.

Inspect:
- `cypress/`
- route-critical blocks
- drop-in surfaces
- `AGENTS.md`

Produce:
- route coverage summaries
- missing smoke findings
- route-to-block expectation gaps

Avoid:
- acting like a full visual diff tool
- treating static lint issues as route validation

