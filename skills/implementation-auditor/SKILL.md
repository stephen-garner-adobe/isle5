---
name: implementation-auditor
description: Use when reviewing or implementing Adobe Commerce Storefront block and route code, especially block JS/CSS runtime correctness, lifecycle safety, accessibility, security in code, performance in code, and resilient fallback behavior.
---

# Implementation Auditor

Owns runtime implementation quality for storefront code.

## Owns

- Block JS/CSS correctness
- In-code security controls such as URL sanitization and DOM construction
- Accessibility in implementation
- Lifecycle safety, idempotency, cleanup, and async race handling
- Performance-sensitive implementation choices in block and route code
- Error handling and fallback behavior in code

## Does not own

- README completeness or certification
- `_block.json` and DA.live contract certification
- Lint/build/test execution as a primary responsibility
- Config mode diagnosis or endpoint policy
- Upstream drift analysis

## Inputs

- Target files or blocks
- Route context, if route-specific
- Change type: review, remediation, or implementation
- Relevant rules from `AGENTS.md`

## Workflow

1. Read `AGENTS.md` and the target implementation surfaces.
2. Inspect block JS/CSS and related route code before proposing changes.
3. Evaluate implementation against these runtime concerns:
   - security in code
   - accessibility and semantics
   - lifecycle and idempotency
   - performance and loading phase fit
   - resilience and fallback behavior
4. Emit findings in the shared schema when auditing.
5. When asked to implement, change only the runtime surfaces required and delegate contract or verification concerns to the owning skills.

## Core checks

- Safe URL handling and `_blank` link safety
- No unsafe `innerHTML` or author-content injection
- Semantic interactive elements and usable focus states
- `decorate(block)` safe to re-run
- Cleanup for timers, subscriptions, and global listeners
- Async guards for moved/removed/redecorated blocks
- LCP-sensitive image and import decisions
- Scoped DOM queries and low-thrash DOM updates
- Predictable fallback behavior with actionable warnings

## Output

Emit findings using `skills/_contracts/finding-schema.md`.

Recommended domains:
- `security`
- `accessibility`
- `performance`
- `lifecycle`
- `error-handling`
- `structure`

## Evidence rules

- Prefer exact file and line evidence.
- Tie each finding to one AGENTS rule or principle.
- Keep remediation concrete and implementation-scoped.

## Delegation

- Delegate README, metadata, and `_block.json` parity issues to `authoring-contract-auditor`.
- Delegate config and endpoint issues to `commerce-integration-auditor`.
- Delegate lint, build, route coverage, and geometry evidence to `verification-auditor`.

## Inspect

- `AGENTS.md`
- `blocks/<block>/`
- `scripts/`
- `styles/styles.css`
- Route-specific files related to the affected block

## Avoid

- Owning documentation certification
- Repeating full AGENTS checklists verbatim
- Expanding scope into unrelated routes or config surfaces
