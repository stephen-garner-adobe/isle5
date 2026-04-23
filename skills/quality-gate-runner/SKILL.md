---
name: quality-gate-runner
description: Use when validating Adobe Commerce Storefront quality gates in repositories like isle5, especially lint execution, build pipeline health, shipping checklist verification, CI/CD workflow status, and risk-based testing expectations from AGENTS.md.
---

# Quality Gate Runner

## When to use

- Pre-commit validation before pushing block changes
- PR review to verify all gates pass
- Shipping readiness check before a block or feature goes live
- Build pipeline diagnosis when `npm run build:json` output drifts from source
- CI/CD health check when GitHub workflows may be stale or failing

## Discovery questions

1. **Gate scope?** Pre-commit check, PR review, or full shipping readiness gate?
2. **Changed surfaces?** Which blocks, scripts, or configs changed? (Determines risk-based testing tier.)
3. **Full or targeted?** Run all gates, or focus on a specific gate category (lint, build, shipping checklist)?

If not specified, default to full gate run for all changed surfaces.

## Core workflow

1. Identify changed surfaces from git status or user input.
2. Run lint checks (`npm run lint:js`, `npm run lint:css`).
3. Validate build pipeline (`npm run build:json` output matches source `ue/models/**/*.json` files).
4. Verify pre-commit hook health (husky runs `build:json` and stages output).
5. Walk the AGENTS.md Before Shipping Checklist against the changed surfaces.
6. Check CI/CD workflow status for relevant GitHub Actions.
7. Apply risk-based testing expectations based on block type.
8. Emit findings in the shared finding schema with pass/fail per gate category.

## Checklists

### Lint (AGENTS.md: Linting and Quality Gates)

- [ ] `npm run lint:js` passes with zero errors
- [ ] `npm run lint:css` passes with zero errors
- [ ] ESLint exceptions use `// eslint-disable-next-line` with documented reason
- [ ] Single quotes used in JS
- [ ] Trailing commas present
- [ ] No trailing whitespace
- [ ] Line length respects project config (typically 100 characters)

### Build pipeline (AGENTS.md: DA.live JSON Config > Integration with project-level configs)

- [ ] `npm run build:json` completes without error
- [ ] `component-definition.json` output matches aggregated source from `ue/models/component-definition.json` and `ue/models/blocks/*.json`
- [ ] `component-models.json` output matches aggregated source from all `ue/models/blocks/*.json` model sections
- [ ] `component-filters.json` output matches aggregated source from all `ue/models/blocks/*.json` filter sections
- [ ] No stale model fields in built output that no longer map to implemented behavior
- [ ] Pre-commit hook (`husky`) runs `build:json` and stages the output files
- [ ] `postinstall.js` correctly syncs all `@dropins/storefront-*` packages from `node_modules` to `scripts/__dropins__/`
- [ ] `build.mjs` GraphQL overrides are intentional and documented, not accidental drift
- [ ] No artifactory references in `package-lock.json` (postinstall.js validation)
- [ ] No uncommitted source maps in `scripts/__dropins__/` (postinstall.js warning)

### Before Shipping Checklist (AGENTS.md: Before Shipping Checklist — all 17 items)

For each changed block, verify:

1. [ ] Lint passes (`lint:js` and `lint:css`)
2. [ ] Metadata resolution works for both single and double-prefix section keys
3. [ ] Precedence tiers implemented in code and documented in README with matching terminology
4. [ ] Override/no-op combinations are deterministic and warned clearly
5. [ ] Invalid metadata safely falls back and logs actionable warnings
6. [ ] Unsafe URLs are blocked; `_blank` links include `noopener noreferrer`
7. [ ] No-JS fallback: critical content and links visible/usable before decoration
8. [ ] Motion respects `prefers-reduced-motion` and timers are lifecycle-safe
9. [ ] Mobile and desktop layouts verified, including 44x44 tap targets
10. [ ] README and `ue/models/blocks/block-name.json` match implemented behavior
11. [ ] Responsive geometry gate passes across required widths (no hard leak > 2px)
12. [ ] Floating/absolute UI layers clamped, no overflow/clip at small screens
13. [ ] Drop-in components (if used) scoped, initialized correctly, handle render errors gracefully
14. [ ] Block works correctly in both Eager and Lazy loading phases as appropriate
15. [ ] If change affects critical user paths, run or extend Cypress tests where applicable
16. [ ] `decorate(block)` is safe to re-run without duplicating markup, listeners, or timers
17. [ ] Route/page metadata requirements documented for route-specific blocks

### CI/CD health (AGENTS.md: not explicit — waypoint-assess domain 20 establishes)

- [ ] `check-block-readme.yaml` workflow active and catches blocks missing READMEs
- [ ] `protect-aem-js.yaml` workflow active and prevents direct edits to `scripts/aem.js`
- [ ] `main.yaml` CI pipeline passing
- [ ] `run-e2e-tests.yaml` (PaaS) and `run-e2e-tests-saas.yaml` (SaaS) passing for critical routes
- [ ] `run-percy-visual-tests.yaml` tracking key pages
- [ ] No stale or disabled workflows that should be active

### Risk-based testing expectations (AGENTS.md: Risk-Based Testing Expectations)

| Block type | Required gates |
|------------|---------------|
| Content-only or presentational | lint + responsive geometry sweep + manual authoring verification |
| Metadata-heavy with non-trivial precedence | lint + geometry sweep + targeted automated tests for config resolution/normalizers |
| Drop-in / auth / cart / checkout / account / critical-path commerce | lint + geometry sweep + route-level smoke test or automated e2e coverage |

- [ ] Changed block classified into correct risk tier
- [ ] All gates for the risk tier executed
- [ ] If automated coverage not added for high-risk block, manual scenarios documented in PR/commit notes

## Output format

Emit findings using the shared finding schema from `_contracts/finding-schema.md`. Additionally, produce a gate summary:

```
## Gate Summary

| Gate | Status | Details |
|------|--------|---------|
| Lint (JS) | pass/fail | Error count, file references |
| Lint (CSS) | pass/fail | Error count, file references |
| Build pipeline | pass/fail | Drift details if any |
| Shipping checklist | X/17 pass | Failed item numbers |
| CI/CD health | pass/fail | Failing workflow names |
| Risk-based testing | pass/fail | Missing coverage details |
```

## Cross-skill awareness

| Action | Delegate to |
|--------|------------|
| Block implementation fixes for lint failures | `storefront-block-author` |
| README or `ue/models/blocks/block-name.json` fixes for shipping checklist failures | `authoring-contract-auditor` |
| Responsive geometry failures | `visual-geometry-auditor` |
| Route coverage gaps in risk-based testing | `route-smoke-auditor` |

**Owns**: Lint execution, build pipeline validation, shipping checklist verification, CI/CD health, risk-based testing classification.

## Evidence patterns

- **Lint**: Show the exact lint error output with file:line references.
- **Build pipeline**: Show diff between built output and expected aggregation from source `ue/models/**/*.json` files.
- **Shipping checklist**: For each failed item, reference the specific block file and line where the violation occurs.
- **CI/CD**: Reference the workflow file and its last run status.
- **Risk-based testing**: Show the block classification rationale and which required gates are missing.

## Inspect

- `package.json` — scripts, dependencies, drop-in versions
- `.eslintrc.json`, `.stylelintrc.json` — lint configuration
- `component-definition.json`, `component-models.json`, `component-filters.json` — built output
- `ue/models/component-definition.json` — definition source with globs
- `ue/models/blocks/*.json` — individual block DA.live configs
- `build.mjs` — GraphQL override builder
- `postinstall.js` — drop-in sync script
- `.husky/` — pre-commit hook configuration
- `.github/workflows/` — CI/CD workflow definitions
- `AGENTS.md` — canonical rule source (Before Shipping Checklist, Linting, Risk-Based Testing)

## Produce

- Gate pass/fail summary
- Findings in shared schema for each failure
- Risk tier classification for changed blocks
- Delegation notes for failures outside this skill's remediation scope

## Avoid

- Fixing lint errors directly — delegate implementation changes to `storefront-block-author`
- Running Cypress tests (that belongs to the CI/CD system or manual verification) — report coverage gaps instead
- Rewriting block code to pass the shipping checklist — emit findings and delegate
- Treating this skill as a replacement for `npm run lint` — it adds structured output and shipping checklist verification on top of lint
