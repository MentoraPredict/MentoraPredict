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

# CHECK IF SEEDS ALREADY RUN
RESULT=$(psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'seed_history'
);
")

if [ "$RESULT" != "t" ]; then
  echo "Running seeds for first time..."

  psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    -v ON_ERROR_STOP=1 -f /load_all.sql

  psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
    CREATE TABLE seed_history (
        id serial primary key,
        executed_at timestamp default now()
    );

    INSERT INTO seed_history DEFAULT VALUES;
  "

  echo "Seeds executed successfully"
else
  echo "Seeds already executed, skipping..."
fi