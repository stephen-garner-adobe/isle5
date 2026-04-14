---
name: execute-remediation
description: Use when taking a finding set or remediation package through ordered execution, routing each item to the owning auditor, applying fixes where requested, and verifying the result according to the selected execution mode.
composes:
  - commerce-integration-auditor
  - verification-auditor
  - authoring-contract-auditor
  - implementation-auditor
  - upstream-drift-reviewer
---

# Execute Remediation

Remediation orchestrator for dependency-ordered fixes.

## Modes

- `plan-only`
- `apply-and-verify`

## Owns

- Finding intake and classification
- Dependency ordering
- Parallelization decisions
- Fix routing to the owning auditor
- Verification routing after changes

## Workflow

1. Parse findings from an assessment or user-provided list.
2. Determine owner for each finding.
3. Order work:
   - integration/platform causes
   - contract/doc causes
   - runtime implementation causes
   - verification gaps
   - upstream drift follow-up
4. Execute in batches where files and dependencies do not overlap.
5. Re-run verification appropriate to the changed surfaces.
6. Mark findings:
   - resolved
   - auto-resolved
   - remaining
   - newly introduced

## Verification policy

- In `plan-only`, record the required verification without claiming resolution.
- In `apply-and-verify`, do not mark a finding resolved until verification evidence exists.

## Output

- Execution log
- Resolved findings
- Auto-resolved findings
- Remaining findings
- New findings

## Guardrails

- Do not fix downstream symptoms before upstream causes.
- Do not claim visual or route verification without evidence.
- Keep changes atomic where practical.
