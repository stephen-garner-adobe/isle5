#!/usr/bin/env node

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ora from 'ora';
import chalk from 'chalk';

import { printBanner, printSection, printInfo, CYAN, TEAL, DIM } from './lib/banner.js';
import {
  checkBlockStructure,
  checkSecurity,
  checkAccessibility,
  checkPerformance,
  checkCSSDiscipline,
  checkErrorHandling,
} from './lib/checks/block-structure.js';
import { checkConfig } from './lib/checks/config-doctor.js';
import { checkBuildPipeline } from './lib/checks/build-pipeline.js';
import { checkRouteCoverage } from './lib/checks/route-coverage.js';
import { runLint } from './lib/checks/lint.js';
import {
  printExecutiveSummary,
  printDomainDashboard,
  printFindingsByDomain,
  printGateSummary,
  printRouteCoverage,
  printConfigSummary,
  printBlockInventory,
  printFooter,
} from './lib/reporter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');
const VALID_COMMANDS = new Set(['assess', 'verify', 'gates', 'remediation', 'drift', 'skills', 'help']);

function parseCli(argv) {
  const args = [...argv];
  let command = 'assess';
  let commandSet = false;
  const options = {
    format: 'text',
    block: null,
    route: null,
    changed: false,
    since: null,
    mode: 'plan-only',
    help: false,
  };

  for (const arg of args) {
    if (!arg.startsWith('--') && !commandSet) {
      command = arg;
      commandSet = true;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg.startsWith('--format=')) {
      options.format = arg.split('=')[1] || 'text';
    } else if (arg.startsWith('--block=')) {
      options.block = arg.split('=')[1] || null;
    } else if (arg.startsWith('--route=')) {
      options.route = arg.split('=')[1] || null;
    } else if (arg === '--changed') {
      options.changed = true;
    } else if (arg.startsWith('--since=')) {
      options.since = arg.split('=')[1] || null;
    } else if (arg.startsWith('--mode=')) {
      options.mode = arg.split('=')[1] || 'plan-only';
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!VALID_COMMANDS.has(command)) {
    const err = new Error(`Unknown command: ${command}`);
    err.code = 'CLI_USAGE';
    throw err;
  }

  if (!['text', 'json'].includes(options.format)) {
    const err = new Error(`Invalid format: ${options.format}`);
    err.code = 'CLI_USAGE';
    throw err;
  }

  if (!['plan-only', 'apply-and-verify'].includes(options.mode)) {
    const err = new Error(`Invalid remediation mode: ${options.mode}`);
    err.code = 'CLI_USAGE';
    throw err;
  }

  return { command, options };
}

function collectGitOutput(command) {
  try {
    return execSync(command, {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 30000,
    }).trim();
  } catch {
    return '';
  }
}

function getChangedFiles(scope) {
  const files = new Set();

  if (scope.since) {
    collectGitOutput(`git diff --name-only ${scope.since}...HEAD`)
      .split('\n')
      .filter(Boolean)
      .forEach((file) => files.add(file));
  }

  if (scope.changed) {
    [
      'git diff --name-only',
      'git diff --cached --name-only',
      'git ls-files --others --exclude-standard',
    ].forEach((cmd) => {
      collectGitOutput(cmd)
        .split('\n')
        .filter(Boolean)
        .forEach((file) => files.add(file));
    });
  }

  return [...files].sort();
}

function determineReadiness(findings) {
  if (findings.some((f) => f.severity === 'blocker')) return 'not-ready';
  if (findings.some((f) => f.severity === 'warning')) return 'ready-with-warnings';
  return 'ready';
}

function summarizeCounts(findings) {
  return findings.reduce((acc, finding) => {
    acc[finding.severity] += 1;
    return acc;
  }, { blocker: 0, warning: 0, advisory: 0 });
}

function extractEvidencePath(evidence) {
  if (!evidence) return null;
  const pathMatch = evidence.match(/([.\w/-]+\.[a-z]+(?::\d+)?)/i);
  if (!pathMatch) return null;
  return pathMatch[1].split(':')[0];
}

function findingMatchesScope(finding, scope, changedFiles) {
  const haystack = `${finding.summary || ''} ${finding.evidence || ''}`.toLowerCase();

  if (scope.block && !haystack.includes(`blocks/${scope.block}/`)) {
    return false;
  }

  if (scope.route && !haystack.includes(scope.route.toLowerCase())) {
    return false;
  }

  if (changedFiles.length > 0) {
    const evidencePath = extractEvidencePath(finding.evidence);
    if (evidencePath) {
      return changedFiles.some((file) => evidencePath.includes(file) || file.includes(evidencePath));
    }
  }

  return true;
}

function filterFindings(findings, scope, changedFiles) {
  return findings.filter((finding) => findingMatchesScope(finding, scope, changedFiles));
}

function filterBlocks(blocks, scope, changedFiles) {
  return blocks.filter((block) => {
    const blockName = typeof block === 'string' ? block : block.name;
    if (scope.block && blockName !== scope.block) return false;
    if (changedFiles.length > 0) {
      return changedFiles.some((file) => file.includes(`blocks/${blockName}/`));
    }
    return true;
  });
}

function filterCoverage(coverage, scope) {
  if (scope.block && !scope.route) return [];
  if (!scope.route) return coverage;
  return coverage.filter((item) => item.route.toLowerCase().includes(scope.route.toLowerCase()));
}

function createLintFindings(lintResults) {
  const findings = [];

  if (!lintResults.js?.pass) {
    findings.push({
      id: 'verification-auditor/pipeline/lint-js',
      domain: 'pipeline',
      severity: 'blocker',
      confidence: 'verified',
      summary: `ESLint failed with ${lintResults.js?.errors || 'unknown'} error(s)`,
      evidence: 'npm run lint:js',
      principle: 'Linting and Quality Gates: ESLint must pass',
      remediation: 'Fix ESLint errors',
    });
  }

  if (!lintResults.css?.pass) {
    findings.push({
      id: 'verification-auditor/pipeline/lint-css',
      domain: 'pipeline',
      severity: 'blocker',
      confidence: 'verified',
      summary: `Stylelint failed with ${lintResults.css?.errors || 'unknown'} error(s)`,
      evidence: 'npm run lint:css',
      principle: 'Linting and Quality Gates: Stylelint must pass',
      remediation: 'Fix Stylelint errors',
    });
  }

  return findings;
}

function buildGateSummary(lintResults, buildSummary, coverage = []) {
  const covered = coverage.filter((route) => route.status === 'covered').length;
  const requiredRoutes = coverage.filter((route) => route.required);
  const requiredCovered = requiredRoutes.filter((route) => route.status === 'covered').length;
  return [
    {
      name: 'ESLint (JS)',
      pass: lintResults.js?.pass ?? false,
      details: lintResults.js?.pass ? 'Clean' : `${lintResults.js?.errors || '?'} errors`,
    },
    {
      name: 'Stylelint (CSS)',
      pass: lintResults.css?.pass ?? false,
      details: lintResults.css?.pass ? 'Clean' : `${lintResults.css?.errors || '?'} errors`,
    },
    {
      name: 'Build pipeline',
      pass: buildSummary.buildJson === 'pass',
      details: buildSummary.buildJson,
    },
    {
      name: 'Component files',
      pass: buildSummary.componentFiles === 'present',
      details: buildSummary.componentFiles,
    },
    {
      name: 'Pre-commit hooks',
      pass: buildSummary.hooks === 'configured',
      details: buildSummary.hooks,
    },
    {
      name: 'Route coverage',
      pass: coverage.length === 0 || requiredCovered === requiredRoutes.length,
      details: coverage.length > 0 ? `${covered}/${coverage.length} covered` : 'Not run',
    },
  ];
}

function printScopeSummary(scope, changedFiles) {
  const parts = [];
  if (scope.block) parts.push(`block=${scope.block}`);
  if (scope.route) parts.push(`route=${scope.route}`);
  if (scope.changed) parts.push('changed');
  if (scope.since) parts.push(`since=${scope.since}`);

  if (parts.length === 0) return;

  printSection('Scope');
  printInfo(parts.join(' · '));
  if (changedFiles.length > 0) {
    printInfo(`${changedFiles.length} changed file${changedFiles.length === 1 ? '' : 's'} in scope`);
  }
}

function renderAssessText(result) {
  printExecutiveSummary(result.findings);
  printDomainDashboard(result.findings);
  printConfigSummary(result.configSummary);
  printGateSummary(result.gates);
  printBlockInventory(result.blocks, result.findings);
  printRouteCoverage(result.coverage);
  printFindingsByDomain(result.findings);
}

function renderVerifyText(result) {
  printSection('Verification Summary');
  printGateSummary(result.gates);
  if (result.coverage.length > 0) {
    printRouteCoverage(result.coverage);
  }
  printFindingsByDomain(result.findings);
}

function renderGatesText(result) {
  printSection('Quality Gates');
  printGateSummary(result.gates);
  printFindingsByDomain(result.findings);
}

function remediationOwner(finding) {
  const domainOwnerMap = {
    config: 'commerce-integration-auditor',
    endpoint: 'commerce-integration-auditor',
    'drop-in-lifecycle': 'commerce-integration-auditor',
    'event-bus': 'commerce-integration-auditor',
    pipeline: 'verification-auditor',
    'route-coverage': 'verification-auditor',
    'visual-geometry': 'verification-auditor',
    'css-discipline': 'verification-auditor',
    documentation: 'authoring-contract-auditor',
    'metadata-contract': 'authoring-contract-auditor',
    'da-live-contract': 'authoring-contract-auditor',
    security: 'implementation-auditor',
    accessibility: 'implementation-auditor',
    performance: 'implementation-auditor',
    lifecycle: 'implementation-auditor',
    'error-handling': 'implementation-auditor',
    structure: 'implementation-auditor',
    'upstream-drift': 'upstream-drift-reviewer',
  };

  return finding['delegate-to'] || domainOwnerMap[finding.domain] || 'implementation-auditor';
}

function buildRemediationPlan(findings) {
  const priority = [
    'commerce-integration-auditor',
    'authoring-contract-auditor',
    'implementation-auditor',
    'verification-auditor',
    'upstream-drift-reviewer',
  ];

  const grouped = new Map(priority.map((owner) => [owner, []]));

  findings.forEach((finding) => {
    const owner = remediationOwner(finding);
    if (!grouped.has(owner)) grouped.set(owner, []);
    grouped.get(owner).push(finding);
  });

  return priority
    .map((owner) => ({
      owner,
      findings: (grouped.get(owner) || []).sort((a, b) => {
        const rank = { blocker: 0, warning: 1, advisory: 2 };
        return rank[a.severity] - rank[b.severity];
      }),
    }))
    .filter((group) => group.findings.length > 0);
}

function renderRemediationText(result) {
  printSection('Remediation Plan');
  printInfo(`mode=${result.mode}`);

  if (result.mode === 'apply-and-verify') {
    printInfo('No explicit finding input was provided, so this run generated a workspace plan and required verification surfaces.');
  }

  result.plan.forEach((group) => {
    console.log('');
    console.log(`  ${TEAL('◆')} ${chalk.bold(group.owner)} ${DIM(`(${group.findings.length} finding${group.findings.length === 1 ? '' : 's'})`)}`);
    group.findings.forEach((finding, index) => {
      console.log(`    ${index + 1}. ${finding.summary}`);
      console.log(`       ${DIM(finding.evidence)}`);
    });
  });
}

function renderDriftText(result) {
  printSection('Upstream Drift');
  printInfo('This command currently reports configuration for drift review rather than executing a sync analysis.');
  if (result.changedFiles.length > 0) {
    printInfo(`${result.changedFiles.length} changed file${result.changedFiles.length === 1 ? '' : 's'} detected in current scope`);
  }
  printInfo('Recommended next step: waypoint drift --format=json after adding upstream diff support.');
}

function printSkillReference() {
  printSection('Auditors');

  const skills = [
    ['implementation-auditor', 'Runtime block and route code quality'],
    ['commerce-integration-auditor', 'Config, endpoints, initializers, event bus'],
    ['verification-auditor', 'Lint, build, coverage, geometry, gate reporting'],
    ['authoring-contract-auditor', 'README, metadata, DA.live and contract parity'],
    ['upstream-drift-reviewer', 'Upstream comparison and sync planning'],
  ];

  skills.forEach(([name, desc]) => {
    console.log(`  ${CYAN('▸')} ${chalk.bold(name.padEnd(32))} ${DIM(desc)}`);
  });

  printSection('Agents');

  const agents = [
    ['assess', 'Architectural assessment and remediation package synthesis'],
    ['execute-remediation', 'Dependency-ordered remediation routing and verification'],
  ];

  agents.forEach(([name, desc]) => {
    console.log(`  ${TEAL('◆')} ${chalk.bold(name.padEnd(32))} ${DIM(desc)}`);
  });

  printSection('Usage');
  printInfo('waypoint assess [--format=json] [--block=name] [--route=name] [--changed] [--since=ref]');
  printInfo('waypoint verify [--format=json] [--route=name]');
  printInfo('waypoint gates [--format=json]');
  printInfo('waypoint remediation [--mode=plan-only|apply-and-verify]');
}

function printHelp() {
  printBanner();
  printSection('Commands');
  printInfo('assess       Run the full architectural assessment (default)');
  printInfo('verify       Run verification-focused checks and coverage reporting');
  printInfo('gates        Run lint/build quality gates');
  printInfo('remediation  Build a remediation plan from current findings');
  printInfo('drift        Show upstream drift command guidance');
  printInfo('skills       Show the consolidated auditor/agent model');
  console.log('');
  printSection('Options');
  printInfo('--format=text|json');
  printInfo('--block=<block-name>');
  printInfo('--route=<route-name>');
  printInfo('--changed');
  printInfo('--since=<git-ref>');
  printInfo('--mode=plan-only|apply-and-verify');
  console.log('');
}

async function runAssess(scope, outputFormat) {
  const startTime = Date.now();
  const changedFiles = getChangedFiles(scope);
  const useSpinners = outputFormat === 'text';
  const findings = [];

  const configSpinner = useSpinners
    ? ora({ text: 'Checking configuration...', prefixText: '  ', color: 'cyan' }).start()
    : null;
  const { findings: configFindings, summary: configSummary } = checkConfig(ROOT_DIR);
  findings.push(...configFindings);
  configSpinner?.succeed(chalk.green('Configuration checked'));

  const buildSpinner = useSpinners
    ? ora({ text: 'Validating build pipeline...', prefixText: '  ', color: 'cyan' }).start()
    : null;
  const { findings: buildFindings, summary: buildSummary } = checkBuildPipeline(ROOT_DIR);
  findings.push(...buildFindings);
  buildSpinner?.succeed(chalk.green('Build pipeline validated'));

  const blockSpinner = useSpinners
    ? ora({ text: 'Scanning implementation surfaces...', prefixText: '  ', color: 'cyan' }).start()
    : null;
  const { blocks, findings: structureFindings } = checkBlockStructure(ROOT_DIR);
  const securityFindings = checkSecurity(ROOT_DIR);
  const a11yFindings = checkAccessibility(ROOT_DIR);
  const perfFindings = checkPerformance(ROOT_DIR);
  const cssFindings = checkCSSDiscipline(ROOT_DIR);
  const errFindings = checkErrorHandling(ROOT_DIR);
  findings.push(
    ...structureFindings,
    ...securityFindings,
    ...a11yFindings,
    ...perfFindings,
    ...cssFindings,
    ...errFindings,
  );
  blockSpinner?.succeed(chalk.green(`Scanned ${blocks.length} blocks`));

  const routeSpinner = useSpinners
    ? ora({ text: 'Analyzing route coverage...', prefixText: '  ', color: 'cyan' }).start()
    : null;
  const { findings: routeFindings, coverage, specs } = checkRouteCoverage(ROOT_DIR);
  findings.push(...routeFindings);
  routeSpinner?.succeed(chalk.green(`Analyzed ${specs.length} Cypress specs`));

  const lintSpinner = useSpinners
    ? ora({ text: 'Running verification gates...', prefixText: '  ', color: 'cyan' }).start()
    : null;
  const lintResults = runLint(ROOT_DIR);
  findings.push(...createLintFindings(lintResults));
  lintSpinner?.succeed(chalk.green('Verification gates completed'));

  const filteredFindings = filterFindings(findings, scope, changedFiles);
  const filteredBlocks = filterBlocks(blocks, scope, changedFiles);
  const filteredCoverage = filterCoverage(coverage, scope);
  const gates = buildGateSummary(lintResults, buildSummary, filteredCoverage);

  const result = {
    command: 'assess',
    startedAt: startTime,
    scope,
    changedFiles,
    findings: filteredFindings,
    counts: summarizeCounts(filteredFindings),
    readiness: determineReadiness(filteredFindings),
    configSummary,
    buildSummary,
    lintResults,
    coverage: filteredCoverage,
    blocks: filteredBlocks,
    gates,
    durationMs: Date.now() - startTime,
  };

  return result;
}

async function runVerify(scope, outputFormat) {
  const startTime = Date.now();
  const changedFiles = getChangedFiles(scope);
  const useSpinners = outputFormat === 'text';

  const lintSpinner = useSpinners
    ? ora({ text: 'Running lint and build verification...', prefixText: '  ', color: 'cyan' }).start()
    : null;
  const lintResults = runLint(ROOT_DIR);
  const lintFindings = createLintFindings(lintResults);
  const { findings: buildFindings, summary: buildSummary } = checkBuildPipeline(ROOT_DIR);
  lintSpinner?.succeed(chalk.green('Lint and build verification completed'));

  const routeSpinner = useSpinners
    ? ora({ text: 'Inspecting route coverage...', prefixText: '  ', color: 'cyan' }).start()
    : null;
  const { findings: routeFindings, coverage } = checkRouteCoverage(ROOT_DIR);
  routeSpinner?.succeed(chalk.green('Route coverage inspected'));

  const findings = filterFindings(
    [...lintFindings, ...buildFindings, ...routeFindings],
    scope,
    changedFiles,
  );
  const filteredCoverage = filterCoverage(coverage, scope);
  const gates = buildGateSummary(lintResults, buildSummary, filteredCoverage);

  return {
    command: 'verify',
    startedAt: startTime,
    scope,
    changedFiles,
    findings,
    counts: summarizeCounts(findings),
    readiness: determineReadiness(findings),
    lintResults,
    buildSummary,
    coverage: filteredCoverage,
    gates,
    durationMs: Date.now() - startTime,
  };
}

async function runGates(scope, outputFormat) {
  const startTime = Date.now();
  const changedFiles = getChangedFiles(scope);
  const useSpinners = outputFormat === 'text';

  const lintSpinner = useSpinners
    ? ora({ text: 'Running lint...', prefixText: '  ', color: 'cyan' }).start()
    : null;
  const lintResults = runLint(ROOT_DIR);
  lintSpinner?.succeed(chalk.green('Lint completed'));

  const buildSpinner = useSpinners
    ? ora({ text: 'Checking build pipeline...', prefixText: '  ', color: 'cyan' }).start()
    : null;
  const { findings: buildFindings, summary: buildSummary } = checkBuildPipeline(ROOT_DIR);
  buildSpinner?.succeed(chalk.green('Build pipeline checked'));

  const findings = filterFindings(
    [...createLintFindings(lintResults), ...buildFindings],
    scope,
    changedFiles,
  );

  return {
    command: 'gates',
    startedAt: startTime,
    scope,
    changedFiles,
    findings,
    counts: summarizeCounts(findings),
    readiness: determineReadiness(findings),
    lintResults,
    buildSummary,
    gates: buildGateSummary(lintResults, buildSummary),
    durationMs: Date.now() - startTime,
  };
}

async function runRemediation(scope, outputFormat) {
  const assessment = await runAssess(scope, outputFormat === 'json' ? 'json' : 'text');
  const plan = buildRemediationPlan(assessment.findings);

  return {
    command: 'remediation',
    startedAt: assessment.startedAt,
    scope,
    changedFiles: assessment.changedFiles,
    mode: scope.mode,
    findings: assessment.findings,
    counts: assessment.counts,
    readiness: assessment.readiness,
    plan,
    durationMs: assessment.durationMs,
  };
}

async function runDrift(scope) {
  return {
    command: 'drift',
    startedAt: Date.now(),
    scope,
    changedFiles: getChangedFiles(scope),
    findings: [],
    counts: { blocker: 0, warning: 0, advisory: 0 },
    readiness: 'ready',
    durationMs: 0,
  };
}

function renderText(command, scope, result) {
  printBanner();
  printScopeSummary(scope, result.changedFiles || []);

  switch (command) {
    case 'assess':
      renderAssessText(result);
      break;
    case 'verify':
      renderVerifyText(result);
      break;
    case 'gates':
      renderGatesText(result);
      break;
    case 'remediation':
      renderRemediationText(result);
      break;
    case 'drift':
      renderDriftText(result);
      break;
    case 'skills':
      printSkillReference();
      break;
    default:
      break;
  }

  if (!['skills', 'help'].includes(command)) {
    printFooter(result.startedAt);
  }
}

function printJson(result) {
  console.log(JSON.stringify(result, null, 2));
}

function exitCodeFor(result) {
  return result.findings?.some((finding) => finding.severity === 'blocker') ? 1 : 0;
}

async function main() {
  const { command, options } = parseCli(process.argv.slice(2));

  if (options.help || command === 'help') {
    printHelp();
    return;
  }

  if (command === 'skills') {
    if (options.format === 'json') {
      printJson({
        command: 'skills',
        auditors: [
          'implementation-auditor',
          'commerce-integration-auditor',
          'verification-auditor',
          'authoring-contract-auditor',
          'upstream-drift-reviewer',
        ],
        agents: ['assess', 'execute-remediation'],
      });
      return;
    }
    printBanner();
    printSkillReference();
    return;
  }

  let result;
  switch (command) {
    case 'assess':
      result = await runAssess(options, options.format);
      break;
    case 'verify':
      result = await runVerify(options, options.format);
      break;
    case 'gates':
      result = await runGates(options, options.format);
      break;
    case 'remediation':
      result = await runRemediation(options, options.format);
      break;
    case 'drift':
      result = await runDrift(options);
      break;
    default:
      result = null;
      break;
  }

  if (options.format === 'json') {
    printJson(result);
  } else {
    renderText(command, options, result);
  }

  process.exit(exitCodeFor(result));
}

main().catch((err) => {
  if (err.code === 'CLI_USAGE') {
    console.error(chalk.red(`\n  Error: ${err.message}\n`));
    process.exit(2);
  }
  console.error(chalk.red(`\n  Error: ${err.message}\n`));
  process.exit(1);
});
