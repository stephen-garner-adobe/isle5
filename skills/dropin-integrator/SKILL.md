---
name: dropin-integrator
description: Use when wiring Adobe Commerce drop-ins in repositories like isle5, especially for initializer placement, endpoint selection, placeholders, scope isolation, route-aware rendering, event bus lifecycle, cross-drop-in dependencies, and account/cart/checkout/PDP/PLP/search/wishlist/recommendations integrations.
---

# Drop-in Integrator

## When to use

- Adding or updating a commerce drop-in integration
- Fixing initializer, endpoint, or placeholder issues
- Wiring account, cart, checkout, PDP, PLP, search, recommendations, wishlist, order, or payment-services flows
- Debugging event bus subscription leaks or stale state
- Verifying cross-drop-in dependency order (auth before cart before checkout)
- Scope isolation when multiple drop-in instances exist on one page

## Discovery questions

1. **Which drop-in?** Which `@dropins/storefront-*` package is being integrated? (auth, cart, checkout, account, PDP, PLP/product-discovery, search, recommendations, wishlist, order, payment-services, personalization)
2. **New or fix?** Is this a new integration or a fix to an existing one?
3. **Which route?** What route does this drop-in serve? (home, PLP, PDP, cart, checkout, account, search, wishlist, order-history, order-confirmation)
4. **Multiple instances?** Could multiple instances of this drop-in appear on one page? (Determines scope isolation requirement.)
5. **Auth dependency?** Does this drop-in require authenticated state? (Affects initializer order and guest/auth flow handling.)

## Core workflow

1. Inspect `scripts/initializers/`, `scripts/__dropins__/`, `scripts/commerce.js`, and the route-specific block.
2. Confirm the drop-in uses the correct endpoint per the endpoint matrix below.
3. Verify the initializer follows the standard lifecycle pattern from AGENTS.md.
4. Check event bus subscriptions for proper cleanup and no stacking.
5. Verify cross-drop-in dependencies are respected in initializer order.
6. Validate render pattern and scope isolation where needed.
7. Validate the affected route assumptions against Cypress coverage when the route is critical.

## Checklists

### Endpoint matrix (AGENTS.md: Initializer lifecycle)

The endpoint choice is non-negotiable. Using the wrong endpoint silently breaks data flow.

| Drop-in | Endpoint | Rationale |
|---------|----------|-----------|
| `storefront-pdp` | `CS_FETCH_GRAPHQL` | Catalog service for product data |
| `storefront-product-discovery` (PLP/search) | `CS_FETCH_GRAPHQL` | Catalog service for product listings |
| `storefront-recommendations` | `CS_FETCH_GRAPHQL` | Catalog service for recommendation data |
| `storefront-personalization` | `CS_FETCH_GRAPHQL` | Catalog service for personalized content |
| `storefront-auth` | `CORE_FETCH_GRAPHQL` | Core for authentication operations |
| `storefront-cart` | `CORE_FETCH_GRAPHQL` | Core for cart mutations |
| `storefront-checkout` | `CORE_FETCH_GRAPHQL` | Core for checkout operations |
| `storefront-account` | `CORE_FETCH_GRAPHQL` | Core for account management |
| `storefront-order` | `CORE_FETCH_GRAPHQL` | Core for order queries |
| `storefront-wishlist` | `CORE_FETCH_GRAPHQL` | Core for wishlist mutations |
| `storefront-payment-services` | `CORE_FETCH_GRAPHQL` | Core for payment processing |

- [ ] Drop-in uses the correct endpoint from the matrix above
- [ ] Endpoint set via `setEndpoint()` before `initialize()` is called
- [ ] If ACO (Adobe Commerce Optimizer) is configured, `AC-Price-Book-ID` header set conditionally

### Initializer lifecycle (AGENTS.md: Drop-in Component Integration)

Standard pattern every initializer must follow:

```js
import { initializers } from '@dropins/tools/initializer.js';
import { initialize, setEndpoint } from '@dropins/storefront-<dropin>/api.js';
import { initializeDropin } from './index.js';
import { CS_FETCH_GRAPHQL, fetchPlaceholders } from '../commerce.js';

await initializeDropin(async () => {
  setEndpoint(CS_FETCH_GRAPHQL);
  const labels = await fetchPlaceholders('placeholders/<dropin>.json');
  return initializers.mountImmediately(initialize, {
    langDefinitions: { default: { ...labels } },
  });
})();
```

- [ ] `initializeDropin()` wrapper used with guard against re-initialization
- [ ] `setEndpoint()` called before `initialize()`
- [ ] `fetchPlaceholders()` loads path-specific JSON for i18n labels
- [ ] `initializers.mountImmediately` used for mount pattern
- [ ] `prerenderingchange` handler registered with `{ once: true }` to avoid stacking
- [ ] Initializer does not run during prerendering (guard present)
- [ ] No side effects at import time that would fire during eager phase

### Render pattern (AGENTS.md: Render pattern)

- [ ] Curried render: `render.render(Component, props)(containerElement)`
- [ ] Container element exists in DOM before render call
- [ ] Slots built with `createElement` / `textContent`, not `innerHTML`
- [ ] `h()` from `@dropins/tools/preact.js` limited to composing primitive props (icons, nested components) — not building entire block UIs
- [ ] Unique `scope` string passed to both API call and rendered container when multiple instances may exist on one page

### Event bus lifecycle (waypoint-assess domains 13, 15)

- [ ] Every `events.on()` call has a corresponding `events.off()` or is guarded to prevent stacking on re-decoration
- [ ] `events.lastPayload()` used for initial state when subscribing to events that may have already fired
- [ ] `{ eager: true }` option used on subscriptions that need to fire immediately with last payload
- [ ] No subscription leaks — block teardown cleans up all event listeners
- [ ] `AbortController` or equivalent cleanup for `document`/`window` event listeners
- [ ] `events.enableLogger(true)` gated behind dev/debug flag, not active in production

### Cross-drop-in dependencies

Initializer order in `scripts/initializers/index.js` must respect these dependency chains:

```
auth -> cart -> checkout
auth -> account
auth -> wishlist
cart -> mini-cart (header)
```

- [ ] Auth initializer runs before cart, account, and wishlist initializers
- [ ] Cart initializer runs before checkout initializer
- [ ] Header lazy-loads mini-cart and search fragments on first interaction, not eagerly
- [ ] Cart state transitions handled: empty cart -> redirect, guest-to-auth cart merge, stale cart cleanup on website switch
- [ ] `DROPINS_CART_ID` session storage managed correctly across website switches
- [ ] Mini-cart exclusion list (`excludeMiniCartFromPaths`) stays current as routes are added/renamed

### Import strategy (AGENTS.md: Drop-in Component Integration)

- [ ] Dynamic imports (`await import(...)`) for conditionally-loaded drop-ins (search, mini-PDP, checkout fragments)
- [ ] Static imports when block always needs the drop-in and loads in lazy phase
- [ ] No static import side effects causing eager-phase bloat (e.g., `import '../../scripts/initializers/cart.js'` in a lazy block is acceptable, but not in an eager block)
- [ ] Drop-in API, render, and container modules preloaded where LCP optimization applies (e.g., PDP preloads pdp API/render/containers)

## Output format

Emit findings using the shared finding schema from `_contracts/finding-schema.md`. For endpoint issues, always include the actual endpoint used and the expected endpoint from the matrix.

## Cross-skill awareness

| Action | Delegate to |
|--------|------------|
| Config/environment issues (wrong endpoint in config.json) | `commerce-config-doctor` |
| Route coverage verification for affected routes | `route-smoke-auditor` |
| Block implementation fixes (JS/CSS within the block itself) | `storefront-block-author` |
| Build pipeline issues (stale drop-in sync) | `quality-gate-runner` |

**Owns**: Initializer wiring, endpoint selection, render composition, event bus lifecycle, scope isolation, cross-drop-in dependencies, import strategy.

## Evidence patterns

- **Endpoint errors**: Show the `setEndpoint()` call with the actual value and compare to the matrix.
- **Initializer issues**: Show the initializer file and highlight missing guards, wrong lifecycle order, or missing placeholder loading.
- **Event bus leaks**: Show `events.on()` at line X with no corresponding `events.off()` in any teardown path.
- **Dependency violations**: Show the initializer import order in `index.js` and highlight where the chain is broken.
- **Render issues**: Show the render call and highlight missing scope, wrong container, or innerHTML in slots.

## Inspect

- `scripts/initializers/` — all initializer files
- `scripts/initializers/index.js` — main orchestrator with dependency order
- `scripts/__dropins__/` — synced drop-in packages
- `scripts/commerce.js` — `CS_FETCH_GRAPHQL`, `CORE_FETCH_GRAPHQL`, auth headers, cart state
- Route-specific block JS (e.g., `blocks/commerce-checkout/commerce-checkout.js`)
- `AGENTS.md` — drop-in integration rules

## Produce

- Endpoint corrections with matrix evidence
- Initializer lifecycle fixes
- Event bus subscription cleanup recommendations
- Cross-drop-in dependency order corrections
- Scope isolation fixes for multi-instance blocks
- Delegation notes for config or route coverage issues

## Avoid

- Inventing custom render layers where the drop-in pattern already exists
- Changing unrelated content blocks
- Rebuilding drop-in internals — blocks should compose drop-in containers, not replace them
- Modifying `scripts/__dropins__/` directly — those are synced from `node_modules`
