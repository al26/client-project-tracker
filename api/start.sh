#!/bin/bash
# start.sh - Start the API dev environment.
# Prompts whether to use Docker or run locally. Default: local.
# Dev-only helper. Production deployments do not use this script.
set -e

cd "$(dirname "$0")"

read -r -p "Use Docker (API + PostgreSQL + Mailpit)? [y/N] " -n 1 REPLY
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Hand over execution to the script inside the .docker directory
    exec ./.docker/up.sh
fi

# ==============================================================================
# LOCAL ENVIRONMENT PATH (Executed if Docker option is skipped)
# ==============================================================================

# Ensure .env exists
if [ ! -f .env ]; then
    cp .env.example .env
    php artisan key:generate
fi

# Run migrations
php artisan migrate --force

# Start queue worker in background
php artisan queue:work --sleep=3 --tries=3 --timeout=60 &
QUEUE_PID=$!

# Start PHP dev server in background
php artisan serve --host=0.0.0.0 --port=8000 &
SERVE_PID=$!

# Stop both background processes on Ctrl+C, termination, or exit
trap 'kill $QUEUE_PID $SERVE_PID 2>/dev/null; exit 0' INT TERM EXIT

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Client Project Tracker - API (Local)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  API:        http://localhost:8000"
echo "  Health:     http://localhost:8000/health"
echo "  Queue:      running (pid: $QUEUE_PID)"
echo "  Mail:       MAIL_MAILER=log (see storage/logs/laravel.log)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Press Ctrl+C to stop both server and queue worker"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Wait for both processes to complete
wait $SERVE_PID $QUEUE_PID
