#!/usr/bin/env bash
set -euo pipefail

# Capture App Store screenshots on iPhone 15 Pro Max simulator (6.7").
# Requires: Xcode, booted simulator, app running in foreground.

DEVICE="iPhone 15 Pro Max"
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/assets/screenshots/ios-6.7"

mkdir -p "$OUT_DIR"

UDID=$(xcrun simctl list devices available | grep "$DEVICE" | head -1 | grep -oE '[0-9A-F-]{36}' || true)

if [[ -z "$UDID" ]]; then
  echo "Simulator '$DEVICE' bulunamadı. Xcode → Window → Devices and Simulators ile oluştur."
  exit 1
fi

echo "Simulator: $DEVICE ($UDID)"
echo "Uygulamayı simülatörde aç, her ekranda Enter'a bas."
echo "Çıktı: $OUT_DIR"
echo ""

screens=(
  "01-home"
  "02-players"
  "03-question"
  "04-game-end"
  "05-stats"
)

for name in "${screens[@]}"; do
  read -r -p "Ekran hazır: $name — Enter ile yakala..."
  xcrun simctl io "$UDID" screenshot "$OUT_DIR/$name.png"
  echo "  → $OUT_DIR/$name.png"
done

echo ""
echo "Tamamlandı. App Store Connect → 6.7\" screenshots alanına yükle."
