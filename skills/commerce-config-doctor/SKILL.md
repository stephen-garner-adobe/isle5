---
name: commerce-config-doctor
description: Use when diagnosing Adobe Commerce Storefront configuration issues in repos like isle5, especially endpoint selection, headers, CSP, environment assumptions, auth readiness, ACO vs Cloud Service mode detection, pipeline config in head.html, and mixed-mode storefront signals.
---

# Commerce Config Doctor

## When to use

- Setup feels inconsistent or auth/commerce requests behave unexpectedly
- Diagnosing endpoint, header, or placeholder issues
- Verifying whether the repo targets Commerce Optimizer (ACO), Cloud Service (CS), or a mixed/invalid setup
- Checking CSP configuration, session storage, or environment-specific settings
- Validating `head.html` import map, modulepreload, and speculation rules
- Reviewing config files after environment or drop-in version changes

## Discovery questions

1. **Expected mode?** What commerce mode is expected — Commerce Optimizer (ACO), Cloud Service (CS), or hybrid?
2. **Environment?** What environment is being diagnosed — local dev, staging, production?
3. **Auth/checkout expected?** Are authentication and checkout flows expected to work, or is this a content-only setup?
4. **Recent changes?** Have endpoints, headers, or drop-in versions changed recently?

If not specified, diagnose the mode from config signals and report what the config implies.

## Core workflow

1. Read `config.json`, `demo-config.json`, `demo-config-aco.json`, and `default-site.json`.
2. Read `head.html` for CSP, import map, modulepreload, and speculation rules.
3. Read `scripts/commerce.js` for endpoint constants, header management, and auth logic.
4. Read `scripts/initializers/index.js` for header setup and session state management.
5. Read `fstab.yaml` for DA.live mountpoint configuration.
6. Classify the storefront mode based on config signals.
7. Validate endpoints, headers, and security config against the detected mode.
8. Emit findings for mismatches, missing config, or mixed-mode signals.

## Checklists

### Config surface (waypoint-assess domain 16)

- [ ] `config.json` exists and has valid JSON structure
- [ ] `config.json` `commerce-core-endpoint` present (for CORE_FETCH_GRAPHQL)
- [ ] `config.json` `commerce-endpoint` present (for CS_FETCH_GRAPHQL)
- [ ] `config.json` `headers.cs` includes required catalog service headers (`Magento-Store-Code`, `Magento-Store-View-Code`, `Magento-Website-Code`, `x-api-key`, `Magento-Environment-Id`)
- [ ] `config.json` `headers.all` includes `Store` header
- [ ] `config.json` `analytics` section present with `aep-ims-org-id`, `base-currency-code`, store/website/view info
- [ ] `demo-config.json` is an intentional override, not a stale copy of `config.json`
- [ ] `demo-config-aco.json` is intentional for ACO testing (if ACO mode expected)
- [ ] `default-site.json` contains placeholder values only — no real endpoints, API keys, or credentials
- [ ] `fstab.yaml` DA.live mountpoint URL is correct and `type: markup` is set
- [ ] `fstab.yaml` folder mappings (`/products/`) are correct for the content structure

### Endpoint/header matrix

| Endpoint | Config key | Used by |
|----------|-----------|---------|
| `CORE_FETCH_GRAPHQL` | `commerce-core-endpoint` | auth, cart, checkout, account, order, wishlist, payment-services |
| `CS_FETCH_GRAPHQL` | `commerce-endpoint` | pdp, search, recommendations, personalization |

- [ ] Both endpoints are present and reachable (valid URL format)
- [ ] `CS_FETCH_GRAPHQL` and `CORE_FETCH_GRAPHQL` point to the correct backend (not swapped)
- [ ] Auth headers (Bearer token, `Magento-Customer-Group`) set on login and cleared on logout
- [ ] `AC-Price-Book-ID` header set only when ACO is configured (not present in non-ACO mode)
- [ ] `commerceEndpointWithQueryParams()` produces valid, cache-busted URLs

### Mode detection

Classify the storefront mode by reading config signals:

**Commerce Optimizer (ACO) signals:**
- [ ] `demo-config-aco.json` present with ACO-specific endpoint (`*.api.commerce.adobe.com`)
- [ ] `ac-view-id` header present in config
- [ ] `ac-price-book-id` header present in config
- [ ] `ac-scope-locale` header present in config

**Cloud Service (CS) signals:**
- [ ] Standard `commerce-core-endpoint` and `commerce-endpoint` pointing to Magento/Commerce backend
- [ ] `Magento-Store-Code`, `Magento-Store-View-Code`, `Magento-Website-Code` headers present
- [ ] `x-api-key` and `Magento-Environment-Id` present

**Mixed/invalid signals:**
- [ ] Both ACO and CS-specific headers present simultaneously without clear separation
- [ ] Endpoints point to different environments (e.g., CORE to production, CS to staging)
- [ ] `demo-config.json` and `config.json` have conflicting endpoint configurations

### Security config (AGENTS.md: Security Requirements + waypoint-assess domain 3)

- [ ] No API keys, secrets, GraphQL endpoints with embedded credentials, or auth tokens in committed code (beyond config.json x-api-key which is a public catalog key)
- [ ] CSP in `head.html` appropriately restrictive: `script-src 'nonce-aem' 'strict-dynamic'`, `object-src 'none'`, `base-uri 'self'`
- [ ] CSP does not use overly permissive directives (`unsafe-inline`, `unsafe-eval`, `*`)
- [ ] Session storage config (`getConfigFromSession`) handles expiry correctly (2-hour TTL, re-fetch on stale)
- [ ] Scope and auth boundaries respected: no leaking cart state across websites
- [ ] Website-switching cart invalidation works (clearing `DROPINS__CART__*` on root path change)

### Pipeline config (waypoint-assess domain 12)

- [ ] `head.html` import map includes all `@dropins/storefront-*` packages actually used (no missing entries)
- [ ] `head.html` import map does not include stale entries for removed drop-ins
- [ ] `modulepreload` links limited to truly critical-path modules needed during eager phase
- [ ] `prerender` speculation rules appropriately scoped (not overly broad `"href_matches": "/*"`)
- [ ] Font loading conditional (`sessionStorage` check, desktop-first) to avoid blocking LCP
- [ ] `loadErrorPage()` reconstructs DOM safely (recreating scripts, not injecting arbitrary content)
- [ ] `418.html` and `404.html` error pages exist and have meaningful content

### Analytics and tracking config (waypoint-assess domains 17, 18)

- [ ] `config.json` analytics fields present: `store-code`, `environment-id`, `website-id`, `store-view-id`, `base-currency-code`
- [ ] `aep-ims-org-id` present for AEP integration
- [ ] `getConsent()` implementation reviewed — if stub returning `true`, flag as compliance risk
- [ ] `trackHistory()` localStorage access handles quota errors and private browsing mode

## Output format

Emit findings using the shared finding schema from `_contracts/finding-schema.md`. Additionally, produce a config readiness summary:

```
## Config Readiness

| Surface | Status | Details |
|---------|--------|---------|
| Mode | ACO / CS / Mixed | Signal evidence |
| CORE endpoint | valid/missing/unreachable | URL and headers |
| CS endpoint | valid/missing/unreachable | URL and headers |
| CSP | restrictive/permissive | Directive summary |
| Import map | synced/stale | Missing or extra entries |
| Auth readiness | ready/incomplete | Missing headers or session config |
```

## Cross-skill awareness

| Action | Delegate to |
|--------|------------|
| Endpoint wiring fixes in initializers | `dropin-integrator` |
| CI/CD workflow or build pipeline issues | `quality-gate-runner` |
| Block-level security fixes (URL sanitization, innerHTML) | `storefront-block-author` |
| Route-level impact of config issues | `route-smoke-auditor` |

**Owns**: Config file correctness, environment diagnosis, mode detection, endpoint/header validation, security config (CSP, secrets, session), pipeline config (head.html, import map, modulepreload, speculation rules), analytics config.

## Evidence patterns

- **Endpoint issues**: Show the config key, its value, and what the expected value should be for the detected mode.
- **Header mismatches**: Show the headers object in config and highlight missing or extra entries.
- **CSP issues**: Quote the CSP meta tag from head.html and highlight the problematic directive.
- **Mode conflicts**: Show ACO signals alongside CS signals and explain the contradiction.
- **Secret exposure**: Show the file:line where a credential appears in committed code.

## Inspect

- `config.json` — primary commerce configuration
- `demo-config.json` — demo/testing overrides
- `demo-config-aco.json` — ACO-specific overrides
- `default-site.json` — site creator template
- `head.html` — CSP, import map, modulepreload, speculation rules
- `fstab.yaml` — DA.live mountpoint
- `scripts/commerce.js` — endpoint constants, headers, auth, session, URL construction
- `scripts/initializers/index.js` — header setup, session state, event bus config
- `scripts/delayed.js` — analytics gating, consent
- `AGENTS.md` — security requirements

## Produce

- Config readiness summary with mode classification
- Endpoint/header mismatch findings
- Security config findings (CSP, secrets, session)
- Pipeline config findings (import map, modulepreload, speculation rules)
- Mode detection findings with signal evidence
- Delegation notes for implementation-level fixes

## Avoid

- Rewriting implementation code when the issue is pure configuration — emit findings and delegate
- Making mode assumptions without reading config signals first
- Treating demo-config files as defects — they may be intentional overrides
- Modifying `head.html` without understanding CSP implications
