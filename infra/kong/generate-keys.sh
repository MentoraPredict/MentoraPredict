#!/usr/bin/env bash
set -e

mkdir -p infra/keys

if [ ! -f infra/keys/private.pem ] || [ ! -f infra/keys/public.pem ]; then
    echo "Generando claves RSA..."

    openssl genrsa -out infra/keys/private.pem 2048
    openssl rsa -in infra/keys/private.pem -pubout -out infra/keys/public.pem

    echo "Claves generadas."
else
    echo "Las claves ya existen."
fi