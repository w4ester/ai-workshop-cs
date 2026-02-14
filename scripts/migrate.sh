#!/usr/bin/env bash
#
# Run SQL migrations against the ai-workshop-cs database
# Follows the same conventions as deploy.sh
#
# Usage:
#   ./scripts/migrate.sh          # Run migrations on demo-box (production)
#   ./scripts/migrate.sh --local  # Run migrations on local Docker (dev)

set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────────
DEMO_BOX="demo-box"
REMOTE_DIR="/home/demo/apps/ai-workshop-cs"
ORB="orb -m ${DEMO_BOX} -u root"
CONTAINER="ai-workshop-pgvector"
DB_USER="workshop"
DB_NAME="ai_workshop"
MIGRATIONS_DIR="backend/migrations"

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

# ─── Migration runners ───────────────────────────────────────────────

run_migrations_remote() {
    info "Checking demo-box is reachable..."
    ${ORB} sh -c "echo ok" >/dev/null 2>&1 || fail "Cannot reach demo-box via orb"
    ok "Demo-box reachable"

    info "Syncing migrations to demo-box..."
    tar -cf - -C /Users/willf/ai-workshop-cs \
        "${MIGRATIONS_DIR}/" \
        | ${ORB} sh -c "tar -xf - -C ${REMOTE_DIR}"
    ok "Migrations synced"

    info "Running migrations on demo-box..."
    echo ""

    local passed=0
    local failed=0

    for sql_file in "${MIGRATIONS_DIR}"/*.sql; do
        local basename
        basename=$(basename "$sql_file")
        local remote_path="${REMOTE_DIR}/${MIGRATIONS_DIR}/${basename}"

        info "Running ${basename}..."
        if run_remote "cat ${remote_path} | docker exec -i ${CONTAINER} psql -U ${DB_USER} -d ${DB_NAME}" 2>&1; then
            ok "${basename} applied"
            passed=$((passed + 1))
        else
            warn "${basename} FAILED"
            failed=$((failed + 1))
        fi
    done

    echo ""
    ok "Migrations complete: ${passed} passed, ${failed} failed"
    [ "$failed" -eq 0 ] || exit 1
}

run_migrations_local() {
    info "Running migrations on local Docker..."
    echo ""

    docker ps --format '{{.Names}}' | grep -q "${CONTAINER}" \
        || fail "Container ${CONTAINER} is not running locally. Run: docker compose up -d"

    local passed=0
    local failed=0

    for sql_file in "${MIGRATIONS_DIR}"/*.sql; do
        local basename
        basename=$(basename "$sql_file")

        info "Running ${basename}..."
        if docker exec -i "${CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" < "$sql_file" 2>&1; then
            ok "${basename} applied"
            passed=$((passed + 1))
        else
            warn "${basename} FAILED"
            failed=$((failed + 1))
        fi
    done

    echo ""
    ok "Migrations complete: ${passed} passed, ${failed} failed"
    [ "$failed" -eq 0 ] || exit 1
}

# ─── Main ─────────────────────────────────────────────────────────────

main() {
    local mode="${1:-remote}"

    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  AI Workshop CS — Run Migrations     ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
    echo ""

    # Check migrations exist
    local count
    count=$(ls -1 "${MIGRATIONS_DIR}"/*.sql 2>/dev/null | wc -l | tr -d ' ')
    if [ "$count" -eq 0 ]; then
        warn "No .sql files found in ${MIGRATIONS_DIR}/"
        exit 0
    fi
    info "Found ${count} migration file(s)"
    echo ""

    case "$mode" in
        --local)
            run_migrations_local
            ;;
        remote|"")
            run_migrations_remote
            ;;
        *)
            echo "Usage: ./scripts/migrate.sh [--local]"
            echo ""
            echo "  (default)  Run migrations on demo-box (production)"
            echo "  --local    Run migrations on local Docker (dev)"
            exit 1
            ;;
    esac
}

main "$@"
