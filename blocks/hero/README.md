# Hero

## Overview

`hero` enhances an authored picture and heading. On pages with `Theme: isle5`, it becomes a static image-led campaign with optional supporting rich text and actions. Other pages retain the existing presentation.

## Authored table

The first row/cell contains the image and H1. An optional second row/cell contains supporting rich text and links. Existing one-row documents remain valid. Extra rich-text wrappers are tolerated; the decorator finds the picture without requiring a fixed wrapper depth.

| Hero |
| --- |
| Image with alt text, followed by the page H1 |
| Optional supporting paragraph and action links |

## Model options

| Field | Required | Effect |
| --- | --- | --- |
| `image` | Yes for image enhancement | Existing image source |
| `alt` | No | Meaningful alt text; empty only for decorative imagery |
| `text` | Yes for campaign heading | Existing H1 field |
| `body` | No | Rich text and labelled action links in the second row |
| `loading` | No | `lazy` by default; `eager` only for an image verified as the page LCP candidate |

## Configuration and metadata

There is no key-value configuration table or custom section metadata. Page `Theme: isle5` selects campaign presentation. Existing section layout controls remain available. Source-model fields live in `ue/models/blocks/hero.json`; precedence is not applicable.

The isle5 theme only requests eager image loading when the authored image explicitly uses `loading="eager"`. Unthemed pages preserve their existing first-section loading behavior. Do not mark an image eager merely because it appears first.

## Behavior and fallback

The decorator optimizes a safe HTTP(S) picture, retains the remaining rich content and runs only once per block. Missing/unsafe media is omitted while heading, copy and links remain. Relative image URLs are resolved against the current document. Unsupported action schemes are disabled; new-window links enforce `noopener noreferrer`.

## Accessibility

Use one logical H1 per page. Keep supporting headings in order and provide meaningful link text. Campaign text has a contrast overlay and responsive sizing. Focus remains visible, primary links have at least a 44px target and reduced-motion preferences are respected.

## Troubleshooting

- No image: check that the first authored region contains a picture with a safe image URL.
- Supporting copy absent: the second row is optional; author it through the rich-text field or normal table content.
- Default appearance: check page `Theme: isle5` and stylesheet delivery.
- Cropping obscures the subject: approve a suitable mobile/desktop crop before authoring; the generic campaign aligns media toward the right.

A new DA example and delivered-preview validation remain required before authoring rollout; repository/model changes do not create that example.
