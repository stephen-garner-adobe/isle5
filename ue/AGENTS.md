# DA.live and Universal Editor Model Rules

These instructions apply to every file under `ue/`. They extend the repository root rules.
For block implementation and README behavior, also follow `blocks/AGENTS.md`.

## Authoritative Contract

Use https://docs.da.live/ as the authoritative source for:

- Document Authoring content structures and workflows;
- DA APIs and authentication;
- block and template libraries;
- DA-backed Universal Editor instrumentation;
- component definitions, models, and filters;
- preview and publish operations.

Use Adobe Commerce Storefront documentation for Commerce behavior and drop-in configuration, and
aem.live documentation for Edge Delivery Services runtime behavior.

The active local build remains the compatibility contract. This checkout builds authoring
configuration from `ue/models/`. Do not migrate to an upstream `models/` layout, model generation,
or schema version during unrelated work.

When current DA.live guidance differs from the repository:

1. Confirm the installed project and build-tool versions.
2. Keep the existing model generation working.
3. Document the delta and propose a separate migration.
4. Do not mix both layouts or schema generations in one block model.

## Source and Generated Files

Source files:

- `ue/models/component-definition.json`
- `ue/models/component-models.json`
- `ue/models/component-filters.json`
- `ue/models/blocks/*.json`
- other files under `ue/models/` referenced by the aggregate sources

Generated root artifacts:

- `component-definition.json`
- `component-models.json`
- `component-filters.json`

Rules:

- Edit source files under `ue/models/`.
- Do not hand-edit generated root artifacts.
- After any source-model change, run `npm run build:json`.
- Review generated changes and reject unrelated churn.
- Keep source JSON valid, deterministic, and free of comments.
- Do not copy model files from another model generation without an explicit migration plan.

## Configuration Ownership

Universal Editor fields must reflect the same ownership contract as the implementation:

- Authored content and block-specific settings belong in the block model/table.
- Section layout and presentation belong in section metadata.
- Page SEO, indexing, caching, and social properties belong in page metadata.
- Endpoints, stores, locales, and runtime flags do not belong in authorable block fields.

Do not model a setting in both the block and section metadata unless compatibility explicitly
requires both. If two sources exist, define the canonical source, precedence, warning behavior, and
deprecation plan in the block README.

Field names, defaults, allowed values, descriptions, and required state must match the JavaScript
reader exactly.

## Block Model Contract

An authorable block model file normally contains:

- `definitions`: how the block is identified and represented in source content;
- `models`: fields shown to authors;
- `filters`: allowed child components or nested composition.

Keep IDs stable and consistent across all three arrays.

### Definitions

- `title` is the clear author-facing name.
- `id` must match the model/filter registration and block contract.
- `plugins.da.name` must map to the authored block name.
- `rows`, `columns`, `fields`, `behaviour`, and selectors must match the source table shape
  expected by the decorator.
- Use the spelling required by the active DA model schema, including `behaviour` where applicable.
- Do not declare a row/cell shape that the block cannot decorate safely.
- When a definition uses field selectors, every modeled field must map to the intended source cell.
- Use `rows` plus `columns` or `unsafeHTML` according to current DA guidance; do not combine
  mutually exclusive definition forms.
- Any `unsafeHTML` must be static, safe, minimal starter content without interpolated external
  values.

### Models

- Use supported DA/UE components and value types.
- Give every field a stable `name`, clear `label`, useful `description`, and intentional
  default.
- Mark a field required only when the block has no safe fallback.
- Keep select option values identical to the values normalized by JavaScript.
- Set numeric validation bounds that match runtime validation.
- Use booleans for independent toggles and selects for mutually exclusive choices.
- Prefer specific controls over free text when the value set is known.
- Do not expose raw CSS, arbitrary HTML, GraphQL, URLs, or internal drop-in options without a
  deliberate security and author-experience review.
- Avoid stale fields that no longer affect behavior.

### Filters and nested blocks

- Filters must reference valid component IDs.
- Empty component lists must be intentional.
- Parent and child definitions must agree on nested structure and allowed cardinality.
- Add new authorable blocks to the section filter used by this repository.
- Removing a block requires removing its source definition, model, filter references, generated
  entries, documentation, and dead implementation behavior.
- Do not broaden a filter globally to solve a single-page authoring problem without assessing all
  pages that consume it.

## Model Types

Choose the source structure that best matches author intent:

- **Simple block:** fixed fields with a straightforward table shape.
- **Compound block:** parent plus repeatable child items and an explicit filter.
- **Key-value block:** labeled settings consumed through `readBlockConfig(block)`.
- **Configuration block:** metadata or settings with no shopper-facing content of its own.

Do not force a content block into a key-value schema solely to simplify JavaScript. Do not model a
simple drop-in wrapper with fields it does not use.

For block options/classes, use the naming and field mechanism documented for the active DA model
schema. Keep option values aligned with supported block classes and do not expose arbitrary class
entry when a select can constrain authors safely.

## Section and Page Metadata

- Preserve DA- and EDS-native author-facing names.
- Custom section metadata must remain block-scoped and documented.
- Model page metadata separately from block configuration.
- For cart, checkout, account, order, wishlist, authenticated, and other route-critical pages,
  document and model the intended `robots`, cache, title, and social behavior where supported.
- Do not promise that `robots: noindex` alone removes a page from every sitemap or index source;
  follow the applicable DA/aem.live indexing guidance.
- Reserved metadata keys must not be reused as structured-content field names.

## Block Library and Templates

DA libraries and templates are authoring products, not just repository JSON.

When a task includes library work:

- Follow https://docs.da.live/administrators/guides/setup-library.
- Keep block example documents synchronized with the implementation and model.
- Give library entries clear author-facing names and descriptions.
- Include representative variants, optional fields, and safe starter content.
- Validate blocks, templates, placeholders, and icons in the DA library UI.
- Preview and publish required library documents only when the user explicitly authorizes the
  external content operation.

A repository code or model change does not by itself authorize writes to DA.live.

## DA APIs and Content Safety

- Follow current https://docs.da.live/developers/api documentation.
- Use the supported authentication mechanism and least privilege.
- Never commit DA bearer tokens or expose them in logs.
- Resolve exact organization, site, path, environment, and operation before writing.
- Treat move, delete, publish, and unpublish as externally consequential operations.
- Fetch the latest source before modifying shared authored content to avoid overwriting concurrent
  author changes.
- Preserve unsupported or unrecognized source structures rather than deleting them opportunistically.
- Validate URLs and media references before placing them in starter content.

## Documentation Alignment

For every authorable block, verify that these surfaces agree:

1. Authored table shape
2. Definition selectors and source mapping
3. Model fields and defaults
4. Filter registrations
5. JavaScript readers and normalizers
6. CSS variants
7. Block README examples and option tables
8. Library example content, when maintained

Aliases must be intentional and documented with a canonical replacement and removal plan.

## Validation

After any model change:

```bash
npm run build:json
```

Then verify:

- source JSON parses successfully;
- generated root artifacts changed only as expected;
- the block appears in the intended section filter;
- field defaults and option values match runtime normalization;
- a newly inserted block has the correct source table shape;
- existing authored documents still decorate correctly;
- Universal Editor properties map to the intended source cells;
- README examples reproduce the modeled structure;
- `git diff --check` passes.

For a new block, also run the applicable block lint, preview, responsive, and Commerce route checks.
