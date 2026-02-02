# Three Boxes Block

A centered component displaying three white rectangular boxes, each with three columns: Icon, Title, and Description.

## Features

- Three white rectangular boxes with subtle borders and shadows
- Each box has 3 columns: Icon | Title | Description
- Fully responsive: stacks vertically within boxes on mobile, horizontal on tablet/desktop
- Configurable in DA.live (Document Authoring)
- Hover effects for better interactivity
- Follows Adobe Commerce Storefront design standards

## Usage in DA.live

1. Add a "Three Boxes" block to your page
2. The block comes with 3 rows (boxes) and 3 columns each
3. Each row has:
   - **Column 1**: Icon or image
   - **Column 2**: Title or heading
   - **Column 3**: Description text

## Configuration Options

### 1. Box Alignment
**Type:** Select (left | center | right)  
**Default:** "center"  
**Description:** Horizontal alignment of the three boxes within the section.

**Options:**
- `left` - Align boxes to the left side
- `center` - Center boxes horizontally (default)
- `right` - Align boxes to the right side

**Note:** This controls the `justify-content` of the flex container.

## Example Structure in DA.live

| Three Boxes | | |
|-------------|-------------|-------------|
| ![icon](/icons/shipping.svg) | Free Shipping | Get free standard shipping on all orders over $50 |
| ![icon](/icons/returns.svg) | Easy Returns | 30-day return policy on all items, no questions asked |
| ![icon](/icons/support.svg) | 24/7 Support | Customer service available around the clock to help you |

## Layout

Three boxes are displayed side-by-side horizontally. Within each box, the icon is on the left with title and description stacked on the right:

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│       │ Bold Title  │  │       │ Bold Title  │  │       │ Bold Title  │
│ [ICON]│ Description │  │ [ICON]│ Description │  │ [ICON]│ Description │
│       │ text here   │  │       │ text here   │  │       │ text here   │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

Within each box:
- **Icon**: Left side (48x48px)
- **Title**: Bold text, aligned left
- **Description**: Smaller text below title, aligned left

## Styling

- Uses design tokens from Adobe Commerce Storefront
- White/light background boxes
- Subtle border and shadow
- Hover animation for visual feedback
- Icons are 48x48px
- Fully centered layout

## Customization

You can customize the appearance by modifying `three-boxes.css`:
- Change box colors
- Adjust column widths
- Modify hover effects
- Update border styles
- Change responsive breakpoints
- Adjust icon sizes
