# Enrichment

## Overview

The `enrichment` block loads one or more authored fragment documents from the `enrichment/enrichment` index and injects them into the current page when the current page context matches the configured enrichment rules.

Use it when you want to conditionally add content to product detail pages or product list pages without hard-coding that content into the page itself.

## DA.live integration and authoring structure

The block is authored as a key-value block with two fields:

| DA.live Model Options | Value | Effect |
| --- | --- | --- |
| `type` | `product`, `category` | Selects how the enrichment block resolves the current page context. |
| `position` | free text | Optional position token used to further filter enrichment entries in the index. |

Document authoring example:

| Enrichment |
| --- |
| `type: product` |
| `position: after-gallery` |

The enrichment entries themselves are not authored inside the block. They are resolved from the `enrichment/enrichment` index.

## Section Metadata Reference

This block does not currently use block-specific section metadata.

| key/field | possible values | effect |
| --- | --- | --- |
| N/A | N/A | Default: no section metadata is read by this block. |

## Behavior patterns

- `type: product` resolves the current PDP SKU with `getProductSku()` and matches enrichment entries whose `products` field contains that SKU.
- `type: category` locates the page `product-list-page` block and matches enrichment entries whose `categories` field contains the PLP `urlpath`.
- If `position` is provided, matching enrichment entries must also include that value in their `positions` field.
- Single-section fragments are inlined into the current section.
- Multi-section fragments are inserted after the section containing the enrichment block.
- Outside Universal Editor, the enrichment wrapper is removed after processing so the placeholder block does not remain visible.

## Accessibility notes

- Accessibility depends on the authored fragment content that gets injected.
- Fragments should continue to use semantic headings, valid links, and accessible media because this block does not rewrite that content.

## Troubleshooting

- If nothing appears, verify that the block has a valid `type`.
- For product enrichment, confirm the current page resolves a valid SKU.
- For category enrichment, confirm the page contains a `product-list-page` block with a resolvable `urlpath`.
- Confirm the `enrichment/enrichment` index contains entries whose `products`, `categories`, and optional `positions` fields match the current page context.
- In Universal Editor, the wrapper remains for authorability; outside it, the placeholder wrapper is removed after processing.
