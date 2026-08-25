# Commerce Integration and Drop-in Rules

These instructions apply to every file under `scripts/`. They extend the repository root rules.
Block wrappers are governed by `blocks/AGENTS.md`.

## Ownership Boundaries

| Path | Contract |
|---|---|
| `scripts/commerce.js` | Shared Commerce configuration, routing, page typing, placeholders, and helpers |
| `scripts/initializers/` | One initializer per drop-in; endpoints, dictionaries, and initialization |
| `scripts/scripts.js` | Global page orchestration and loading lifecycle |
| `scripts/delayed.js` | Delayed third-party integrations |
| `scripts/aem.js` | Protected AEM/EDS runtime; keep byte-aligned with the upstream file enforced by CI |
| `scripts/__dropins__/` | Generated vendor artifacts; never hand-edit |

Prefer changes in wrappers, slots, initializer options, and shared Commerce helpers. Do not modify
`scripts/aem.js` for project behavior: this repository's CI requires it to match the protected
upstream file exactly. An `aem.js` task must be an explicit upstream-sync operation whose result
passes that guard. Generated drop-ins or package lifecycle changes require explicit task scope and
documented justification.

## Generated Drop-ins

- `scripts/__dropins__/` is produced from installed `@dropins/*` packages.
- Never patch generated files to implement product behavior, styling, security fixes, or tests.
- Change the installed package version, public integration layer, or build process instead.
- Run `npm run install:dropins` after package changes.
- Review generated additions, deletions, and renamed chunks as vendor output, not as hand-authored
  architecture.
- Do not normalize or reformat generated output manually.
- If generated output changes without an intended package/build change, stop and determine why.

## Initializer Contract

Each drop-in initializer should:

1. Import the drop-in's documented initialization APIs.
2. Configure the correct endpoint before rendering can occur.
3. Load its dictionary or placeholders through the shared localization flow.
4. Use the repository's guarded initialization helper.
5. Initialize once per supported scope.
6. Avoid registering duplicate global events or analytics callbacks.

Initializer work should happen at module import time when the repository pattern requires Commerce
configuration before block decoration.

Preferred shape:

```js
import { initializers } from '@dropins/tools/initializer.js';
import { initialize, setEndpoint } from '@dropins/storefront-example/api.js';
import { initializeDropin } from './index.js';
import { CORE_FETCH_GRAPHQL, fetchPlaceholders } from '../commerce.js';

await initializeDropin(async () => {
  setEndpoint(CORE_FETCH_GRAPHQL);
  const labels = await fetchPlaceholders('placeholders/example.json');

  return initializers.mountImmediately(initialize, {
    langDefinitions: { default: { ...labels } },
  });
})();
```

Verify the actual installed API and initializer options. Do not copy an example across drop-ins
without checking its endpoint, dictionary, scope, and version-specific types.

## GraphQL and Service Selection

- Use `CS_FETCH_GRAPHQL` for catalog, search, product discovery, recommendations, and other
  catalog-service reads when supported by the integration.
- Use `CORE_FETCH_GRAPHQL` for cart, authentication, checkout, account, order, wishlist, and other
  shopper-state flows.
- Do not create a new GraphQL client when an existing configured client matches the use case.
- Do not set endpoints inside individual block decorators.
- Keep environment, store, locale, headers, and authentication behavior in shared configuration.
- Do not put private credentials in browser-delivered configuration.
- Treat PaaS, Adobe Commerce as a Cloud Service, and Adobe Commerce Optimizer endpoint differences
  explicitly.
- If a required operation is missing from a public drop-in API, first check the installed package,
  current official docs, and `build.mjs` before adding raw GraphQL.
- Document custom queries, cache behavior, errors, and compatibility assumptions.

## Public Drop-in APIs

- Use documented package entry points only.
- Public integration surfaces include renderers, containers, functions, slots, events,
  dictionaries, and supported SDK utilities.
- Never import `chunks/`, private source paths, or undocumented internals.
- Prefer a supported slot over querying or rewriting rendered drop-in DOM.
- Do not depend on generated class names except where the drop-in's styling contract documents them.
- Confirm deprecated APIs and containers against the installed version before introducing new use.
- When multiple instances share a page, use public scoping support consistently across API and
  render calls.
- Keep conditional or interaction-triggered integrations dynamically imported where practical.

## Shared Commerce Helpers

Reuse existing helpers before adding variants, including:

- `getProductLink()` for product routes;
- `fetchPlaceholders()` for labels;
- configured route/path constants;
- page-type and metadata readers;
- configured GraphQL clients;
- existing loading and placeholder patterns.

Do not concatenate product URLs, store codes, locale segments, or query strings by hand when a
shared helper exists. Preserve lowercase SKU and encoding behavior implemented by the route helper.

New shared helpers must:

- have one clear owner and purpose;
- accept explicit inputs rather than reading unrelated global state;
- avoid leaking shopper data;
- degrade safely when configuration is incomplete;
- be covered through affected route tests.

## Events and Coordination

The drop-in event bus and analytics are separate contracts.

### In-page event bus

- Use `@dropins/tools/event-bus.js` for documented coordination between drop-ins in the same page
  and JavaScript context.
- Do not assume events survive full navigation, another tab, or a cross-origin frame.
- Use documented event names and payload shapes.
- Prevent duplicate listeners during initialization, block re-decoration, or soft navigation.
- Clean up subscriptions when the public API or owning lifecycle provides a teardown mechanism.
- Avoid using the event bus as an application-wide persistent store.

### Analytics and ACDL

- Emit analytics through the repository's established collector and Adobe Client Data Layer flow.
- Do not treat an event-bus message as proof that an analytics event was sent.
- Avoid duplicate impressions, add-to-cart events, or checkout events during re-rendering.
- Validate event order and required payloads for affected journeys.
- Do not include PII, auth data, payment details, private IDs, or raw GraphQL objects.
- Honor consent and delayed-loading requirements.
- Third-party analytics and tag-manager work belongs in the configured delayed lifecycle unless the
  official integration requires otherwise.

## Multistore and Localization

Changes to routing, initialization, placeholders, or shopper state must consider:

- store and website codes;
- locale and translated routes;
- currency and price display;
- catalog versus core endpoint selection;
- cart and wishlist isolation;
- authentication cookie scope;
- localized product links;
- dictionary and placeholder fallback.

Do not infer a store solely from a pathname when configured storefront data is available. When
switching stores or websites, preserve only shopper state that the backend and drop-ins explicitly
support.

All shopper-visible labels should use the existing placeholder or drop-in dictionary mechanism.
Do not add inline English strings to shared Commerce flows when a dictionary key is appropriate.

## Loading Lifecycle

- Inspect the current `scripts/scripts.js` implementation before changing eager, lazy, or delayed
  work.
- Keep critical page setup minimal and deterministic.
- Avoid importing all drop-ins into global eager code.
- Load interaction-triggered features on demand.
- Keep third-party work in the delayed lifecycle.
- Do not reduce configured delay or move third-party code earlier without measured evidence and a
  documented reason.
- Avoid duplicate initialization across eager/lazy phases, fragments, and re-decoration.

## Error Handling and Resilience

- Missing or invalid storefront configuration must produce an actionable, non-sensitive error.
- Differentiate content-delivery failures, configuration failures, Commerce service failures, and
  shopper authorization failures.
- Do not expose raw backend messages or stack traces to shoppers.
- Preserve backend error codes for diagnostics only when they contain no sensitive data.
- Use bounded retries only for documented transient operations.
- Do not retry mutations automatically when duplicate carts, orders, payments, or events could
  result.
- Keep fallback navigation and authored content usable when an optional integration fails.

## Security and Privacy

In addition to the root requirements:

- Never log GraphQL authorization headers, customer tokens, cart IDs, payment payloads, or full
  customer records.
- Never embed admin, integration, or service credentials in browser code.
- Validate configuration URLs and origins before use.
- Do not weaken cookie security or cross-site protections without an explicit authentication design
  review.
- Use documented CAPTCHA and authentication integration points.
- Treat analytics consent, authenticated state, and seller-assisted shopping as sensitive flows.
- Redact secrets and PII from test hooks and debug utilities before committing.

## Package and Upgrade Workflow

Adobe Commerce package updates are the primary maintenance path. Upstream boilerplate integration is
selective and separate.

For drop-in or Commerce package changes:

1. Read current official release notes and installed package types.
2. Record current versions and intended target versions.
3. Update the narrowest package set.
4. Run `npm ci` with normal lifecycle scripts.
5. Confirm `npm run install:dropins` succeeds.
6. Review generated vendor changes.
7. Run `npm outdated` and `npm audit --omit=dev`.
8. Test affected block APIs, initializers, events, routes, and error states.
9. For a major version, test all custom options, slots, styles, listeners, auth cookies, and stateful
   Commerce journeys.
10. Document deferred advisories and compatibility decisions.

Do not run `npm audit fix --force` or introduce broad overrides without package-owner analysis.
Every security override must include its reason, affected chain, validation, and removal condition.

## Validation

Minimum for script or initializer changes:

```bash
npm run lint
```

Also run:

- `npm run install:dropins` when package or build inputs change;
- relevant route tests from `cypress/`;
- analytics event tests when instrumentation changes;
- multistore tests when routing or store initialization changes;
- `git diff --check`.

Before handoff, state which backend/config was used, which shopper states were exercised, and which
generated files changed.
