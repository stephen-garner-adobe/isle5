# Commerce Login Block

## Overview

The Commerce Login block provides user authentication functionality using the @dropins/storefront-auth SignIn container. It handles user sign-in with forgot password integration and redirects authenticated users to their account page.

## DA.live integration and authoring structure

The block is authored as a plain placeholder and does not expose DA.live sidebar fields or section metadata.

| DA.live Model Options | Value | Effect |
| --- | --- | --- |
| N/A | N/A | Default: no sidebar model fields are defined for this block. |

Document authoring example:

| Commerce Login |
| --- |

Place the block on the customer login route template only.

## Section Metadata Reference

This block does not currently use block-specific section metadata.

| key/field | possible values | effect |
| --- | --- | --- |
| N/A | N/A | Default: no section metadata is read by this block. |

## Metadata Precedence

Not applicable. There are no author-facing metadata tiers for this block today.

## Page metadata and route requirements

- Intended route: customer login only.
- Recommended page metadata:
  - `Robots`: `noindex, nofollow`
  - `Cache Control`: private or no-store equivalent because auth state changes page behavior
- Keep page-level title and indexing behavior in the page `metadata` table, not in block content.

## Integration

<!-- ### Block Configuration

No block configuration is read via `readBlockConfig()`. -->

<!-- ### URL Parameters

No URL parameters directly affect this block's behavior. -->

<!-- ### Local Storage

No localStorage keys are used by this block. -->

<!-- ### Events

#### Event Listeners

No direct event listeners are implemented in this block.

#### Event Emitters

No events are emitted by this block. -->

## Behavior Patterns

### Page Context Detection

- **Authenticated Users**: When user is already authenticated, redirects to customer account page
- **Unauthenticated Users**: When user is not authenticated, renders sign-in form
- **Forgot Password**: Provides integration with forgot password functionality

### User Interaction Flows

1. **Authentication Check**: Block first verifies user authentication status
2. **Redirect Flow**: If already authenticated, redirects to account page
3. **Sign-In Process**: If not authenticated, renders sign-in form with forgot password link
4. **Success Redirect**: After successful sign-in, redirects to account page

### Error Handling

- **Authentication Errors**: If user is already authenticated, automatically redirects to account page
- **Sign-In Errors**: If sign-in fails, the SignIn container handles error display
- **Configuration Errors**: No configuration errors possible as block uses hardcoded values
- **Fallback Behavior**: Always falls back to sign-in form if not authenticated

## Accessibility notes

- The block relies on the Auth drop-in for semantic form fields, validation, and keyboard behavior.
- Route testing should confirm focus order and error announcement on failed sign-in attempts.

## Troubleshooting

- If users are redirected away immediately, confirm they are not already authenticated.
- If forgot-password navigation is incorrect, verify the route constants in `scripts/commerce.js`.
- If the login page is indexed, review page-level `Robots` metadata for the login template.
