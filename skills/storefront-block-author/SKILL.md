---
name: storefront-block-author
description: Use when creating or rewriting Adobe Commerce Storefront custom blocks in repositories shaped like isle5, especially when the work must follow block JS/CSS, README, ue/models/blocks/block-name.json contracts, DA.live authoring rules, metadata precedence, accessibility, security, performance, and safe DOM/URL handling from AGENTS.md.
---

# Storefront Block Author

## When to use

- Creating a new custom block from scratch
- Major first-pass architecture rewrite of an existing block
- Security or accessibility remediation that requires implementation changes
- Any block work where AGENTS.md full compliance is expected

Do not use for micro-fixes in existing blocks unless the fix touches security or accessibility (those always require full compliance per the Applicability Matrix in AGENTS.md).

## Discovery questions

Before starting, confirm or infer answers to:

1. **New or rewrite?** Is this a new block or a major rewrite of an existing one?
2. **Block type?** Plain JS content block, interactive block with state, or commerce drop-in integration?
3. **Loading phase?** Which EDS phase does this block target — eager (first section), lazy (remaining sections), or delayed?
4. **Metadata needs?** Does the block need section metadata for behavior/layout, or is all configuration in block rows/cells?
5. **Route context?** Is this block route-specific (cart, checkout, account, PDP, PLP) or route-agnostic?

If answers are not provided, infer from the block name and location. State assumptions explicitly before proceeding.

## Core workflow

1. Read `AGENTS.md` — especially block structure, metadata contract, security, accessibility, loading phases, README, and DA.live JSON rules.
2. Inspect the target block folder under `blocks/` and related `component-definition.json`, `component-models.json`, `component-filters.json` before changing behavior.
3. Implement the block following the checklists below, in priority order.
4. Keep authored content in block rows/cells and behavior/layout controls in section metadata.
5. Implement deterministic metadata precedence and persist resolved values on `block.dataset.*`.
6. Use safe DOM construction and URL handling throughout.
7. Align README and `ue/models/blocks/block-name.json` with the implementation (delegate deep contract verification to `authoring-contract-auditor`).

## Checklists

### Structure (AGENTS.md: Required Block Structure)

- [ ] Block folder exists at `blocks/<block-name>/`
- [ ] `<block-name>.js` exists with single default export `export default function decorate(block) {}`
- [ ] `<block-name>.css` exists with block-scoped styles
- [ ] `README.md` exists with required sections (Overview, DA.live integration, Configuration, Behavior, Accessibility, Troubleshooting, Authoring examples)
- [ ] `_<block-name>.json` exists with `definitions`, `models`, `filters` arrays matching the authoring table shape

### Security (AGENTS.md: Security Requirements) — MANDATORY, highest priority

- [ ] All authored URLs validated against safe protocols: `http:`, `https:`, `mailto:`, `tel:`, root-relative, relative, hash anchors
- [ ] Unsafe protocols explicitly blocked (`javascript:`, `data:`, `vbscript:`)
- [ ] URL validation uses `new URL(url, base)` with protocol check, or a shared `sanitizeUrl()` helper
- [ ] No `innerHTML` with unsanitized author content — use `createElement`/`textContent` for DOM construction
- [ ] `createContextualFragment` used only with safe template literals, never with raw author content
- [ ] All `target="_blank"` links include `rel="noopener noreferrer"`
- [ ] No raw authored `innerHTML` logged in `console.warn` messages

### Accessibility (AGENTS.md: Accessibility) — MANDATORY

- [ ] Semantic elements: `<button>` for actions, `<a>` for navigation (never `<div>` or `<span>` for interactive elements)
- [ ] Heading hierarchy: no skipped levels, single `<h1>` per page
- [ ] Meaningful `alt` on images (empty `alt=""` only for purely decorative images)
- [ ] `:focus-visible` states on all interactive elements (never remove focus outlines without visible replacement)
- [ ] `prefers-reduced-motion` respected for all transitions, animations, auto-play, and timers:
  ```css
  @media (prefers-reduced-motion: reduce) { .block-slide { transition: none; } }
  ```
- [ ] Minimum tap target: 44x44 px
- [ ] AA contrast for critical text and CTA states
- [ ] ARIA attributes used correctly on dynamic UI (`aria-expanded`, `aria-label`, `aria-busy`, `aria-controls`)

### Performance (AGENTS.md: EDS Loading Phases)

- [ ] LCP-critical images use `createOptimizedPicture(url, alt, true, breakpoints)` with `eager=true`
- [ ] Non-LCP images use `loading="lazy"`
- [ ] If block is in first section: minimal JS, no heavy imports, no drop-in initializers
- [ ] Third-party scripts isolated to `delayed.js` with 3-second `setTimeout`, not in block code
- [ ] Dynamic imports (`await import(...)`) for conditionally-loaded modules
- [ ] DOM reads batched before writes to avoid layout thrash
- [ ] Queries scoped to `block` (not `document`) except where architecturally necessary
- [ ] `contain: layout paint` considered for isolated blocks

### Metadata contract (AGENTS.md: Metadata Contract Rules)

- [ ] Block-specific keys use compact block prefix: `<blockprefix>-<field>` (e.g., `herocta-align`)
- [ ] No generic keys (`align`, `size`, `density`) — always prefix
- [ ] No `data-` in author-facing metadata key names
- [ ] `getConfigValue()` helper used for config resolution (not inline `||` chaining)
- [ ] Double-prefix reading implemented: `section.dataset.heroctaAlign` AND `section.dataset.dataHeroctaAlign`
- [ ] 5-tier precedence order: Layout -> Content/Structure -> Style/Shape -> Color/Overrides -> Media/Motion
- [ ] Higher tiers cannot be silently broken by lower tiers
- [ ] No-op combinations detected and logged with block-prefixed warning
- [ ] All values normalized with safe fallbacks: `normalizeX(value, fallback)`
- [ ] Resolved values persisted to `block.dataset.*` for CSS stability
- [ ] Adobe native section metadata (`Style`, `Padding`, `Margin`) kept distinct from custom block metadata

### Lifecycle (AGENTS.md: Loading and lifecycle)

- [ ] `decorate(block)` is idempotent — safe to call twice without duplicating markup, listeners, or timers
- [ ] Explicit loading state using `data-loading` attribute
- [ ] Loading state removed on success/error with timeout fallback (3-second cap)
- [ ] Timers and listeners cleaned up on re-decoration or disconnect
- [ ] `visibilitychange` listener pauses auto-play/timers when page is hidden
- [ ] Delegated listener on block preferred over many individual listeners
- [ ] `document`/`window` listeners use `AbortController` signal and abort on disconnect
- [ ] Race conditions guarded if block re-decorated, moved, or removed before async work finishes
- [ ] Authored fallback content preserved until replacement UI is ready

### Error handling (AGENTS.md: Error handling and resilience)

- [ ] Missing content/config renders safe fallback (hide section or show placeholder), never throws
- [ ] `console.warn` with block-name prefix for invalid metadata or missing content
- [ ] Consistent warning shape: `blockname: invalid <key>="<value>"; expected <allowed>; using "<fallback>"`
- [ ] No silent failures with bare `return` — always warn
- [ ] Drop-in render errors handled gracefully (if applicable)

### CSS discipline (AGENTS.md: CSS Rules)

- [ ] Data-attribute variants (`[data-align='center']`), not ad-hoc utility classes
- [ ] Block-scoped class selectors with block prefix (`.hero-cta-content`, not `.content`)
- [ ] Specificity ordered low-to-high: base -> data-attribute -> compound
- [ ] Design tokens (`var(--color-brand-500)`) over hardcoded values
- [ ] Modern color notation (`rgb(0 0 0 / 55%)`)
- [ ] No `transition: all` — transition only relevant properties
- [ ] No `!important` unless documented and justified
- [ ] Floating/overlay elements: `box-sizing: border-box`, `max-width: 100%`, parent-aware width clamps

## Output format

When auditing or reviewing, emit findings using the shared finding schema from `_contracts/finding-schema.md`. When creating/implementing, produce:

- Block JS file implementing all checklist requirements
- Block CSS file with proper variant model and design tokens
- README with required sections (delegate deep verification to `authoring-contract-auditor`)
- `ue/models/blocks/block-name.json` with definitions/models/filters matching the authoring table shape
- Any findings about pre-existing issues encountered during the work

## Cross-skill awareness

| Action | Delegate to |
|--------|------------|
| Deep metadata/README alignment verification | `authoring-contract-auditor` |
| Lint execution and build pipeline validation | `quality-gate-runner` |
| Responsive geometry sweep across viewports | `visual-geometry-auditor` |
| Drop-in initializer wiring (if commerce block) | `dropin-integrator` |

**Owns**: Block JS/CSS implementation, scaffold contract, in-block security, accessibility, performance, lifecycle, error handling, CSS discipline.

## Evidence patterns

- **Security**: Show the exact line where URL is used without sanitization or `innerHTML` receives author content.
- **Accessibility**: Identify specific elements missing `:focus-visible`, semantic markup, or ARIA attributes.
- **Metadata**: Show config resolution code and compare to README table — are keys, tiers, and defaults aligned?
- **Lifecycle**: Show where listeners are added without corresponding cleanup, or where `decorate()` would duplicate on re-call.
- **Performance**: Identify eager-phase blocks with heavy imports or non-LCP images loaded eagerly.

## Inspect

- `blocks/<block>/` — target block folder
- `AGENTS.md` — canonical rule source
- `component-definition.json`, `component-models.json`, `component-filters.json` — DA.live aggregated configs
- `ue/models/component-definition.json` — block registration source
- `styles/styles.css` — design token definitions
- `scripts/aem.js` — `createOptimizedPicture` and EDS utilities

## Produce

- Block JS/CSS implementation
- `ue/models/blocks/block-name.json` alignment
- README alignment
- Metadata precedence and warning behavior
- Findings in shared schema for any pre-existing issues

## Avoid

- Unrelated route or drop-in changes when the task is block-scoped
- Repo-wide refactors when the request targets a single block
- Opportunistic rewrites of surrounding code during micro-fixes
- Adding features beyond what was requested
- Using Preact/HTM when plain JS suffices (AGENTS.md: Plain JS vs Preact/HTM)
