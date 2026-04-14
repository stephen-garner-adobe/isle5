import fs from 'node:fs';
import path from 'node:path';

/**
 * Diagnose config.json structure and commerce mode.
 */
export function checkConfig(rootDir) {
  const findings = [];
  const summary = {
    mode: 'unknown',
    coreEndpoint: null,
    csEndpoint: null,
    acoDetected: false,
  };

  // Check config.json exists
  const configPath = path.join(rootDir, 'config.json');
  if (!fs.existsSync(configPath)) {
    findings.push({
      id: 'config-doctor/config/1',
      domain: 'config',
      severity: 'blocker',
      confidence: 'verified',
      summary: 'config.json not found',
      evidence: configPath,
      principle: 'Commerce configuration required',
      remediation: 'Create config.json with commerce endpoints and headers',
    });
    return { findings, summary };
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch {
    findings.push({
      id: 'config-doctor/config/2',
      domain: 'config',
      severity: 'blocker',
      confidence: 'verified',
      summary: 'config.json is not valid JSON',
      evidence: configPath,
      principle: 'Commerce configuration required',
      remediation: 'Fix JSON syntax errors in config.json',
    });
    return { findings, summary };
  }

  const pub = config?.public?.default || {};

  // Check CORE endpoint
  if (pub['commerce-core-endpoint']) {
    summary.coreEndpoint = pub['commerce-core-endpoint'];
  } else {
    findings.push({
      id: 'config-doctor/endpoint/1',
      domain: 'endpoint',
      severity: 'blocker',
      confidence: 'verified',
      summary: 'commerce-core-endpoint missing from config.json',
      evidence: `${configPath} > public.default`,
      principle: 'CORE_FETCH_GRAPHQL requires commerce-core-endpoint',
      remediation: 'Add commerce-core-endpoint to config.json public.default',
    });
  }

  // Check CS endpoint
  if (pub['commerce-endpoint']) {
    summary.csEndpoint = pub['commerce-endpoint'];
  } else {
    findings.push({
      id: 'config-doctor/endpoint/2',
      domain: 'endpoint',
      severity: 'blocker',
      confidence: 'verified',
      summary: 'commerce-endpoint missing from config.json',
      evidence: `${configPath} > public.default`,
      principle: 'CS_FETCH_GRAPHQL requires commerce-endpoint',
      remediation: 'Add commerce-endpoint to config.json public.default',
    });
  }

  // Check headers
  const headers = pub.headers || {};
  if (!headers.cs) {
    findings.push({
      id: 'config-doctor/config/3',
      domain: 'config',
      severity: 'warning',
      confidence: 'verified',
      summary: 'headers.cs section missing from config.json',
      evidence: `${configPath} > public.default.headers`,
      principle: 'Catalog service requires CS-specific headers',
      remediation: 'Add headers.cs with Magento-Store-Code, x-api-key, etc.',
    });
  } else {
    const requiredHeaders = ['Magento-Store-Code', 'x-api-key', 'Magento-Environment-Id'];
    for (const h of requiredHeaders) {
      if (!headers.cs[h]) {
        findings.push({
          id: `config-doctor/config/header-${h}`,
          domain: 'config',
          severity: 'warning',
          confidence: 'verified',
          summary: `headers.cs missing ${h}`,
          evidence: `${configPath} > public.default.headers.cs`,
          principle: 'Required catalog service headers',
          remediation: `Add ${h} to headers.cs`,
        });
      }
    }
  }

  // ACO detection
  const acoPath = path.join(rootDir, 'demo-config-aco.json');
  if (fs.existsSync(acoPath)) {
    try {
      const aco = JSON.parse(fs.readFileSync(acoPath, 'utf-8'));
      const acoHeaders = aco?.public?.default?.headers?.cs || {};
      if (acoHeaders['ac-view-id'] || acoHeaders['ac-price-book-id']) {
        summary.acoDetected = true;
      }
    } catch {
      // ignore parse errors in demo config
    }
  }

  // Mode detection
  if (summary.acoDetected) {
    summary.mode = 'ACO + Cloud Service';
  } else if (summary.coreEndpoint && summary.csEndpoint) {
    summary.mode = 'Cloud Service';
  } else {
    summary.mode = 'incomplete';
  }

  // Check fstab.yaml
  const fstabPath = path.join(rootDir, 'fstab.yaml');
  if (!fs.existsSync(fstabPath)) {
    findings.push({
      id: 'config-doctor/pipeline/1',
      domain: 'pipeline',
      severity: 'warning',
      confidence: 'verified',
      summary: 'fstab.yaml not found',
      evidence: fstabPath,
      principle: 'DA.live content source configuration',
      remediation: 'Create fstab.yaml with DA.live mountpoint',
    });
  }

  return { findings, summary };
}
