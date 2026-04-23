# Isle5 Storefront Assessment

Date: 2026-04-20

Assessor: `storefront-site-assessor`

Repo: `isle5`

## Executive Summary

Overall score: **74/100**

Assessment: **Ready with warnings**

This repo is structurally healthy and operationally usable. The baseline engineering hygiene is good: all 51 blocks have the expected implementation surfaces, root lint passes cleanly, the JSON build pipeline is configured, and the storefront has meaningful route-level Cypress coverage. The strongest parts of the repo are the shared commerce initializer layer, complete block folder scaffolding, and a growing set of newer blocks with stronger README and metadata contracts.

The main quality debt is concentrated in four areas:

1. shared DOM construction still contains an unsafe HTML insertion path;
2. route-critical UI geometry has known runtime regressions at narrow widths;
3. many async commerce blocks rely on console logging rather than resilient user-facing fallback states;
4. README and metadata-contract quality is inconsistent across the block inventory.

Waypoint summary:

- 51 blocks scanned
- 200 findings total
- 0 blockers
- 57 warnings
- 143 advisories
- 11/13 route areas covered by Cypress
- ESLint: pass
- Stylelint: pass

## Findings

`High | shared-runtime | scripts/aem.js | Shared block builder still appends string content through innerHTML | Any caller that passes author-controlled string fragments into buildBlock can bypass the repo’s stated HTML safety contract and reintroduce injection risk in a central utility | Replace string insertion with DOM-safe assembly or explicitly sanitize before insertion`

Evidence:
- `scripts/aem.js:550` uses `colEl.innerHTML += val;`

`High | header/top-banner runtime | cypress/tmp/viewport-audit.json | Mobile header controls overflow the viewport at 320-390px and the top-banner ticker does not move across the audited widths | This affects the storefront’s global navigation and announcement surfaces, which are user-critical entry points on mobile | Fix header control geometry and top-banner animation state, then rerun the viewport audit across the full sweep`

Evidence:
- `cypress/tmp/viewport-audit.json` reports `nav-search-button` leaking `36px` at `320`
- `cypress/tmp/viewport-audit.json` reports `nav-dropdown-button` leaking `92px` at `320`, `52px` at `360`, and `22px` at `390`
- `cypress/tmp/viewport-audit.json` reports `ticker-not-moving` from `320` through at least `768`
- `cypress/tmp/header-layout-debug.json` shows the header grid at `1264px` with a brand region height of `80.140625` inside a `64px` nav container, which suggests fragile layout geometry even outside mobile

`Medium | route-critical resilience | blocks/commerce-* | Many async commerce blocks have no local try/catch discipline or rely on console.error without a visible fallback state | Failures in auth, account, cart, order, or checkout flows may degrade silently for users while appearing only in dev tools | Add user-visible error states and targeted try/catch coverage around mount/update flows, prioritizing cart, checkout, account, order, and wishlist`

Evidence:
- Waypoint flagged widespread async error-handling gaps across `blocks/commerce-addresses/commerce-addresses.js`, `blocks/commerce-cart/commerce-cart.js`, `blocks/commerce-checkout-success/commerce-checkout-success.js`, `blocks/commerce-login/commerce-login.js`, `blocks/commerce-orders-list/commerce-orders-list.js`, and many similar route-critical blocks
- `blocks/commerce-checkout/commerce-checkout.js:153`
- `blocks/commerce-checkout/containers.js:152`
- `blocks/product-list-page/product-list-page.js:85`

`Medium | authoring-contract drift | blocks/**/README.md | README quality is inconsistent across the inventory and many blocks do not yet reflect the stronger metadata/precedence contract now expected in AGENTS.md | Authoring predictability and future agent work will drift because behavior is not documented at the same quality level as implementation | Normalize README coverage for route-critical and metadata-heavy blocks first, then finish the presentational blocks`

Evidence:
- All 51 blocks have README files, but only `20/51` include `Section Metadata Reference`
- Only `18/51` include `DA.live Model Options`
- Only `16/51` include `Metadata Precedence`
- Only `5/51` include `Override Rules`
- Only `2/51` include `Conflict Matrix`
- Example stronger docs: `blocks/header/README.md`, `blocks/hero-cta/README.md`, `blocks/promotional-hero/README.md`
- Example older-style docs: `blocks/commerce-cart/README.md`

`Medium | CSS discipline and maintainability | blocks/store-locator/* and selected shared surfaces | CSS debt is concentrated in the largest, most stateful UI surfaces, especially store locator, footer, header, and checkout overlays | These patterns increase regression risk when adjusting responsive layout, stacking, and overlays | Reduce !important usage, replace ad hoc z-index values with a scale, and break oversized CSS and JS into smaller modules`

Evidence:
- `blocks/store-locator/store-locator.js` is `3453` lines
- `blocks/store-locator/store-locator.css:11` documents `z-index: 9999`
- `blocks/store-locator/store-locator.css:1807`
- `blocks/store-locator/store-locator.css:1841`
- `blocks/footer/footer.css:28`
- `blocks/footer/footer.css:29`
- `blocks/header/header.css:14`

`Medium | search/plp implementation contract | blocks/product-list-page/product-list-page.js | PLP/search behavior works but still uses fragment parsing plus console-only error fallback in a route-critical shopping surface | Search and product discovery issues may fail without a user-facing recovery path, and the implementation diverges from the stricter DOM-safety guidance now codified in the repo | Replace contextual fragment creation with explicit DOM assembly where practical and add visible empty/error handling for failed search requests`

Evidence:
- `blocks/product-list-page/product-list-page.js:32` uses `createContextualFragment(...)`
- `blocks/product-list-page/product-list-page.js:79-97` catches search failures with `console.error(...)` only

## Block Compliance Matrix

| Area | Status | Notes |
| --- | --- | --- |
| Required block file surfaces | Pass | 51/51 blocks include JS, CSS, README, and `_block.json` |
| Root lint gates | Pass | `npm run lint` completed cleanly |
| Build pipeline readiness | Pass | `npm run build:json` pipeline is configured and Waypoint validated it |
| Generated component registration model | Pass with caution | Registration flow exists, but new non-commerce blocks still depend on `models/_component-definition.json` updates |
| Shared drop-in initializer architecture | Pass | `scripts/initializers/` is present and follows the expected endpoint pattern |
| Route-level Cypress coverage | Partial pass | 11/13 route areas covered; Home and PDP remain uncovered in the current dashboard |
| README contract adoption | Partial pass | Newer blocks are strong; many commerce blocks still use older README patterns |
| Metadata precedence documentation | Partial pass | Present in 16/51 READMEs |
| Override/conflict documentation | Weak | Present in 5/51 and 2/51 READMEs respectively |
| DOM safety contract | Warning | Central `innerHTML` path remains in `scripts/aem.js`; selected blocks still use contextual fragment parsing |
| Async resilience | Warning | Large number of async commerce blocks lack local fallback/error-state discipline |
| Geometry verification | Warning | Existing runtime audit artifacts already show real header/top-banner defects |

## Score Breakdown

| Category | Score | Notes |
| --- | --- | --- |
| Repo hygiene and build health | 18/20 | Lint clean, pipeline configured, consistent block scaffolding |
| Commerce architecture | 16/20 | Shared initializers and helper layers are solid |
| Documentation and authoring contract | 12/20 | Good newer pattern, uneven repo-wide adoption |
| Runtime resilience | 11/20 | Error handling is too console-centric on critical routes |
| UI/CSS discipline | 9/10 | Generally workable, but concentrated debt exists in the most complex surfaces |
| Testing and verification | 8/10 | Good Cypress presence, but Home/PDP gaps and known geometry issues remain |
| Total | 74/100 | Ready with warnings |

## Route-Critical Risk Summary

Highest-risk route families:

1. Checkout and cart
   `blocks/commerce-checkout/*` and `blocks/commerce-cart/*` are central to conversion and contain console-only failure paths or async flows without strong local fallback handling.

2. Header and top-banner
   Global entry-point geometry is already known to regress at smaller widths from the stored Cypress audit artifacts.

3. Account, order, and returns
   These routes have decent block coverage but broad async error-handling debt across multiple blocks.

4. Search and PLP
   Product discovery is covered by tests, but the implementation still leans on fragment parsing and weak user-visible recovery behavior.

5. Store locator
   The feature is ambitious and useful, but it is now large enough that every future change carries elevated regression risk in CSS, layout, and third-party integration behavior.

## Recommended Remediation Backlog

### P0

1. Remove or harden shared `innerHTML` insertion in `scripts/aem.js`.
2. Fix header mobile overflow and top-banner ticker runtime behavior, then rerun the stored viewport audit suite.
3. Add visible fallback/error states to checkout, cart, login, account, and order blocks where failures currently stop at `console.error`.

### P1

1. Standardize README contract coverage for all route-critical commerce blocks.
2. Add Home and PDP route coverage to the Cypress dashboard, or document why those routes are intentionally excluded.
3. Refactor the largest JS surfaces:
   - `blocks/store-locator/store-locator.js`
   - `blocks/hero-cta/hero-cta.js`
   - `blocks/promotional-hero/promotional-hero.js`
   - `blocks/top-banner/top-banner.js`
   - `blocks/header/header.js`

### P2

1. Reduce `!important`, token drift, and ad hoc z-index patterns in `store-locator`, `footer`, `header`, and checkout overlay CSS.
2. Replace contextual fragment creation with explicit DOM assembly in route-critical blocks when touching those files next.
3. Continue migrating older block READMEs to the current metadata precedence and override model.

## Testing Gaps

- Waypoint reports route coverage at `11/13`.
- Home is not covered in the current route dashboard.
- PDP is not covered in the current route dashboard.
- The stored viewport audit already demonstrates real mobile header/top-banner defects, so geometry verification should be treated as incomplete until those artifacts are cleared.
- The repo has strong Cypress coverage for cart, checkout, account, wishlist, recommendations, search, and header, but less confidence on storefront entry and PDP behavior than the rest of the commerce funnel.

## Commands Run

```bash
npm run lint
npm run waypoint:assess
```

## Evidence References

- `scripts/aem.js`
- `blocks/product-list-page/product-list-page.js`
- `blocks/header/README.md`
- `blocks/commerce-cart/README.md`
- `blocks/store-locator/store-locator.js`
- `blocks/store-locator/store-locator.css`
- `cypress/tmp/viewport-audit.json`
- `cypress/tmp/header-layout-debug.json`
