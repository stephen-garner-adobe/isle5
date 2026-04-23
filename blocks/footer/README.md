# Footer

## Overview

The `footer` block loads the shared footer fragment and, in multistore mode, renders a store-switcher modal.

## DA.live integration and authoring structure

This block is infrastructure-oriented and registered through [footer.json](/Users/sgarner/Documents/Demo%20Environments/isle5/ue/models/blocks/footer.json) so Universal Editor can identify the block. It does not expose custom sidebar configuration fields.

| DA.live Model Options | Value | Effect |
| --- | --- | --- |
| N/A | N/A | Default: configured by page metadata and shared fragment content rather than block sidebar fields. |

Document authoring example:

This block is typically placed by the site template rather than authored ad hoc in page content.

## Section Metadata Reference

This block does not currently use block-specific section metadata.

| key/field | possible values | effect |
| --- | --- | --- |
| N/A | N/A | Default: no section metadata is read by this block. |

## Metadata Precedence

Not applicable. The footer is metadata-driven through page-level fragment paths, not section metadata.

## Behavior patterns

- Reads the `footer` page metadata key for the shared footer fragment path.
- In multistore mode, loads `/store-switcher` and renders a modal trigger button.
- Uses fragment content as the source of truth for footer markup.

## Accessibility notes

- Accessibility depends on the authored footer fragment content and store-switcher link text.
- Store-switcher keyboard behavior is implemented with click and keyboard handlers on expandable regions.

## Troubleshooting

- If the footer does not render, verify the `footer` metadata path and fragment publication state.
- If the store switcher does not render, verify the multistore configuration and `/store-switcher` fragment availability.
