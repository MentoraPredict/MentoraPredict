#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────
# Paths (IMPORTANTE: el script está en kong/)
# ─────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"   # 👉 sube de /kong a /infra

TEMPLATE="$ROOT_DIR/kong/kong-template.yml"
OUTPUT="$ROOT_DIR/kong/kong.yml"

KEY_DIR="$ROOT_DIR/keys"
PRIVATE_KEY="$KEY_DIR/private.pem"
PUBLIC_KEY="$KEY_DIR/public.pem"

mkdir -p "$KEY_DIR"

# ─────────────────────────────────────────────
# 1. Generar keys si no existen (LOCAL ONLY)
# ─────────────────────────────────────────────
if [ ! -f "$PRIVATE_KEY" ] || [ ! -f "$PUBLIC_KEY" ]; then
  echo "🔐 Generating RSA keys in $KEY_DIR..."

  openssl genrsa -out "$PRIVATE_KEY" 2048 >/dev/null 2>&1
  openssl rsa -in "$PRIVATE_KEY" -pubout -out "$PUBLIC_KEY" >/dev/null 2>&1

  echo "✔ Keys created at: $KEY_DIR"
fi

# ─────────────────────────────────────────────
# 2. Cargar PUBLIC KEY (CI/CD o local file)
# ─────────────────────────────────────────────
if [ -n "${JWT_PUBLIC_KEY:-}" ]; then
  echo "✔ Using JWT_PUBLIC_KEY from ENV / GitHub Secrets"
  KEY="$JWT_PUBLIC_KEY"
else
  echo "✔ Using local public.pem"
  KEY="$(cat "$PUBLIC_KEY")"
fi

# ─────────────────────────────────────────────
# 3. Generar kong.yml sin romper YAML
# ─────────────────────────────────────────────
awk -v key="$KEY" '
  {
    if ($0 ~ /__JWT_PUBLIC_KEY__/) {
      split(key, lines, "\n")
      for (i in lines) {
        if (length(lines[i]) > 0)
          print "          " lines[i]
      }
      next
    }
    print
  }
' "$TEMPLATE" > "$OUTPUT"

echo "✔ kong.yml generated at $OUTPUT"