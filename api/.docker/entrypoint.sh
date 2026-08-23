#!/bin/sh
set -e

# Use a local env file if available (compose typically passes env vars directly)
if [ ! -f .env ]; then
    if [ -f .env.production ]; then
        cp .env.production .env
    elif [ -f .env.example ]; then
        cp .env.example .env
    else
        # No template: build .env from process env vars (compose env_file)
        printenv | grep -E '^(APP_|DB_|MAIL_|QUEUE_|CACHE_|CORS_|FRONTEND_|SANCTUM_|SESSION_|BROADCAST_|FILESYSTEM_|LOG_|REDIS_)' > .env
    fi
fi

# Generate APP_KEY if not set
if ! grep -q '^APP_KEY=base64:' .env 2>/dev/null; then
    php artisan key:generate --force
fi

# Run database migrations (non-fatal if DB isn't ready yet)
php artisan migrate --force || true

# seed data
if ! grep -q '^APP_ENV=production' .env 2>/dev/null; then
    php artisan db:seed --force || true
fi

# Cache config and views (route:cache skipped — web.php uses closures)
php artisan config:cache || true
php artisan view:cache || true

# Start supervisor (nginx + php-fpm + queue worker)
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
