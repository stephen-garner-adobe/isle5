# Commerce Checkout Block

## Overview

The Commerce Checkout block provides a comprehensive **one-page checkout** experience with dynamic form handling, payment processing, address management, and order placement. It integrates multiple dropin containers for authentication, cart management, payment services, and order processing with dynamic UI state management and validation.

## DA.live integration and authoring structure

The block is authored as a plain block placeholder and does not read author-controlled block rows or section metadata for runtime behavior.

| DA.live Model Options | Value | Effect |
| --- | --- | --- |
| N/A | N/A | Default: no sidebar model fields are defined for this block. |

Document authoring example:

| Commerce Checkout |
| --- |

Place the block on the checkout page template only.

## Section Metadata Reference

This block does not currently use block-specific section metadata.

| key/field | possible values | effect |
| --- | --- | --- |
| N/A | N/A | Default: no section metadata is read by this block. |

## Metadata Precedence

Not applicable. There are no author-facing metadata tiers for this block today.

## Page metadata and route requirements

- Intended route: checkout only.
- Recommended page metadata:
  - `Robots`: `noindex, nofollow`
  - `Cache Control`: private or no-store equivalent for authenticated and cart-derived checkout content
- Do not place this block on general content pages, marketing pages, or indexed route templates.
- Any page-level title, social, or indexing behavior should be configured in the page `metadata` table, not in the block.

## Integration

<!-- ### Block Configuration

No block configuration is read via `readBlockConfig()`. -->

### URL Parameters

No URL parameters are directly read, but the block uses `window.location.href` for meta tag management and page title updates.

<!-- ### Local Storage

No localStorage keys are used by this block. -->

### Events

#### Event Listeners

- `events.on('authenticated', callback)` - Handles user authentication state changes
- `events.on('cart/initialized', callback)` - Handles cart initialization with eager loading
- `events.on('checkout/initialized', callback)` - Handles checkout initialization with eager loading
- `events.on('checkout/updated', callback)` - Handles checkout data updates
- `events.on('checkout/values', callback)` - Handles checkout form value changes
- `events.on('order/placed', callback)` - Handles successful order placement

#### Event Emitters

- `events.emit('checkout/addresses/shipping', values)` - Emits shipping address form values with debouncing
- `events.emit('checkout/addresses/billing', values)` - Emits billing address form values with debouncing

## Behavior Patterns

### Page Context Detection

- **Checkout Flow**: Renders full checkout interface with shipping, billing, payment, and order summary
- **Empty Cart**: When cart is empty, redirects to the cart page
- **Server Errors**: When server errors occur, shows error state and hides checkout forms
- **Out of Stock**: When items are out of stock, shows out of stock message with cart update options
- **Order Confirmation**: After successful order placement, transitions to order confirmation view

### User Interaction Flows

1. **Initialization**: Block sets up meta tags, renders checkout layout, and initializes all containers
2. **Authentication**: Users can sign in/out via modal with form validation and success callbacks
3. **Address Management**: Users can enter shipping/billing addresses with real-time validation and cart updates
4. **Payment Processing**: Users can select payment methods and enter credit card information with validation
5. **Order Placement**: Users can place orders with comprehensive form validation and payment processing
6. **Error Handling**: Block shows appropriate error states and recovery options for various failure scenarios

### Error Handling

- **Form Validation Errors**: Individual form validation with scroll-to-error functionality
- **Payment Processing Errors**: Credit card validation and payment service error handling
- **Server Errors**: Server error display with retry functionality
- **Cart Errors**: Empty cart and out-of-stock item handling
- **Network Errors**: Graceful handling of network failures with user feedback
- **Fallback Behavior**: Always falls back to appropriate error states with recovery options

## Accessibility notes

- Checkout forms rely on drop-in components for semantic inputs, validation messaging, and keyboard interactions.
- Route-specific testing should verify focus movement, error messaging, and keyboard access after drop-in upgrades.

## Troubleshooting

- If the block redirects immediately, verify the cart is not empty and the route is the intended checkout route.
- If payment methods do not appear, verify checkout and payment-service initializers are loading correctly.
- If the page is indexed in search results, review page-level `Robots` metadata for the checkout template.
