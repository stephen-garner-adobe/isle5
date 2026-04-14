---
name: assess
description: Use when performing a storefront-wide or scoped architectural assessment, synthesizing findings from the specialist auditors into a dependency-aware readiness report and remediation package.
composes:
  - commerce-integration-auditor
  - verification-auditor
  - authoring-contract-auditor
  - implementation-auditor
  - upstream-drift-reviewer
---

# Assess

Architectural assessment orchestrator.

## Owns

- Assessment scope definition
- Skill invocation order
- Cross-domain dependency mapping
- Deduplication and synthesis
- Readiness determination
- Remediation package assembly

## Workflow

1. Determine scope: full storefront, route, block family, or release readiness.
2. Run auditors in dependency-aware order:
   - `commerce-integration-auditor`
   - `verification-auditor`
   - `authoring-contract-auditor`
   - `implementation-auditor`
   - `upstream-drift-reviewer` when upgrade posture matters
3. Collect findings in the shared schema.
4. Deduplicate overlapping findings by evidence and root cause.
5. Map upstream/downstream dependencies.
6. Produce:
   - executive summary
   - findings grouped by domain
   - remediation packages in dependency order
   - unchecked items

## Readiness states

- `ready`
- `ready-with-warnings`
- `not-ready`

## Output

- Executive summary
- Findings by domain
- Remediation packages
- Dependency graph
- Unchecked verification surfaces

## Guardrails

- Prefer root-cause grouping over symptom lists.
- Do not mutate code unless the task explicitly requests execution.
- Keep skill-level detail in the specialist outputs; keep synthesis here.
