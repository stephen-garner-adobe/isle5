import { createOptimizedPicture } from '../../scripts/aem.js';

const DEFAULTS = {
  pagesize: 12,
  sort: 'newest',
  showdescription: true,
};

function warnInvalid(key, rawValue, fallback) {
  if (!rawValue || !rawValue.toString().trim()) return;
  // eslint-disable-next-line no-console
  console.warn(`blog-list: invalid ${key} "${rawValue}". Using "${fallback}".`);
}

function getConfigValue(blockValue, sectionData, keys, fallback) {
  if (typeof blockValue === 'string' && blockValue.trim()) return blockValue;
  for (let i = 0; i < keys.length; i += 1) {
    const value = sectionData?.[keys[i]];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return fallback;
}

function normalizeToken(key, value, allowed, fallback) {
  const normalized = (value || '').toString().trim().toLowerCase();
  if (!normalized) return fallback;
  if (allowed.includes(normalized)) return normalized;
  warnInvalid(key, value, fallback);
  return fallback;
}

function normalizeBoolean(key, value, fallback) {
  const normalized = (value || '').toString().trim().toLowerCase();
  if (!normalized) return fallback;
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  warnInvalid(key, value, fallback ? 'true' : 'false');
  return fallback;
}

function normalizePageSize(value, fallback = 12) {
  if (value === null || value === undefined || value === '') return fallback;
  const num = Number.parseInt(value, 10);
  if (Number.isNaN(num) || num < 1 || num > 48) {
    warnInvalid('bloglist-pagesize', value, `${fallback}`);
    return fallback;
  }
  return num;
}

function readConfig(block) {
  const sectionData = block.closest('.section')?.dataset || {};

  return {
    pagesize: normalizePageSize(
      getConfigValue(
        block.dataset.bloglistPagesize,
        sectionData,
        ['bloglistPagesize', 'dataBloglistPagesize'],
        `${DEFAULTS.pagesize}`,
      ),
      DEFAULTS.pagesize,
    ),
    sort: normalizeToken(
      'bloglist-sort',
      getConfigValue(
        block.dataset.bloglistSort,
        sectionData,
        ['bloglistSort', 'dataBloglistSort'],
        DEFAULTS.sort,
      ),
      ['newest', 'oldest'],
      DEFAULTS.sort,
    ),
    showdescription: normalizeBoolean(
      'bloglist-showdescription',
      getConfigValue(
        block.dataset.bloglistShowdescription,
        sectionData,
        ['bloglistShowdescription', 'dataBloglistShowdescription'],
        DEFAULTS.showdescription ? 'true' : 'false',
      ),
      DEFAULTS.showdescription,
    ),
  };
}

function normalizePath(rawPath) {
  const raw = (rawPath || '').toString().trim();
  if (!raw) return '';

  if (raw.startsWith('/')) {
    const withoutQuery = raw.split(/[?#]/)[0];
    const withoutTrailingSlash = (
      withoutQuery.length > 1 && withoutQuery.endsWith('/')
        ? withoutQuery.slice(0, -1)
        : withoutQuery
    );
    return withoutTrailingSlash.endsWith('.html')
      ? withoutTrailingSlash.slice(0, -5)
      : withoutTrailingSlash;
  }

  try {
    const parsed = new URL(raw, window.location.origin);
    if (!['http:', 'https:'].includes(parsed.protocol)) return '';
    return normalizePath(parsed.pathname);
  } catch {
    return '';
  }
}

function resolveEntryPath(entry) {
  const candidates = [
    entry.path,
    entry.url,
    entry.href,
    entry.permalink,
    entry.slug,
  ];

  for (let i = 0; i < candidates.length; i += 1) {
    const path = normalizePath(candidates[i]);
    if (path) return path;
  }

  return '';
}

function normalizeIndexData(json) {
  if (!json) return [];
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json)) return json;
  return [];
}

function isBlogPostPath(path) {
  const segments = path
    .toLowerCase()
    .split('/')
    .filter(Boolean);

  const blogIndex = segments.lastIndexOf('blog');
  if (blogIndex < 0) return false;

  const hasPostSegment = blogIndex < segments.length - 1;
  if (!hasPostSegment) return false;

  if (segments[segments.length - 1] === 'index') return false;
  return true;
}

function parseDate(value) {
  const raw = (value || '').toString().trim();
  if (!raw) return 0;
  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatDate(value) {
  const ts = parseDate(value);
  if (!ts) return '';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(ts));
}

function toTitleFromPath(path) {
  const raw = (path.split('/').pop() || '').replace(/[-_]+/g, ' ').trim();
  return raw ? raw.replace(/\b\w/g, (m) => m.toUpperCase()) : 'Untitled Post';
}

async function fetchBlogEntries() {
  const candidates = [
    '/query-index.json',
    '/blog/query-index.json',
    '/sitemap.json',
    '/blog/sitemap.json',
  ];
  const responses = await Promise.all(candidates.map(async (candidate) => {
    try {
      const resp = await fetch(candidate, { cache: 'no-store' });
      if (!resp.ok) return [];
      return normalizeIndexData(await resp.json());
    } catch {
      return [];
    }
  }));

  return responses.flat();
}

function extractIntro(block) {
  const intro = document.createElement('div');
  intro.className = 'blog-list-intro';

  const rows = [...block.children];
  rows.forEach((row) => {
    const cells = [...row.children];
    cells.forEach((cell) => {
      const hasContent = [...cell.childNodes].some((node) => {
        if (node.nodeType === Node.TEXT_NODE) return node.textContent.trim().length > 0;
        return true;
      });
      if (!hasContent) return;
      const part = document.createElement('div');
      part.className = 'blog-list-intro-part';
      [...cell.childNodes].forEach((node) => {
        part.append(node.cloneNode(true));
      });
      intro.append(part);
    });
  });

  return intro.children.length ? intro : null;
}

function createCard(post, config) {
  const article = document.createElement('article');
  article.className = 'blog-list-card';

  const link = document.createElement('a');
  link.className = 'blog-list-card-link';
  link.href = post.path;
  link.setAttribute('aria-label', post.title);

  if (post.image) {
    const media = document.createElement('div');
    media.className = 'blog-list-card-media';
    const picture = createOptimizedPicture(post.image, post.title, false, [
      { media: '(min-width: 1200px)', width: '900' },
      { media: '(min-width: 768px)', width: '640' },
      { width: '480' },
    ]);
    media.append(picture);
    link.append(media);
  }

  const body = document.createElement('div');
  body.className = 'blog-list-card-body';

  const dateText = formatDate(post.lastModified);
  if (dateText) {
    const date = document.createElement('p');
    date.className = 'blog-list-card-date';
    date.textContent = dateText;
    body.append(date);
  }

  const title = document.createElement('h3');
  title.className = 'blog-list-card-title';
  title.textContent = post.title;
  body.append(title);

  if (config.showdescription && post.description) {
    const desc = document.createElement('p');
    desc.className = 'blog-list-card-description';
    desc.textContent = post.description;
    body.append(desc);
  }

  link.append(body);
  article.append(link);
  return article;
}

function toPosts(entries, config) {
  const posts = entries
    .map((entry) => {
      const path = resolveEntryPath(entry);
      if (!path || !isBlogPostPath(path)) return null;
      return {
        path,
        title: (entry.title || '').toString().trim() || toTitleFromPath(path),
        description: (entry.description || '').toString().trim(),
        image: (entry.image || '').toString().trim(),
        lastModified: (
          entry.lastModified
          || entry.lastmodified
          || entry.lastmod
          || entry.publishdate
          || ''
        ),
      };
    })
    .filter(Boolean);

  const deduped = [];
  const seen = new Set();
  posts.forEach((post) => {
    if (seen.has(post.path)) return;
    seen.add(post.path);
    deduped.push(post);
  });

  deduped.sort((a, b) => parseDate(b.lastModified) - parseDate(a.lastModified));
  if (config.sort === 'oldest') deduped.reverse();
  return deduped;
}

function renderPosts(posts, grid, config, state) {
  const from = state.rendered;
  const to = Math.min(posts.length, state.rendered + config.pagesize);
  for (let i = from; i < to; i += 1) {
    grid.append(createCard(posts[i], config));
  }
  state.rendered = to;
}

export default async function decorate(block) {
  const config = readConfig(block);
  const intro = extractIntro(block);

  block.dataset.bloglistPagesize = `${config.pagesize}`;
  block.dataset.bloglistSort = config.sort;
  block.dataset.bloglistShowdescription = config.showdescription ? 'true' : 'false';
  block.dataset.loading = 'true';

  const wrapper = document.createElement('div');
  wrapper.className = 'blog-list-wrap';
  if (intro) wrapper.append(intro);

  const grid = document.createElement('div');
  grid.className = 'blog-list-grid';
  wrapper.append(grid);

  const footer = document.createElement('div');
  footer.className = 'blog-list-footer';
  const loadMore = document.createElement('button');
  loadMore.type = 'button';
  loadMore.className = 'blog-list-loadmore button secondary';
  loadMore.textContent = 'Load more';
  footer.append(loadMore);
  wrapper.append(footer);

  block.replaceChildren(wrapper);

  const entries = await fetchBlogEntries();
  const posts = toPosts(entries, config);

  if (!posts.length) {
    if (entries.length) {
      // eslint-disable-next-line no-console
      console.warn('blog-list: index loaded but no /blog/* posts matched.', {
        sample: entries.slice(0, 5).map((entry) => (
          entry.path || entry.url || entry.href || entry.permalink || ''
        )),
      });
    } else {
      // eslint-disable-next-line no-console
      console.warn('blog-list: no index entries returned from query/sitemap endpoints.');
    }
    const empty = document.createElement('p');
    empty.className = 'blog-list-empty';
    empty.textContent = 'No blog posts found in /blog.';
    grid.append(empty);
    footer.remove();
    delete block.dataset.loading;
    return;
  }

  const state = { rendered: 0 };
  renderPosts(posts, grid, config, state);

  const updateLoadMore = () => {
    loadMore.hidden = state.rendered >= posts.length;
  };
  updateLoadMore();

  loadMore.addEventListener('click', () => {
    renderPosts(posts, grid, config, state);
    updateLoadMore();
  });

  delete block.dataset.loading;
}
