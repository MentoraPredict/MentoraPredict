#!/usr/bin/env bash
# Generates RS256 key pair and writes JWT_PRIVATE_KEY / JWT_PUBLIC_KEY (base64) to .env
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="${ROOT_DIR}/.env"
TMP_DIR="$(mktemp -d)"

trap 'rm -rf "$TMP_DIR"' EXIT

PRIVATE_PEM="${TMP_DIR}/jwt_private.pem"
PUBLIC_PEM="${TMP_DIR}/jwt_public.pem"

echo "[generate-keys] Generating RS256 key pair (2048 bits)..."
openssl genrsa -out "$PRIVATE_PEM" 2048 2>/dev/null
openssl rsa -in "$PRIVATE_PEM" -pubout -out "$PUBLIC_PEM" 2>/dev/null

if base64 --help 2>&1 | grep -q "wrap"; then
  PRIVATE_B64="$(base64 -w 0 "$PRIVATE_PEM")"
  PUBLIC_B64="$(base64 -w 0 "$PUBLIC_PEM")"
else
  PRIVATE_B64="$(base64 < "$PRIVATE_PEM" | tr -d '\n')"
  PUBLIC_B64="$(base64 < "$PUBLIC_PEM" | tr -d '\n')"
fi

touch "$ENV_FILE"

upsert_env() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
    else
      sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
    fi
  else
    printf '%s=%s\n' "$key" "$value" >> "$ENV_FILE"
  fi
}

upsert_env "JWT_PRIVATE_KEY" "$PRIVATE_B64"
upsert_env "JWT_PUBLIC_KEY" "$PUBLIC_B64"

echo "[generate-keys] Keys written to ${ENV_FILE}"
echo "[generate-keys] JWT_PRIVATE_KEY and JWT_PUBLIC_KEY stored as base64-encoded PEM."
