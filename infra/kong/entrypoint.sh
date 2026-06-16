#!/bin/sh
set -e

# Load JWT public key
if [ -f "/secrets/public.pem" ]; then
    # Read and indent the public key
    cat /secrets/public.pem | sed 's/^/          /' > /tmp/indented_key.pem
    
    # Replace placeholder in template
    sed '/^[[:space:]]*__JWT_PUBLIC_KEY__/r /tmp/indented_key.pem' /etc/kong/kong.source.yml | sed '/^[[:space:]]*__JWT_PUBLIC_KEY__/d' > /etc/kong/kong.yml
else
    echo "WARNING: /secrets/public.pem not found. JWT verification might fail."
    cp /etc/kong/kong.source.yml /etc/kong/kong.yml
fi

# Start Kong and keep the container alive while Kong runs in the background
kong start

echo 'Kong start exited with status:' $? && echo 'Keeping container alive.'
sleep infinity
