---
name: route-smoke-auditor
description: Use when validating Adobe Commerce Storefront route-critical flows in repositories like isle5, especially home, PLP, PDP, cart, checkout, login, account, search, wishlist, order, and recommendations coverage through Cypress specs, route-to-block mapping, and prerequisite-gated route detection.
---

# Route Smoke Auditor

## When to use

- Auditing implementation readiness across critical storefront routes
- Validating route coverage after adding or changing blocks or drop-ins
- Checking that Cypress specs exist and are functional for critical user journeys
- Identifying routes that are unreachable due to missing prerequisites (auth, cart state, config)
- Mapping routes to the blocks and drop-ins they require

## Discovery questions

1. **Scope?** Which routes are in scope — all critical routes, or a specific subset?
2. **Environment?** Is the storefront configured for SaaS or PaaS? (Affects which Cypress config and skip tags apply.)
3. **New routes?** Are there recently added routes that may not have Cypress coverage yet?
4. **Config-gated?** Are there known config issues that would make certain routes unreachable? (Check with `commerce-config-doctor` first.)

## Core workflow

1. Read the Cypress test inventory under `cypress/src/tests/e2eTests/`.
2. Map each spec to the route(s) it validates.
3. Compare the spec inventory against the full route list from the route inventory below.
4. Identify coverage gaps: routes with no spec, specs that only check element presence (not functional behavior), specs that are skipped or flaky.
5. Map each route to its required blocks and drop-ins.
6. Identify prerequisite-gated routes and verify their prerequisites are testable.
7. Emit findings for coverage gaps and prerequisite issues.

## Checklists

### Route inventory

Critical storefront routes and their expected Cypress coverage:

| Route | Expected spec(s) | Required blocks/drop-ins | Prerequisites |
|-------|------------------|-------------------------|---------------|
| Home | (varies) | hero, header, footer, content blocks | None |
| PLP (product list) | `verifyProductListPage.spec.js` | `product-list-page`, `storefront-product-discovery` | CS endpoint configured |
| PDP (product details) | (implicit in checkout/wishlist specs) | `product-details`, `storefront-pdp` | CS endpoint configured, valid product URL |
| Cart | `verifyCartUndo.spec.js` | `commerce-cart`, `storefront-cart` | Item in cart |
| Checkout (guest) | `verifyGuestUserCheckout.spec.js` | `commerce-checkout`, `storefront-checkout`, `storefront-payment-services` | Item in cart |
| Checkout (auth) | `verifyAuthUserCheckout.spec.js` | `commerce-checkout`, `storefront-checkout`, `storefront-payment-services` | Auth + item in cart |
| Checkout (virtual) | `verifyGuestUserVirtualCheckout.spec.js` | `commerce-checkout`, `storefront-checkout` | Virtual item in cart |
| Checkout (gift card + options) | `verifyZeroTotalCheckoutWithGiftCardAndGiftOptions.spec.js` | `commerce-checkout`, `commerce-gift-options` | Gift card in cart |
| Login | (implicit in auth checkout/wishlist specs) | `commerce-login`, `storefront-auth` | Auth endpoint configured |
| Account | `verifyUserAccount.spec.js` | `commerce-customer-*`, `storefront-account` | Authenticated user |
| Search | `verifyProductSearch.spec.js` | `search-bar`, `storefront-product-discovery` | CS endpoint configured |
| Wishlist (guest) | `verifyGuestUserWishlistFeature.spec.js` | `commerce-wishlist`, `storefront-wishlist` | CS endpoint configured |
| Wishlist (auth) | `verifyAuthUserWishlistFeature.spec.js` | `commerce-wishlist`, `storefront-wishlist` | Auth + CS endpoint |
| Recommendations | `verifyRecsDisplay.spec.js` | `product-recommendations`, `storefront-recommendations` | CS endpoint configured |
| Store switcher | `verifyStoreSwitcher.spec.js` | Header store selector | Multiple stores configured |
| Top banner | `verifyTopBanner.spec.js` | `top-banner` | None |
| Low stock | `verifyLowStockInfoMessage.spec.js` | `product-details` | Low-stock product exists |
| Order history | (no dedicated spec) | `commerce-orders-list`, `storefront-order` | Authenticated user with orders |
| Order confirmation | (implicit in checkout specs) | `commerce-checkout-success`, `storefront-order` | Completed checkout |

### Coverage gap detection

- [ ] Every critical route has at least one Cypress spec
- [ ] Specs test functional behavior (user actions and assertions), not just element presence
- [ ] No specs permanently skipped (`@skipSaas`, `@skipPaas`) for routes that should work in the target environment
- [ ] Flaky specs identified and flagged (intermittent failures in CI)
- [ ] Guest and authenticated variants both covered for routes that differ by auth state (checkout, wishlist)
- [ ] Cart state setup is reliable (specs create cart state before testing cart-dependent routes)

### Route-to-block mapping validation

- [ ] Each route's required blocks exist in `blocks/` directory
- [ ] Each route's required drop-ins have initializers in `scripts/initializers/`
- [ ] Block-to-drop-in wiring verified for each route (delegate to `dropin-integrator` for deep verification)
- [ ] Page type detection (`detectPageType` in commerce.js) correctly identifies all route types
- [ ] Route-specific page metadata requirements documented in block READMEs (delegate to `authoring-contract-auditor`)

### Prerequisite-gated routes

Routes that require specific state to be testable:

- [ ] **Auth-gated routes** (account, auth-checkout, auth-wishlist): Auth initializer works, test fixtures include valid credentials
- [ ] **Cart-gated routes** (cart, checkout): Cart state setup reliable in Cypress (product add, quantity set)
- [ ] **Product-gated routes** (PDP, low-stock): Test fixtures include valid product URLs and SKUs
- [ ] **Config-gated routes** (all commerce): Config endpoints reachable from test environment
- [ ] **Multi-store routes** (store-switcher): Multiple stores configured in test environment
- [ ] Prerequisites documented in spec files or Cypress fixtures, not hardcoded

### Functional behavior validation

- [ ] Checkout specs complete the full journey (add to cart -> fill address -> select shipping -> payment -> place order)
- [ ] Account specs test profile management, not just page load
- [ ] Search specs test query input, results display, and filter/sort functionality
- [ ] Wishlist specs test add/remove/move-to-cart operations
- [ ] Cart specs test quantity change, item removal, and undo functionality

## Output format

Emit findings using the shared finding schema from `_contracts/finding-schema.md`. Additionally, produce a route coverage matrix:

```
## Route Coverage Matrix

| Route | Spec exists | Functional test | Auth variant | Status |
|-------|-------------|-----------------|--------------|--------|
| Home | yes/no | yes/no | N/A | covered/gap/partial |
| PLP | yes/no | yes/no | N/A | covered/gap/partial |
| Checkout | yes/no | yes/no | guest+auth | covered/gap/partial |
...
```

## Cross-skill awareness

| Action | Delegate to |
|--------|------------|
| Visual correctness on routes (layout, overflow, geometry) | `visual-geometry-auditor` |
| Drop-in wiring issues on routes (wrong endpoint, broken initializer) | `dropin-integrator` |
| Config issues that make routes unreachable | `commerce-config-doctor` |
| Block implementation issues found during route analysis | `storefront-block-author` |

**Owns**: Route reachability, functional behavior validation, Cypress functional spec coverage, route-to-block mapping, prerequisite-gated route detection, coverage gap identification.

**Boundary with `visual-geometry-auditor`**: This skill owns functional behavior ("does the route work?"). Visual correctness ("does it look right at each viewport?") belongs to `visual-geometry-auditor`. Cypress functional specs (e.g., `verifyGuestUserCheckout.spec.js`) = this skill's territory. Cypress visual specs (e.g., `headerDesktopScreenshot.spec.js`, `searchBarVisualCheck.spec.js`) = `visual-geometry-auditor` territory.

## Evidence patterns

- **Coverage gaps**: List the route, the expected spec name pattern, and the absence of any matching spec file.
- **Weak coverage**: Show the spec file and highlight that it only checks element presence (`cy.get().should('exist')`) without functional interaction.
- **Prerequisite issues**: Show the route's dependencies and which prerequisite is missing or unreliable in the test setup.
- **Skipped specs**: Show the skip tag and explain whether the skip is environment-appropriate or indicates a gap.

## Inspect

- `cypress/src/tests/e2eTests/` — all test spec files
- `cypress/src/fixtures/` — test data (products, addresses, credentials)
- `cypress/src/actions/` — reusable action helpers
- `cypress/src/assertions/` — reusable assertion helpers
- `cypress/src/fields/` — CSS selectors for page elements
- `cypress/src/support/` — custom commands and configuration
- `cypress/cypress.base.config.js`, `cypress.paas.config.js`, `cypress.saas.config.js` — environment configs
- `blocks/` — route-specific block implementations
- `scripts/initializers/` — drop-in initializers per route
- `scripts/commerce.js` — route detection, page type classification
- `AGENTS.md` — route expectations and risk-based testing

## Produce

- Route coverage matrix with per-route status
- Coverage gap findings (missing specs, weak specs, skipped specs)
- Route-to-block mapping with dependency verification
- Prerequisite-gated route analysis
- Delegation notes for issues outside route validation scope

## Avoid

- Acting like a full visual diff tool — visual geometry is `visual-geometry-auditor`'s domain
- Treating static lint issues as route validation — lint is `quality-gate-runner`'s domain
- Running Cypress tests directly — this skill analyzes coverage, it does not execute tests
- Conflating route reachability with visual correctness
