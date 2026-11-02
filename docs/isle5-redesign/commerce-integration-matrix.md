# Isle5 Commerce integration matrix

The redesign must preserve existing service-backed behavior. Installed and locked packages below were inspected locally; their presence does not establish backend availability or successful shopper journeys. All runtime capabilities remain **Blocked** for delivered-page verification until delivered-page inspection and safe backend test access are available. DA source inspection is now available and has been completed for representative page families.

## Installed baseline

| Package | Installed and locked version | Existing owned integration | Design work and required evidence |
| --- | --- | --- | --- |
| `@dropins/tools` | 2.0.1 | `styles/styles.css`, shared helpers and public UI components | Semantic theme/token mapping; inspect every control state and overlay |
| `storefront-product-discovery` | 3.1.1 | `product-list-page`, `search-bar`, header search; `scripts/initializers/search.js` | Cards, facets, sort, pagination, suggestions and no-results; preserve scoped searches and URL state |
| `storefront-pdp` | 3.3.1 | `product-details`; `scripts/initializers/pdp.js` | Real product header, price, gallery, options and quantity; test configurable/unavailable variants |
| `storefront-cart` | 3.3.1 | `commerce-cart`, `commerce-mini-cart`, product actions | Add/update/remove/undo, totals, shared count, loading and error states |
| `storefront-checkout` | 3.3.1 | `commerce-checkout` and its current fragments/containers | Supported delivery/payment/review flow; do not reproduce prototype's fake checkout |
| `storefront-account` | 4.1.0 | Account/customer/address wrappers | Restyle overview, address and customer forms without altering identity/state handling |
| `storefront-auth` | 4.0.1 | Login, create/confirm account, password recovery wrappers | Preserve actual registration, recovery, errors and authenticated header behavior |
| `storefront-order` | 4.0.1 | Order status/details/list/returns and checkout-success wrappers | Restyle existing order summaries; confirm completion rendering before choosing a route |
| `storefront-wishlist` | 3.4.0 | `commerce-wishlist`; PDP/listing toggles; `scripts/initializers/wishlist.js` | Verify guest/authenticated behavior, login transitions and store isolation |
| `storefront-recommendations` | 4.0.4 | `product-recommendations`; recommendations initializer | Real placement availability and context, correct label/ordering, service fallback |

Package names without prefixes in this table are under `@dropins/`. Payment services and personalization are also declared; their enabled backend capabilities and relevance must be established during B0. No package or lifecycle changes are planned.

## Concrete code findings

- `product-list-page` already renders public `SearchResults`, `Facets`, `SortBy` and `Pagination`. Its `ProductImage` and `ProductActions` slots are existing extension points. Its URL helper owns search phrase, page, sort and filters; preserve this behavior.
- Complex products currently route to PDP for option selection. Simple products add through the cart API. The design's quick-add modal is an enhancement decision, not existing functionality. Keep PDP routing for complex products in the first build unless a separate accessible option-selector integration is proven.
- `product-details` already composes granular product header, price, options, quantity, description, attributes and gallery containers. Rework its wrapper/CSS and documented public token/slot surfaces rather than rebuilding the product state model.
- The header already coordinates authentication, search, wishlist and mini-cart state. Restyling its controls must preserve supported initialization and event flow.
- A homepage product strip cannot be faked with authored prices or static cards. Resolve real recommendation merchandising or a scoped public catalog integration. Verify multiple rails do not overwrite each other's results, header suggestions or a page's search state.

## Configuration and loading boundaries

`config.json` is present with `public.default`. Local configuration declares distinct `commerce-core-endpoint` and `commerce-endpoint` values. `scripts/commerce.js` sets `CORE_FETCH_GRAPHQL` from the core endpoint and configures `CS_FETCH_GRAPHQL` separately with catalog headers. Keep these clients and existing store/header resolution. Do not replace them with the prototype's local product array or a new client.

The host and endpoint shape suggest a PaaS-style deployment, but no backend type or live response was verified. Do not select the PaaS or SaaS test suite solely from that inference. Confirm the intended environment and its allowed accounts/products first.

Local eager loading initializes Commerce and loads the first section. Lazy loading then loads header, remaining sections, footer, lazy CSS and fonts. Delayed code starts after 3000ms. Keep this order unless measured evidence justifies a narrow change. Do not import every Commerce feature globally, alter delayed analytics, move marketing scripts into the head, or change the protected runtime.

## Feature dependencies

| Capability | Required decision or evidence | Current runtime status |
| --- | --- | --- |
| New arrivals / coordinated kit rails | Real merchandising source and order; public scoped implementation; actual product types | Blocked |
| Category collections | DA page path plus distinct real catalog category path and active store | Blocked |
| Product gallery/options | Approved variant imagery, configured options, stock, correct SKU resolution | Blocked |
| Bag and wishlist | Safe backend/session access; guest/auth transitions and store state | Blocked |
| Checkout/payment | Designated test environment, supported payment integration and separately authorized transactional tests | Blocked |
| Account/orders/returns | Least-privilege test identity and supported backend features | Blocked |
| Editorial index | Actual DA source/index contents and unpublished-preview behavior | Blocked |
| B2B | Not requested; no B2B packages or backend readiness established for this build | Not applicable |

Do not label these features broken merely because verification is blocked. Use official public APIs and local package compatibility as the implementation contract. Adobe's [styling reference](https://experienceleague.adobe.com/en/tools/commerce-storefront/dropins/all/styling/) supports global token overrides, block-specific CSS and deferred styles; it does not authorize reliance on private generated markup.

## DA source alignment findings

`apparel.html` binds the existing `apparel` category, while the proposed outdoor category routes are not present in the root inventory. `products/default.html` contains a demo default SKU, unrelated EDS feature cards, enrichment and one recommendation placement. `metadata.json` contains 224 product rows for the Adobe demo catalogue, including six `/fr/` rows; this is source metadata, not proof of current live stock or price.

The source cart and mini-cart explicitly disable undo removal. Checkout source retains noindex/no-store. Account source composes the existing sidebar/header, orders, addresses, customer information and returns blocks. Preserve these contracts while restyling; do not infer additional shopper capabilities from the mockup.
