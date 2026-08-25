# Hero CTA Block

## Overview

The `hero-cta` block is an image-first hero with optional sidebar navigation and metadata-driven CTA styling.

It now uses **typed row authoring** in DA.live to remove ambiguity:
- `slide` rows for media + CTA content,
- `nav` rows for sidebar entries,
- `interval` rows for slide timing.

## DA.live Integration and Authoring Structure

Author using a **4-column** `hero-cta` table. The Universal Editor inserts one valid `slide` row and intentionally exposes no property-panel fields: the typed table is the content contract, while section metadata controls presentation. That avoids showing fields that cannot honestly express mixed `slide`, `nav`, and `interval` rows.

### Typed Row Model

| Row Type (Col 1) | Col 2 | Col 3 | Col 4 |
|---|---|---|---|
| `slide` | required image cell | CTA labels | matching CTA URLs |
| `nav` | mode: `item` or `header` | nav label (rich text preserved) | canonical nav URL (for `item`) |
| `interval` | interval in ms (for example `5000`) | unused | unused |

Rules:

- A `slide` row is required. Without one, enhancement stops and the authored table remains as fallback content.
- The image cell supports `picture`, `img`, an image-file link, or an absolute HTTP(S) image URL. Video and arbitrary media embeds are not supported. Provide meaningful image alternative text.
- Separate multiple CTA labels and URLs with paragraphs, list items, line breaks, or links. They pair by position: label 1 uses URL 1, label 2 uses URL 2, and so on.
- Missing or unsafe matching CTA URLs become disabled, non-focusable placeholders. The first URL is never reused for another label; a count mismatch logs a warning.
- A `nav item` reads its URL only from Column 4. `header` is non-interactive and ignores Column 4. An empty nav mode defaults to `item`; any other value warns and defaults to `item`.
- Author at most one `interval` row. The first interval row is used; if it is invalid, rotation falls back to `5000` ms and later interval rows are ignored.

### Authoring Examples

| Col 1 | Col 2 | Col 3 | Col 4 |
|---|---|---|---|
| `slide` | `[image: alt="Model wearing a shirt"]` | `Shop Shirts`<br>`Shop Hats` | `/shirts`<br>`/hats` |
| `nav` | `header` | `Women` (can be authored as H1-H6 / bold / paragraph) | |
| `nav` | `item` | `New Arrivals` | `/women/new` |
| `nav` | `item` | `Jackets` | `/women/jackets` |
| `interval` | `5000` | | |

### Sidebar Header Behavior

When `nav` row mode is `header` (Column 2):
- the row renders as a non-clickable sidebar heading,
- it is styled as `.hero-cta-sidebar-header`,
- no URL is required.

### Sidebar Label Typography Source

- Sidebar nav label typography is authored in DA.live (Column 3 of `nav` rows).
- Downstream rendering preserves authored rich text structure for labels (for example headings, bold text, paragraph text).
- `herocta-ctasize` controls CTA button text size only, not sidebar nav typography.

### Authoring Surfaces and Source Precedence

1. The four-column table is the canonical content source.
2. `section-metadata` in the same section, immediately above the block, is the canonical presentation source. Use the `herocta-*` keys below.
3. Existing block `data-herocta-*` attributes remain a compatibility override and win over section metadata. They are not modeled in Universal Editor and should not be added to new authored content.

For every supported key, runtime lookup is block `data-herocta-*` → section `data-herocta-*` → DA serialization alias `data-data-herocta-*` → default. The `data-data-herocta-*` form is a serialization compatibility alias only: author the canonical `herocta-*` metadata key and reassess the alias when the authoring model next migrates.

## Configuration Options

### Universal Editor Model Options

| Option | Value | Effect |
| --- | --- | --- |
| Block columns | `4` | One valid four-cell `slide` row is inserted; select an image before previewing. |
| Property-panel fields | none | Typed rows and section metadata are the supported authoring surfaces. |
| Supported typed rows | `slide`, `nav`, `interval` | Column 1 selects row behavior. |

### Section Metadata Reference

Place section metadata in the same section, immediately above the block. All keys use the authoring-source precedence above.

#### Layout

| Key | Possible Values | Effect |
|---|---|---|
| `herocta-position` | `top-left`, `top-center`, `top-right`, `middle-left`, `middle-center`, `middle-right`, `bottom-left`, `bottom-center`, `bottom-right` | Default: `bottom-right`. Controls overlay anchor point for CTA content on both axes. |
| `herocta-size` | `short`, `medium`, `tall`, `fullscreen` | Default: `tall`. Controls hero height preset. |
| `herocta-inset` | `xsmall`, `small`, `medium`, `large`, `xlarge` | Default: `medium`. Controls linear distance of overlay content from edges. |
| `herocta-contentwidth` | `360`, `420`, `520`, `640` | Default: `420`. Sets maximum CTA/content surface width in pixels. |
| `herocta-width` | `default`, `full-width` | Default: `default`. Controls container width mode. `full-width` becomes no-op when sidebar is enabled. |
| `herocta-sidebar` | `left`, `right`, `overlay-left`, `overlay-right`, `sticky-left`, `sticky-right` | Default: `off` (unset). Enables sidebar placement mode when typed `nav` rows exist. |
| `herocta-imgmax` | `1200`, `1600`, `2000`, `2400`, `3000`, `3600` | Default: `2400`. Controls responsive image max width cap used for optimized picture breakpoints. |

#### CTA/Button

| Key | Possible Values | Effect |
|---|---|---|
| `herocta-btnstyle` | `outline`, `solid`, `elevated`, `glass`, `soft`, `soft-glow`, `neo`, `ribbon`, `stamp`, `link`, `inset`, `underline`, `quiet`, `strong`, `halo`, `bevel`, `tab`, `rail`, `outline-double`, `compact`, `corner-pins`, `ticket`, `capsule-cut`, `brace`, `double-notch`, `frame-gap`, `split-edge`, `fold`, `badge`, `pixel-step` | Default: `elevated`. Controls button structure/chrome only. |
| `herocta-btncorner` | `default`, `soft`, `rounded-lg`, `pill`, `none` | Default: unset. Optional explicit corner override for CTA shape. |
| `herocta-btnwidth` | `auto`, `narrow`, `medium`, `wide`, `fluid`, `fit-content` | Default: `medium`. Controls CTA width sizing. |
| `herocta-btnborder` | `1`, `2`, `3`, `4` | Default: `3`. Controls CTA border thickness in px. |
| `herocta-btncolor` | token values (`transparent`, `light`, `neutral`, `dark`, `brand`, `accent`, `white`, `black`) or color literals (`#hex`, `rgb(...)`, `rgba(...)`) | Default: `white`. Controls CTA border color only. |
| `herocta-btnfill` | token values (`transparent`, `light`, `neutral`, `dark`, `brand`, `accent`, `white`, `black`) or color literals (`#hex`, `rgb(...)`, `rgba(...)`) | Default: `transparent`. Controls CTA fill color only. |
| `herocta-btntext` | `white`, `dark`, `brand`, `accent`, `inherit` or color literals | Default: `white`. Controls CTA text color only. |
| `herocta-btnhover` | `none`, `lift`, `press`, `pop`, `nudge`, `tilt`, `swing`, `pulse` | Default: `lift`. Motion-only hover behavior. |
| `herocta-ctalayout` | `stack`, `inline`, `split` | Default: `stack`. Controls CTA grouping layout. |
| `herocta-ctagap` | `xsmall`, `small`, `medium`, `large` | Default: `medium`. Controls spacing between CTA items. |
| `herocta-ctacase` | `none`, `uppercase`, `capitalize` | Default: `none`. Controls CTA text transform. |
| `herocta-ctasize` | `default`, `sm`, `md`, `lg` | Default: `default`. Controls CTA font size preset. |

#### Frame/Image

| Key | Possible Values | Effect |
|---|---|---|
| `herocta-frame` | `default`, `soft-small`, `soft-medium`, `soft-large`, `outline`, `double-stroke`, `glass-ring`, `floating-panel`, `halo-ring`, `photo-matte`, `edge-rails`, `topline-accent`, `duo-effect` | Default: `default`. Applies frame treatment to hero container. |

#### Motion

| Key | Possible Values | Effect |
|---|---|---|
| `herocta-transition` | `fade`, `slide`, `none` | Default: `fade`. Controls slide transition behavior. |

## Behavior Patterns

### Metadata Processing Tiers

After resolving the authoring source, the block normalizes configuration in this order:
1. Layout tier (`position`, `size`, `sidebar`, `width`, `inset`, `content width`, `image max width`)
2. Content/structure tier (`cta layout`, `gap`, `case`, `font size`, `button width`)
3. Style/shape tier (`button style`, `button corner`, `button border width`)
4. Color/explicit overrides tier (`button border/fill/text colors`)
5. Media/motion tier (`slide transition`, `image frame`, `button hover motion`)

### Override Rules

| Condition | Winner | Ignored/No-op | User-visible effect |
|---|---|---|---|
| `herocta-width=full-width` with sidebar enabled | Sidebar/layout constraint | `herocta-width=full-width` | Block uses default width to preserve sidebar geometry. |
| `herocta-btnstyle=link` with `btncorner`, `btnborder`, `btncolor`, or `btnfill` | Link style | corner, border, border color, and fill | CTA renders as a transparent text-link style. `btntext` still applies. |
| `herocta-ctalayout=split` with fewer than 2 CTAs | Content count | split intent | Split grid cannot form; warning is logged. |

### Conflict/No-op Notes

- Sidebar requires typed `nav` rows; enabling `herocta-sidebar` without typed nav rows logs a warning and renders no sidebar.
- Invalid metadata values, including `herocta-btncorner`, normalize to defaults with block-prefixed warnings.
- `nav` rows with `header` mode intentionally ignore Column-4 URL values.
- Sidebar label text size/weight is not metadata-driven; it comes from authored DA.live text formatting in `nav` label cells.
- CTA URLs support `https`, `http`, `mailto`, `tel`, `/relative`, `./relative`, `../relative`, `#anchor`, and `?query`. Unsafe schemes are disabled rather than rendered as active links.

## Accessibility Notes

- First slide image is eager-loaded for LCP optimization.
- Missing or unsafe CTA and nav URLs are marked disabled and non-focusable.
- Sidebar headers are non-interactive semantic text.
- Focus-visible states are provided for CTA and sidebar links.
- Reduced-motion media query disables heavy hover animations.

## Troubleshooting

| Symptom | Likely Cause | Resolution |
|---|---|---|
| The block shows its table instead of a hero | No `slide` row | Add a correctly spelled `slide` row with an image in Column 2. |
| Image does not render | Unsupported media or no image source | Use an image, image-file link, or absolute HTTP(S) image URL; video is unsupported. |
| Sidebar not visible | No typed `nav` rows authored | Add `nav` rows with mode `item` or `header`. |
| Sidebar title should be non-clickable | Nav row mode not set | Set `nav` row Column 2 to `header`. |
| Sidebar text size/weight not changing via metadata | Sidebar typography is author-driven | Apply DA.live text formatting in `nav` label cell (Column 3), for example H2/H3/bold. |
| CTA labels render but links are disabled | Matching URL missing or unsafe | Add one safe Column-4 URL for every Column-3 label, in the same order. |
| CTA links are paired incorrectly | Labels and URLs are not aligned | Keep labels and URLs one-to-one; URLs are never reused. |
| Sidebar item is disabled | URL is missing or was put in Column 3 | Put the safe nav URL in Column 4. |
| Interval not applied | First `interval` row is invalid or a later row was used | Keep one positive millisecond value in Column 2 (for example `5000`). |
| Full-width not applying | Sidebar enabled | Disable sidebar or keep width as `default`. |
| Metadata appears ignored | Metadata is in another section or a legacy block override wins | Move metadata immediately above the block in the same section and check for `data-herocta-*` on the block. |
