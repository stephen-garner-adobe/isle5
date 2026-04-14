---
name: upstream-drift-reviewer
description: Use when comparing an Adobe Commerce Storefront implementation like isle5 against upstream boilerplate, especially to identify sync candidates, local divergence, high-risk differences, file classification (upstream-safe vs local-custom vs mixed), and drift severity without recommending blind syncs.
---

# Upstream Drift Reviewer

## When to use

- Reviewing template drift against upstream boilerplate
- Planning upgrade or sync work after upstream releases
- Separating intentional local customization from unintentional drift
- Assessing risk before merging upstream changes
- Identifying which files are safe to sync and which require careful manual merge

## Discovery questions

1. **Upstream remote?** What is the upstream repository? (Default: `hlxsites/aem-boilerplate-commerce` per package.json `repository` field.)
2. **Upstream branch?** Which branch represents the upstream baseline? (Default: `main`.)
3. **Local remote configured?** Is the upstream remote already configured in git? (Check `git remote -v`.)
4. **Acceptable drift threshold?** Full sync alignment, or selective sync of high-value changes only?
5. **Recent upstream changes?** Are there known upstream releases or breaking changes to assess against?

If the upstream remote is not configured, instruct the user to add it:
```bash
git remote add upstream https://github.com/hlxsites/aem-boilerplate-commerce.git
git fetch upstream
```

## Core workflow

1. Verify upstream remote is configured and fetch latest.
2. Run `git diff upstream/main...HEAD` to identify all divergence since the fork point.
3. Classify each changed file into the file classification matrix below.
4. Assess drift severity for each upstream-safe and mixed file.
5. Group sync candidates by risk level and topic.
6. Identify files where local customization is intentional and should not be synced.
7. Emit findings with clear sync/no-sync recommendations and risk assessments.

## Checklists

### Baseline definition

- [ ] Upstream remote identified: `hlxsites/aem-boilerplate-commerce` (or alternative specified by user)
- [ ] Upstream branch identified: `main` (or alternative specified by user)
- [ ] Remote configured in git (`git remote -v` shows upstream URL)
- [ ] Latest upstream fetched (`git fetch upstream`)
- [ ] Fork point identified for diff comparison

### File classification matrix

Classify every file that differs between upstream and local into one of three categories:

**Upstream-safe** — Can sync without risk. Local changes are unintentional drift or can be cleanly replaced.

| File/Pattern | Rationale |
|-------------|-----------|
| `scripts/aem.js` | EDS core — should be zero-drift. Protected by `protect-aem-js.yaml` workflow. |
| `.eslintrc.json`, `.stylelintrc.json` | Lint configs should track upstream unless project has explicit overrides |
| `.editorconfig` | Editor config should match upstream |
| `package.json` lint/build scripts (non-dropin) | Build tooling should track upstream |
| `.github/workflows/` (non-custom) | CI templates should track upstream |

**Local-custom** — Must not blind sync. These files contain intentional project customization.

| File/Pattern | Rationale |
|-------------|-----------|
| `blocks/` (all custom blocks) | Project-specific block implementations |
| `skills/`, `agents/` | Project-specific skill and agent definitions |
| `AGENTS.md` | Project-specific block creation rules |
| `config.json`, `demo-config*.json` | Project-specific commerce configuration |
| `fstab.yaml` | Project-specific DA.live content source |
| `scripts/initializers/` | Project-specific drop-in initialization |
| `models/_component-definition.json` | Project-specific block registration |
| `cypress/` (custom specs/fixtures) | Project-specific test coverage |
| `styles/styles.css` (design tokens) | Project-specific branding |

**Mixed** — Require careful manual merge. Contains both upstream scaffolding and local customization.

| File/Pattern | Upstream portion | Local portion |
|-------------|-----------------|---------------|
| `scripts/commerce.js` | Core commerce utility functions | Endpoint constants, custom header logic, project-specific URL patterns |
| `scripts/scripts.js` | Auto-block building, delayed loading | Custom auto-block patterns, project-specific decorations |
| `scripts/delayed.js` | Delayed script loading pattern | Project-specific analytics, consent, third-party scripts |
| `head.html` | Base CSP policy, EDS boilerplate | Project-specific import map, modulepreload, drop-in entries |
| `package.json` (dependencies) | Base EDS dependencies | Project-specific drop-in versions and custom packages |

### Drift severity classification

| Severity | Criteria | Action |
|----------|----------|--------|
| **High** | Drift in `scripts/aem.js` (should be zero-drift, protected by workflow), `scripts/scripts.js` core lifecycle functions | Sync immediately — these affect platform stability |
| **Medium** | Drift in build tooling (`build.mjs`, `postinstall.js`), lint configs, CI workflows, `package.json` scripts | Sync in next maintenance cycle — review for breaking changes first |
| **Low** | Drift in documentation (README.md boilerplate sections), `.editorconfig`, non-functional configs | Sync when convenient — no functional impact |
| **Intentional** | Drift in `blocks/`, `config.json`, `AGENTS.md`, `skills/`, custom scripts | Do not sync — this is the project's value-add |

### Sync risk assessment

For each sync candidate:

- [ ] Does the upstream change affect APIs used by local custom blocks?
- [ ] Does the upstream change modify function signatures that local code calls?
- [ ] Does the upstream change introduce new dependencies that may conflict?
- [ ] Does the upstream change alter the EDS loading phase behavior?
- [ ] Does the upstream change modify the drop-in integration pattern?
- [ ] Can the sync be tested with existing Cypress specs?

## Output format

Emit findings using the shared finding schema from `_contracts/finding-schema.md`. Additionally, produce a drift summary:

```
## Drift Summary

| Category | File count | Highest severity | Recommended action |
|----------|-----------|-----------------|-------------------|
| Upstream-safe | X | high/medium/low | Sync now / next cycle / when convenient |
| Local-custom | X | intentional | Do not sync |
| Mixed | X | varies | Manual merge required |

## Sync Candidates (grouped by topic)

### Group 1: EDS Core Updates
- scripts/aem.js — severity: high — 12 lines changed upstream
- ...

### Group 2: Build Tooling
- build.mjs — severity: medium — new drop-in override pattern
- ...

### Group 3: No-Sync (Intentional Drift)
- blocks/* — local custom blocks
- config.json — project-specific endpoints
- ...
```

## Cross-skill awareness

| Action | Delegate to |
|--------|------------|
| Block-level drift assessment (custom block vs upstream block pattern) | `storefront-block-author` |
| Config drift assessment (endpoint, header changes in upstream) | `commerce-config-doctor` |
| Build pipeline impact (upstream build tool changes) | `quality-gate-runner` |
| Drop-in version compatibility (upstream drop-in version bumps) | `dropin-integrator` |

**Owns**: Upstream comparison, sync planning, file classification, drift severity assessment, divergence risk analysis, sync candidate grouping.

## Evidence patterns

- **Drift detection**: Show the `git diff upstream/main...HEAD` output for the specific file with line-level changes.
- **Severity classification**: Reference the file classification matrix and explain why the drift level was assigned.
- **Risk assessment**: Show the upstream change and identify which local code paths it affects.
- **Intentional vs unintentional**: Show git blame for the local change — if it has a descriptive commit message indicating intentional customization, classify as intentional.

## Inspect

- `git remote -v` — verify upstream remote configuration
- `git diff upstream/main...HEAD` — full divergence since fork
- `git log upstream/main..HEAD --stat` — local commits since fork
- `git log HEAD..upstream/main --stat` — upstream commits since fork
- `scripts/aem.js` — EDS core (should be zero-drift)
- `scripts/scripts.js`, `scripts/commerce.js`, `scripts/delayed.js` — mixed files
- `head.html` — mixed file (CSP + import map)
- `package.json` — dependency drift
- `build.mjs`, `postinstall.js` — build tooling
- `.github/workflows/` — CI pipeline
- `README.md` — project context

## Produce

- Drift summary with file counts by category
- Sync candidate groups ordered by severity and topic
- File classification for every changed file
- Risk assessment for sync candidates
- No-sync justification for intentional local customization
- Delegation notes for domain-specific drift assessment

## Avoid

- Blind sync recommendations without risk assessment
- Overwriting local implementation choices without review and user consent
- Treating all drift as negative — intentional customization is the project's value-add
- Running `git merge upstream/main` automatically — this skill produces plans, not merges
- File-by-file churn — prefer grouped sync recommendations by topic
