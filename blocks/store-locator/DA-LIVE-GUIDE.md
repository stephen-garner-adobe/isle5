# Store Locator - DA.live Authoring Guide

Complete guide for defining stores dynamically in DA.live with worldwide location support.

## 📋 Table Structure in DA.live

### Basic Format (Block Header + Column Headers + Data)

```
| Store Locator |
|---------------|
| Name | Address | Coordinates | Phone | Hours | Services | Photo | Details |
| Downtown Market | 123 Main St, Portland, OR, 97201 | 45.5231, -122.6765 | (503) 555-0100 | Mon-Fri: 8AM-9PM | pharmacy, pickup, delivery | /images/stores/downtown.jpg | Free parking: 50 spaces, Wheelchair accessible |
| Eastside Grocery | 456 Oak Ave, Portland, OR, 97214 | 45.5155, -122.6512 | (503) 555-0200 | 24 hours | pharmacy, 24-hour, delivery | | EV charging, Bike racks |
```

**Important:** 
- **First Row (visual only)**: Block name (`Store Locator`) - not included in block.children
- **Row 0 (in code)**: Column headers (Name, Address, Coordinates, etc.)
- **Row 1+ (in code)**: Actual store data

### Row Structure

**Row 1 (Block Name - visual only):**
- Single cell with block name: `Store Locator`
- Note: This row is NOT included in JavaScript `block.children`

**Row 2 (Column Headers):**
- 8 columns: `Name | Address | Coordinates | Phone | Hours | Services | Photo | Details`
- This becomes Row 0 in JavaScript

**Row 3+ (Data Rows - 8 Columns Each):**
- These become Row 1+ in JavaScript

| Column | Content | Format | Required | Example |
|--------|---------|--------|----------|---------|
| **1. Store Name** | Store name/location | Plain text | ✅ Yes | `Downtown Market` |
| **2. Address** | Full street address | `Street, City, State, ZIP` | ✅ Yes | `123 Main St, Portland, OR, 97201` |
| **3. Coordinates** | Latitude, Longitude | `LAT, LNG` | ✅ Yes | `45.5231, -122.6765` |
| **4. Phone** | Contact phone | Any format | Optional | `(503) 555-0100` |
| **5. Hours** | Operating hours | Text or JSON | Optional | `Mon-Fri: 8AM-9PM` |
| **6. Services** | Available services | Comma-separated | Optional | `pharmacy, pickup, delivery` |
| **7. Photo** | Store image URL | URL path | Optional | `/images/stores/downtown.jpg` |
| **8. Details** | Amenities/features | Comma-separated | Optional | `Free parking: 50 spaces, Wheelchair accessible` |

---

## ⚙️ Block Configuration (Optional)

You can add configuration options **before** the column headers to customize block behavior:

```
| Store Locator              |                                    |
|----------------------------|------------------------------------|
| Google Maps API Key        | AIzaSyAbc123def456ghi789jkl012mno  |
| Default View               | split                              |
| Map Provider               | google                             |
| Search Radius              | 25                                 |
| Max Results                | 10                                 |
| Auto Detect Location       | true                               |
| Show Distance              | true                               |
| Default Location           | San Jose, CA                       |
| Zoom Level                 | 11                                 |
| Name                       | Address                            | Coordinates | Phone | Hours | Services | Photo | Details |
| San Jose Downtown          | 345 Park Ave...                    | ...         | ...   | ...   | ...      | ...   | ...     |
```

### Configuration Options

| Config Key | Value | Description |
|------------|-------|-------------|
| **Google Maps API Key** | Your API key | Get from [Google Cloud Console](https://console.cloud.google.com/). **Required for interactive map**. |
| **Autocomplete Provider** | `nominatim` or `google` | Search autocomplete: nominatim (FREE), google (premium, requires billing) |
| **Default View** | `split`, `map`, or `list` | Layout: split (50/50), map (map-focused), list (no map) |
| **Map Provider** | `google` or `openstreetmap` | Map service (Google requires API key) |
| **Search Radius** | Number (5-100) | Default search radius in miles |
| **Max Results** | Number (5-50) | Maximum stores to display |
| **Auto Detect Location** | `true` or `false` | Auto-request user's location on load |
| **Show Distance** | `true` or `false` | Display distance from user |
| **Default Location** | Text | Fallback location (e.g., "Portland, OR") |
| **Zoom Level** | Number (8-18) | Map zoom level (8=state, 11=city, 14=neighborhood) |

**Note:** All configuration options are optional. If omitted, sensible defaults are used.

### Without Configuration (Minimal Setup)

```
| Store Locator |
|---------------|
| Name | Address | Coordinates | Phone | Hours | Services |
| Store Name | 123 Main St, City, ST, 12345 | LAT, LNG | (555) 555-5555 | Mon-Fri: 9AM-5PM | service1, service2 |
```

The block will use default settings and won't display the interactive map (only shows store list).

---

## 🌍 Worldwide Locations - Examples

### United States

```
| Store Locator |
|---------------|
| Name | Address | Coordinates | Phone | Hours | Services |
| NYC Flagship | 1000 Broadway, New York, NY, 10001 | 40.7484, -73.9857 | (212) 555-1000 | Mon-Sun: 7AM-11PM | pharmacy, deli, delivery, 24-hour |
| LA Downtown | 500 Flower St, Los Angeles, CA, 90071 | 34.0522, -118.2437 | (213) 555-2000 | Mon-Sun: 6AM-10PM | pickup, delivery, organic |
| Miami Beach | 1601 Collins Ave, Miami Beach, FL, 33139 | 25.7907, -80.1300 | (305) 555-3000 | 24 hours | pharmacy, 24-hour, delivery |
```

### Europe

```
| Store Locator |
|---------------|
| Name | Address | Coordinates | Phone | Hours | Services |
| London Central | 123 Oxford St, London, England, W1D 2HG | 51.5155, -0.1415 | +44 20 7123 4567 | Mon-Sat: 8AM-10PM | pharmacy, pickup, delivery |
| Paris Marais | 45 Rue de Rivoli, Paris, Île-de-France, 75004 | 48.8566, 2.3522 | +33 1 42 96 12 34 | Mon-Sun: 9AM-8PM | deli, bakery, organic |
| Berlin Mitte | 10 Unter den Linden, Berlin, Berlin, 10117 | 52.5200, 13.4050 | +49 30 1234 5678 | Mon-Sun: 7AM-11PM | pharmacy, pickup, delivery |
```

### Asia

```
| Store Locator |
|---------------|
| Name | Address | Coordinates | Phone | Hours | Services |
| Tokyo Shibuya | 1-1-1 Dogenzaka, Shibuya, Tokyo, 150-0043 | 35.6595, 139.7004 | +81 3-1234-5678 | Mon-Sun: 10AM-10PM | pickup, delivery |
| Singapore Orchard | 238 Orchard Rd, Singapore, Singapore, 238854 | 1.3048, 103.8318 | +65 6123 4567 | Mon-Sun: 9AM-9PM | pharmacy, deli, delivery |
| Dubai Mall | Sheikh Zayed Rd, Dubai, Dubai, 12345 | 25.1972, 55.2744 | +971 4 123 4567 | Sun-Thu: 10AM-11PM | pharmacy, pickup, delivery |
```

### Australia

```
| Store Locator |
|---------------|
| Name | Address | Coordinates | Phone | Hours | Services |
| Sydney CBD | 456 George St, Sydney, NSW, 2000 | -33.8688, 151.2093 | +61 2 9123 4567 | Mon-Sun: 8AM-9PM | pharmacy, deli, pickup |
| Melbourne Central | 211 La Trobe St, Melbourne, VIC, 3000 | -37.8136, 144.9631 | +61 3 9123 4567 | Mon-Sun: 7AM-10PM | pharmacy, bakery, delivery |
```

---

## 🚀 Planning Future Store Locations

You can add **placeholder rows** for stores you're planning to open later. Incomplete rows will be automatically skipped until you fill in all required data.

### Required Fields (Must be filled for store to appear)
- ✅ **Name** (Column 1)
- ✅ **Address** (Column 2)
- ✅ **Coordinates** (Column 3)

### Optional Fields (Can be empty)
- Phone (Column 4)
- Hours (Column 5)
- Services (Column 6)

### Example: Mix of Active and Planned Stores

```
| Store Locator |
|---------------|
| Name | Address | Coordinates | Phone | Hours | Services |
| San Jose HQ | 345 Park Ave, San Jose, CA, 95110 | 37.3318,-121.8905 | 408-536-2800 | Mon-Fri 8AM-6PM | pharmacy,pickup,delivery |
| Austin, Texas, USA | | | | | |
| Toronto, Canada | | | | | |
| London Store | 123 Oxford St, London, W1D 2HG | 51.5155,-0.1415 | +44 20 7123 4567 | Mon-Sat 8AM-10PM | pharmacy,delivery |
```

In this example:
- ✅ **San Jose HQ** - Complete, will appear in store locator
- ⏳ **Austin** - Placeholder (empty address/coords), will not appear yet
- ⏳ **Toronto** - Placeholder, will not appear yet
- ✅ **London** - Complete, will appear in store locator

**Console Log:**
```
✅ Store Locator: 2 stores loaded, 2 incomplete rows skipped
```

This lets you plan your store rollout in DA.live and gradually complete the data as stores open!

---

## 📍 Getting Coordinates for Any Location

### Method 1: Google Maps (Recommended)
1. Go to [Google Maps](https://maps.google.com)
2. Search for your store address
3. Right-click on the exact location
4. Click the coordinates at the top (e.g., "51.5155, -0.1415")
5. Paste into DA.live: `51.5155, -0.1415`

### Method 2: OpenStreetMap
1. Go to [OpenStreetMap](https://www.openstreetmap.org)
2. Search for your address
3. Look at the URL: `#map=17/51.5155/-0.1415`
4. Extract coordinates: `51.5155, -0.1415`

### Method 3: GPS/Mobile Device
1. Use your phone's GPS at the store location
2. Many map apps show coordinates when you long-press
3. Format as: `latitude, longitude`

### Coordinate Format Rules
- **Latitude first, Longitude second**
- **Range**: Latitude (-90 to 90), Longitude (-180 to 180)
- **Decimals**: 4-6 decimal places for accuracy
- **Separator**: Comma with optional space
- **Examples**: 
  - ✅ `45.5231, -122.6765`
  - ✅ `45.5231,-122.6765`
  - ❌ `-122.6765, 45.5231` (wrong order)

---

## ⏰ Hours Format Options

### Option 1: Simple Text (Recommended)
```
Mon-Fri: 8AM-9PM, Sat-Sun: 9AM-8PM
```

### Option 2: 24-Hour Stores
```
24 hours
```
or
```
Open 24/7
```

### Option 3: Detailed JSON (Advanced)
```json
{"monday":{"open":"07:00","close":"22:00"},"tuesday":{"open":"07:00","close":"22:00"},"wednesday":{"open":"07:00","close":"22:00"},"thursday":{"open":"07:00","close":"22:00"},"friday":{"open":"07:00","close":"23:00"},"saturday":{"open":"07:00","close":"23:00"},"sunday":{"open":"08:00","close":"21:00"}}
```

**Note:** Simple text defaults to standard hours. JSON format allows precise per-day control.

---

## 🏷️ Available Services

Standard service tags (comma-separated, lowercase):

| Service Tag | Description |
|-------------|-------------|
| `pharmacy` | In-store pharmacy |
| `pickup` | Curbside/in-store pickup |
| `delivery` | Home delivery service |
| `24-hour` | Open 24 hours |
| `deli` | Deli counter |
| `bakery` | In-store bakery |
| `organic` | Organic/natural foods section |
| `gas-station` | Gas station on-site |

**Example:**
```
pharmacy, pickup, delivery, deli
```

---

## 📸 Store Photos (Column 7)

Add visual appeal to your store cards with store photos.

### Format
- **Image URL or path**
- Can be absolute (`https://example.com/store.jpg`) or relative (`/images/stores/downtown.jpg`)
- Leave empty if no photo available

### Recommendations
- **Image size:** 800x600px or similar landscape ratio
- **File format:** JPG or WebP for best performance
- **Aspect ratio:** 4:3 or 16:9 works best
- **File size:** < 200KB for fast loading

### Examples
```
/images/stores/downtown.jpg
https://cdn.example.com/stores/portland-main.jpg
/assets/locations/store-001.webp
```

**Tip:** Store photos appear at the top of each card, helping customers recognize your locations.

---

## 🅿️ Store Details (Column 8)

Highlight unique amenities and features for each location.

### Format
- **Comma-separated list** of store-specific details
- Each item appears with a checkmark icon
- Great for parking, accessibility, and special features

### Common Details to Include

**Parking:**
- `Free parking: 50 spaces`
- `Underground parking available`
- `Street parking only`
- `Parking garage adjacent`

**Accessibility:**
- `Wheelchair accessible`
- `Accessible entrance and restrooms`
- `Elevator access`
- `Accessible parking spaces`

**Transportation:**
- `Near subway station`
- `Bus stop in front`
- `Bike parking available`
- `EV charging stations`

**Sustainability:**
- `EV charging`
- `Solar powered`
- `Recycling center`

**Special Features:**
- `ATM inside`
- `Public restrooms`
- `Seating area`
- `Wi-Fi available`

### Examples

**Comprehensive:**
```
Free parking: 50 spaces, Wheelchair accessible, EV charging, ATM inside
```

**Minimal:**
```
Near subway station, Bike racks
```

**Urban Location:**
```
Underground parking, Street level entrance, Bus stop adjacent
```

**Leave empty if no special details:**
```
| Store Name | Address | Coords | Phone | Hours | Services | Photo | |
```

---

## 📝 Complete DA.live Example

### Stores Page

```
# Find Your Nearest Store

Visit us at one of our convenient locations worldwide.

| Store Locator |
|---------------|
| Name | Address | Coordinates | Phone | Hours | Services |
| Portland Downtown | 123 Main St, Portland, OR, 97201 | 45.5231, -122.6765 | (503) 555-0100 | Mon-Fri: 7AM-10PM | pharmacy, deli, pickup, delivery |
| Seattle Capitol Hill | 789 Broadway E, Seattle, WA, 98102 | 47.6205, -122.3212 | (206) 555-0200 | 24 hours | pharmacy, 24-hour, pickup |
| London Oxford St | 123 Oxford St, London, England, W1D 2HG | 51.5155, -0.1415 | +44 20 7123 4567 | Mon-Sat: 8AM-10PM | pharmacy, delivery |
| Paris Marais | 45 Rue de Rivoli, Paris, Île-de-France, 75004 | 48.8566, 2.3522 | +33 1 42 96 12 34 | Mon-Sun: 9AM-9PM | deli, bakery, organic |
| Tokyo Shibuya | 1-1-1 Dogenzaka, Shibuya, Tokyo, 150-0043 | 35.6595, 139.7004 | +81 3-1234-5678 | Mon-Sun: 10AM-10PM | pickup, delivery |
| Sydney CBD | 456 George St, Sydney, NSW, 2000 | -33.8688, 151.2093 | +61 2 9123 4567 | Mon-Sun: 8AM-9PM | pharmacy, deli |
```

**Note:** 
- First row contains only the block name
- Data rows start from row 2
- Configuration options use block metadata or JSON defaults

---

## 🎯 Address Format Guidelines

### United States
```
Street, City, State Abbreviation, ZIP
123 Main Street, Portland, OR, 97201
```

### United Kingdom
```
Street, City, County/Region, Postal Code
123 Oxford Street, London, England, W1D 2HG
```

### Europe (General)
```
Street, City, Region, Postal Code
45 Rue de Rivoli, Paris, Île-de-France, 75004
```

### Asia
```
Address, District, City, Postal Code
1-1-1 Dogenzaka, Shibuya, Tokyo, 150-0043
```

**Key Points:**
- Always use 4 parts separated by commas
- Part 1: Street address
- Part 2: City/District
- Part 3: State/Region/County
- Part 4: Postal/ZIP code

---

## ⚠️ Common Mistakes to Avoid

### ❌ Wrong Coordinate Order
```
| Store Name | Address | -122.6765, 45.5231 |  ← WRONG (lng, lat)
```
✅ **Correct:**
```
| Store Name | Address | 45.5231, -122.6765 |  ← RIGHT (lat, lng)
```

### ❌ Missing Commas in Address
```
| Store Name | 123 Main St Portland OR 97201 |  ← WRONG
```
✅ **Correct:**
```
| Store Name | 123 Main St, Portland, OR, 97201 |  ← RIGHT
```

### ❌ Invalid Coordinates
```
| Store Name | Address | 999, 999 |  ← WRONG (out of range)
```
✅ **Correct:**
```
| Store Name | Address | 45.5231, -122.6765 |  ← RIGHT
```

### ❌ Inconsistent Columns
```
| Store Locator | Address | Coordinates | Phone | Hours | Services |
|---------------|---------|-------------|-------|-------|----------|
| Store 1 | 123 Main St | 45.5, -122.6 | (503) 555-0100 | 9AM-9PM | pharmacy |
| Store 2 | 456 Oak Ave | 45.5, -122.5 |  ← MISSING COLUMNS
```

---

## 🔄 Migrating from Static Data

If you're currently using `stores-data.js`, here's how to migrate:

### Step 1: Export to CSV/Spreadsheet
1. Open `stores-data.js`
2. Create a spreadsheet with your store data
3. Format according to DA.live structure

### Step 2: Convert to DA.live Format

**From stores-data.js:**
```javascript
{
  name: 'Downtown Market',
  address: {
    street: '123 Main Street',
    city: 'Portland',
    state: 'OR',
    zip: '97201',
    coordinates: { lat: 45.5231, lng: -122.6765 }
  },
  contact: { phone: '(503) 555-0100' },
  hours: { /* ... */ },
  services: ['pharmacy', 'pickup', 'delivery']
}
```

**To DA.live row:**
```
| Downtown Market | 123 Main Street, Portland, OR, 97201 | 45.5231, -122.6765 | (503) 555-0100 | Mon-Fri: 7AM-10PM | pharmacy, pickup, delivery |
```

### Step 3: Update Configuration
Change data source in DA.live:
```
| Store Locator | ... |
|---------------|-----|
| Data Source   | block-content |
```

---

## 🧪 Testing Your Stores

### Validation Checklist

- [ ] Each row has all 8 columns (Name, Address, Coordinates, Phone, Hours, Services, Photo, Details)
- [ ] Store names are unique and descriptive
- [ ] Addresses follow format: `Street, City, State, ZIP`
- [ ] Coordinates are in format: `LAT, LNG` (not reversed)
- [ ] Coordinates are within valid ranges (lat: -90 to 90, lng: -180 to 180)
- [ ] Phone numbers are formatted consistently
- [ ] Hours are either text or valid JSON
- [ ] Services are comma-separated, lowercase, no extra spaces
- [ ] Photo URLs are valid (optional)
- [ ] Details are comma-separated (optional)

### Preview Testing

1. Click "Preview" in DA.live
2. Check that all stores appear in list
3. Verify distances calculate correctly
4. Test search by address
5. Try filtering by services
6. Check map markers (if Google Maps enabled)
7. Test "Get Directions" links

---

## 📊 Best Practices

### Store Naming
- ✅ Use descriptive names: "Portland Downtown", "Seattle Capitol Hill"
- ✅ Include neighborhood/district for clarity
- ❌ Avoid generic names: "Store 1", "Location A"

### Coordinate Accuracy
- Use **4-6 decimal places** for precision
- 4 decimals ≈ 11 meters accuracy
- 6 decimals ≈ 0.11 meters accuracy

### Service Tags
- Keep tags consistent across all stores
- Use lowercase for reliability
- Common tags: `pharmacy`, `pickup`, `delivery`, `deli`, `bakery`

### Hours Format
- Use simple text for most cases
- Reserve JSON for complex schedules
- Always include closing time for "Open" status to work

---

## 🌐 Multi-Language Support

You can add stores in any language:

```
| Store Locator | Address | Coordinates | Phone | Hours | Services |
|---------------|---------|-------------|-------|-------|----------|
| パリマレ店 | 45 Rue de Rivoli, Paris, France, 75004 | 48.8566, 2.3522 | +33 1 42 96 12 34 | 月-日: 9AM-9PM | pharmacy, delivery |
| 시부야점 | 1-1-1 Dogenzaka, Shibuya, Tokyo, 150-0043 | 35.6595, 139.7004 | +81 3-1234-5678 | 월-일: 10AM-10PM | pickup, delivery |
```

---

## 🔧 Advanced: Bulk Import

For adding many stores at once:

### Method 1: Spreadsheet → DA.live
1. Create CSV with columns: Name, Address, Coordinates, Phone, Hours, Services
2. Import into DA.live table editor
3. Verify formatting

### Method 2: JSON → DA.live
1. Keep using JSON file for now: `data-source="json-file"`
2. Gradually migrate to DA.live as stores are updated
3. Both can coexist during transition

---

## 📞 Support & Troubleshooting

### No Stores Showing
- Check browser console for parsing errors
- Verify all rows have 6 columns
- Ensure coordinates are valid numbers

### Wrong Store Locations on Map
- Double-check lat/lng order (latitude first!)
- Verify coordinates are correct from Google Maps
- Check for typos in coordinate numbers

### Distance Not Calculating
- Ensure user location is being detected
- Check that coordinates are within valid ranges
- Try manual address search

### Services Not Filtering
- Verify service tags match exactly (case-sensitive during authoring)
- Check for extra spaces: `pharmacy,pickup` not `pharmacy, pickup`
- Services must be lowercase in block

---

## ✅ Quick Reference

**Minimum Required:**
```
| Store Locator |
|---------------|
| Name | Address | Coordinates | Phone | Hours | Services | Photo | Details |
| Store Name | Street, City, State, ZIP | LAT, LNG | Phone | Hours | services | | |
```

**Full Featured Template:**
```
| Store Locator |
|---------------|
| Name | Address | Coordinates | Phone | Hours | Services | Photo | Details |
| US Store | 123 St, City, ST, ZIP | 40.7128, -74.0060 | +1 212 555 0100 | Mon-Fri: 8AM-9PM | pharmacy, pickup | /images/us-store.jpg | Free parking, WiFi |
| UK Store | 123 St, City, Region, POST | 51.5074, -0.1278 | +44 20 7123 4567 | Mon-Sat: 9AM-8PM | delivery, deli | /images/uk-store.jpg | Near tube station |
| Asia Store | Address, District, City, POST | 35.6762, 139.6503 | +81 3 1234 5678 | Mon-Sun: 10AM-10PM | pickup | | Bike parking |
```

---

**That's it! Your Store Locator now supports worldwide locations defined directly in DA.live.** 🌍
