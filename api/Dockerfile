#BEGIN Base
FROM php:8.4-fpm-alpine AS base

# System dependencies + build tools for PHP extensions
RUN apk add --no-cache \
    nginx supervisor \
    libpng-dev libpq-dev libzip-dev \
    zip unzip git curl postgresql-client \
    $PHPIZE_DEPS linux-headers

# PHP extensions not in base image (Laravel requirements + app)
RUN docker-php-ext-install -j$(nproc) \
    pdo_pgsql pdo_mysql \
    bcmath exif gd zip pcntl

# Remove build tools (reduces image size)
RUN apk del $PHPIZE_DEPS linux-headers

# Copy runtime config files from .docker/ folder
COPY .docker/config/nginx.conf /etc/nginx/nginx.conf
COPY .docker/config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY .docker/config/php.ini /usr/local/etc/php/conf.d/99-custom.ini
COPY .docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /var/www/html
#END Base

#BEGIN Build
FROM base AS build

# Composer (install tool only in build stage)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Node.js + npm for frontend asset building (not needed at runtime)
RUN apk add --no-cache nodejs npm

# Composer deps (production only, cached by layer)
COPY composer.json composer.lock* ./
RUN composer install --no-dev --no-scripts --no-interaction --optimize-autoloader

# Build frontend assets (Tailwind via Vite)
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .

# Ensure runtime dirs exist (dockerignore excludes them from COPY)
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
 && chown -R www-data:www-data storage bootstrap/cache
RUN npm run build

# Laravel package discovery
RUN php artisan package:discover --ansi
#END Build

#BEGIN Production
FROM base AS prod

# Copy built application with correct ownership (avoids slow chown -R)
COPY --from=build --chown=www-data:www-data /var/www/html /var/www/html

# Only fix permissions on dirs needing runtime write access
# Caching (config/route/view) runs in /entrypoint.sh at runtime with live env vars
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache \
 && mkdir -p /var/www/html/storage/opcache \
 && chown -R www-data:www-data /var/www/html/storage/opcache

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -sf http://localhost/health || exit 1

ENTRYPOINT ["/entrypoint.sh"]
#END Production
