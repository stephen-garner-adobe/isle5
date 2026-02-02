import { getProductLink, rootLink, fetchPlaceholders } from '../../scripts/commerce.js';

/**
 * Parse block configuration from DA.live
 */
function parseBlockConfig(block) {
  const rows = [...block.children];

  // Get placeholder (always first row)
  const placeholder = rows[0]?.textContent.trim() || 'Search products...';

  // Get position - handle both old (4-row) and new (3-row) configurations
  // Old config: [placeholder, width, position, resultCount]
  // New config: [placeholder, position, resultCount]
  let position = 'center';
  let resultCount = 8;

  // Check if row[1] is a valid position value (old config had width here)
  const row1Value = rows[1]?.textContent.trim();
  const validPositions = ['left', 'center', 'right'];

  if (validPositions.includes(row1Value)) {
    // New config: row[1] is position
    position = row1Value;
    resultCount = parseInt(rows[2]?.textContent.trim() || '8', 10);
  } else {
    // Old config: row[1] is width, row[2] is position
    position = rows[2]?.textContent.trim() || 'center';
    // Validate position is valid
    if (!validPositions.includes(position)) {
      position = 'center';
    }
    resultCount = parseInt(rows[3]?.textContent.trim() || '8', 10);
  }

  return {
    placeholder,
    position,
    resultCount,
  };
}

/**
 * Decorates the search bar block
 * @param {Element} block The search bar block element
 */
export default async function decorate(block) {
  const config = parseBlockConfig(block);

  // Create search bar container
  const searchBarContainer = document.createElement('div');
  // Ensure position is valid (safety check)
  const validPosition = ['left', 'center', 'right'].includes(config.position)
    ? config.position
    : 'center';
  searchBarContainer.classList.add('search-bar-container', `search-bar--${validPosition}`);
  searchBarContainer.setAttribute('aria-expanded', 'false');

  // Create form with search icon button
  const form = document.createElement('form');
  form.classList.add('search-bar-form');
  form.setAttribute('role', 'search');
  form.setAttribute('aria-controls', 'search-results');

  // Add search icon button
  const searchIconButton = document.createElement('button');
  searchIconButton.type = 'submit';
  searchIconButton.classList.add('search-bar-icon');
  searchIconButton.setAttribute('aria-label', 'Search');
  searchIconButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  const inputWrapper = document.createElement('div');
  inputWrapper.classList.add('search-bar-input-wrapper');

  // Create results container
  const resultsDiv = document.createElement('div');
  resultsDiv.classList.add('search-bar-results');
  resultsDiv.setAttribute('id', 'search-results');
  resultsDiv.setAttribute('role', 'region');
  resultsDiv.setAttribute('aria-label', 'Search results');
  resultsDiv.setAttribute('aria-hidden', 'true');
  resultsDiv.style.display = 'none';

  // Create live region for screen reader announcements
  const liveRegion = document.createElement('div');
  liveRegion.classList.add('search-bar-sr-only');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');

  searchBarContainer.append(form, resultsDiv, liveRegion);

  // Initialize search drop-in (reuse existing initializer)
  await import('../../scripts/initializers/search.js');

  // Load search components
  const [
    { search },
    { render },
    { SearchResults },
    { provider: UI, Input, Button },
  ] = await Promise.all([
    import('@dropins/storefront-product-discovery/api.js'),
    import('@dropins/storefront-product-discovery/render.js'),
    import('@dropins/storefront-product-discovery/containers/SearchResults.js'),
    import('@dropins/tools/components.js'),
  ]);

  // Fetch labels
  const labels = await fetchPlaceholders();

  // Render SearchResults component
  render.render(SearchResults, {
    skeletonCount: config.resultCount,
    scope: 'search-bar-block', // Unique scope - won't conflict with header search
    routeProduct: ({ urlKey, sku }) => getProductLink(urlKey, sku),
    onSearchResult: (results) => {
      const hasResults = results.length > 0;
      resultsDiv.style.display = hasResults ? 'block' : 'none';

      // Update ARIA states
      resultsDiv.setAttribute('aria-hidden', hasResults ? 'false' : 'true');
      searchBarContainer.setAttribute('aria-expanded', hasResults ? 'true' : 'false');

      // Announce results to screen readers
      if (hasResults) {
        liveRegion.textContent = `${results.length} ${results.length === 1 ? 'result' : 'results'} found`;
      } else {
        liveRegion.textContent = '';
      }
    },
    slots: {
      Footer: async (ctx) => {
        // View all results button
        const viewAllResultsWrapper = document.createElement('div');
        viewAllResultsWrapper.classList.add('search-bar-view-all');

        const viewAllResultsButton = await UI.render(Button, {
          children: labels.Global?.SearchViewAll || 'View All Results',
          variant: 'secondary',
          href: rootLink('/search'),
        })(viewAllResultsWrapper);

        ctx.appendChild(viewAllResultsWrapper);

        ctx.onChange((next) => {
          viewAllResultsButton?.setProps((prev) => ({
            ...prev,
            href: `${rootLink('/search')}?q=${encodeURIComponent(next.variables?.phrase || '')}`,
          }));
        });
      },
    },
  })(resultsDiv);

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = e.target.search.value;
    if (query.length) {
      window.location.href = `${rootLink('/search')}?q=${encodeURIComponent(query)}`;
    }
  });

  // Track the last search phrase for re-triggering
  let lastSearchPhrase = ''; // eslint-disable-line no-unused-vars

  // Function to trigger search
  const performSearch = (phrase) => {
    if (!phrase) {
      search(null, { scope: 'search-bar-block' });
      lastSearchPhrase = '';
      return;
    }

    if (phrase.length < 3) {
      return;
    }

    lastSearchPhrase = phrase;
    search({
      phrase,
      pageSize: config.resultCount,
      filter: [
        { attribute: 'visibility', in: ['Search', 'Catalog, Search'] },
      ],
    }, { scope: 'search-bar-block' });
  };

  // Render search input into wrapper
  UI.render(Input, {
    name: 'search',
    placeholder: config.placeholder,
    onValue: (phrase) => {
      performSearch(phrase);
    },
  })(inputWrapper);

  // Append input wrapper and search icon to form
  form.appendChild(inputWrapper);
  form.appendChild(searchIconButton);

  // Replace block content
  block.replaceChildren(searchBarContainer);

  // Use event delegation on the form for focus events
  form.addEventListener('focusin', (e) => {
    if (e.target.tagName === 'INPUT') {
      const currentValue = e.target.value.trim();
      // If there's a valid search term (3+ chars) and results are hidden, re-trigger search
      if (currentValue && currentValue.length >= 3 && resultsDiv.style.display === 'none') {
        performSearch(currentValue);
        // Note: ARIA states will be updated by onSearchResult callback
      }
    }
  });

  // Close results when clicking outside the search bar
  const handleClickOutside = (e) => {
    // Check if click is outside the search bar container
    if (!searchBarContainer.contains(e.target) && resultsDiv.style.display === 'block') {
      resultsDiv.style.display = 'none';

      // Update ARIA states
      resultsDiv.setAttribute('aria-hidden', 'true');
      searchBarContainer.setAttribute('aria-expanded', 'false');
      liveRegion.textContent = 'Search results closed';

      // Force blur on any input inside the form
      setTimeout(() => {
        const input = form.querySelector('input');
        if (input && document.activeElement === input) {
          input.blur();
        }
        // Clear announcement after a brief delay
        setTimeout(() => {
          liveRegion.textContent = '';
        }, 1000);
      }, 0);
    }
  };

  document.addEventListener('click', handleClickOutside);

  // Close results when pressing ESC key
  const handleEscKey = (e) => {
    if (e.key === 'Escape' && resultsDiv.style.display === 'block') {
      resultsDiv.style.display = 'none';

      // Update ARIA states
      resultsDiv.setAttribute('aria-hidden', 'true');
      searchBarContainer.setAttribute('aria-expanded', 'false');
      liveRegion.textContent = 'Search results closed';

      // Blur the input field
      const input = form.querySelector('input');
      if (input) {
        input.blur();
      }

      // Clear announcement after a brief delay
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  };

  document.addEventListener('keydown', handleEscKey);
}
