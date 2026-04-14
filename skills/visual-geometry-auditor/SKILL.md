---
name: visual-geometry-auditor
description: Use when validating responsive geometry and route-level visual quality in Adobe Commerce Storefront repos like isle5, especially for overflow, clipping, spacing drift, overlay safety, viewport-based regressions, design token compliance, CSS variant model, and accessibility geometry using Cypress visual artifacts and layout-sensitive CSS.
---

# Visual Geometry Auditor

## When to use

- Validating responsive storefront quality across viewports
- Reviewing floating UI, overlays, cards, and layout-sensitive blocks
- Checking CSS variant model compliance (data attributes, specificity, design tokens)
- Verifying accessibility geometry (tap targets, focus outlines, contrast)
- Comparing captured visual evidence across routes or breakpoints
- Auditing after layout or CSS changes to detect regressions

## Discovery questions

1. **Scope?** Which blocks or routes are being checked — specific blocks, or a full storefront sweep?
2. **Evidence available?** Are Cypress screenshots or Percy snapshots available, or is this a code-level CSS review?
3. **Problem viewports?** Are there known problematic viewports or devices to focus on?
4. **Overlay-heavy?** Does the block include floating/absolute UI (dropdowns, modals, popovers, mini-cart panels)?

## Core workflow

1. Inspect available visual artifacts under `cypress/screenshots/` and `cypress/tmp/`.
2. Identify the affected routes and viewports from spec files and screenshot naming.
3. Review the related block CSS for layout-sensitive patterns.
4. Walk the viewport sweep checklist across required widths.
5. Check overlay and floating UI safety.
6. Verify CSS variant model, design token usage, and specificity ordering.
7. Check accessibility geometry (tap targets, focus, contrast).
8. Distinguish true geometry failures from visual-only effects (shadows, anti-aliasing).
9. Report viewport-specific evidence with clear defect language.

## Checklists

### Viewport sweep (AGENTS.md: Responsive Geometry Gate)

Minimum sweep widths — every layout-affecting block must pass at all of these:

`360, 390, 414, 480, 768, 1024, 1280, 1440, 1920`

(or project's defined viewport list if one exists)

- [ ] Layout geometry validated at all 9 required widths
- [ ] Hard geometry leak > 2px treated as a defect (card/panel/button overflow or clipping)
- [ ] True geometry failures distinguished from visual-only effects (box-shadow overflow, anti-aliasing, sub-pixel rendering)
- [ ] Horizontal scrollbar absent at all viewports (no hidden overflow creating scroll)
- [ ] Content readable and functional at all viewports (no text truncation hiding critical information)
- [ ] If no automated viewport test exists, manual sweep widths and outcomes documented in PR notes

### Overlay and floating UI safety (AGENTS.md: Floating/overlay safety)

For blocks with absolute/fixed positioned elements, dropdowns, modals, popovers, or panels:

- [ ] `box-sizing: border-box` on all floating elements
- [ ] `max-width: 100%` on floating elements
- [ ] Parent-aware width clamps for narrow breakpoints (360-414px)
- [ ] Floating elements do not create horizontal overflow at any supported breakpoint
- [ ] Floating elements do not overlap neighboring cards or content at any supported breakpoint
- [ ] Mini-cart panel, search dropdown, auth dropdown, and modals stay within viewport bounds at all widths
- [ ] Mobile sidebar/menu navigation prevents body scroll when open (`overflow: hidden` on body)
- [ ] Z-index stacks managed: mini-cart, search, auth dropdown, nav overlay, and modals do not conflict

### CSS variant model (AGENTS.md: Variant model, Specificity ordering)

- [ ] Variants use data attributes (`[data-align='center']`), not ad-hoc utility classes
- [ ] No generic class names without block prefix (`.content` should be `.hero-cta-content`)
- [ ] Specificity ordered low-to-high within each block's CSS:
  ```
  .hero-content { ... }                          /* base */
  .hero[data-loading] .hero-content { ... }      /* data-attribute */
  .hero[data-align='left'][data-gradient] { ... } /* compound */
  ```
- [ ] No specificity wars between blocks (block-scoped selectors prevent conflicts)

### Design token compliance (AGENTS.md: CSS Rules)

- [ ] Design tokens used instead of hardcoded values: `var(--color-brand-500)`, `var(--spacing-3)`, etc.
- [ ] Colors use modern notation: `rgb(0 0 0 / 55%)`, not `rgba(0, 0, 0, 0.55)`
- [ ] No `transition: all` — transition only the properties that need to change
- [ ] No undocumented `!important` declarations
- [ ] Shorthand properties used where stylelint expects them
- [ ] Responsive breakpoints consistent with project's design token grid
- [ ] `contain: layout paint` considered for isolated blocks to prevent layout thrash

### Accessibility geometry (AGENTS.md: Accessibility)

- [ ] Tap targets at least 44x44 px at all viewports (especially mobile: 360-414px)
- [ ] `:focus-visible` outlines present on all interactive elements — never removed without visible replacement
- [ ] Focus outlines not clipped by `overflow: hidden` on parent containers
- [ ] AA contrast met for critical text and CTA states (4.5:1 for normal text, 3:1 for large text)
- [ ] `prefers-reduced-motion` respected — no animation or transition runs when reduced motion is active:
  ```css
  @media (prefers-reduced-motion: reduce) {
    .block-element { transition: none; animation: none; }
  }
  ```

### Visual spec coverage

Cypress visual specs that belong to this skill's domain:

- [ ] `headerDesktopScreenshot.spec.js` — header layout at desktop viewports
- [ ] `headerTypographyDump.spec.js` — header typography consistency
- [ ] `searchBarVisualCheck.spec.js` — search bar visual integrity
- [ ] Percy snapshot specs (`@snapPercy` tagged) — visual regression tracking
- [ ] `verifyHeaderLayout.spec.js` — header controls within viewport bounds (360-1280px, +/- 2px tolerance)

## Output format

Emit findings using the shared finding schema from `_contracts/finding-schema.md`. Each finding should include viewport-specific evidence:

```
id: visual-geometry-auditor/visual-geometry/1
domain: visual-geometry
severity: blocker
confidence: verified
summary: hero-cta CTA buttons overflow viewport at 360px width, creating 8px horizontal scroll
evidence: blocks/hero-cta/hero-cta.css:124 — .hero-cta-buttons lacks max-width constraint
principle: Responsive Geometry Gate: hard geometry leak > 2px is treated as a defect
remediation: Add max-width: 100% and box-sizing: border-box to .hero-cta-buttons; verify at 360, 390, 414px
```

## Cross-skill awareness

| Action | Delegate to |
|--------|------------|
| CSS implementation fixes (refactoring selectors, adding constraints) | `storefront-block-author` |
| Route functional behavior issues found during visual review | `route-smoke-auditor` |
| Design token definition issues (missing tokens in styles.css) | `storefront-block-author` |

**Owns**: Viewport sweep validation, overflow/clipping detection, overlay/floating safety, CSS variant model compliance, design token usage, specificity ordering, accessibility geometry (tap targets, focus, contrast), visual evidence interpretation.

**Boundary with `route-smoke-auditor`**: This skill owns visual correctness ("does it look right at each viewport?"). Functional behavior ("does the route work?") belongs to `route-smoke-auditor`. Visual Cypress specs = this skill's territory. Functional Cypress specs = `route-smoke-auditor` territory.

## Evidence patterns

- **Overflow**: Identify the CSS rule causing overflow, the viewport width where it fails, and the pixel measurement of the leak.
- **Overlay conflicts**: Show the z-index values of conflicting layers and the viewport where they overlap.
- **Variant model**: Show the offending CSS selector and what it should be (data-attribute instead of class).
- **Design tokens**: Show the hardcoded value and the design token it should reference.
- **Tap targets**: Show the element, its computed size at the problematic viewport, and the 44x44 minimum.
- **Focus clipping**: Show the parent's `overflow: hidden` and the focus outline that it clips.

## Inspect

- `cypress/screenshots/` — captured visual evidence
- `cypress/tmp/` — temporary visual artifacts
- `cypress/src/tests/e2eTests/` — visual spec files (headerDesktopScreenshot, searchBarVisualCheck, etc.)
- `blocks/<block>/<block>.css` — block-specific styles
- `styles/styles.css` — design token definitions and global styles
- `AGENTS.md` — responsive geometry gate, CSS rules, accessibility, floating/overlay safety

## Produce

- Viewport sweep results with per-width pass/fail
- Geometry findings with pixel-level evidence
- Overlay safety findings
- CSS variant model compliance findings
- Design token usage findings
- Accessibility geometry findings (tap targets, focus, contrast)
- Delegation notes for implementation fixes

## Avoid

- Making product decisions without visual evidence — tie every conclusion to a screenshot, spec, or CSS rule
- Replacing smoke or metadata validation — those are other skills' domains
- Recommending visual changes based on taste rather than AGENTS.md rules
- Treating box-shadow overflow as a geometry defect (it is a visual-only effect, not a layout failure)
- Running Cypress visual tests directly — this skill analyzes visual artifacts and CSS, it does not execute tests
