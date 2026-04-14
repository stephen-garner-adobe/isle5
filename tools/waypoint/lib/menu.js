import Enquirer from 'enquirer';
import chalk from 'chalk';
import { CYAN, TEAL, DIM } from './banner.js';

const { Select, MultiSelect, Confirm } = Enquirer;

export async function mainMenu() {
  const prompt = new Select({
    name: 'action',
    message: CYAN('What would you like to do?'),
    choices: [
      {
        name: 'assess',
        message: `${chalk.bold('Run Assessment'.padEnd(22))}${DIM('Full storefront-wide assessment')}`,
      },
      {
        name: 'gates',
        message: `${chalk.bold('Quality Gates'.padEnd(22))}${DIM('Lint, build, shipping checklist')}`,
      },
      {
        name: 'block',
        message: `${chalk.bold('Block Lifecycle'.padEnd(22))}${DIM('Create or validate a block end-to-end')}`,
      },
      {
        name: 'config',
        message: `${chalk.bold('Config Doctor'.padEnd(22))}${DIM('Diagnose endpoint, header, and mode issues')}`,
      },
      {
        name: 'drift',
        message: `${chalk.bold('Upstream Drift'.padEnd(22))}${DIM('Compare against upstream boilerplate')}`,
      },
      {
        name: 'skills',
        message: `${chalk.bold('Skill Reference'.padEnd(22))}${DIM('View available skills and agents')}`,
      },
    ],
    prefix: TEAL('  ◆'),
    pointer: CYAN('❯'),
    styles: {
      primary: CYAN,
    },
  });

  return prompt.run();
}

export async function assessmentScope() {
  const prompt = new MultiSelect({
    name: 'domains',
    message: CYAN('Select concern domains to assess:'),
    choices: [
      { name: 'all', message: chalk.bold('All domains (full assessment)') },
      { name: 'separator1', message: DIM('─── Core ───'), role: 'separator' },
      { name: 'security', message: 'Security' },
      { name: 'accessibility', message: 'Accessibility & Inclusivity' },
      { name: 'performance', message: 'Performance & Loading Phase' },
      { name: 'separator2', message: DIM('─── Contracts ───'), role: 'separator' },
      { name: 'metadata', message: 'Metadata Contracts' },
      { name: 'authoring', message: 'Authoring & DA.live Alignment' },
      { name: 'documentation', message: 'Documentation & README' },
      { name: 'separator3', message: DIM('─── Commerce ───'), role: 'separator' },
      { name: 'routes', message: 'Route & Commerce Readiness' },
      { name: 'dropin', message: 'Drop-in Lifecycle & Event Bus' },
      { name: 'dataflow', message: 'Commerce Data Flow' },
      { name: 'config', message: 'Config & Environment' },
      { name: 'separator4', message: DIM('─── Quality ───'), role: 'separator' },
      { name: 'visual', message: 'Visual & Responsive Geometry' },
      { name: 'css', message: 'CSS & Design Token Discipline' },
      { name: 'pipeline', message: 'EDS Pipeline & CI/CD' },
      { name: 'upstream', message: 'Upstream Drift' },
    ],
    initial: ['all'],
    prefix: TEAL('  ◆'),
    pointer: CYAN('❯'),
    indicator(state, choice) {
      if (choice.enabled) return chalk.green('◉');
      return DIM('○');
    },
  });

  return prompt.run();
}

export async function selectBlocks(blocks) {
  const prompt = new MultiSelect({
    name: 'blocks',
    message: CYAN('Select blocks to assess:'),
    choices: [
      { name: 'all', message: chalk.bold('All blocks') },
      ...blocks.map((b) => ({ name: b, message: b })),
    ],
    initial: ['all'],
    prefix: TEAL('  ◆'),
    pointer: CYAN('❯'),
    indicator(state, choice) {
      if (choice.enabled) return chalk.green('◉');
      return DIM('○');
    },
  });

  return prompt.run();
}

export async function confirmAction(message) {
  const prompt = new Confirm({
    name: 'confirm',
    message: CYAN(message),
    prefix: TEAL('  ◆'),
  });

  return prompt.run();
}

export async function selectEnvironment() {
  const prompt = new Select({
    name: 'env',
    message: CYAN('Target environment:'),
    choices: [
      { name: 'auto', message: `${chalk.bold('Auto-detect')}    ${DIM('Read from config.json signals')}` },
      { name: 'cs', message: `${chalk.bold('Cloud Service')}   ${DIM('Standard Commerce backend')}` },
      { name: 'aco', message: `${chalk.bold('Optimizer')}       ${DIM('Adobe Commerce Optimizer')}` },
    ],
    prefix: TEAL('  ◆'),
    pointer: CYAN('❯'),
  });

  return prompt.run();
}
