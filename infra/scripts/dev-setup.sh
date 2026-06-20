#!/usr/bin/env bash
# =============================================================================
# MentoraPredict — Dev Environment Setup Script
# =============================================================================
# Description:
#   One-command setup script for the dev EC2 instance.
#   Clones/updates the repo, creates .env, generates JWT keys, and starts
#   all services via docker-compose.dev.yml.
#
# Usage:
#   bash infra/scripts/dev-setup.sh
#
# Requirements:
#   - Docker + Docker Compose v2 installed
#   - Git installed
#   - OpenSSL installed
# =============================================================================

set -euo pipefail

# ─── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()  { echo -e "${CYAN}[INFO]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ─── Configuration ───────────────────────────────────────────────────────────
REPO_URL="https://github.com/MentoraPredict/MentoraPredict.git"
DEPLOY_DIR="/opt/mentorapredict"
BRANCH="dev"
COMPOSE_FILE="infra/docker/docker-compose.dev.yml"
ENV_FILE="infra/.env"
ENV_EXAMPLE="infra/.env.example"
INFRA_KEYS_DIR="infra/keys"
KEYS_GENERATOR="infra/kong/generate-keys.sh"

# ─── Pre-flight checks ───────────────────────────────────────────────────────
preflight() {
    log_info "Running pre-flight checks..."

    if ! command -v docker &>/dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! docker compose version &>/dev/null; then
        log_error "Docker Compose v2 is not available. Please install Docker Compose."
        exit 1
    fi

    if ! command -v git &>/dev/null; then
        log_error "Git is not installed. Please install Git first."
        exit 1
    fi

    if ! command -v openssl &>/dev/null; then
        log_error "OpenSSL is not installed. Please install OpenSSL first."
        exit 1
    fi

    log_ok "All pre-flight checks passed."
}

# ─── Clone / update repository ───────────────────────────────────────────────
setup_repo() {
    if [ -d "$DEPLOY_DIR/.git" ]; then
        log_info "Repository already exists at $DEPLOY_DIR. Fetching latest changes..."
        cd "$DEPLOY_DIR"
        git fetch origin
        git reset --hard "origin/$BRANCH"
        log_ok "Repository updated to latest $BRANCH."
    else
        log_info "Cloning repository to $DEPLOY_DIR..."
        sudo mkdir -p "$DEPLOY_DIR"
        sudo chown "$(whoami):$(whoami)" "$DEPLOY_DIR"
        git clone --branch "$BRANCH" "$REPO_URL" "$DEPLOY_DIR"
        cd "$DEPLOY_DIR"
        log_ok "Repository cloned."
    fi
}

# ─── Create .env from template ───────────────────────────────────────────────
setup_env() {
    if [ -f "$ENV_FILE" ]; then
        log_info ".env file already exists at $ENV_FILE. Skipping..."
    else
        log_info "Creating .env from template..."
        if [ -f "$ENV_EXAMPLE" ]; then
            cp "$ENV_EXAMPLE" "$ENV_FILE"
            log_ok ".env created from $ENV_EXAMPLE."
            log_warn "Review $ENV_FILE and update any secrets before running in production."
        else
            log_error "$ENV_EXAMPLE not found. Cannot create .env."
            exit 1
        fi
    fi
}

# ─── Generate JWT RSA keys ───────────────────────────────────────────────────
setup_keys() {
    if [ -f "$INFRA_KEYS_DIR/private.pem" ] && [ -f "$INFRA_KEYS_DIR/public.pem" ]; then
        log_info "JWT keys already exist. Skipping..."
    else
        log_info "Generating JWT RSA key pair..."
        if [ -f "$KEYS_GENERATOR" ]; then
            bash "$KEYS_GENERATOR"
            log_ok "JWT keys generated at $INFRA_KEYS_DIR/."
        else
            log_error "Key generator script not found at $KEYS_GENERATOR."
            exit 1
        fi
    fi
}

# ─── Start all services ──────────────────────────────────────────────────────
start_services() {
    log_info "Starting all services with docker-compose.dev.yml..."
    cd "$DEPLOY_DIR"

    docker compose -p mentorapredict \
        -f "$COMPOSE_FILE" \
        --env-file "$ENV_FILE" \
        up -d --build

    log_ok "All services started successfully."
}

# ─── Show service status ─────────────────────────────────────────────────────
show_status() {
    echo ""
    log_info "Service status:"
    docker compose -p mentorapredict \
        -f "$COMPOSE_FILE" \
        --env-file "$ENV_FILE" \
        ps

    echo ""
    log_info "Access endpoints:"
    echo "  Kong Proxy  : http://localhost:8000"
    echo "  Kong Admin  : http://localhost:8001"
    echo "  Konga UI    : http://localhost:1337"
    echo "  Mongo Express: http://localhost:8082"
    echo "  Redis Commander: http://localhost:8081"
    echo ""
    log_info "To view logs: docker compose -p mentorapredict -f $COMPOSE_FILE logs -f"
    log_info "To stop all:   docker compose -p mentorapredict -f $COMPOSE_FILE down"
}

# ─── Main ────────────────────────────────────────────────────────────────────
main() {
    echo ""
    echo -e "${CYAN}============================================${NC}"
    echo -e "${CYAN}  MentoraPredict — Dev Environment Setup   ${NC}"
    echo -e "${CYAN}============================================${NC}"
    echo ""

    preflight
    setup_repo
    setup_env
    setup_keys
    start_services
    show_status

    echo ""
    log_ok "Dev environment setup complete."
}

main
