#!/bin/sh
set -e

max_attempts=10
attempt=1

until npx prisma migrate deploy --config prisma7.config.ts; do
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Migrations failed after $max_attempts attempts, giving up."
    exit 1
  fi
  echo "Migration attempt $attempt failed (database may not be ready yet), retrying in 3s..."
  attempt=$((attempt + 1))
  sleep 3
done

echo "Migrations applied. Starting application..."
exec "$@"
