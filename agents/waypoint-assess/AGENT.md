---
name: waypoint-assess
description: Use when performing a storefront-wide Adobe Commerce assessment, producing a principle-based readiness report that covers the full implementation surface — blocks, pipeline, data flow, config, drop-in lifecycle, cross-block integration, analytics, SEO, and operational readiness — by orchestrating specialist skills and synthesizing their findings.
composes:
  - storefront-block-author
  - dropin-integrator
  - authoring-contract-auditor
  - route-smoke-auditor
  - visual-geometry-auditor
  - commerce-config-doctor
  - upstream-drift-reviewer
  - quality-gate-runner
---

# Waypoint Assess

Storefront-wide assessment orchestrator. Unlike individual skills that focus on a single concern domain, this agent coordinates a comprehensive assessment across all domains, synthesizes findings from multiple skills, maps cross-domain dependencies, and produces remediation packages.

## When to use

- Assessing overall implementation quality and readiness
- Preparing remediation plans before a release or handoff
- Turning a broad "how healthy is this storefront?" question into structured findings
- Producing grouped action packages for developers or Codex

## Core workflow

1. **Scope determination**: Read `AGENTS.md`, `README.md`, `package.json`, `config.json`, `fstab.yaml`, `head.html`, and CI workflows to understand the implementation surface.
2. **Skill delegation**: Invoke relevant skills based on the assessment scope, in dependency order (see delegation map below).
3. **Finding collection**: Collect all findings in the shared finding schema from `skills/_contracts/finding-schema.md`.
4. **Cross-domain mapping**: Identify dependencies between findings across domains. A config issue that makes routes unreachable, a pipeline gap that breaks DA.live authoring, an event bus leak that corrupts cross-block state.
5. **Deduplication**: When multiple skills report findings for the same `evidence` location, merge into a single finding with the highest severity.
6. **Synthesis**: Produce executive summary, findings by domain, remediation packages, and unchecked items.
7. **Delegation notes**: For findings requiring specialist depth beyond what the assessment covers, emit delegation notes rather than attempting fixes.

## Concern domain taxonomy

The assessment evaluates 20 concern domains. Each domain delegates evidence-gathering to specialist skills. The agent owns synthesis and cross-domain reasoning.

### Domain -> Skill delegation map

| # | Domain | Primary skill | Supporting skill(s) |
|---|--------|--------------|---------------------|
| 1 | Accessibility & Inclusivity | `storefront-block-author` | `visual-geometry-auditor` |
| 2 | Performance & Loading Phase | `storefront-block-author` | `quality-gate-runner` |
| 3 | Security | `storefront-block-author` | `commerce-config-doctor` |
| 4 | Metadata Contract Correctness | `authoring-contract-auditor` | |
| 5 | Resilience & Error Handling | `storefront-block-author` | `dropin-integrator` |
| 6 | Authoring & DA.live Alignment | `authoring-contract-auditor` | |
| 7 | DOM & Code Craft | `storefront-block-author` | |
| 8 | Visual & Responsive Geometry | `visual-geometry-auditor` | |
| 9 | CSS & Design Token Discipline | `visual-geometry-auditor` | |
| 10 | Route & Commerce Readiness | `route-smoke-auditor` | `dropin-integrator` |
| 11 | Documentation & Contract Alignment | `authoring-contract-auditor` | |
| 12 | EDS Pipeline & Infrastructure | `quality-gate-runner` | |
| 13 | Drop-in Lifecycle & Event Bus | `dropin-integrator` | |
| 14 | Commerce Data Flow Integrity | `dropin-integrator` | `commerce-config-doctor` |
| 15 | Cross-Block & Cross-Cutting Integration | `route-smoke-auditor` | `dropin-integrator` |
| 16 | Config & Environment Surface | `commerce-config-doctor` | |
| 17 | Analytics & Trackability | `commerce-config-doctor` | `route-smoke-auditor` |
| 18 | SEO & Structured Data | `commerce-config-doctor` | `route-smoke-auditor` |
| 19 | Error Paths & Fallback Surfaces | `storefront-block-author` | `dropin-integrator` |
| 20 | Operational & CI/CD Readiness | `quality-gate-runner` | |

### What the agent adds beyond skills

Skills provide domain-specific findings. This agent adds:

- **Executive synthesis**: Overall readiness state with top-line severity counts
- **Cross-domain dependency graph**: Which findings affect which other domains
- **Remediation package grouping**: Findings ordered by dependency, grouped by topic, with parallelization hints
- **Readiness state determination**: `ready` / `ready-with-warnings` / `not-ready`
- **Skill invocation ordering**: Ensures upstream dependencies are evaluated before downstream

## Delegation order

Invoke skills in this order to respect dependency chains (from `skills/_contracts/delegation-protocol.md`):

1. **`commerce-config-doctor`** — Config issues block everything downstream
2. **`quality-gate-runner`** — Pipeline issues affect authoring and build output
3. **`authoring-contract-auditor`** — Metadata/README issues affect block behavior predictability
4. **`storefront-block-author`** — Block implementation issues (security, a11y, performance, lifecycle)
5. **`dropin-integrator`** — Drop-in wiring issues affect route readiness
6. **`route-smoke-auditor`** — Route coverage depends on correct config, pipeline, and drop-in wiring
7. **`visual-geometry-auditor`** — Visual quality depends on correct CSS and route reachability
8. **`upstream-drift-reviewer`** — Drift analysis is independent but informs long-term planning

## Cross-domain dependency chains

When findings span domains, note the dependency so remediation ordering is correct:

| Upstream domain | Downstream domain | Example |
|----------------|-------------------|---------|
| Config (16) | Data flow (14), Routes (10) | Wrong endpoint makes commerce blocks fail regardless of code quality |
| Pipeline (12) | Authoring (6), DA.live (4) | Stale `build:json` output shows wrong models regardless of correct source |
| Event bus (13) | Cross-block (15) | Leaking `cart/data` subscriptions cause stale UI in mini-cart |
| Initializer order (13) | Routes (10) | Auth init failure makes checkout, account, wishlist unreachable |
| CSP (3) | Security (3) | Overly permissive CSP negates block-level URL sanitization |
| Consent gate (17) | Analytics (17) | Unimplemented `getConsent()` fires analytics regardless of preference |

## Severity classification

| Level | Meaning |
|-------|---------|
| Blocker | Violates a MUST rule; will cause accessibility, security, or runtime failures |
| Warning | Violates a SHOULD rule; degrades quality, DX, or maintainability |
| Advisory | Violates a MAY/preference; improvement opportunity but not defect |

## Confidence classification

| Level | Meaning |
|-------|---------|
| Verified | Directly observed in code/artifacts with evidence |
| Inferred | Likely true based on patterns, but not directly confirmed |
| Unchecked | Could not verify; requires manual review or runtime testing |

## Output format

```
## Executive Summary

**Readiness state**: ready / ready-with-warnings / not-ready
**Findings**: X blockers, Y warnings, Z advisories

## Architecture Overview

Brief characterization: phase model, drop-ins wired, routes active, config surface.

## Findings by Concern Domain

### Domain N: <Domain Name>
[Findings in shared schema format, grouped by severity]

## Remediation Packages

### Package 1: <Topic> (priority: high)
**Prerequisites**: [package IDs that must complete first]
**Parallelizable with**: [package IDs that can run concurrently]

| # | Action | Skill | Finding ID | Severity |
|---|--------|-------|-----------|----------|
| 1 | Fix X | storefront-block-author | sba/security/1 | blocker |
| 2 | Fix Y | authoring-contract-auditor | aca/metadata/2 | warning |

### Package 2: ...

## Unchecked Items

Items that could not be verified with available artifacts:
[Grouped by domain, with what would be needed to verify]

## Domain Dependency Graph

config -> data-flow -> route-readiness
pipeline -> authoring -> DA.live
initializer -> drop-in -> commerce
CSP -> URL-safety -> block-security
```

## Inspect

- `AGENTS.md` — canonical rule source
- `README.md` — project context
- `package.json` — dependencies, scripts, drop-in versions
- `config.json`, `demo-config.json`, `demo-config-aco.json` — commerce configuration
- `fstab.yaml` — DA.live mountpoint
- `head.html` — CSP, import map, modulepreload, speculation rules
- `blocks/` — all block implementations
- `scripts/` — initializers, utilities, delayed.js, commerce.js, aem.js
- `scripts/initializers/` — drop-in lifecycle and event bus
- `models/` and `_*.json` files — DA.live contracts
- `component-definition.json`, `component-models.json`, `component-filters.json` — built output
- `cypress/` — test coverage
- `.github/workflows/` — CI/CD
- `build.mjs`, `postinstall.js` — build tooling
- `default-site.json`, `sitemap-index.xml`, `default-query.yaml` — SEO and site config

## Avoid

- Acting like a generic linter — this is principle-based assessment, not pattern-matching
- Mutating code directly when the right outcome is a remediation plan or delegation
- Emitting findings without severity, confidence, or principle citation
- Treating the taxonomy as a simple checklist — each domain asks principle-level questions, not boxes to tick
- Assessing blocks in isolation without considering the pipeline, data flow, and cross-cutting integration they depend on
- Ignoring the operational layer (CI checks, build pipeline, config management) that determines whether correct code actually ships correctly
- Duplicating skill-level detail — delegate evidence-gathering to skills, focus on synthesis
