#!/usr/bin/env bash
# =============================================================================
# MentoraPredict — Dev Environment Setup Script
# =============================================================================
# Description:
#   One-command setup script for the dev EC2 instance.
#   Clones/updates the repo, generates JWT keys, pulls Docker images,
#   and starts all services via docker-compose.dev.yml.
#
# Usage:
#   bash infra/scripts/dev-setup.sh
#
# Requirements:
#   - Docker + Docker Compose v2 installed
#   - Git installed
#   - OpenSSL installed
#   - .env file at infra/.env (create from infra/.env.example)
# =============================================================================

set -euo pipefail

REPO_URL="https://github.com/MentoraPredict/MentoraPredict.git"
DEPLOY_DIR="/opt/mentorapredict"
BRANCH="dev"
COMPOSE_FILE="infra/docker/docker-compose.dev.yml"
ENV_FILE="infra/.env"
INFRA_KEYS_DIR="infra/keys"
KEYS_GENERATOR="infra/kong/generate-keys.sh"

preflight() {
    if ! command -v docker &>/dev/null; then
        echo "[ERROR] Docker is not installed."
        exit 1
    fi
    if ! docker compose version &>/dev/null; then
        echo "[ERROR] Docker Compose v2 is not available."
        exit 1
    fi
    if ! command -v git &>/dev/null; then
        echo "[ERROR] Git is not installed."
        exit 1
    fi
    if ! command -v openssl &>/dev/null; then
        echo "[ERROR] OpenSSL is not installed."
        exit 1
    fi
    if [ ! -f "$DEPLOY_DIR/$ENV_FILE" ]; then
        echo "[ERROR] .env file not found at $DEPLOY_DIR/$ENV_FILE."
        echo "  Create it from the template: cp infra/.env.example infra/.env"
        exit 1
    fi
}

setup_repo() {
    if [ -d "$DEPLOY_DIR/.git" ]; then
        cd "$DEPLOY_DIR"
        git fetch origin
        git reset --hard "origin/$BRANCH"
    else
        sudo mkdir -p "$DEPLOY_DIR"
        sudo chown "$(whoami):$(whoami)" "$DEPLOY_DIR"
        git clone --branch "$BRANCH" "$REPO_URL" "$DEPLOY_DIR"
        cd "$DEPLOY_DIR"
    fi
}

setup_keys() {
    if [ ! -f "$INFRA_KEYS_DIR/private.pem" ] || [ ! -f "$INFRA_KEYS_DIR/public.pem" ]; then
        bash "$KEYS_GENERATOR"
    fi
}

start_services() {
    cd "$DEPLOY_DIR"
    docker compose -p mentorapredict \
        -f "$COMPOSE_FILE" \
        --env-file "$ENV_FILE" \
        pull
    docker compose -p mentorapredict \
        -f "$COMPOSE_FILE" \
        --env-file "$ENV_FILE" \
        up -d
}

show_status() {
    echo ""
    echo "Service status:"
    docker compose -p mentorapredict \
        -f "$COMPOSE_FILE" \
        --env-file "$ENV_FILE" \
        ps
    echo ""
    echo "Access endpoints:"
    echo "  Kong Proxy  : http://localhost:8000"
    echo "  Kong Admin  : http://localhost:8001"
    echo "  Konga UI    : http://localhost:1337"
    echo "  Mongo Express: http://localhost:8082"
    echo "  Redis Commander: http://localhost:8081"
    echo ""
    echo "To view logs: docker compose -p mentorapredict -f $COMPOSE_FILE logs -f"
    echo "To stop all:   docker compose -p mentorapredict -f $COMPOSE_FILE down"
}

main() {
    preflight
    setup_repo
    setup_keys
    start_services
    show_status
}

main
