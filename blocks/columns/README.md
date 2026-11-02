# Columns

## Overview

The `columns` block lays out authored content in responsive columns and applies image-column styling when a column contains only a picture.

## DA.live integration and authoring structure

The block is authored through the `columns`, `columns-row`, and `columns-cell` DA.live definitions.
The parent and row models intentionally expose no synthetic "number of columns" property. Column
count comes from the actual cells in the first authored row, so the source table and rendered layout
cannot drift apart.

Document authoring example:

| Columns |
| --- | --- |
| Column 1 content | Column 2 content |

In Universal Editor, add or remove row/cell content through the container controls. Text and image
components are allowed inside a column cell.

## Section Metadata Reference

This block does not currently use block-specific section metadata.

| key/field | possible values | effect |
| --- | --- | --- |
| N/A | N/A | Default: no section metadata is read by this block. |

## Metadata Precedence

Not applicable. The block has no block-specific metadata tiers today.

## Behavior patterns

- The block adds a `columns-<n>-cols` class based on the first row cell count.
- A column wrapper receives `columns-img-col` when it contains a picture as its only child.

## Accessibility notes

- Authors remain responsible for heading order, alternative text, and meaningful link text inside each column.

## Troubleshooting

- If layout classes are wrong, confirm the first row reflects the intended column count.
- If image-column styling does not apply, confirm the image wrapper contains only the picture.

## Isle5 theme

Page metadata `Theme: isle5` opts into the redesigned presentation. Existing authored content, block settings and Commerce behavior retain their ownership; no custom section keys or backend settings are added by the theme. Other pages keep their existing appearance. Validate long content, narrow viewports, focus and service error states before authoring rollout.
