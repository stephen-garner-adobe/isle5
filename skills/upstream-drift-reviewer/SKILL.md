---
name: upstream-drift-reviewer
description: Use when comparing an Adobe Commerce Storefront implementation like isle5 against upstream boilerplate, especially to identify sync candidates, local divergence, and high-risk differences without recommending blind syncs.
---

# Upstream Drift Reviewer

Use this skill for upstream comparison and sync planning.

Core workflow:
1. Inspect git remotes, branch state, and local customization surfaces.
2. Separate local product choices from likely upstream-compatible changes.
3. Flag high-risk divergence where sync could break storefront behavior.
4. Prefer grouped sync recommendations over file-by-file churn.
5. Treat upstream review as planning input, not an automatic merge decision.

Inspect:
- git remote and branch state
- upstream comparison surfaces
- customized storefront blocks and scripts
- `README.md`

Produce:
- upstream drift summary
- sync candidate groups
- high-risk divergence notes

Avoid:
- blind sync recommendations
- overwriting local choices without review

