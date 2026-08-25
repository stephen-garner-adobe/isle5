# Adobe Commerce Storefront Block Rules

These instructions apply to every file under `blocks/`. They extend the repository root rules.
For companion authoring models under `ue/`, also follow `ue/AGENTS.md`.

## Applicability

| Change type | Required scope |
|---|---|
| New block | Full compliance, documentation, authoring model when applicable, lint, and responsive validation |
| Major architecture rewrite | Full compliance for rewritten surfaces; remove obsolete behavior in scope |
| Micro-fix | Preserve contracts and keep the change narrow |
| Security or accessibility fix | Apply all relevant mandatory rules even when the patch is small |
| Generated drop-in refresh | Not a block change; follow `scripts/AGENTS.md` |

## Block Shape

A new custom block normally includes:

- `blocks/<block-name>/<block-name>.js`
- `blocks/<block-name>/<block-name>.css`
- `blocks/<block-name>/README.md`
- a source authoring model under the repository's active model root when the block is authorable

Use lowercase hyphenated names and keep the block folder, JS, CSS, class, model ID, and README
terminology aligned.

Each block entry module at `blocks/<block-name>/<block-name>.js` MUST expose one default decorator.
Helper modules may use named exports. The entry decorator may be synchronous or asynchronous:

```js
export default async function decorate(block) {
  // Enhance authored markup.
}
```

## Authoring and Configuration Ownership

Use the configuration boundary defined by the root policy:

- Block rows and cells hold authored content and block-specific settings.
- Section metadata controls the section/container around one or more blocks.
- Page metadata controls indexing, caching, social fields, and route semantics.
- Repository configuration controls endpoints, locale, store view, and runtime features.

Do not move a block setting into section metadata merely because JavaScript can read
`section.dataset`. Examples of block-specific settings include result count, enabled actions,
commerce container options, and content-display toggles. Examples of section metadata include
section width, padding, background, and column layout.

Use `readBlockConfig(block)` from `scripts/aem.js` when the authored block is a key-value
configuration table. Preserve ordinary authored rows and cells when they represent content rather
than configuration.

### Custom section metadata

When a block genuinely needs custom section metadata:

- Use a stable block prefix such as `herocta-` for custom keys.
- Keep Adobe-native section metadata names unchanged.
- Read the normalized camelCase dataset key and the known DA double-prefix form when this repository
  emits both.
- Validate allowed values, fall back safely, and persist the resolved state to `block.dataset`.
- Document placement immediately above the affected block.
- Do not add legacy aliases unless compatibility is explicitly required.

Use an explicit helper when several sources participate:

```js
function getConfigValue(blockValue, sectionData, keys, fallback) {
  if (blockValue !== undefined && blockValue !== null && blockValue !== '') return blockValue;
  for (let i = 0; i < keys.length; i += 1) {
    if (sectionData?.[keys[i]] !== undefined && sectionData[keys[i]] !== '') {
      return sectionData[keys[i]];
    }
  }
  return fallback;
}
```

Do not use truthiness when `false`, `0`, or an empty authored value has defined semantics.

### Precedence and conflicts

There is no mandatory global five-tier precedence model for every block. When a block has multiple
configuration surfaces:

1. Define the canonical source for each field.
2. Resolve sources in a deterministic order.
3. Normalize and validate each field.
4. Make incompatible settings explicit no-ops or conflicts.
5. Warn with a block-prefixed, author-facing message.
6. Mirror the implemented precedence and conflicts in the README.

Simple blocks with no competing settings may state that precedence is not applicable.

## JavaScript Architecture

- Keep state inside the block instance.
- Scope selectors to `block` or its owning section.
- Make `decorate(block)` idempotent. Re-decoration must not duplicate markup, listeners, timers,
  drop-in mounts, or analytics events.
- Batch DOM reads before writes where loops or measurements are involved.
- Avoid document-wide scans.
- Build authored content with semantic DOM APIs and `textContent`.
- Preserve usable authored fallback content until replacement UI is ready.
- If enhancement fails, keep or restore the fallback and emit an actionable warning.
- Guard asynchronous work when the block may be removed, moved, or redecorated before completion.
- Use delegated listeners where practical.
- Use `AbortController` for document/window listeners and abort them when a lifecycle provides a
  cleanup point.
- Pause autoplay and timers while the document is hidden.
- Never attach mutable block state to `window`.

### Error and loading behavior

- Missing optional content must degrade cleanly.
- Missing required content must not throw an uncaught error.
- Use block-prefixed warnings that identify the authored field without logging raw authored HTML.
- Use an explicit loading state for asynchronous UI.
- Clear loading state on success, failure, and a bounded timeout.
- Prevent stale async results from replacing newer renders.

Preferred warning shape:

```js
console.warn('hero-cta: invalid herocta-align="wide"; using "center"');
```

## Commerce Block Integration

- Import the relevant initializer at module scope so endpoints and dictionaries are ready before
  decoration.
- Use public drop-in renderers, containers, slots, events, and API functions only.
- Never import generated private chunks or reach into drop-in DOM internals.
- Prefer slots and documented options over post-render DOM manipulation.
- Reuse `getProductLink()`, `fetchPlaceholders()`, route constants, and existing helpers.
- Pass a stable unique `scope` only when the public API supports it and multiple instances require
  isolation.
- Use dynamic imports for conditional or interaction-triggered drop-ins.
- Static imports are appropriate when the block always needs the drop-in and its loading phase is
  intentional.
- Use plain JavaScript for ordinary block composition. Use Preact only for genuinely complex local
  state; drop-in rendering alone does not require a second component tree.
- Avoid deprecated monolithic containers when the installed drop-in exposes supported granular
  containers.

A typical public render remains curried:

```js
await provider.render(Container, {
  // documented options and slots
})(container);
```

Do not assume every drop-in version has identical options. Verify against installed package types
and the corresponding current Experience League reference.

## URL and DOM Safety

Follow the root security rules. In addition:

- Validate every authored `href` and `src` before assigning it.
- Allow approved `http:`, `https:`, `mailto:`, `tel:`, root-relative, relative, and fragment
  forms only when appropriate for the field.
- Never interpolate authored or API-controlled strings into a static HTML template.
- Fully static `createContextualFragment` templates are acceptable only when every byte is
  repository-controlled.
- Use native `button`, `a`, `input`, and form controls instead of interactive `div` elements.

## Images and Media

- Use `createOptimizedPicture` from `scripts/aem.js` for authored editorial images.
- Do not replace or re-wrap images owned by a drop-in; configure them through supported image
  options.
- Mark media eager only when it is the verified LCP candidate.
- Use lazy loading for non-critical media.
- Supply useful alt text from authored content; use `alt=""` only for intentionally decorative
  images.
- Choose responsive breakpoints from actual layout geometry rather than copying a generic set.
- Handle missing, invalid, and slow media without leaving the block permanently loading.

## CSS

- Scope classes and selectors with the block name.
- Use data attributes for resolved variants instead of ad-hoc utility classes.
- Prefer repository design tokens and custom properties over repeated hardcoded values.
- Keep selector specificity ordered from base rules to increasingly specific variants.
- Avoid `transition: all`.
- Avoid `!important` unless an integration constraint requires it and the reason is documented.
- Use modern color notation and stylelint-compatible shorthand.
- Provide visible `:focus-visible` states.
- Respect `prefers-reduced-motion`.
- Keep primary touch targets at least `44x44`.
- Clamp floating and absolutely positioned UI to its containing block:
  - `box-sizing: border-box`
  - `max-width: 100%`
  - parent-aware width limits at narrow breakpoints
- Prevent card, panel, control, and text overflow at supported widths.

## Semantics and Accessibility

- Preserve one logical page `h1`; do not manufacture heading levels from visual styling.
- Do not skip heading levels inside authored content without a documented page-level reason.
- Associate labels, help text, and errors with form controls.
- Announce important asynchronous errors and success messages appropriately.
- Use `aria-busy` or an equivalent accessible state when a region is genuinely updating.
- Move focus deliberately when opening or closing dialogs and when validation blocks progression.
- Ensure loading skeletons and disabled controls do not trap keyboard or screen-reader users.
- Maintain WCAG 2.1 AA contrast for essential content and controls.

## README Requirements

Documentation should be proportional to the block.

Every block README must include:

1. Overview and intended page context
2. Authored table structure
3. Required and optional inputs
4. Block-specific configuration
5. Section and page metadata dependencies, if any
6. Behavior and fallback patterns
7. Accessibility notes
8. Troubleshooting
9. At least one literal authoring example

For configurable blocks, also include:

- a model-options table;
- a block-configuration table;
- a separate section-metadata table;
- precedence and conflict/no-op rules;
- route and page-metadata assumptions.

A thin drop-in wrapper with no authored options may use a concise README and state that
configuration precedence is not applicable. Do not invent empty tables to satisfy a template.

Supported aliases must be documented with their canonical replacement and removal plan.

## Responsive Geometry

For new visual blocks and major layout rewrites, validate representative widths:

`360, 390, 414, 480, 768, 1024, 1280, 1440, 1920`

- Treat hard overflow or clipping greater than `2px` as a defect.
- Distinguish geometry failures from intentional shadows and visual effects.
- Check long text, translated text, missing optional content, multiple CTAs, and browser zoom.
- Record automated or manual outcomes when no viewport test exists.
- Micro-fixes need only the widths and states affected by the change unless the defect is systemic.

## Block Validation

Minimum for a new block or major rewrite:

```bash
npm run lint
npm run build:json
```

Also:

- verify authored fallback before JavaScript enhancement;
- preview the exact authoring example;
- verify eager and lazy placement as applicable;
- exercise invalid and missing configuration;
- run relevant route-level Cypress coverage for Commerce flows;
- confirm repeated decoration does not duplicate state;
- confirm README, source model, generated model, JavaScript, and CSS agree.

Before handoff, report viewport coverage, route coverage, and any manual-only checks.
