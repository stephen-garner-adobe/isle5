# Delegation Protocol

Defines how skills and agents communicate findings, delegate work, and resolve dependencies.

## Skill-to-skill delegation

Skills do not invoke other skills directly. When a finding falls outside a skill's domain:

1. Emit the finding with `delegate-to: <target-skill-name>` in the finding schema.
2. Include enough context in `evidence` and `summary` for the target skill to act without re-reading the entire codebase.
3. Do not attempt the remediation — the delegating skill's job is diagnosis, not cross-domain repair.
4. If the finding blocks the current skill's own work (e.g., config error prevents route validation), note the dependency in `cross-deps`.

## Agent-to-skill delegation

Agents orchestrate skills. The delegation pattern:

1. Agent determines which skills to invoke based on the assessment scope or workflow stage.
2. Agent passes relevant context: file paths, finding IDs, scope constraints, and any prior findings from earlier workflow steps.
3. Skill produces findings in the shared finding schema (`finding-schema.md`).
4. Agent collects findings, deduplicates by `evidence` field, and synthesizes into its output format.

## Skill ownership boundaries

Each skill owns a defined domain. Ownership means the skill is responsible for both diagnosis and remediation guidance within that domain.

| Skill | Owns | Delegates to |
|-------|------|-------------|
| `storefront-block-author` | Block JS/CSS implementation, in-block security, accessibility, performance, lifecycle, error handling, scaffold contract | `authoring-contract-auditor` for metadata/README alignment, `quality-gate-runner` for lint/build, `visual-geometry-auditor` for responsive geometry |
| `dropin-integrator` | Initializer wiring, render composition, event bus lifecycle, scope isolation, cross-drop-in dependencies | `commerce-config-doctor` for endpoint/config issues, `route-smoke-auditor` for route coverage |
| `authoring-contract-auditor` | Metadata naming/precedence/resolution, README completeness, DA.live contract alignment, bidirectional code-to-docs parity | `storefront-block-author` for implementation fixes, `quality-gate-runner` for build pipeline |
| `route-smoke-auditor` | Route reachability, functional behavior, Cypress functional spec coverage, route-to-block mapping | `visual-geometry-auditor` for visual correctness, `dropin-integrator` for drop-in wiring issues |
| `visual-geometry-auditor` | Viewport sweep, overflow/clipping geometry, overlay safety, design token compliance, CSS variant model, a11y geometry | `storefront-block-author` for CSS implementation fixes |
| `commerce-config-doctor` | Config correctness, environment diagnosis, mode detection, endpoint/header validation, security config, pipeline config | `dropin-integrator` for endpoint wiring fixes, `quality-gate-runner` for CI/CD issues |
| `upstream-drift-reviewer` | Upstream comparison, sync planning, divergence risk, file classification | `storefront-block-author` for block-level drift, `commerce-config-doctor` for config drift |
| `quality-gate-runner` | Lint execution, build pipeline, shipping checklist, CI/CD health, risk-based testing expectations | `storefront-block-author` for implementation fixes, `authoring-contract-auditor` for README/contract fixes |
| `commerce-optimizer-catalog-builder` | Catalog ingestion payload generation (generative skill, does not emit findings) | N/A |

## Standard dependency chains

When findings span domains, remediation must follow these dependency orders. Fixing a downstream issue before its upstream dependency is resolved wastes effort.

### Config -> Data flow -> Route readiness
```
commerce-config-doctor (config correctness)
  -> dropin-integrator (endpoint wiring, data flow)
    -> route-smoke-auditor (route reachability)
```
A wrong endpoint in `config.json` makes all commerce blocks fail regardless of block code quality.

### Pipeline -> Authoring -> DA.live alignment
```
quality-gate-runner (build pipeline, build:json)
  -> authoring-contract-auditor (metadata contracts, README)
    -> storefront-block-author (implementation alignment)
```
Stale `build:json` output means DA.live shows wrong models regardless of correct `ue/models/**/*.json` source.

### Initializer order -> Drop-in lifecycle -> Commerce readiness
```
dropin-integrator (initializer wiring, event bus)
  -> route-smoke-auditor (route functional behavior)
    -> visual-geometry-auditor (visual correctness on route)
```
If auth init fails, checkout, account, and wishlist are unreachable regardless of their block code.

### Security: CSP -> URL sanitization -> Block safety
```
commerce-config-doctor (CSP in head.html)
  -> storefront-block-author (URL sanitization in block code)
```
Overly permissive CSP negates URL sanitization in block code.

## Cross-domain dependency notation

In findings, express dependencies using the `cross-deps` field:

```
id: commerce-config-doctor/config/1
summary: CS_FETCH_GRAPHQL endpoint missing from config.json
cross-deps: ["dropin-integrator/endpoint/1", "route-smoke-auditor/route-coverage/3"]
```

This tells the remediation executor: fix config/1 before attempting endpoint/1 or route-coverage/3.
