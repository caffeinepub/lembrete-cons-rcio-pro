# Android APK Wrapper for Lembrete Consórcio Pro

This directory contains the configuration and setup for building Android APK packages of the Lembrete Consórcio Pro PWA using a Trusted Web Activity (TWA) wrapper approach.

## Overview

The Android wrapper uses **Bubblewrap CLI** to generate a TWA-based Android project that wraps the deployed PWA. This approach:

- ✅ Preserves all PWA functionality (offline-first, service worker, local storage)
- ✅ Enables native WhatsApp deep linking on Android
- ✅ Allows distribution via APK files (sideloading or private distribution)
- ✅ Does NOT modify the runtime app behavior or features
- ✅ Maintains the existing backend integration (optional health check only)

## Important Notes

- **Runtime features must NOT be modified** to build APKs
- The wrapper only packages the existing PWA; all app logic remains in the frontend code
- Signing credentials are local-only and NEVER committed to the repository

## Prerequisites

Before building APKs, ensure you have:

1. **Node.js** (v16 or higher)
2. **Java Development Kit (JDK)** 11 or higher
3. **Android SDK** with Build Tools (install via Android Studio or command-line tools)
4. **Bubblewrap CLI**: `npm install -g @bubblewrap/cli`

See [docs/android-apk-build.md](../docs/android-apk-build.md) for detailed installation instructions.

## Quick Start

### One-Command Build (Recommended)

Build both debug and release APKs automatically:

