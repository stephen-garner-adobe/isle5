import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Parse block configuration from DA.live
 * @param {Element} block - The block element from DA.live
 * @returns {Object} Parsed configuration object with maxSlides and autoplay settings
 */
function parseBlockConfig(block) {
  // Configuration could come from data attributes or metadata
  // For now, we'll extract from the model defaults and allow override via data attributes
  const maxSlides = parseInt(block.dataset.slides || '5', 10);
  const autoplay = block.dataset.autoplay !== 'false'; // Default true unless explicitly false

  return {
    maxSlides: Math.max(1, Math.min(maxSlides, 5)), // Clamp between 1-5
    autoplay,
  };
}

/**
 * Updates the active slide and indicators
 * @param {Element} block - The slider block element
 * @param {number} slideIndex - Index of the slide to activate
 */
function updateActiveSlide(block, slideIndex) {
  const slides = block.querySelectorAll('.slider-accordion-slide');
  const indicators = block.querySelectorAll('.slider-accordion-indicator');

  slides.forEach((slide, idx) => {
    if (idx === slideIndex) {
      slide.classList.add('active');
      slide.setAttribute('aria-hidden', 'false');
    } else {
      slide.classList.remove('active');
      slide.setAttribute('aria-hidden', 'true');
    }
  });

  indicators.forEach((indicator, idx) => {
    if (idx === slideIndex) {
      indicator.classList.add('active');
      indicator.querySelector('button').setAttribute('disabled', 'true');
    } else {
      indicator.classList.remove('active');
      indicator.querySelector('button').removeAttribute('disabled');
    }
  });

  block.dataset.activeSlide = slideIndex;
}

/**
 * Shows a specific slide by index with wrapping
 * @param {Element} block - The slider block element
 * @param {number} slideIndex - Index of the slide to show
 */
function showSlide(block, slideIndex) {
  const slides = block.querySelectorAll('.slider-accordion-slide');
  const totalSlides = slides.length;

  let realIndex = slideIndex;
  if (slideIndex < 0) realIndex = totalSlides - 1;
  if (slideIndex >= totalSlides) realIndex = 0;

  updateActiveSlide(block, realIndex);
}

/**
 * Creates navigation controls (prev/next buttons and indicators)
 * @param {Element} block - The slider block element
 * @param {number} totalSlides - Total number of slides
 * @returns {Object} Object containing the navigation element
 */
function createNavigation(block, totalSlides) {
  const nav = document.createElement('div');
  nav.classList.add('slider-accordion-navigation');

  // Previous button
  const prevBtn = document.createElement('button');
  prevBtn.classList.add('slider-accordion-nav-btn', 'slider-accordion-prev');
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  `;
  prevBtn.addEventListener('click', () => {
    const currentSlide = parseInt(block.dataset.activeSlide || '0', 10);
    showSlide(block, currentSlide - 1);
  });

  // Indicators container
  const indicatorsContainer = document.createElement('div');
  indicatorsContainer.classList.add('slider-accordion-indicators');

  for (let i = 0; i < totalSlides; i += 1) {
    const indicator = document.createElement('div');
    indicator.classList.add('slider-accordion-indicator');
    indicator.dataset.slideIndex = i;

    const btn = document.createElement('button');
    btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
    btn.addEventListener('click', () => showSlide(block, i));

    indicator.appendChild(btn);
    indicatorsContainer.appendChild(indicator);
  }

  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.classList.add('slider-accordion-nav-btn', 'slider-accordion-next');
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  `;
  nextBtn.addEventListener('click', () => {
    const currentSlide = parseInt(block.dataset.activeSlide || '0', 10);
    showSlide(block, currentSlide + 1);
  });

  nav.appendChild(prevBtn);
  nav.appendChild(indicatorsContainer);
  nav.appendChild(nextBtn);

  return { nav };
}

/**
 * Starts automatic slide progression with hover pause
 * @param {Element} block - The slider block element
 * @param {number} interval - Time between slides in milliseconds (default: 5000)
 */
function startAutoplay(block, interval = 5000) {
  let autoplayInterval = setInterval(() => {
    const currentSlide = parseInt(block.dataset.activeSlide || '0', 10);
    showSlide(block, currentSlide + 1);
  }, interval);

  // Pause on hover
  block.addEventListener('mouseenter', () => {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  });

  // Resume on mouse leave
  block.addEventListener('mouseleave', () => {
    if (!autoplayInterval) {
      autoplayInterval = setInterval(() => {
        const currentSlide = parseInt(block.dataset.activeSlide || '0', 10);
        showSlide(block, currentSlide + 1);
      }, interval);
    }
  });
}

/**
 * Decorates the slider-accordion block
 * @param {Element} block - The slider-accordion block element
 */
export default function decorate(block) {
  // Parse configuration from DA.live
  const config = parseBlockConfig(block);

  const rows = [...block.children];
  const slides = rows.slice(0, config.maxSlides);

  const slidesContainer = document.createElement('div');
  slidesContainer.classList.add('slider-accordion-slides');

  slides.forEach((row, index) => {
    const columns = [...row.children];

    const slide = document.createElement('div');
    slide.classList.add('slider-accordion-slide');
    slide.dataset.slideIndex = index;

    // Column 0: Background image
    const bgImage = columns[0]?.querySelector('img');
    if (bgImage) {
      const optimizedPic = createOptimizedPicture(bgImage.src, bgImage.alt, false, [{ width: '1920' }]);
      const bgDiv = document.createElement('div');
      bgDiv.classList.add('slider-accordion-background');
      bgDiv.appendChild(optimizedPic);
      slide.appendChild(bgDiv);
    }

    // Content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('slider-accordion-content');

    // Column 1: Title
    if (columns[1]) {
      const titleDiv = document.createElement('div');
      titleDiv.classList.add('slider-accordion-title');
      while (columns[1].firstElementChild) {
        titleDiv.appendChild(columns[1].firstElementChild);
      }
      contentWrapper.appendChild(titleDiv);
    }

    // Column 2: Description
    if (columns[2]) {
      const descDiv = document.createElement('div');
      descDiv.classList.add('slider-accordion-description');
      while (columns[2].firstElementChild) {
        descDiv.appendChild(columns[2].firstElementChild);
      }
      contentWrapper.appendChild(descDiv);
    }

    slide.appendChild(contentWrapper);

    // Column 3: CTA Button (positioned independently, block-specific styling)
    if (columns[3] && columns[3].textContent.trim()) {
      const ctaDiv = document.createElement('div');
      ctaDiv.classList.add('slider-accordion-cta');

      // Check if there's already a link, otherwise wrap the content
      const existingLink = columns[3].querySelector('a');
      if (existingLink) {
        ctaDiv.appendChild(existingLink);
      } else {
        // If no link exists, move all content as-is
        while (columns[3].firstElementChild) {
          ctaDiv.appendChild(columns[3].firstElementChild);
        }
      }

      slide.appendChild(ctaDiv); // Append to slide, not contentWrapper
    }
    slidesContainer.appendChild(slide);
  });

  block.innerHTML = '';
  block.appendChild(slidesContainer);

  // Add navigation if more than 1 slide
  if (slides.length > 1) {
    const { nav } = createNavigation(block, slides.length);
    block.appendChild(nav);

    // Initialize
    showSlide(block, 0);

    // Start autoplay if enabled in configuration
    if (config.autoplay) {
      startAutoplay(block);
    }
  } else if (slides.length === 1) {
    showSlide(block, 0);
  }
}
