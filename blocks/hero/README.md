# Hero

## Overview

The `hero` block is a simple image-and-heading hero definition with no custom JavaScript behavior.

## DA.live integration and authoring structure

The block is authored with a single row containing an image, alt text, and heading text.

| DA.live Model Options | Value | Effect |
| --- | --- | --- |
| `image` | reference | Required. Hero image source. |
| `alt` | text | Optional alt text for the hero image. |
| `text` | text | Required. Hero heading text. |

Document authoring example:

| Hero |
| --- |
| image + heading content |

## Section Metadata Reference

This block does not currently use block-specific section metadata.

| key/field | possible values | effect |
| --- | --- | --- |
| N/A | N/A | Default: no section metadata is read by this block. |

## Metadata Precedence

Not applicable. The block has no metadata contract today.

## Behavior patterns

- Rendering is driven entirely by authored markup and block CSS.
- No custom `decorate(block)` behavior is currently applied in `hero.js`.

## Accessibility notes

- Provide meaningful image alt text unless the image is purely decorative.
- Keep hero heading text aligned with the page heading hierarchy.

## Troubleshooting

- If styling appears missing, verify the block is authored as the `hero` definition and the CSS is loading.
- If content structure is unexpected, confirm the authored row matches the `_hero.json` field selectors.
