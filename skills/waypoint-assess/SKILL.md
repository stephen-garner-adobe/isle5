---
name: waypoint-assess
description: Use when performing a storefront-wide Adobe Commerce assessment in repositories like isle5, producing a principle-based, best-practice readiness report that covers the full implementation surface — not just blocks, but pipeline, data flow, config, drop-in lifecycle, cross-block integration, analytics, SEO, and operational readiness.
---

# Waypoint Assess

Use this skill as the storefront-wide best-practice assessment orchestrator.

Unlike a direct checklist ("does the header exist?"), this assessment evaluates whether each surface meets **principle-level best practice** — not just presence, but correctness, resilience, and alignment with the contracts defined in `AGENTS.md`.

The taxonomy covers the full implementation surface: blocks are important, but they sit inside an EDS pipeline, a commerce data layer, a CI/CD system, and an authoring workflow. A senior architect assesses all of these, not just the JavaScript.

## Core workflow

1. Read `AGENTS.md` as the canonical rule source. All best-practice expectations derive from it.
2. Read `README.md`, `package.json`, `config.json`, `fstab.yaml`, `head.html`, and CI workflows for environment and pipeline context.
3. Inspect all relevant surfaces — blocks, scripts, initializers, config, pipeline, tests, docs, git state.
4. Evaluate each surface against the concern domains below — not just "is it there?" but "does it meet the bar?"
5. Classify every finding by severity and confidence.
6. Map inter-dependencies between domains (e.g. a config issue that makes a route unreachable, or a pipeline gap that breaks DA.live authoring).
7. Group findings into actionable remediation packages with explicit next-step commands.
8. For findings requiring deep specialist work, emit delegation notes (which sub-skill to invoke) rather than attempting the fix directly.

## Concern domains

Evaluate every surface against these concern domains. Each domain has principle-level questions — the assessor should answer them with evidence, not assumptions.

---

### 1. Accessibility & Inclusivity
- Are all interactive elements keyboard-accessible (`<button>` for actions, `<a>` for navigation)?
- Do images have meaningful `alt` attributes (not generic "image")?
- Is heading hierarchy correct (single `<h1>`, no skipped levels)?
- Do `:focus-visible` states exist on all interactive elements?
- Is `prefers-reduced-motion` respected for transitions and animations (including hero rotation, carousel auto-play, slide transitions)?
- Are tap targets at least 44×44px?
- Does color contrast meet AA minimum for critical text and CTAs?
- Are ARIA attributes (`aria-expanded`, `aria-label`, `aria-busy`, `aria-controls`) used correctly on dynamic UI (nav toggles, cart panels, search dropdowns, modal dialogs)?
- Do modal/overlay patterns trap focus and restore focus on close?
- Are screen-reader announcements provided for cart count changes, search results loading, and async state transitions?

### 2. Performance & Loading Phase Correctness
- Is LCP imagery loaded eagerly (`createOptimizedPicture` with `eager=true` for hero/first-section images)?
- Are non-LCP images lazily loaded?
- Is the first section kept minimal (few blocks, no heavy JS, no drop-in initializers in eager phase)?
- Are third-party scripts isolated to `delayed.js` with the 3-second `setTimeout`?
- Are dynamic imports used for conditionally-loaded drop-ins (search, mini-PDP, checkout, wishlist) rather than static imports in eager/lazy blocks?
- Is the eager/lazy/delayed phase assignment correct per block? Specifically:
  - Eager: only `aem.js`, `scripts.js`, `commerce.js`, and essential config
  - Lazy: header, footer, section blocks, commerce initializers
  - Delayed: analytics, AEP, demo inspector
- Are `modulepreload` links in `head.html` limited to truly critical paths?
- Does `head.html` import map include only the drop-in packages actually used?
- Is font loading conditional (`sessionStorage` check, desktop-first) to avoid blocking LCP?
- Are `prerender` speculation rules correctly scoped in `head.html`?

### 3. Security
- Are all authored URLs validated against safe protocols (`sanitizeUrl()` or equivalent, blocking `javascript:`, `data:`, `vbscript:`)?
- Is `innerHTML` avoided for unsanitized author content? Inspect `createContextualFragment` usage — is it constructing safe template literals or injecting user content?
- Do `target="_blank"` links include `rel="noopener noreferrer"`?
- Are secrets, API keys, GraphQL endpoints with embedded credentials, and auth tokens absent from committed code?
- Is CSP in `head.html` appropriately restrictive (`script-src 'nonce-aem' 'strict-dynamic'`, `object-src 'none'`, `base-uri 'self'`)?
- Are scope and auth boundaries respected for drop-in instances (no leaking cart state across websites)?
- Does `loadErrorPage()` reconstruct DOM safely (recreating scripts, not injecting arbitrary content)?
- Is the session storage config (`getConfigFromSession`) handling expiry and stale data correctly?

### 4. Metadata Contract Correctness
- Are block-specific metadata keys properly prefixed (`<blockprefix>-<field>`)?
- Is Adobe native section metadata kept distinct from custom block metadata (not renaming `Style`, `Padding`, etc.)?
- Is resolution precedence deterministic and documented (Layout → Content → Style → Color → Media)?
- Do normalizers validate values and fall back safely with actionable warnings?
- Are warnings block-prefixed and actionable (`blockname: invalid <key>="<value>"; expected <allowed>; using "<fallback>"`)?
- Is double-prefix key reading implemented (`section.dataset.heroctaAlign` AND `section.dataset.dataHeroctaAlign`)?
- Are resolved values persisted to `block.dataset.*` for CSS stability?
- Does `hasConfigValue()` correctly detect when a value is explicitly set vs. defaulting, for no-op/conflict detection?
- Are conflict and no-op conditions warned clearly (e.g., sidebar + full-width, link style + border radius)?

### 5. Resilience & Error Handling
- Is `decorate(block)` idempotent — safe to re-run without duplicating markup, listeners, or timers? (Check for cleanup patterns like `block.__headerCleanup`, `AbortController.signal`.)
- Do async blocks guard against race conditions if re-decorated, moved, or removed?
- Is fallback authored content preserved until replacement UI is ready (no blank screens during loading)?
- Are missing content or config handled with safe fallbacks and actionable warnings, not bare `return`?
- Are timers and listeners cleaned up on disconnect or visibility change?
- Is loading state explicit (`data-loading`) with timeout fallbacks (3-second cap)?
- Does the commerce init path handle failures gracefully (`loadErrorPage(418)` for config failures, not blank screens)?
- Are drop-in event bus subscriptions cleaned up (`.off()`) on block teardown to prevent memory leaks?
- Is the `418.html` and `404.html` error page path correct and the content meaningful?

### 6. Authoring & DA.live Alignment
- Does each block have `README.md`, `_block-name.json`, `.js`, and `.css`?
- Does `_block-name.json` match the actual authoring table shape (rows, columns, `behaviour`)?
- Does the README include all required sections (Overview, DA.live integration, Configuration options, Behavior patterns, Accessibility notes, Troubleshooting, Authoring examples)?
- Does the README include both DA.live Model Options and Section Metadata Reference tables?
- Are Section Metadata Reference tables 3-column (key, possible values, effect) with defaults documented in the effect text?
- Is the Section Metadata Reference grouped by functional area and does it mirror the precedence contract?
- Are component definition/model/filter registrations current (`npm run build:json` output matches source `_*.json` files)?
- Is the `_component-definition.json` group mapping (Default Content, Sections, Blocks, Product) correct for all blocks?
- Are block folder names consistent with definition IDs and model IDs?

### 7. DOM & Code Craft
- Are queries scoped to `block` (not `document`) except where architecturally necessary (e.g., header nav)?
- Where `document` or `window` queries are needed, is the scope justified and documented?
- Are DOM reads batched before writes to avoid layout thrash?
- Is state local to the block instance (not `window` or global vars), with the exception of legitimately global state (e.g., `window.index`, `window.placeholders`, `window.adobeDataLayer`)?
- Are delegated listeners preferred over many individual listeners?
- Do `document`/`window` listeners use `AbortController` or equivalent cleanup?
- Is `contain: layout paint` considered for isolated blocks?
- Is `getConfigValue()` used instead of inline `||` chaining for config resolution?
- Is `readBlockConfig()` used consistently for block config, not ad-hoc dataset reads?
- Are event bus subscriptions (`events.on()`) paired with `events.off()` or guarded to prevent stacking?

### 8. Visual & Responsive Geometry
- Do layouts pass a geometry sweep at 360, 390, 414, 480, 768, 1024, 1280, 1440, 1920?
- Is hard overflow/clipping > 2px treated as a defect?
- Are floating/overlay elements clamped (`max-width: 100%`, `box-sizing: border-box`, parent-aware width)?
- Do variants use data attributes (`data-align='center'`) not ad-hoc utility classes?
- Do overlays (mini-cart panel, search dropdown, auth dropdown, modals) stay within viewport bounds at all widths?
- Does mobile sidebar/menu navigation prevent body scroll when open (`overflow: hidden` on body)?

### 9. CSS & Design Token Discipline
- Are selectors block-scoped with a block prefix (e.g., `.hero-cta-content`, not `.content`)?
- Is specificity ordered low-to-high (base → data-attribute → compound data-attribute)?
- Are design tokens used instead of hardcoded values (`var(--color-brand-500)`, `var(--spacing-3)`)?
- Is `!important` absent unless documented and justified?
- Is `transition: all` avoided in favor of specific properties?
- Are shorthand properties used where stylelint expects them?
- Are responsive breakpoints consistent with the project's design token grid (`--grid-*` breakpoints)?

### 10. Route & Commerce Readiness
- Are critical routes (home, PLP, PDP, cart, checkout, account, search, wishlist, order history) covered by smoke specs?
- Are drop-ins using the correct endpoint (`CS_FETCH_GRAPHQL` for catalog/search, `CORE_FETCH_GRAPHQL` for auth/cart/checkout)?
- Does `initializeDropin()` guard against re-initialization?
- Are drop-in render calls structured correctly (curried `render.render(Component, props)(container)`)?
- Are route-specific page metadata requirements documented for blocks on critical paths?
- Does page type detection (`detectPageType`) correctly identify all route types and trigger the correct initializers?
- Are cart state transitions handled correctly (cart empty → redirect, cart merge for guest-to-auth, stale cart cleanup on website switch)?
- Is the `/checkout` mini-cart exclusion list maintained as routes change?
- Are guest vs. authenticated flows tested (guest checkout, account creation, forgot password, order status lookup)?

### 11. Documentation & Contract Alignment
- Does README documentation match actual implementation behavior?
- Is the precedence contract in README identical in terminology and order to the code?
- Are override rules, conflict matrices, and no-op notes documented where applicable?
- Are route/page metadata requirements documented for route-specific blocks (Robots, Cache Control, page title)?
- Is there at least one literal authoring example per block showing the actual DA.live table structure?
- For route-specific blocks (cart, checkout, account), does the README document required route assumptions and any page metadata?

---

### 12. EDS Pipeline & Infrastructure
- Is `fstab.yaml` correctly pointing to the DA.live content source and are folder mappings (`/products/`) correct?
- Is `head.html` import map consistent with the actual drop-in packages installed (no stale or missing entries)?
- Are `modulepreload` links limited to critical-path modules actually needed during eager phase?
- Does `build:json` (`component-definition.json`, `component-models.json`, `component-filters.json`) match the source `_*.json` files? Is the build run as a pre-commit hook?
- Does `postinstall.js` correctly sync drop-in assets from `node_modules` to `scripts/__dropins__/`?
- Is `build.mjs` (GraphQL override builder) producing correct output and are overrides intentional, not accidental drift?
- Are unused drop-in imports stripped (no import of a drop-in that's not rendered on the route)?
- Are the GitHub Actions workflows current and passing (`check-block-readme.yaml`, `protect-aem-js.yaml`, etc.)?
- Is the `.hlxignore` file correctly configured for AEM CLI preview?

### 13. Drop-in Lifecycle & Event Bus Health
- Is the event bus used correctly (`events.on()`, `events.lastPayload()`, `{ eager: true }` where needed) without subscription leaks?
- Are event subscriptions cleaned up on block teardown (`subscription.off()`) or guarded with `AbortController`?
- Is the initializer order in `scripts/initializers/index.js` correct (auth → cart → global placeholders, then lazy imports)?
- Does `initializeDropin()` guard against re-initialization correctly (including `prerenderingchange` handler)?
- Are cross-drop-in dependencies respected (e.g., cart must init before checkout, auth must init before account)?
- Is `events.enableLogger(true)` appropriate for production, or should it be gated behind a dev/debug flag?
- Does `notifyUI('lcp')` fire at the right time (after eager phase completes)?
- Are `prerenderingchange` handlers correctly registered with `{ once: true }` to avoid stacking?

### 14. Commerce Data Flow Integrity
- Is `CORE_FETCH_GRAPHQL` consistently used for auth, cart, account, and checkout endpoints (never `CS_FETCH_GRAPHQL`)?
- Is `CS_FETCH_GRAPHQL` consistently used for catalog, search, and recommendations (never `CORE_FETCH_GRAPHQL`)?
- Are auth headers set/unset correctly on login/logout (Bearer token, customer group header)?
- Is the `AC-Price-Book-ID` header set conditionally only when ACO is configured?
- Does `commerceEndpointWithQueryParams()` produce valid, cache-busted URLs?
- Is the config session cache (`getConfigFromSession`) handling expiry correctly (2-hour TTL, re-fetch on stale)?
- Is website-switching cart invalidation working (clearing `DROPIN__CART__*` session/local storage on root path change)?
- Are product URL construction (`getProductLink`, `sanitizeName`) and route patterns (`/products/{urlKey}/{sku}`) consistent across PLP, PDP, search, and mini-PDP?
- Is `fetchPlaceholders()` correctly deduplicating requests and merging path-specific with fallback placeholders?
- Does `trackHistory()` respect consent gating correctly (currently returns `true` unimplemented — is this acceptable)?

### 15. Cross-Block & Cross-Cutting Integration
- Does the header correctly lazy-load mini-cart and search fragments on first interaction?
- Are mini-cart cart count subscriptions (`events.on('cart/data', ...)`) cleaned up on header teardown?
- Does the mini-cart exclusion list (`excludeMiniCartFromPaths`) stay current as routes are added/renamed?
- Does the search popover correctly initialize the search drop-in (`CS_FETCH_GRAPHQL` endpoint) on first open and not re-render on subsequent opens?
- Are modal/overlay z-index stacks managed so that mini-cart, search, auth dropdown, and nav overlay don't conflict?
- Does `loadFragment()` for navigation handle authoring paths correctly (metadata `nav` reference, fallback `/nav`)?
- Is the `autolinkModals()` click handler in `loadCommerceLazy()` correctly delegating `/modals/` links to the modal block?
- Are static import side effects (e.g., `import '../../scripts/initializers/cart.js'` in commerce-cart) intentional and not causing eager-loading bloat?
- Does the mini-PDP shared component (`scripts/components/commerce-mini-pdp/`) work correctly from both cart and wishlist contexts?

### 16. Config & Environment Surface
- Is `config.json` correctly structured for the target environment (endpoints, store headers, analytics, ACO config)?
- Are demo configs (`demo-config.json`, `demo-config-aco.json`) intentional overrides, not stale copies?
- Does `default-site.json` contain placeholder values only (no real endpoints or keys)?
- Is the `prerender` speculation rule in `head.html` scoped appropriately (`href_matches: "/*"` may be too broad)?
- Are there environment-specific config differences (SaaS vs PaaS Cypress configs, different base URLs)?
- Is `UPS_TRACKING_URL` in `commerce.js` configurable or hardcoded for a specific carrier?

### 17. Analytics & Trackability
- Is AEP data layer (`window.adobeDataLayer`) initialized correctly in `loadCommerceEager()` before drop-ins push events?
- Does `delayed.js` gate analytics initialization on consent (`getConsent('commerce-collection')` is currently unimplemented — returns `true` always)?
- Are storefront event subscriptions (search, product-view, add-to-cart, checkout, place-order) tested in Cypress?
- Is the ACDL script loaded in lazy phase (not eager) to avoid blocking LCP?
- Are analytics config fields (`store-code`, `environment-id`, `website-id`, etc.) present and correct in `config.json`?
- Does `trackHistory()` localStorage access handle quota errors and private browsing mode gracefully?

### 18. SEO & Structured Data
- Is `setJsonLd()` used for product, breadcrumb, and organization structured data?
- Does the PDP block detect prerendered JSON-LD and avoid duplication?
- Is `document.documentElement.lang` set correctly in `loadEager()` for internationalization?
- Are product URLs (`getProductLink`) SEO-friendly and consistent across PLP, PDP, search, and recommendations?
- Is the `default-query.yaml` search configuration valid and aligned with the catalog?
- Is the sitemap (`sitemap-index.xml`, `default-sitemap.yaml`) correctly configured?

### 19. Error Paths & Fallback Surfaces
- Does `loadErrorPage(418)` correctly handle the commerce init failure path (reconstructing scripts, not just swapping `innerHTML`)?
- Does `loadErrorPage(404)` redirect correctly?
- Does fragment loading (`loadFragment()`) handle missing fragments gracefully with a warning (not a blank page)?
- Do drop-in initializers handle API failures (network errors, 401, 403) without leaving the page in a broken loading state?
- Is `getConsent()` implemented meaningfully, or is it a stub (`return true`) that needs production gating?
- Do blocks handle the case where `fetchPlaceholders()` returns empty data (missing i18n labels, fallback text)?

### 20. Operational & CI/CD Readiness
- Is `npm run lint` passing for both JS and CSS?
- Is `npm run build:json` producing consistent output (are built files committed and in sync with source)?
- Is the pre-commit hook (`husky`) running `build:json` and staging the output?
- Does `npm run install:dropins` correctly sync all required drop-in modules?
- Are Cypress E2E tests passing for all critical routes (PaaS and SaaS configs)?
- Is Percy visual regression configured and tracking key pages?
- Does the `check-block-readme.yaml` workflow catch blocks missing READMEs?
- Does the `protect-aem-js.yaml` workflow prevent direct edits to `scripts/aem.js`?
- Is `scripts/aem.js` protected from modification (it's the EDS core, not a local customization)?
- Are there any dead or unused drop-in imports that increase bundle size?
- Is `default-site.json` valid for the site creator tool with no real credentials?

## Severity classification

| Level   | Meaning                                                                               |
|---------|---------------------------------------------------------------------------------------|
| Blocker | Violates a MUST rule; will cause accessibility, security, or runtime failures        |
| Warning | Violates a SHOULD rule; degrades quality, DX, or maintainability                     |
| Advisory| Violates a MAY/preference; improvement opportunity but not defect                     |

## Confidence classification

| Level     | Meaning                                                            |
|-----------|--------------------------------------------------------------------|
| Verified  | Directly observed in code/artifacts with evidence                  |
| Inferred  | Likely true based on patterns, but not directly confirmed          |
| Unchecked | Could not verify with available artifacts; requires manual review  |

## Sub-skill delegation

When a finding requires specialist depth, note delegation rather than fixing directly:

| Finding type                        | Delegate to                    |
|-------------------------------------|--------------------------------|
| Metadata precedence/naming drift    | `metadata-contract-checker`    |
| Visual/geometry defects             | `visual-geometry-auditor`      |
| Route smoke gaps                    | `route-smoke-auditor`          |
| DA.live/README drift                | `authoring-docs-sync`          |
| Drop-in wiring issues               | `dropin-integrator`            |
| Config/environment issues           | `commerce-config-doctor`        |
| Upstream sync questions             | `upstream-drift-reviewer`      |

## Cross-domain dependency mapping

When findings span domains, note the dependency so remediation ordering is correct:

- **Config → Data flow**: Wrong endpoint in `config.json` makes all commerce blocks fail regardless of block code quality.
- **Pipeline → Authoring**: Stale `build:json` output means DA.live shows wrong models regardless of correct `_*.json` source.
- **Event bus → Cross-block**: Leaking `cart/data` subscriptions in header causes stale UI in mini-cart regardless of mini-cart code quality.
- **Initializer order → Route**: If auth init fails, checkout, account, and wishlist are unreachable regardless of their block code.
- **CSP → Security**: Overly permissive CSP negates all URL sanitization in block code.
- **Consent gate → Analytics**: Unimplemented `getConsent()` means all analytics fire regardless of user preference, creating compliance risk.

## Output format

Produce a structured assessment with:

1. **Executive summary** — overall readiness state (ready / ready with warnings / not ready) and top-line counts by severity.
2. **Architecture overview** — brief characterization of the implementation: what phase model it uses, what drop-ins are wired, what routes are active, what the config surface looks like. This orients the reader before diving into findings.
3. **Findings by concern domain** — each finding includes:
   - Concern domain (from the taxonomy above)
   - Severity (Blocker / Warning / Advisory)
   - Confidence (Verified / Inferred / Unchecked)
   - Evidence (file:line or artifact reference)
   - Principle violated (cite the AGENTS.md rule)
   - Cross-domain dependencies (if this finding affects or is affected by other domains)
   - Remediation (action or delegation note)
4. **Remediation packages** — grouped, ordered action sets with:
   - Prerequisite dependencies between actions
   - Which actions can be parallelized
   - Delegation notes for specialist sub-skills
   - Next-step commands for Codex or developers
5. **Unchecked items** — concerns that could not be verified automatically, grouped by domain
6. **Domain dependency graph** — which domains affect which, so the team understands blast radius

## Inspect

- `AGENTS.md` (canonical rule source)
- `README.md` (project context)
- `package.json` (dependencies, scripts, drop-in versions)
- `config.json`, `demo-config.json`, `demo-config-aco.json` (commerce configuration)
- `fstab.yaml` (DA.live mountpoint)
- `head.html` (CSP, import map, modulepreload, speculation rules)
- `blocks/` (all block implementations)
- `scripts/` (initializers, utilities, delayed.js, commerce.js, aem.js)
- `scripts/initializers/` (drop-in lifecycle and event bus)
- `models/` and `_*.json` files (DA.live contracts)
- `component-definition.json`, `component-models.json`, `component-filters.json` (built output)
- `cypress/` (test coverage)
- `.github/workflows/` (CI/CD)
- `build.mjs` (GraphQL overrides)
- `default-site.json`, `sitemap-index.xml`, `default-query.yaml` (SEO and site config)
- Config files and git surfaces

## Avoid

- Acting like a generic lint wrapper — this is principle-based, not pattern-matching
- Mutating code directly when the right outcome is a Codex-ready plan or delegation
- Emitting findings without severity, confidence, or principle citation
- Treating the taxonomy as a simple checklist — each item is a best-practice question, not a box to tick
- Assessing blocks in isolation without considering the pipeline, data flow, and cross-cutting integration they depend on
- Ignoring the operational layer (CI checks, build pipeline, config management) that determines whether correct code actually ships correctly