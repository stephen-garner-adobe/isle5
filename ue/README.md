# Universal Editor Models

Universal Editor source configuration lives under `ue/models`.

- `ue/models/component-definition.json` aggregates block definitions into the generated root `component-definition.json`.
- `ue/models/component-models.json` aggregates page, section, text, image, and block models into the generated root `component-models.json`.
- `ue/models/component-filters.json` aggregates section and block filters into the generated root `component-filters.json`.
- `ue/models/blocks/<block>.json` is the source of truth for each authorable block's definitions, models, and filters.

After changing any file in `ue/models`, run:

```sh
npm run build:json
```

The root `component-definition.json`, `component-models.json`, and `component-filters.json` files are generated artifacts.

## Isle5 review theme

Page metadata exposes an optional Theme selector: Default or Isle5 (`isle5`). The existing runtime adds the theme class; `scripts/scripts.js` loads `styles/isle5.css` only for opted-in pages. Section Style also offers Chalk for editorial contrast on themed pages.

Hero keeps its image/alt/H1 fields and accepts optional supporting rich text in a second row plus explicit image loading. Existing one-row heroes remain supported. Campaign Cards inserts the existing `cards` runtime with the `campaign` variant and existing rich-text card model. Product Rail is a bounded, service-backed key-value block. Regenerate root JSON and validate contracts after editing these source models. No model change creates or publishes a DA source or library example.
