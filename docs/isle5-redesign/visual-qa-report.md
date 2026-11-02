# Isle5 redesign validation and evidence plan

This retains the original acceptance plan. For current implementation outcomes and limitations, see [implementation status](implementation-status.md). The planning task inspected code, model/package/configuration metadata and actual DA sources through the now-working MCP connection. No storefront build, DA-authored preview or Commerce journey was executed during this planning task.

## Current evidence

| Check | Actual outcome |
| --- | --- |
| Baseline | Branch `main`, commit `ae99f6f5`; existing `AGENTS.md` and `.gitignore` changes preserved |
| Applicable instructions | Root, local orchestrator, block, scripts, UE and Cypress rules read |
| Version compatibility | Installed versions matched the lockfile for the ten packages listed in the integration matrix |
| Local contracts | Theme handling, content blocks, PLP/PDP integration, routes, authoring fields and loading lifecycle inspected |
| DA MCP attempt | `resources/list` for configured `da_mcp` failed at MCP startup: OAuth refresh returned `invalid_request: client_secret is required for refresh_token grant` |
| Browser authentication recovery | On 30 October 2026 the user completed web sign-in and `codex mcp login da_mcp` returned exit code 0 and confirmed successful login. The immediate MCP retry failed during refresh; a later retry successfully listed site sources and read the homepage |
| DA source reads and inventory | Read-only access confirmed: root/products/customer/blog/placeholders listed; 17 representative sources/sheets read, including shared shell, home, PDP, collection, search, cart, checkout, account, editorial, support and metadata/redirects |
| MCP capability discovery | Source, version, media/fragment lookup, upload and preview schemas exposed; no state-changing tool invoked |
| Identity/permissions/preview isolation | Blocked; required IMS org ID, effective authorization and automatic-publication behavior unverified |
| Runtime edits and backend state | None; no accounts, orders, returns, content changes or deployments created |
| Standalone prototype | Earlier concept checks are design evidence only; they do not count as this repository's route or backend validation |

`git diff --check` is the planning handoff check. Application lint, generation and browser tests must be run for implementation changes; their absence here is not a test pass.

## Required implementation checks

### Code and authoring

From the repository root, run `npm run lint` and `git diff --check` for code changes. After source model changes run `npm run build:json` and `npm run check:ue`, inspect generated JSON and reject unrelated churn. Do not regenerate vendor packages without an authorized dependency change.

Read the real delivered plain HTML before altering decorators. Verify missing optional fields, extra rich-text wrappers, repeated decoration, useful fallback and failure states. Inspect exact DA edit/preview results rather than treating source-save success as preview success.

### Browser geometry and accessibility

For changed visual blocks, sweep 360, 375, 390, 414, 480, 768, 1024, 1280, 1440 and 1920px where applicable. Capture reference views at 375/390, 768 and 1440px after assets settle. More than 2px hard overflow or clipping is a defect.

Verify one logical H1, heading order, alt text, form labels, contrast on dark/light surfaces, keyboard navigation, visible focus, 44×44 primary targets, 200% zoom, long/translated text, missing media and reduced motion. Test menu/search/mini-cart/filter dialogs with Escape, focus containment where appropriate and return focus. Do not claim automated accessibility certification from screenshots.

### Commerce and state

Use real configured test products to cover simple/configurable products, missing options, unavailable variants, correct product links, search results, facets/sort/pagination, URL back/forward, add/update/remove/undo, guest/authenticated wishlist and shared header state. Test duplicate initialization/event behavior and catalog/core client separation after integration changes.

Use approved non-production accounts for authentication/address tests. Order placement, account creation and returns require separate explicit transactional test authority; a redesign plan does not grant it. Verify safe payment-error handling without collecting real card details.

Relevant existing specs include `verifyProductSearch.spec.js`, `verifyCartUndo.spec.js`, `verifyGuestUserWishlistFeature.spec.js`, `verifyAuthUserWishlistFeature.spec.js`, `verifyGuestUserCheckout.spec.js` and `verifyAuthUserCheckout.spec.js`, plus affected event specs. Select only the authorized subset; do not run stateful suites indiscriminately. In particular, current cart/mini-cart sources disable undo removal, so do not treat an undo-specific spec as applicable without an intentional configuration decision.

Run from `cypress/` with the explicitly confirmed backend config. The workspace provides `npm run cypress:run` for PaaS and `npm run cypress:saas:run` for SaaS. Record the actual config, browser, specs, counts and outcomes. Missing credentials, runner failures and backend outages are blockers, not passes.

### Loading and metadata

Measure the implemented hero's actual LCP candidate and preserve layout stability. The existing hero currently marks first-section imagery eager; review whether that heuristic matches each use before adding any eager assets. Keep below-fold media lazy and verify font loading with the existing lifecycle.

For affected routes, inspect HTTP status, initial content, canonical/robots metadata and intended sitemap behavior. Review current query/index files before changing editorial discovery. Preview-only drafts must not be published to obtain an index entry or manufactured review URL.

## Preview handoff record

For every template include: actual DA source path/version, code branch, backend mode, edit and preview URLs verified through the service, viewports/states tested, images reviewed, checks run, failures/blockers and any persistent test state. Keep sensitive information out of screenshots and reports.

DA MCP read access is now confirmed. Complete the remaining B0 identity, permission, source/fragment and preview checks, and reconcile proposed routes against actual sources before authoring. Nothing in this plan authorizes publication.

## Source findings to verify in browser during implementation

1. Upstream account/order URLs in navigation must resolve to intended isle5 routes after correction.
2. The current `customer/create` source and local create-account helper must have a deliberate canonical registration route.
3. `/blog` versus `/blog/index` needs route/content validation; the former source is empty and the inspected redirect sheet does not connect them.
4. The product template contains unrelated EDS benefits; approved replacement content must not obscure real product data or enrichment.
5. Product metadata includes external canonical/JSON-LD origins and localized rows; verify actual delivered metadata before any targeted correction.
6. Checkout must preserve noindex/no-store and supported payment state; preview copies must not be mistaken for real-route coverage.
