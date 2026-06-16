#!/bin/sh
set -eu

TEMPLATE="/etc/kong/kong-template.yml"
OUTPUT="/etc/kong/kong.yml"
TMP_PEM="/tmp/jwt_public.pem"

echo "[kong-entrypoint] Generating kong.yml from template..."

# -------------------------
# Load JWT key
# -------------------------
if [ -z "${JWT_PUBLIC_KEY:-}" ]; then
  if [ -n "${JWT_PUBLIC_KEY_PATH:-}" ] && [ -f "${JWT_PUBLIC_KEY_PATH}" ]; then
    JWT_PUBLIC_KEY="$(cat "${JWT_PUBLIC_KEY_PATH}")"
  fi
fi

if [ -z "${JWT_PUBLIC_KEY:-}" ]; then
  echo "[kong-entrypoint] ERROR: JWT_PUBLIC_KEY is required"
  exit 1
fi

# -------------------------
# Decode PEM if needed
# -------------------------
case "$JWT_PUBLIC_KEY" in
  *"BEGIN PUBLIC KEY"*|*"BEGIN RSA PUBLIC KEY"*)
    printf '%s\n' "$JWT_PUBLIC_KEY" | tr -d '\r' > "$TMP_PEM"
    ;;
  *)
    printf '%s' "$JWT_PUBLIC_KEY" | base64 -d | tr -d '\r' > "$TMP_PEM"
    ;;
esac

# -------------------------
# Inject key into template → kong.yml
# -------------------------
awk -v pemfile="$TMP_PEM" '
  {
    if ($0 ~ /__JWT_PUBLIC_KEY__/) {
      match($0, /^[[:space:]]*/)
      indent = substr($0, RSTART, RLENGTH)
      while ((getline line < pemfile) > 0)
        print indent line
      close(pemfile)
      next
    }
    print
  }
' "$TEMPLATE" > "$OUTPUT"

echo "[kong-entrypoint] kong.yml generated at $OUTPUT"

# -------------------------
# START KONG
# -------------------------
exec /docker-entrypoint.sh kong start