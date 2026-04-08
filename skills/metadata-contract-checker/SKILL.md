---
name: metadata-contract-checker
description: Use when Adobe Commerce Storefront blocks rely on section metadata and you need to verify naming, precedence, normalization, no-op handling, and README parity against AGENTS.md in repos shaped like isle5.
---

# Metadata Contract Checker

Use this skill for metadata-heavy block audits and fixes.

Core workflow:
1. Read the metadata sections in `AGENTS.md`.
2. Inspect block config resolution, normalizers, fallbacks, and warning behavior.
3. Verify block-specific metadata keys are prefixed and Adobe native section metadata is kept distinct.
4. Confirm precedence order in code matches README terminology exactly.
5. Check invalid values, no-op combinations, and fallback behavior are explicit and safe.

Inspect:
- block JS config resolution
- block README metadata tables
- `_block.json`
- section metadata usage
- `AGENTS.md`

Produce:
- metadata drift findings
- precedence mismatches
- normalization/fallback issues
- README/code alignment recommendations

Avoid:
- broad stylistic feedback unrelated to metadata behavior

