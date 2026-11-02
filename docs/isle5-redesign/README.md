# Isle5 redesign build plan

Build the supplied monochrome city-to-trail design on the existing isle5 EDS storefront. Reuse the current Commerce wrappers and DA authoring contracts, introduce a reviewable theme, and keep page content in DA. Logo design, package upgrades, live publication, code pushes and merges are outside scope.

Planning baseline: 30 October 2026, branch `main`, commit `ae99f6f5`. Implementation has since started on `codex/isle5-redesign`; see the [implementation status](implementation-status.md) for completed local work and remaining gates.

## Current readiness

| Area | Finding | Consequence |
| --- | --- | --- |
| Repository | Existing content, product discovery, PDP, cart, checkout, account, wishlist and editorial implementations | Extend the existing implementation rather than transplanting the static prototype |
| DA target | `fstab.yaml` mounts `stephen-garner-adobe/isle5`; `/products/` maps to `/products/default` | Preserve mount and product-template ownership |
| DA MCP | Retried successfully on 30 October 2026: root/products/customer/blog/placeholders listed; representative sources read | Read-only source inspection completed for 17 representative documents/sheets; remaining identity, authorization and preview checks still gate writes |
| Required identity | EMEA Enterprise Architecture ID verified in Admin Console and selected in DA; source write grants inspected are email-based | Organization-scoped authorization, effective preview-only permissions and source safety still block remote mutations |
| Commerce | Repository configuration declares separate core and catalog endpoints on `www.aemshop.net`; installed versions match the lockfile | This looks like a PaaS-style integration, but backend type and supported test services still require confirmation |
| Delivery | Feature branch, Code Sync mapping, preview access and automatic-publication settings have not been verified | Do not claim a usable feature-preview URL or isolated content environment |

Recover expired DA MCP authentication through interactive web sign-in, never by looking for a client secret or copied token. This was completed successfully using `codex mcp login da_mcp`. The first active connection retry failed, but the later retry successfully listed site sources and read the homepage; no additional login was required for that retry. Do not repeat sign-in prompts indefinitely or treat successful login as verification of organization identity or permissions. The official [Experience Workspace MCP setup](https://www.aem.live/docs/ew/authoring/mcp) uses interactive Adobe IMS authentication.

## Build decisions

1. Introduce a proposed `Theme: isle5` opt-in on approved DA review documents. Local `decorateTemplateAndTheme()` already translates page `theme` metadata to body classes; no protected-runtime edit is needed. Add a corresponding authoring-model field if that is how the active DA workflow exposes metadata. Do not add the theme to shared production metadata during review.
2. Define semantic site tokens and explicitly map supported drop-in tokens. Do not blindly reverse the neutral colour scale: inputs, disabled states, errors, dialogs and payment surfaces need individual review. Account for the repository's `62.5%` root font sizing when translating prototype measurements.
3. Keep existing content and Commerce blocks. Reuse `hero` for the static campaign, `cards` for semantic campaign tiles, `columns` for editorial splits, and existing transactional wrappers for purchase/account flows.
4. Treat a compact homepage product rail as a capability spike. A recommendation placement is not automatically a “new arrivals” selection. Use a real configured recommendation placement only when it meets merchandising intent; otherwise prove a scoped public catalog integration before adding a thin reusable wrapper.
5. Keep the existing `/blog/*` discovery contract initially and label it “Field notes” in navigation. Moving to `/field-notes/*` would require separate path/index/redirect work. For preview-only stories absent from the index, use DA-authored `cards` linking to approved draft articles; do not publish to populate the index.
6. The user confirmed the existing Adobe demo catalogue for the first build, with its mismatch to the outdoor concept explicitly flagged. Preserve real prices, inventory, variants, currency, search, cart and account state from Commerce. The prototype's in-memory data and generated product imagery are design references only.
7. Use DA MCP for content, asset lookup, versions and authorized source changes. Tool discovery now confirms `da_upload_media`, `da_create_version` and `da_preview_content`; permissions and successful execution are still unverified. Preview takes org, repo and path without a branch argument, so verify its returned environment. No Source API, shell or browser-form substitute.

These styling boundaries follow [Adobe's CSS customization guidance](https://experienceleague.adobe.com/en/tools/commerce-storefront/dropins/all/styling/), checked against the local files listed below.

## Source findings that change the build

- The navigation contains upstream demo account/order URLs and category labels without links; resolve correct destinations before the visual rollout. Reuse its existing `.nav/isle5.png` logo.
- Home currently uses demo top-banner/search/hero-cta/newsletter/promotional-hero content; the successor needs an intentional campaign composition rather than a CSS-only recolour.
- The PDP template includes unrelated EDS benefits, and product metadata contains Adobe demo merchandise. The outdoor catalogue in the mockup is not current product truth.
- The working editorial source is `blog/index.html`; `blog.html` is empty. Registration also needs reconciliation between the actual `customer/create.html` and the helper's create-account route.
- Checkout already has noindex/no-store metadata. Cart and mini-cart disable undo removal; changing that behavior is a separate choice.

See the [concrete change manifest](change-manifest.md) for exact repository/DA work, dependencies and acceptance by change set.

## Ordered work packages

| Work | Repository scope | DA and service work | Completion condition |
| --- | --- | --- | --- |
| B0 Connect and inventory | No runtime edits; verify branch/configuration baseline | Complete the remaining identity, exact-path permission, version and preview checks; source inventory is now substantially inspected | Signed-off route/content inventory and safe review targets; see [DA queue](authoring-contracts.md#da-mcp-discovery-queue) |
| B1 Theme and typography | `styles/styles.css`, `styles/fonts.css`, appropriate deferred rules; optional metadata field in `ue/models/page.json` | Apply opt-in only to exact authorized review documents | Existing controls, payment surfaces and errors remain legible; unthemed pages retain their current presentation |
| B2 Header and footer | `blocks/header/`, `blocks/footer/`; preserve current nav, search, wishlist, authentication and mini-cart behavior | Read shared fragments; create approved isolated alternatives only when authorized; point review metadata to them | Existing supplied logo is reused; desktop/mobile navigation and all panels work by keyboard |
| B3 Campaign and editorial patterns | `blocks/hero/`, `blocks/cards/`, `blocks/columns/`, `blocks/accordion/`; update only relevant source models/READMEs | Author approved copy, assets, links and variants using verified tables | Home/category composition works with long text, missing optional fields and mobile crops; useful fallback remains |
| B4 Product-rail spike | Inspect `product-recommendations` and public catalog APIs; add a new wrapper only if the gap is proven | Resolve actual merchandising selection and permitted test products; verify real placement/configuration | Product source, ordering, scope isolation, option handling and failure state proven with real data |
| B5 Listing, search and product | `blocks/product-list-page/`, `blocks/search-bar/`, `blocks/product-details/`; initializers only if a supported option requires it | Resolve real category paths, search destination, product template and SKU metadata | Filters/sort/pagination/URL history, accurate options/prices, add-to-cart and wishlist work across supported product types |
| B6 Bag, checkout and account | Existing `commerce-*` wrappers and public style contracts; no custom replacement state | Verify existing route and fragment composition, test-backend permissions and approved test identities | Safe guest/authenticated/cart/wishlist journeys pass; orders/returns run only under separate transactional test authority |
| B7 Editorial, support and page coverage | `blog-post`, `blog-tiles`, content patterns; preserve index behavior | Author approved Field notes/story/help content and real policy/contact links | Preview-only editorial works without publishing; content and post-purchase coverage match the route inventory |
| B8 Preview review and handoff | Lint, source-model generation, responsive checks and relevant route tests | Preview each exact authorized changed path through supported MCP; inspect delivered HTML | Evidence report records environment, paths, states, passes and blockers; nothing published |

B0 permission and preview checks are required before DA writes. B1 can be drafted locally while those checks are resolved. B2–B3 establish the shared system before B5–B7. B4 must be resolved before product rails are promised. B8 closes each coherent change set, not only the end of the project.

Local implementation is on `codex/isle5-redesign`. No push, commit, PR or deployment has been created. A code branch does not isolate DA source: preview drafts and fragment references must be separately scoped.

## Review and rollback

Review the theme and a representative home, category, configurable PDP, cart and checkout before expanding all templates. Keep existing authored documents and fragment references intact until changes to those exact paths are authorized. Read the latest source/version before each write and stop on concurrent edits.

Record a recovery version before any future content change. Runtime rollback is a scoped revert of the theme/wrapper change; content recovery requires an authorized DA restoration. Never use unpublish as a rollback shortcut. Shared `/nav`, `/footer`, placeholders, site configuration and permissions are not disposable test fixtures.

## Planning deliverables

- [Concrete code and DA changes](change-manifest.md): source-backed change sets and initial delivery scope.

- [Reference brief](reference-brief.md): design direction, tokens and content/asset boundaries.
- [Page and block map](page-and-block-map.md): each mockup family mapped to local implementation and proposed DA targets.
- [Authoring contracts and DA queue](authoring-contracts.md): current contracts, proposed extensions and required MCP reads.
- [Commerce integration matrix](commerce-integration-matrix.md): installed versions, behavior, gaps and service dependencies.
- [Validation and evidence plan](visual-qa-report.md): required acceptance checks and actual current evidence.

The original planning validation was local inspection and `git diff --check`. Current implementation validation is recorded in [implementation status](implementation-status.md). The earlier standalone prototype checks do not prove this storefront build. Existing user changes to `AGENTS.md`, `.gitignore` and the ignored local orchestrator are preserved.
