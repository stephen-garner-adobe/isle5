---
name: dropin-integrator
description: Use when wiring Adobe Commerce drop-ins in repositories like isle5, especially for initializer placement, endpoint selection, placeholders, scope isolation, route-aware rendering, and account/cart/checkout/PDP/PLP/search integrations.
---

# Drop-in Integrator

Use this skill when the work touches `@dropins/storefront-*` integrations.

Core workflow:
1. Inspect `scripts/initializers/`, `scripts/__dropins__/`, `scripts/commerce.js`, and the route-specific block.
2. Confirm the drop-in uses the correct endpoint:
   `CS_FETCH_GRAPHQL` for catalog/search-style domains and `CORE_FETCH_GRAPHQL` for auth/cart/account/checkout-style domains.
3. Verify `initializeDropin()` guards, placeholders loading, and `scope` isolation where multiple instances may exist.
4. Keep block code focused on composition and route behavior instead of rebuilding drop-in internals.
5. Validate the affected route assumptions against Cypress coverage when the route is critical.

Inspect:
- `scripts/initializers/`
- `scripts/__dropins__/`
- `scripts/commerce.js`
- route-specific block JS
- `AGENTS.md`

Produce:
- initializer corrections
- endpoint corrections
- placeholder/scope fixes
- route-aware integration notes

Avoid:
- inventing custom render layers where the drop-in pattern already exists
- changing unrelated content blocks

