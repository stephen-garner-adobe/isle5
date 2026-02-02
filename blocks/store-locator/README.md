# Store Locator Block

A comprehensive store finder with interactive map, distance calculation, service filtering, and location search. Helps customers find their nearest store locations with hours, contact info, and directions.

## Features

### Core Functionality
- **Smart Search:** ZIP code, city, or address with autocomplete suggestions
- **Auto-Geolocation:** Automatic location detection on page load with saved preferences
- **Interactive Map:** Google Maps with store markers and info windows
- **Distance Calculation:** Real-time distance from user location
- **Advanced Filtering:** 
  - Filter by services (pharmacy, pickup, delivery, etc.)
  - **"Open Now" filter** to show only currently open stores
- **Flexible Sorting:** Sort by Distance, Name (A-Z), or Recently Added
- **Store Details:** Hours, phone, address, services, photos, and amenities
- **Personalization:**
  - "Set as My Store" preference (localStorage)
  - Remember last search location
  - Saved filter preferences
  - Auto-restore previous settings

### User Experience
- **Search Autocomplete:** Location suggestions as you type
- **Store Photos:** Visual storefront images
- **Store Amenities:** Parking info, accessibility features, and special services
- **Real-time Status:** Live open/closed status
- **Mobile-Responsive:** Optimized for all devices
- **Accessible:** Keyboard navigation and ARIA labels
- **Adobe Commerce Standards:** Full design token compliance

## Usage in DA.live

### Basic Setup - Define Stores Directly

Add stores as rows in DA.live (supports worldwide locations):

| Store Locator |
|---------------|
| Name | Address | Coordinates | Phone | Hours | Services | Photo | Details |
| Downtown Market | 123 Main St, Portland, OR, 97201 | 45.5231, -122.6765 | (503) 555-0100 | Mon-Fri: 7AM-10PM | pharmacy, deli, pickup | /images/stores/downtown.jpg | Free parking: 50 spaces, Wheelchair accessible, EV charging |
| London Store | 123 Oxford St, London, England, W1D 2HG | 51.5155, -0.1415 | +44 20 7123 4567 | Mon-Sat: 8AM-10PM | pharmacy, delivery | /images/stores/london.jpg | Underground parking, Accessible entrance |
| Tokyo Store | 1-1-1 Dogenzaka, Shibuya, Tokyo, 150-0043 | 35.6595, 139.7004 | +81 3-1234-5678 | Mon-Sun: 10AM-10PM | pickup, delivery | | Near subway station, Bike parking |

**Structure:**
- **Visual Row 1:** Block name only (`Store Locator`) - not included in JavaScript
- **Visual Row 2 (Code Row 0):** Column headers (`Name | Address | Coordinates | Phone | Hours | Services | Photo | Details`)
- **Visual Row 3+ (Code Row 1+):** Store data - 8 columns each (Name | Address | Coordinates | Phone | Hours | Services | Photo | Details)

**Planning Future Stores:**
- Add placeholder rows with just the store name - incomplete rows are automatically skipped
- Fill in address and coordinates when ready for the store to appear in the locator
- Console will show: `✅ Store Locator: X stores loaded, Y incomplete rows skipped`

**📘 See [DA-LIVE-GUIDE.md](./DA-LIVE-GUIDE.md) for complete authoring instructions with worldwide examples.**

## Configuration Options

### 1. Google Maps API Key ⭐ NEW
**Type:** Text  
**Default:** "" (empty)  
**Description:** Your Google Maps JavaScript API key for map display

**How to get an API key:**
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select existing
3. Enable **Maps JavaScript API**
4. Create an **API Key** under Credentials
5. Add the key to your DA.live block configuration

**Security:** 
- Restrict key to your domain in Google Cloud Console
- Key is loaded dynamically only when the block is used
- Store list works without the API key

**Note:** Without an API key, the map area will show a helpful message, but all other features (search, filters, store list) work normally.

### 2. Autocomplete Provider ⭐ NEW
**Type:** Select (nominatim | google)  
**Default:** "nominatim"  
**Description:** Which autocomplete service to use for address search

**Options:**
- `nominatim` - OpenStreetMap (FREE, no API key needed, worldwide coverage)
- `google` - Google Places Autocomplete (requires API key + billing, $2.83/1,000 requests after free tier)

**Comparison:**

| Feature | Nominatim (FREE) | Google Places |
|---------|------------------|---------------|
| Cost | FREE forever | $2.83/1,000 after $200 credit |
| Setup | No configuration | Requires billing enabled |
| Quality | Good, worldwide | Excellent, more polished |
| Speed | Fast | Very fast |
| Free tier | Unlimited | ~70,000 requests/month |

**Recommendation:** Start with `nominatim` (free). Upgrade to `google` only if you need the premium experience.

### 3. Default View
**Type:** Select (split | map | list)  
**Default:** "split"  
**Description:** Initial display layout

**Options:**
- `split` - 50/50 split between list and map (recommended)
- `map` - Map-focused with sidebar list
- `list` - List only, no map displayed

### 4. Map Provider
**Type:** Select (google | openstreetmap)  
**Default:** "google"  
**Description:** Mapping service to use

**Options:**
- `google` - Google Maps (requires API key in option #1)
- `openstreetmap` - OpenStreetMap (free, no API key needed)

### 5. Search Radius
**Type:** Number (5-100 miles)  
**Default:** 25  
**Description:** Default search radius from user location

### 6. Maximum Results
**Type:** Number (5-50)  
**Default:** 10  
**Description:** Maximum stores to display at once

### 7. Auto-Detect Location
**Type:** Boolean  
**Default:** true  
**Description:** Automatically use browser geolocation on load

**Behavior:**
- If enabled, prompts user for location permission
- Falls back to default location if denied
- Can be overridden by manual search

### 8. Show Distance
**Type:** Boolean  
**Default:** true  
**Description:** Display distance in miles from user

### 9. Default Location
**Type:** Text  
**Default:** "Portland, OR"  
**Description:** Fallback location if geolocation unavailable

### 10. Available Service Filters
**Type:** Multi-select  
**Default:** ["pharmacy", "pickup", "delivery", "24-hour", "deli", "bakery"]  
**Description:** Services users can filter by

**Available Options:**
- pharmacy
- pickup
- delivery
- 24-hour
- deli
- bakery
- organic
- gas-station

### 11. Map Zoom Level
**Type:** Number (8-18)  
**Default:** 11  
**Description:** Initial map zoom (11 = city-wide view)

### 12. Store Data Source
**Type:** Select (block-content | json-file | api)  
**Default:** "block-content"  
**Description:** Where to load store data from

**Options:**
- `block-content` - Uses DA.live table rows (recommended) ⭐
- `json-file` - Loads from `/data/stores.json`
- `api` - Fetches from `/api/stores` endpoint

## Layout

### Desktop (Split View)
```
┌────────────────────────────────────────────────────────────┐
│  🔍 Find Your Nearest Store                                │
│  [Enter ZIP, City, or Address _______] [🔍 Search]         │
│  [📍 Use My Location]                                      │
│  Filter: [✓ Pharmacy] [✓ Pickup] [ Deli] [ 24hr]         │
├──────────────────────┬─────────────────────────────────────┤
│  Store List          │  Map View                           │
│  (Scrollable)        │                                     │
│                      │   📍 📍 📍                          │
│  ┌─────────────────┐│        📍                           │
│  │ Downtown Market ││      📍   📍                        │
│  │ 123 Main St     ││                                     │
│  │ 2.3 mi • ● Open ││    Your Location: ⊙                │
│  │ ✓ Pharmacy      ││                                     │
│  │ ✓ Deli ✓ Pickup ││                                     │
│  │ (503) 555-0100  ││                                     │
│  │ Open until 9PM  ││                                     │
│  │ [Get Directions]││                                     │
│  │ [Set as Store]  ││                                     │
│  └─────────────────┘│                                     │
└──────────────────────┴─────────────────────────────────────┘
```

### Mobile (Stacked)
```
┌──────────────────────────────────┐
│  🔍 Find Nearest Store           │
│  [ZIP/City _____] [Search]       │
│  [📍 Use My Location]            │
│  Filters: [▼ Services]           │
├──────────────────────────────────┤
│  🗺️ Map (if enabled)            │
│                                  │
├──────────────────────────────────┤
│  📍 Downtown Market              │
│  123 Main St, Portland, OR       │
│  2.3 mi • ● Open until 9PM       │
│  (503) 555-0100                  │
│  ✓ Pharmacy ✓ Deli ✓ Pickup      │
│  [Get Directions]                │
│  [⭐ Set as My Store]             │
├──────────────────────────────────┤
│  📍 Eastside Grocery             │
│  ...                             │
└──────────────────────────────────┘
```

## Store Data Structure

### DA.live Row Format (Recommended)

Each row in DA.live represents one store with 8 columns:

| Column | Format | Example | Required |
|--------|--------|---------|----------|
| **Name** | Plain text | `Downtown Market` | ✅ Yes |
| **Address** | `Street, City, State, ZIP` | `123 Main St, Portland, OR, 97201` | ✅ Yes |
| **Coordinates** | `Latitude, Longitude` | `45.5231, -122.6765` | ✅ Yes |
| **Phone** | Any format | `(503) 555-0100` | Optional |
| **Hours** | Text or JSON | `Mon-Fri: 8AM-9PM` | Optional |
| **Services** | Comma-separated | `pharmacy, pickup, delivery` | Optional |
| **Photo** | Image URL | `/images/stores/downtown.jpg` | Optional |
| **Details** | Comma-separated | `Free parking: 50 spaces, Wheelchair accessible` | Optional |

**New Enhanced Fields:**
- **Photo:** Store exterior/interior image URL (displays at top of card)
- **Details:** Store-specific amenities like parking, accessibility, EV charging, etc.

**See [DA-LIVE-GUIDE.md](./DA-LIVE-GUIDE.md) for worldwide examples and complete authoring instructions.**

### stores-data.js Format (Legacy)

```javascript
export const storesData = {
  stores: [
    {
      id: 'store-001',
      name: 'Downtown Market',
      address: {
        street: '123 Main Street',
        city: 'Portland',
        state: 'OR',
        zip: '97201',
        coordinates: {
          lat: 45.5231,
          lng: -122.6765
        }
      },
      contact: {
        phone: '(503) 555-0100',
        email: 'downtown@store.com'
      },
      hours: {
        monday: { open: '07:00', close: '22:00' },
        tuesday: { open: '07:00', close: '22:00' },
        wednesday: { open: '07:00', close: '22:00' },
        thursday: { open: '07:00', close: '22:00' },
        friday: { open: '07:00', close: '23:00' },
        saturday: { open: '07:00', close: '23:00' },
        sunday: { open: '08:00', close: '21:00' }
      },
      services: ['pharmacy', 'deli', 'bakery', 'pickup', 'delivery'],
      specialHours: [
        {
          date: '2026-12-25',
          status: 'closed',
          note: 'Closed for Christmas'
        }
      ],
      image: '/images/stores/downtown-market.jpg',
      featured: true
    }
  ]
};
```

### Required Fields
- `id` - Unique store identifier
- `name` - Store name
- `address.street` - Street address
- `address.city` - City
- `address.state` - State/province
- `address.zip` - ZIP/postal code
- `address.coordinates.lat` - Latitude
- `address.coordinates.lng` - Longitude
- `hours` - Object with days of week (24h format)

### Optional Fields
- `contact.phone` - Phone number
- `contact.email` - Email address
- `services` - Array of available services
- `specialHours` - Array of special closures/hours
- `image` - Store photo URL
- `featured` - Boolean for featured stores

## Technical Details

### Dependencies
- `stores-data.js` - Static store data
- Google Maps API (optional, for map display)
- Nominatim API (for geocoding fallback)

### Core Functions

**parseBlockConfig(block)**
- Extracts DA.live configuration from block dataset
- Returns config object with all settings

**calculateDistance(lat1, lng1, lat2, lng2)**
- Haversine formula for distance calculation
- Returns distance in miles

**getUserLocation()**
- Requests browser geolocation permission
- Returns Promise with user coordinates

**geocodeAddress(address)**
- Converts address string to coordinates
- Uses Nominatim (OpenStreetMap) API
- Returns Promise with lat/lng

**sortStoresByDistance(stores, userLat, userLng)**
- Adds distance property to each store
- Sorts stores by proximity
- Returns sorted array

**isStoreOpen(store)**
- Checks current time against store hours
- Handles special hours (holidays)
- Returns boolean

**renderStoreCard(store, showDistance)**
- Creates store card DOM element
- Includes all store details and actions
- Returns card element

**initializeMap(container, stores, center, zoomLevel)**
- Initializes Google Maps instance
- Adds markers for all stores
- Creates info windows with store details
- Returns map instance

### Geolocation

The block uses the browser's Geolocation API:

```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    // Success: use position.coords.latitude/longitude
  },
  (error) => {
    // Error: fall back to default location
  },
  { timeout: 10000, enableHighAccuracy: true }
);
```

**User Experience:**
1. On page load, browser prompts for location
2. If allowed, shows nearest stores
3. If denied, shows featured/alphabetical stores
4. User can manually search anytime

### Geocoding

For address searches, the block uses Nominatim:

```javascript
const url = `https://nominatim.openstreetmap.org/search?format=json&q=${address}`;
```

**Alternative:** Can be swapped for Google Geocoding API with API key.

### Distance Calculation

Uses Haversine formula for great-circle distance:

```javascript
const R = 3959; // Earth radius in miles
const distance = 2 * R * Math.atan2(
  Math.sqrt(a),
  Math.sqrt(1 - a)
);
```

Accurate within 0.5% for most distances.

### Local Storage

**Preferred Store:**
```javascript
localStorage.setItem('preferredStore', storeId);
localStorage.setItem('preferredStoreName', storeName);
```

**Custom Event:**
```javascript
document.dispatchEvent(new CustomEvent('store-selected', {
  detail: { storeId, storeName }
}));
```

Other components can listen for this event to update UI.

## Styling

### Design Tokens Used

**Layout & Spacing:**
- `--spacing-small`, `--spacing-medium`, `--spacing-large`
- `--store-locator-gap` - Gap between elements
- `--store-card-padding` - Card internal padding

**Colors:**
- `--color-neutral-50` - Card background
- `--color-neutral-300` - Borders
- `--color-brand-500` - Primary buttons, links
- `--status-open-color` - Open status (green)
- `--status-closed-color` - Closed status (red)

**Typography:**
- `--type-headline-3-default-font` - Main title
- `--type-headline-5-default-font` - Store names
- `--type-body-1-default-font` - Body text
- `--type-body-2-default-font` - Secondary text

### Customization

Override in your CSS:

```css
/* Adjust card styling */
.store-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0 0 0 / 5%);
}

/* Change map height */
:root {
  --store-map-height: 600px;
  --store-map-height-mobile: 400px;
}

/* Customize service badges */
.service-badge {
  background: var(--color-brand-100);
  color: var(--color-brand-700);
  border: none;
}
```

## Google Maps Integration

### Setup

1. Get Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps JavaScript API
3. Add API key to your site:

```html
<script async defer
  src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY">
</script>
```

4. Set `mapProvider` to "google" in block config

### Features
- Interactive map with zoom/pan
- Store markers with custom icons
- Info windows on marker click
- User location indicator
- Responsive map sizing

### Fallback

If Google Maps is unavailable:
- Shows placeholder message
- List view still fully functional
- Directions links use Google Maps web URLs

## Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Enter to submit search form
- Space to toggle checkboxes
- Escape to close any modals

### Screen Readers
- Semantic HTML (`<article>`, `<address>`)
- ARIA labels on all buttons
- Form labels properly associated
- Status announcements for actions

### Focus Management
- Visible focus indicators
- Logical tab order
- Skip to content option
- High contrast support

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Geolocation API (fallback to manual search)
- IE11 not supported (requires ES6+ features)

## Performance

### Optimization Strategies
- Lazy load map only when visible
- Debounced search input (prevent excessive API calls)
- Limit results to configured max
- Virtual scrolling for large store lists (future)

### Load Times
- Initial render: < 200ms
- Geolocation: 2-5 seconds (user dependent)
- Geocoding: 500ms-1s (network dependent)
- Map load: 1-2 seconds (Google Maps CDN)

## Known Limitations

1. **Google Maps API Required** for map display (free tier: 28,000 loads/month)
2. **Nominatim Rate Limiting** - 1 request/second for geocoding
3. **Static Store Data** - No real-time inventory integration (configurable)
4. **Distance Calculation** - Straight-line distance, not driving distance
5. **Hours Format** - Must use 24-hour format (HH:MM)

## Troubleshooting

### Map Not Displaying
- Check if Google Maps API key is loaded
- Verify API key has Maps JavaScript API enabled
- Check browser console for errors
- Confirm `mapProvider` is set to "google"

### Geolocation Not Working
- Ensure site uses HTTPS (required for geolocation)
- Check browser location permissions
- Test with manual address search
- Verify fallback location is set

### No Stores Showing
- Check `stores-data.js` is properly formatted
- Verify coordinates are valid (lat: -90 to 90, lng: -180 to 180)
- Confirm data source setting matches file location
- Check browser console for loading errors

### Distance Not Calculating
- Ensure user location was obtained
- Verify store coordinates exist
- Check distance calculation function
- Confirm `showDistance` is enabled

### Service Filters Not Working
- Match filter values exactly with store services
- Check spelling/capitalization
- Verify services array in store data
- Ensure checkbox event listener attached

## Use Cases for Grocery

### 1. **Store Finder Page**
Dedicated page for customers to find their nearest location.

### 2. **Header Integration**
"Find a Store" link in navigation → modal with store locator.

### 3. **Checkout Flow**
Select pickup location during order fulfillment.

### 4. **Homepage Widget**
Simplified version showing 3 nearest stores.

### 5. **Store-Specific Inventory**
Show product availability at selected store.

## Related Blocks

- **Header** - Can integrate "My Store" indicator
- **Product Details** - Show in-stock status per store
- **Checkout** - Pickup location selection

## Adobe Commerce Storefront Best Practices

✅ **Vertical spacing handled by sections, not blocks**  
✅ **Design tokens for all styling**  
✅ **Configuration drives behavior**  
✅ **Responsive and mobile-first**  
✅ **Accessible by default**  
✅ **Semantic HTML structure**  
✅ **Configuration integrity** (all model fields used)  
✅ **JSDoc documentation** on all functions  
✅ **Width conforms to section** (1200px constraint)  
✅ **Async data loading** with proper error handling  
✅ **localStorage for user preferences**

## Future Enhancements

- Real-time inventory availability per store
- Driving directions with turn-by-turn
- Store events/promotions calendar
- Photo gallery for each store
- Customer ratings/reviews
- Multi-language support
- Print store details
- Email store info
- Compare multiple stores side-by-side
- Virtual tours (360° photos)
