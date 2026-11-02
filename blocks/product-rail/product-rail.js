import SearchResults from '@dropins/storefront-product-discovery/containers/SearchResults.js';
import { render as provider } from '@dropins/storefront-product-discovery/render.js';
import { search } from '@dropins/storefront-product-discovery/api.js';
import { readBlockConfig } from '../../scripts/aem.js';
import { getProductLink } from '../../scripts/commerce.js';
import { getSafeURL } from '../../scripts/dom-safety.js';
import { normalizeRailConfig } from './config.js';
import '../../scripts/initializers/search.js';

export default async function decorate(block) {
  if (block.dataset.productRailStatus) return;
  const config = normalizeRailConfig(readBlockConfig(block));
  const collectionURL = getSafeURL(config.collectionlink, document.baseURI);
  if (!config.title || !collectionURL || !config.collectionlabel) {
    console.warn('product-rail: title and a labelled safe collection link are required.');
    return;
  }

  const header = document.createElement('div');
  header.className = 'product-rail-header';
  const title = document.createElement('h2');
  title.textContent = config.title;
  const collectionLink = document.createElement('a');
  collectionLink.href = collectionURL;
  collectionLink.textContent = config.collectionlabel;
  header.append(title, collectionLink);

  const mount = document.createElement('div');
  mount.className = 'product-rail-results';
  const scope = `product-rail-${crypto.randomUUID()}`;
  const pageSize = config.pagesize;
  const filter = [{ attribute: 'visibility', in: ['Search', 'Catalog, Search'] }];
  if (config.urlpath) filter.push({ attribute: 'categoryPath', eq: config.urlpath });

  block.dataset.productRailStatus = 'loading';
  block.setAttribute('aria-busy', 'true');
  block.replaceChildren(header, mount);
  let instance;
  let expired = false;
  let timer;

  const load = async () => {
    const rendered = await provider.render(SearchResults, {
      scope,
      skeletonCount: pageSize,
      routeProduct: (product) => getProductLink(product.urlKey, product.sku),
      slots: {
        ProductActions: (ctx) => {
          const link = document.createElement('a');
          link.className = 'product-rail-product-link';
          link.href = getProductLink(ctx.product.urlKey, ctx.product.sku);
          link.setAttribute('aria-label', ctx.product.name || ctx.product.sku);
          const arrow = document.createElement('span');
          arrow.textContent = '→';
          arrow.setAttribute('aria-hidden', 'true');
          link.append(arrow);
          ctx.replaceWith(link);
        },
      },
    })(mount);
    if (expired) {
      rendered.remove();
      return;
    }
    instance = rendered;
    await search({
      phrase: '', pageSize, currentPage: 1, filter,
    }, { scope });
  };

  try {
    await Promise.race([
      load(),
      new Promise((resolve, reject) => {
        timer = window.setTimeout(() => reject(new Error('Product rail timeout')), 12000);
      }),
    ]);
    block.dataset.productRailStatus = 'loaded';
  } catch {
    expired = true;
    instance?.remove();
    mount.remove();
    block.dataset.productRailStatus = 'unavailable';
    console.warn('product-rail: catalogue unavailable; retaining the collection link.');
  } finally {
    window.clearTimeout(timer);
    block.removeAttribute('aria-busy');
  }
}
