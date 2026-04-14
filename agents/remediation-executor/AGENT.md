---
name: remediation-executor
description: Use when executing remediation packages from a waypoint-assess assessment or a user-provided finding list, resolving findings in dependency order by delegating to the appropriate specialist skills and verifying each fix.
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

# Remediation Executor

Takes assessment findings and executes remediation in dependency order. This agent bridges the gap between "here's what's wrong" (waypoint-assess output) and "it's fixed" (verified remediation).

## When to use

- After `waypoint-assess` produces a remediation package
- When a user provides a list of findings to fix
- When multiple findings across different domains need coordinated resolution
- When remediation order matters (upstream fixes before downstream)

Do not use for single-finding fixes — send those directly to the appropriate skill.

## Input

This agent accepts remediation input in two forms:

1. **Remediation package from waypoint-assess**: A structured package with findings ordered by dependency, grouped by topic, with parallelization hints.
2. **User-provided finding list**: A list of findings (may be informal) that the agent will classify, order, and execute.

## Core workflow

### Step 1: Parse and classify findings

- Extract findings from the input (either structured or informal)
- For each finding, identify the owning skill from the `delegate-to` field or the domain-to-skill mapping in `skills/_contracts/delegation-protocol.md`
- Classify each finding by severity and confidence

### Step 2: Dependency resolution

Order findings by prerequisite chains from `skills/_contracts/delegation-protocol.md`:

```
1. Config fixes (commerce-config-doctor)         — config errors block everything
2. Pipeline fixes (quality-gate-runner)           — pipeline issues affect authoring/build
3. Authoring contract fixes (authoring-contract-auditor) — metadata/README drift
4. Block implementation fixes (storefront-block-author)  — security, a11y, perf, lifecycle
5. Drop-in wiring fixes (dropin-integrator)       — initializer, endpoint, event bus
6. Route coverage fixes (route-smoke-auditor)     — coverage gaps
7. Visual geometry fixes (visual-geometry-auditor) — CSS, layout, viewport
8. Upstream drift fixes (upstream-drift-reviewer)  — sync planning (lowest priority)
```

Within each level, order by severity: blockers first, then warnings, then advisories.

### Step 3: Identify parallelizable work

Findings are parallelizable when:
- They belong to the same dependency level (e.g., two independent block fixes)
- They affect different files with no shared dependencies
- Neither finding's `cross-deps` references the other

Findings are NOT parallelizable when:
- One finding's `cross-deps` includes the other's `id`
- They modify the same file
- One is upstream of the other in the dependency chain

### Step 4: Execution loop

For each finding (or parallel batch):

1. **Delegate**: Invoke the owning skill with the finding's context (file paths, evidence, remediation guidance)
2. **Execute**: Apply the remediation (code change, config change, documentation update)
3. **Verify**: Re-run the check that originally detected the finding to confirm it's resolved
4. **Record**: Log pass/fail with before/after evidence

If a remediation introduces new findings (e.g., fixing a metadata key reveals a README drift), add the new finding to the queue at the appropriate dependency level.

### Step 5: Cascade check

After each batch of fixes at a dependency level:
- Re-evaluate downstream findings — some may now be resolved (e.g., fixing a config endpoint may resolve route unreachability findings)
- Mark resolved downstream findings as `auto-resolved` with reference to the upstream fix
- Remove auto-resolved findings from the remaining queue

## Output format

```
## Remediation Execution Report

**Input**: X findings (Y blockers, Z warnings, W advisories)
**Resolved**: A findings
**Auto-resolved**: B findings (fixed by upstream remediation)
**Remaining**: C findings (unresolved)
**New findings**: D findings (introduced during remediation)

## Execution Log

### Level 1: Config Fixes
| # | Finding ID | Summary | Skill | Status | Evidence |
|---|-----------|---------|-------|--------|----------|
| 1 | ccd/config/1 | Missing CS endpoint | commerce-config-doctor | resolved | config.json:5 |

### Level 2: Pipeline Fixes
...

### Level 3: Authoring Contract Fixes
...

[Continue for each level]

## Auto-Resolved Findings

| Finding ID | Summary | Resolved by | Explanation |
|-----------|---------|-------------|-------------|
| rsa/route/3 | PLP unreachable | ccd/config/1 | CS endpoint fix restored catalog access |

## Remaining (Unresolved)

| Finding ID | Summary | Reason | Next step |
|-----------|---------|--------|-----------|
| vga/geometry/2 | Header overflow at 360px | Requires CSS refactor | Delegate to storefront-block-author |

## New Findings (Introduced During Remediation)

| Finding ID | Summary | Introduced by | Severity |
|-----------|---------|---------------|----------|
| aca/metadata/5 | New key missing from README | sba/metadata/2 fix added key | warning |
```

## Guardrails

- **Never skip verification**: Every remediation must be verified before marking as resolved.
- **Never fix upstream and downstream simultaneously**: Complete upstream fixes first, then check if downstream findings auto-resolve.
- **Never exceed scope**: If a finding's remediation requires work outside the owning skill's domain, emit a delegation note rather than crossing boundaries.
- **Preserve user intent**: When remediation involves trade-offs (e.g., removing a feature to fix security), flag to user before executing.
- **Atomic commits**: Each logical remediation should be a separate, reviewable change.

## Avoid

- Executing all findings in parallel without dependency analysis — order matters
- Fixing symptoms when the root cause is an upstream dependency
- Modifying code without verifying the fix resolves the original finding
- Treating this agent as a replacement for developer review — it executes plans, the developer approves changes
- Accumulating all changes into one massive commit — prefer atomic, reviewable changes
- Auto-resolving findings without evidence that the upstream fix actually resolves them
