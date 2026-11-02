# Cards Block

## Overview

The Cards block displays content in a responsive grid layout of card elements. Each card can contain an image and body content, making it ideal for showcasing products, features, team members, or any collection of related items in a visually consistent format.

## Integration

### Block Configuration

This block does not require any configuration parameters. Content is defined directly in the block structure.

### Block Structure

Each row in the block becomes a card with the following structure:
- First column: Image (optional) - Automatically styled as `cards-card-image`
- Subsequent columns: Body content - Automatically styled as `cards-card-body`

Example authoring structure:
```
| Image | Content |
|-------|---------|
| ![Product 1](image1.jpg) | <h3>Product Name</h3><p>Description</p> |
| ![Product 2](image2.jpg) | <h3>Product Name</h3><p>Description</p> |
```

<!-- ### URL Parameters

No URL parameters affect this block's behavior. -->

<!-- ### Local Storage

No localStorage keys are used by this block. -->

<!-- ### Events

This block does not emit or listen to any custom events. -->

## Behavior Patterns

### Layout Behavior

- **Responsive Grid**: Cards automatically arrange in a responsive grid using CSS Grid
- **Auto-fill**: Grid columns auto-fill with minimum card width of 257px
- **Equal Sizing**: All cards in a row have equal width
- **Image Optimization**: Images are automatically optimized with a width of 750px

### Visual Structure

- **Card Image**: Pictures are displayed with 4:3 aspect ratio and object-fit cover
- **Card Body**: Content area with consistent padding and spacing
- **Grid Gap**: Cards are separated by medium spacing (`var(--spacing-medium)`)
- **Border**: Each card has a subtle border using neutral color scheme

### User Interaction Flows

1. **Content Display**: Block renders all provided rows as individual cards in a grid layout
2. **Responsive Behavior**: Grid automatically adjusts number of columns based on viewport width
3. **Image Loading**: Images are lazy-loaded and optimized for performance
4. **Links**: Any links within card content remain clickable and functional

### Error Handling

- **Missing Images**: If a card row has no image, only body content is displayed
- **Empty Cards**: Empty rows are still rendered as cards with appropriate spacing
- **Fallback Behavior**: Block gracefully handles missing or malformed content

## Isle5 campaign variant

The `Campaign Cards` insertion definition creates `cards campaign` markup using the existing `cards` runtime, `card` rich-text model and parent filter. Its definition ID is `cards-campaign`; it is a presentation variant, not a new runtime block. Ordinary cards keep their appearance.

On a page with `Theme: isle5`, campaign cards show image overlays with semantic headings and links. Use one image/body pair per row. The `card` fields remain `image`, `imageAlt` and rich-text `text`. There are no added key-value settings or custom section metadata, and no precedence layers.

| Cards (campaign) | |
| --- | --- |
| Image with descriptive alt text | H2 category heading, supporting copy and a labelled destination link |
| Another image | Another category heading and link |

Images are optional for fallback: without one, the text still appears on a solid surface. Unsupported media is omitted, unsupported link schemes are disabled and new-window links enforce `noopener noreferrer`. Re-decoration does not duplicate the list. Desktop uses three columns; mobile uses two with an odd final card spanning the row. Keep primary links at least 44px and test long headings, translated text and missing media.

If the variant is unavailable, regenerate source models with `npm run build:json` and verify the `cards-campaign` section-filter entry. Creating the model does not register a remote DA library example or publish content.
