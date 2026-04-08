---
name: storefront-block-author
description: Use when creating or rewriting Adobe Commerce Storefront custom blocks in repositories shaped like isle5, especially when the work must follow block JS/CSS/README/_block.json contracts, DA.live authoring rules, metadata precedence, accessibility, and safe DOM/URL handling from AGENTS.md.
---

# Storefront Block Author

Use this skill for new blocks and major block rewrites.

Core workflow:
1. Read `AGENTS.md` first, especially block structure, metadata contract, security, accessibility, README, and DA.live JSON rules.
2. Inspect the target block folder under `blocks/` and related component definition/model/filter files before changing behavior.
3. Keep authored content in block rows/cells and behavior/layout controls in section metadata.
4. Implement deterministic metadata precedence and persist resolved values on `block.dataset.*`.
5. Use safe DOM construction and URL handling. Avoid unsanitized `innerHTML`.
6. Keep README and `_block.json` aligned with the implementation.

Inspect:
- `blocks/<block>/`
- `AGENTS.md`
- `component-definition.json`
- `component-models.json`
- `component-filters.json`
- `models/_component-definition.json`

Produce:
- block JS/CSS updates
- `_block.json` alignment
- README alignment
- metadata precedence and warning behavior

Avoid:
- unrelated route or drop-in changes
- repo-wide refactors when the task is block-scoped

