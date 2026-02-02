/* eslint-disable no-console, no-undef */
import { storesData } from './stores-data.js';

/**
 * Parse block configuration from DA.live table rows
 * @param {Element} block - The block element from DA.live
 * @returns {Object} Parsed configuration object
 */
function parseBlockConfig(block) {
  const config = {
    googleMapsApiKey: '',
    autocompleteProvider: 'nominatim',
    defaultView: 'split',
    mapProvider: 'google',
    searchRadius: 25,
    maxResults: 10,
    autoDetect: true,
    showDistance: true,
    defaultLocation: 'Portland, OR',
    servicesFilter: ['pharmacy', 'pickup', 'delivery', '24-hour', 'deli', 'bakery'],
    zoomLevel: 11,
    dataSource: 'block-content',
  };

  // Parse configuration from table rows
  const rows = [...block.children];
  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const key = cells[0]?.textContent?.trim();
      const value = cells[1]?.textContent?.trim();

      if (!key || !value) return;

      // Map configuration keys from DA.live to config object
      switch (key) {
        case 'Google Maps API Key':
          config.googleMapsApiKey = value;
          console.log('📍 Google Maps API Key found:', `${value.substring(0, 20)}...`);
          break;
        case 'Autocomplete Provider':
          config.autocompleteProvider = value.toLowerCase();
          console.log('🔍 Autocomplete Provider:', value);
          break;
        case 'Default View':
          config.defaultView = value.toLowerCase();
          break;
        case 'Map Provider':
          config.mapProvider = value.toLowerCase();
          break;
        case 'Search Radius':
          config.searchRadius = parseInt(value, 10) || 25;
          break;
        case 'Max Results':
          config.maxResults = parseInt(value, 10) || 10;
          break;
        case 'Auto Detect Location':
          config.autoDetect = value.toLowerCase() !== 'false';
          break;
        case 'Show Distance':
          config.showDistance = value.toLowerCase() !== 'false';
          break;
        case 'Default Location':
          config.defaultLocation = value;
          break;
        case 'Zoom Level':
          config.zoomLevel = parseInt(value, 10) || 11;
          break;
        default:
          // Not a config row, skip
          break;
      }
    }
  });

  return config;
}

/**
 * Dynamically load Google Maps API script with Places library
 * @param {string} apiKey - Google Maps API key from configuration
 * @returns {Promise<boolean>} Resolves when Google Maps is loaded
 */
async function loadGoogleMaps(apiKey) {
  // If Google Maps is already loaded, return immediately
  if (window.google?.maps) {
    console.log('✅ Google Maps already loaded');
    return true;
  }

  // If no API key provided, fail gracefully
  if (!apiKey) {
    console.warn('⚠️ No Google Maps API key provided');
    return false;
  }

  return new Promise((resolve, reject) => {
    console.log('📍 Loading Google Maps API with Places library...');

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('✅ Google Maps API loaded successfully (with Places)');
      resolve(true);
    };

    script.onerror = () => {
      console.error('❌ Failed to load Google Maps API');
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees to convert
 * @returns {number} Radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in miles
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 3959; // Earth radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2))
    * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get user's current location via Geolocation API
 * @returns {Promise<Object>} User coordinates {lat, lng}
 */
async function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }),
      (error) => reject(error),
      { timeout: 10000, enableHighAccuracy: true },
    );
  });
}

/**
 * Geocode address to coordinates using Nominatim (OpenStreetMap)
 * @param {string} address - Address to geocode
 * @returns {Promise<Object>} Coordinates {lat, lng}
 */
async function geocodeAddress(address) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;

    console.log('Geocoding address:', address);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'StoreLocator/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding API returned status ${response.status}`);
    }

    const data = await response.json();

    if (data?.[0]) {
      const coords = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
      console.log('Geocoded coordinates:', coords);
      return coords;
    }
    throw new Error('No results found for address');
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

/**
 * Parse hours from text format to structured object
 * @param {string} hoursText - Hours in format "Mon-Fri: 8AM-9PM, Sat-Sun: 9AM-8PM"
 * @returns {Object} Structured hours object
 */
function parseHours(hoursText) {
  const defaultHours = {
    monday: { open: '09:00', close: '21:00' },
    tuesday: { open: '09:00', close: '21:00' },
    wednesday: { open: '09:00', close: '21:00' },
    thursday: { open: '09:00', close: '21:00' },
    friday: { open: '09:00', close: '21:00' },
    saturday: { open: '09:00', close: '21:00' },
    sunday: { open: '10:00', close: '20:00' },
  };

  if (!hoursText || hoursText.trim() === '') {
    return defaultHours;
  }

  // Try parsing JSON format first
  try {
    const parsed = JSON.parse(hoursText);
    if (parsed.monday) return parsed;
  } catch (e) {
    // Not JSON, continue with text parsing
  }

  // Parse text format like "Mon-Fri: 8AM-9PM, Sat-Sun: 9AM-8PM" or "24 hours"
  const text = hoursText.toLowerCase().trim();

  if (text.includes('24') && text.includes('hour')) {
    const hours24 = { open: '00:00', close: '23:59' };
    return {
      monday: hours24,
      tuesday: hours24,
      wednesday: hours24,
      thursday: hours24,
      friday: hours24,
      saturday: hours24,
      sunday: hours24,
    };
  }

  // For simple format, return default
  return defaultHours;
}

/**
 * Parse stores from DA.live block content (rows)
 * @param {Element} block - The block element
 * @returns {Object} Store data object with stores array
 */
function parseStoresFromBlock(block) {
  const rows = [...block.children];
  const stores = [];
  let skippedCount = 0;

  // Skip first row (column headers only):
  // Row 0 = column headers
  // (Name | Address | Coordinates | Phone | Hours | Services | Photo | Details)
  // Row 1+ = actual store data
  rows.slice(1).forEach((row, index) => {
    const cells = [...row.children];

    // Need at least 6 columns (original): Name, Address, Coordinates,
    // Phone, Hours, Services. Optional columns 7-8: Photo, Details
    if (cells.length < 6) {
      skippedCount += 1;
      return;
    }

    const storeName = cells[0]?.textContent?.trim();
    const addressText = cells[1]?.textContent?.trim();
    const coordsText = cells[2]?.textContent?.trim();
    const phone = cells[3]?.textContent?.trim();
    const hoursText = cells[4]?.textContent?.trim();
    const servicesText = cells[5]?.textContent?.trim();
    const photoUrl = cells[6]?.textContent?.trim() || '';
    const detailsText = cells[7]?.textContent?.trim() || '';

    // Silently skip incomplete rows (for future/planned stores)
    if (!storeName || !addressText || !coordsText) {
      skippedCount += 1;
      return;
    }

    // Parse address (format: "123 Main St, Portland, OR, 97201")
    const addressParts = addressText.split(',').map((p) => p.trim());
    const street = addressParts[0] || '';
    const city = addressParts[1] || '';
    const state = addressParts[2] || '';
    const zip = addressParts[3] || '';

    // Parse coordinates (format: "45.5231, -122.6765" or "45.5231,-122.6765")
    const coordsParts = coordsText.split(',').map((p) => parseFloat(p.trim()));
    const lat = coordsParts[0] || 0;
    const lng = coordsParts[1] || 0;

    // Validate coordinates
    if (lat === 0 && lng === 0) {
      skippedCount += 1;
      return;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      skippedCount += 1;
      return;
    }

    // Parse services (comma-separated: "pharmacy, pickup, delivery")
    const services = servicesText
      ? servicesText.split(',').map((s) => s.trim().toLowerCase()).filter((s) => s)
      : [];

    // Parse hours
    const hours = parseHours(hoursText);

    // Parse store details (comma-separated: "Free parking, Wheelchair accessible")
    const details = detailsText
      ? detailsText.split(',').map((d) => d.trim()).filter((d) => d)
      : [];

    // Create store object
    const store = {
      id: `store-${index}`,
      name: storeName,
      address: {
        street,
        city,
        state,
        zip,
        coordinates: { lat, lng },
      },
      contact: {
        phone: phone || '',
        email: '', // Not provided in DA.live
      },
      hours,
      services,
      photo: photoUrl,
      details,
      specialHours: [],
      featured: false,
    };

    stores.push(store);
  });

  // Summary log
  const skipMsg = skippedCount > 0 ? `, ${skippedCount} incomplete rows skipped` : '';
  console.log(`✅ Store Locator: ${stores.length} stores loaded${skipMsg}`);

  return { stores };
}

/**
 * Load store data from configured source
 * @param {Object} config - Block configuration
 * @param {Element} block - Block element for parsing rows
 * @returns {Promise<Object>} Store data
 */
async function loadStoreData(config, block) {
  console.log('Loading store data from:', config.dataSource);

  if (config.dataSource === 'block-content') {
    return parseStoresFromBlock(block);
  }
  if (config.dataSource === 'embedded') {
    return storesData;
  }
  if (config.dataSource === 'json-file') {
    const response = await fetch('/data/stores.json');
    return response.json();
  }
  if (config.dataSource === 'api') {
    const response = await fetch('/api/stores');
    return response.json();
  }
  return storesData;
}

/**
 * Filter stores by selected services and open status
 * @param {Array} stores - Array of store objects
 * @param {Array} selectedServices - Array of service strings to filter by
 * @param {boolean} openNow - Filter for open stores only
 * @returns {Array} Filtered stores
 */
function filterStores(stores, selectedServices, openNow = false) {
  let filtered = stores;

  // Filter by services
  if (selectedServices.length > 0) {
    filtered = filtered.filter((store) => (
      selectedServices.every((service) => store.services.includes(service))
    ));
  }

  // Filter by open status
  if (openNow) {
    filtered = filtered.filter((store) => isStoreOpen(store));
  }

  return filtered;
}

/**
 * Sort stores by criteria
 * @param {Array} stores - Array of store objects
 * @param {string} sortBy - Sort criteria (distance, name, recent)
 * @param {Object} userLocation - User location {lat, lng} for distance calculation
 * @returns {Array} Sorted stores with distance calculated (if userLocation available)
 */
function sortStores(stores, sortBy, userLocation = null) {
  let sorted = [...stores];

  // Always calculate distance when user location is available (regardless of sort order)
  if (userLocation) {
    sorted = sorted.map((store) => ({
      ...store,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        store.address.coordinates.lat,
        store.address.coordinates.lng,
      ),
    }));
  }

  // Apply sorting based on selected criteria
  if (sortBy === 'distance' && userLocation) {
    return sorted.sort((a, b) => a.distance - b.distance);
  }

  if (sortBy === 'name') {
    return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (sortBy === 'recent') {
    // Most recently added stores first (reverse order)
    return sorted.reverse();
  }

  return sorted;
}

/**
 * Sort stores by distance from user location
 * @param {Array} stores - Array of store objects
 * @param {number} userLat - User latitude
 * @param {number} userLng - User longitude
 * @returns {Array} Stores with distance property, sorted by distance
 */
// eslint-disable-next-line no-unused-vars
function sortStoresByDistance(stores, userLat, userLng) {
  return stores
    .map((store) => ({
      ...store,
      distance: calculateDistance(
        userLat,
        userLng,
        store.address.coordinates.lat,
        store.address.coordinates.lng,
      ),
    }))
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Determine if store is currently open based on hours
 * @param {Object} store - Store object with hours
 * @returns {boolean} True if store is currently open
 */
function isStoreOpen(store) {
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

  // Check special hours first
  const today = now.toISOString().slice(0, 10);
  const specialHour = store.specialHours?.find((sh) => sh.date === today);
  if (specialHour?.status === 'closed') return false;

  const hours = store.hours[day];
  if (!hours) return false;

  // Handle 24-hour stores
  if (hours.open === '00:00' && hours.close === '23:59') return true;

  return currentTime >= hours.open && currentTime <= hours.close;
}

/**
 * Format time from 24h to 12h format
 * @param {string} time - Time in HH:MM format
 * @returns {string} Time in 12h format
 */
function formatTime(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get today's closing time for display
 * @param {Object} store - Store object
 * @returns {string} Formatted closing time or status
 */
function getTodayHours(store) {
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const hours = store.hours[day];

  if (!hours) return 'Hours not available';

  // Check if 24-hour
  if (hours.open === '00:00' && hours.close === '23:59') {
    return 'Open 24 hours';
  }

  const isOpen = isStoreOpen(store);
  if (isOpen) {
    return `Open until ${formatTime(hours.close)}`;
  }
  return `Opens at ${formatTime(hours.open)}`;
}

/**
 * Render a single store card
 * @param {Object} store - Store object
 * @param {boolean} showDistance - Whether to show distance
 * @returns {Element} Store card element
 */
function renderStoreCard(store, showDistance = true) {
  const card = document.createElement('article');
  card.classList.add('store-card');
  card.dataset.storeId = store.id;

  const isOpen = isStoreOpen(store);

  // Store photo (if available)
  if (store.photo) {
    const photo = document.createElement('img');
    photo.classList.add('store-photo');
    photo.src = store.photo;
    photo.alt = `${store.name} storefront`;
    photo.loading = 'lazy';
    card.appendChild(photo);
  }

  // Header with name and status
  const header = document.createElement('div');
  header.classList.add('store-card-header');

  const name = document.createElement('h3');
  name.classList.add('store-name');
  name.textContent = store.name;

  const status = document.createElement('span');
  status.classList.add('store-status', isOpen ? 'open' : 'closed');
  status.innerHTML = isOpen ? '● Open' : '○ Closed';

  header.appendChild(name);
  header.appendChild(status);
  card.appendChild(header);

  // Address
  const address = document.createElement('address');
  address.classList.add('store-address');
  address.innerHTML = `
    ${store.address.street}<br>
    ${store.address.city}, ${store.address.state} ${store.address.zip}
  `;
  card.appendChild(address);

  // Distance (if available)
  if (showDistance && store.distance !== undefined) {
    const distance = document.createElement('div');
    distance.classList.add('store-distance');
    distance.innerHTML = `📍 ${store.distance.toFixed(1)} miles away`;
    card.appendChild(distance);
  }

  // Contact
  const contact = document.createElement('div');
  contact.classList.add('store-contact');
  contact.innerHTML = `
    <a href="tel:${store.contact.phone.replace(/\D/g, '')}" class="store-phone">
      ${store.contact.phone}
    </a>
  `;
  card.appendChild(contact);

  // Services
  if (store.services && store.services.length > 0) {
    const services = document.createElement('div');
    services.classList.add('store-services');
    store.services.forEach((service) => {
      const badge = document.createElement('span');
      badge.classList.add('service-badge');
      badge.textContent = service;
      services.appendChild(badge);
    });
    card.appendChild(services);
  }

  // Store details (parking, accessibility, features)
  if (store.details && store.details.length > 0) {
    const details = document.createElement('div');
    details.classList.add('store-details');
    store.details.forEach((detail) => {
      const detailItem = document.createElement('span');
      detailItem.classList.add('detail-item');
      detailItem.textContent = detail;
      details.appendChild(detailItem);
    });
    card.appendChild(details);
  }

  // Today's hours
  const hoursToday = document.createElement('div');
  hoursToday.classList.add('store-hours-today');
  hoursToday.textContent = getTodayHours(store);
  card.appendChild(hoursToday);

  // Actions
  const actions = document.createElement('div');
  actions.classList.add('store-actions');

  const directionsBtn = document.createElement('a');
  directionsBtn.classList.add('btn-directions');
  directionsBtn.href = `https://maps.google.com/?q=${store.address.coordinates.lat},${store.address.coordinates.lng}`;
  directionsBtn.target = '_blank';
  directionsBtn.rel = 'noopener noreferrer';
  directionsBtn.innerHTML = '📍 Get Directions';

  const setStoreBtn = document.createElement('button');
  setStoreBtn.classList.add('btn-set-store');
  setStoreBtn.dataset.storeId = store.id;

  // Check if this is already the preferred store
  const preferredStoreId = localStorage.getItem('preferredStore');

  if (preferredStoreId === store.id) {
    // This IS the preferred store - show disabled state
    setStoreBtn.innerHTML = '✓ My Store';
    setStoreBtn.disabled = true;
  } else if (preferredStoreId) {
    // A DIFFERENT store is preferred - show "Switch" button
    setStoreBtn.innerHTML = '↔️ Switch to This Store';
    setStoreBtn.addEventListener('click', () => {
      setPreferredStore(store.id, store.name);

      // Trigger page refresh to show new hero card
      window.location.reload();
    });
  } else {
    // NO store is preferred - show "Set" button
    setStoreBtn.innerHTML = '⭐ Set as My Store';
    setStoreBtn.addEventListener('click', () => {
      setPreferredStore(store.id, store.name);

      // Trigger page refresh to show hero card
      window.location.reload();
    });
  }

  actions.appendChild(directionsBtn);
  actions.appendChild(setStoreBtn);
  card.appendChild(actions);

  return card;
}

/**
 * Set preferred store in localStorage
 * @param {string} storeId - Store ID
 * @param {string} storeName - Store name
 */
function setPreferredStore(storeId, storeName) {
  localStorage.setItem('preferredStore', storeId);
  localStorage.setItem('preferredStoreName', storeName);

  // Dispatch custom event for other components to listen to
  document.dispatchEvent(new CustomEvent('store-selected', {
    detail: { storeId, storeName },
  }));
}

/**
 * Clear preferred store from localStorage
 */
function clearPreferredStore() {
  const storeName = localStorage.getItem('preferredStoreName') || 'your store';

  // Show confirmation modal
  // eslint-disable-next-line no-alert, no-restricted-globals
  const confirmed = confirm(`Are you sure you want to remove "${storeName}" as your preferred store?`);

  if (confirmed) {
    localStorage.removeItem('preferredStore');
    localStorage.removeItem('preferredStoreName');

    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('store-cleared'));

    console.log('✅ Preferred store cleared');
    return true;
  }

  return false;
}

/**
 * Calculate real-time store status using existing helper functions
 * @param {Object} store - Store object with hours
 * @returns {Object} Status object with state, message, and color
 */
function getStoreStatus(store) {
  if (!store.hours) {
    return {
      state: 'unknown', message: 'Hours not available', color: 'gray', emoji: '❓',
    };
  }

  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todayHours = store.hours[currentDay];

  // Check if store is closed today
  if (!todayHours) {
    return {
      state: 'closed', message: 'Closed today', color: 'red', emoji: '🔴',
    };
  }

  // Check if 24-hour store
  if (todayHours.open === '00:00' && todayHours.close === '23:59') {
    return {
      state: 'open', message: 'Open 24 hours', color: 'green', emoji: '🟢',
    };
  }

  const isOpen = isStoreOpen(store);
  const todayHoursText = getTodayHours(store);

  if (isOpen) {
    // Parse closing time to check if closing soon
    const [hours, minutes] = todayHours.close.split(':').map(Number);
    const closeMinutes = hours * 60 + minutes;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const minutesUntilClose = closeMinutes - currentMinutes;

    if (minutesUntilClose <= 60 && minutesUntilClose > 0) {
      return {
        state: 'closing-soon',
        message: `Closes in ${minutesUntilClose} min`,
        color: 'yellow',
        emoji: '🟡',
      };
    }

    return {
      state: 'open',
      message: todayHoursText,
      color: 'green',
      emoji: '🟢',
    };
  }

  // Store is closed - check if opening soon
  const [openHours, openMinutes] = todayHours.open.split(':').map(Number);
  const openTime = openHours * 60 + openMinutes;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (openTime > currentMinutes && (openTime - currentMinutes) <= 60) {
    return {
      state: 'opening-soon',
      message: `Opens in ${openTime - currentMinutes} min`,
      color: 'yellow',
      emoji: '⏰',
    };
  }

  return {
    state: 'closed',
    message: todayHoursText,
    color: 'red',
    emoji: '🔴',
  };
}

/**
 * Render the "My Store" hero card
 * @param {Object} store - The preferred store object
 * @param {Object} userLocation - User's current location {lat, lng}
 * @returns {HTMLElement} Hero card element
 */
function renderMyStoreHeroCard(store, userLocation = null) {
  const heroCard = document.createElement('div');
  heroCard.classList.add('my-store-hero');

  // Header
  const header = document.createElement('div');
  header.classList.add('my-store-header');
  header.innerHTML = '<span class="my-store-badge">⭐ MY STORE</span>';
  heroCard.appendChild(header);

  // Store name
  const name = document.createElement('h3');
  name.classList.add('my-store-name');
  name.textContent = store.name;
  heroCard.appendChild(name);

  // Address and status row
  const metaRow = document.createElement('div');
  metaRow.classList.add('my-store-meta');

  const address = document.createElement('span');
  address.classList.add('my-store-address');
  address.textContent = store.address.street;
  metaRow.appendChild(address);

  // Distance (if available)
  if (userLocation && store.distance !== undefined) {
    const distance = document.createElement('span');
    distance.classList.add('my-store-distance');
    distance.textContent = `📍 ${store.distance.toFixed(1)} mi`;
    metaRow.appendChild(distance);
  }

  // Real-time status
  const status = getStoreStatus(store);
  const statusBadge = document.createElement('span');
  statusBadge.classList.add('my-store-status', `status-${status.state}`);
  statusBadge.textContent = `${status.emoji} ${status.message}`;
  metaRow.appendChild(statusBadge);

  heroCard.appendChild(metaRow);

  // Phone
  if (store.contact && store.contact.phone) {
    const phone = document.createElement('a');
    phone.classList.add('my-store-phone');
    phone.href = `tel:${store.contact.phone.replace(/\D/g, '')}`;
    phone.textContent = `📞 ${store.contact.phone}`;
    heroCard.appendChild(phone);
  }

  // Services (if any)
  if (store.services && store.services.length > 0) {
    const servicesContainer = document.createElement('div');
    servicesContainer.classList.add('my-store-services');

    store.services.slice(0, 4).forEach((service) => {
      const badge = document.createElement('span');
      badge.classList.add('service-badge-small');
      badge.textContent = service;
      servicesContainer.appendChild(badge);
    });

    heroCard.appendChild(servicesContainer);
  }

  // Action buttons
  const actions = document.createElement('div');
  actions.classList.add('my-store-actions');

  // Call button
  if (store.contact && store.contact.phone) {
    const callBtn = document.createElement('a');
    callBtn.classList.add('btn-my-store-action');
    callBtn.href = `tel:${store.contact.phone.replace(/\D/g, '')}`;
    callBtn.textContent = 'Call Store';
    actions.appendChild(callBtn);
  }

  // Directions button
  const directionsBtn = document.createElement('a');
  directionsBtn.classList.add('btn-my-store-action');
  directionsBtn.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${store.address.street}, ${store.address.city}, ${store.address.state} ${store.address.zip}`,
  )}`;
  directionsBtn.target = '_blank';
  directionsBtn.rel = 'noopener noreferrer';
  directionsBtn.textContent = 'Get Directions';
  actions.appendChild(directionsBtn);

  // Change store button
  const changeBtn = document.createElement('button');
  changeBtn.classList.add('btn-my-store-change');
  changeBtn.textContent = 'Change Store';
  changeBtn.addEventListener('click', () => {
    // Scroll to results
    const resultsSection = document.querySelector('.store-results');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  actions.appendChild(changeBtn);

  // Clear store button
  const clearBtn = document.createElement('button');
  clearBtn.classList.add('btn-my-store-clear');
  clearBtn.textContent = 'Clear';
  clearBtn.addEventListener('click', () => {
    if (clearPreferredStore()) {
      // Remove hero card from DOM
      heroCard.remove();

      // Update all store cards to show "Set as My Store" button
      document.querySelectorAll('.btn-set-store').forEach((btn) => {
        btn.innerHTML = '⭐ Set as My Store';
        btn.disabled = false;
      });
    }
  });
  actions.appendChild(clearBtn);

  heroCard.appendChild(actions);

  return heroCard;
}

/**
 * Get unique services from all stores
 * @param {Array} stores - Array of store objects
 * @returns {Array} Unique services found in store data
 */
function getAvailableServices(stores) {
  const servicesSet = new Set();

  stores.forEach((store) => {
    if (store.services && Array.isArray(store.services)) {
      store.services.forEach((service) => {
        if (service && service.trim()) {
          servicesSet.add(service.toLowerCase().trim());
        }
      });
    }
  });

  // Convert to array and sort alphabetically
  return Array.from(servicesSet).sort();
}

/**
 * Save user preferences to localStorage
 * @param {Object} preferences - Preferences object
 */
function savePreferences(preferences) {
  const existing = JSON.parse(localStorage.getItem('storeLocatorPrefs') || '{}');
  const updated = { ...existing, ...preferences };
  localStorage.setItem('storeLocatorPrefs', JSON.stringify(updated));
}

/**
 * Load user preferences from localStorage
 * @returns {Object} Preferences object
 */
function loadPreferences() {
  try {
    return JSON.parse(localStorage.getItem('storeLocatorPrefs') || '{}');
  } catch (e) {
    return {};
  }
}

/**
 * Create search section with input and filters
 * @param {Object} config - Block configuration
 * @param {Array} availableServices - Services found in actual store data
 * @param {Function} onSearch - Search callback function
 * @param {Function} onSortChange - Sort change callback
 * @returns {Element} Search section element
 */
function createSearchSection(config, availableServices, onSearch, onSortChange) {
  const section = document.createElement('div');
  section.classList.add('store-locator-search');

  // Load saved preferences
  const prefs = loadPreferences();

  // Title
  const title = document.createElement('h2');
  title.classList.add('store-locator-title');
  title.textContent = 'Find Your Nearest Store';
  section.appendChild(title);

  // Search form
  const form = document.createElement('form');
  form.classList.add('store-search-form');
  form.setAttribute('role', 'search');

  const inputWrapper = document.createElement('div');
  inputWrapper.classList.add('search-input-wrapper');

  // Autocomplete wrapper
  const autocompleteWrapper = document.createElement('div');
  autocompleteWrapper.classList.add('autocomplete-wrapper');

  const input = document.createElement('input');
  input.type = 'text';
  input.classList.add('search-input');
  input.placeholder = 'Enter ZIP code, city, or address';
  input.setAttribute('aria-label', 'Enter location to search for stores');
  input.setAttribute('autocomplete', 'off');

  // Restore last search
  if (prefs.lastSearch) {
    input.value = prefs.lastSearch;
  }

  // Autocomplete dropdown
  const autocompleteList = document.createElement('div');
  autocompleteList.classList.add('autocomplete-list');
  autocompleteList.setAttribute('role', 'listbox');

  autocompleteWrapper.appendChild(input);
  autocompleteWrapper.appendChild(autocompleteList);

  const searchBtn = document.createElement('button');
  searchBtn.type = 'submit';
  searchBtn.classList.add('btn-search');
  searchBtn.innerHTML = '🔍 Search';

  const locationBtn = document.createElement('button');
  locationBtn.type = 'button';
  locationBtn.classList.add('btn-location');
  locationBtn.innerHTML = '📍 Use My Location';
  locationBtn.setAttribute('aria-label', 'Use my current location');

  inputWrapper.appendChild(autocompleteWrapper);
  inputWrapper.appendChild(searchBtn);
  inputWrapper.appendChild(locationBtn);
  form.appendChild(inputWrapper);

  // Sort and filter controls row
  const controlsRow = document.createElement('div');
  controlsRow.classList.add('controls-row');

  // Sort controls
  const sortSection = document.createElement('div');
  sortSection.classList.add('sort-controls');

  const sortLabel = document.createElement('label');
  sortLabel.textContent = 'Sort by:';
  sortLabel.classList.add('sort-label');
  sortLabel.setAttribute('for', 'sort-select');
  sortSection.appendChild(sortLabel);

  const sortSelect = document.createElement('select');
  sortSelect.id = 'sort-select';
  sortSelect.classList.add('sort-select');
  sortSelect.setAttribute('aria-label', 'Sort stores by');

  const sortOptions = [
    { value: 'distance', label: 'Distance' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'recent', label: 'Recently Added' },
  ];

  sortOptions.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option.value;
    opt.textContent = option.label;
    if (prefs.sortBy === option.value) {
      opt.selected = true;
    }
    sortSelect.appendChild(opt);
  });

  sortSection.appendChild(sortSelect);
  controlsRow.appendChild(sortSection);

  // Services filter
  const filterSection = document.createElement('div');
  filterSection.classList.add('services-filter');

  const filterLabel = document.createElement('label');
  filterLabel.textContent = 'Filter:';
  filterLabel.classList.add('filter-label');
  filterSection.appendChild(filterLabel);

  const filterWrapper = document.createElement('div');
  filterWrapper.classList.add('filter-checkboxes');

  // Add "Open Now" filter first
  const openNowWrapper = document.createElement('label');
  openNowWrapper.classList.add('checkbox-label', 'checkbox-open-now');

  const openNowCheckbox = document.createElement('input');
  openNowCheckbox.type = 'checkbox';
  openNowCheckbox.value = 'open-now';
  openNowCheckbox.classList.add('open-now-checkbox');
  openNowCheckbox.setAttribute('aria-label', 'Show only open stores');

  // Restore open-now preference
  if (prefs.openNow) {
    openNowCheckbox.checked = true;
  }

  const openNowLabel = document.createElement('span');
  openNowLabel.textContent = 'Open Now';

  openNowWrapper.appendChild(openNowCheckbox);
  openNowWrapper.appendChild(openNowLabel);
  filterWrapper.appendChild(openNowWrapper);

  // Add service filters (only services that actually exist in the data)
  availableServices.forEach((service) => {
    const checkboxWrapper = document.createElement('label');
    checkboxWrapper.classList.add('checkbox-label');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = service;
    checkbox.classList.add('service-checkbox');
    checkbox.setAttribute('aria-label', `Filter by ${service}`);

    // Restore service filter preferences
    if (prefs.selectedServices?.includes(service)) {
      checkbox.checked = true;
    }

    const labelText = document.createElement('span');
    labelText.textContent = service;

    checkboxWrapper.appendChild(checkbox);
    checkboxWrapper.appendChild(labelText);
    filterWrapper.appendChild(checkboxWrapper);
  });

  filterSection.appendChild(filterWrapper);
  controlsRow.appendChild(filterSection);
  section.appendChild(form);
  section.appendChild(controlsRow);

  // Autocomplete functionality (Google Places or Nominatim)
  let autocompleteTimeout;
  let googleAutocompleteService = null;

  // Initialize Google Places Autocomplete Service if using Google
  if (config.autocompleteProvider === 'google' && window.google?.maps?.places) {
    googleAutocompleteService = new google.maps.places.AutocompleteService();
    console.log('🔍 Using Google Places Autocomplete');
  } else if (config.autocompleteProvider === 'google') {
    console.warn('⚠️ Google autocomplete selected but Google Maps not loaded. Falling back to Nominatim.');
  }

  input.addEventListener('input', (e) => {
    const query = e.target.value.trim();

    clearTimeout(autocompleteTimeout);

    if (query.length < 3) {
      autocompleteList.innerHTML = '';
      autocompleteList.classList.remove('visible');
      return;
    }

    console.log('🔍 Autocomplete triggered for:', query);

    autocompleteTimeout = setTimeout(async () => {
      try {
        // Use Google Places Autocomplete
        if (config.autocompleteProvider === 'google' && googleAutocompleteService) {
          googleAutocompleteService.getPlacePredictions(
            {
              input: query,
              types: ['geocode'],
            },
            (predictions, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                autocompleteList.innerHTML = '';
                predictions.forEach((prediction) => {
                  const item = document.createElement('div');
                  item.classList.add('autocomplete-item');
                  item.setAttribute('role', 'option');
                  item.textContent = prediction.description;
                  item.addEventListener('click', () => {
                    input.value = prediction.description;
                    autocompleteList.innerHTML = '';
                    autocompleteList.classList.remove('visible');
                    onSearch({ type: 'address', value: prediction.description });
                  });
                  autocompleteList.appendChild(item);
                });
                autocompleteList.classList.add('visible');
              } else {
                autocompleteList.innerHTML = '';
                autocompleteList.classList.remove('visible');
              }
            },
          );
        } else {
          // Use Nominatim (OpenStreetMap) - FREE
          console.log('🌍 Using Nominatim autocomplete for:', query);
          const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
          const response = await fetch(url, {
            headers: { 'User-Agent': 'StoreLocator/1.0' },
          });
          const results = await response.json();
          console.log('✅ Nominatim results:', results.length, 'suggestions');

          if (results.length > 0) {
            autocompleteList.innerHTML = '';
            results.forEach((result) => {
              const item = document.createElement('div');
              item.classList.add('autocomplete-item');
              item.setAttribute('role', 'option');
              item.textContent = result.display_name;
              item.addEventListener('click', () => {
                input.value = result.display_name;
                autocompleteList.innerHTML = '';
                autocompleteList.classList.remove('visible');
                onSearch({ type: 'address', value: result.display_name });
              });
              autocompleteList.appendChild(item);
            });
            autocompleteList.classList.add('visible');
            console.log('👁️ Autocomplete dropdown shown with', results.length, 'items');
          } else {
            autocompleteList.innerHTML = '';
            autocompleteList.classList.remove('visible');
            console.log('⚠️ No autocomplete results found');
          }
        }
      } catch (error) {
        console.error('Autocomplete error:', error);
      }
    }, 300);
  });

  // Close autocomplete on outside click
  document.addEventListener('click', (e) => {
    if (!autocompleteWrapper.contains(e.target)) {
      autocompleteList.innerHTML = '';
      autocompleteList.classList.remove('visible');
    }
  });

  // Event handlers
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchValue = input.value.trim();
    if (searchValue) {
      savePreferences({ lastSearch: searchValue });
      autocompleteList.innerHTML = '';
      autocompleteList.classList.remove('visible');
      onSearch({ type: 'address', value: searchValue });
    }
  });

  locationBtn.addEventListener('click', () => {
    onSearch({ type: 'geolocation' });
  });

  sortSelect.addEventListener('change', (e) => {
    savePreferences({ sortBy: e.target.value });
    onSortChange(e.target.value);
  });

  filterWrapper.addEventListener('change', () => {
    const selectedServices = Array.from(filterWrapper.querySelectorAll('.service-checkbox:checked'))
      .map((cb) => cb.value);
    const openNow = openNowCheckbox.checked;

    savePreferences({
      selectedServices,
      openNow,
    });

    onSearch({ type: 'filter', services: selectedServices, openNow });
  });

  return section;
}

/**
 * Initialize Google Maps (if available)
 * @param {Element} container - Map container element
 * @param {Array} stores - Array of stores to display
 * @param {Object} center - Center coordinates {lat, lng}
 * @param {number} zoomLevel - Map zoom level
 * @returns {Object|null} Map instance or null
 */
function initializeMap(container, stores, center, zoomLevel) {
  // Check if Google Maps is available
  if (typeof google === 'undefined' || !google.maps) {
    container.innerHTML = '<p class="map-placeholder">📍 Map requires Google Maps API key.<br><br>Add <strong>"Google Maps API Key"</strong> in your DA.live block configuration to enable the interactive map.<br><br>The store list and search features work without it!</p>';
    return null;
  }

  try {
    const map = new google.maps.Map(container, {
      center: { lat: center.lat, lng: center.lng },
      zoom: zoomLevel,
      mapTypeControl: false,
      streetViewControl: false,
    });

    // Add user location marker
    // eslint-disable-next-line no-new
    new google.maps.Marker({
      position: { lat: center.lat, lng: center.lng },
      map,
      title: 'Your Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    });

    // Add markers for each store
    stores.forEach((store) => {
      const marker = new google.maps.Marker({
        position: {
          lat: store.address.coordinates.lat,
          lng: store.address.coordinates.lng,
        },
        map,
        title: store.name,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="map-info-window">
            <h4>${store.name}</h4>
            <p>${store.address.street}<br>
            ${store.address.city}, ${store.address.state} ${store.address.zip}</p>
            ${store.distance ? `<p><strong>${store.distance.toFixed(1)} miles away</strong></p>` : ''}
            <a href="https://maps.google.com/?q=${store.address.coordinates.lat},${store.address.coordinates.lng}" 
               target="_blank" 
               rel="noopener noreferrer">
              Get Directions →
            </a>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    });

    return map;
  } catch (error) {
    console.error('Map initialization error:', error);
    container.innerHTML = '<p class="map-error">Unable to load map. Please try again later.</p>';
    return null;
  }
}

/**
 * Create loading spinner overlay (lives in DOM, toggled on/off)
 * @returns {Element} Loading spinner element
 */
function createLoadingSpinner() {
  const spinner = document.createElement('div');
  spinner.classList.add('loading-spinner');
  spinner.innerHTML = '<div class="spinner"></div><p>Loading stores...</p>';
  return spinner;
}

/**
 * Show loading overlay
 * @param {Element} listContainer - The list container
 * @param {Element} spinner - The spinner element
 */
function showLoading(listContainer, spinner) {
  spinner.classList.add('active');
}

/**
 * Hide loading overlay
 * @param {Element} spinner - The spinner element
 */
function hideLoading(spinner) {
  spinner.classList.remove('active');
}

/**
 * Main decorate function for store-locator block
 * @param {Element} block - The store-locator block element
 */
export default async function decorate(block) {
  const config = parseBlockConfig(block);

  // IMPORTANT: Parse stores BEFORE clearing block content!
  let storeDataObj;
  try {
    storeDataObj = await loadStoreData(config, block);
  } catch (error) {
    console.error('Failed to load store data:', error);
    block.innerHTML = '<p class="error">Unable to load store data. Please try again later.</p>';
    return;
  }

  // State management
  const allStores = storeDataObj.stores;
  let filteredStores = [];
  let userLocation = null;
  let mapInstance = null;
  let loadingSpinner; // Declared here, assigned later

  // Get available services from actual store data (for dynamic filters)
  const availableServices = getAvailableServices(allStores);

  // Create UI structure AFTER parsing stores
  const container = document.createElement('div');
  container.classList.add('store-locator-container');

  const listContainer = document.createElement('div');
  listContainer.classList.add('store-list');

  const mapContainer = document.createElement('div');
  mapContainer.classList.add('store-map');

  /**
   * Render stores in the list
   * @param {Array} stores - Stores to render
   */
  function renderStores(stores) {
    // Adobe Commerce Best Practice: Build DOM fragment first
    const fragment = document.createDocumentFragment();

    // Check if user has a preferred store
    const preferredStoreId = localStorage.getItem('preferredStore');
    if (preferredStoreId) {
      // Find the preferred store in all stores (not just filtered results)
      const preferredStore = allStores.find((s) => s.id === preferredStoreId);

      if (preferredStore) {
        // Calculate distance for preferred store if user location is available
        let storeWithDistance = preferredStore;
        if (userLocation) {
          storeWithDistance = {
            ...preferredStore,
            distance: calculateDistance(
              userLocation.lat,
              userLocation.lng,
              preferredStore.address.coordinates.lat,
              preferredStore.address.coordinates.lng,
            ),
          };
        }

        // Render hero card at the top
        const heroCard = renderMyStoreHeroCard(storeWithDistance, userLocation);
        fragment.appendChild(heroCard);
      }
    }

    if (stores.length === 0) {
      const noResults = document.createElement('p');
      noResults.classList.add('no-results');
      noResults.textContent = 'No stores found matching your criteria. '
        + 'Please try a different search or remove some filters.';
      fragment.appendChild(noResults);
    } else {
      stores.forEach((store) => {
        const card = renderStoreCard(store, config.showDistance);
        fragment.appendChild(card);
      });
    }

    // Clear only non-spinner children to preserve overlay
    Array.from(listContainer.children).forEach((child) => {
      if (!child.classList.contains('loading-spinner')) {
        child.remove();
      }
    });

    // Insert new content before spinner (spinner stays on top as overlay)
    listContainer.insertBefore(fragment, loadingSpinner);
  }

  // Get saved preferences
  const prefs = loadPreferences();
  let currentSort = prefs.sortBy || 'distance';

  /**
   * Apply filters and sorting to stores
   * @param {Array} stores - Stores to process
   * @param {Array} services - Selected services
   * @param {boolean} openNow - Open now filter
   * @returns {Array} Processed stores
   */
  function applyFiltersAndSort(stores, services = [], openNow = false) {
    let processed = filterStores(stores, services, openNow);
    processed = sortStores(processed, currentSort, userLocation);
    return processed.slice(0, config.maxResults);
  }

  /**
   * Handle sort change
   * @param {string} sortBy - New sort criteria
   */
  function handleSortChange(sortBy) {
    currentSort = sortBy;
    const services = Array.from(document.querySelectorAll('.service-checkbox:checked'))
      .map((cb) => cb.value);
    const openNow = document.querySelector('.open-now-checkbox')?.checked || false;

    filteredStores = applyFiltersAndSort(allStores, services, openNow);
    renderStores(filteredStores);

    // Update map if needed
    if (mapInstance && userLocation) {
      const fallback = { lat: 45.5231, lng: -122.6765 };
      const mapCenter = userLocation || filteredStores[0]?.address.coordinates || fallback;
      initializeMap(mapContainer, filteredStores, mapCenter, config.zoomLevel);
    }
  }

  /**
   * Handle search actions
   * @param {Object} searchData - Search data object
   */
  async function handleSearch(searchData) {
    if (searchData.type === 'geolocation') {
      // Show loading overlay without touching existing content
      showLoading(listContainer, loadingSpinner);

      try {
        userLocation = await getUserLocation();
        savePreferences({ lastLocation: userLocation });

        const services = searchData.services || [];
        const openNow = searchData.openNow || false;
        filteredStores = applyFiltersAndSort(allStores, services, openNow);
        renderStores(filteredStores);

        // Update map
        if (mapInstance) {
          initializeMap(mapContainer, filteredStores, userLocation, config.zoomLevel);
        }
      } catch (error) {
        const errorMsg = document.createElement('p');
        errorMsg.classList.add('error');
        errorMsg.textContent = 'Unable to access your location. Please enter an address manually.';
        // Build fragment to avoid layout shift
        const fragment = document.createDocumentFragment();
        fragment.appendChild(errorMsg);
        // Clear all children except spinner
        Array.from(listContainer.children).forEach((child) => {
          if (!child.classList.contains('loading-spinner')) {
            child.remove();
          }
        });
        listContainer.insertBefore(fragment, loadingSpinner);
      } finally {
        hideLoading(loadingSpinner);
      }
    } else if (searchData.type === 'address') {
      // Show loading overlay without touching existing content
      showLoading(listContainer, loadingSpinner);

      try {
        userLocation = await geocodeAddress(searchData.value);
        savePreferences({ lastLocation: userLocation });

        const services = searchData.services || [];
        const openNow = searchData.openNow || false;
        filteredStores = applyFiltersAndSort(allStores, services, openNow);
        renderStores(filteredStores);

        // Update map
        if (mapInstance) {
          initializeMap(mapContainer, filteredStores, userLocation, config.zoomLevel);
        }
      } catch (error) {
        console.error('Address search error:', error);
        // Show error message
        const errorMsg = document.createElement('p');
        errorMsg.classList.add('error');
        errorMsg.textContent = `Unable to geocode "${searchData.value}". Showing all stores (${allStores.length}):`;
        // Build fragment to avoid layout shift
        const fragment = document.createDocumentFragment();
        fragment.appendChild(errorMsg);
        // Clear all children except spinner
        Array.from(listContainer.children).forEach((child) => {
          if (!child.classList.contains('loading-spinner')) {
            child.remove();
          }
        });
        listContainer.insertBefore(fragment, loadingSpinner);

        // Still show stores below error
        filteredStores = allStores.slice(0, config.maxResults);
        renderStores(filteredStores);
      } finally {
        hideLoading(loadingSpinner);
      }
    } else if (searchData.type === 'filter') {
      const filtered = filterStores(allStores, searchData.services, searchData.openNow);

      if (userLocation) {
        filteredStores = sortStores(filtered, currentSort, userLocation);
      } else {
        filteredStores = sortStores(filtered, currentSort);
      }

      filteredStores = filteredStores.slice(0, config.maxResults);
      renderStores(filteredStores);

      // Update map if needed
      if (mapInstance && userLocation) {
        initializeMap(mapContainer, filteredStores, userLocation, config.zoomLevel);
      }
    }
  }

  // Search header (with dynamic services from actual data)
  const searchSection = createSearchSection(
    config,
    availableServices,
    handleSearch,
    handleSortChange,
  );
  container.appendChild(searchSection);

  // Main content area
  const contentArea = document.createElement('div');
  contentArea.classList.add('store-locator-content');
  contentArea.setAttribute('data-view', config.defaultView);

  contentArea.appendChild(listContainer);
  contentArea.appendChild(mapContainer);
  container.appendChild(contentArea);

  // Replace block content
  block.innerHTML = '';
  block.appendChild(container);

  // Create persistent loading spinner overlay
  loadingSpinner = createLoadingSpinner();
  listContainer.appendChild(loadingSpinner);

  // Load and initialize stores
  try {
    // Show loading overlay
    showLoading(listContainer, loadingSpinner);

    // Stores already loaded at the top of decorate()

    // Try to get user location if auto-detect is enabled OR if we have saved location
    if (config.autoDetect || prefs.lastLocation) {
      try {
        // Use saved location if available, otherwise request new
        if (prefs.lastLocation && prefs.lastLocation.lat && prefs.lastLocation.lng) {
          userLocation = prefs.lastLocation;
          console.log('Using saved location:', userLocation);
        } else {
          console.log('🔍 Auto-detecting your location...');
          userLocation = await getUserLocation();
          savePreferences({ lastLocation: userLocation });
          console.log('✅ Location detected:', userLocation);
        }
      } catch (err) {
        // Silently fall back - user may have denied permission
        console.log('Geolocation not available, using default view');
      }
    }

    // Apply saved filters
    const savedServices = prefs.selectedServices || [];
    const savedOpenNow = prefs.openNow || false;

    // Apply filters and sort
    filteredStores = applyFiltersAndSort(allStores, savedServices, savedOpenNow);

    // Render store list
    renderStores(filteredStores);

    // Hide loading overlay
    hideLoading(loadingSpinner);

    // Load Google Maps dynamically if API key is provided
    if (config.googleMapsApiKey && config.mapProvider === 'google') {
      try {
        await loadGoogleMaps(config.googleMapsApiKey);
        const fallback = { lat: 45.5231, lng: -122.6765 };
        const mapCenter = userLocation
          || filteredStores[0]?.address.coordinates || fallback;
        mapInstance = initializeMap(mapContainer, filteredStores, mapCenter, config.zoomLevel);
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
        const errorMsg = 'Unable to load map. Please check your API key and try again.';
        mapContainer.innerHTML = `<p class="map-placeholder">${errorMsg}</p>`;
      }
    } else {
      // No API key provided - show helpful message
      const fallback = { lat: 45.5231, lng: -122.6765 };
      const mapCenter = userLocation || filteredStores[0]?.address.coordinates || fallback;
      mapInstance = initializeMap(mapContainer, filteredStores, mapCenter, config.zoomLevel);
    }
  } catch (error) {
    console.error('Store locator error:', error);
    const errorMsg = document.createElement('p');
    errorMsg.classList.add('error');
    errorMsg.textContent = 'Unable to load stores. Please try again later.';
    // Clear non-spinner children
    Array.from(listContainer.children).forEach((child) => {
      if (!child.classList.contains('loading-spinner')) {
        child.remove();
      }
    });
    listContainer.insertBefore(errorMsg, loadingSpinner);
    hideLoading(loadingSpinner);
  }
}
