# Isle5 redesign reference brief

Translate the user's supplied homepage and the subsequent linked design study into an authorable EDS storefront. Preserve the monochrome urban/outdoor identity while making discovery, purchase and post-purchase tasks clear. Existing logo assets will be reused; new logo design is excluded.

## Design direction

Use charcoal surfaces, light text, oversized condensed campaign headings, thin dividers and square controls. Pair concrete urban portraits with open-terrain landscapes. Use a restrained pale moss accent for selection and focus rather than giving every component a different colour.

The campaign homepage should contain a static image-led hero, category tiles, a real product strip, an editorial split, complementary products, useful service content and a shared footer. Category landings reuse this vocabulary; listings, product details, forms and checkout use more space and less decorative treatment.

## Proposed visual tokens

| Role | Design target | Local implementation consideration |
| --- | --- | --- |
| Main surface | `#101110` | Define a semantic site token, scoped to the review theme |
| Raised surface | `#1c1d1b` | Check dialog, drawer and payment/component contrast separately |
| Primary text | `#f3f2ed` | Use explicit foreground/background pairs |
| Secondary text | `#b9bab4` | Maintain contrast on every actual surface |
| Accent | `#d5e89b` | Supplement with labels, borders and selection state |
| Display | Existing `roboto-condensed`, bold | Already registered in `styles/fonts.css`; use display scale only for editorial headings |
| Body | Existing `roboto` regular/medium | Keep forms and transactional UI readable; do not reuse display styles everywhere |
| Shape | Square corners, thin rules | Prefer supported shape tokens over generated-component selectors |
| Product grid | Four desktop columns, three where appropriate on tablet, two on mobile | Retain drop-in responsive behavior and verify long names, options and price ranges |
| Spacing | Eight-pixel rhythm, roughly 22px mobile gutters and generous desktop spacing | Convert deliberately to the repository's rem basis; do not paste prototype rem values |

## Responsive and interaction intent

- Keep search and bag reachable on mobile; expose category/account links through keyboard-accessible navigation.
- Preserve meaningful campaign text and its image focal point at narrow widths. Use one logical page H1.
- Provide labelled 44×44 primary controls, visible focus, reduced-motion support, useful errors and return focus for dialogs/drawers.
- Require configurable product options before add-to-cart. The initial build may route complex products to PDP, matching current behavior, instead of adding the prototype's quick-add dialog.
- Use genuine result counts, pagination, pricing and wishlist behavior. Preserve browser history and localized product links.

## Content and assets

All page-specific headings, descriptions, product selections, editorial copy, approved images, destinations, metadata and shared labels belong in DA or Commerce according to their owner. Repository files implement generic rendering and styling only.

The earlier six-image generated atlas and repeated product packshots demonstrate composition. They are not catalogue evidence or final variants. Obtain accurate licensed product imagery, real SKU/category mappings, verified specifications, fit information, care instructions and approved policy text. Preserve true product colours even when campaign art is monochrome. Currency comes from the active store; the dollar symbol in the reference is not a backend configuration decision.

Do not import the prototype's fake account, in-memory bag, sample checkout or order confirmation into the storefront. Its design-review toolbar and concept notices are presentation aids, not shopper UI.

## Unresolved design inputs

Confirm exact category taxonomy, editorial route labels, existing logo files, mobile image crops, product-rail merchandising intent and production locale/currency after the DA/catalog inventory. These do not block the repository plan, but they do gate content authoring and integration acceptance.

## Confirmed first build catalogue

The user selected the existing Adobe demo catalogue for the first redesign build. Keep its actual names, prices, stock, options and product imagery, and flag the mismatch with the outdoor design concept during review. A real outdoor catalogue is a separate later dependency, not a blocker to this first build.
