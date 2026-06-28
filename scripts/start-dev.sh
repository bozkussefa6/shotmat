#!/usr/bin/env bash
set -euo pipefail

# Expo sometimes picks Docker/VPN interfaces (e.g. 192.168.64.x) on macOS.
# Prefer the Wi-Fi/Ethernet LAN IP so Expo Go and the iOS simulator can reach Metro.
HOST=""
for iface in en0 en1; do
  IP=$(ipconfig getifaddr "$iface" 2>/dev/null || true)
  if [[ -n "$IP" && "$IP" != 192.168.64.* ]]; then
    HOST="$IP"
    break
  fi
done

if [[ -n "$HOST" ]]; then
  export REACT_NATIVE_PACKAGER_HOSTNAME="$HOST"
  echo "Using packager hostname: $HOST"
fi

exec npx expo start --host lan "$@"
