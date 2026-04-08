---
name: visual-geometry-auditor
description: Use when validating responsive geometry and route-level visual quality in Adobe Commerce Storefront repos like isle5, especially for overflow, clipping, spacing drift, overlays, and viewport-based regressions using Cypress artifacts and layout-sensitive CSS.
---

# Visual Geometry Auditor

Use this skill for visual and responsive layout validation.

Core workflow:
1. Inspect available visual artifacts under `cypress/` and identify the affected routes and viewports.
2. Review the related block CSS and layout-sensitive UI surfaces.
3. Distinguish true geometry failures from visual-only effects such as shadows.
4. Report route/viewport-specific evidence with clear defect language.
5. Keep visual conclusions tied to evidence instead of style preference.

Inspect:
- `cypress/` screenshots and visual specs
- block CSS
- route-specific UI surfaces
- `AGENTS.md`

Produce:
- geometry findings
- viewport summaries
- route/viewport evidence references

Avoid:
- making product decisions without visual evidence
- replacing smoke or metadata validation

