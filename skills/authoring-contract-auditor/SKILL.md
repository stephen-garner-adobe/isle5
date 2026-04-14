---
name: authoring-contract-auditor
description: Use when verifying Adobe Commerce Storefront authoring contracts in repositories like isle5, especially metadata naming/precedence/normalization, README completeness, DA.live definitions/models/filters alignment, and bidirectional parity between implementation code and author-facing documentation.
---

# Authoring Contract Auditor

This skill merges two former skills — `metadata-contract-checker` and `authoring-docs-sync` — into a single bidirectional auditor. It verifies that author-facing documentation and DA.live contracts stay aligned with implementation code, and vice versa.

## When to use

- Auditing metadata-heavy blocks for naming, precedence, or normalization issues
- Checking that README documentation matches actual implementation behavior
- Verifying DA.live `_block.json` contracts after block behavior changes
- Building authoring contracts for a new block alongside `storefront-block-author`
- Detecting drift between code and docs after iterative block updates
- Validating that `npm run build:json` output is in sync with source `_*.json` files

## Discovery questions

1. **Checking or building?** Are you auditing an existing block's contracts, or building contracts for a new block?
2. **Metadata complexity?** Is the block metadata-heavy (many section metadata keys with precedence) or simple (0-2 keys)?
3. **Recent changes?** Has the block recently changed behavior that might have drifted from docs?
4. **Which direction?** Is the concern code-to-docs drift (behavior changed, docs stale) or docs-to-code drift (docs promise behavior not implemented)?

## Core workflow

1. Read `AGENTS.md` — metadata contract rules, README requirements, DA.live JSON config rules.
2. Read the block implementation (`blocks/<block>/<block>.js`) and extract all metadata keys, precedence logic, normalizers, and fallback behavior.
3. Read the block README and extract all documented metadata keys, values, effects, and precedence descriptions.
4. Read `_block.json` and extract definitions, models, and filters.
5. Run the bidirectional comparison using the checklists below.
6. Emit findings for every mismatch between code and docs, or between `_block.json` and actual authoring shape.
7. Verify `npm run build:json` output is in sync (delegate execution to `quality-gate-runner` if needed).

## Checklists

### Metadata naming (AGENTS.md: Block-specific metadata naming)

- [ ] Block-specific keys use compact block prefix derived from block name without internal hyphens (e.g., `hero-cta` -> `herocta`)
- [ ] Format is `<blockprefix>-<field>` with single hyphen between prefix and field
- [ ] No underscores in metadata key names
- [ ] No `data-` in author-facing metadata key names
- [ ] Field tokens are semantically clear and stable (`btn`, `cta`, `img` abbreviations acceptable when consistent)
- [ ] No generic keys (`align`, `size`, `density`) — always block-prefixed
- [ ] Adobe native section metadata (`Style`, `Padding`, `Margin`, `Column Width`, `Gap`) kept distinct — not renamed into block-prefixed forms unless project has explicit compatibility layer documented in README

### Metadata precedence (AGENTS.md: Metadata precedence contract)

- [ ] 5-tier precedence order implemented in code: Layout -> Content/Structure -> Style/Shape -> Color/Overrides -> Media/Motion
- [ ] Higher tiers establish layout semantics first; lower tiers refine visuals but never silently break higher-tier semantics
- [ ] No-op combinations detected: if one setting makes another inapplicable, treated as no-op and logged with block-prefixed warning
- [ ] Hidden coupling avoided; if coupling is intentional, codified as explicit rule
- [ ] Style fields control structure/chrome only; color fields control color only (style vs color contract)
- [ ] A style option does not silently override explicit color metadata unless documented as intentional rule

### Metadata resolution (AGENTS.md: DA.live section metadata reads, Normalize and persist)

- [ ] `getConfigValue(blockValue, sectionData, keys, fallback)` helper used for all config resolution — not inline `||` chaining
- [ ] Double-prefix reading: both `section.dataset.<blockprefixCamelCase>` and `section.dataset.data<blockprefixCamelCase>` checked
- [ ] Same helper signature used across blocks to reduce drift (shared utility or identical local helper)
- [ ] All author-facing options validated with normalizer functions
- [ ] Normalizers fall back safely to documented default values
- [ ] Invalid values logged with block-prefixed actionable warnings: `blockname: invalid <key>="<value>"; expected <allowed>; using "<fallback>"`
- [ ] Resolved values persisted to `block.dataset.*` so CSS reads stable state

### README completeness (AGENTS.md: README Requirements)

- [ ] **Overview** section present
- [ ] **DA.live integration** section with authoring structure described
- [ ] **Configuration options** section present
- [ ] **Behavior patterns** section present
- [ ] **Accessibility notes** section present
- [ ] **Troubleshooting** section present
- [ ] **Authoring examples** with at least one literal example showing exact DA.live table structure
- [ ] **DA.live Model Options** table present (maps model fields to authoring UI)
- [ ] **Section Metadata Reference** table present — 3 columns: key/field, possible values, effect
- [ ] Section Metadata Reference grouped by functional area
- [ ] Section Metadata Reference mirrors the precedence contract (same tier names, same order)
- [ ] Defaults documented in the "effect" column text
- [ ] **Metadata Precedence** section present — uses same tier names and order as code implementation
- [ ] For non-trivial precedence: **Override Rules** table (condition, winner, ignored/no-op fields, user-visible effect)
- [ ] For non-trivial precedence: **Conflict/No-op Notes** for common invalid combinations
- [ ] For mutually exclusive options: **Conflict Matrix**
- [ ] Route/page metadata requirements documented for route-specific blocks (`Robots`, `Cache Control`, page title)

### DA.live contract (AGENTS.md: DA.live JSON Config)

- [ ] `_block.json` `definitions` array: `rows` and `columns` match actual authoring table structure the block expects
- [ ] `definitions` `behaviour` value is correct (`"columns"` is most common)
- [ ] `definitions` `id` matches block folder name
- [ ] `models` fields match implemented behavior — no stale fields for removed features, no missing fields for new features
- [ ] `models` field `component` types correct (`text`, `select`, `number`, `richtext`, `boolean`)
- [ ] `models` field `value` defaults match code defaults
- [ ] `models` field `options` (for `select`) match the allowed values in code normalizers
- [ ] `filters` array correctly defines which child components are allowed
- [ ] Block registered in `models/_component-definition.json` — either explicit entry or matching existing glob pattern (e.g., `product-*`)
- [ ] `npm run build:json` output reflects current source — `component-definition.json`, `component-models.json`, `component-filters.json` are in sync

### Bidirectional alignment (cross-cutting)

- [ ] **Code -> Docs**: Every metadata key read in JS code appears in the README Section Metadata Reference table
- [ ] **Docs -> Code**: Every key listed in the README Section Metadata Reference table is actually read and used in code
- [ ] **Precedence parity**: Tier names in README are identical to tier names/comments in code
- [ ] **Default parity**: Default values in README "effect" column match fallback values in code normalizers
- [ ] **Value parity**: Allowed values in README "possible values" column match the validation sets in code normalizers
- [ ] **Model-to-code parity**: Every field in `_block.json` models corresponds to actual authoring behavior in the block
- [ ] **Authoring example accuracy**: Example tables in README use real key names and realistic values that the block actually supports
- [ ] **Removal completeness**: If a metadata key was removed from code, it is also removed from README, `_block.json` models, and `component-models.json`

## Output format

Emit findings using the shared finding schema from `_contracts/finding-schema.md`. Each finding should include evidence from both sides of any drift:

```
id: authoring-contract-auditor/metadata-contract/1
domain: metadata-contract
severity: warning
confidence: verified
summary: herocta-btnwidth key in README lists "fluid" as valid but normalizeButtonWidth() at line 45 does not accept it
evidence: blocks/hero-cta/README.md:78 vs blocks/hero-cta/hero-cta.js:45
principle: Metadata Contract Rules > Normalize and persist: validate every author-facing option
remediation: Either add "fluid" to the normalizer's allowed values or remove it from the README table
```

## Cross-skill awareness

| Action | Delegate to |
|--------|------------|
| Implementation fixes to JS/CSS when code must change to match docs | `storefront-block-author` |
| Build pipeline verification (`npm run build:json` execution) | `quality-gate-runner` |
| Runtime behavior verification beyond static analysis | `route-smoke-auditor` |

**Owns**: Metadata naming, precedence, resolution auditing. README completeness and accuracy. DA.live `_block.json` contract alignment. Bidirectional code-to-docs and docs-to-code parity. Build output sync verification (diagnosis, not execution).

## Evidence patterns

- **Metadata naming**: Show the key as it appears in code (`section.dataset.heroctaAlign`) and compare to author-facing form in README (`herocta-align`). Flag mismatches.
- **Precedence drift**: Show the tier order in code (comment or implementation sequence) alongside the tier order in README. Highlight any reordering or missing tiers.
- **Resolution gaps**: Show `getConfigValue()` calls with their key arrays and compare to README's documented key resolution.
- **README gaps**: List required sections (from AGENTS.md) and mark which are present/absent.
- **DA.live contract drift**: Show `_block.json` model fields alongside the actual `decorate()` parameters or config reads that consume them.

## Inspect

- `blocks/<block>/<block>.js` — metadata reads, normalizers, config resolution
- `blocks/<block>/README.md` — author-facing documentation
- `blocks/<block>/_<block>.json` — DA.live definitions, models, filters
- `component-definition.json`, `component-models.json`, `component-filters.json` — aggregated built output
- `models/_component-definition.json` — block registration source
- `AGENTS.md` — metadata contract rules, README requirements, DA.live JSON rules

## Produce

- Metadata drift findings (naming, precedence, resolution)
- README completeness findings (missing sections, tables, examples)
- DA.live contract drift findings (`_block.json` vs implementation)
- Bidirectional alignment findings (code vs docs mismatches)
- Build output sync findings (source vs built file discrepancies)

## Avoid

- Changing runtime behavior unless the task explicitly includes implementation fixes (default to emitting findings with `delegate-to: storefront-block-author`)
- Broad stylistic feedback unrelated to metadata contracts or authoring accuracy
- Duplicating `quality-gate-runner` work — diagnose build drift but delegate execution
- Rewriting README prose style — focus on factual accuracy and required structure only
