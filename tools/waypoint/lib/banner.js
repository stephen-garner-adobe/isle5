import chalk from 'chalk';
import boxen from 'boxen';

// Palette — deep ocean to electric cyan gradient
const C1 = chalk.hex('#0D3B66');   // deep navy
const C2 = chalk.hex('#1A6B6A');   // dark teal
const C3 = chalk.hex('#2A9D8F');   // teal
const C4 = chalk.hex('#3ECFCF');   // bright cyan
const C5 = chalk.hex('#6EEAEA');   // electric cyan
const C6 = chalk.hex('#A0F4F4');   // ice

const CYAN = chalk.hex('#3ECFCF');
const TEAL = chalk.hex('#2A9D8F');
const DIM = chalk.hex('#4A7C7B');
const DIMMER = chalk.hex('#2D5554');
const WHITE = chalk.white;
const BRAND = chalk.hex('#6EEAEA').bold;

const VERSION = '0.2.0';

// Thick block-style letters using box-drawing + block elements
// Each letter is 7 lines tall for serious terminal presence
function buildLogo() {
  const W = [
    '█    █',
    '█    █',
    '█ ██ █',
    '█ ██ █',
    '██  ██',
    '█    █',
    '      ',
  ];
  const A = [
    ' ████ ',
    '█    █',
    '█    █',
    '██████',
    '█    █',
    '█    █',
    '      ',
  ];
  const Y = [
    '█    █',
    ' █  █ ',
    '  ██  ',
    '  ██  ',
    '  ██  ',
    '  ██  ',
    '      ',
  ];
  const P = [
    '█████ ',
    '█    █',
    '█    █',
    '█████ ',
    '█     ',
    '█     ',
    '      ',
  ];
  const O = [
    ' ████ ',
    '█    █',
    '█    █',
    '█    █',
    '█    █',
    ' ████ ',
    '      ',
  ];
  const I = [
    '██████',
    '  ██  ',
    '  ██  ',
    '  ██  ',
    '  ██  ',
    '██████',
    '      ',
  ];
  const N = [
    '█    █',
    '██   █',
    '█ █  █',
    '█  █ █',
    '█   ██',
    '█    █',
    '      ',
  ];
  const T = [
    '██████',
    '  ██  ',
    '  ██  ',
    '  ██  ',
    '  ██  ',
    '  ██  ',
    '      ',
  ];

  const letters = [W, A, Y, P, O, I, N, T];
  const gap = ' ';

  // Color gradient across columns
  const colors = [C2, C3, C3, C4, C4, C5, C5, C6];

  const lines = [];
  for (let row = 0; row < 7; row += 1) {
    let line = '';
    for (let l = 0; l < letters.length; l += 1) {
      const color = colors[l];
      const letterRow = letters[l][row];
      // Replace █ with colored blocks, spaces stay as spaces
      let colored = '';
      for (const ch of letterRow) {
        if (ch === '█') {
          colored += color('█');
        } else {
          colored += ' ';
        }
      }
      line += colored + gap;
    }
    lines.push(`  ${line}`);
  }

  return lines.join('\n');
}

// Subtle scan-line decoration under the logo
function buildScanline() {
  const chars = '░▒▓█▓▒░';
  let line = '';
  const width = 57;
  for (let i = 0; i < width; i += 1) {
    const pos = i / width;
    const charIdx = Math.floor(pos * chars.length) % chars.length;
    const color = pos < 0.3 ? C2 : pos < 0.6 ? C3 : pos < 0.8 ? C4 : C5;
    line += color(chars[charIdx]);
  }
  return `  ${line}`;
}

export function printBanner() {
  console.log('');
  console.log(buildLogo());
  console.log(buildScanline());
  console.log('');
  console.log(`  ${DIMMER('◆')} ${BRAND(`Waypoint`)} ${DIM(`v${VERSION}`)}  ${DIMMER('·')}  ${DIM('Adobe Commerce Storefront Solutions Consulting Pipeline')}`);
  console.log('');
}

export function printSection(title) {
  const barWidth = Math.max(2, 54 - title.length);
  console.log('');
  console.log(`  ${C4('▎')} ${WHITE(title)} ${DIMMER('─'.repeat(barWidth))}`);
  console.log('');
}

export function printSubsection(title) {
  console.log(`  ${TEAL('▸')} ${chalk.bold(title)}`);
}

export function printSuccess(message) {
  console.log(`  ${chalk.green('✔')} ${message}`);
}

export function printWarning(message) {
  console.log(`  ${chalk.yellow('⚠')} ${message}`);
}

export function printError(message) {
  console.log(`  ${chalk.red('✖')} ${message}`);
}

export function printInfo(message) {
  console.log(`  ${DIM('○')} ${DIM(message)}`);
}

export function printStat(label, value, color = 'white') {
  const colorFn = chalk[color] || chalk.white;
  console.log(`  ${DIM(label.padEnd(28))} ${colorFn(value)}`);
}

export function printBox(content, options = {}) {
  console.log(boxen(content, {
    padding: { top: 0, bottom: 0, left: 1, right: 1 },
    margin: { top: 0, bottom: 0, left: 2, right: 0 },
    borderColor: '#3ECFCF',
    borderStyle: 'round',
    ...options,
  }));
}

export function printDivider() {
  console.log(`  ${DIMMER('─'.repeat(56))}`);
}

export function printReadiness(state) {
  const states = {
    ready: { label: ' READY ', bg: chalk.bgHex('#2A9D8F').hex('#000000').bold },
    warnings: { label: ' READY WITH WARNINGS ', bg: chalk.bgHex('#E9C46A').hex('#000000').bold },
    'not-ready': { label: ' NOT READY ', bg: chalk.bgHex('#E76F51').hex('#FFFFFF').bold },
  };
  const s = states[state] || states['not-ready'];
  return s.bg(s.label);
}

export { CYAN, TEAL, DIM, DIMMER, WHITE, BRAND, C1, C2, C3, C4, C5, C6 };
