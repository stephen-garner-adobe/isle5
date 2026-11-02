# Isle5 planned code and DA changes

This is the implementation scope following read-only inspection through DA MCP on 30 October 2026. It extends the approved mockup direction across the existing storefront. No runtime code, source content, media, preview state or live publication has been changed.

## Initial delivery boundary

Build one representative home → collection → configurable product → bag → checkout journey first, then extend the same system across remaining content and account pages. The user confirmed the existing Adobe demo catalogue for the first build; clearly flag its visual mismatch with the outdoor concept. Final outdoor-product fidelity depends on real products, imagery, attributes and merchandising; never relabel demo merchandise as the fictional products from the mockup.

Keep the supplied logo. The current navigation references `.nav/isle5.png`; this is an asset-reuse lead, not a request to generate a replacement. All source changes below are future operations through DA MCP, after the identity/permission checks and exact targets are authorized.

## Change sets in implementation order

### 1 Establish review isolation and resolve routing

Repository work:

- Start an implementation branch such as `codex/isle5-redesign` when building is requested. Preserve unrelated work; no push or merge is included.
- Confirm code-preview delivery and how the selected DA preview resolves that code. The exposed preview tool accepts org, repo and path, not a code-branch argument.
- Resolve the registration mismatch: DA has `customer/create.html` using `commerce-create-account`, while the helper names `/customer/create-account`. Test the intended route and align one canonical path plus necessary compatibility handling. Do not rename content or add redirects speculatively.

DA work:

- Resolve the EMEA Enterprise Architecture IMS organization ID and selected session, exact-path source permissions, EDS preview access and publication automation.
- Confirm availability of the proposed `/drafts/isle5-redesign/` review namespace. Select exact review document and fragment paths before mutation.
- Read current versions before each authorized change; checkpoint through the available version tool when needed.
- Use isolated navigation/footer references on review documents. Do not replace shared production fragments to manufacture a preview.

Acceptance: a documented route/environment map, verified authorization for the agreed review scope and no accidental cross-site navigation. Draft checkout URLs alone do not exercise the existing exact `/checkout` header behavior.

### 2 Build the visual foundation and shared shell

Repository work:

- Add semantic ink, panel, chalk, stone and moss tokens under the proposed `isle5` theme in `styles/styles.css`; map supported Commerce tokens deliberately. Keep unthemed pages stable.
- Reuse existing Roboto and Roboto Condensed font files through `styles/fonts.css`. Translate the prototype's pixel measurements using the repository's rem basis.
- Restyle `blocks/header/` and `blocks/footer/` with square controls, clear focus, responsive navigation and suitable opaque overlays. Preserve live search, auth, wishlist and mini-cart coordination.
- Add a constrained `theme` field to `ue/models/page.json` if required by the actual authoring workflow; use the existing runtime's theme-to-body-class behavior.

DA work:

- Prepare an isolated successor to `nav.html`: existing logo, New arrivals / Women / Men / Equipment / Field notes, real account links and correct search/bag destinations. Resolve every category destination before enabling it.
- Replace upstream `hlxsites` account/order links with verified project-local destinations in the review navigation. Confirm the home logo link stays in the selected review environment.
- Prepare an isolated successor to `footer.html` with site links, support, locale and approved legal destinations. Current content is an Adobe boilerplate footer; do not invent legal policy or contact details.

Acceptance: coherent shell on desktop/mobile, keyboard parity, no links carrying shoppers to the upstream boilerplate, and correct account/bag state.

### 3 Compose the home and category experiences

Repository work:

- Extend `hero` with a constrained campaign presentation and optional authored supporting copy/actions, preserving existing image/alt/heading fields and fallback.
- Style a documented campaign variant of `cards` for semantic image overlays and category headings. Keep ordinary product/editorial/help cards distinct.
- Use `columns` for image/text story splits and default content/accordion patterns for service/help copy. Model only reusable behavior, not page-specific copy.
- Preserve `hero-cta`'s existing typed-row contract. Do not retrofit campaign headline fields into its CTA cells or globally restyle its other variants.

DA work:

- Compose the review homepage from one static campaign, category tiles, a real product selection, a Field notes feature, coordinated kit and service/brand sections.
- Omit demo ticker copy and the standalone search block from the review composition if the header search satisfies the design. Keep the original homepage unchanged until a replacement is explicitly authorized.
- Defer the current newsletter from the first review composition unless its service, consent copy and intended visual placement are approved. Preserve supported subscription behavior if retained.
- Create proposed Women/Men/Equipment/New arrivals review pages only after resolving actual destinations and merchandising. The root inventory currently exposes `apparel.html`, not those proposed collection pages.

Acceptance: responsive composition with real linked destinations, one H1, approved assets/copy, no demo marketing claims and useful missing-content fallback.

### 4 Resolve product merchandising, listing and PDP

Repository work:

- Spike the homepage product strip before committing to a new block. Existing recommendation placements may not express curated new arrivals. Prove a configured recommendation placement or a public scoped catalogue integration; otherwise record the gap.
- Restyle `product-list-page` and `search-bar` for the dark card system, 4/3/2-column layouts where supported, readable facets/sort/pagination and accessible mobile filtering.
- Preserve `urlPath` category binding, search query/URL-state handling and localized product routing. Keep configurable products routed to PDP initially unless a separately verified quick-add enhancement is in scope.
- Restyle `product-details` through existing granular containers, wrapper geometry and public style/slot contracts. Preserve gallery, option validation, price/stock truth and cart/wishlist behavior.

DA work:

- Use `apparel.html` as the verified category-contract reference: it currently binds `urlPath=apparel` and includes recommendations and enrichment. Do not substitute guessed category names.
- Create an isolated review PDP with a verified real `sku` metadata value as supported by local SKU resolution. Preserve the existing `/products/` folder mapping and shared `products/default.html` during review.
- Remove boilerplate EDS feature cards from the approved successor PDP composition; replace with relevant product care/fit/delivery content only where verified.
- Review existing recommendation context, IDs and placements rather than copying the demo's single placement everywhere.
- Audit `metadata.json` before any approved metadata changes: it has 224 product rows, including six `/fr/` rows, with external aemshop/upstream origins. Do not bulk-rewrite product canonical URLs, currency or JSON-LD as part of a skin change.

Acceptance: real catalogue responses and options work; no fabricated prices, names, stock, facets or product cards; recommendations and metadata match the actual environment.

### 5 Extend the system through purchase and account

Repository work:

- Style existing cart/mini-cart/checkout/account/order/wishlist wrappers and supported tokens. Do not rebuild forms or state from the prototype.
- Exercise loading, empty, validation, unavailable, auth-transition and backend-error states. Check third-party payment surfaces separately from the global dark theme.
- Preserve exact route behavior and supported form/dictionary integrations.

DA work:

- Keep cart configuration deliberate: its current source enables quantity updates, removal, shipping estimation and product editing, but sets `Undo Remove Item=false`.
- Keep mini-cart destinations `/cart` and `/checkout` aligned. Retain its existing configured options until a change is explicitly chosen.
- Preserve checkout's `robots: noindex, nofollow` and `Cache-Control: no-store`.
- Review the cart's current demo agreement wording and aemshop terms destination; replace only with the approved applicable agreement.
- Preserve account sidebar/header, orders, addresses, customer information and returns composition from `customer/account.html`. Extend the theme to registration, recovery, orders, returns and wishlist rather than stopping at login/overview.

Acceptance: safe, supported guest/authenticated journeys in the identified test environment. Order placement, account creation and returns require their own transactional test authority. Confirmation must be real; no demo order states in production code.

### 6 Complete editorial, support and preview acceptance

Repository work:

- Reuse `blog-tiles` and `blog-post`; preserve `/blog/*` discovery initially. Do not rename routes to match the “Field notes” label.
- Style story/help/default content with the shared hierarchy; implement no new editorial engine.
- Run lint, source-model generation/checks where changed and the defined responsive/browser/Cypress checks. Keep screenshots and reports outside commits unless requested.

DA work:

- Use `blog/index.html` as the editorial landing source: it contains `blog-tiles`. The separate `blog.html` source is empty; no redirect between these appeared in `redirects.json`.
- Create approved Field notes examples through DA; use editorial cards for preview-only articles if they are absent from the preview index. Never publish merely to populate the index.
- Replace boilerplate support content with approved delivery/returns/fit/care/contact guidance and real destinations. Prepare the brand story as authored content.
- Upload approved media through the available MCP upload tool; respect its 4.5MB limit and use its actual returned reference. Keep truthful variant photography and existing logo assets.
- Preview each exact authorized document with `da_preview_content`, inspect the returned environment/code and verify delivered pages. Never call live publication tools.

Acceptance: all agreed page families, links, metadata, source/model contracts, viewport geometry and applicable real shopper states have recorded evidence. Report blocked states separately and leave publication out of scope.

## Catalogue decision

The source metadata currently describes Adobe demo merchandise. The mockup's Terrain Shell / Ridge Runner / Traverse names and prices are concept data. The user confirmed using the existing catalogue first, with the visual mismatch explicitly flagged. Use real catalogue data throughout the initial implementation; treat outdoor catalogue matching as a separate future content/backend dependency. This is not permission to change Commerce admin/catalogue data.

## Completion record

The build is ready for preview review only when the change sets have passed their stated acceptance conditions. Return actual source/edit/preview paths, code branch, backend mode, checks and remaining dependencies. A successful source update or tool availability alone is not a completed preview or production-ready build.
