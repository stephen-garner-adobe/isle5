---
name: commerce-config-doctor
description: Use when diagnosing Adobe Commerce Storefront configuration issues in repos like isle5, especially endpoint selection, headers, placeholders, environment assumptions, auth readiness, and mixed-mode storefront signals.
---

# Commerce Config Doctor

Use this skill for environment and configuration diagnosis.

Core workflow:
1. Inspect `config.json`, demo config files, initializer assumptions, and `scripts/commerce.js`.
2. Check whether the repo signals `optimizer`, `cloud-service`, or a mixed setup.
3. Verify header and endpoint expectations for the commerce domain in use.
4. Call out missing or inconsistent config separately from implementation defects.
5. Report readiness blockers clearly when auth, config, or environment data is incomplete.

Inspect:
- `config.json`
- `demo-config.json`
- `demo-config-aco.json`
- `scripts/commerce.js`
- `scripts/initializers/`

Produce:
- readiness checks
- endpoint/header mismatches
- mode plausibility notes
- config-specific findings

Avoid:
- rewriting implementation code when the issue is pure configuration

