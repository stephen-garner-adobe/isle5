import { createOptimizedPicture } from '../../scripts/aem.js';
import { getSafeURL, sanitizeLinks } from '../../scripts/dom-safety.js';

function isLcpCandidate(block) {
  const section = block.closest('.section');
  return section && section.parentElement?.firstElementChild === section;
}

export default function decorate(block) {
  if (block.dataset.heroDecorated === 'true') return;

  const picture = block.querySelector('picture');
  const img = picture?.querySelector('img');
  sanitizeLinks(block);
  const src = getSafeURL(img?.getAttribute('src'), document.baseURI);
  if (!src) {
    if (picture) picture.remove();
    console.warn('hero: No valid image found in authored content.');
    return;
  }

  const optimizedPicture = createOptimizedPicture(
    src,
    img.alt || '',
    document.body.classList.contains('isle5') ? img.loading === 'eager' : isLcpCandidate(block),
    [
      { media: '(min-width: 900px)', width: '2000' },
      { width: '750' },
    ],
  );

  picture.replaceWith(optimizedPicture);
  block.dataset.heroDecorated = 'true';
}
