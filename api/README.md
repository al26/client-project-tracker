# API - Client Project Tracker

Backend REST API for the Client Project Tracker. Built with **Laravel 11**
(PHP 8.4) + **Sanctum** for authentication, **PEST** for testing.

## Tech Stack
- **Laravel** 11
- **PHP** 8.4
- **Sanctum** personal-access tokens (Bearer auth)
- **PEST** PHP unit testing
- **SQLite** (dev) / **PostgreSQL** (production)

## Requirements
- PHP 8.4+
- Composer
- SQLite or PostgreSQL

## Local Setup (without Docker)
```bash
cd api
cp .env.example .env
php artisan key:generate
touch database/database.sqlite        # or set DB_CONNECTION=pgsql in .env
php artisan migrate --seed
php artisan serve
```

The API is then available at `http://localhost:8000`.

## Environment (`.env.example`)
| Variable | Purpose |
|---|---|
| `APP_URL` | API origin (e.g. `http://localhost:8000`) |
| `FRONTEND_URL` | Frontend origin for CORS (e.g. `http://localhost:3000`) |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins |
| `SANCTUM_STATEFUL_DOMAINS` | Stateful domains (for cookie auth, if used) |
| `DB_CONNECTION` | `sqlite` (dev) or `pgsql` (prod) |
| `DB_DATABASE` | Path to SQLite file or PostgreSQL DB name |

## API Docs
- OpenAPI spec: `api-spec.yaml` (at repo root)
- Example requests: `api.http` (at repo root) — open with VS Code REST Client extension

## Seeding
```bash
php artisan migrate:fresh --seed
# Seeds: 1 user (demo@example.com / password) + sample projects
```

## Testing
```bash
php artisan test
# or with Pest:
vendor/bin/pest
```

## Auth flow
- `POST /api/register` or `POST /api/login` → returns `{ token, user }`
- Use `Authorization: Bearer <token>` for all protected routes
- `POST /api/logout` — revokes current token

See `api-spec.yaml` for full endpoint docs.
