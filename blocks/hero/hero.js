import { createOptimizedPicture } from '../../scripts/aem.js';

function isLcpCandidate(block) {
  const section = block.closest('.section');
  return section && section.parentElement?.firstElementChild === section;
}

export default function decorate(block) {
  if (block.dataset.heroDecorated === 'true') return;
  block.dataset.heroDecorated = 'true';

  const picture = block.querySelector('picture');
  const img = picture?.querySelector('img');
  if (!img?.src) {
    console.warn('hero: No valid image found in authored content.');
    return;
  }

  const optimizedPicture = createOptimizedPicture(
    img.src,
    img.alt || '',
    isLcpCandidate(block),
    [
      { media: '(min-width: 900px)', width: '2000' },
      { width: '750' },
    ],
  );

  picture.replaceWith(optimizedPicture);
}
