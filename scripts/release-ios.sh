#!/usr/bin/env bash
set -euo pipefail

# Production iOS build via EAS.
# Requires: eas-cli, eas login, Apple Developer account.

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v eas &>/dev/null; then
  echo "Installing eas-cli..."
  npm install -g eas-cli
fi

echo "==> EAS production build (iOS)"
echo "İlk build için interaktif mod gerekir (Apple credentials)."
echo "Detay: docs/EAS_BUILD.md"
echo ""

if eas build --platform ios --profile production 2>&1; then
  echo ""
  echo "Build başladı. Durumu: eas build:list"
else
  echo ""
  echo "Build başlatılamadı. Muhtemel neden: Apple credentials kurulmamış."
  echo "Çalıştır: eas build --platform ios --profile production"
  echo "Rehber: docs/EAS_BUILD.md"
  exit 1
fi
