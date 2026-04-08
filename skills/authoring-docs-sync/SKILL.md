---
name: authoring-docs-sync
description: Use when keeping Adobe Commerce Storefront authoring documentation aligned with implementation in repos like isle5, especially block READMEs, DA.live definitions/models/filters, metadata tables, and README-to-code parity.
---

# Authoring Docs Sync

Use this skill when authoring contracts and implementation may have drifted.

Core workflow:
1. Inspect block READMEs, `_block.json`, and related component definition/model/filter files.
2. Compare author-facing metadata docs with actual code behavior.
3. Verify required README sections and tables from `AGENTS.md`.
4. Keep authoring guidance concise, literal, and outcome-focused.
5. Update docs and DA.live contracts together when behavior changes.

Inspect:
- block READMEs
- `_block.json`
- component definition/model/filter surfaces
- block implementation
- `AGENTS.md`

Produce:
- README gap findings
- DA.live contract drift findings
- concise author-facing fixes

Avoid:
- changing runtime behavior unless the task explicitly includes implementation fixes

