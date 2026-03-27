# Fragment

## Overview

The `fragment` block loads another authored document fragment and renders its content inline on the current page.

Use it to reuse shared content across multiple pages while maintaining a single source document.

## DA.live integration and authoring structure

The block expects a single authored fragment link.

| DA.live Model Options | Value | Effect |
| --- | --- | --- |
| `fragmentUrl` | root-relative fragment path | Required. The fragment document to fetch as `.plain.html`. |
| `fragmentUrlText` | free text | Optional link text shown in authoring. |

Document authoring example:

| Fragment |
| --- |
| [Promo fragment](/fragments/promo-banner) |

## Section Metadata Reference

This block does not currently use block-specific section metadata.

| key/field | possible values | effect |
| --- | --- | --- |
| N/A | N/A | Default: no section metadata is read by this block. |

## Behavior patterns

- Only safe root-relative fragment paths are loaded.
- The fragment is fetched from `<path>.plain.html`.
- Fragment content is decorated with the standard page decoration flow and section loading before being inserted into the current page.
- Relative fragment media references that start with `./media_` are rewritten against the fragment path so images continue to resolve correctly.
- If the fragment loads successfully, the block content is replaced with the fragment document’s child nodes.

## Accessibility notes

- Accessibility depends on the authored fragment content.
- Reused fragment documents should preserve heading order, link clarity, and meaningful alt text because this block renders the fragment as-authored.

## Troubleshooting

- If the fragment does not render, verify that the authored path is root-relative and the fragment document is published.
- Confirm the fragment resolves correctly as `.plain.html`.
- If images break, verify the fragment media references are authored in the expected relative form.
- If nothing renders, inspect the network response for the fragment request and confirm the target document is reachable from the current site root.
