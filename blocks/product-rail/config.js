/** Bound product discovery work independently of authored numeric variation. */
export function normalizePageSize(value) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 ? Math.min(number, 12) : 4;
}

/** Support both DA property names and human-readable table labels. */
export function normalizeRailConfig(config) {
  return {
    title: config.title,
    collectionlink: config['collection-link'] ?? config.collectionlink,
    collectionlabel: config['collection-label'] ?? config.collectionlabel,
    urlpath: config['url-path'] ?? config.urlpath,
    pagesize: normalizePageSize(config['page-size'] ?? config.pagesize),
  };
}
