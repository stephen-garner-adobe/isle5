# Isle5 local implementation status

30 October 2026 · branch `codex/isle5-redesign` · base `ae99f6f5`

## Implemented locally

- An opt-in `Theme: isle5` page model and conditionally loaded `styles/isle5.css`: dark surfaces, condensed typography, responsive gutters, status colours, visible focus and reduced-motion support. No permanent forced activation is present.
- Theme styling for header, footer, listing, product detail, cart, checkout, accordion, editorial columns and blog posts. The existing logo asset is retained on a light plate; catalogue photography retains its real colours.
- A static campaign hero with optional supporting rich text and explicit eager-image selection, campaign card insertion variant and chalk editorial section option. Existing authored shapes remain supported.
- A bounded, scoped Product Discovery product rail using installed public APIs, real catalogue images/prices, accessible product links, a safe collection fallback and timeout cleanup. This is catalogue discovery, not a promised newest-first merchandise feed. Its DA-authored rendering and multi-rail isolation still require browser verification before rollout.
- Shared authored URL validation for hero/cards, idempotent decoration and preserved rich content.
- Registration route helper corrected to the existing `/customer/create` source.
- Source authoring models and generated component JSON updated together; block authoring documentation and focused URL/count tests added.

Protected `scripts/aem.js`, generated vendor output, package versions/lifecycle scripts, endpoints and mount configuration are unchanged. Existing `AGENTS.md` and `.gitignore` edits are preserved and remain separate from runtime work. Nothing is committed, pushed, merged, deployed or published.

## Actual validation

| Check | Outcome |
| --- | --- |
| `npm run lint` | Pass after CSS selector-order fixes |
| `npm run build:json` | Pass; root JSON regenerated from `ue/models/` |
| `npm run check:ue` | Pass; model validation plus 5 tests |
| `node --test test/isle5-url-safety.test.mjs` | Pass; 4 tests for dangerous schemes, field allowlists, relative URLs and bounded counts; Node emits an existing package module-type warning |
| `git diff --check` | Pass |
| Actual local delivery | `npm start -- --no-open`, localhost:3000, local code proxying the real main-branch aem.page source; configured PaaS-style demo catalogue |
| Themed collection | Real `/apparel` source and 9 catalogue products rendered; mobile product-action overflow fixed; 0 horizontal overflow at CSS widths 360, 390, 414, 480, 768, 1024, 1280, 1440 and 1920px |
| Themed configurable PDP | Real `/products/ssg-configurable-product/ssgconfig123`, 0 horizontal overflow at those same 9 widths; blue option selected and Add to Cart became enabled; no cart mutation performed |
| Keyboard navigation | Mobile menu opened, Escape closed it, focus returned to navigation toggle with visible solid outline |
| Account and empty flows | `/customer/create` rendered labelled sign-up fields with no overflow; no submission. Empty cart rendered; empty checkout redirected to cart |
| Sorting | Price ascending selection changed the collection URL to `sort=price_ASC`; after reload the first results were $2.50, $4.75 and $4.75; some intermediate browser inspections timed out |
| Focused Cypress | Chrome/PaaS `verifyProductSearch.spec.js`, filtered to quick-search smoke; runner exited 134 before completing assertions. This is an infrastructure failure, not a pass |
| Unthemed regression | After removing temporary activation and reloading, theme class and theme stylesheet were absent, 9 products rendered, 0 horizontal overflow |
| Browser errors | Two JSON parse errors were captured in the existing `fetchIndex` path at `scripts/commerce.js:220`; that implementation is unchanged. The affected index response and full impact remain unresolved |
| DA writes and preview | None; blocked by the gates below |

Themed browser checks used a temporary local body class against existing delivered DA pages, removed before handoff. No authored HTML fixtures, debug theme query switch, backend data substitutions or remote source changes were used. Standalone prototype evidence is separate from these storefront checks.

## Required before DA activation

Authenticated Adobe Admin Console confirmed **EMEA Enterprise Architecture**, IMS organization ID `CC8B2205683E94010A495FD6@AdobeOrg`; DA was switched to that organization. MCP source reads succeed. The inspected source write grants are email-based and do not satisfy the organization-scoped rule in `AGENTS.md` and the local orchestrator. Effective EDS preview-only permissions/no publish grants and absence of automatic source publication remain unverified. No access controls were changed.

An administrator must provide or verify the required organization-scoped source authorization and preview boundary. Recheck the active session, exact targets, versions and automation before any MCP mutation. A successful read or selected organization alone is insufficient.

Once the gates pass, author the approved review composition through DA MCP: campaign home, category/collection intros, editorial/help content, safe draft shell fragments and product-template cleanup. Use the page/block map and authoring contracts; verify real catalogue category paths, links, metadata and assets. Keep the demo catalogue mismatch explicit. Do not apply shared production theme metadata or publish.

## Outstanding acceptance

- DA-authored home/hero/cards/product-rail examples, authoring UI insertion, optional/malformed-content states and multi-rail scope isolation.
- Full site navigation links, shared footer copy, actual product-template enrichment and editorial content are still the existing DA content.
- Browser verification of changed campaign/content blocks and populated cart/checkout/payment surfaces, long content, contrast in all states, 200% zoom, mobile filters, pagination/history and error recovery.
- Guest/authenticated wishlist, cart mutations, account/authentication journeys and transactional scenarios were not executed.
- Retry the focused Cypress smoke in a working runner. No Lighthouse/LCP score or automated accessibility certification is claimed.
- Feature-branch code delivery and exact aem.page preview remain unverified; localhost is not a deployed preview. Push/publication require separately explicit authorization.

The implementation is reviewable local code. It is not a completed DA-authored site rollout.

## Source-only draft saved — 2 November 2026

The user explicitly authorized the one-time source-only exception documented in
`agents/isle5-orchestrator/AGENT.md`. DA profile selection was rechecked as EMEA
Enterprise Architecture. Email-based source grants are accepted under the revised
policy; EDS access configuration returned 404, so preview/publish restrictions
and downstream automation remain unverified.

DA MCP created `/drafts/isle5-orchestrator/redesign/index.html` after its destination
folder listing returned empty. The draft contains campaign hero/cards, a real
catalogue-backed product-rail configuration, an editorial split, support links,
`Theme: isle5`, noindex/nofollow and no-store metadata. Existing source imagery is
reused as temporary campaign photography and the demo catalogue mismatch is
explicit. The original homepage, shell fragments and catalogue are unchanged.

DA returned this edit URL:
https://da.live/canvas#/stephen-garner-adobe/isle5/drafts/isle5-orchestrator/redesign/index

The source was read back through DA MCP. No preview, publication, media upload,
permission change or deployment was invoked. Tool-returned preview/live URLs are
not evidence that either environment was updated. Visual/browser acceptance of
this authored draft remains pending; local code has not been pushed.

## Runtime authoring compatibility fix — 2 November 2026

The saved source uses readable Product Rail table labels. The local runtime now
accepts their normalized hyphenated keys as well as the existing model property
names. This fixes the missing collection action that would otherwise leave the
rail unenhanced. Both forms and their precedence are documented. A regression
test compares model-generated and manually authored configurations.

Revalidation passed: `npm run lint`, `npm run check:ue` (5 tests),
`node --test test/isle5-url-safety.test.mjs` (5 tests), and `git diff --check`.
No model source changed in this fix. Code delivery and a DA preview still need
the separately requested authorization; no further source mutation was made.

## Commit and preview verification — 2 November 2026

Commit `0aed429b` contains the redesign implementation, models, documentation and
focused tests. The pre-commit model generation, model validation (5 tests) and
block README checks passed. Existing root `AGENTS.md` and `.gitignore` changes
were excluded and remain uncommitted.

The approved push to origin was rejected with HTTP 403 for the active GitHub
account `sgarner_adobe`. Interactive GitHub sign-in was started for the user;
no alternative account was used without user authentication. Branch delivery
remains pending until that sign-in and a successful push.

DA MCP preview succeeded for the exact approved draft and returned:
https://main--isle5--stephen-garner-adobe.aem.page/drafts/isle5-orchestrator/redesign/

This is the current main-code preview, not evidence that the redesign branch has
been delivered. The actual previewed DA source was tested with the local branch
code at:
http://localhost:3000/drafts/isle5-orchestrator/redesign/

The hero and campaign cards decorated, the product rail reached `loaded` with
four real catalogue products, and there was zero horizontal overflow at CSS
widths 360, 390, 414, 480, 768, 1024, 1280, 1440 and 1920px. Desktop and mobile
views were inspected in Chrome. The temporary viewport override was reset.
Shared navigation/footer content and temporary campaign imagery remain as
documented. No live publication, merge, permission change or additional DA
source write was invoked.

## Hosted redesign verified — 2 November 2026

GitHub web sign-in completed as `stephen-garner-adobe`. Retrying the approved
push succeeded, delivering commits `0aed429b` and `abce232a` on
`origin/codex/isle5-redesign`. The build check for `abce232a` passed; PaaS/SaaS
Cypress jobs were skipped by their workflow conditions, not counted as passes.

Verified branch preview:
https://codex-isle5-redesign--isle5--stephen-garner-adobe.aem.page/drafts/isle5-orchestrator/redesign/

The hosted page loads the isle5 stylesheet, decorates the hero/cards, renders
four real catalogue products and preserves noindex/nofollow. Browser checks at
375, 768 and 1440px found zero horizontal overflow, the rail remained loaded,
and no console errors were captured. Screenshots were inspected at those widths.
The temporary viewport override was reset. Earlier nine-width local draft
checks also passed. No live publication or merge occurred.

Only the existing root `AGENTS.md` and `.gitignore` changes remain outside the
redesign commits. The ignored local orchestrator retains the user-approved
exceptions. Temporary campaign photography, demo catalogue mismatch and
unmodified shared navigation/footer content remain explicit limitations.

## Main integration — 2 November 2026

The user requested one squashed redesign commit on `main`, a push to origin,
and removal of `codex/isle5-redesign`. The source branch had three commits;
all redesign changes are retained in the squash. Existing uncommitted root
`AGENTS.md` and `.gitignore` changes remain excluded.

The continuing review URL uses main rather than the removed feature branch:
https://main--isle5--stephen-garner-adobe.aem.page/drafts/isle5-orchestrator/redesign/

This is the previously previewed DA draft with the redesign code on main.
The original homepage and other DA sources remain unchanged. No content
publication is included in the main integration. Earlier branch-based URLs
and commit references above are historical evidence.
