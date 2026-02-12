# Promotional Hero Block

## Overview
The `promotional-hero` block renders one or more campaign cards with:
- an image,
- short supporting copy,
- one CTA per card.

The block is metadata-driven and now uses a canonical section-metadata API with `promotionalhero-*` keys.

## DA.live Integration and Authoring Structure

### Authoring Table
Use a 3-column `promotional-hero` table.

| Column | Purpose | Required | Notes |
|---|---|---|---|
| 1 | Image | Yes | Image, image URL, or linked image source. |
| 2 | Description | No | Paragraphs or line-based text. |
| 3 | CTA | No | Link or `Label|URL` format. |

### Metadata Placement
Place section metadata immediately above the block.

### DA.live Model Options
| Field | Value |
|---|---|
| Block model fields | Not used for config. Runtime behavior is driven by section metadata. |

### Metadata Naming Contract
Use canonical block-scoped keys only:
- `promotionalhero-*`
- no generic `data-*` keys
- no `colour` aliases

## Configuration Options

### Metadata Precedence
Metadata is resolved in deterministic tiers:

1. Layout tier: structure, sizing, placement, density, and block width.
2. Structure tier: CTA sizing strategy.
3. Style tier: shape, border, shadow, typography style controls.
4. Color tier: border/fill/text/surface color channels.
5. Motion tier: hover motion, hover color behavior, image/card motion overlays.

Lower tiers can refine visual behavior but do not override core layout semantics.

### Override Rules
| Condition | Winner | Ignored/No-op | User-visible effect |
|---|---|---|---|
| `promotionalhero-btnstyle=link` with `promotionalhero-btncorner` | `btnstyle` | `btncorner` | Corner radius controls are ignored for link-style CTA and a warning is logged. |
| `promotionalhero-btnstyle=link` with `promotionalhero-btnborder` | `btnstyle` | `btnborder` | Border width control has no effect in link-style CTA and a warning is logged. |
| `promotionalhero-btnstyle=link` with `promotionalhero-btncolor` | `btnstyle` | `btncolor` | Border color control has no effect in link-style CTA and a warning is logged. |
| `promotionalhero-btnstyle=link` with `promotionalhero-btnfill` | `btnstyle` | `btnfill` | Fill/surface color control has no effect in link-style CTA and a warning is logged. |
| `promotionalhero-imageratio=landscape` without explicit `promotionalhero-btnwidth` | Layout tier | implicit button width behavior | CTA width resolves to `medium` for better landscape fit. |

### Section Metadata Reference

#### Layout
| Key | Possible Values | Effect |
|---|---|---|
| `promotionalhero-align` | `left`, `center`, `right` | Default: `center`. Controls horizontal alignment of the card grid inside the section container. |
| `promotionalhero-columns` | `auto`, `1`, `2`, `3` | Default: `2`. Sets explicit desktop card columns, or auto-fit behavior when `auto` is used. |
| `promotionalhero-cardwidth` | `small`, `medium`, `large` | Default: `medium`. Controls card base width and therefore visual density per row. |
| `promotionalhero-cardheight` | `auto`, `short`, `medium`, `tall` | Default: `auto`. Controls minimum vertical card scale and whitebox offset rhythm. |
| `promotionalhero-imageratio` | `portrait`, `square`, `landscape` | Default: `portrait`. Defines image aspect ratio and overall visual proportion of each card. |
| `promotionalhero-imagefit` | `cover`, `contain` | Default: `cover`. Defines crop behavior of card imagery. |
| `promotionalhero-gap` | `small`, `medium`, `large` | Default: `medium`. Sets spacing between cards. |
| `promotionalhero-density` | `compact`, `comfortable`, `spacious` | Default: `comfortable`. Scales internal spacing/padding of the block for tighter or looser layouts. |
| `promotionalhero-width` | `default`, `full-width` | Default: `default`. `full-width` removes block corner radius and enables edge-to-edge band treatment. |
| `promotionalhero-gridmaxwidth` | `none`, `1200`, `1400`, `1600`, `1800` | Default: `none`. Caps overall card grid width on very wide screens. |
| `promotionalhero-mobilelayout` | `stack`, `carousel`, `snap-scroll` | Default: `stack`. Controls small-screen card flow pattern. |

#### Content Panel
| Key | Possible Values | Effect |
|---|---|---|
| `promotionalhero-contentstyle` | `floating`, `flush`, `inset` | Default: `floating`. Controls whitebox placement relative to the image edge. |
| `promotionalhero-contentalign` | `left`, `center`, `right` | Default: `center`. Sets text alignment inside the whitebox content area. |
| `promotionalhero-panelwidth` | `compact`, `standard`, `wide` | Default: `standard`. Controls whitebox width profile and copy measure. |
| `promotionalhero-paneloffset` | `none`, `small`, `medium`, `large`, `xlarge` | Default: `medium`. Sets vertical overlap distance for floating panel effect. |
| `promotionalhero-contentborderstyle` | `none`, `subtle`, `strong`, `brand` | Default: `none`. Applies panel border treatment intensity. |
| `promotionalhero-contentshadow` | `none`, `soft`, `medium`, `strong` | Default: `soft`. Controls whitebox elevation/shadow depth. |
| `promotionalhero-contentradius` | `sharp`, `soft`, `default`, `rounded-lg`, `pill` | Default: `default`. Controls whitebox corner geometry. |
| `promotionalhero-contentbg` | `transparent`, `light`, `neutral`, `dark`, `brand`, `accent`, `white`, `black`, `#RGB`, `#RRGGBB`, `rgb(...)`, `rgba(...)` | Default: `white`. Panel background color channel. |
| `promotionalhero-contenttext` | `transparent`, `light`, `neutral`, `dark`, `brand`, `accent`, `white`, `black`, `#RGB`, `#RRGGBB`, `rgb(...)`, `rgba(...)` | Default: `dark`. Panel text color channel. |
| `promotionalhero-contentbordercolor` | `transparent`, `light`, `neutral`, `dark`, `brand`, `accent`, `white`, `black`, `#RGB`, `#RRGGBB`, `rgb(...)`, `rgba(...)` | Default: empty. Explicit panel border color channel when border style is enabled. |

#### Card Frame and Media
| Key | Possible Values | Effect |
|---|---|---|
| `promotionalhero-cardradius` | `sharp`, `soft`, `default`, `rounded-lg` | Default: `default`. Card corner shape for image/card shell. |
| `promotionalhero-cardborderstyle` | `none`, `subtle`, `strong`, `brand` | Default: `none`. Card frame border style preset. |
| `promotionalhero-cardborderwidth` | `0`, `1`, `2`, `3`, `4`, `6` | Default: `0`. Card frame border thickness. |
| `promotionalhero-cardbordercolor` | `transparent`, `light`, `neutral`, `dark`, `brand`, `accent`, `white`, `black`, `#RGB`, `#RRGGBB`, `rgb(...)`, `rgba(...)` | Default: empty. Explicit card border color channel. |
| `promotionalhero-imageshadow` | `none`, `soft`, `strong` | Default: `soft`. Image elevation depth level. |
| `promotionalhero-imageposition` | `left`, `center`, `right`, `top`, `bottom` | Default: `center`. Sets object-position to preserve subject focus. |
| `promotionalhero-imageoverlay` | `none`, `light`, `medium`, `strong`, `brand-tint` | Default: `none`. Overlay intensity style for image readability and brand mood. |
| `promotionalhero-imageoverlaycolor` | `transparent`, `light`, `neutral`, `dark`, `brand`, `accent`, `white`, `black`, `#RGB`, `#RRGGBB`, `rgb(...)`, `rgba(...)` | Default: `dark`. Overlay color channel used by image overlay style. |

#### CTA Style and Typography
| Key | Possible Values | Effect |
|---|---|---|
| `promotionalhero-btnstyle` | `default`, `pill`, `sharp`, `soft`, `rounded-lg`, `outline`, `ghost`, `elevated`, `minimal`, `glass`, `gradient`, `link` | Default: `pill`. Primary CTA shell style preset. |
| `promotionalhero-btncorner` | `sharp`, `default`, `soft`, `rounded-lg`, `pill` | Default: unset. Explicit corner override for CTA shell; omitted means style-native corners. |
| `promotionalhero-btnwidth` | `auto`, `narrow`, `medium`, `wide`, `fluid` | Default: `auto`. CTA width strategy. |
| `promotionalhero-btncase` | `none`, `uppercase`, `capitalize` | Default: `none`. CTA text casing transform. |
| `promotionalhero-btnborder` | `1`, `2`, `3`, `4` | Default: `3`. CTA border thickness. |
| `promotionalhero-btnshadow` | `none`, `soft`, `medium`, `strong` | Default: `none`. CTA shadow elevation level. |
| `promotionalhero-btnsize` | `sm`, `md`, `lg` | Default: `md`. CTA text size preset. |
| `promotionalhero-btnweight` | `400`, `500`, `600`, `700` | Default: `600`. CTA text weight preset. |

#### CTA Color and Hover Channels
| Key | Possible Values | Effect |
|---|---|---|
| `promotionalhero-btncolor` | `transparent`, `light`, `neutral`, `dark`, `brand`, `accent`, `white`, `black`, `#RGB`, `#RRGGBB`, `rgb(...)`, `rgba(...)` | Default: `brand`. CTA border color channel only. |
| `promotionalhero-btnfill` | `transparent`, `light`, `neutral`, `dark`, `brand`, `accent`, `white`, `black`, `#RGB`, `#RRGGBB`, `rgb(...)`, `rgba(...)` | Default: `brand`. CTA fill/background color channel only. |
| `promotionalhero-btntext` | `transparent`, `light`, `neutral`, `dark`, `brand`, `accent`, `white`, `black`, `#RGB`, `#RRGGBB`, `rgb(...)`, `rgba(...)` | Default: `white`. CTA text color channel only. |
| `promotionalhero-btnhovercolor` | `style`, `none`, `inverse`, `darken` | Default: `style`. Controls hover color behavior independently from motion. |
| `promotionalhero-btnhovermotion` | `none`, `lift`, `press`, `pop`, `nudge`, `tilt` | Default: `lift`. Controls hover motion independently from color behavior. |

#### Description and Background
| Key | Possible Values | Effect |
|---|---|---|
| `promotionalhero-descmaxlines` | `2`, `3`, `4`, `5`, `none` | Default: `none`. Optional line clamp for description consistency across cards. |
| `promotionalhero-descstyle` | `body`, `headline`, `eyebrow`, `muted` | Default: `body`. Description typography preset. |
| `promotionalhero-bgcolor` | `transparent`, `light`, `neutral`, `dark`, `brand`, `accent`, `white`, `black`, `#RGB`, `#RRGGBB`, `rgb(...)`, `rgba(...)` | Default: `transparent`. Block background surface color. |
| `promotionalhero-hovereffect` | `none`, `subtle`, `lift` | Default: `subtle`. Card/image hover behavior intensity. |

## Behavior Patterns
- First card image is eager-loaded; subsequent images are lazy-loaded.
- CTA links are sanitized before assignment.
- Unsafe links are converted to disabled placeholders and logged.
- Runtime always uses normalized metadata values (`block.dataset.*`) after resolution.

## Accessibility Notes
- CTA remains semantic `<a>` navigation.
- Keyboard focus-visible styles are present.
- Unsafe links are marked `aria-disabled` and removed from tab order.
- `_blank` links always include `rel="noopener noreferrer"`.
- Reduced-motion users get transform-free hover behavior.

## Troubleshooting
| Symptom | Likely Cause | Resolution |
|---|---|---|
| Metadata appears ignored | Non-canonical key names used | Use canonical `promotionalhero-*` keys only. |
| Link CTA is disabled | URL failed sanitization | Use `https`, `http`, `mailto`, `tel`, `/relative`, `./relative`, `../relative`, `#anchor`, or `?query`. |
| Button corner/border/fill does not apply | `promotionalhero-btnstyle=link` | Use a non-link button style for shell-based controls. |
| Hover motion too strong | Motion channel enabled | Set `promotionalhero-btnhovermotion=none`. |
| Hover colors unexpected | Hover color channel set to `style` | Use `promotionalhero-btnhovercolor=none` (or `inverse` / `darken`) for explicit behavior. |
| Full-width not visible | Width not set or section constraints dominate | Set `promotionalhero-width=full-width` and verify section/container constraints. |
