#!/usr/bin/env node
/* eslint-env node */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(SCRIPT_DIR, '../..');
const DEFAULT_MODELS_ROOT = path.join(REPOSITORY_ROOT, 'ue/models');
const ROOT_ONLY_MODELS = new Set(['page-metadata']);
const IMPLICIT_FIELD_MODELS = new Set(['section']);
const EXPECTED_VALUE_TYPES = {
  boolean: 'boolean',
  number: 'number',
};

function issue(code, file, message) {
  return { code, file, message };
}

function formatPath(file, modelsRoot) {
  return path.relative(REPOSITORY_ROOT, file || modelsRoot);
}

async function findJsonFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findJsonFiles(entryPath);
    return entry.isFile() && entry.name.endsWith('.json') ? [entryPath] : [];
  }));
  return nested.flat().sort();
}

export async function loadModelDocuments(modelsRoot = DEFAULT_MODELS_ROOT) {
  const files = await findJsonFiles(modelsRoot);
  return Promise.all(files.map(async (file) => {
    const source = await fs.readFile(file, 'utf8');
    return { file, data: JSON.parse(source) };
  }));
}

function collectEntries(documents, key) {
  return documents.flatMap(({ file, data }) => {
    if (!data || Array.isArray(data) || !Array.isArray(data[key])) return [];
    return data[key]
      .filter((entry) => entry && typeof entry === 'object' && entry.id)
      .map((entry) => ({ ...entry, file }));
  });
}

function collectRootFilters(documents) {
  return documents.flatMap(({ file, data }) => {
    if (!Array.isArray(data)) return [];
    return data
      .filter((entry) => entry && entry.id && Array.isArray(entry.components))
      .map((entry) => ({ ...entry, file }));
  });
}

function addDuplicateIssues(entries, kind, errors, modelsRoot) {
  const seen = new Map();
  entries.forEach((entry) => {
    if (seen.has(entry.id)) {
      errors.push(issue(
        `DUPLICATE_${kind.toUpperCase()}_ID`,
        formatPath(entry.file, modelsRoot),
        `${kind} id "${entry.id}" also appears in ${formatPath(seen.get(entry.id), modelsRoot)}`,
      ));
    } else {
      seen.set(entry.id, entry.file);
    }
  });
}

function validateModelFields(models, errors, modelsRoot) {
  models.forEach((model) => {
    if (!Array.isArray(model.fields)) {
      errors.push(issue('INVALID_MODEL_FIELDS', formatPath(model.file, modelsRoot), `model "${model.id}" must define a fields array`));
      return;
    }

    const names = new Set();
    model.fields.forEach((field) => {
      const location = `${formatPath(model.file, modelsRoot)}#${model.id}.${field?.name || '<unnamed>'}`;
      if (!field?.name || !field.component) {
        errors.push(issue('INVALID_MODEL_FIELD', location, 'every model field requires name and component'));
        return;
      }
      if (names.has(field.name)) {
        errors.push(issue('DUPLICATE_MODEL_FIELD', location, `field "${field.name}" is duplicated`));
      }
      names.add(field.name);
      if (!field.label) {
        errors.push(issue('MISSING_FIELD_LABEL', location, 'authorable fields require a label'));
      }
      if (!field.valueType) {
        errors.push(issue('MISSING_VALUE_TYPE', location, 'authorable fields require an explicit valueType'));
      }

      const expectedType = EXPECTED_VALUE_TYPES[field.component] || 'string';
      if (field.valueType && field.valueType !== expectedType) {
        errors.push(issue(
          'INVALID_VALUE_TYPE',
          location,
          `${field.component} fields use valueType "${expectedType}", found "${field.valueType}"`,
        ));
      }

      if (['select', 'multiselect'].includes(field.component)) {
        if (!Array.isArray(field.options) || field.options.length === 0) {
          errors.push(issue('MISSING_FIELD_OPTIONS', location, `${field.component} fields require options`));
        } else {
          const values = new Set();
          field.options.forEach((option) => {
            if (option?.name === undefined || option?.value === undefined) {
              errors.push(issue('INVALID_FIELD_OPTION', location, 'each option requires name and value'));
            } else if (values.has(option.value)) {
              errors.push(issue('DUPLICATE_FIELD_OPTION', location, `option value "${option.value}" is duplicated`));
            }
            values.add(option?.value);
          });
        }
      }
    });
  });
}

function validateDefinitions(definitions, modelMap, filterMap, errors, modelsRoot) {
  definitions.forEach((definition) => {
    const location = formatPath(definition.file, modelsRoot);
    const da = definition.plugins?.da;
    if (!definition.title || !da) {
      errors.push(issue('INVALID_DEFINITION', location, `definition "${definition.id}" requires title and plugins.da`));
      return;
    }

    if (definition.model && !modelMap.has(definition.model)) {
      errors.push(issue('MISSING_MODEL', location, `definition "${definition.id}" references missing model "${definition.model}"`));
    }
    if (definition.filter && !filterMap.has(definition.filter)) {
      errors.push(issue('MISSING_FILTER', location, `definition "${definition.id}" references missing filter "${definition.filter}"`));
    }
    if (da.unsafeHTML !== undefined && (da.rows !== undefined || da.columns !== undefined)) {
      errors.push(issue(
        'MIXED_DEFINITION_SHAPE',
        location,
        `definition "${definition.id}" must use unsafeHTML or rows/columns, not both`,
      ));
    }

    const selectorFields = Array.isArray(da.fields) ? da.fields : [];
    const selectorNames = new Set();
    selectorFields.forEach((field) => {
      if (!field?.name || !field.selector) {
        errors.push(issue('INVALID_SELECTOR_FIELD', location, `definition "${definition.id}" has a field without name or selector`));
      } else if (selectorNames.has(field.name)) {
        errors.push(issue('DUPLICATE_SELECTOR_FIELD', location, `definition "${definition.id}" maps "${field.name}" more than once`));
      }
      selectorNames.add(field?.name);
    });

    const model = definition.model ? modelMap.get(definition.model) : null;
    const modelFields = Array.isArray(model?.fields) ? model.fields : [];
    const selectorMappingRequired = model
      && da.type !== 'key-value-block'
      && !IMPLICIT_FIELD_MODELS.has(model.id);
    if (selectorMappingRequired) {
      modelFields
        .filter((field) => field.name !== 'classes' && !field.name.startsWith('classes_'))
        .forEach((field) => {
          if (!selectorNames.has(field.name)) {
            errors.push(issue(
              'UNMAPPED_MODEL_FIELD',
              location,
              `definition "${definition.id}" does not map model field "${field.name}"`,
            ));
          }
        });
    }
  });
}

function validateRelationships(definitions, models, filters, errors, modelsRoot) {
  const referencedModels = new Set(
    definitions.map((definition) => definition.model).filter(Boolean),
  );
  models.forEach((model) => {
    const modelFields = Array.isArray(model.fields) ? model.fields : [];
    const isOrphan = modelFields.length > 0
      && !referencedModels.has(model.id)
      && !ROOT_ONLY_MODELS.has(model.id);
    if (isOrphan) {
      errors.push(issue(
        'ORPHAN_MODEL',
        formatPath(model.file, modelsRoot),
        `non-empty model "${model.id}" is not linked from a definition`,
      ));
    }
  });

  const definitionIds = new Set(definitions.map((definition) => definition.id));
  const referencedFilters = new Set(
    definitions.map((definition) => definition.filter).filter(Boolean),
  );
  filters.forEach((filter) => {
    if (!Array.isArray(filter.components)) {
      errors.push(issue(
        'INVALID_FILTER',
        formatPath(filter.file, modelsRoot),
        `filter "${filter.id}" must define components`,
      ));
      return;
    }
    filter.components.forEach((component) => {
      if (!definitionIds.has(component)) {
        errors.push(issue(
          'UNKNOWN_FILTER_COMPONENT',
          formatPath(filter.file, modelsRoot),
          `filter "${filter.id}" references missing definition "${component}"`,
        ));
      }
    });
    const isOrphan = filter.components.length > 0
      && filter.id !== 'main'
      && !referencedFilters.has(filter.id);
    if (isOrphan) {
      errors.push(issue(
        'ORPHAN_FILTER',
        formatPath(filter.file, modelsRoot),
        `non-empty filter "${filter.id}" is not linked from a definition`,
      ));
    }
  });
}

function validateSectionRegistration(documents, filters, errors, modelsRoot) {
  const section = filters.find((filter) => filter.id === 'section');
  if (!section) {
    errors.push(issue('MISSING_SECTION_FILTER', 'ue/models/section.json', 'section filter is required'));
    return;
  }

  const registered = new Set(section.components);
  documents
    .filter(({ file }) => path.dirname(file) === path.join(modelsRoot, 'blocks'))
    .forEach(({ file, data }) => {
      const expectedId = path.basename(file, '.json');
      const hasDefinition = (data.definitions || [])
        .some((definition) => definition.id === expectedId);
      if (hasDefinition && !registered.has(expectedId)) {
        errors.push(issue(
          'BLOCK_NOT_IN_SECTION_FILTER',
          formatPath(file, modelsRoot),
          `top-level block "${expectedId}" is not registered in the section filter`,
        ));
      }
    });
}

function findSpreadReferences(value, references = []) {
  if (Array.isArray(value)) {
    value.forEach((entry) => findSpreadReferences(entry, references));
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, entry]) => {
      if (key === '...' && typeof entry === 'string') references.push(entry);
      else findSpreadReferences(entry, references);
    });
  }
  return references;
}

function globPatternToRegex(pattern) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*');
  return new RegExp(`^${escaped}$`);
}

function validateSpreadReferences(documents, errors, modelsRoot) {
  const byPath = new Map(documents.map((document) => [path.normalize(document.file), document]));
  documents.forEach((document) => {
    findSpreadReferences(document.data).forEach((reference) => {
      const [target, fragment = ''] = reference.split('#');
      const absolutePattern = path.normalize(path.resolve(path.dirname(document.file), target));
      const candidates = target.includes('*')
        ? documents.filter(({ file }) => (
          globPatternToRegex(absolutePattern).test(path.normalize(file))
        ))
        : [byPath.get(absolutePattern)].filter(Boolean);

      if (candidates.length === 0) {
        errors.push(issue(
          'MISSING_SPREAD_TARGET',
          formatPath(document.file, modelsRoot),
          `spread reference "${reference}" matches no source file`,
        ));
        return;
      }

      const fragmentKey = fragment.replace(/^\//, '');
      if (fragmentKey) {
        candidates.forEach((candidate) => {
          if (!Array.isArray(candidate.data?.[fragmentKey])) {
            errors.push(issue(
              'MISSING_SPREAD_FRAGMENT',
              formatPath(document.file, modelsRoot),
              `spread reference "${reference}" targets missing array "${fragmentKey}" in ${formatPath(candidate.file, modelsRoot)}`,
            ));
          }
        });
      }
    });
  });
}

export function validateModelDocuments(documents, modelsRoot = DEFAULT_MODELS_ROOT) {
  const definitions = collectEntries(documents, 'definitions');
  const models = collectEntries(documents, 'models');
  const filters = [...collectEntries(documents, 'filters'), ...collectRootFilters(documents)];
  const errors = [];

  addDuplicateIssues(definitions, 'definition', errors, modelsRoot);
  addDuplicateIssues(models, 'model', errors, modelsRoot);
  addDuplicateIssues(filters, 'filter', errors, modelsRoot);

  const modelMap = new Map(models.map((model) => [model.id, model]));
  const filterMap = new Map(filters.map((filter) => [filter.id, filter]));

  validateModelFields(models, errors, modelsRoot);
  validateDefinitions(definitions, modelMap, filterMap, errors, modelsRoot);
  validateRelationships(definitions, models, filters, errors, modelsRoot);
  validateSectionRegistration(documents, filters, errors, modelsRoot);
  validateSpreadReferences(documents, errors, modelsRoot);

  return errors.sort((left, right) => (
    `${left.file}:${left.code}:${left.message}`.localeCompare(`${right.file}:${right.code}:${right.message}`)
  ));
}

export async function validateRepository(modelsRoot = DEFAULT_MODELS_ROOT) {
  const documents = await loadModelDocuments(modelsRoot);
  return validateModelDocuments(documents, modelsRoot);
}

async function main() {
  try {
    const errors = await validateRepository();
    if (errors.length > 0) {
      errors.forEach((error) => console.error(`${error.code} ${error.file}: ${error.message}`));
      console.error(`\nUE model validation failed with ${errors.length} error(s).`);
      process.exitCode = 1;
      return;
    }
    console.info('UE model validation passed.');
  } catch (error) {
    console.error(`UE model validation could not run: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main();
}
