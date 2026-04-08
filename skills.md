# Adobe Commerce Storefront Skills Proposal

This document proposes a compact operational skill set for Adobe Commerce Storefront implementations using `isle5` as the reference implementation.

## Reference Model

Use `isle5` as the baseline for how these skills should reason about a storefront implementation:

- `blocks/` contains reusable custom blocks, DA.live contracts, and block-specific authoring patterns.
- `scripts/__dropins__/` and `scripts/initializers/` define drop-in delivery and integration behavior.
- `cypress/` provides route smoke coverage, end-to-end checks, and visual evidence.
- `AGENTS.md` is the standards and guardrails source of truth.
- `README.md` describes the delivery model and reusable accelerator intent.

## Proposed Skills

### `storefront-block-author`
Purpose: Create or update custom storefront blocks that comply with block structure, metadata, accessibility, security, and documentation rules.

Use when:
- building a new block
- doing a major first-pass block rewrite
- aligning block implementation with DA.live and `AGENTS.md`

Inspects:
- `blocks/<block>/`
- `AGENTS.md`
- component definition/model/filter surfaces

Should produce:
- block JS/CSS
- `_block.json`
- README alignment
- metadata precedence and safe DOM patterns

Should avoid:
- unrelated route or drop-in changes
- repo-wide refactors when the request is block-scoped

### `dropin-integrator`
Purpose: Wire Adobe Commerce drop-ins correctly for the route and commerce domain they serve.

Use when:
- adding or updating a commerce drop-in
- fixing initializer or endpoint issues
- integrating account, cart, checkout, PDP, PLP, search, or recommendations flows

Inspects:
- `scripts/initializers/`
- `scripts/__dropins__/`
- `scripts/commerce.js`
- route-specific blocks

Should produce:
- correct initializer placement
- correct GraphQL endpoint usage
- placeholders and scope handling
- route-aware integration notes

Should avoid:
- inventing custom rendering layers where a drop-in pattern already exists
- changing unrelated storefront content blocks

### `metadata-contract-checker`
Purpose: Verify that block metadata naming, precedence, normalization, and README documentation stay aligned.

Use when:
- blocks rely on section metadata
- README drift is likely
- metadata-heavy implementations need auditing

Inspects:
- block JS config resolution
- block README tables and precedence sections
- `_block.json`
- section metadata conventions from `AGENTS.md`

Should produce:
- metadata drift findings
- precedence mismatches
- normalization/fallback issues
- concrete doc/code alignment recommendations

Should avoid:
- broad stylistic feedback unrelated to metadata contracts

### `route-smoke-auditor`
Purpose: Validate critical storefront routes and detect missing or weak route coverage.

Use when:
- auditing implementation readiness
- validating route-critical changes
- checking account, checkout, PDP, PLP, cart, login, or search flows

Inspects:
- `cypress/`
- route-critical blocks and drop-ins
- route expectations from repo conventions

Should produce:
- route coverage summary
- missing smoke coverage findings
- route-to-block expectation gaps

Should avoid:
- acting like a full visual diff tool
- treating static code review as route validation

### `visual-geometry-auditor`
Purpose: Check responsive geometry, overflow, clipping, spacing drift, and route-level visual regressions.

Use when:
- validating responsive storefront quality
- reviewing floating UI, overlays, cards, and layout-sensitive blocks
- comparing captured evidence across routes or breakpoints

Inspects:
- `cypress/` visual assets and related specs
- block CSS and layout-sensitive UI surfaces
- responsive breakpoints used by the project

Should produce:
- viewport-based defect findings
- geometry risk summaries
- route/viewport evidence references

Should avoid:
- making product decisions without visual evidence
- replacing smoke or metadata validation

### `commerce-config-doctor`
Purpose: Diagnose endpoint, header, placeholder, environment, and storefront mode issues.

Use when:
- setup feels inconsistent
- auth or commerce requests behave unexpectedly
- the implementation may mix storefront modes or environments

Inspects:
- `config.json`
- demo config files
- `scripts/commerce.js`
- initializer and route assumptions

Should produce:
- readiness checks
- missing config findings
- endpoint/header mismatches
- mode plausibility notes

Should avoid:
- rewriting implementation code when the issue is pure configuration

### `commerce-optimizer-catalog-builder`
Purpose: Build Adobe Commerce Optimizer catalog-ingestion request sets from the official Data Ingestion schema and emit implementation-ready REST payloads.

Use when:
- creating Commerce Optimizer ingestion payloads
- modeling categories, metadata, products, price books, and prices
- turning a product-domain brief into request-ready sample catalog data

Inspects:
- official Adobe Commerce Optimizer schema:
  - `https://developer.adobe.com/commerce/services/rest/data-ingestion-schema-v1.yaml`
- official Adobe Commerce Optimizer fallback docs when raw schema retrieval is blocked

Should produce:
- request blocks in a consistent REST template format
- schema-aligned endpoint paths and payload shapes
- internally consistent categories, metadata, products, price books, and prices
- clear assumptions when the user does not fully specify the catalog

Should ask first:
- what type of products are needed
- how many price books are needed
- whether child price books are needed

Should avoid:
- inventing unsupported fields or enums
- answering from memory when the official schema can be read
- producing storefront implementation guidance instead of ingestion payloads

### `authoring-docs-sync`
Purpose: Keep authoring documentation, DA.live contracts, and implementation behavior in sync.

Use when:
- block README coverage is incomplete
- DA.live models/definitions drift from implementation
- authoring predictability matters

Inspects:
- block READMEs
- `_block.json`
- component definition/model/filter files
- related block implementation

Should produce:
- README gap findings
- DA.live contract drift findings
- concise updates for author-facing guidance

Should avoid:
- changing runtime behavior unless the task explicitly includes implementation fixes

### `upstream-drift-reviewer`
Purpose: Compare the storefront against upstream boilerplate and isolate meaningful follow-up work.

Use when:
- reviewing template drift
- planning upgrade or sync work
- separating local customization from baseline platform change

Inspects:
- git history and remotes
- local storefront customizations
- upstream-compatible surfaces

Should produce:
- upstream drift summary
- sync candidates
- high-risk local divergence notes

Should avoid:
- blind sync recommendations
- overwriting local implementation choices without review

### `waypoint-assess`
Purpose: Orchestrate storefront assessment across blocks, drop-ins, routes, docs, config, visual evidence, and remediation planning.

Use when:
- assessing implementation quality
- preparing remediation work
- turning storefront findings into grouped action packages

Inspects:
- `AGENTS.md`
- `README.md`
- `blocks/`
- `scripts/`
- `cypress/`
- config and git surfaces

Should produce:
- structured findings
- confidence/readiness state
- grouped remediation packages
- next-step commands for Codex or developers

Should avoid:
- acting like a generic linter
- mutating risky code directly when the right outcome is a Codex-ready plan

## How These Skills Work Together

Typical implementation flow:

1. `storefront-block-author` builds or updates the custom block surface.
2. `dropin-integrator` wires commerce journeys where packaged drop-ins are the right fit.
3. `metadata-contract-checker` and `authoring-docs-sync` keep authoring behavior predictable.
4. `route-smoke-auditor` and `visual-geometry-auditor` validate route behavior and layout quality.
5. `commerce-config-doctor` checks environment and endpoint correctness.
6. `upstream-drift-reviewer` identifies reusable baseline sync opportunities.
7. `waypoint-assess` pulls the full picture together into findings and remediation actions.

## Notes

- These are proposed Codex-style operational skills, not installed skills yet.
- The catalog is intentionally small and role-oriented rather than exhaustive.
- The focus is Adobe Commerce Storefront implementation work, not generic frontend development.
