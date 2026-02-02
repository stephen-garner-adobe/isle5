# Search Bar Block

A standalone, configurable search bar block that integrates with Adobe Commerce's product discovery services. This block can be placed anywhere on your page via DA.live and operates independently of the header search functionality.

## Features

- **Configurable via DA.live** - No code changes needed
- **Independent scope** - Works alongside header search without conflicts
- **Inline results** - Shows product results directly below the search bar
- **Customizable appearance** - Configure width, alignment, placeholder text
- **Responsive design** - Adapts to mobile, tablet, and desktop
- **Integrated with Commerce** - Uses same drop-in infrastructure as header search

## Usage in DA.live

### Basic Configuration

Add a "Search Bar" block to your page with default settings:

| Field | Value |
|-------|-------|
| Placeholder Text | Search products... |
| Width | 600px |
| Alignment | center |
| Results Count | 8 |

### Advanced Configuration

Customize the search bar appearance:

**Hero Search (Homepage):**
- Placeholder: "What are you looking for today?"
- Width: 800px
- Alignment: center
- Results Count: 12

**Sidebar Search:**
- Placeholder: "Search..."
- Width: 100%
- Alignment: left
- Results Count: 4

**Category Page Search:**
- Placeholder: "Search this category..."
- Width: 400px
- Alignment: right
- Results Count: 6

## Configuration Options

### 1. Placeholder Text
**Type:** String  
**Default:** "Search products..."  
**Description:** The text displayed in the search input when empty.

**Examples:**
- "Search for fresh groceries..."
- "Find what you need..."
- "What are you shopping for today?"

### 2. Width
**Type:** String  
**Default:** "600px"  
**Description:** Maximum width of the search bar container.

**Supported values:**
- Pixels: `600px`, `400px`, `800px`
- Percentage: `100%`, `80%`, `50%`
- Viewport: `50vw`, `80vw`

### 3. Alignment
**Type:** Select (left | center | right)  
**Default:** "center"  
**Description:** Horizontal alignment of the search bar.

**Options:**
- `left` - Aligns to the left edge
- `center` - Centers the search bar (default)
- `right` - Aligns to the right edge

### 4. Results Count
**Type:** Number (2-20)  
**Default:** 8  
**Description:** Number of products to display in search results.

**Recommendations:**
- Homepage hero: 8-12 products
- Sidebar: 4-6 products
- Category pages: 6-8 products

## Technical Details

### Scope
The block uses a unique scope (`search-bar-block`) to avoid conflicts with the header search (`popover` scope). Both can operate simultaneously on the same page.

### Dependencies
- `@dropins/storefront-product-discovery` - Search functionality
- `scripts/initializers/search.js` - Shared search initialization
- `scripts/commerce.js` - Commerce utilities

### Search Behavior
- **Minimum query length:** 3 characters
- **Search trigger:** Real-time as user types
- **Results display:** Inline below search bar
- **Submit action:** Redirects to `/search?q=query`
- **Filters:** Products with visibility: "Search" or "Catalog, Search"

### Performance
- **Lazy loading:** Search components load on first use
- **Shared initialization:** Reuses existing drop-in instance
- **Debounced search:** Prevents excessive API calls
- **Cached results:** Drop-in caches search results per scope

## Examples

### Homepage Hero
```
┌──────────────────────────────────────────────┐
│                                              │
│   [  Search for fresh groceries...        ] │
│                                              │
└──────────────────────────────────────────────┘

        ↓ User types "tomato"

┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Cherry │ │ Roma   │ │ Beef   │ │Organic│
│Tomatoes│ │Tomatoes│ │Tomatoes│ │Tomatoes│
│ $3.99  │ │ $2.99  │ │ $4.99  │ │ $5.99  │
└────────┘ └────────┘ └────────┘ └────────┘
```

### Sidebar Search
```
Sidebar
┌──────────────────┐
│ Categories       │
│ ─────────────    │
│                  │
│ [Search...]      │ ← Search Bar Block
│                  │
│ Results here...  │
└──────────────────┘
```

## Styling

The block uses design tokens from your theme for consistent styling:

- `--color-brand-500` - Focus border color
- `--color-neutral-50` - Background color
- `--color-neutral-300` - Border color
- `--spacing-*` - Padding and margins
- `--shape-border-radius-*` - Border radius

Custom styling can be added in `search-bar.css`.

## Accessibility

- Semantic HTML (`<form>`, `role="search"`)
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- ARIA attributes from drop-in components

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- IE11 not supported (drop-in limitation)

## Known Limitations

- Minimum 3 characters required for search
- Maximum 20 results configurable
- Results are cached per scope (refresh page to clear)
- Requires active Adobe Commerce GraphQL endpoint

## Troubleshooting

**Search not working:**
1. Check `config.json` has valid `commerce-endpoint`
2. Verify GraphQL endpoint is accessible
3. Check browser console for errors
4. Ensure search initializer loads (`scripts/initializers/search.js`)

**No results showing:**
1. Verify products have visibility set to "Search" or "Catalog, Search"
2. Check query length (minimum 3 characters)
3. Verify Adobe Commerce index is up to date

**Styling issues:**
1. Check for CSS conflicts with custom styles
2. Verify design tokens are defined in theme
3. Test in different browsers

## Related Blocks

- **Header** (`blocks/header/`) - Contains icon-based search
- **Product List Page** (`blocks/product-list-page/`) - Full search results page
- **Product Details** (`blocks/product-details/`) - Individual product pages

## Support

For issues or questions, refer to:
- [Adobe Commerce Storefront Documentation](https://experienceleague.adobe.com/developer/commerce/storefront/)
- Drop-in API documentation
- Project README.md
