#!/bin/bash
set -e

POSTGRES_HOST=${POSTGRES_HOST:-postgres}
POSTGRES_USER=${POSTGRES_USER:-mp_user}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-mp_secret_change_in_prod}
POSTGRES_DB=${POSTGRES_DB:-mentorapredict}

echo "Waiting for Postgres..."

until pg_isready -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
  sleep 2
done

echo "Postgres ready"
echo "Running seeds..."

export PGPASSWORD="$POSTGRES_PASSWORD"

psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 -f /load_all.sql

echo "Seeds executed successfully"