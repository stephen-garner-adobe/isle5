# Isle5 page and block map

Map the 17 design-study views onto existing block families. Paths below are repository defaults or proposals unless confirmed in the discovery note below. B0 must reconcile each with source content before changing links or creating documents.

| Design view | Route status | Existing reusable surface | Planned treatment |
| --- | --- | --- | --- |
| Home | Confirmed `/index.html` source read; homepage route `/` | `hero`, `cards`, `columns`, `product-recommendations`, `header`, `footer` | Theme, static hero, semantic category tiles, editorial splits; product rail depends on B4 |
| Women | Proposed `/women`; real catalog path unknown | Same content patterns plus `product-list-page` where needed | Category-specific assets/copy; bind only a real catalog category |
| Men | Proposed `/men`; real catalog path unknown | Same | Shared template, distinct authored content |
| Equipment | Proposed `/equipment`; real catalog path unknown | Same | Equipment merchandising and actual category/product data |
| New arrivals listing | Proposed `/new-arrivals`; selection source unknown | `product-list-page` | Real category-backed collection where available; visible facets, sort and pagination |
| Product | Verified folder mapping `/products/` → `/products/default`; dynamic links supplied by `getProductLink()` | `product-details`, optional supported recommendations | Large gallery and purchase panel, exact product options and real state |
| Search | Read `/search.html`: listing plus recommendations; no category binding; noindex | `search-bar`, `product-list-page` without category binding | Shared search surface, useful empty/error states, URL-state preservation |
| Bag | Read `/cart.html`: `commerce-cart`, configured actions and agreement | `commerce-cart`, `commerce-mini-cart`, existing gift options where present | Style existing controls, totals, empty and update states |
| Checkout | Read `/checkout.html`: `commerce-checkout`, noindex/no-store; exact header special case remains | `commerce-checkout`, configured fragments/payment integration | Quiet layout; preserve supported forms, errors and payment surfaces |
| Confirmation | Confirm active checkout completion rendering and route; do not invent `/confirmation` | `commerce-checkout-success` and existing order blocks | Restyle genuine confirmation; use approved existing test data only |
| Account | Verified helpers include `/customer/login`, `/customer/account`, `/customer/orders`, `/customer/address` | `commerce-login`, account header/sidebar, customer details/information, addresses, orders | Complete account family including registration and recovery, not only overview |
| Saved items | Header's default destination is `/wishlist` | `commerce-wishlist`, public wishlist toggles | Guest/authenticated behavior from supported flows |
| Field notes index | Read `/blog/index.html`: `blog-tiles`; `/blog.html` is empty; no matching redirect in source sheet | `blog-tiles`, content cards | Label as Field notes without renaming paths; use authored draft cards if preview index lacks unpublished stories |
| Editorial article | Read `/blog/blogpost.html`: metadata plus `blog-post`; other example articles listed | `blog-post` | Centred editorial header, hero and readable body; respect metadata/index-dependent date behavior |
| Brand story | Proposed `/our-story` or retain existing DA destination | Default content, `columns`, `cards`; `blog-post` only if its semantics suit | Use approved narrative and evidence-backed claims |
| Support | Read `/support.html`: generic boilerplate support copy | `accordion`, default content, existing order-search/status blocks | Approved help copy and links; preserve guest order-status route |
| Not found | Confirm existing delivery/error mechanism before choosing a document path | Existing error/template handling and authored fallback | Useful return/search links; preserve actual HTTP status |

## Coverage beyond the prototype

The build must also cover the mini-cart, authentication dropdown, registration, password recovery, address forms, order detail/status, return flows, store switcher, legal pages and unavailable/error states already supported by the site. They share the design system but cannot be considered implemented just because the 17 concept screens exist.

Local route helpers also include `/order-status`, `/order-details`, `/return-details`, `/create-return` and corresponding customer routes. Use these helpers rather than translating prototype hashes into production URLs.

## Review content isolation

Proposed review root: `/drafts/isle5-redesign/`, subject to path availability and authorization. It is a planning namespace, not a created folder. Resolve every document and fragment target through DA MCP.

A draft checkout at `/drafts/isle5-redesign/checkout` will not match the header's current exact `/checkout` special case. Do not claim route-critical parity from that draft. Use an authorized isolated environment with the real route, or explicitly design and validate a supported preview arrangement before claiming end-to-end coverage.

Shared navigation/footer/mini-cart references should be read from actual metadata first. Their defaults are `/nav`, `/footer`, `/mini-cart`; those are discovery candidates, not automatic write targets. Review documents may reference approved isolated fragments to avoid changing the shared source.

## DA discovery on 30 October 2026

Read-only MCP access succeeded. The root listing includes `index.html`, `apparel.html`, `blog.html`, `blog/`, `cart.html`, `checkout.html`, `nav.html`, `footer.html`, `mini-cart.html`, `metadata.json`, `products/`, `customer/`, `placeholders/`, `search.html`, `support.html`, `wishlist.html`, order/return pages and other shared sources. Representative source reads now include home, nav, footer, PDP template, apparel, search, cart, checkout, both blog indexes, an article, support, mini-cart, account, registration, product metadata and redirects. No root entries named women, men, equipment or new-arrivals appeared in this listing; proposed collection paths still need merchandising and authoring decisions.

The products listing confirms `products/default.html`. The customer listing confirms login, account, address, orders, returns and recovery sources. It includes `customer/create.html` and `customer/createpassword.html`; compare these with the local create-account route helper before assuming registration routing is aligned. Listing proves source existence, not rendered route behavior or authorization to change it.

No source was written, previewed or published. IMS organization identity and effective mutation/preview permissions remain to be verified.

## Content corrections before visual completion

- Replace upstream demo destinations in the isolated review navigation with verified local account/order routes; category labels currently lack authored links. Preserve the existing logo asset.
- Replace the review homepage's demo ticker, generic subscription/promotional copy and layout with the planned campaign composition.
- Replace the successor PDP's EDS benefits with relevant approved supporting content. Preserve real catalogue information and enrichment behavior.
- Replace boilerplate support/footer content only with approved site and legal information.
- Keep `metadata.json` product and locale semantics intact; its 224 rows include external aemshop/upstream canonical data and cannot be fixed with a blind origin replacement.
