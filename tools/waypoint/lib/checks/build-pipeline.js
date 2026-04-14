import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Check build pipeline health: build:json, component files, pre-commit hooks.
 */
export function checkBuildPipeline(rootDir) {
  const findings = [];
  const summary = { buildJson: 'unknown', componentFiles: 'unknown', hooks: 'unknown' };

  // Check component files exist
  const componentFiles = [
    'component-definition.json',
    'component-models.json',
    'component-filters.json',
  ];

  for (const file of componentFiles) {
    const filePath = path.join(rootDir, file);
    if (!fs.existsSync(filePath)) {
      findings.push({
        id: `build-pipeline/pipeline/${file}`,
        domain: 'pipeline',
        severity: 'warning',
        confidence: 'verified',
        summary: `${file} not found — DA.live authoring may not work`,
        evidence: filePath,
        principle: 'DA.live JSON Config > Integration with project-level configs',
        remediation: `Run npm run build:json to generate ${file}`,
      });
    }
  }

  summary.componentFiles = findings.length === 0 ? 'present' : 'missing';

  // Check husky pre-commit hook
  const huskyHook = path.join(rootDir, '.husky', 'pre-commit');
  if (fs.existsSync(huskyHook)) {
    const hookContent = fs.readFileSync(huskyHook, 'utf-8');
    if (!hookContent.includes('build:json')) {
      findings.push({
        id: 'build-pipeline/pipeline/hook-build-json',
        domain: 'pipeline',
        severity: 'warning',
        confidence: 'verified',
        summary: 'Pre-commit hook does not run build:json',
        evidence: huskyHook,
        principle: 'DA.live JSON Config > run npm run build:json',
        remediation: 'Add npm run build:json to pre-commit hook',
      });
    }
    summary.hooks = 'configured';
  } else {
    findings.push({
      id: 'build-pipeline/pipeline/hook-missing',
      domain: 'pipeline',
      severity: 'advisory',
      confidence: 'verified',
      summary: 'No pre-commit hook found at .husky/pre-commit',
      evidence: huskyHook,
      principle: 'Build pipeline automation',
      remediation: 'Configure husky pre-commit hook to run build:json',
    });
    summary.hooks = 'missing';
  }

  // Try running build:json
  try {
    execSync('npm run build:json 2>&1', {
      cwd: rootDir,
      encoding: 'utf-8',
      timeout: 30000,
    });
    summary.buildJson = 'pass';
  } catch (err) {
    const output = err.stdout || err.stderr || '';
    findings.push({
      id: 'build-pipeline/pipeline/build-json-fail',
      domain: 'pipeline',
      severity: 'blocker',
      confidence: 'verified',
      summary: 'npm run build:json failed',
      evidence: `Build output: ${output.substring(0, 200)}`,
      principle: 'DA.live JSON Config > Integration with project-level configs',
      remediation: 'Fix build:json errors — check _*.json files for syntax issues',
    });
    summary.buildJson = 'fail';
  }

  return { findings, summary };
}
