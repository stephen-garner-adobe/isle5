# Modal Helper

## Overview

The `modal` block is a utility helper used by other blocks to render a dialog container and mount drop-in content inside it.

## DA.live integration and authoring structure

This is not a standalone DA.live authoring block. It is intentionally not registered in `ue/models/component-definition.json` and has no active `ue/models/blocks/modal.json` source.

| DA.live Model Options | Value | Effect |
| --- | --- | --- |
| N/A | N/A | Default: instantiated programmatically by other blocks such as auth flows and the store switcher. |

Document authoring example:

No direct document authoring example applies because this helper is created from JavaScript rather than inserted by page authors.

## Section Metadata Reference

This helper does not read block-specific section metadata.

| key/field | possible values | effect |
| --- | --- | --- |
| N/A | N/A | Default: no section metadata is read by this helper. |

## Metadata Precedence

Not applicable. The helper has no author-facing metadata.

## Behavior patterns

- Loads `modal.css` on demand.
- Creates a `<dialog>` element, a close button, and a content container.
- Unmounts any drop-in containers before removing the modal.

## Accessibility notes

- Uses native `<dialog>` semantics.
- Focus is moved to the first input when modal content becomes available.

## Troubleshooting

- If the modal does not appear, verify the invoking block appends it to `main`.
- If drop-in content persists after close, verify the invoking flow calls the returned modal cleanup methods correctly.
