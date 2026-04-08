/*
 * Fragment Block
 * Include content on a page as a fragment.
 * https://www.aem.live/developer/block-collection/fragment
 */

import { getRootPath } from '@dropins/tools/lib/aem/configs.js';
import { decorateMain } from '../../scripts/scripts.js';
import {
  loadSections,
} from '../../scripts/aem.js';

const BLOCKED_TAGS = [
  'script',
  'iframe',
  'object',
  'embed',
  'template',
  'meta',
  'base',
];

const URL_ATTRIBUTES = ['href', 'src', 'xlink:href', 'formaction', 'poster'];

function sanitizeUrl(value) {
  const trimmed = value?.trim();
  if (!trimmed) return '';

  if (
    trimmed.startsWith('#')
    || trimmed.startsWith('/')
    || trimmed.startsWith('./')
    || trimmed.startsWith('../')
  ) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed, window.location.href);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol) ? trimmed : '';
  } catch {
    return '';
  }
}

function sanitizeSrcset(value) {
  return value
    .split(',')
    .map((candidate) => {
      const trimmed = candidate.trim();
      if (!trimmed) return '';

      const [url, ...rest] = trimmed.split(/\s+/);
      const safeUrl = sanitizeUrl(url);
      return safeUrl ? [safeUrl, ...rest].join(' ') : '';
    })
    .filter(Boolean)
    .join(', ');
}

function sanitizeFragmentMarkup(markup) {
  const doc = new DOMParser().parseFromString(markup, 'text/html');
  let removedCount = 0;

  doc.querySelectorAll(BLOCKED_TAGS.join(',')).forEach((node) => {
    node.remove();
    removedCount += 1;
  });

  doc.body.querySelectorAll('*').forEach((element) => {
    [...element.attributes].forEach((attribute) => {
      const { name, value } = attribute;
      const lowerName = name.toLowerCase();

      if (lowerName.startsWith('on')) {
        element.removeAttribute(name);
        removedCount += 1;
        return;
      }

      if (lowerName === 'srcset') {
        const safeSrcset = sanitizeSrcset(value);
        if (safeSrcset) {
          element.setAttribute(name, safeSrcset);
        } else {
          element.removeAttribute(name);
          removedCount += 1;
        }
        return;
      }

      if (URL_ATTRIBUTES.includes(lowerName)) {
        const safeUrl = sanitizeUrl(value);
        if (safeUrl) {
          element.setAttribute(name, safeUrl);
        } else {
          element.removeAttribute(name);
          removedCount += 1;
        }
      }
    });

    if (element.getAttribute('target') === '_blank') {
      element.setAttribute('rel', 'noopener noreferrer');
    }
  });

  if (removedCount > 0) {
    console.warn(`fragment: removed ${removedCount} unsafe HTML value(s) while loading fragment.`);
  }

  return doc.body;
}

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {Promise<HTMLElement>} The root element of the fragment
 */
export async function loadFragment(path) {
  if (path && path.startsWith('/') && !path.startsWith('//')) {
    const root = getRootPath().replace(/\/$/, '');
    const url = `${root}${path}.plain.html`;
    const resp = await fetch(url);
    if (resp.ok) {
      const main = document.createElement('main');
      const sanitizedBody = sanitizeFragmentMarkup(await resp.text());
      main.append(...sanitizedBody.childNodes);

      // reset base path for media to fragment base
      const resetAttributeBase = (tag, attr) => {
        main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
          elem[attr] = new URL(elem.getAttribute(attr), new URL(path, window.location)).href;
        });
      };
      resetAttributeBase('img', 'src');
      resetAttributeBase('source', 'srcset');

      decorateMain(main);
      await loadSections(main);
      return main;
    }
  }
  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (fragment) block.replaceChildren(...fragment.childNodes);
}
