<!-- This template is for a new block or a major block-authoring rewrite. -->
<!-- Remove sections that genuinely do not apply; do not leave fictional options or empty tables. -->

# <Block Name> Block

## Overview

<!-- Explain the shopper/author outcome, intended page context, and whether this is a content block, Commerce wrapper, or configuration block. -->

## Authoring Structure

<!-- Describe the exact DA.live table shape and repeatable rows/children. -->

| Row | Authored content | Required | Fallback or constraint |
|---|---|---|---|
| 1 | Example content | Yes | Explain the safe fallback |

### Literal authoring example

| <block-name> |
|---|
| Example authored value |

## Inputs and Model Options

<!-- Keep field names, defaults, required state, and allowed values aligned with ue/models and runtime readers. -->

| Field | Component/type | Required | Default | Author outcome |
|---|---|---|---|---|
| `fieldName` | `text` | No | Empty | Explain what the author controls |

## Block Configuration

<!-- Include only settings stored in this block's table/model. For a thin wrapper with no settings, state that explicitly. -->

| Key | Possible values | Effect |
|---|---|---|
| `setting` | `value-a`, `value-b` | Default: `value-a`. Explain the observable behavior. |

## Section Metadata

<!-- Section metadata controls the surrounding section, not block-specific behavior. State “None” if unused. -->

| Key | Possible values | Effect |
|---|---|---|
| `width` | Project-supported values | Explain the section/container outcome. |

Place the Section Metadata table in the same section as the block it controls.

## Page Metadata and Route Assumptions

<!-- Document required route/template/backend, robots, cache, title, and social behavior when applicable. State “None” for a route-neutral block. -->

## Behavior and Fallbacks

<!-- Describe loading, empty, error, unavailable-service, and progressive-enhancement behavior. -->

## Configuration Precedence and Conflicts

<!-- List the canonical source for each setting, compatibility fallbacks, conflicts, and intentional no-ops. Simple blocks may state that precedence is not applicable. -->

| Condition | Winner | Ignored/no-op input | Shopper/author effect |
|---|---|---|---|
| Example conflict | Canonical setting | Legacy setting | Explain the visible result |

## Commerce and Integration Contracts

<!-- Document drop-ins, public APIs/slots/events, GraphQL client, dictionaries, analytics, storage, and consent implications. Omit when not applicable. -->

## Accessibility

<!-- Cover semantics, labels, keyboard behavior, focus, announcements, contrast, reduced motion, and touch targets as applicable. -->

## Performance

<!-- Cover eager/lazy placement, LCP media, conditional imports, third-party work, and relevant budgets. -->

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Example symptom | Invalid or missing authoring input | Provide an actionable author-facing correction |

## Validation

<!-- Record representative test content, routes/backends, viewport coverage, and automated/manual gates. -->
