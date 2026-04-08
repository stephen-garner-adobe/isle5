# Commerce Checkout Success Block

## Overview

The Commerce Checkout Success block renders the post-purchase order confirmation experience. It initializes the Storefront Order drop-in, displays order details (status, shipping, customer information, costs, products), includes gift options in a read-only view, and provides a continue shopping action with a contact support link.

## DA.live integration and authoring structure

The block is authored as a plain placeholder and does not expose block rows or section metadata for runtime behavior.

| DA.live Model Options | Value | Effect |
| --- | --- | --- |
| N/A | N/A | Default: no sidebar model fields are defined for this block. |

Document authoring example:

| Commerce Checkout Success |
| --- |

Place the block on the order confirmation route template only.

## Section Metadata Reference

This block does not currently use block-specific section metadata.

| key/field | possible values | effect |
| --- | --- | --- |
| N/A | N/A | Default: no section metadata is read by this block. |

## Metadata Precedence

Not applicable. There are no author-facing metadata tiers for this block today.

## Page metadata and route requirements

- Intended route: order confirmation only.
- Recommended page metadata:
  - `Robots`: `noindex, nofollow`
  - `Cache Control`: private or no-store equivalent because content is order-specific
- Keep page-level indexing, caching, and title behavior in the page `metadata` table rather than block markup.

## Integration

### Block Configuration

No block configuration is read from the DOM.

### URL Parameters

No URL parameters are read by this block.

### Local Storage

No localStorage keys are used by this block.

### Dependencies

- `@dropins/storefront-order` (Order containers and initializer)
- `@dropins/storefront-cart` (Gift options container for order items)
- `@dropins/storefront-auth` (Sign Up modal)
- `@dropins/tools` (UI Button, provider, initializers)
- Local helpers: `scripts/commerce.js`, `scripts/aem.js`, `blocks/modal/modal.js`

## Public API

- `default export decorate(block)` — Renders the success view into the provided block element.
- `export async function renderCheckoutSuccess(container, { orderData } = {})` — Renders the success view into `container`. Pass `orderData` to provide pre-fetched order data; otherwise the Order drop-in will fetch it when possible (not possible when placing an order as a guest using an email address that’s already associated with an existing account).
- `export function preloadCheckoutSuccess()` — Preloads the checkout success CSS. Call this before `renderCheckoutSuccess`.

Example (programmatic):

```js
import { preloadCheckoutSuccess, renderCheckoutSuccess } from './blocks/commerce-checkout-success/commerce-checkout-success.js';

// Load CSS
preloadCheckoutSuccess();

// Pass pre-fetched order data
await renderCheckoutSuccess(container, { orderData });
```

## Behavior

- Scrolls to top on load for proper confirmation visibility.
- Loads `commerce-checkout-success.css` styles.
- Fetches localized placeholders and mounts the Order drop-in initializer with `langDefinitions` and optional `orderData`.
- Renders order confirmation sections (header, status, shipping status, customer details, cost summary, product list, gift options).
- Footer includes a "Continue shopping" button and a "Contact us" support link (from `SUPPORT_PATH`).
- Product list integrates read-only Gift Options per item; product and swatch images attempt to use AEM Assets via SKU/label aliasing.

## DOM Structure

This block builds a scoped fragment that follows this structure:

```html
<div class="order-confirmation">
  <div class="order-confirmation__main">
    <div class="order-confirmation__header"></div>
    <div class="order-confirmation__order-status"></div>
    <div class="order-confirmation__shipping-status"></div>
    <div class="order-confirmation__customer-details"></div>
  </div>
  <div class="order-confirmation__aside">
    <div class="order-confirmation__order-cost-summary"></div>
    <div class="order-confirmation__gift-options"></div>
    <div class="order-confirmation__order-product-list"></div>
    <div class="order-confirmation__footer"></div>
  </div>
</div>
```

## Rendered Containers

- `OrderHeader` — Displays order header with optional Sign Up action for guests.
- `OrderStatus` — Shows overall order status.
- `ShippingStatus` — Displays shipping status for physical items.
- `CustomerDetails` — Shows purchaser details.
- `OrderCostSummary` — Displays totals, taxes, discounts.
- `OrderProductList` — Lists items in the order; integrates Gift Options (read-only) in item footer.
- `GiftOptions` — Separate read-only gift options summary.
- Footer — "Continue shopping" button and support link.

## Slots and Customization

- Product list uses a `Footer` slot to render read-only `GiftOptions` per item.
- `CartSummaryItemImage` slot attempts to render images from AEM Assets using SKU as alias.
- Swatch images attempt AEM Assets by label alias with default sizing.
- Header Sign Up action opens a modal that renders the Auth `SignUp` container and uses privacy policy consent slots from `scripts/commerce.js`.

## Styling

- Styles are defined in `commerce-checkout-success.css`.
- Class naming follows the `order-confirmation__*` pattern for main, aside, and sectional blocks.
- The footer button uses the shared UI `Button` component and standard size/variant props.

## Error Handling

- Relies on Storefront Order and Cart containers for data fetching states and error UI.
- Support link is always rendered to route customers to assistance when needed.

## Usage

Add the block to your confirmation page template:

```html
<div class="block commerce-checkout-success"></div>
```

When used via the decorator system, the block will automatically render the confirmation experience into the block container. For programmatic usage, use the `renderCheckoutSuccess` export and pass `orderData`.

## Authentication Flow

The block listens for authentication state changes via `events.on('authenticated', callback)`. When a guest user successfully signs up through the modal, the page automatically reloads to reflect the authenticated state across all components.

## File Structure

- `commerce-checkout-success.js` — Entry point and block decorator; builds fragment, mounts Order drop-in, renders containers, and footer actions.
- `commerce-checkout-success.css` — Styles for the confirmation layout.

## Notes

- This block is read-only from a checkout perspective; cart and payment edits occur in the checkout flow. The success page focuses on confirmation, details, and post-purchase actions.

## Accessibility notes

- The block depends on Order, Cart, and Auth drop-ins for semantic UI and keyboard behavior.
- Route testing should verify focus order after order placement and after guest sign-up flows.

## Troubleshooting

- If the block renders without order details, verify the order route and available `orderData` context.
- If guest sign-up does not refresh the page, review the authenticated event flow.
- If the confirmation page is indexed, review page-level `Robots` metadata for the route template.
