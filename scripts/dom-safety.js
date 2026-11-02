/** Resolve an authored URL only when its scheme is supported by the field. */
export function getSafeURL(value, base, protocols = ['http:', 'https:']) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim(), base);
    return protocols.includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

/** Keep rich authored links semantic while disabling unsupported destinations. */
export function sanitizeLinks(root) {
  root.querySelectorAll('a[href]').forEach((link) => {
    const href = getSafeURL(link.getAttribute('href'), document.baseURI, ['http:', 'https:', 'mailto:', 'tel:']);
    if (href) {
      link.href = href;
      if (link.target === '_blank') link.rel = 'noopener noreferrer';
    } else {
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      link.tabIndex = -1;
    }
  });
}
