# Slider Accordion Block

A responsive image slider with fade transitions, navigation controls, and configurable autoplay. Features background images with centered text overlays and call-to-action buttons.

## Features

- Configurable number of slides (1-5)
- Optional autoplay with hover pause
- Fade transitions between slides
- Navigation with prev/next buttons and indicators
- Responsive design with adaptive heights
- Optimized images with lazy loading
- Accessibility support (ARIA attributes)
- Follows Adobe Commerce Storefront design standards

## Usage in DA.live

### Basic Configuration

Add a "Slider Accordion" block to your page with up to 5 slides:

| Slider Accordion | | | |
|------------------|---|---|---|
| ![bg1.jpg](/images/hero1.jpg) | Welcome to Our Store | Discover amazing products | Shop Now → /products |
| ![bg2.jpg](/images/hero2.jpg) | Summer Sale | Up to 50% off selected items | View Deals → /sale |
| ![bg3.jpg](/images/hero3.jpg) | New Arrivals | Check out the latest collection | Browse → /new |

### Structure

Each slide row has 4 columns:
- **Column 1**: Background Image (full-width, cover fit)
- **Column 2**: Title (large, centered text overlay)
- **Column 3**: Description (smaller text below title)
- **Column 4**: CTA Button (positioned bottom-right)

## Configuration Options

### 1. Number of Slides
**Type:** Number (1-5)  
**Default:** 5  
**Description:** Maximum number of slides to display from the authored content.

**Note:** You can author up to 5 slides. The block will only show the number specified.

### 2. Enable Autoplay
**Type:** Boolean  
**Default:** true  
**Description:** Automatically cycle through slides every 5 seconds.

**Behavior:**
- Autoplay pauses on hover
- Resumes when mouse leaves
- Only active when more than 1 slide exists

## Layout

```
┌──────────────────────────────────────────────┐
│ [Background Image - Full Width]              │
│                                              │
│        ┌────────────────────┐                │
│        │  Large Title       │                │
│        │  Description text  │                │
│        └────────────────────┘                │
│                                              │
│                            [CTA Button] ─┐   │
└──────────────────────────────────────────────┘
     [◄] [● ● ○ ● ●] [►]
```

### Responsive Heights
- **Mobile** (< 768px): 210px
- **Tablet** (768-1023px): 315px
- **Desktop** (≥ 1024px): 350px

### Content Constraint
- Text content: `max-width: 1200px` (centered)
- Background: Full width (spans entire section)

## Examples

### Homepage Hero Slider

| Slider Accordion | | | |
|------------------|---|---|---|
| ![hero-summer.jpg](/images/hero-summer.jpg) | Summer Collection 2026 | Bright colors, bold styles | Shop Collection → /summer |
| ![hero-fall.jpg](/images/hero-fall.jpg) | Fall Preview | Cozy essentials for the season | Preview → /fall |
| ![hero-sale.jpg](/images/hero-sale.jpg) | End of Season Sale | Up to 70% off | Shop Sale → /clearance |

**Configuration:**
- Slides: 3
- Autoplay: true

### Single Promotional Banner

| Slider Accordion | | | |
|------------------|---|---|---|
| ![promo.jpg](/images/promo-banner.jpg) | Free Shipping Weekend | Orders over $50 ship free | Order Now → /shop |

**Configuration:**
- Slides: 1
- Autoplay: false (only 1 slide, no navigation shown)

## Technical Details

### Dependencies
- `scripts/aem.js` - Image optimization utilities
- No external drop-ins required

### Behavior
- **Autoplay Interval**: 5 seconds per slide
- **Transition**: 0.8s fade (opacity + visibility)
- **Navigation**: Wraps around (last → first, first → last)
- **Pause on Hover**: Pauses autoplay when user hovers
- **Keyboard**: Focus states on all interactive elements

### Image Optimization
- Background images optimized at 1920px width
- Lazy loading via `createOptimizedPicture()`
- Responsive srcset generated automatically

### Performance
- Images load on-demand
- Smooth CSS transitions (hardware accelerated)
- Minimal JavaScript for navigation
- No layout shifts during transitions

## Styling

The block uses design tokens for consistent styling:

**Layout & Spacing:**
- `--spacing-big`, `--spacing-medium`, `--spacing-small`
- `--shape-border-radius-2` (8px border radius)

**Typography:**
- `--type-display-2-font` - Main titles
- `--type-headline-1-font` - Descriptions
- `--type-button-2-font` - CTA buttons

**Colors:**
- `--color-neutral-50` - White text/buttons
- `--color-neutral-100` - Background fallback
- `--color-brand-500` - Hover states/active indicators

**Custom Tokens:**
```css
.slider-accordion-content {
  max-width: 1200px;  /* Content readability constraint */
}

.slider-accordion-slides {
  height: 280px;      /* Base height, responsive overrides */
}
```

### Customization

Override in your CSS:

```css
/* Adjust slide heights */
.slider-accordion-slides {
  height: 400px;
}

/* Change content constraint */
.slider-accordion-content {
  max-width: 1000px;
}

/* Modify transition speed */
.slider-accordion-slide {
  transition: opacity 0.5s ease-in-out;
}
```

## Accessibility

- **ARIA Attributes**: `aria-hidden`, `aria-label` on all controls
- **Keyboard Navigation**: Tab through navigation buttons
- **Disabled States**: Active indicator button disabled
- **Focus Indicators**: Visible focus states on buttons
- **Screen Readers**: Proper labeling ("Previous slide", "Go to slide 2")

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires CSS backdrop-filter support for CTA styling (graceful fallback)

## Known Limitations

- Maximum 5 slides (performance and UX consideration)
- Autoplay interval fixed at 5 seconds (can be modified in JS)
- Single background image per slide (no multiple layers)
- Text content constrained to 1200px (design decision)

## Troubleshooting

**Slides not transitioning:**
1. Check that block has `data-active-slide` attribute
2. Verify JavaScript loaded without errors
3. Ensure slides have `.active` class applied

**Autoplay not working:**
1. Verify `data-autoplay` is not set to `"false"`
2. Check for more than 1 slide
3. Ensure no JavaScript errors in console

**Images not displaying:**
1. Verify image paths are correct
2. Check image optimization in Network tab
3. Ensure images are accessible (not 404)

**Navigation not appearing:**
1. Needs more than 1 slide to show navigation
2. Check that slides are properly parsed from rows
3. Verify navigation element appended to block

## Related Blocks

- **Hero** - Single large banner (if you only need one slide)
- **Cards** - For product/content grids
- **Three Boxes** - For feature highlights

## Adobe Commerce Storefront Best Practices

✅ **Vertical spacing handled by sections, not blocks**  
✅ **Design tokens for all styling**  
✅ **Configuration drives behavior**  
✅ **Responsive and mobile-first**  
✅ **Accessible by default**  
✅ **Semantic HTML structure**
