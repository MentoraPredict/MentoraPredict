#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/MentoraPredict/MentoraPredict.git"
DEPLOY_DIR="/opt/mentorapredict"
BRANCH="dev"
COMPOSE_FILE="infra/docker/docker-compose.dev.yml"
ENV_FILE="infra/.env"
INFRA_KEYS_DIR="infra/keys"
KEYS_GENERATOR="infra/kong/generate-keys.sh"
PROJECT_NAME="mentorapredict"

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

cleanup_old_containers() {
    cd "$DEPLOY_DIR"
    echo "[CLEAN] Removing existing project containers"
    docker compose -p "$PROJECT_NAME" \
        -f "$COMPOSE_FILE" \
        --env-file "$ENV_FILE" \
        down --remove-orphans 2>/dev/null || true
    echo "[CLEAN] Cleanup completed"
}

start_infrastructure() {
    cd "$DEPLOY_DIR"
    echo "[INFRA] Starting infrastructure services (postgres, mongo, redis)"
    docker compose -p "$PROJECT_NAME" \
        -f "$COMPOSE_FILE" \
        --env-file "$ENV_FILE" \
        up -d postgres mongo redis
}

wait_for_postgres() {
    echo "[WAIT DB READY]"
    for i in {1..20}; do
        docker exec "$(docker ps -q --filter name=postgres)" pg_isready && break
        echo "waiting postgres..."
        sleep 3
    done
}

run_migrations() {
    cd "$DEPLOY_DIR"
    echo "[MIGRATIONS - SAFE ORDER]"
    docker compose -p "$PROJECT_NAME" \
        -f "$COMPOSE_FILE" \
        --env-file "$ENV_FILE" \
        run --rm auth-service npm run migration:run || true
    docker compose -p "$PROJECT_NAME" \
        -f "$COMPOSE_FILE" \
        --env-file "$ENV_FILE" \
        run --rm user-service npm run migration:run || true
    docker compose -p "$PROJECT_NAME" \
        -f "$COMPOSE_FILE" \
        --env-file "$ENV_FILE" \
        run --rm academic-service npm run migration:run || true
    docker compose -p "$PROJECT_NAME" \
        -f "$COMPOSE_FILE" \
        --env-file "$ENV_FILE" \
        run --rm analytics-service npm run migration:run || true
}

start_monitoring() {
    cd "$DEPLOY_DIR"
    echo "[MONITORING] Starting monitoring stack (Prometheus, Grafana, Loki, Promtail)"
    docker compose -p "$PROJECT_NAME" \
        -f "infra/monitoring/docker-compose.monitoring.yml" \
        --env-file "$ENV_FILE" \
        up -d || echo "[MONITORING] Monitoring stack not available — skipping"
}

start_services() {
    cd "$DEPLOY_DIR"
    echo "[BUILD & START SERVICES]"
    docker compose -p "$PROJECT_NAME" \
        -f "$COMPOSE_FILE" \
        --env-file "$ENV_FILE" \
        up -d --build
}

run_seeds() {
    cd "$DEPLOY_DIR"
    echo "[SEEDS] Running database seeds (idempotent safe mode)"
    docker compose -p "$PROJECT_NAME" \
        -f "$COMPOSE_FILE" \
        --env-file "$ENV_FILE" \
        run --rm seed-loader || true
}

cleanup_docker() {
    echo "[CLEANUP] Removing unused Docker artifacts"
    docker system prune -af --filter "until=24h" || true
}

show_status() {
    echo ""
    echo "[OK] Setup completed"
    echo ""
    echo "Service status:"
    docker compose -p "$PROJECT_NAME" \
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
    echo "To view logs: docker compose -p $PROJECT_NAME -f $COMPOSE_FILE logs -f"
    echo "To stop all:   docker compose -p $PROJECT_NAME -f $COMPOSE_FILE down"
}

main() {
    preflight
    setup_repo
    setup_keys
    cleanup_old_containers
    start_infrastructure
    wait_for_postgres
    run_migrations
    start_services
    run_seeds
    start_monitoring
    cleanup_docker
    show_status
}

main
