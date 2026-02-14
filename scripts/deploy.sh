#!/usr/bin/env bash
#
# Zero-downtime deployment to demo-box (OrbStack VM)
# Following md-cte-crosswalk deploy pattern
#
# Usage:
#   ./scripts/deploy.sh api        # Deploy API only
#   ./scripts/deploy.sh frontend   # Deploy frontend only
#   ./scripts/deploy.sh all        # Deploy all services
#   ./scripts/deploy.sh rollback   # Rollback last API deploy
#
# Strategy: Pre-build the new image while old container serves traffic,
# then do a fast container swap (~2-5s gap instead of 30-60s).

set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────────
DEMO_BOX="demo-box"
REMOTE_DIR="/home/demo/apps/ai-workshop-cs"
ORB="orb -m ${DEMO_BOX} -u root"
LIVE_URL="https://aiworkshop.edinfinite.com"
HEALTH_RETRIES=20
HEALTH_INTERVAL=3

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ─── Helpers ──────────────────────────────────────────────────────────

info()  { echo -e "${BLUE}▸${NC} $*"; }
ok()    { echo -e "${GREEN}✓${NC} $*"; }
warn()  { echo -e "${YELLOW}⚠${NC} $*"; }
fail()  { echo -e "${RED}✗${NC} $*"; exit 1; }

run_remote() {
    ${ORB} sh -c "$1"
}

# ─── Pre-flight checks ───────────────────────────────────────────────

preflight() {
    info "Checking demo-box is reachable..."
    ${ORB} sh -c "echo ok" >/dev/null 2>&1 || fail "Cannot reach demo-box via orb"
    ok "Demo-box reachable"

    info "Checking Docker is running on demo-box..."
    run_remote "docker ps >/dev/null 2>&1" || fail "Docker not running on demo-box"
    ok "Docker running"

    info "Ensuring remote directory exists..."
    run_remote "mkdir -p ${REMOTE_DIR}"
    ok "Remote directory ready"
}

# ─── Sync files ───────────────────────────────────────────────────────

sync_api() {
    info "Syncing API files to demo-box..."

    tar -cf - -C /Users/willf/ai-workshop-cs \
        backend/Dockerfile \
        backend/requirements.txt \
        backend/main.py \
        backend/config.py \
        backend/routers/ \
        backend/services/ \
        backend/models/ \
        backend/init.sql \
        backend/migrations/ \
        | ${ORB} sh -c "tar -xf - -C ${REMOTE_DIR}"

    ok "API files synced"
}

sync_frontend() {
    info "Syncing frontend files to demo-box..."

    tar -cf - -C /Users/willf/ai-workshop-cs \
        --exclude='frontend/node_modules' \
        --exclude='frontend/.svelte-kit' \
        --exclude='frontend/build' \
        frontend/ \
        | ${ORB} sh -c "tar -xf - -C ${REMOTE_DIR}"

    ok "Frontend files synced"
}

sync_docs() {
    info "Syncing docs (landing page) to demo-box..."

    tar -cf - -C /Users/willf/ai-workshop-cs \
        docs/ \
        | ${ORB} sh -c "tar -xf - -C ${REMOTE_DIR}"

    ok "Docs synced"
}

sync_compose() {
    info "Syncing docker-compose.yml to demo-box..."

    tar -cf - -C /Users/willf/ai-workshop-cs \
        docker-compose.yml \
        | ${ORB} sh -c "tar -xf - -C ${REMOTE_DIR}"

    ok "Compose file synced"
}

# ─── Deploy API ───────────────────────────────────────────────────────

deploy_api() {
    info "═══ Deploying API ═══"
    echo ""

    sync_api
    sync_compose

    info "Pre-building API image (old container still serving traffic)..."
    local build_start
    build_start=$(date +%s)
    run_remote "cd ${REMOTE_DIR} && docker compose build api" \
        || fail "Image build failed"
    local build_end
    build_end=$(date +%s)
    ok "Image built in $((build_end - build_start))s"

    info "Tagging current image for rollback..."
    run_remote "docker tag \$(docker inspect --format='{{.Image}}' ai-workshop-api 2>/dev/null || echo 'none') ai-workshop-api:rollback 2>/dev/null" \
        || warn "No existing image to tag (first deploy?)"

    info "Swapping container (brief ~2-5s gap)..."
    local swap_start
    swap_start=$(date +%s)
    run_remote "cd ${REMOTE_DIR} && docker compose up -d api"
    local swap_end
    swap_end=$(date +%s)
    ok "Container swapped in $((swap_end - swap_start))s"

    echo ""
    verify_api
}

# ─── Deploy Frontend ─────────────────────────────────────────────────

deploy_frontend() {
    info "═══ Deploying Frontend ═══"
    echo ""

    sync_frontend
    sync_docs
    sync_compose

    info "Pre-building frontend image (old container still serving)..."
    local build_start
    build_start=$(date +%s)
    run_remote "cd ${REMOTE_DIR} && docker compose build frontend" \
        || fail "Frontend image build failed"
    local build_end
    build_end=$(date +%s)
    ok "Image built in $((build_end - build_start))s"

    info "Swapping frontend container..."
    local swap_start
    swap_start=$(date +%s)
    run_remote "cd ${REMOTE_DIR} && docker compose up -d frontend"
    local swap_end
    swap_end=$(date +%s)
    ok "Container swapped in $((swap_end - swap_start))s"

    echo ""
    verify_frontend
}

# ─── Verification ─────────────────────────────────────────────────────

verify_api() {
    info "Verifying API health..."

    for i in $(seq 1 ${HEALTH_RETRIES}); do
        local status
        status=$(curl -sf -o /dev/null -w "%{http_code}" "${LIVE_URL}/api/health" 2>/dev/null || echo "000")

        if [ "$status" = "200" ]; then
            ok "API is healthy (attempt ${i}/${HEALTH_RETRIES})"

            local health
            health=$(curl -sf "${LIVE_URL}/api/health" 2>/dev/null || echo '{"status":"unknown"}')
            info "Full health: ${health}"
            return 0
        fi

        if [ "$i" -lt "${HEALTH_RETRIES}" ]; then
            echo -ne "  Waiting... (${i}/${HEALTH_RETRIES}, status=${status})\r"
            sleep "${HEALTH_INTERVAL}"
        fi
    done

    warn "API failed health check after ${HEALTH_RETRIES} attempts"
    warn "Run './scripts/deploy.sh rollback' to restore previous version"
    return 1
}

verify_frontend() {
    info "Verifying frontend..."

    for i in $(seq 1 5); do
        local status
        status=$(curl -sf -o /dev/null -w "%{http_code}" "${LIVE_URL}/" 2>/dev/null || echo "000")

        if [ "$status" = "200" ]; then
            ok "Frontend is serving (status ${status})"
            return 0
        fi

        sleep 2
    done

    warn "Frontend may not be fully ready yet — check ${LIVE_URL}"
    return 1
}

# ─── Rollback ─────────────────────────────────────────────────────────

rollback_api() {
    info "═══ Rolling back API ═══"
    echo ""

    run_remote "docker image inspect ai-workshop-api:rollback >/dev/null 2>&1" \
        || fail "No rollback image found. Cannot rollback."

    info "Stopping current API container..."
    run_remote "cd ${REMOTE_DIR} && docker compose stop api"

    info "Restoring previous image..."
    run_remote "docker tag ai-workshop-api:rollback \$(cd ${REMOTE_DIR} && docker compose config --images | grep api | head -1)"

    info "Starting API with rollback image..."
    run_remote "cd ${REMOTE_DIR} && docker compose up -d api"

    echo ""
    verify_api
}

# ─── Main ─────────────────────────────────────────────────────────────

main() {
    local target="${1:-}"

    if [ -z "$target" ]; then
        echo "Usage: ./scripts/deploy.sh [api|frontend|all|rollback]"
        echo ""
        echo "  api       Deploy API service"
        echo "  frontend  Deploy frontend service"
        echo "  all       Deploy all services (postgres + api + frontend)"
        echo "  rollback  Rollback API to previous version"
        exit 1
    fi

    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  AI Workshop CS Deploy → Demo-box   ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
    echo ""

    preflight

    case "$target" in
        api)
            deploy_api
            ;;
        frontend)
            deploy_frontend
            ;;
        all)
            sync_compose
            sync_docs

            # Start postgres first, wait for healthy
            info "═══ Starting Postgres ═══"
            sync_api
            run_remote "cd ${REMOTE_DIR} && docker compose up -d postgres"
            info "Waiting for postgres to be healthy..."
            for i in $(seq 1 30); do
                if run_remote "cd ${REMOTE_DIR} && docker compose exec -T postgres pg_isready -U workshop -d ai_workshop" >/dev/null 2>&1; then
                    ok "Postgres is healthy"
                    break
                fi
                sleep 2
            done

            deploy_api
            echo ""
            deploy_frontend
            ;;
        rollback)
            rollback_api
            ;;
        *)
            fail "Unknown target: ${target}. Use api, frontend, all, or rollback."
            ;;
    esac

    echo ""
    ok "Deploy complete!"
    echo ""
}

main "$@"
