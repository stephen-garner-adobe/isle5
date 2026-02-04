# Store Locator Block

A Places‑powered store finder with an interactive map, rich info windows, and a configurable results list. It supports Google Places (New) enrichment, open/closed status in the store’s local timezone, and configurable filters/sorting.

## What this block does

- **Search & filters:** Address search, service filters, and “Open Now”
- **Map + info windows:** Google map with Advanced Markers and rich info windows
- **Store cards:** Name, hours, distance, phone, services, and directions
- **Sorting:** Distance, Name (A‑Z), Recently Added
- **Geolocation:** Optional auto‑detect location on load
- **Timezone‑accurate status:** Uses Places `utcOffsetMinutes` for open/closed

## Setup (Google)

1. Create a Google Cloud project.
2. Enable **Maps JavaScript API** and **Places API (New)**.
3. Create an API key and restrict it to your domains (include `http://localhost:3000/*` for local).
4. Add the API key to DA.live config (`Google Maps API Key`).

## DA.live configuration

### Config rows (top of table)

Top row should be the block name only:

```
store-locator
```

Example DA.live table (config + Place IDs):

```
store-locator
Google Maps API Key | YOUR_API_KEY
Autocomplete Provider | google
Default View | split
Map Provider | google
Search Radius | 25
Max Results | 10
Auto Detect Location | true
Show Distance | true
Default Location | 
Zoom Level | 11
Places ID | Featured | Custom Services | Display Order | Override Name
ChIJ... | true | pickup, deli, delivery | 1 | Downtown Market
ChIJ... | true | pickup, click&collect | 2 |
ChIJ... | true | pickup, click&collect, pharmacy | 3 |
```

| Row label | Type | Default | Description |
|---|---|---|---|
| Google Maps API Key | text | empty | Required for map + Places enrichment |
| Autocomplete Provider | select | `nominatim` | `nominatim` or `google` |
| Default View | select | `split` | `split`, `map`, `list` |
| Map Provider | select | `google` | `google` or `openstreetmap` |
| Search Radius | number | `25` | Default radius in miles |
| Max Results | number | `10` | Max stores shown |
| Auto Detect Location | boolean | `true` | Use browser geolocation |
| Show Distance | boolean | `true` | Show miles on cards |
| Default Location | text | `Portland, OR` | Fallback when geolocation fails |
| Zoom Level | number | `11` | Initial map zoom |

> **Important:** Row labels must match exactly (case and spacing), e.g. `Autocomplete Provider`.

### Store rows (Place ID format)

Header row (required):

```
Places ID | Featured | Custom Services | Display Order | Override Name
```

Row example:

```
ChIJ... | true | pickup, deli, delivery | 1 | Downtown Market
```

**Field details:**
- **Places ID** (required): Google Place ID for the store.
- **Featured**: `true/false` (used for display and optional styling).
- **Custom Services**: Comma‑separated tags (used in filters).
- **Display Order**: Parsed, but **not applied** in sorting yet.
- **Override Name**: Overrides Google’s display name.

## Autocomplete behavior

- **Nominatim** (default): Free, no key, good quality.
- **Google**: Uses Places Autocomplete; requires Maps JS + Places API (New).
- Autocomplete initializes **after** Maps JS loads to avoid fallbacks.

## Open/closed status

Open status uses the store’s **local timezone**:
- Places `regularOpeningHours` + `utcOffsetMinutes`
- Computed in the browser so a UK user sees accurate California hours.

## What data comes from Places

When Place ID enrichment runs, the block requests:
- Name, address, location
- Phone, website
- Regular opening hours
- Rating + review count
- Photos + reviews (used in info windows)
- `utcOffsetMinutes` for timezone‑correct status

## Troubleshooting

### “Google autocomplete selected but Google Maps not loaded”
- Ensure **Maps JS API** + **Places API (New)** are enabled.
- Confirm `Google Maps API Key` row is present.
- Confirm `Autocomplete Provider` is exactly `google`.
- Check key restrictions allow your domain.

### Map not displaying
- Verify API key and `Map Provider = google`.
- Check console for “Maps JS API error”.

### Open/closed looks wrong
- Confirm Places enrichment is running (Place IDs present).
- Ensure `utcOffsetMinutes` is returned (Places API enabled).

## Notes

- The map runs via **Maps JavaScript API**.
- Place details are fetched via **Places API (New)**.
- Directions links open Google Maps web URLs.
