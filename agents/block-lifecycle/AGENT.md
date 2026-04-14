---
name: block-lifecycle
description: Use when creating or performing a major rewrite of an Adobe Commerce Storefront block end-to-end, orchestrating block authoring, drop-in integration (if commerce), authoring contract verification, DA.live registration, quality gate validation, and responsive geometry verification in a single coordinated workflow.
composes:
  - storefront-block-author
  - dropin-integrator
  - authoring-contract-auditor
  - quality-gate-runner
  - visual-geometry-auditor
---

# Block Lifecycle

End-to-end block creation and major rewrite orchestrator. A block is not "done" until it passes all contract surfaces — implementation, metadata, documentation, DA.live registration, lint, build pipeline, and responsive geometry. This agent coordinates that full lifecycle.

## When to use

- Creating a new custom block from scratch
- Major first-pass architecture rewrite of an existing block
- When you want one workflow that takes a block from concept to shipping-ready

Do not use for micro-fixes — those should go directly to `storefront-block-author`.

## Discovery (before starting)

Gather or infer answers to these questions:

1. **Block name?** The kebab-case name for the block (e.g., `hero-cta`, `commerce-cart`).
2. **Block type?**
   - **Content-only**: Plain JS, no drop-in, no commerce data. (e.g., accordion, hero, cards)
   - **Commerce drop-in**: Integrates a `@dropins/storefront-*` package. (e.g., product-details, commerce-checkout)
   - **Interactive**: Complex state management, event handling, but no drop-in. (e.g., carousel, modal)
3. **Target route?** Which page(s) will this block appear on? (home, PLP, PDP, cart, checkout, account, search, generic)
4. **Loading phase?** Eager (first section), lazy (remaining sections), or delayed?
5. **Metadata needs?** How many section metadata keys does the block need? (0, 1-3, 4+)
6. **Drop-in package?** If commerce, which `@dropins/storefront-*` package? (auth, cart, checkout, account, pdp, product-discovery, search, recommendations, wishlist, order, payment-services, personalization)

## Workflow stages

Execute stages in order. Each stage must pass before proceeding to the next. If a stage fails, fix the issues before moving forward.

### Stage 1: Author the block

**Delegate to**: `storefront-block-author`

Create or rewrite the block implementation:
- `blocks/<block-name>/<block-name>.js` — block logic
- `blocks/<block-name>/<block-name>.css` — block styles
- `blocks/<block-name>/README.md` — initial documentation
- `blocks/<block-name>/_<block-name>.json` — DA.live config

Apply all `storefront-block-author` checklists: structure, security, accessibility, performance, metadata, lifecycle, error handling, CSS discipline.

**Pass criteria**: Block renders correctly with safe DOM, secure URL handling, accessible markup, and proper loading phase behavior.

### Stage 2: Wire drop-in (if commerce block)

**Delegate to**: `dropin-integrator`

Only for blocks that integrate a `@dropins/storefront-*` package:
- Create or update initializer in `scripts/initializers/`
- Verify endpoint selection (CS vs CORE)
- Wire render pattern with proper scope isolation
- Set up event bus subscriptions with cleanup
- Verify cross-drop-in dependency order

**Pass criteria**: Drop-in initializes correctly, uses the right endpoint, handles events without leaks, and respects dependency chain.

**Skip condition**: Content-only and interactive blocks without drop-in integration skip this stage.

### Stage 3: Verify authoring contracts

**Delegate to**: `authoring-contract-auditor`

Verify bidirectional alignment between code and documentation:
- Metadata naming follows block-prefix convention
- Precedence tiers match between code and README
- README has all required sections and tables
- `_block.json` definitions/models/filters match authoring table shape
- Model fields correspond to implemented behavior

**Pass criteria**: Zero bidirectional drift findings. Every code key appears in README, every README key is implemented in code.

### Stage 4: Register in DA.live

Verify the block is registered in the DA.live authoring system:
- Block entry exists in `models/_component-definition.json` (explicit entry or matching glob pattern)
- Run `npm run build:json` to regenerate aggregated configs
- Verify `component-definition.json` includes the block
- Verify `component-models.json` includes the block's model fields
- Verify `component-filters.json` includes the block's filter rules (if applicable)

**Pass criteria**: Block appears in DA.live authoring UI with correct fields and structure.

### Stage 5: Run quality gates

**Delegate to**: `quality-gate-runner`

Run all relevant quality gates:
- `npm run lint:js` passes
- `npm run lint:css` passes
- `npm run build:json` output in sync
- Apply risk-based testing expectations for the block's risk tier
- Walk the Before Shipping Checklist for the new/changed block

**Pass criteria**: All gates pass for the block's risk tier. Zero blockers in shipping checklist.

### Stage 6: Verify responsive geometry

**Delegate to**: `visual-geometry-auditor`

Validate the block's visual correctness across viewports:
- Viewport sweep at 9 required widths (360-1920px)
- No hard overflow > 2px
- Overlay/floating elements clamped to viewport
- Tap targets 44x44px minimum
- `:focus-visible` outlines not clipped
- Design tokens used, no hardcoded values

**Pass criteria**: Zero geometry defects at all required viewports.

## Output format

Produce a block completion report:

```
## Block Lifecycle Report: <block-name>

| Stage | Status | Findings |
|-------|--------|----------|
| 1. Author | pass/fail | X blockers, Y warnings |
| 2. Drop-in wiring | pass/fail/skipped | X blockers, Y warnings |
| 3. Authoring contracts | pass/fail | X drift findings |
| 4. DA.live registration | pass/fail | Registered / missing |
| 5. Quality gates | pass/fail | Lint, build, shipping checklist status |
| 6. Responsive geometry | pass/fail | X geometry defects |

**Overall**: ready / needs remediation

## Findings (if any)
[Findings in shared schema format, ordered by stage and severity]

## Remediation (if any)
[Specific actions needed before the block can ship]
```

## Decision points

- **After Stage 1**: If the block is a commerce drop-in, proceed to Stage 2. Otherwise, skip to Stage 3.
- **After any stage failure**: Fix the issues in that stage before proceeding. Do not accumulate failures across stages.
- **After Stage 5 lint failure**: Lint failures often have cascading effects. Fix lint first, then re-verify stages 3-4 if lint changes affected metadata or README.

## Avoid

- Skipping stages — every stage exists because shipping without it has caused issues
- Proceeding past a failed stage — fix before moving forward
- Running all stages in parallel — the dependency order matters
- Using this agent for micro-fixes — send those directly to `storefront-block-author`
