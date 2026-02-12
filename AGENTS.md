# Adobe Commerce Storefront Block Creation Rules (Codex)

Apply these rules to **any new block creation** and to major first-pass rewrites of a block's architecture.

Typical files:
- `blocks/<new-block>/<new-block>.js`
- `blocks/<new-block>/<new-block>.css`
- `blocks/<new-block>/README.md`
- `blocks/<new-block>/_<new-block>.json`

Do not force these rules for unrelated micro-fixes unless explicitly requested.

Use official Adobe Commerce Storefront documentation as source of truth:
- https://experienceleague.adobe.com/developer/commerce/storefront/get-started/

## Required Block Structure

Every new block should include:
- `block-name.js`
- `block-name.css`
- `README.md`
- `_block-name.json` (DA.live config)

## Metadata Contract Rules

### Canonical API first

- Define one canonical metadata API for the block.
- Prefer preset-driven, condensed metadata over many overlapping knobs.
- Do not add legacy aliases unless explicitly required by the task.
- If aliases are required, document them in README and include a deprecation plan.

### Metadata ownership (required)

- Keep authored content in block rows/cells only (copy, links, media).
- Keep behavior/layout controls in section metadata only (alignment, columns, result counts, timing, motion toggles, etc.).
- Do not mix content and behavior in the same authoring surface unless explicitly required.

### Block-specific metadata naming (required)

- Metadata keys must be block-scoped; never use generic keys like `align`, `size`, `density`.
- Use a compact block prefix derived from block name without internal hyphens.
- Preferred author-facing format: `<blockprefix>-<field>`.
  - Example block prefix for `hero-cta`: `herocta`.
  - Example keys: `herocta-align`, `herocta-btnstyle`, `herocta-ctagap`.
- Do not include `data-` in author-facing metadata key names.
- Keep keys concise:
  - one hyphen between prefix and field,
  - no underscores,
  - avoid extra hyphen chains in field names (prefer `contentwidth` over `content-max-width`).
- Keep field tokens semantically clear and stable (`btn`, `cta`, `img` abbreviations are acceptable when consistently applied).

### Metadata precedence contract (required)

Every block must implement and document a deterministic precedence model.

Implementation must resolve metadata in this exact order:

1. **Layout tier**:
   - placement, container width, block size, structural positioning
   - examples: sidebar mode, width mode, align/position, inset, content width
2. **Content/structure tier**:
   - CTA grouping, gaps, type transforms, sizing controls
3. **Style/shape tier**:
   - style preset, corner/shape overrides, border thickness
4. **Color/explicit overrides tier**:
   - border/fill/text colors and other direct visual tokens
5. **Media/motion tier**:
   - frame styles, transitions, image constraints, hover motion

Required behavior:
- Higher tiers establish layout semantics first.
- Lower tiers may refine visuals but must not silently break higher-tier semantics.
- If one setting makes another inapplicable, treat it as a no-op and log a clear block-prefixed warning.
- Avoid hidden coupling. If coupling is intentional, codify it as an explicit rule (for example: full-width disabled when sidebar is enabled).

### Style vs color contract (required)

- Style fields control structure/chrome only (shape, border style, hover motion, layout behavior).
- Color fields control color only (border/fill/text/overlay colors).
- A style option must not silently override explicit color metadata unless documented as an intentional rule.

### DA.live section metadata reads

Section metadata may appear with double-prefix keys. Always read robustly from both:
- `section.dataset.<blockprefixX>`
- `section.dataset.data<blockprefixX>`

Preferred pattern:

```js
function getConfigValue(blockValue, sectionData, keys, fallback) {
  if (blockValue) return blockValue;
  for (let i = 0; i < keys.length; i += 1) {
    if (sectionData?.[keys[i]]) return sectionData[keys[i]];
  }
  return fallback;
}
```

Example key resolution for `herocta-align`:
- `section.dataset.heroctaAlign`
- `section.dataset.dataHeroctaAlign`

### Normalize and persist

- Validate every author-facing option and fall back safely.
- Warn on invalid metadata values with block-prefixed warnings.
- Persist resolved values to `block.dataset.*` so CSS reads a stable state.

Example:

```js
function normalizeAlign(value, fallback = 'right') {
  const val = (value || '').toLowerCase();
  return ['left', 'center', 'right'].includes(val) ? val : fallback;
}
```

## Security Requirements

### URL safety (mandatory)

- Never trust authored `href`/`src` blindly.
- Allow only safe protocols and safe relative forms.
- Explicitly block unsafe protocols (`javascript:`, `data:`, etc.).
- For `target="_blank"`, always enforce `rel="noopener noreferrer"`.

Minimum allowed URL types:
- `http:`
- `https:`
- `mailto:`
- `tel:`
- root-relative (`/path`)
- relative (`./path`, `../path`)
- hash anchors (`#id`)

### HTML injection safety

- Do not inject unsanitized author content with `innerHTML`.
- Build DOM with `createElement`/`textContent`.
- Do not log raw `innerHTML` from authored cells in warnings.

## JavaScript Rules

### Architecture

- Single default export: `export default function decorate(block) {}`.
- Keep state local to the block instance.
- Scope queries to `block` whenever possible.
- Prefer schema-based config resolution for maintainability.
- Centralize metadata schema in one place (defaults, key map, normalizers, tier/precedence).

### Loading and lifecycle

- Use explicit loading state (`data-loading`).
- Remove loading state on load/error and with timeout fallback.
- Clean up timers/listeners when re-decorating or disconnecting paths are possible.
- Pause autoplay/timers when page is hidden (`visibilitychange`).

### Images and media

- Use `createOptimizedPicture`.
- Use eager loading for likely LCP media; lazy for non-LCP media.
- Provide responsive breakpoints matched to real layout needs.

### Accessibility

- Keyboard accessible interactions only.
- Use semantic elements (`a` for navigation, `button` for actions).
- Visible `:focus-visible` states are required.
- Respect `prefers-reduced-motion`.
- Maintain AA contrast for critical text/CTA states.
- Minimum tap target: `44x44`.

## CSS Rules

### Variant model

- Use data attributes for variants, not ad-hoc utility classes.

Example:

```css
.hero-cta[data-align='center'] .hero-content { text-align: center; }
```

### Maintainability and performance

- Use block-scoped selectors.
- Keep selector specificity low-to-high (stylelint-friendly ordering).
- Prefer design tokens and custom properties over hardcoded values.
- Prefer modern color notation (`rgb(0 0 0 / 55%)`).
- Avoid `transition: all`; transition only relevant properties.
- Avoid `!important` unless strictly necessary and documented.

### Floating/overlay safety (required)

- For absolute/floating UI layers (whiteboxes, overlays, floating CTAs), clamp to parent bounds.
- Required guardrails:
  - `box-sizing: border-box`
  - `max-width: 100%`
  - parent-aware width clamps for narrow breakpoints
- Floating elements must not create horizontal overflow or overlap neighboring cards at supported breakpoints.

## README Requirements

Each block README must include:
1. Overview
2. DA.live integration and authoring structure
3. Configuration options
4. Behavior patterns
5. Accessibility notes
6. Troubleshooting

### README tables are required

Include both:
- **DA.live Model Options**
- **Section Metadata Reference**

Section Metadata Reference must use a **3-column table**:
- key/field
- possible values
- effect (plain-language, outcome-focused, extensive)

Default behavior must still be documented, but include it inside the effect text
(for example: `Default: medium. Controls ...`), rather than as a separate column.

Also include:
- Section Metadata placement guidance (immediately above block).
- Supported aliases (only if intentionally implemented).

Section Metadata Reference should be grouped by functional area where relevant:
- Layout
- CTA/Button
- Frame/Image
- Motion
- Behavior

### README must mirror precedence contract

For block creation and first-pass docs, README must include:
- A **Metadata Precedence** section using the same tier order implemented in code.
- A concise **Override Rules** table:
  - condition
  - winner
  - ignored/no-op fields
  - user-visible effect
- A **Conflict/No-op Notes** section for common invalid or non-effective combinations.
- A **Conflict Matrix** for mutually exclusive options (condition, winner, ignored/no-op, effect).

## Removal and Breaking Changes

### Block/capability removal protocol (required)

When removing a custom block or capability, remove all implementation surfaces:
- block folder/files under `blocks/<block>`
- model/filter registrations (`component-models.json`, `component-filters.json`)
- metadata readers/normalizers and dead CSS selectors
- README references for removed behavior

### Breaking-change policy

- If backward compatibility is not requested, remove legacy keys/aliases entirely.
- If backward compatibility is requested, explicitly document:
  - legacy keys retained
  - canonical replacement
  - sunset/removal plan

## Responsive Geometry Gate

- Validate layout geometry across representative widths before shipping.
- Minimum sweep: `360, 390, 414, 480, 768, 1024, 1280, 1440, 1920`.
- Treat hard geometry leak > `2px` as a defect (card/panel/button overflow or clipping).
- Separate true geometry failures from visual-only effects (e.g., box-shadow overflow).

## DA.live JSON Config

- Keep `_block-name.json` aligned with actual authoring shape.
- `rows`/`columns` should match expected authoring table structure.
- Avoid stale model fields that no longer map to behavior.

## Linting and Quality Gates

All block creation changes must pass:
- ESLint (JS)
- Stylelint (CSS)

Typical commands:

```bash
npm run lint
npm run lint:js
npm run lint:css
```

Follow project conventions (line length, quotes, trailing commas, selector order, etc.).

## Before Shipping Checklist

1. Lint passes (`lint:js` and `lint:css`).
2. Metadata resolution works for both single and double-prefix section keys.
3. Precedence tiers are implemented in code and documented in README with matching terminology.
4. Override/no-op combinations are deterministic and warned clearly.
5. Invalid metadata safely falls back and logs actionable warnings.
6. Unsafe URLs are blocked; `_blank` links include `noopener noreferrer`.
7. No-JS behavior is acceptable for critical content and links.
8. Motion respects `prefers-reduced-motion` and timers are lifecycle-safe.
9. Mobile and desktop layouts are verified, including `44x44` tap targets.
10. README and `_block-name.json` match implemented behavior.
11. Responsive geometry gate passes across required widths (no hard leak > `2px`).
12. Floating/absolute UI layers are clamped and do not overflow/clip at small screens.
