import assert from 'node:assert/strict';
import test from 'node:test';
import { getSafeURL } from '../scripts/dom-safety.js';
import { normalizePageSize, normalizeRailConfig } from '../blocks/product-rail/config.js';

const base = 'https://shop.example/en/page';

test('authored scheme injection is rejected even with case or whitespace variation', () => {
  ['javascript:alert(1)', ' JaVaScRiPt:alert(1)', 'java\tscript:alert(1)', 'data:text/html,<script>x</script>', 'vbscript:msgbox(1)', 'file:///etc/passwd', 'blob:https://shop.example/id']
    .forEach((value) => assert.equal(getSafeURL(value, base), null));
});

test('field-specific protocol allowlists keep images stricter than rich text links', () => {
  assert.equal(getSafeURL('mailto:help@example.com', base), null);
  assert.equal(getSafeURL('mailto:help@example.com', base, ['https:', 'mailto:']), 'mailto:help@example.com');
  assert.equal(getSafeURL('tel:+441234', base, ['tel:']), 'tel:+441234');
});

test('relative authored destinations stay on their resolved site and path', () => {
  assert.equal(getSafeURL('/collections', base), 'https://shop.example/collections');
  assert.equal(getSafeURL('../support', base), 'https://shop.example/support');
  assert.equal(getSafeURL('#fit', base), 'https://shop.example/en/page#fit');
  assert.equal(getSafeURL('https://[invalid', base), null);
  assert.equal(getSafeURL('', base), null);
});

test('author-controlled rail counts cannot request an unbounded catalogue response', () => {
  [Infinity, NaN, -1, 0, '', 'all', '1.5', '1e309'].forEach((value) => assert.equal(normalizePageSize(value), 4));
  [13, 999, Number.MAX_SAFE_INTEGER].forEach((value) => assert.equal(normalizePageSize(value), 12));
  assert.equal(normalizePageSize('1'), 1);
});

test('DA property fields and readable table labels supply the same rail configuration', () => {
  const model = normalizeRailConfig({
    title: 'Collection', collectionlink: '/search', collectionlabel: 'Browse', urlpath: 'apparel', pagesize: '6',
  });
  const table = normalizeRailConfig({
    title: 'Collection', 'collection-link': '/search', 'collection-label': 'Browse', 'url-path': 'apparel', 'page-size': '6',
  });
  assert.deepEqual(table, model);
  assert.equal(table.pagesize, 6);
  assert.equal(normalizeRailConfig({ 'page-size': 'all' }).pagesize, 4);
});
