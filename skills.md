# Adobe Commerce Storefront Skills & Agents

Operational skill and agent system for Adobe Commerce Storefront implementations using `isle5` as the reference implementation.

## Architecture

| Layer | Purpose | Location | Format |
|-------|---------|----------|--------|
| **Shared Contracts** | Universal finding schema, severity model, delegation protocol | `skills/_contracts/*.md` | Reference docs |
| **Skills** (9) | Single-concern domain expertise. Stateless. Produce findings or artifacts. | `skills/<name>/SKILL.md` | Frontmatter + markdown |
| **Agents** (3) | Multi-step orchestrators. Route decisions, compose skill outputs, autonomous workflows. | `agents/<name>/AGENT.md` | Frontmatter + markdown |

Skills do not invoke agents. Agents invoke skills. Skills delegate findings outside their domain via the `delegate-to` field in the shared finding schema.

## Reference Model

Use `isle5` as the baseline for how skills and agents reason about a storefront implementation:

- `blocks/` contains reusable custom blocks, DA.live contracts, and block-specific authoring patterns.
- `scripts/__dropins__/` and `scripts/initializers/` define drop-in delivery and integration behavior.
- `cypress/` provides route smoke coverage, end-to-end checks, and visual evidence.
- `AGENTS.md` is the canonical standards and guardrails source of truth.
- `skills/_contracts/` defines the shared finding schema, severity model, and delegation protocol.

## Shared Contracts

All skills and agents share these contracts:

| Contract | File | Purpose |
|----------|------|---------|
| Finding Schema | `skills/_contracts/finding-schema.md` | Universal output shape for all audit findings |
| Severity Model | `skills/_contracts/severity-model.md` | Blocker/warning/advisory classification with confidence levels |
| Delegation Protocol | `skills/_contracts/delegation-protocol.md` | Skill ownership boundaries, dependency chains, delegation rules |

## Skills

### `storefront-block-author`
**Purpose**: Create or update custom storefront blocks that comply with block structure, metadata, accessibility, security, performance, lifecycle, and documentation rules from AGENTS.md.

**Use when**: Building a new block, doing a major block rewrite, or remediating security/accessibility issues in block code.

**Key checklists**: Structure (4 files), Security (URL safety, innerHTML), Accessibility (semantic HTML, focus, tap targets, reduced motion), Performance (LCP, loading phases, DOM batching), Metadata (prefix naming, precedence, normalization), Lifecycle (idempotent decoration, cleanup), Error handling (fallbacks, warnings), CSS discipline (variants, tokens, specificity).

### `dropin-integrator`
**Purpose**: Wire Adobe Commerce drop-ins correctly for the route and commerce domain they serve.

**Use when**: Adding or updating a commerce drop-in, fixing initializer or endpoint issues, debugging event bus leaks.

**Key checklists**: Endpoint matrix (CS vs CORE per drop-in), Initializer lifecycle (guard, setEndpoint, placeholders, mountImmediately), Render pattern (curried render, scope isolation), Event bus lifecycle (on/off pairing, no stacking), Cross-drop-in dependencies (auth -> cart -> checkout chain), Import strategy (dynamic vs static).

### `authoring-contract-auditor`
**Purpose**: Verify bidirectional alignment between implementation code and author-facing documentation — metadata naming, precedence, normalization, README completeness, DA.live contracts.

**Use when**: Blocks rely on section metadata, README drift is likely, DA.live contracts may have drifted from implementation, or a new block needs contract verification.

**Merges**: Former `metadata-contract-checker` and `authoring-docs-sync` skills.

**Key checklists**: Metadata naming (block prefix, no generics), Metadata precedence (5-tier order), Metadata resolution (getConfigValue, double-prefix, normalize-and-persist), README completeness (7 sections, 3-column metadata table, precedence section), DA.live contract (definitions/models/filters match authoring shape), Bidirectional alignment (code vs docs parity).

### `route-smoke-auditor`
**Purpose**: Validate critical storefront routes and detect missing or weak route coverage.

**Use when**: Auditing implementation readiness, validating route-critical changes, checking Cypress coverage.

**Key checklists**: Route inventory (19+ routes mapped to Cypress specs), Coverage gap detection (missing specs, weak coverage, skipped specs), Route-to-block mapping, Prerequisite-gated routes (auth, cart state, config dependencies).

**Boundary**: Owns functional behavior ("does the route work?"). Visual correctness belongs to `visual-geometry-auditor`.

### `visual-geometry-auditor`
**Purpose**: Check responsive geometry, overflow, clipping, spacing drift, overlay safety, and viewport-based visual regressions.

**Use when**: Validating responsive quality, reviewing floating UI, checking CSS compliance, verifying accessibility geometry.

**Key checklists**: Viewport sweep (9 widths, 2px leak threshold), Overlay/floating safety (box-sizing, max-width, z-index), CSS variant model (data attributes, specificity ordering), Design token compliance, Accessibility geometry (44x44 tap targets, focus-visible, AA contrast).

**Boundary**: Owns visual correctness ("does it look right?"). Functional behavior belongs to `route-smoke-auditor`.

### `commerce-config-doctor`
**Purpose**: Diagnose endpoint, header, CSP, environment, and storefront mode issues.

**Use when**: Setup feels inconsistent, auth/commerce requests misbehave, or you need to verify ACO vs Cloud Service mode.

**Key checklists**: Config surface (config.json, demo configs, fstab.yaml), Endpoint/header matrix, Mode detection (ACO vs CS signals), Security config (CSP, secrets, session), Pipeline config (head.html import map, modulepreload, speculation rules), Analytics config.

### `upstream-drift-reviewer`
**Purpose**: Compare the storefront against upstream boilerplate and isolate meaningful sync work.

**Use when**: Reviewing template drift, planning upgrade work, separating customization from unintentional drift.

**Key checklists**: Baseline definition (upstream remote and branch), File classification matrix (upstream-safe, local-custom, mixed), Drift severity (high/medium/low/intentional), Sync risk assessment.

### `quality-gate-runner`
**Purpose**: Validate lint, build pipeline, shipping checklist, CI/CD health, and risk-based testing expectations.

**Use when**: Pre-commit validation, PR review, shipping readiness check, or build pipeline diagnosis.

**Key checklists**: Lint (ESLint + Stylelint), Build pipeline (build:json sync, pre-commit hook, postinstall), Before Shipping Checklist (all 17 AGENTS.md items), CI/CD health (GitHub workflows), Risk-based testing expectations (per block type).

### `commerce-optimizer-catalog-builder`
**Purpose**: Build Adobe Commerce Optimizer catalog-ingestion request sets from the official Data Ingestion schema.

**Use when**: Creating Commerce Optimizer ingestion payloads, modeling categories/products/prices/price books.

**Key features**: Schema-grounded (fetches official Adobe schema on every invocation), discovery questions (product type, price book count, child price books), structured REST template output, validation against official field names and enums.

## Agents

### `waypoint-assess`
**Purpose**: Storefront-wide assessment orchestrator. Delegates evidence-gathering to specialist skills, synthesizes findings, maps cross-domain dependencies, produces remediation packages.

**Promoted from**: Former `waypoint-assess` skill.

**Composes**: All 8 non-catalog skills.

**20 concern domains**: Accessibility, Performance, Security, Metadata, Resilience, Authoring, DOM, Visual Geometry, CSS, Route Readiness, Documentation, Pipeline, Drop-in Lifecycle, Data Flow, Cross-Block, Config, Analytics, SEO, Error Paths, CI/CD.

**Adds beyond skills**: Executive synthesis, cross-domain dependency graph, remediation package grouping with parallelization hints, readiness state determination (ready / ready-with-warnings / not-ready).

### `block-lifecycle`
**Purpose**: End-to-end block creation/rewrite orchestrator.

**Composes**: `storefront-block-author`, `dropin-integrator` (if commerce), `authoring-contract-auditor`, `quality-gate-runner`, `visual-geometry-auditor`.

**Workflow**: Discovery -> Author -> Wire drop-in (if commerce) -> Verify contracts -> Register in DA.live -> Run quality gates -> Verify geometry. Each stage must pass before the next begins.

### `remediation-executor`
**Purpose**: Takes assessment findings and executes remediation in dependency order.

**Composes**: Any skill, as needed per finding.

**Workflow**: Parse findings -> Resolve dependencies -> Identify parallelizable work -> Execute (delegate, apply, verify, record) -> Cascade check (auto-resolve downstream findings).

## How Skills and Agents Work Together

### Assessment flow
```
waypoint-assess (agent)
  -> commerce-config-doctor      (config correctness)
  -> quality-gate-runner          (pipeline health)
  -> authoring-contract-auditor   (metadata/docs alignment)
  -> storefront-block-author      (block implementation quality)
  -> dropin-integrator            (drop-in wiring)
  -> route-smoke-auditor          (route coverage)
  -> visual-geometry-auditor      (responsive geometry)
  -> upstream-drift-reviewer      (sync planning)
  = Synthesized assessment with remediation packages
```

### Block creation flow
```
block-lifecycle (agent)
  -> storefront-block-author      (implement block)
  -> dropin-integrator            (wire drop-in, if commerce)
  -> authoring-contract-auditor   (verify contracts)
  -> quality-gate-runner          (run gates)
  -> visual-geometry-auditor      (verify geometry)
  = Block completion report
```

### Remediation flow
```
remediation-executor (agent)
  -> [findings from waypoint-assess or user input]
  -> dependency-ordered execution via specialist skills
  -> cascade resolution of downstream findings
  = Remediation execution report
```

## Dependency Chains

Skills and agents respect these dependency orders during execution:

| Chain | Order |
|-------|-------|
| Config -> Data flow -> Routes | `commerce-config-doctor` -> `dropin-integrator` -> `route-smoke-auditor` |
| Pipeline -> Authoring -> DA.live | `quality-gate-runner` -> `authoring-contract-auditor` -> `storefront-block-author` |
| Initializer -> Drop-in -> Commerce | `dropin-integrator` -> `route-smoke-auditor` -> `visual-geometry-auditor` |
| CSP -> URL safety -> Block security | `commerce-config-doctor` -> `storefront-block-author` |
