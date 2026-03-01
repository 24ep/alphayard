#!/bin/sh

set -eu

# OIDC key bootstrap (secure auto-generate if missing)
# Priority:
# 1) Explicit OIDC_PRIVATE_KEY / OIDC_PUBLIC_KEY env values
# 2) Explicit OIDC_*_KEY_PATH files
# 3) Auto-generate into OIDC_KEY_DIR (default: /app/secrets/oidc)
if [ -z "${OIDC_PRIVATE_KEY:-}" ] && [ -z "${OIDC_PUBLIC_KEY:-}" ]; then
  KEY_DIR="${OIDC_KEY_DIR:-/app/secrets/oidc}"
  PRIVATE_KEY_PATH="${OIDC_PRIVATE_KEY_PATH:-$KEY_DIR/private.key}"
  PUBLIC_KEY_PATH="${OIDC_PUBLIC_KEY_PATH:-$KEY_DIR/public.key}"

  if [ ! -s "$PRIVATE_KEY_PATH" ] || [ ! -s "$PUBLIC_KEY_PATH" ]; then
    echo "[entrypoint] OIDC keys not found. Generating RSA key pair..."
    umask 077
    mkdir -p "$KEY_DIR"
    openssl genrsa -out "$PRIVATE_KEY_PATH" 2048
    openssl rsa -in "$PRIVATE_KEY_PATH" -pubout -out "$PUBLIC_KEY_PATH"
    chmod 600 "$PRIVATE_KEY_PATH" "$PUBLIC_KEY_PATH"
    echo "[entrypoint] OIDC key pair generated at $KEY_DIR"
  else
    echo "[entrypoint] Reusing existing OIDC key pair at $KEY_DIR"
  fi

  export OIDC_PRIVATE_KEY_PATH="$PRIVATE_KEY_PATH"
  export OIDC_PUBLIC_KEY_PATH="$PUBLIC_KEY_PATH"
fi

echo "[entrypoint] Pushing database schema..."
npx prisma db push --accept-data-loss || {
  echo "[entrypoint] db push failed, retrying in 3s..."
  sleep 3
  npx prisma db push --accept-data-loss || echo "[entrypoint] WARNING: db push failed"
}

echo "[entrypoint] Running production seed..."
node prisma/seed-prod.js

echo "[entrypoint] Starting application..."
exec "$@"
