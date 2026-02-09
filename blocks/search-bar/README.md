# Search Bar Block

## Overview

The `search-bar` block is a standalone storefront search input with inline product results, powered by the product discovery drop-in APIs.

It supports:
- DA.live row-based authoring for placeholder, alignment, and result count.
- Section Metadata visual presets via `data-style`.
- Inline result panel + redirect submit flow to `/search?q=...`.
- Accessibility-friendly focus handling, escape close, and live region announcements.

## DA.live Integration

Create a 3-row, 1-column `search-bar` block.

| Row | Purpose | Required | Default | Notes |
|---|---|---|---|---|
| 1 | Placeholder text | No | `Search products...` | Example: `Search products` |
| 2 | Alignment | No | `center` | `left`, `center`, `right` |
| 3 | Results count | No | `8` | Number between `2` and `20` |

### Example

| search-bar |
|---|
| Search products |
| center |
| 10 |

## Configuration Options

| Key | Default | Possible Values | Effect |
|---|---|---|---|
| Author row 1 (placeholder) | `Search products...` | Any text | Sets input placeholder copy. |
| Author row 2 (alignment) | `center` | `left`, `center`, `right` | Aligns the search bar container inside the section. |
| Author row 3 (results count) | `8` | `2` to `20` | Controls number of inline product results requested/rendered. |

## Section Metadata Reference

Place **Section Metadata immediately above** the `search-bar` block.

| Key | Default | Possible Values | Effect |
|---|---|---|---|
| `data-style` | `default` | `default`, `minimal`, `elevated`, `glass`, `outline`, `soft`, `clean`, `contrast`, `premium-light`, `utility`, `editorial`, `campaign` | Applies a full visual preset (surface, border, icon treatment, shadow, and result panel styling). No search behavior changes. |

### Preset Notes

- `default`: balanced baseline storefront style.
- `minimal`: reduced chrome, low-noise utility look.
- `elevated`: stronger depth and prominence for hero-like placement.
- `glass`: translucent/frosted panel style.
- `outline`: high-structure, crisp border treatment.
- `soft`: warm, lower-contrast editorial presentation.
- `clean`: restrained, lightweight utility presentation.
- `contrast`: high-clarity black/white emphasis.
- `premium-light`: refined luminous premium look.
- `utility`: functional, system-like UI treatment.
- `editorial`: content-led merchandising look.
- `campaign`: brand-accented promotional treatment.

## Behavior Patterns

- Minimum query length is `1` character before inline search executes.
- Search results render inline in the block result panel.
- Form submit navigates to `/search?q=<query>`.
- Escape closes open results and returns focus safely.
- Clicking outside closes open results.
- Product visibility is filtered to searchable catalog values.

## Accessibility

- Uses semantic search form (`role="search"`).
- Includes an ARIA live region for result announcements.
- Uses visible focus styles (`:focus-visible`).
- Preserves keyboard behavior (submit, escape close, focus return).

## Troubleshooting

- Metadata not applying:
  - Ensure `section-metadata` is directly above the `search-bar` block.
- Unexpected style:
  - Verify `data-style` value exactly matches a supported preset.
- No inline results:
  - Ensure query length is at least 3 characters.
  - Verify searchable products and discovery API connectivity.
- Wrong count:
  - Ensure row 3 is a number from 2 to 20.
