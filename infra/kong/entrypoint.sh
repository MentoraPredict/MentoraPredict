#!/bin/sh
set -eu

TEMPLATE="/etc/kong/kong.source.yml"
OUTPUT="/etc/kong/kong.yml"
TMP_PEM="/tmp/jwt_public.pem"

if [ -z "${JWT_PUBLIC_KEY:-}" ]; then
  echo "[kong-entrypoint] ERROR: JWT_PUBLIC_KEY environment variable is required."
  exit 1
fi

case "$JWT_PUBLIC_KEY" in
  *"BEGIN PUBLIC KEY"*)
    printf '%s\n' "$JWT_PUBLIC_KEY" > "$TMP_PEM"
    ;;
  *)
    printf '%s' "$JWT_PUBLIC_KEY" | base64 -d > "$TMP_PEM"
    ;;
esac

awk -v pemfile="$TMP_PEM" '
  /^__JWT_PUBLIC_KEY__$/ {
    while ((getline line < pemfile) > 0)
      print "          " line
    close(pemfile)
    next
  }
  { print }
' "$TEMPLATE" > "$OUTPUT"

echo "[kong-entrypoint] Declarative config generated at $OUTPUT"
exec /docker-entrypoint.sh kong docker-start
