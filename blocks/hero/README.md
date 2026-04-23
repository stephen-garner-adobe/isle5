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

- Rendering is driven by authored markup, block CSS, and a small `decorate(block)` enhancement.
- `hero.js` replaces the authored picture with an optimized responsive picture and marks the first-section image eager for LCP.

## Accessibility notes

- Provide meaningful image alt text unless the image is purely decorative.
- Keep hero heading text aligned with the page heading hierarchy.

## Troubleshooting

- If styling appears missing, verify the block is authored as the `hero` definition and the CSS is loading.
- If content structure is unexpected, confirm the authored row matches [hero.json](/Users/sgarner/Documents/Demo%20Environments/isle5/ue/models/blocks/hero.json) field selectors.
