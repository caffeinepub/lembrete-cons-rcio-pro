#!/usr/bin/env node

/**
 * Validates that Android wrapper configuration files do not contain placeholder values
 * before allowing a release build to proceed.
 * 
 * Checks:
 * - twa-manifest.json → host field must not be a placeholder
 * - .well-known/assetlinks.json → sha256_cert_fingerprints must not be a placeholder
 * - signing/release.keystore → must exist
 * - signing/keystore.properties → must exist
 * 
 * Exits with code 1 if validation fails, 0 if all checks pass.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ANDROID_ROOT = join(__dirname, '..');
const FRONTEND_ROOT = join(ANDROID_ROOT, '..');

// Color codes for terminal output
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

let hasErrors = false;

function error(message) {
  console.error(`${RED}✗ ERROR:${RESET} ${message}`);
  hasErrors = true;
}

function warn(message) {
  console.warn(`${YELLOW}⚠ WARNING:${RESET} ${message}`);
}

function success(message) {
  console.log(`${GREEN}✓${RESET} ${message}`);
}

// Check 1: Validate twa-manifest.json host field
function validateTwaManifest() {
  const manifestPath = join(ANDROID_ROOT, 'twa-manifest.json');
  
  if (!existsSync(manifestPath)) {
    error(`twa-manifest.json not found`);
    console.error(`  Expected location: ${manifestPath}\n`);
    return;
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    const host = manifest.host || '';

    // Check for placeholder patterns
    const placeholderPatterns = [
      'YOUR_DEPLOYED_PWA_URL_HERE',
      'PLACEHOLDER',
      'REPLACE_WITH',
      'localhost',
      '127.0.0.1',
      'example.com',
      'your-domain.com',
      'your-app.com'
    ];

    const isPlaceholder = placeholderPatterns.some(pattern => 
      host.toUpperCase().includes(pattern.toUpperCase())
    );

    if (!host || isPlaceholder) {
      error('Placeholder host URL detected in twa-manifest.json');
      console.error(`\n  File: ${manifestPath}`);
      console.error(`  Field: ${BOLD}"host"${RESET}`);
      console.error(`  Current value: "${host}"`);
      console.error(`\n  ${BOLD}Action required:${RESET}`);
      console.error(`  Update the "host" field with your deployed PWA URL.`);
      console.error(`  Example: "https://your-app.icp0.io"`);
      console.error(`  The URL must be publicly accessible via HTTPS.\n`);
      return;
    }

    // Validate it's a proper HTTPS URL
    if (host && !isPlaceholder) {
      try {
        const url = new URL(host);
        if (url.protocol !== 'https:') {
          error('Host URL must use HTTPS protocol');
          console.error(`\n  File: ${manifestPath}`);
          console.error(`  Field: "host"`);
          console.error(`  Current protocol: ${url.protocol}`);
          console.error(`  Required: https://\n`);
          return;
        }
        success(`twa-manifest.json host validated: ${host}`);
      } catch (e) {
        error('Host URL is not a valid URL');
        console.error(`\n  File: ${manifestPath}`);
        console.error(`  Field: "host"`);
        console.error(`  Current value: "${host}"`);
        console.error(`  Error: ${e.message}\n`);
      }
    }
  } catch (e) {
    error(`Failed to parse twa-manifest.json`);
    console.error(`  File: ${manifestPath}`);
    console.error(`  Error: ${e.message}\n`);
  }
}

// Check 2: Validate assetlinks.json SHA-256 fingerprint
function validateAssetLinks() {
  const assetLinksPath = join(FRONTEND_ROOT, 'public', '.well-known', 'assetlinks.json');
  
  if (!existsSync(assetLinksPath)) {
    error(`assetlinks.json not found`);
    console.error(`  Expected location: ${assetLinksPath}\n`);
    return;
  }

  try {
    const assetLinks = JSON.parse(readFileSync(assetLinksPath, 'utf-8'));
    
    if (!Array.isArray(assetLinks) || assetLinks.length === 0) {
      error('assetlinks.json must contain at least one entry');
      console.error(`  File: ${assetLinksPath}\n`);
      return;
    }

    const firstEntry = assetLinks[0];
    const fingerprints = firstEntry?.target?.sha256_cert_fingerprints || [];

    if (fingerprints.length === 0) {
      error('No SHA-256 fingerprints found in assetlinks.json');
      console.error(`\n  File: ${assetLinksPath}`);
      console.error(`  Field: ${BOLD}target.sha256_cert_fingerprints${RESET}`);
      console.error(`\n  ${BOLD}Action required:${RESET}`);
      console.error(`  Add your release certificate SHA-256 fingerprint to the array.\n`);
      return;
    }

    // Check for placeholder patterns
    const placeholderPatterns = [
      'REPLACE_WITH',
      'YOUR_',
      'PLACEHOLDER',
      'FINGERPRINT_HERE',
      'EXAMPLE',
      'SHA256_CERT'
    ];

    let hasPlaceholder = false;
    fingerprints.forEach((fingerprint, index) => {
      const isPlaceholder = placeholderPatterns.some(pattern => 
        fingerprint.toUpperCase().includes(pattern.toUpperCase())
      );

      if (isPlaceholder) {
        hasPlaceholder = true;
        error(`Placeholder SHA-256 fingerprint detected in assetlinks.json`);
        console.error(`\n  File: ${assetLinksPath}`);
        console.error(`  Field: ${BOLD}target.sha256_cert_fingerprints[${index}]${RESET}`);
        console.error(`  Current value: "${fingerprint}"`);
        console.error(`\n  ${BOLD}Action required:${RESET}`);
        console.error(`  Replace this with your actual release certificate SHA-256 fingerprint.`);
        console.error(`\n  Extract it using:`);
        console.error(`    keytool -list -v -keystore ./signing/release.keystore -alias consorcio-pro-key`);
        console.error(`\n  Look for the "SHA256:" line in the output and copy the fingerprint.`);
        console.error(`  Format: AA:BB:CC:DD:...:FF (32 colon-separated hex pairs)\n`);
      }

      // Validate fingerprint format (should be 64 hex chars with colons)
      if (!isPlaceholder) {
        const cleanFingerprint = fingerprint.replace(/:/g, '');
        if (!/^[A-F0-9]{64}$/i.test(cleanFingerprint)) {
          warn(`SHA-256 fingerprint format may be invalid`);
          console.warn(`  File: ${assetLinksPath}`);
          console.warn(`  Fingerprint: "${fingerprint}"`);
          console.warn(`  Expected format: 64 hexadecimal characters (with or without colons)`);
          console.warn(`  Example: AA:BB:CC:DD:...:FF (32 pairs)\n`);
        }
      }
    });

    if (!hasPlaceholder) {
      success(`assetlinks.json SHA-256 fingerprints validated (${fingerprints.length} found)`);
    }
  } catch (e) {
    error(`Failed to parse assetlinks.json`);
    console.error(`  File: ${assetLinksPath}`);
    console.error(`  Error: ${e.message}\n`);
  }
}

// Check 3: Verify signing keystore exists
function validateSigningKeystore() {
  const keystorePath = join(ANDROID_ROOT, 'signing', 'release.keystore');
  const propertiesPath = join(ANDROID_ROOT, 'signing', 'keystore.properties');

  if (!existsSync(keystorePath)) {
    error('Release keystore not found');
    console.error(`\n  Expected location: ${keystorePath}`);
    console.error(`\n  ${BOLD}Action required:${RESET}`);
    console.error(`  Generate a keystore using:`);
    console.error(`    keytool -genkey -v -keystore ./signing/release.keystore \\`);
    console.error(`      -alias consorcio-pro-key -keyalg RSA -keysize 2048 -validity 10000\n`);
  } else {
    success('Release keystore found');
  }

  if (!existsSync(propertiesPath)) {
    error('Signing properties file not found');
    console.error(`\n  Expected location: ${propertiesPath}`);
    console.error(`\n  ${BOLD}Action required:${RESET}`);
    console.error(`  Copy from template:`);
    console.error(`    cp signing/keystore.properties.example signing/keystore.properties`);
    console.error(`  Then fill in your keystore credentials (password, alias, etc.).\n`);
  } else {
    success('Signing properties file found');
  }
}

// Main validation
console.log(`${BOLD}🔍 Validating Android Release Configuration${RESET}\n`);

validateTwaManifest();
validateAssetLinks();
validateSigningKeystore();

console.log('');

if (hasErrors) {
  console.error(`${RED}${BOLD}❌ Release build validation FAILED${RESET}`);
  console.error(`\nPlease fix the errors above before building a release APK.`);
  console.error(`Debug builds can still be created without these fixes.\n`);
  process.exit(1);
} else {
  console.log(`${GREEN}${BOLD}✅ Release configuration validation passed!${RESET}\n`);
  process.exit(0);
}
