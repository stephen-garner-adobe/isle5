---
name: verification-auditor
description: Use when gathering and reporting evidence for storefront quality gates, especially lint/build status, route coverage, responsive geometry, visual evidence, and shipping-readiness verification.
---

# Verification Auditor

Owns verification evidence and gate reporting.

## Owns

- Lint and build gate execution/reporting
- Route coverage and smoke evidence
- Responsive geometry and visual evidence review
- Shipping-readiness summaries
- Risk-tier classification for changed surfaces

## Does not own

- Primary runtime implementation fixes
- Primary config or initializer design
- README and DA.live contract authorship
- Upstream drift planning

## Inputs

- Changed surfaces or target scope
- Desired mode: `lint-build`, `route-coverage`, `geometry-visual`, or `shipping-readiness`
- Available artifacts such as Cypress output or screenshots

## Workflow

1. Determine the verification scope from the change set or user request.
2. Collect execution evidence:
   - lint/build
   - route/spec coverage
   - visual/geometry artifacts
3. Classify the affected surfaces by risk tier.
4. Produce findings for failed or missing verification surfaces.
5. Produce a compact gate summary with pass/fail status.

## Sub-modes

### `lint-build`

- Run and report `npm run lint:js`
- Run and report `npm run lint:css`
- Verify `npm run build:json`
- Verify generated component files are in sync

### `route-coverage`

- Map critical routes to Cypress coverage
- Identify missing, weak, skipped, or environment-gated coverage
- Note prerequisite-gated flows and missing setup

### `geometry-visual`

- Review viewport sweep evidence
- Flag overflow, clipping, overlay, tap-target, and focus-outline issues
- Distinguish true geometry defects from visual-only effects

### `shipping-readiness`

- Combine lint/build/coverage/geometry results
- Apply risk-based expectations from `AGENTS.md`
- Report pass/fail by gate area

## Output

Emit findings using `skills/_contracts/finding-schema.md`.

Recommended domains:
- `pipeline`
- `route-coverage`
- `visual-geometry`
- `css-discipline`
- `ci-cd`

Also produce a gate summary table when useful.

## Evidence rules

- Use command output, artifact paths, screenshots, or spec references.
- Mark findings `unchecked` when verification was not executed and state what is missing.
- Keep evidence focused on verification, not architecture speculation.

## Delegation

- Delegate runtime code fixes to `implementation-auditor`.
- Delegate config or initializer causes to `commerce-integration-auditor`.
- Delegate README or `ue/models/blocks/block-name.json` parity issues to `authoring-contract-auditor`.

## Inspect

- `package.json`
- `.husky/`
- `.github/workflows/`
- `component-definition.json`
- `component-models.json`
- `component-filters.json`
- `cypress/`
- `cypress/tmp/`
- `cypress/screenshots/`

## Avoid

- Owning product decisions
- Conflating route behavior with visual correctness
- Treating missing verification as verified failure
