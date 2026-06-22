#!/bin/bash
set -e

echo "Waiting for Postgres..."

until pg_isready -h postgres -U ${POSTGRES_USER:-mp_user} -d ${POSTGRES_DB:-mentorapredict}; do
  sleep 2
done

echo "Postgres ready"

echo "Running seeds..."

export PGPASSWORD=${POSTGRES_PASSWORD:-mp_secret_change_in_prod}

psql -h postgres -U ${POSTGRES_USER:-mp_user} -d ${POSTGRES_DB:-mentorapredict} -f /load_all.sql

echo "Seeds executed successfully"