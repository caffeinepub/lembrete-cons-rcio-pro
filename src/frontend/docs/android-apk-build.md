# Android APK Build Guide - Lembrete Consórcio Pro

Complete step-by-step guide to build debug and signed release APK files for the Lembrete Consórcio Pro PWA.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Signing Configuration](#signing-configuration)
4. [Digital Asset Links Setup](#digital-asset-links-setup)
5. [Building APKs](#building-apks)
6. [Output Artifacts](#output-artifacts)
7. [Testing Checklist](#testing-checklist)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

Install the following tools before proceeding:

1. **Node.js** (v16 or higher)
   ```bash
   node --version  # Should be v16+
   ```

2. **Java Development Kit (JDK)** 11 or higher
   ```bash
   java -version  # Should be 11+
   ```

3. **Android SDK**
   - Option A: Install Android Studio (includes SDK)
   - Option B: Install command-line tools only
   
   Set `ANDROID_HOME` environment variable:
   ```bash
   # Linux/macOS
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   
   # Windows
   set ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
   set PATH=%PATH%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools
   ```

4. **Bubblewrap CLI**
   ```bash
   npm install -g @bubblewrap/cli
   bubblewrap --version
   ```

### Deployed PWA

Your PWA **must be deployed and accessible** at a public HTTPS URL before building the APK. The wrapper will point to this deployed URL.

---

## Initial Setup

### Step 1: Configure TWA Manifest

Edit `frontend/android/twa-manifest.json` and update the `host` field with your deployed PWA URL:

