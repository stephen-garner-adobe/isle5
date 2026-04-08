# Targeted Block

## Overview

The `targeted-block` block renders personalization content through the Storefront Personalization `TargetedBlock` container and can optionally load its content from a fragment.

## DA.live integration and authoring structure

The block is authored as a key-value block.

| DA.live Model Options | Value | Effect |
| --- | --- | --- |
| `content` | rich text | Inline fallback content rendered when no fragment is configured. |
| `customerGroups` | comma-separated text | Optional customer group IDs, base64-encoded before passing to personalization. |
| `customerSegments` | comma-separated text | Optional customer segment IDs, base64-encoded before passing to personalization. |
| `type` | text | Personalization targeting type passed to the drop-in container. |
| `fragment` | root-relative path | Optional fragment path loaded and used as the slot content. |

Document authoring example:

| Targeted Block |
| --- |
| `type: customer-segments` |
| `customer-segments: 3,4` |
| `fragment: /fragments/member-offer` |

## Section Metadata Reference

This block does not currently use block-specific section metadata.

| key/field | possible values | effect |
| --- | --- | --- |
| N/A | N/A | Default: no section metadata is read by this block. |

## Metadata Precedence

Not applicable. Block behavior is configured through block rows, not section metadata.

## Behavior patterns

- Comma-separated group, segment, and cart-rule IDs are base64-encoded before passing to the drop-in.
- If `fragment` is present, the block loads the fragment and uses it as the content slot.
- If `fragment` is absent, the final authored child element is used as the content slot.

## Accessibility notes

- Accessibility depends on the authored or fragment-loaded slot content.
- Fragment content should preserve semantic structure because it is inserted as authored.

## Troubleshooting

- If targeting does not work, verify IDs are comma-separated raw IDs and not already encoded.
- If fragment-backed content does not render, verify the fragment path is root-relative and published.
