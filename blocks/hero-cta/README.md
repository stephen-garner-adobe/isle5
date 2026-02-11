# Hero CTA Block

## Document Control

| Field | Value |
|---|---|
| Block | `hero-cta` |
| Status | Active |
| Metadata Contract | `herocta-*` section metadata keys |
| Last Updated | 2026-02-11 |

## Overview

The Hero CTA block is a media-first merchandising hero with:
- one or more image slides,
- optional sidebar navigation,
- CTA generation from authored content,
- section-metadata driven layout and visual presets.

This block is designed for campaign, category, and launch surfaces where merchandising teams need predictable authoring and consistent runtime behavior.

## DA.live Integration

### Authoring Table Structure

Use a 3-column `hero-cta` table.

| Column | Purpose | Required | Notes |
|---|---|---|---|
| 1 | Slide image, or `nav` marker | Yes | For slide rows, use an image source. For sidebar rows, use literal `nav`. |
| 2 | Content/link lines | Yes | Slide CTAs are typically authored as `Label|URL`. Sidebar rows are nav label/link entries. |
| 3 | Reserved | No | Not used by current implementation. |

### Authoring Patterns

| Pattern | Rule | Example |
|---|---|---|
| Slide row | Image in col 1, CTA lines in col 2 | `hero-1.jpg` + `Shop New Arrivals|/new` |
| Sidebar row | Set col 1 to `nav` | `nav` + `Women|/women` |
| Interval row | Last row with one numeric cell | `5000` (milliseconds) |

### Interval Behavior

The block reads interval from the final row when that row has exactly one numeric cell. If no valid interval is provided, default is `5000` ms.

### DA.live Model Options

| Field | Status | Notes |
|---|---|---|
| Block model fields | Not used as config source | Configuration is driven by section metadata and normalized in block JS. |

### Section Metadata Placement

Section metadata must be placed immediately above the `hero-cta` block.

## Configuration Options

### Canonical Metadata Contract

Use `herocta-*` keys only.

- DA.live may emit double-prefixed dataset entries at runtime; block code handles both normalized and double-prefixed forms internally.

### Section Metadata Reference

#### Layout and Placement

| Key | Default | Possible Values | Effect |
|---|---|---|---|
| `herocta-sidebar` | `off` | `off`, `left`, `right`, `overlay-left`, `overlay-right`, `sticky-left`, `sticky-right` | Enables sidebar mode and controls sidebar placement behavior. |
| `herocta-position` | `bottom-right` | `top-left`, `top-center`, `top-right`, `middle-left`, `middle-center`, `middle-right`, `bottom-left`, `bottom-center`, `bottom-right` | Sets the CTA/content anchor point on both axes. |
| `herocta-inset` | `medium` | `xsmall`, `small`, `medium`, `large`, `xlarge` | Sets linear distance from edges for anchored content (same inset on all sides). |
| `herocta-size` | `tall` | `short`, `medium`, `tall`, `fullscreen` | Hero block height preset. |
| `herocta-contentwidth` | `420` | `360`, `420`, `520`, `640` | Max width of content column in pixels. |

#### Button Styling

| Key | Default | Possible Values | Effect |
|---|---|---|---|
| `herocta-btnstyle` | `outline` | `outline`, `solid`, `ghost`, `elevated`, `glass`, `soft`, `pill`, `link`, `inset`, `underline`, `quiet`, `strong`, `halo`, `bevel`, `tab`, `rail`, `outline-double`, `compact` | Structure-only button style treatment (shape/surface behavior). Does not set color. |
| `herocta-btncorner` | `derived` | `default`, `soft`, `rounded-lg`, `pill`, `none` | Explicit corner override. If omitted, corner is derived from button style defaults. |
| `herocta-btnwidth` | `medium` | `auto`, `narrow`, `medium`, `wide`, `fluid`, `fit-content` | CTA width sizing behavior. |
| `herocta-btncolor` | `white` | `transparent`, `light`, `neutral`, `dark`, `brand`, `accent`, `white`, `black`, `#RGB`, `#RRGGBB`, `rgb(...)`, `rgba(...)` | CTA border color only. |
| `herocta-btnfill` | `transparent` | `transparent`, `light`, `neutral`, `dark`, `brand`, `accent`, `white`, `black`, `#RGB`, `#RRGGBB`, `rgb(...)`, `rgba(...)` | CTA fill/background color only. |
| `herocta-btntext` | `white` | `white`, `dark`, `brand`, `accent`, `inherit`, `#RGB`, `#RRGGBB`, `rgb(...)`, `rgba(...)` | CTA text color only. |
| `herocta-btnborder` | `3` | `1`, `2`, `3`, `4` | CTA border width in pixels. |

#### Button Style Presets

`herocta-btnstyle` is structure-only. Color comes from `herocta-btncolor`, `herocta-btnfill`, and `herocta-btntext`.

| Style | Runtime Effect |
|---|---|
| `outline` | Baseline button treatment; no additional style override. |
| `solid` | Square corners (`border-radius: 0`). |
| `ghost` | Dashed border (`border-style: dashed`). |
| `elevated` | Lifted card treatment with stronger drop shadows and slight upward offset. |
| `glass` | Glass treatment with blur/saturation and dual stroke ring. |
| `soft` | Softer corner radius (`14px`) with thinner border weight (`2px`). |
| `pill` | Full pill corners (`border-radius: 999px`). |
| `link` | Text-link button shell (`border: 0`, underline, intrinsic width, no shadow). |
| `inset` | Pressed treatment (`border-style: double` with inset shadow stack). |
| `underline` | Bottom-rule style (`border-width: 0 0 ...`, zero radius). |
| `quiet` | Minimal emphasis (`border-width: 1px`). |
| `strong` | High-emphasis border and label weight (`border-width: 4px`, `font-weight: 700`). |
| `halo` | Outer halo ring plus soft elevation shadow. |
| `bevel` | Angled/chamfered silhouette via `clip-path` polygon. |
| `tab` | Tab profile (`border-radius: 14px 14px 0 0`). |
| `rail` | Side-rail emphasis (`border-left/right` width increased). |
| `outline-double` | Double-line border style (`border-style: double`). |
| `compact` | Tighter horizontal footprint (`padding-inline: 20px`) and slight letter spacing increase. |

#### CTA Group

| Key | Default | Possible Values | Effect |
|---|---|---|---|
| `herocta-btnhover` | `lift` | `none`, `lift`, `press`, `pop`, `nudge`, `tilt`, `swing`, `pulse` | Motion-only hover interaction style for CTAs. |
| `herocta-ctalayout` | `stack` | `stack`, `inline`, `split` | CTA group layout mode. |
| `herocta-ctagap` | `medium` | `xsmall`, `small`, `medium`, `large` | Spacing between CTA items. |
| `herocta-ctacase` | `none` | `none`, `uppercase`, `capitalize` | CTA text transform. |
| `herocta-ctasize` | `default` | `default`, `sm`, `md`, `lg` | CTA text size preset. |

#### Motion and Slide Behavior

| Key | Default | Possible Values | Effect |
|---|---|---|---|
| `herocta-transition` | `fade` | `fade`, `slide`, `none` | Slide transition style. |

#### Frame and Image Delivery

| Key | Default | Possible Values | Effect |
|---|---|---|---|
| `herocta-frame` | `default` | `default`, `soft-small`, `soft-medium`, `soft-large`, `outline`, `elevated`, `double-stroke`, `glass-ring`, `gradient-ring`, `photo-matte` | Frame/radius/elevation treatment applied to the hero container. |
| `herocta-imgmax` | `2400` | `1200`, `1600`, `2000`, `2400`, `3000`, `3600` | Max responsive image width cap used in optimized picture breakpoints. |

## Behavior Patterns

### Slide and Sidebar Resolution

1. Rows with col 1 value `nav` are treated as sidebar navigation rows.
2. All other rows are treated as slide rows.
3. Sidebar is rendered only when `herocta-sidebar` resolves to an enabled value and at least one valid nav row exists.

### CTA Extraction

CTA generation behavior in slide content:
- Existing `.button` links are preserved.
- Standard links are normalized as CTA buttons.
- Plain text in `Label|URL` format is converted into anchor CTA buttons.
- `#` URLs are marked disabled (`aria-disabled="true"`, no tab stop).
- Column 3 is ignored by current implementation.

### Short Size Button Width Rule

When `herocta-size=short`, CTA width resolves to `medium` unless `herocta-btnwidth` is explicitly set.

## Accessibility

- First slide image is eager-loaded for LCP; additional slides are lazy.
- Slide rotation is disabled when `prefers-reduced-motion: reduce` is active.
- CTA links include focus-visible treatment.
- Hover animation presets are motion-only; reduced-motion mode removes hover transforms/animations.
- Disabled placeholder links (`#`) are marked as disabled for assistive technology and keyboard flow.

## Performance Notes

- Uses `createOptimizedPicture` with responsive breakpoints.
- `herocta-imgmax` controls upper image width cap and therefore bandwidth/quality tradeoff.
- Loading state is removed on first image load with a 3-second fallback timeout.

## Troubleshooting

| Symptom | Likely Cause | Resolution |
|---|---|---|
| Sidebar does not appear | `herocta-sidebar` is `off`, invalid, or no valid `nav` rows exist | Set `herocta-sidebar` to a valid value and add `nav` rows in col 1. |
| CTA/content position not changing | Invalid `herocta-position` value | Use one of the 9 position anchors (for example, `middle-center`). |
| CTA distance from edges not changing | Invalid `herocta-inset` value | Use one of: `xsmall`, `small`, `medium`, `large`, `xlarge`. |
| CTA hover changes unexpectedly | Invalid `herocta-btnhover` value normalized to default | Use one of the supported motion-only values. |
| CTA colors do not match expectation | Color channels are independent | Set `herocta-btncolor` (border), `herocta-btnfill` (fill), and `herocta-btntext` (text) explicitly. |
| Column 3 values have no effect | Column 3 is reserved in current implementation | Move visual control to section metadata keys. |
| Interval ignored | Final row is not single numeric cell | Make final row one-cell numeric value (e.g., `5000`). |
| Frame style not visible | Invalid `herocta-frame` value, or subtle frame style selected | Use a supported frame value and test with a visibly distinct option (for example `outline` or `photo-matte`). |

## Example Section Metadata (Default Experience)

| Section Metadata | Value |
|---|---|
| `herocta-sidebar` | `off` |
| `herocta-position` | `bottom-right` |
| `herocta-inset` | `medium` |
| `herocta-btnstyle` | `outline` |
| `herocta-btncolor` | `white` |
| `herocta-btnfill` | `transparent` |
| `herocta-btntext` | `white` |
| `herocta-btnwidth` | `medium` |
| `herocta-frame` | `default` |
| `herocta-btnhover` | `lift` |
