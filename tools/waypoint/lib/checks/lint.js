import { execSync } from 'node:child_process';
import path from 'node:path';

/**
 * Run ESLint and Stylelint, returning structured results.
 */
export function runLint(rootDir) {
  const results = { js: null, css: null };

  // ESLint
  try {
    execSync('npm run lint:js 2>&1', { cwd: rootDir, encoding: 'utf-8', timeout: 60000 });
    results.js = { pass: true, errors: 0, output: '' };
  } catch (err) {
    const output = err.stdout || err.stderr || '';
    const errorMatch = output.match(/(\d+)\s+error/);
    const errorCount = errorMatch ? parseInt(errorMatch[1], 10) : 1;
    results.js = { pass: false, errors: errorCount, output: output.trim() };
  }

  // Stylelint
  try {
    execSync('npm run lint:css 2>&1', { cwd: rootDir, encoding: 'utf-8', timeout: 60000 });
    results.css = { pass: true, errors: 0, output: '' };
  } catch (err) {
    const output = err.stdout || err.stderr || '';
    const errorMatch = output.match(/(\d+)\s+error/);
    const errorCount = errorMatch ? parseInt(errorMatch[1], 10) : 1;
    results.css = { pass: false, errors: errorCount, output: output.trim() };
  }

  return results;
}
