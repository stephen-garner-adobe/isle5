# Isle5 authoring contracts and DA discovery queue

DA owns page instances, content, assets, destination links, metadata, fragment composition and reusable labels. Repository code owns rendering, supported behavior and constrained styling. No DA document, asset, permission, preview or publication was changed during planning.

## Current and proposed contracts

| Pattern | Current local contract | Planned use or extension |
| --- | --- | --- |
| Campaign hero | `hero`: one-cell content shape; model fields `image`, `alt`, `text`. Decorator preserves authored content and replaces the picture with an optimized version | Preserve selectors/field IDs. Add theme-scoped layout. Verify delivered HTML for supporting copy/actions; extend the model to represent optional rich text/actions only if the active authoring workflow requires it |
| Hero CTA | Four-column typed `slide`, `nav`, `interval` rows; zero property-panel fields | Not the default campaign choice: its CTA/sidebar contract is not an existing headline/body model. Do not invent slide fields or force extra headings into navigation cells |
| Category tiles | `cards`: repeatable rows with image/body content; child model `card` has `image`, `imageAlt`, `text`; decorator preserves body DOM | Add a constrained proposed campaign variant and matching source-model option if needed. Preserve semantic headings and links. Verify how the active DA UI authors block options before choosing field/schema details |
| Promotional cards | `promotional-hero`: image, description and action cells; description builder currently copies paragraphs/plain text | Reuse where description semantics fit. It is not a guaranteed H2-rich overlay-tile substitute; any semantic extension must preserve existing tables and update docs/models together |
| Editorial split | `columns` with row/cell composition | DA-authored image, heading, body and links. Generic alignment/layout only in code; no page text in JavaScript |
| Listing/search | `product-list-page` fields `urlpath`, `pageSize`; reader normalizes configuration and defaults page size to 9 | Real catalog category path for collections; omit category binding for search. Choose page size after visual/performance testing rather than claiming four desktop columns from data alone |
| Product detail | `product-details` model exposes `defaultSku`; actual PDP initializer calls `getProductSku()`, with page `sku` metadata and dynamic routing involved | Confirm live use before modifying any field. Do not assume adding a model value changes initializer behavior. Keep `/products/default` as the shared template |
| Recommendations | Model `recId`, `currentSku`; normalized reader keys `recid`, `currentsku` | Resolve genuine recommendation IDs/context. Do not use sample identifiers or relabel recommendations as a manually curated selection |
| Article | `blog-post` body plus page metadata `title`, `description`, `image`, `author`, `category`; optional author image/tags | Reuse documented layouts; date depends on index data rather than an assumed authored date field. No new arbitrary metadata names |
| Article index | `blog-tiles` discovers `/blog/*`; polling configurable through `blogtiles-pollseconds` | Preserve path contract. Verify preview index visibility; consider disabling polling for review where appropriate. Never publish solely to fill the grid |
| Header/footer | Shared fragments selected by page metadata; defaults `/nav`, `/footer`, `/mini-cart`, `/wishlist` as applicable | Read actual references first. Reuse existing logo. Only authorized review documents may point to isolated alternatives |
| Section presentation | Existing section model exposes `style`, spacing and layout controls; current style option includes `highlight` | Add constrained theme section variants only when required. Do not assume a generic `dark` option exists because the prototype uses dark surfaces |
| Page theme | Local runtime already reads `theme` metadata and adds the normalized class to the body; page source model does not currently expose `theme` | Proposed value `isle5`. Add a supported metadata field if needed; never alter `scripts/aem.js` |

Current [Adobe PLP authoring guidance](https://experienceleague.adobe.com/en/tools/commerce-storefront/merchants/blocks/product-list-page/) confirms that catalog category paths differ from CMS page paths. Local code additionally supports `pageSize`; preserve that compatibility rather than replacing the local contract with a newer example.

## New capability gate

If B4 proves a new product-rail wrapper is needed, first define author intent: category/curated source, count, heading, optional collection link and whether actions are enabled. Confirm public API/scoping support and the required backend data before fixing field names or a table schema. Product names, prices, stock and links still come from Commerce.

Every optional field needs an empty-state behavior. Missing media leaves useful text/navigation; a missing product service never becomes a static priced product card. Keep practical title/copy length guidance in block documentation and verify long content. Do not expose raw CSS, GraphQL or backend options to authors.

## DA MCP discovery queue

The retried connection now exposes the source tools. `da_list_sources` successfully listed the site root, `products`, `customer`, `blog` and `placeholders`. Seventeen representative documents/sheets were read. Discovered schemas also confirm media upload, explicit source versioning and preview operations. No identity/permission inspection tool is exposed, so those checks still require authorized authenticated evidence.

1. **Restore connection.** Browser sign-in succeeded through `codex mcp login da_mcp`; the later retry confirmed read-only listing and source access. Read, version, media/fragment lookup, media upload and preview schemas are now exposed; do not repeat login. For future expired authentication, prompt a fresh interactive browser login; never seek a client secret or copied token. Verify effective capability permissions before invoking state-changing tools; source save is not preview.
2. **Confirm identity and ownership.** Verify the selected EMEA Enterprise Architecture organization against its unique IMS organization ID. Confirm exact source access and separate EDS preview authorization. Read effective permission/configuration evidence only within authorized access; do not modify permissions.
3. **List the site.** Use the documented listing capability (`da_list_sources`) for the verified `stephen-garner-adobe/isle5` root. Follow returned paths to identify actual home/category/search/transactional/editorial documents, locales, shared fragments and placeholder sources. Do not manufacture inventory from proposed URLs.
4. **Read representative documents.** Use the discovered source reader (`da_get_source`) for actual returned paths. Inspect block tables, section boundaries, metadata, nav/footer/mini-cart references, product-template content and localization conventions. Preserve unknown content structures.
5. **Inspect history and dependencies.** Use the documented version/media/fragment lookup capabilities where available. Record source versions, reference targets and approved asset reuse. Resolve the existing logo through the actual fragment/media references.
6. **Resolve merchandising.** Match real catalog category paths, eligible products, options, configured recommendation placements and store currency. Record which services have been exercised, not simply configured.
7. **Verify preview safety.** Inspect applicable automation before any future source save. Verify code branch mapping, content isolation, exact-path preview access, draft indexing and actual returned URL behavior. A draft folder or code branch alone does not prove isolation.
8. **Produce a reviewed change manifest.** For each approved future change record actual source path, current version, intended operation, owning block, asset references, metadata, recovery reference and preview target. No write is authorized by this planning document.
9. **After implementation is authorized:** re-read source/version, write the smallest change with discovered create/update tools, preview through supported MCP capability, inspect the delivered result and return verified edit/preview URLs. Stop on concurrent edits, permission errors or unexpected destinations.

Do not fall back to Source API, curl, a browser content form or a local authored HTML page to replace this queue. Do not publish, approve, request publication, schedule publication, unpublish, move or delete shared content.

## Model and content acceptance

Read the applicable root, block and UE rules before changes. Keep existing field IDs stable; new fields must be constrained and implemented. Update decorator, source model, filters and README as one change when the contract changes. Run `npm run build:json`, inspect generated root JSON for unrelated churn, and run `npm run check:ue`. Verify a real DA-authored example and safe missing/extra rich-text wrappers before calling authoring complete.

## Preview and upload capabilities confirmed by tool discovery

- `da_create_version` accepts a source path and optional label for a checkpoint. It has not been invoked during planning.
- `da_upload_media` accepts one content source, supports listed image types and limits uploads to 4.5MB. For page-associated imagery it documents a sibling dot-prefixed media folder. Always use the returned reference, not an assumed storage path.
- `da_preview_content` accepts org, repo and path. It previews one document and strips the extension. It has no code-branch parameter, so verify the actual returned host/code mapping before describing a feature preview.
- `da_publish_content` and removal tools are exposed but prohibited by the preview-only task boundary. Their presence is not authorization.

Exact future review paths and source versions must still be resolved before writes. The source inventory alone does not verify the required IMS org ID, effective authorization or automatic-publication settings.
