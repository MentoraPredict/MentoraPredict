#!/bin/sh
set -e

JWT_PUBLIC_KEY_FILE="/tmp/public.pem"
JWT_PRIVATE_KEY_FILE="/tmp/private.pem"

if [ -n "$JWT_PUBLIC_KEY" ]; then
    echo "$JWT_PUBLIC_KEY" | base64 -d > "$JWT_PUBLIC_KEY_FILE"
elif [ -f "/secrets/public.pem" ]; then
    cp /secrets/public.pem "$JWT_PUBLIC_KEY_FILE"
else
    echo "WARNING: JWT_PUBLIC_KEY not set and /secrets/public.pem not found."
fi

if [ -n "$JWT_PRIVATE_KEY" ]; then
    echo "$JWT_PRIVATE_KEY" | base64 -d > "$JWT_PRIVATE_KEY_FILE"
elif [ -f "/secrets/private.pem" ]; then
    cp /secrets/private.pem "$JWT_PRIVATE_KEY_FILE"
else
    echo "WARNING: JWT_PRIVATE_KEY not set and /secrets/private.pem not found."
fi

if [ -f "$JWT_PUBLIC_KEY_FILE" ]; then
    cat "$JWT_PUBLIC_KEY_FILE" | sed 's/^/          /' > /tmp/indented_key.pem
    sed '/^[[:space:]]*__JWT_PUBLIC_KEY__/r /tmp/indented_key.pem' /etc/kong/kong-template.yml | sed '/^[[:space:]]*__JWT_PUBLIC_KEY__/d' > /etc/kong/kong.yml
else
    echo "WARNING: No JWT public key available. JWT verification will fail."
    cp /etc/kong/kong-template.yml /etc/kong/kong.yml
fi

WEB_UPSTREAM_PORT="${WEB_UPSTREAM_PORT:-80}"
sed -i "s/__WEB_UPSTREAM_PORT__/${WEB_UPSTREAM_PORT}/g" /etc/kong/kong.yml

kong start

echo 'Kong start exited with status:' $?

# `kong start` daemonizes and returns almost immediately, so this script
# reaching this point does not mean Kong is actually still running (e.g. it
# can be OOM-killed moments later). Poll `kong health` and exit non-zero the
# first time it fails, instead of `sleep infinity`, so the container actually
# stops and gets restarted (restart policy is set on the service) rather than
# staying "Up" forever with a dead Kong process inside.
while true; do
    sleep 5
    if ! kong health >/dev/null 2>&1; then
        echo "Kong health check failed — exiting so the container restarts."
        exit 1
    fi
done
