#!/bin/sh

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
