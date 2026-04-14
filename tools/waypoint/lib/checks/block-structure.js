import fs from 'node:fs';
import path from 'node:path';

const REQUIRED_FILES = ['.js', '.css', '/README.md'];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/**
 * Recursively collect files with the given extension(s) inside a directory.
 */
function collectFiles(dir, extensions) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(full, extensions));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Collect all JS files across every block directory.
 */
function collectBlockJSFiles(rootDir) {
  const blocksDir = path.join(rootDir, 'blocks');
  if (!fs.existsSync(blocksDir)) return [];
  const blockDirs = fs.readdirSync(blocksDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(blocksDir, d.name));

  const files = [];
  for (const bd of blockDirs) {
    files.push(...collectFiles(bd, ['.js']));
  }
  return files;
}

/**
 * Collect all CSS files across every block directory.
 */
function collectBlockCSSFiles(rootDir) {
  const blocksDir = path.join(rootDir, 'blocks');
  if (!fs.existsSync(blocksDir)) return [];
  const blockDirs = fs.readdirSync(blocksDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(blocksDir, d.name));

  const files = [];
  for (const bd of blockDirs) {
    files.push(...collectFiles(bd, ['.css']));
  }
  return files;
}

/**
 * Derive a short relative evidence path from an absolute file path and rootDir.
 */
function relPath(rootDir, absPath) {
  return path.relative(rootDir, absPath);
}

/**
 * Return the block name from a file path (first directory under blocks/).
 */
function blockName(rootDir, absPath) {
  const rel = relPath(rootDir, absPath);
  const parts = rel.split(path.sep);
  // parts[0] = 'blocks', parts[1] = block-name
  return parts[1] || 'unknown';
}

/* ------------------------------------------------------------------ */
/*  1. checkBlockStructure (original — unchanged)                     */
/* ------------------------------------------------------------------ */

/**
 * Validate that each block has the required file structure.
 * Returns findings per block.
 */
export function checkBlockStructure(rootDir) {
  const blocksDir = path.join(rootDir, 'blocks');
  const findings = [];

  if (!fs.existsSync(blocksDir)) {
    findings.push({
      id: 'block-structure/structure/1',
      domain: 'structure',
      severity: 'blocker',
      confidence: 'verified',
      summary: 'blocks/ directory not found',
      evidence: blocksDir,
      principle: 'Required Block Structure',
      remediation: 'Create blocks/ directory',
    });
    return { blocks: [], findings };
  }

  const blocks = fs.readdirSync(blocksDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  for (const block of blocks) {
    const blockDir = path.join(blocksDir, block);

    // Check main JS file
    const jsFile = path.join(blockDir, `${block}.js`);
    if (!fs.existsSync(jsFile)) {
      findings.push({
        id: `block-structure/structure/${block}-js`,
        domain: 'structure',
        severity: 'blocker',
        confidence: 'verified',
        summary: `${block}/ missing ${block}.js`,
        evidence: jsFile,
        principle: 'Required Block Structure: block-name.js',
        remediation: `Create ${block}.js with default export decorate(block)`,
      });
    }

    // Check CSS file
    const cssFile = path.join(blockDir, `${block}.css`);
    if (!fs.existsSync(cssFile)) {
      findings.push({
        id: `block-structure/structure/${block}-css`,
        domain: 'structure',
        severity: 'warning',
        confidence: 'verified',
        summary: `${block}/ missing ${block}.css`,
        evidence: cssFile,
        principle: 'Required Block Structure: block-name.css',
        remediation: `Create ${block}.css with block-scoped styles`,
      });
    }

    // Check README
    const readme = path.join(blockDir, 'README.md');
    if (!fs.existsSync(readme)) {
      findings.push({
        id: `block-structure/documentation/${block}-readme`,
        domain: 'documentation',
        severity: 'warning',
        confidence: 'verified',
        summary: `${block}/ missing README.md`,
        evidence: readme,
        principle: 'Required Block Structure: README.md',
        remediation: `Create README.md with required sections`,
      });
    }

    // Check _block.json
    const blockJson = path.join(blockDir, `_${block}.json`);
    if (!fs.existsSync(blockJson)) {
      // Some blocks use alternate naming, check for any _*.json
      const files = fs.readdirSync(blockDir);
      const hasAnyBlockJson = files.some((f) => f.startsWith('_') && f.endsWith('.json'));
      if (!hasAnyBlockJson) {
        findings.push({
          id: `block-structure/da-live-contract/${block}-json`,
          domain: 'da-live-contract',
          severity: 'warning',
          confidence: 'verified',
          summary: `${block}/ missing _${block}.json DA.live config`,
          evidence: blockJson,
          principle: 'Required Block Structure: _block-name.json',
          remediation: `Create _${block}.json with definitions, models, filters`,
        });
      }
    }
  }

  return { blocks, findings };
}

/* ------------------------------------------------------------------ */
/*  2. checkInnerHTML (original — unchanged)                          */
/* ------------------------------------------------------------------ */

/**
 * Check for innerHTML usage in block JS files (security check).
 */
export function checkInnerHTML(rootDir) {
  const blocksDir = path.join(rootDir, 'blocks');
  const findings = [];

  if (!fs.existsSync(blocksDir)) return findings;

  const blocks = fs.readdirSync(blocksDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const block of blocks) {
    const jsFile = path.join(blocksDir, block, `${block}.js`);
    if (!fs.existsSync(jsFile)) continue;

    const content = fs.readFileSync(jsFile, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      if (line.includes('.innerHTML') && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
        findings.push({
          id: `block-structure/security/${block}-innerhtml-${idx + 1}`,
          domain: 'security',
          severity: 'warning',
          confidence: 'inferred',
          summary: `${block}.js uses innerHTML at line ${idx + 1} — verify content is sanitized`,
          evidence: `blocks/${block}/${block}.js:${idx + 1}`,
          principle: 'Security Requirements > HTML Injection Safety',
          remediation: 'Review innerHTML usage; replace with createElement/textContent if author content is unsanitized',
        });
      }
    });
  }

  return findings;
}

/* ------------------------------------------------------------------ */
/*  3. checkSecurity — comprehensive security scanning                */
/* ------------------------------------------------------------------ */

const SECURITY_PATTERNS = [
  {
    regex: /\.innerHTML\s*=/,
    label: 'innerHTML assignment',
    severity: 'warning',
    remediation: 'Replace with createElement/textContent or ensure content is sanitized',
  },
  {
    regex: /\beval\s*\(/,
    label: 'eval() usage',
    severity: 'blocker',
    remediation: 'Remove eval(); use safer alternatives such as JSON.parse or function mapping',
  },
  {
    regex: /document\.write\s*\(/,
    label: 'document.write() usage',
    severity: 'blocker',
    remediation: 'Replace document.write with DOM manipulation methods',
  },
  {
    regex: /\.outerHTML\s*=/,
    label: 'outerHTML assignment',
    severity: 'warning',
    remediation: 'Replace outerHTML assignment with replaceWith() or DOM manipulation',
  },
  {
    regex: /\.insertAdjacentHTML\s*\(/,
    label: 'insertAdjacentHTML() usage',
    severity: 'warning',
    remediation: 'Ensure HTML string is sanitized, or use insertAdjacentElement with createElement',
  },
  {
    regex: /new\s+Function\s*\(/,
    label: 'new Function() usage',
    severity: 'blocker',
    remediation: 'Remove new Function(); use direct function definitions instead',
  },
];

/**
 * Full security scan across ALL .js files in blocks/.
 */
export function checkSecurity(rootDir) {
  const findings = [];
  const jsFiles = collectBlockJSFiles(rootDir);

  for (const filePath of jsFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const rel = relPath(rootDir, filePath);
    const block = blockName(rootDir, filePath);
    const fileName = path.basename(filePath);

    for (const pattern of SECURITY_PATTERNS) {
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
        if (pattern.regex.test(line)) {
          findings.push({
            id: `block-structure/security/${block}-${fileName}-${pattern.label.replace(/[^a-z0-9]/gi, '-')}-${idx + 1}`,
            domain: 'security',
            severity: pattern.severity,
            confidence: 'inferred',
            summary: `${rel}:${idx + 1} — ${pattern.label}`,
            evidence: `${rel}:${idx + 1}: ${trimmed.substring(0, 120)}`,
            principle: 'Security Requirements > Injection & Code Execution Safety',
            remediation: pattern.remediation,
          });
        }
      });
    }
  }

  return findings;
}

/* ------------------------------------------------------------------ */
/*  4. checkAccessibility — a11y audit                                */
/* ------------------------------------------------------------------ */

/**
 * Accessibility checks across all block JS files.
 */
export function checkAccessibility(rootDir) {
  const findings = [];
  const jsFiles = collectBlockJSFiles(rootDir);

  for (const filePath of jsFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const rel = relPath(rootDir, filePath);
    const block = blockName(rootDir, filePath);
    const fileName = path.basename(filePath);

    // --- Click without keyboard equivalent ---
    const hasClick = /addEventListener\(\s*['"]click['"]/i.test(content);
    const hasKeyboard = /addEventListener\(\s*['"]key(down|up)['"]/i.test(content);
    if (hasClick && !hasKeyboard) {
      findings.push({
        id: `block-structure/accessibility/${block}-${fileName}-click-no-keyboard`,
        domain: 'accessibility',
        severity: 'warning',
        confidence: 'inferred',
        summary: `${rel} — Click handler without keyboard equivalent`,
        evidence: `${rel}: addEventListener('click') found, no keydown/keyup listener`,
        principle: 'WCAG 2.1 SC 2.1.1 — Keyboard accessible',
        remediation: 'Add keydown/keyup event listener for keyboard users (Enter/Space)',
      });
    }

    // --- Positive tabindex ---
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;

      const tabindexMatch = line.match(/tabindex\s*[=:]\s*['"]?(\d+)/i);
      if (tabindexMatch && parseInt(tabindexMatch[1], 10) > 0) {
        findings.push({
          id: `block-structure/accessibility/${block}-${fileName}-tabindex-${idx + 1}`,
          domain: 'accessibility',
          severity: 'warning',
          confidence: 'verified',
          summary: `${rel}:${idx + 1} — Positive tabindex disrupts natural tab order`,
          evidence: `${rel}:${idx + 1}: ${trimmed.substring(0, 120)}`,
          principle: 'WCAG 2.1 SC 2.4.3 — Focus Order',
          remediation: 'Use tabindex="0" for focusable elements or tabindex="-1" for programmatic focus',
        });
      }
    });

    // --- role= without aria- attributes ---
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;

      if (/role\s*=\s*['"]/.test(line)) {
        // Check nearby lines (same line and within 5 lines) for aria- attributes
        const start = Math.max(0, idx - 2);
        const end = Math.min(lines.length - 1, idx + 5);
        let hasAria = false;
        for (let i = start; i <= end; i += 1) {
          if (/aria-/.test(lines[i])) {
            hasAria = true;
            break;
          }
        }
        if (!hasAria) {
          findings.push({
            id: `block-structure/accessibility/${block}-${fileName}-role-no-aria-${idx + 1}`,
            domain: 'accessibility',
            severity: 'advisory',
            confidence: 'inferred',
            summary: `${rel}:${idx + 1} — role= without corresponding aria- attributes`,
            evidence: `${rel}:${idx + 1}: ${trimmed.substring(0, 120)}`,
            principle: 'WCAG 2.1 SC 4.1.2 — Name, Role, Value',
            remediation: 'Add appropriate aria- attributes (aria-label, aria-labelledby, etc.) for the role',
          });
        }
      }
    });

    // --- Image creation without alt ---
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;

      if (/createElement\(\s*['"]img['"]\s*\)/.test(line)) {
        const start = idx;
        const end = Math.min(lines.length - 1, idx + 5);
        let hasAlt = false;
        for (let i = start; i <= end; i += 1) {
          if (/\.alt\s*=/.test(lines[i]) || /setAttribute\(\s*['"]alt['"]/.test(lines[i])) {
            hasAlt = true;
            break;
          }
        }
        if (!hasAlt) {
          findings.push({
            id: `block-structure/accessibility/${block}-${fileName}-img-no-alt-${idx + 1}`,
            domain: 'accessibility',
            severity: 'warning',
            confidence: 'inferred',
            summary: `${rel}:${idx + 1} — Image created without alt attribute within 5 lines`,
            evidence: `${rel}:${idx + 1}: ${trimmed.substring(0, 120)}`,
            principle: 'WCAG 2.1 SC 1.1.1 — Non-text Content',
            remediation: 'Set .alt or setAttribute("alt", ...) immediately after creating the img element',
          });
        }
      }
    });
  }

  return findings;
}

/* ------------------------------------------------------------------ */
/*  5. checkPerformance — performance patterns                        */
/* ------------------------------------------------------------------ */

/**
 * Performance anti-pattern detection in block JS files.
 */
export function checkPerformance(rootDir) {
  const findings = [];
  const jsFiles = collectBlockJSFiles(rootDir);

  for (const filePath of jsFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const rel = relPath(rootDir, filePath);
    const block = blockName(rootDir, filePath);
    const fileName = path.basename(filePath);

    // --- File size check ---
    if (lines.length > 500) {
      findings.push({
        id: `block-structure/performance/${block}-${fileName}-large-file`,
        domain: 'performance',
        severity: 'warning',
        confidence: 'verified',
        summary: `${rel} — Large block file (${lines.length} lines) may impact maintainability`,
        evidence: `${rel}: ${lines.length} lines`,
        principle: 'Maintainability & Performance — keep block files focused',
        remediation: 'Consider splitting into smaller helper modules',
      });
    }

    // --- DOM query inside loop ---
    let insideLoop = 0;
    for (let idx = 0; idx < lines.length; idx += 1) {
      const line = lines[idx];
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;

      // Track loop boundaries (heuristic: detect loop-opening patterns)
      if (/\bfor\s*\(/.test(line) || /\.forEach\s*\(/.test(line) || /\.map\s*\(/.test(line)) {
        insideLoop += 1;
      }

      if (insideLoop > 0 && /document\.querySelectorAll\s*\(/.test(line)) {
        findings.push({
          id: `block-structure/performance/${block}-${fileName}-dom-query-loop-${idx + 1}`,
          domain: 'performance',
          severity: 'warning',
          confidence: 'inferred',
          summary: `${rel}:${idx + 1} — DOM query inside loop`,
          evidence: `${rel}:${idx + 1}: ${trimmed.substring(0, 120)}`,
          principle: 'Performance — minimize DOM queries, especially in loops',
          remediation: 'Hoist document.querySelectorAll call above the loop',
        });
      }

      // Decrement loop depth heuristic on closing patterns
      // This is rough — count braces that close after loop-opening lines
      if (insideLoop > 0) {
        const opens = (line.match(/{/g) || []).length;
        const closes = (line.match(/}/g) || []).length;
        if (closes > opens) {
          insideLoop = Math.max(0, insideLoop - (closes - opens));
        }
      }
    }

    // --- Synchronous XMLHttpRequest ---
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;

      if (/XMLHttpRequest/.test(line)) {
        // Check if opened synchronously (third arg false or missing)
        const nearby = lines.slice(Math.max(0, idx - 2), Math.min(lines.length, idx + 5)).join('\n');
        if (/\.open\s*\([^)]*,\s*[^)]*,\s*false\s*\)/.test(nearby) || (/new\s+XMLHttpRequest/.test(line) && !/async|promise|fetch/i.test(content.substring(0, 200)))) {
          findings.push({
            id: `block-structure/performance/${block}-${fileName}-sync-xhr-${idx + 1}`,
            domain: 'performance',
            severity: 'blocker',
            confidence: 'inferred',
            summary: `${rel}:${idx + 1} — Synchronous XMLHttpRequest blocks main thread`,
            evidence: `${rel}:${idx + 1}: ${trimmed.substring(0, 120)}`,
            principle: 'Performance — never block the main thread',
            remediation: 'Replace XMLHttpRequest with fetch() or at minimum use async XHR',
          });
        }
      }
    });

    // --- document.write ---
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;

      if (/document\.write\s*\(/.test(line)) {
        findings.push({
          id: `block-structure/performance/${block}-${fileName}-doc-write-${idx + 1}`,
          domain: 'performance',
          severity: 'blocker',
          confidence: 'verified',
          summary: `${rel}:${idx + 1} — document.write() blocks parsing and can overwrite the page`,
          evidence: `${rel}:${idx + 1}: ${trimmed.substring(0, 120)}`,
          principle: 'Performance — avoid document.write',
          remediation: 'Replace document.write with DOM manipulation methods',
        });
      }
    });

    // --- Dynamic import outside async/delayed context (advisory) ---
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;

      // Match dynamic import() but not static import ... from
      if (/\bimport\s*\(/.test(line) && !/^\s*import\s+/.test(line)) {
        // Check if inside an async function — look upward for 'async' keyword
        let foundAsync = false;
        for (let i = idx; i >= Math.max(0, idx - 30); i -= 1) {
          if (/\basync\b/.test(lines[i])) {
            foundAsync = true;
            break;
          }
          // Also accept if in a lazy/delayed load context
          if (/lazy|delay|loadEager|loadLazy|loadDelayed/i.test(lines[i])) {
            foundAsync = true;
            break;
          }
        }
        if (!foundAsync) {
          findings.push({
            id: `block-structure/performance/${block}-${fileName}-dynamic-import-${idx + 1}`,
            domain: 'performance',
            severity: 'advisory',
            confidence: 'inferred',
            summary: `${rel}:${idx + 1} — Dynamic import() outside async/delayed context`,
            evidence: `${rel}:${idx + 1}: ${trimmed.substring(0, 120)}`,
            principle: 'Performance — use dynamic imports in lazy-load contexts',
            remediation: 'Ensure dynamic import is inside an async function or lazy/delayed loading context',
          });
        }
      }
    });
  }

  return findings;
}

/* ------------------------------------------------------------------ */
/*  6. checkCSSDiscipline — CSS best-practice checks                  */
/* ------------------------------------------------------------------ */

/**
 * CSS discipline checks across all block CSS (and inline styles in JS).
 */
export function checkCSSDiscipline(rootDir) {
  const findings = [];

  // --- CSS files ---
  const cssFiles = collectBlockCSSFiles(rootDir);
  for (const filePath of cssFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const rel = relPath(rootDir, filePath);
    const block = blockName(rootDir, filePath);
    const fileName = path.basename(filePath);

    // !important usage
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

      if (/!important/.test(line)) {
        findings.push({
          id: `block-structure/css-discipline/${block}-${fileName}-important-${idx + 1}`,
          domain: 'css-discipline',
          severity: 'warning',
          confidence: 'verified',
          summary: `${rel}:${idx + 1} — !important usage`,
          evidence: `${rel}:${idx + 1}: ${trimmed.substring(0, 120)}`,
          principle: 'CSS Discipline — avoid !important; use specificity instead',
          remediation: 'Remove !important and increase selector specificity if needed',
        });
      }
    });

    // No design token usage
    if (!/var\(\s*--/.test(content)) {
      findings.push({
        id: `block-structure/css-discipline/${block}-${fileName}-no-tokens`,
        domain: 'css-discipline',
        severity: 'advisory',
        confidence: 'inferred',
        summary: `${rel} — No design token usage`,
        evidence: `${rel}: no var(-- references found`,
        principle: 'CSS Discipline — use design tokens (CSS custom properties) for consistency',
        remediation: 'Replace hard-coded values with var(--token-name) where design tokens exist',
      });
    }

    // position: fixed
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

      if (/position\s*:\s*fixed/.test(line)) {
        findings.push({
          id: `block-structure/css-discipline/${block}-${fileName}-fixed-${idx + 1}`,
          domain: 'css-discipline',
          severity: 'advisory',
          confidence: 'verified',
          summary: `${rel}:${idx + 1} — Fixed positioning may cause overlay issues`,
          evidence: `${rel}:${idx + 1}: ${trimmed.substring(0, 120)}`,
          principle: 'CSS Discipline — use fixed positioning sparingly',
          remediation: 'Consider sticky positioning or ensure fixed elements handle z-index and mobile viewports correctly',
        });
      }
    });

    // High z-index (> 100)
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

      const zMatch = line.match(/z-index\s*:\s*(\d+)/);
      if (zMatch && parseInt(zMatch[1], 10) > 100) {
        findings.push({
          id: `block-structure/css-discipline/${block}-${fileName}-zindex-${idx + 1}`,
          domain: 'css-discipline',
          severity: 'warning',
          confidence: 'verified',
          summary: `${rel}:${idx + 1} — High z-index (${zMatch[1]}) may cause stacking issues`,
          evidence: `${rel}:${idx + 1}: ${trimmed.substring(0, 120)}`,
          principle: 'CSS Discipline — maintain a managed z-index scale',
          remediation: 'Use a z-index scale (e.g., token-based) and keep values under 100 where possible',
        });
      }
    });
  }

  // --- Inline styles in JS files ---
  const jsFiles = collectBlockJSFiles(rootDir);
  for (const filePath of jsFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const rel = relPath(rootDir, filePath);
    const block = blockName(rootDir, filePath);
    const fileName = path.basename(filePath);

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;

      if (/\.style\s*[.=]/.test(line) || /style\s*=\s*['"`]/.test(line)) {
        findings.push({
          id: `block-structure/css-discipline/${block}-${fileName}-inline-style-${idx + 1}`,
          domain: 'css-discipline',
          severity: 'advisory',
          confidence: 'inferred',
          summary: `${rel}:${idx + 1} — Inline style in JavaScript`,
          evidence: `${rel}:${idx + 1}: ${trimmed.substring(0, 120)}`,
          principle: 'CSS Discipline — prefer CSS classes over inline styles',
          remediation: 'Move styling to CSS classes; toggle classes in JS instead of setting inline styles',
        });
      }
    });
  }

  return findings;
}

/* ------------------------------------------------------------------ */
/*  7. checkErrorHandling — error handling patterns                   */
/* ------------------------------------------------------------------ */

/**
 * Error handling pattern checks in block JS files.
 */
export function checkErrorHandling(rootDir) {
  const findings = [];
  const jsFiles = collectBlockJSFiles(rootDir);

  for (const filePath of jsFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const rel = relPath(rootDir, filePath);
    const block = blockName(rootDir, filePath);
    const fileName = path.basename(filePath);

    // --- Async functions without try/catch ---
    // Heuristic: find 'async' function declarations and check if there's a try/catch within that scope
    const asyncFuncRegex = /\basync\s+(?:function\s+\w+|\(\w*\)\s*=>|\w+\s*=\s*async)/;
    let hasAsyncFunc = false;
    let hasTryCatch = false;

    // Simple file-level heuristic: if file has async functions, it should have try/catch somewhere
    if (asyncFuncRegex.test(content)) {
      hasAsyncFunc = true;
    }
    if (/\btry\s*{/.test(content) || /\btry\s*\n\s*{/.test(content)) {
      hasTryCatch = true;
    }

    if (hasAsyncFunc && !hasTryCatch) {
      findings.push({
        id: `block-structure/error-handling/${block}-${fileName}-async-no-try-catch`,
        domain: 'error-handling',
        severity: 'warning',
        confidence: 'inferred',
        summary: `${rel} — async function(s) without any try/catch error handling`,
        evidence: `${rel}: contains async functions but no try/catch blocks`,
        principle: 'Error Handling — async functions should handle errors gracefully',
        remediation: 'Wrap async logic in try/catch and provide user-facing error feedback',
      });
    }

    // --- Empty catch blocks ---
    for (let idx = 0; idx < lines.length; idx += 1) {
      const line = lines[idx];
      const trimmed = line.trim();

      // Match catch(...) { } on same line
      if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(line)) {
        findings.push({
          id: `block-structure/error-handling/${block}-${fileName}-empty-catch-${idx + 1}`,
          domain: 'error-handling',
          severity: 'warning',
          confidence: 'verified',
          summary: `${rel}:${idx + 1} — Empty catch block swallows errors`,
          evidence: `${rel}:${idx + 1}: ${trimmed.substring(0, 120)}`,
          principle: 'Error Handling — never silently swallow errors',
          remediation: 'Log the error or provide user-facing feedback in the catch block',
        });
        continue;
      }

      // Match catch(...) { \n } across two lines
      if (/catch\s*\([^)]*\)\s*\{\s*$/.test(line)) {
        const nextIdx = idx + 1;
        if (nextIdx < lines.length && /^\s*\}\s*$/.test(lines[nextIdx])) {
          findings.push({
            id: `block-structure/error-handling/${block}-${fileName}-empty-catch-${idx + 1}`,
            domain: 'error-handling',
            severity: 'warning',
            confidence: 'verified',
            summary: `${rel}:${idx + 1} — Empty catch block swallows errors`,
            evidence: `${rel}:${idx + 1}: ${trimmed.substring(0, 120)}`,
            principle: 'Error Handling — never silently swallow errors',
            remediation: 'Log the error or provide user-facing feedback in the catch block',
          });
        }
      }
    }

    // --- console.error without user-facing fallback ---
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;

      if (/console\.error\s*\(/.test(line)) {
        // Check nearby lines for UI fallback patterns
        const start = Math.max(0, idx - 3);
        const end = Math.min(lines.length - 1, idx + 5);
        let hasFallback = false;
        for (let i = start; i <= end; i += 1) {
          if (/textContent|innerHTML|innerText|classList|\.hidden|\.style|showError|displayError|fallback|placeholder|errorMessage/i.test(lines[i])) {
            hasFallback = true;
            break;
          }
        }
        if (!hasFallback) {
          findings.push({
            id: `block-structure/error-handling/${block}-${fileName}-console-error-no-ui-${idx + 1}`,
            domain: 'error-handling',
            severity: 'advisory',
            confidence: 'inferred',
            summary: `${rel}:${idx + 1} — console.error without user-facing fallback UI`,
            evidence: `${rel}:${idx + 1}: ${trimmed.substring(0, 120)}`,
            principle: 'Error Handling — provide user-facing feedback, not just console logs',
            remediation: 'Add a visible error state or fallback UI near console.error calls',
          });
        }
      }
    });
  }

  return findings;
}
