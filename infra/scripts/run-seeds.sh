#!/bin/sh
set -e

POSTGRES_HOST=${POSTGRES_HOST:-postgres}
POSTGRES_USER=${POSTGRES_USER:-mp_user}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-mp_secret_change_in_prod}
POSTGRES_DB=${POSTGRES_DB:-mentorapredict}
SEEDS_DIR=${SEEDS_DIR:-/seeds/postgres}
SEED_FORCE_RUN=${SEED_FORCE_RUN:-false}

export PGPASSWORD="$POSTGRES_PASSWORD"

psql_cmd() {
  psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" "$@"
}

echo "Waiting for Postgres..."

until pg_isready -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
  sleep 2
done

echo "Postgres ready"

echo "Ensuring seed_history table exists..."

psql_cmd -v ON_ERROR_STOP=1 -c "
CREATE TABLE IF NOT EXISTS seed_history (
    id serial primary key,
    seed_file varchar(255),
    checksum varchar(64),
    executed_at timestamp default now(),
    updated_at timestamp default now()
);

ALTER TABLE seed_history
    ADD COLUMN IF NOT EXISTS seed_file varchar(255),
    ADD COLUMN IF NOT EXISTS checksum varchar(64),
    ADD COLUMN IF NOT EXISTS executed_at timestamp default now(),
    ADD COLUMN IF NOT EXISTS updated_at timestamp default now();

DELETE FROM seed_history
WHERE seed_file IS NULL
   OR checksum IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS seed_history_seed_file_key
ON seed_history (seed_file);

ALTER TABLE seed_history
    ALTER COLUMN seed_file SET NOT NULL,
    ALTER COLUMN checksum SET NOT NULL;
"

echo "Running seeds..."

if [ ! -d "$SEEDS_DIR" ]; then
  echo "Seeds directory not found: $SEEDS_DIR"
  exit 1
fi

for file in $(find "$SEEDS_DIR" -maxdepth 1 -type f -name "*.sql" | sort); do
  filename=$(basename "$file")
  checksum=$(sha256sum "$file" | awk '{print $1}')

  stored_checksum=$(psql_cmd -tAc "
    SELECT checksum
    FROM seed_history
    WHERE seed_file = '$filename';
  ")

  if [ "$SEED_FORCE_RUN" != "true" ] && [ "$stored_checksum" = "$checksum" ]; then
    echo "Skipping $filename, no changes"
    continue
  fi

  if [ "$SEED_FORCE_RUN" = "true" ]; then
    echo "Force-running seed: $filename"
  elif [ -z "$stored_checksum" ]; then
    echo "Running new seed: $filename"
  else
    echo "Re-running changed seed: $filename"
  fi

  psql_cmd -v ON_ERROR_STOP=1 -f "$file"

  psql_cmd -v ON_ERROR_STOP=1 -c "
    INSERT INTO seed_history (seed_file, checksum, executed_at, updated_at)
    VALUES ('$filename', '$checksum', now(), now())
    ON CONFLICT (seed_file)
    DO UPDATE SET
      checksum = EXCLUDED.checksum,
      updated_at = now();
  "

  echo "$filename executed successfully"
done

echo "Seed process completed"
