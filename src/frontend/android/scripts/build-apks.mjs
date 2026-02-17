#!/usr/bin/env node

/**
 * Automated APK build script for Lembrete Consórcio Pro Android wrapper.
 * 
 * Builds:
 * 1. Debug APK (always) - for testing and development
 * 2. Release APK (conditional) - only when signing configuration exists and validation passes
 * 
 * Reports exact output paths and filenames for each artifact with CI-friendly markers.
 * Copies all produced APKs to frontend/android/artifacts/ with stable filenames for CI collection.
 */

import { execSync } from 'child_process';
import { existsSync, statSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ANDROID_ROOT = join(__dirname, '..');
const ARTIFACTS_DIR = join(ANDROID_ROOT, 'artifacts');

// Color codes for terminal output
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function log(message) {
  console.log(message);
}

function success(message) {
  console.log(`${GREEN}✓${RESET} ${message}`);
}

function info(message) {
  console.log(`${BLUE}ℹ${RESET} ${message}`);
}

function warn(message) {
  console.warn(`${YELLOW}⚠${RESET} ${message}`);
}

function error(message) {
  console.error(`${RED}✗${RESET} ${message}`);
}

function section(title) {
  console.log(`\n${BOLD}${CYAN}━━━ ${title} ━━━${RESET}\n`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, {
      cwd: ANDROID_ROOT,
      stdio: 'inherit',
      ...options
    });
  } catch (error) {
    throw new Error(`Command failed: ${command}`);
  }
}

function fileExists(path) {
  return existsSync(path);
}

function getFileSize(path) {
  if (!fileExists(path)) return null;
  const stats = statSync(path);
  const mb = (stats.size / (1024 * 1024)).toFixed(2);
  return `${mb} MB`;
}

// Ensure artifacts directory exists
function ensureArtifactsDir() {
  if (!fileExists(ARTIFACTS_DIR)) {
    mkdirSync(ARTIFACTS_DIR, { recursive: true });
    info(`Created artifacts directory: ${ARTIFACTS_DIR}`);
  }
}

// Copy APK to artifacts directory with stable filename
function copyToArtifacts(sourcePath, targetFilename) {
  if (!fileExists(sourcePath)) {
    error(`Source APK not found: ${sourcePath}`);
    return null;
  }
  
  ensureArtifactsDir();
  
  const targetPath = join(ARTIFACTS_DIR, targetFilename);
  const resolvedTarget = resolve(targetPath);
  
  try {
    copyFileSync(sourcePath, targetPath);
    success(`Copied to artifacts: ${targetFilename}`);
    return resolvedTarget;
  } catch (err) {
    error(`Failed to copy APK to artifacts: ${err.message}`);
    return null;
  }
}

// Check if signing configuration exists
function hasSigningConfig() {
  const keystorePath = join(ANDROID_ROOT, 'signing', 'release.keystore');
  const propertiesPath = join(ANDROID_ROOT, 'signing', 'keystore.properties');
  
  const hasKeystore = fileExists(keystorePath);
  const hasProperties = fileExists(propertiesPath);
  
  if (!hasKeystore && !hasProperties) {
    return false;
  }
  
  if (!hasKeystore) {
    warn('Signing keystore not found at: signing/release.keystore');
    return false;
  }
  
  if (!hasProperties) {
    warn('Signing properties not found at: signing/keystore.properties');
    return false;
  }
  
  return true;
}

// Validate release configuration
function validateReleaseConfig() {
  const validatorPath = join(__dirname, 'validate-release-config.mjs');
  
  info('Running release configuration validator...\n');
  
  try {
    execSync(`node "${validatorPath}"`, {
      cwd: ANDROID_ROOT,
      stdio: 'inherit'
    });
    return true;
  } catch (error) {
    // Validator already printed detailed errors
    return false;
  }
}

// Build debug APK
function buildDebugApk() {
  section('Building Debug APK');
  
  info('Running Bubblewrap build (debug)...');
  log('Command: bubblewrap build --skipPwaValidation\n');
  
  try {
    exec('bubblewrap build --skipPwaValidation');
    
    // Expected output path from Bubblewrap
    const debugApkPath = join(ANDROID_ROOT, 'app-release-unsigned.apk');
    const resolvedPath = resolve(debugApkPath);
    
    if (fileExists(debugApkPath)) {
      const size = getFileSize(debugApkPath);
      success('Debug APK built successfully!\n');
      
      // Print original location
      console.log(`${BOLD}Debug APK Built:${RESET}`);
      console.log(`  ${resolvedPath}`);
      console.log(`  Size: ${size}\n`);
      
      // Copy to artifacts directory with stable filename
      const artifactPath = copyToArtifacts(debugApkPath, 'consorcio-pro-debug.apk');
      
      if (artifactPath) {
        const artifactSize = getFileSize(artifactPath);
        
        // Print artifact location with clear marker for CI/artifact collection
        console.log(`\n${BOLD}Debug APK Artifact:${RESET}`);
        console.log(`  ${artifactPath}`);
        console.log(`  Size: ${artifactSize}`);
        
        // CI-friendly artifact marker (parseable line with absolute path)
        console.log(`\n[ARTIFACT] DEBUG_APK=${artifactPath}`);
        console.log(`[ARTIFACT_SIZE] DEBUG_APK_SIZE=${artifactSize}\n`);
        
        return artifactPath;
      } else {
        warn('Debug APK built but could not be copied to artifacts directory.');
        return resolvedPath;
      }
    } else {
      error('Debug APK was not found at expected location.');
      log(`  Expected: ${resolvedPath}`);
      log('  The Bubblewrap build may have failed or produced output elsewhere.\n');
      return null;
    }
  } catch (err) {
    error('Debug APK build failed.');
    console.error(`  Error: ${err.message}\n`);
    return null;
  }
}

// Build signed release APK
function buildReleaseApk() {
  section('Building Signed Release APK');
  
  // Validate configuration first
  if (!validateReleaseConfig()) {
    error('Release configuration validation failed.');
    log('\n  The validator detected placeholder values or missing configuration.');
    log('  To enable release builds, you must configure:\n');
    log('  1. frontend/android/twa-manifest.json');
    log('     → Update "host" field with your deployed PWA URL (not placeholder)\n');
    log('  2. frontend/public/.well-known/assetlinks.json');
    log('     → Update SHA-256 fingerprint with your release keystore fingerprint');
    log('     → Extract fingerprint using:');
    log('       keytool -list -v -keystore ./signing/release.keystore -alias consorcio-pro-key\n');
    log('  3. frontend/android/signing/keystore.properties');
    log('     → Create from keystore.properties.example');
    log('     → Fill in your keystore credentials\n');
    log('  See docs/android-apk-build.md for detailed instructions.');
    log('  Debug APK builds are not affected by these validation errors.\n');
    return null;
  }
  
  success('Release configuration validated.\n');
  
  info('Running Gradle assembleRelease...');
  log('Command: cd app && ./gradlew assembleRelease\n');
  
  try {
    exec('cd app && ./gradlew assembleRelease');
    
    // Expected output path from Gradle
    const releaseApkPath = join(ANDROID_ROOT, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
    const resolvedPath = resolve(releaseApkPath);
    
    if (fileExists(releaseApkPath)) {
      const size = getFileSize(releaseApkPath);
      success('Signed release APK built successfully!\n');
      
      // Print original location
      console.log(`${BOLD}Release APK Built:${RESET}`);
      console.log(`  ${resolvedPath}`);
      console.log(`  Size: ${size}\n`);
      
      // Copy to artifacts directory with stable filename
      const artifactPath = copyToArtifacts(releaseApkPath, 'consorcio-pro-release.apk');
      
      if (artifactPath) {
        const artifactSize = getFileSize(artifactPath);
        
        // Print artifact location with clear marker for CI/artifact collection
        console.log(`\n${BOLD}Release APK Artifact:${RESET}`);
        console.log(`  ${artifactPath}`);
        console.log(`  Size: ${artifactSize}`);
        
        // CI-friendly artifact marker (parseable line with absolute path)
        console.log(`\n[ARTIFACT] RELEASE_APK=${artifactPath}`);
        console.log(`[ARTIFACT_SIZE] RELEASE_APK_SIZE=${artifactSize}\n`);
        
        return artifactPath;
      } else {
        warn('Release APK built but could not be copied to artifacts directory.');
        return resolvedPath;
      }
    } else {
      error('Release APK was not found at expected location.');
      log(`  Expected: ${resolvedPath}`);
      log('  The Gradle build may have failed or produced output elsewhere.\n');
      return null;
    }
  } catch (err) {
    error('Release APK build failed.');
    console.error(`  Error: ${err.message}\n`);
    return null;
  }
}

// Main build flow
async function main() {
  console.log(`${BOLD}${CYAN}╔════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║  Lembrete Consórcio Pro - Android APK Build Script    ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚════════════════════════════════════════════════════════╝${RESET}\n`);
  
  info(`Working directory: ${ANDROID_ROOT}`);
  info(`Artifacts directory: ${ARTIFACTS_DIR}\n`);
  
  const results = {
    debug: null,
    release: null
  };
  
  // Always build debug APK
  results.debug = buildDebugApk();
  
  // Conditionally build release APK
  if (hasSigningConfig()) {
    info('Signing configuration detected. Attempting release build...\n');
    results.release = buildReleaseApk();
  } else {
    section('Signed Release APK');
    warn('Signing configuration not found. Skipping release build.');
    log('\n  To build a signed release APK, you must create:');
    log('    1. signing/release.keystore - Your release signing keystore');
    log('    2. signing/keystore.properties - Your signing credentials\n');
    log('  Generate a keystore using:');
    log('    keytool -genkey -v -keystore ./signing/release.keystore \\');
    log('      -alias consorcio-pro-key -keyalg RSA -keysize 2048 -validity 10000\n');
    log('  Then copy signing/keystore.properties.example to signing/keystore.properties');
    log('  and fill in your credentials.\n');
    log('  Additionally, you must configure:');
    log('    - frontend/android/twa-manifest.json (host field)');
    log('    - frontend/public/.well-known/assetlinks.json (SHA-256 fingerprint)\n');
    log('  See docs/android-apk-build.md for detailed instructions.\n');
  }
  
  // Summary
  section('Build Summary');
  
  if (results.debug) {
    success(`Debug APK: ${results.debug}`);
  } else {
    error('Debug APK: Build failed');
  }
  
  if (results.release) {
    success(`Release APK: ${results.release}`);
  } else if (hasSigningConfig()) {
    error('Release APK: Build failed (see errors above)');
  } else {
    info('Release APK: Skipped (no signing configuration)');
  }
  
  console.log('');
  
  // Artifact collection info
  if (results.debug || results.release) {
    section('Artifact Collection');
    log('All built APKs are available in the artifacts directory:\n');
    log(`  ${ARTIFACTS_DIR}/\n`);
    
    if (results.debug) {
      log('  ✓ consorcio-pro-debug.apk');
    }
    if (results.release) {
      log('  ✓ consorcio-pro-release.apk');
    }
    
    log('\nCI systems can collect artifacts from this directory using the');
    log('[ARTIFACT] markers printed above for exact absolute paths.\n');
  }
  
  // Reproducible commands
  section('Reproducible Build Commands');
  
  log('To rebuild manually, run these commands from frontend/android/:\n');
  log(`${BOLD}Debug APK:${RESET}`);
  log('  bubblewrap build --skipPwaValidation');
  log(`  Output: ${ANDROID_ROOT}/app-release-unsigned.apk`);
  log(`  Artifact: ${ARTIFACTS_DIR}/consorcio-pro-debug.apk\n`);
  
  if (hasSigningConfig()) {
    log(`${BOLD}Release APK:${RESET}`);
    log('  node ./scripts/validate-release-config.mjs');
    log('  cd app && ./gradlew assembleRelease');
    log(`  Output: ${ANDROID_ROOT}/app/build/outputs/apk/release/app-release.apk`);
    log(`  Artifact: ${ARTIFACTS_DIR}/consorcio-pro-release.apk\n`);
  }
  
  log(`${BOLD}Or use this helper script:${RESET}`);
  log('  node ./scripts/build-apks.mjs\n');
  
  // Exit code
  if (results.debug) {
    console.log(`${GREEN}${BOLD}✓ Build completed successfully!${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`${RED}${BOLD}✗ Build failed - debug APK could not be created.${RESET}\n`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`\n${RED}${BOLD}Fatal error:${RESET}`, err.message);
  console.error(err.stack);
  process.exit(1);
});
