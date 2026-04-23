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
