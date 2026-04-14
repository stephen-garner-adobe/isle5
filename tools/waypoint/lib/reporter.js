import chalk from 'chalk';
import Table from 'cli-table3';
import {
  printSection,
  printSubsection,
  printSuccess,
  printWarning,
  printError,
  printInfo,
  printStat,
  printBox,
  printDivider,
  printReadiness,
  CYAN,
  TEAL,
  DIM,
  DIMMER,
  C3,
  C4,
  C5,
} from './banner.js';

const SEVERITY_COLORS = {
  blocker: chalk.red,
  warning: chalk.yellow,
  advisory: chalk.hex('#6B8F8E'),
};

const SEVERITY_ICONS = {
  blocker: chalk.red('●'),
  warning: chalk.yellow('●'),
  advisory: DIM('●'),
};

const CONFIDENCE_LABELS = {
  verified: chalk.green('verified'),
  inferred: chalk.yellow('inferred'),
  unchecked: DIM('unchecked'),
};

/**
 * Print the executive summary.
 */
export function printExecutiveSummary(findings) {
  const blockers = findings.filter((f) => f.severity === 'blocker').length;
  const warnings = findings.filter((f) => f.severity === 'warning').length;
  const advisories = findings.filter((f) => f.severity === 'advisory').length;

  const readinessKey = blockers > 0 ? 'not-ready' : warnings > 0 ? 'warnings' : 'ready';

  printSection('Executive Summary');

  console.log(`  ${printReadiness(readinessKey)}  ${DIM(`${findings.length} findings`)}`);
  console.log('');
  printDivider();

  const blockerBar = blockers > 0 ? chalk.red('█'.repeat(Math.min(blockers, 20))) : '';
  const warningBar = warnings > 0 ? chalk.yellow('█'.repeat(Math.min(warnings, 20))) : '';
  const advisoryBar = advisories > 0 ? DIMMER('█'.repeat(Math.min(advisories, 20))) : '';

  printStat('Blockers', `${chalk.red.bold(blockers)} ${blockerBar}`);
  printStat('Warnings', `${chalk.yellow.bold(warnings)} ${warningBar}`);
  printStat('Advisories', `${DIM(advisories)} ${advisoryBar}`);
}

/**
 * Print a domain-level dashboard — one row per concern domain with severity counts and a visual bar.
 */
export function printDomainDashboard(findings) {
  if (findings.length === 0) return;

  // Group by domain
  const domains = {};
  for (const f of findings) {
    if (!domains[f.domain]) domains[f.domain] = { blockers: 0, warnings: 0, advisories: 0 };
    if (f.severity === 'blocker') domains[f.domain].blockers += 1;
    else if (f.severity === 'warning') domains[f.domain].warnings += 1;
    else domains[f.domain].advisories += 1;
  }

  // Sort: blockers first, then warnings, then advisories
  const sorted = Object.entries(domains).sort(([, a], [, b]) => {
    if (a.blockers !== b.blockers) return b.blockers - a.blockers;
    if (a.warnings !== b.warnings) return b.warnings - a.warnings;
    return b.advisories - a.advisories;
  });

  const DOMAIN_LABELS = {
    security: 'Security',
    accessibility: 'Accessibility',
    performance: 'Performance',
    'css-discipline': 'CSS Discipline',
    'error-handling': 'Error Handling',
    structure: 'Block Structure',
    documentation: 'Documentation',
    'da-live-contract': 'DA.live Contract',
    pipeline: 'Pipeline & CI',
    config: 'Configuration',
    endpoint: 'Endpoints',
    'route-coverage': 'Route Coverage',
  };

  printSection('Domain Dashboard');

  // Header
  console.log(`  ${chalk.white('Domain'.padEnd(24))} ${chalk.red('BLK'.padEnd(5))} ${chalk.yellow('WRN'.padEnd(5))} ${DIM('ADV'.padEnd(5))} ${'Bar'}`);
  console.log(`  ${DIMMER('─'.repeat(56))}`);

  const maxTotal = Math.max(...sorted.map(([, c]) => c.blockers + c.warnings + c.advisories));

  for (const [domain, counts] of sorted) {
    const label = (DOMAIN_LABELS[domain] || domain).padEnd(24);
    const total = counts.blockers + counts.warnings + counts.advisories;
    const barWidth = Math.max(1, Math.round((total / maxTotal) * 20));

    const blockerBar = chalk.red('█'.repeat(Math.min(counts.blockers, barWidth)));
    const warningBar = chalk.yellow('█'.repeat(Math.min(counts.warnings, Math.max(0, barWidth - counts.blockers))));
    const advisoryBar = DIMMER('░'.repeat(Math.max(0, barWidth - counts.blockers - counts.warnings)));
    const bar = blockerBar + warningBar + advisoryBar;

    const bStr = counts.blockers > 0 ? chalk.red.bold(String(counts.blockers).padEnd(5)) : DIM('0'.padEnd(5));
    const wStr = counts.warnings > 0 ? chalk.yellow.bold(String(counts.warnings).padEnd(5)) : DIM('0'.padEnd(5));
    const aStr = counts.advisories > 0 ? chalk.white(String(counts.advisories).padEnd(5)) : DIM('0'.padEnd(5));

    // Status icon
    const icon = counts.blockers > 0 ? chalk.red('●') : counts.warnings > 0 ? chalk.yellow('●') : chalk.green('●');

    console.log(`  ${icon} ${chalk.white(label)} ${bStr} ${wStr} ${aStr} ${bar}`);
  }

  console.log('');
}

/**
 * Print findings grouped by domain.
 */
export function printFindingsByDomain(findings) {
  if (findings.length === 0) {
    printSection('Findings');
    printSuccess('No findings detected');
    return;
  }

  // Group by domain
  const domains = {};
  for (const f of findings) {
    if (!domains[f.domain]) domains[f.domain] = [];
    domains[f.domain].push(f);
  }

  // Sort domains by highest severity finding
  const severityRank = { blocker: 0, warning: 1, advisory: 2 };
  const sortedDomains = Object.entries(domains).sort(([, a], [, b]) => {
    const aMax = Math.min(...a.map((f) => severityRank[f.severity]));
    const bMax = Math.min(...b.map((f) => severityRank[f.severity]));
    return aMax - bMax;
  });

  printSection('Findings by Domain');

  for (const [domain, domainFindings] of sortedDomains) {
    const blockers = domainFindings.filter((f) => f.severity === 'blocker').length;
    const warnings = domainFindings.filter((f) => f.severity === 'warning').length;
    const advisories = domainFindings.filter((f) => f.severity === 'advisory').length;

    const counts = [
      blockers > 0 ? chalk.red(`${blockers} blocker${blockers > 1 ? 's' : ''}`) : null,
      warnings > 0 ? chalk.yellow(`${warnings} warning${warnings > 1 ? 's' : ''}`) : null,
      advisories > 0 ? DIM(`${advisories} advisory`) : null,
    ].filter(Boolean).join(DIM(', '));

    printSubsection(`${domain} ${DIM('—')} ${counts}`);
    console.log('');

    for (const f of domainFindings) {
      const icon = SEVERITY_ICONS[f.severity];
      const color = SEVERITY_COLORS[f.severity];
      const confidence = CONFIDENCE_LABELS[f.confidence];

      console.log(`    ${icon} ${color(f.summary)}`);
      console.log(`      ${DIM('evidence:')} ${DIM(f.evidence)}`);
      console.log(`      ${DIM('confidence:')} ${confidence}  ${DIM('severity:')} ${color(f.severity)}`);
      if (f.remediation) {
        console.log(`      ${DIM('fix:')} ${f.remediation}`);
      }
      console.log('');
    }
  }
}

/**
 * Print a gate summary table.
 */
export function printGateSummary(gates) {
  printSection('Quality Gates');

  for (const gate of gates) {
    const icon = gate.pass ? chalk.green('■') : chalk.red('■');
    const status = gate.pass ? chalk.green('PASS') : chalk.red('FAIL');
    const detail = gate.details ? DIM(` · ${gate.details}`) : '';
    console.log(`  ${icon} ${chalk.white(gate.name.padEnd(22))} ${status}${detail}`);
  }
}

/**
 * Print route coverage matrix.
 */
export function printRouteCoverage(coverage) {
  const covered = coverage.filter((r) => r.status === 'covered').length;
  const total = coverage.length;
  const pct = Math.round((covered / total) * 100);

  printSection(`Route Coverage (${covered}/${total} · ${pct}%)`);

  // Coverage bar
  const barWidth = 40;
  const filledWidth = Math.round((covered / total) * barWidth);
  const bar = C4('█'.repeat(filledWidth)) + DIMMER('░'.repeat(barWidth - filledWidth));
  console.log(`  ${bar} ${chalk.white.bold(`${pct}%`)}`);
  console.log('');

  for (const r of coverage) {
    const icon = r.status === 'covered'
      ? chalk.green('●')
      : (r.required ? chalk.red('○') : chalk.yellow('○'));
    const spec = r.specs.length > 0 ? DIM(r.specs[0].replace('.spec.js', '')) : '';
    console.log(`  ${icon} ${chalk.white(r.route.padEnd(22))} ${spec}`);
  }
}

/**
 * Print config readiness summary.
 */
export function printConfigSummary(configSummary) {
  printSection('Config Readiness');

  const modeColor = configSummary.mode === 'incomplete' ? chalk.red : C5;
  console.log(`  ${C4('▎')} Mode: ${modeColor.bold(configSummary.mode)}`);
  console.log('');

  const ep = (val) => val ? chalk.green('●') + chalk.white(' configured') : chalk.red('○') + chalk.red(' missing');
  printStat('CORE endpoint', ep(configSummary.coreEndpoint));
  printStat('CS endpoint', ep(configSummary.csEndpoint));
  if (configSummary.acoDetected) {
    printStat('ACO', C5('● detected'));
  }
}

/**
 * Print block inventory.
 */
export function printBlockInventory(blocks, findings) {
  printSection(`Block Inventory (${blocks.length} blocks)`);

  const blockFindings = {};
  for (const f of findings) {
    const blockMatch = f.evidence?.match(/blocks\/([^/]+)\//);
    if (blockMatch) {
      const block = blockMatch[1];
      if (!blockFindings[block]) blockFindings[block] = { blockers: 0, warnings: 0 };
      if (f.severity === 'blocker') blockFindings[block].blockers += 1;
      if (f.severity === 'warning') blockFindings[block].warnings += 1;
    }
  }

  const withIssues = Object.entries(blockFindings)
    .sort(([, a], [, b]) => (b.blockers - a.blockers) || (b.warnings - a.warnings));

  const withIssuesCount = withIssues.length;
  const cleanCount = blocks.filter((b) => !blockFindings[b]).length;

  // Mini bar chart for top offenders
  if (withIssues.length > 0) {
    const maxFindings = Math.max(...withIssues.map(([, c]) => c.blockers + c.warnings));
    const top = withIssues.slice(0, 12); // show top 12

    for (const [block, counts] of top) {
      const total = counts.blockers + counts.warnings;
      const barLen = Math.max(1, Math.round((total / maxFindings) * 20));
      const blockerBar = chalk.red('█'.repeat(Math.min(counts.blockers, barLen)));
      const warningBar = chalk.yellow('█'.repeat(Math.max(0, barLen - counts.blockers)));
      const bar = blockerBar + warningBar;
      console.log(`  ${chalk.white(block.padEnd(28))} ${bar} ${DIM(total)}`);
    }
    if (withIssues.length > 12) {
      console.log(`  ${DIM(`  ... and ${withIssues.length - 12} more`)}`);
    }
  }

  console.log('');
  console.log(`  ${chalk.green('●')} ${chalk.white(cleanCount)} clean  ${DIMMER('·')}  ${chalk.yellow('●')} ${chalk.white(withIssuesCount)} with findings`);

}

/**
 * Print final footer.
 */
export function printFooter(startTime) {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('');
  console.log(`  ${DIMMER('━'.repeat(56))}`);
  console.log(`  ${DIMMER('⏱')} ${DIM(`${elapsed}s`)}  ${DIMMER('·')}  ${DIM('Generated by')} ${C4('Waypoint')} ${DIMMER('· Adobe Commerce Storefront Assessment Pipeline')}`);
  console.log('');
}
