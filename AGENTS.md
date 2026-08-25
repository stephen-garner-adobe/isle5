# Adobe Commerce Storefront Repository Rules

These instructions govern the whole repository. More specific `AGENTS.md` files apply within
their directories and may add or tighten rules. When instructions conflict, use the closest
path-scoped file unless it conflicts with security, data safety, or an explicit user request.

## Instruction Scope

| Path | Guidance |
|---|---|
| `AGENTS.md` | Cross-cutting repository, Commerce, safety, and validation rules |
| `blocks/AGENTS.md` | Block implementation, configuration, styling, accessibility, and docs |
| `scripts/AGENTS.md` | Commerce integration, drop-ins, endpoints, events, analytics, and upgrades |
| `ue/AGENTS.md` | DA.live and Universal Editor models and generated authoring configuration |
| `cypress/AGENTS.md` | PaaS/SaaS end-to-end tests, fixtures, and stateful-flow safeguards |

## Normative Language and Priority

- **MUST**, **REQUIRED**, and **MANDATORY** are non-negotiable.
- **SHOULD** and **RECOMMENDED** are defaults unless an explicit exception is documented.
- **MAY** and **OPTIONAL** are situational.

Apply rules in this priority order:

1. Security, privacy, and data safety
2. Accessibility and semantic correctness
3. Commerce correctness and shopper-state integrity
4. Runtime performance and loading lifecycle
5. Authoring and configuration contract correctness
6. Maintainability and documentation
7. Visual preferences

## Authoritative Sources

Use the source responsible for the layer being changed. Do not treat one documentation site as
globally authoritative for every layer.

| Source | Authoritative scope |
|---|---|
| https://docs.da.live/ | Document Authoring, DA APIs, libraries, content structures, preview/publish workflows, and DA-backed Universal Editor models |
| https://experienceleague.adobe.com/developer/commerce/storefront/ | Adobe Commerce blocks, drop-ins, endpoints, routes, analytics, upgrades, and shopper flows |
| https://www.aem.live/docs/ | Edge Delivery Services runtime, block delivery, metadata, performance, and platform behavior |
| Local code, configuration, and installed package types | APIs, paths, commands, and contracts supported by the current branch |
| https://github.com/hlxsites/aem-boilerplate-commerce | Optional upstream comparison and migration reference; never an automatic merge target |

When sources differ:

1. Follow security and data-safety requirements first.
2. Use the authoritative source for the affected layer.
3. Keep implementation compatible with the installed package API and current repository build.
4. Document a migration when current Adobe guidance differs from the repository; do not silently
   combine model generations or APIs.
5. Verify release-sensitive guidance against current official documentation before acting.

## Repository Baseline

- Read `package.json`, its lifecycle scripts, and the relevant local code before assuming a
  boilerplate or drop-in version.
- Do not infer that this repository matches the latest Commerce suite release.
- Suite releases are comparison snapshots. Package upgrades and selective integration changes are
  separate decisions.
- Detect the active authoring model root from `build:json` scripts. This checkout currently uses
  `ue/models/`; do not migrate it to another model layout as part of unrelated work.
- Treat PaaS, Adobe Commerce as a Cloud Service, and Adobe Commerce Optimizer differences as
  explicit configuration concerns.
- B2B guidance applies only when the corresponding packages and backend capabilities are present.

## Repository Ownership

| Path | Ownership and purpose |
|---|---|
| `blocks/` | Content and Commerce block wrappers, behavior, and styles |
| `scripts/commerce.js` | Shared Commerce configuration, routing, loading, and helpers |
| `scripts/initializers/` | Drop-in endpoint, dictionary, and initialization setup |
| `scripts/scripts.js` | Global page orchestration and eager/lazy/delayed loading |
| `scripts/aem.js` | Core AEM/EDS runtime; keep unchanged unless the task explicitly requires it |
| `build.mjs` | Drop-in build and query shaping |
| `scripts/__dropins__/` | Generated vendor output; never hand-edit |
| `ue/models/` | Source authoring models for this checkout |
| `component-definition.json`, `component-models.json`, `component-filters.json` | Generated root authoring artifacts |
| `cypress/` | Separate end-to-end test workspace |

Prefer the narrowest owned extension point:

1. Block options, slots, wrappers, and CSS
2. Shared helpers and initializers
3. Build/query configuration
4. Vendored or core runtime changes only when explicitly required and documented

Do not change package lifecycle scripts such as `postinstall`, `postupdate`, or
`install:dropins` without an explicit task and a full clean-install verification.

## Change Scope

- New blocks and major architecture rewrites must comply with all applicable nested instructions.
- Micro-fixes should remain scoped and preserve existing authoring and runtime contracts.
- Security, privacy, and accessibility defects must satisfy the relevant mandatory rules even when
  the code change is small.
- Do not bundle upstream migrations, dependency majors, model-layout migrations, or unrelated
  cleanup into a feature or bug-fix change.
- Preserve unrelated working-tree changes. Never stage or commit them without explicit scope.

## Configuration Ownership

Use these boundaries unless a documented project contract requires otherwise:

- **Block table:** authored content and block-specific behavior or settings.
- **Section metadata:** section/container layout and presentation shared by content in the section.
- **Page metadata:** SEO, indexing, caching, social fields, and route-level semantics.
- **Repository configuration:** endpoints, locales, store views, feature flags, and runtime wiring.

Do not force all behavior into section metadata. Do not put page concerns or credentials into block
content. Keep authored field names, JavaScript readers, Universal Editor models, and documentation
aligned.

## Commerce Integration Principles

- Prefer Adobe Commerce drop-ins for supported shopper experiences.
- Use documented public APIs, containers, slots, events, and utilities only.
- Never import private package internals or generated `chunks/` files.
- Import the relevant initializer instead of reimplementing drop-in initialization in a block.
- Reuse helpers from `scripts/commerce.js` and `scripts/aem.js` before adding local variants.
- Do not hardcode product paths, store codes, GraphQL endpoints, placeholder paths, or locale
  behavior when a shared helper or configuration exists.
- Keep catalog/discovery traffic and shopper-state traffic on their configured clients.
- Preserve authored fallback content until enhanced UI is ready. Failed enhancement must leave a
  usable result where practical.
- Treat multi-store, locale, currency, authentication, cart, and wishlist state as connected
  concerns; test relevant combinations after changing routing or initialization.

## Generated and Vendor Artifacts

- Never hand-edit `scripts/__dropins__/`.
- Never hand-edit generated root component JSON when the source model can be changed instead.
- After changing any `ue/models/` source, run `npm run build:json`.
- After changing drop-in package versions, run a clean install with normal lifecycle scripts and
  verify the regenerated vendor output.
- If a generated artifact must be patched directly, document why its source or wrapper layer was
  insufficient, the risk, and the regeneration strategy.

## Security and Privacy

- Never commit or expose secrets, private API keys, bearer tokens, customer tokens, or credentials.
- Never log customer PII, addresses, payment details, cart identifiers, auth tokens, or raw
  shopper-state GraphQL responses.
- Do not store authentication or payment tokens in `localStorage` or custom cookies. Use the
  supported drop-in and backend flows.
- Treat authored content, metadata, URL values, API responses, and analytics payloads as untrusted.
- Allow only approved URL schemes and safe relative URLs. Block `javascript:`, unsafe `data:`,
  and equivalent injection vectors.
- For `target="_blank"`, enforce `rel="noopener noreferrer"`.
- Do not inject author-controlled strings with `innerHTML`, `DOMParser`, or
  `createContextualFragment`. Fully static in-repo templates are allowed only when they contain
  no author- or API-controlled interpolation.
- Redact sensitive fields from warnings, telemetry, screenshots, and test artifacts.
- Use least-privilege, non-production test accounts for stateful end-to-end flows.

## Accessibility and Performance

- Preserve semantic controls, keyboard access, visible `:focus-visible` states, and meaningful
  labels and errors.
- Respect `prefers-reduced-motion`; avoid motion that is required to understand content.
- Maintain a minimum `44x44` target for primary touch controls.
- Manage focus for dialogs, drawers, validation failures, and route transitions.
- Inspect the current `scripts/scripts.js` lifecycle before changing eager, lazy, or delayed work.
- Mark only a known LCP asset eager. Do not assume the first image is always the LCP candidate.
- Keep first-section code lightweight and defer third-party work through the project lifecycle.
- Avoid document-wide scans, layout thrashing, duplicate global listeners, and unconditional heavy
  imports.

## Quality Gates

Run checks in proportion to risk.

### Every code change

```bash
npm run lint
```

Also run `git diff --check` before handoff.

### Authoring model changes

```bash
npm run build:json
```

Confirm the generated root JSON matches source models and contains no unrelated changes.

### Drop-in or dependency changes

- Run `npm ci` with normal lifecycle scripts.
- Confirm `npm run install:dropins` succeeds.
- Run `npm outdated` and review release notes.
- Run `npm audit --omit=dev`; do not apply broad or forced audit fixes without reviewing package
  ownership and breaking changes.
- Test the affected Commerce integration points and error paths.

### Route-critical changes

Run relevant tests from the `cypress/` workspace and identify whether PaaS or SaaS configuration
was used. Cover the affected guest, authenticated, multistore, and error states.

A runner crash, timeout, missing credential, unavailable backend, or sandbox failure is not a test
pass. Record it separately from an application assertion failure and use a safe fallback probe only
as supplemental evidence.

## External State and Publishing

- Code changes do not authorize content publication, DA.live writes, orders, account creation,
  external messages, or production deployment unless the task explicitly includes them.
- Use preview or isolated test environments for stateful verification.
- Before destructive or externally consequential actions, resolve the exact target and confirm the
  action is within scope.
- Pushing or merging is allowed only when explicitly requested.

## Exceptions

If a mandatory rule cannot be followed, document:

- the rule being waived;
- the reason;
- the risk;
- the mitigation;
- the follow-up owner or condition.

Silent exceptions are not allowed.

## Before Handoff

1. Confirm applicable root and nested instructions were followed.
2. Confirm source, generated, and vendor ownership boundaries were respected.
3. Confirm authoring models, code readers, and documentation agree.
4. Confirm sensitive data is absent from code, logs, fixtures, and artifacts.
5. Run the relevant lint, build, geometry, and route checks.
6. Report commands run, failures or environmental blockers, and untested states.
7. List any intentionally preserved unrelated working-tree changes.
