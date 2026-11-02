# Product Rail

## Overview

`product-rail` displays a bounded, catalogue-backed product strip using Product Discovery's public `SearchResults` container and `search()` API. Each instance has a unique public scope, separate from page search and header suggestions. It does not write cart/wishlist state or claim that catalogue ordering is newest-first.

Author below LCP-critical content. The existing search initializer supplies the configured catalogue endpoint and dictionaries. No endpoint, store, product name, image, price or stock data is authored into this block.

## Authored table and configuration

| Product Rail | |
| --- | --- |
| Title | Collection heading |
| URL Path | A real catalogue category path, or leave empty for the active catalogue |
| Page Size | 4 |
| Collection Link | An approved collection destination |
| Collection Label | An appropriate link label |

| Model field | Reader key | Required | Behavior |
| --- | --- | --- | --- |
| `title` | `title` | Yes | Semantic H2 and fallback heading |
| `urlpath` | `urlpath` | No | Real catalog `categoryPath` filter; not the CMS page path |
| `pageSize` | `pagesize` | No | Default 4; integer values 1–12; larger values capped at 12; invalid/nonpositive values use 4 |
| `collectionLink` | `collectionlink` | Yes | Safe relative or HTTP(S) destination retained when the service is unavailable |
| `collectionLabel` | `collectionlabel` | Yes | Accessible authored fallback link text |

Human-readable table labels (`Collection Link`, `Collection Label`, `URL Path`, `Page Size`) normalize to hyphenated keys and are supported alongside the model property names above. Readable labels take precedence when both are present. Both forms are retained for compatibility with the saved DA example and model-generated blocks; there is no planned removal.

There are no custom section-metadata or page-metadata requirements. `Theme: isle5` applies the shared visual tokens. Block configuration owns product selection/count; native section controls own container spacing/presentation. Precedence is not applicable.

## Rendering and actions

The block requests one bounded catalogue page and renders product links through `getProductLink()`. The container owns product images, prices, loading, empty and localized error UI. The public `ProductActions` slot supplies an accessible link to the product detail page; the arrow does not add a product without options.

All merchandising headings must describe the actual selection. This block does not provide a curated manual SKU list or verified newest-arrival sort. Use a real matching category or a supported recommendation placement for that intent.

## Failure and fallback

Missing title or labelled safe collection destination leaves authored content unchanged and warns without logging raw content. For render/API failure or a 12-second timeout, remove the renderer/subscriptions and product region, clear busy state, and retain the heading and collection link. Late renderer completion is disposed of rather than reattached. The SDK search call itself does not expose cancellation in this installed version; no automatic retry is issued.

Repeated decoration does not create additional searches or renderers. No custom global listeners, browser storage or shopper-state logging are added.

## Accessibility and responsive behavior

The heading is an H2; place it under the page H1. Busy state is exposed during loading. Product links use the real product name as their accessible label and have 44×44 targets. Grid widths are two columns on mobile, three on tablet and four at desktop where space allows. Never filter merchandise photography to misrepresent its colour.

## Troubleshooting

- Empty strip: confirm the real catalogue path, active store and availability of search data. Source existence is not service validation.
- Wrong products: `urlpath` is a catalogue path, not a proposed CMS route or label.
- Missing collection action: both a safe destination and readable label are required.
- Shared search changes: verify each render and search call uses the same unique instance scope; do not replace it with `search` or `popover`.
- Library/model unavailable: regenerate root models from `ue/models/blocks/product-rail.json` and verify the section-filter registration.

## Validation status

Installed Product Discovery 3.1.1 types and official public API/styling references were checked. Source-model checks and bounded-count/security tests run locally. A real DA-authored example, multiple-rail browser isolation and delivered-preview/backend acceptance remain blocked until the required DA authorization is resolved. Do not count model generation as remote library registration.
