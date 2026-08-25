/* eslint-env node */

import assert from 'node:assert/strict';
import test from 'node:test';

/* eslint-disable import/extensions */
import {
  loadModelDocuments,
  validateModelDocuments,
} from './validate.mjs';
/* eslint-enable import/extensions */

function cloneDocuments(documents) {
  return structuredClone(documents);
}

function findDocument(documents, suffix) {
  const document = documents.find(({ file }) => file.endsWith(suffix));
  assert(document, `Expected model source ending in ${suffix}`);
  return document.data;
}

test('repository UE source contracts are valid', async () => {
  const documents = await loadModelDocuments();
  assert.deepEqual(validateModelDocuments(documents), []);
});

test('orphaned models are rejected', async () => {
  const documents = cloneDocuments(await loadModelDocuments());
  const imageDocument = documents.find(({ file }) => file.endsWith('/image.json'));
  delete imageDocument.data.definitions[0].model;

  const errors = validateModelDocuments(documents);
  assert(errors.some(({ code, message }) => code === 'ORPHAN_MODEL' && message.includes('"image"')));
});

test('model fields without source selectors are rejected', async () => {
  const documents = cloneDocuments(await loadModelDocuments());
  const imageDocument = documents.find(({ file }) => file.endsWith('/image.json'));
  imageDocument.data.definitions[0].plugins.da.fields = [];

  const errors = validateModelDocuments(documents);
  assert(errors.some(({ code, message }) => (
    code === 'UNMAPPED_MODEL_FIELD' && message.includes('"imageAlt"')
  )));
});

test('malformed model fields produce a validation error instead of throwing', async () => {
  const documents = cloneDocuments(await loadModelDocuments());
  const imageDocument = documents.find(({ file }) => file.endsWith('/image.json'));
  imageDocument.data.models[0].fields = null;

  const errors = validateModelDocuments(documents);
  assert(errors.some(({ code }) => code === 'INVALID_MODEL_FIELDS'));
});

test('custom storefront models preserve their authored source shapes', async () => {
  const documents = await loadModelDocuments();
  const image = findDocument(documents, '/image.json');
  const circleCarousel = findDocument(documents, '/blocks/circle-carousel.json');
  const columns = findDocument(documents, '/blocks/columns.json');
  const newsletter = findDocument(documents, '/blocks/newsletter.json');
  const searchBar = findDocument(documents, '/blocks/search-bar.json');
  const storeLocator = findDocument(documents, '/blocks/store-locator.json');

  assert.equal(image.definitions[0].model, 'image');
  assert.deepEqual(
    image.definitions[0].plugins.da.fields.map(({ name }) => name).sort(),
    ['image', 'imageAlt'],
  );
  assert.deepEqual(circleCarousel.filters[0].components, ['circle-carousel-item']);
  assert.deepEqual(
    circleCarousel.models.find(({ id }) => id === 'circle-carousel-item')
      .fields.map(({ name }) => name),
    ['image', 'imageAlt', 'text'],
  );
  assert.deepEqual(columns.models.find(({ id }) => id === 'columns').fields, []);
  assert.equal(newsletter.definitions[0].plugins.da.rows, 8);
  assert.equal(newsletter.models[0].fields.length, 8);
  assert.deepEqual(searchBar.models[0].fields.map(({ name }) => name), ['placeholder']);
  assert.equal(storeLocator.definitions[0].plugins.da.type, 'key-value-block');
  assert.deepEqual(
    storeLocator.models[0].fields.map(({ name }) => name),
    [
      'googleMapsApiKey',
      'defaultView',
      'searchRadius',
      'maxResults',
      'autoDetectLocation',
      'defaultLocation',
      'servicesFilter',
      'experienceMode',
      'radiusPresets',
      'units',
      'noResultsMessage',
      'maxReviewsPerStore',
      'mapStyle',
      'primaryCtaLabel',
      'storeCardDensity',
    ],
  );
});
