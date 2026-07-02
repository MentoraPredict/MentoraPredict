#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KEYS_DIR="${SCRIPT_DIR}/../keys"

mkdir -p "$KEYS_DIR"

if [ ! -f "$KEYS_DIR/private.pem" ] || [ ! -f "$KEYS_DIR/public.pem" ]; then
    echo "Generando claves RSA..."

    openssl genrsa -out "$KEYS_DIR/private.pem" 2048
    openssl rsa -in "$KEYS_DIR/private.pem" -pubout -out "$KEYS_DIR/public.pem"

    echo "Claves generadas."
else
    echo "Las claves ya existen."
fi

chmod 644 "$KEYS_DIR/private.pem" "$KEYS_DIR/public.pem"
