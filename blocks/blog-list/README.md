# Blog List

## Overview
`blog-list` renders a listing page for blog posts under `/blog/*` (excluding `/blog/index`), intended for the `/blog` landing page.

The block uses index data (`/sitemap.json` fallback chain) and displays:
- Featured image
- Publish date (from index last modified)
- Title
- Description (optional)
- Link to post

## DA.live Integration And Authoring Structure
- Create `/blog/index` as the listing page document.
- Insert a `blog-list` block on that page.
- Optional: add intro text in the block cell above the listing (it is preserved and rendered).
- Individual posts remain sibling docs in `/blog` (for example `/blog/my-post`).

### DA.live Model Options
Current `_blog-list.json` defines no sidebar model fields; behavior is section metadata driven.

| model field | values | effect |
| --- | --- | --- |
| none | n/a | Configure behavior via section metadata. |

## Configuration Options
### Section Metadata Placement
Place `section-metadata` immediately above the section containing `blog-list`.

### Section Metadata Reference
| key | possible values | effect |
| --- | --- | --- |
| `bloglist-pagesize` | integer `1..48` | Default: `12`. Number of posts rendered per batch. Initial render uses this value; load-more appends another batch of this size. |
| `bloglist-sort` | `newest`, `oldest` | Default: `newest`. Sort order based on index timestamp (`lastModified`). |
| `bloglist-showdescription` | `true`, `false` | Default: `true`. Shows or hides card description text. |

## Metadata Precedence
1. Layout tier
- Uses section width + default block layout (no separate layout metadata yet).

2. Content/structure tier
- `bloglist-pagesize`
- `bloglist-sort`
- `bloglist-showdescription`

3. Style/shape tier
- Card styling is token-based and fixed by block CSS.

4. Color/explicit overrides tier
- none

5. Media/motion tier
- Card image rendering via optimized picture (lazy).

## Override Rules
| condition | winner | ignored/no-op fields | effect |
| --- | --- | --- | --- |
| Invalid `bloglist-pagesize` | fallback normalizer | invalid `bloglist-pagesize` | Uses default pagesize and warns in console. |
| Invalid `bloglist-sort` | fallback normalizer | invalid `bloglist-sort` | Uses default sort and warns in console. |
| `bloglist-showdescription=false` | visibility toggle | description field render | Cards render without descriptions. |

## Conflict/No-op Notes
- If `/blog` contains no post docs, block shows a no-results message.
- Posts are discovered by path filtering (`/blog/*` excluding `/blog/index`), not by template metadata.

## Conflict Matrix
| condition | winner | ignored/no-op | effect |
| --- | --- | --- | --- |
| Empty index response | runtime guard | listing render | No cards; empty-state message shown. |
| Missing image on entry | card renderer | image region only | Card renders text-only body safely. |

## Behavior Patterns
- Uses `getConfigValue` for explicit metadata resolution order.
- Normalizes all author-facing options with deterministic fallbacks.
- Resolves and persists final config to `block.dataset.*`.
- Fetches index JSON, filters `/blog` paths, sorts, and paginates client-side.

## Accessibility Notes
- Each card is an `<article>` with a semantic link target.
- Load-more button is native `<button>`.
- Focus-visible styles are present for keyboard users.
- Hover effects are non-essential; core navigation remains semantic.

## Troubleshooting
| symptom | likely cause | fix |
| --- | --- | --- |
| No cards on `/blog` | No `/blog/*` entries in index or all filtered out | Verify post docs exist under `/blog` and are published. |
| Wrong order | `bloglist-sort` value invalid | Use `newest` or `oldest`. |
| Not enough cards visible | pagesize too low | Increase `bloglist-pagesize` in section metadata. |
| Descriptions missing | `bloglist-showdescription=false` or missing index descriptions | Set `bloglist-showdescription=true` and ensure post descriptions exist. |

