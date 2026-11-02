import { createOptimizedPicture } from '../../scripts/aem.js';
import { getSafeURL, sanitizeLinks } from '../../scripts/dom-safety.js';

export default function decorate(block) {
  if (block.dataset.cardsDecorated === 'true') return;
  /* Preserve rich card content while adding a semantic list. */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  sanitizeLinks(ul);
  ul.querySelectorAll('picture > img').forEach((img) => {
    const src = getSafeURL(img.getAttribute('src'), document.baseURI);
    if (src) img.closest('picture').replaceWith(createOptimizedPicture(src, img.alt, false, [{ width: '750' }]));
    else img.closest('picture').remove();
  });
  block.replaceChildren(ul);
  block.dataset.cardsDecorated = 'true';
}
