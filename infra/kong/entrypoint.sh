#!/bin/sh
set -eu

TEMPLATE="/etc/kong/kong.source.yml"
OUTPUT="/etc/kong/kong.yml"
TMP_PEM="/tmp/jwt_public.pem"
TMP_TEMPLATE="/tmp/kong-template-normalized.yml"

if [ -z "${JWT_PUBLIC_KEY:-}" ]; then
  if [ -n "${JWT_PUBLIC_KEY_PATH:-}" ] && [ -f "${JWT_PUBLIC_KEY_PATH}" ]; then
    JWT_PUBLIC_KEY="$(cat "${JWT_PUBLIC_KEY_PATH}")"
  fi
fi

if [ -z "${JWT_PUBLIC_KEY:-}" ]; then
  echo "[kong-entrypoint] ERROR: JWT_PUBLIC_KEY environment variable is required."
  exit 1
fi

case "$JWT_PUBLIC_KEY" in
  *"BEGIN PUBLIC KEY"*)
    printf '%s\n' "$JWT_PUBLIC_KEY" | tr -d '\r' > "$TMP_PEM"
    ;;
  *)
    printf '%s' "$JWT_PUBLIC_KEY" | base64 -d | tr -d '\r' > "$TMP_PEM"
    ;;
esac

tr -d '\r' < "$TEMPLATE" > "$TMP_TEMPLATE"

awk -v pemfile="$TMP_PEM" '
  /^[[:space:]]*__JWT_PUBLIC_KEY__$/ {
    match($0, /^[[:space:]]*/)
    indent = substr($0, RSTART, RLENGTH)
    while ((getline line < pemfile) > 0)
      print indent line
    close(pemfile)
    next
  }
  { print }
' "$TMP_TEMPLATE" > "$OUTPUT"

# Normalize line endings after generation so Kong never sees CR characters.
tr -d '\r' < "$OUTPUT" > "${OUTPUT}.tmp"
mv "${OUTPUT}.tmp" "$OUTPUT"

echo "[kong-entrypoint] Declarative config generated at $OUTPUT"
exec /docker-entrypoint.sh kong docker-start
