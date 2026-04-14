---
name: commerce-integration-auditor
description: Use when diagnosing or reviewing Adobe Commerce storefront platform integration, especially config surfaces, endpoint selection, headers, mode detection, drop-in initializers, event bus lifecycle, and route prerequisites.
---

# Commerce Integration Auditor

Owns commerce platform and drop-in integration correctness.

## Owns

- `config.json` and related config surface diagnosis
- Storefront mode detection: CS, ACO, or mixed
- Endpoint and header correctness
- Drop-in initializer lifecycle and dependency order
- Event bus lifecycle and scope isolation
- Route prerequisites caused by platform integration

## Does not own

- Block JS/CSS implementation quality
- README or DA.live contract certification
- General lint/build/test execution
- Upstream merge planning

## Inputs

- Route or feature in scope
- Affected drop-ins
- Environment expectations if known
- Relevant config and initializer files

## Workflow

1. Read config surfaces first: `config.json`, demo configs, `head.html`, `fstab.yaml`.
2. Inspect `scripts/commerce.js` and `scripts/initializers/`.
3. Determine storefront mode and expected endpoint/header behavior.
4. Verify drop-in initializers, dependency order, and event bus cleanup.
5. Map integration issues to their downstream route impact.
6. Emit findings or apply focused fixes within the integration layer.

## Core checks

- `commerce-core-endpoint` vs `commerce-endpoint` correctness
- Header matrix correctness for CS and ACO
- Mixed-mode contradictions
- CSP and import-map sanity where they affect commerce delivery
- `initializeDropin()` guards and initializer order
- `setEndpoint()` placement before initialization
- Event subscription cleanup and no stacking on re-decoration
- Multi-instance scope handling
- Route prerequisites for auth, cart, checkout, account, wishlist, PDP, and PLP

## Output

Emit findings using `skills/_contracts/finding-schema.md`.

Recommended domains:
- `config`
- `endpoint`
- `drop-in-lifecycle`
- `event-bus`
- `data-flow`
- `cross-block`

## Evidence rules

- Include the actual config key, header, endpoint, or initializer line.
- State expected vs actual behavior.
- Note downstream route impact in `cross-deps` where relevant.

## Delegation

- Delegate block-level remediation to `implementation-auditor`.
- Delegate route/test/geometry evidence to `verification-auditor`.
- Delegate route-specific documentation gaps to `authoring-contract-auditor`.

## Inspect

- `config.json`
- `demo-config.json`
- `demo-config-aco.json`
- `default-site.json`
- `head.html`
- `fstab.yaml`
- `scripts/commerce.js`
- `scripts/initializers/`
- Route-specific commerce blocks

## Avoid

- Owning README or `_block.json` parity
- Treating pure implementation defects as integration defects
- Recommending blind config changes without mode diagnosis
