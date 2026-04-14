import fs from 'node:fs';
import path from 'node:path';

const CRITICAL_ROUTES = [
  { name: 'Home', specPattern: /home|landing/i, required: false },
  { name: 'PLP', specPattern: /productlist|plp/i, required: true },
  { name: 'PDP', specPattern: /productdetail|pdp/i, required: false },
  { name: 'Cart', specPattern: /cart/i, required: true },
  { name: 'Checkout (guest)', specPattern: /guestuser.*checkout|guest.*checkout/i, required: true },
  { name: 'Checkout (auth)', specPattern: /authuser.*checkout|auth.*checkout/i, required: true },
  { name: 'Search', specPattern: /search/i, required: true },
  { name: 'Account', specPattern: /account/i, required: true },
  { name: 'Wishlist (guest)', specPattern: /guestuser.*wishlist|guest.*wishlist/i, required: false },
  { name: 'Wishlist (auth)', specPattern: /authuser.*wishlist|auth.*wishlist/i, required: false },
  { name: 'Recommendations', specPattern: /recs|recommend/i, required: false },
  { name: 'Header', specPattern: /header/i, required: false },
  { name: 'Store switcher', specPattern: /store.*switch/i, required: false },
];

/**
 * Analyze Cypress test coverage against critical routes.
 */
export function checkRouteCoverage(rootDir) {
  const findings = [];
  const coverage = [];

  const specDir = path.join(rootDir, 'cypress', 'src', 'tests', 'e2eTests');
  if (!fs.existsSync(specDir)) {
    findings.push({
      id: 'route-coverage/route-coverage/1',
      domain: 'route-coverage',
      severity: 'warning',
      confidence: 'verified',
      summary: 'Cypress e2e test directory not found',
      evidence: specDir,
      principle: 'Risk-Based Testing Expectations',
      remediation: 'Create Cypress specs for critical routes',
    });
    return { findings, coverage, specs: [] };
  }

  // Get all spec files
  const specs = fs.readdirSync(specDir)
    .filter((f) => f.endsWith('.spec.js'))
    .sort();

  // Match specs to routes
  for (const route of CRITICAL_ROUTES) {
    const matchingSpecs = specs.filter((s) => route.specPattern.test(s));
    const status = matchingSpecs.length > 0 ? 'covered' : 'gap';

    coverage.push({
      route: route.name,
      specs: matchingSpecs,
      status,
      required: route.required,
    });

    if (status === 'gap' && route.required) {
      findings.push({
        id: `route-coverage/route-coverage/${route.name.toLowerCase().replace(/\s+/g, '-')}`,
        domain: 'route-coverage',
        severity: 'warning',
        confidence: 'inferred',
        summary: `No Cypress spec found for critical route: ${route.name}`,
        evidence: `${specDir} — no spec matching ${route.specPattern}`,
        principle: 'Risk-Based Testing Expectations: critical-path commerce blocks require route-level smoke test',
        remediation: `Create Cypress spec for ${route.name} route`,
      });
    }
  }

  return { findings, coverage, specs };
}
