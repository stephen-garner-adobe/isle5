# Accordion

## Overview

The `accordion` block renders expandable disclosure items using semantic `<details>` and `<summary>` markup.

## DA.live integration and authoring structure

The block is authored as a parent `accordion` block containing one or more `accordion-item` child components.

| DA.live Model Options | Value | Effect |
| --- | --- | --- |
| `summary` | rich text | Required. The clickable accordion heading for each item. |
| `text` | rich text | Required. The body content revealed when the item is expanded. |

Document authoring example:

| Accordion |
| --- |
| Accordion Item |

## Section Metadata Reference

This block does not currently use block-specific section metadata.

| key/field | possible values | effect |
| --- | --- | --- |
| N/A | N/A | Default: no section metadata is read by this block. |

## Metadata Precedence

Not applicable. The block has no block-specific metadata tiers today.

## Behavior patterns

- Each authored row becomes a `<details class="accordion-item">`.
- The first cell becomes the `<summary>` label.
- The second cell becomes the accordion body.

## Accessibility notes

- The block uses native disclosure elements for keyboard and screen reader support.
- Authors should keep summary text concise and body content semantically structured.

## Troubleshooting

- If the accordion does not expand, confirm each row has exactly two cells.
- If headings render incorrectly, verify the first cell contains the intended summary copy.

## Isle5 theme

Page metadata `Theme: isle5` opts into the redesigned presentation. Existing authored content, block settings and Commerce behavior retain their ownership; no custom section keys or backend settings are added by the theme. Other pages keep their existing appearance. Validate long content, narrow viewports, focus and service error states before authoring rollout.
