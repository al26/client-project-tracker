#!/bin/bash
# up.sh - Start the API stack (API + PostgreSQL + Mailpit) via Docker Compose.
# Dev-only helper. Production deployments do not use this script.
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

docker compose --project-directory "$ROOT_DIR" up -d --build

echo "Waiting for the application to be ready (Status: OK)..."
until docker compose exec api curl -s http://localhost/health | grep -q "Status: OK"; do
    sleep 2
done
echo "Application is ready!"


echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Client Project Tracker - API (Docker)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  API:          http://localhost:8081"
echo "  Health:       http://localhost:8081/health"
echo "  Mailpit UI:   http://localhost:8025"
echo "  Mailpit SMTP: localhost:1025"
echo "  PostgreSQL:   localhost:5432 (user: ${DB_USERNAME:-laravel}, db: ${DB_DATABASE:-client_project_tracker})"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Stop:  docker compose down"
echo "  Logs:  docker compose logs -f api"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
