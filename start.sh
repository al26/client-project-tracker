#!/bin/bash
# start.sh - Full stack startup with auto .env setup
# Usage: ./start.sh [--build] [--down] [--logs [web|api]]

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_FLAG=""
ACTION="up"
LOG_SERVICE=""

# Parse args
for arg in "$@"; do
    case $arg in
        --build) BUILD_FLAG="--build" ;;
        --down) ACTION="down" ;;
        --logs) ACTION="logs" ;;
        web|api) LOG_SERVICE="$arg" ;;
    esac
done

# Auto-copy .env.example -> .env if missing
for service in api web; do
    env_file="$ROOT_DIR/$service/.env"
    example_file="$ROOT_DIR/$service/.env.example"
    if [ ! -f "$env_file" ] && [ -f "$example_file" ]; then
        echo "Creating $service/.env from .env.example..."
        cp "$example_file" "$env_file"
    fi
done

case $ACTION in
    down)
        echo "Stopping all services..."
        docker compose down "${@:2}"
        ;;
    logs)
        if [ -n "$LOG_SERVICE" ]; then
            docker compose logs -f "$LOG_SERVICE"
        else
            docker compose logs -f
        fi
        ;;
    *)
        echo "Starting full stack (API + Web + DB + Mailpit)..."
        docker compose up -d $BUILD_FLAG

        echo "Waiting for API health..."
        until docker compose exec api curl -sf http://localhost/health | grep -q "Status: OK"; do
            sleep 2
        done

        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "  Client Project Tracker - Full Stack"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "  Web App:      http://cpt.local"
        echo "  API:          http://api.cpt.local"
        echo "  API Health:   http://api.cpt.local/health"
        echo "  Mailpit UI:   http://mail.cpt.local"
        echo "  PostgreSQL:   localhost:5432"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "  Stop:    ./start.sh --down"
        echo "  Logs:    ./start.sh --logs [web|api]"
        echo "  Rebuild: ./start.sh --build"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        ;;
esac