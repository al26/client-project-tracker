# Client Project Tracker

A system for digital agencies to track client projects, monitor progress, and manage project priorities.

## Features

### Project Management

- Full CRUD for projects: create, view, update, delete
- Rich project model: client name, project name, description, status, priority, start date, due date
- Status tracking: Planning, In Progress, On Hold, Completed
- Priority levels: Low, Medium, High
- Server-side validation: required fields, enum checks, due date cannot precede start date, clear error messages

### Discovery & Organization

- Full-text search across client and project names
- Filter by status and/or priority
- Flexible sorting by any field (name, dates, status, priority) in ascending or descending order
- Pagination with configurable page size (up to 100 per page)

### Authentication & Security

- Laravel Sanctum token-based authentication
- User registration, login, logout
- Email verification via 6-character OTP or magic link
- Password reset via email link
- Profile management (name, email) and password change
- All emails queued for background delivery

#### Auth Flow

1. **Register/Login** → returns Sanctum token + user
2. **Bearer token** in `Authorization` header for protected routes
3. **Email verification** via OTP (6-char) or magic link (both queued)
4. **Password reset** via email link (queued)
5. **Profile/Password** management endpoints
6. **Logout** revokes current token

### Developer Experience

- Pest test suite for the API
- OpenAPI 3.0 specification (`api-spec.yaml`)
- Ready-to-run HTTP requests (`api.http`)
- In-memory mock backend for frontend development without API

## Tech Stack

| Layer        | Technology                                                                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Backend**  | Laravel 13 (PHP 8.4), Sanctum, Pest                                                                                                                  |
| **Frontend** | React 19 + TypeScript + Vite, **TanStack Start (SSR)**, TanStack Router, TanStack Query v5, React Hook Form + Zod, Tailwind CSS + shadcn/ui (BaseUI) |
| **Database** | SQLite (default), PostgreSQL, MySQL (any database supported by Laravel)                                                                              |

## Prerequisites

### Backend (api/)

- PHP 8.4+
- Composer
- SQLite, PostgreSQL, or MySQL

### Frontend (web/)

- **Runtime**: Node.js 20+ / Bun 1.1+ / Deno 2+
- **Package manager**: npm / pnpm / yarn / bun

## Quick Start

### Full Stack (Docker) — Recommended

```bash
./start.sh
# or rebuild: ./start.sh --build
```

Runs API + Web + PostgreSQL + Mailpit behind Caddy reverse proxy.
See [Service URLs](#service-urls).

> **Note:** For local development, add to `/etc/hosts`:
>
> ```
> 127.0.0.1 cpt.local api.cpt.local mail.cpt.local
> ```
>
> Caddy automatically provisions TLS certificates via its local CA.

### Backend API Only (Local)

```bash
cd api && ./start.sh
```

Uses SQLite, runs on `http://localhost:8000`. See [`api/README.md`](api/README.md) for details.

### Frontend Only (Local)

```bash
cd web
cp .env.example .env
npm install && npm run dev
```

Runs on `http://localhost:3000`. Uses mock API by default. See [`web/README.md`](web/README.md).

### Demo Credentials

- **Email**: `demo@example.com`
- **Password**: `password`

## Service URLs

### Full Stack (via Caddy)

| Service    | URL                          |
| ---------- | ---------------------------- |
| Web App    | https://cpt.local            |
| API        | https://api.cpt.local        |
| API Health | https://api.cpt.local/health |
| Mailpit UI | https://mail.cpt.local       |
| PostgreSQL | localhost:5432 (internal)    |

### Standalone (Direct Ports)

| Mode                                     | Web App               | API                   | Mailpit               |
| ---------------------------------------- | --------------------- | --------------------- | --------------------- |
| API only (`cd api && docker compose up`) | —                     | http://localhost:8081 | http://localhost:8025 |
| Web only (`cd web && docker compose up`) | http://localhost:3000 | —                     | —                     |

## Useful Commands (Full Stack)

| Command                   | Description           |
| ------------------------- | --------------------- |
| `./start.sh`              | Start full stack      |
| `./start.sh --build`      | Rebuild & start       |
| `./start.sh --logs web`   | Frontend logs         |
| `./start.sh --logs api`   | Backend logs          |
| `./start.sh --logs proxy` | Caddy proxy logs      |
| `./start.sh --down`       | Stop all              |
| `docker compose down -v`  | Stop + remove DB data |

> For per-service commands, see [`api/README.md`](api/README.md) and [`web/README.md`](web/README.md).

## Environment Variables

### Backend (`api/.env`)

| Variable                   | Purpose                             | Default (Full Stack)     | Default (Local)            |
| -------------------------- | ----------------------------------- | ------------------------ | -------------------------- |
| `APP_URL`                  | API origin                          | `https://api.cpt.local`  | `http://localhost:8000`    |
| `FRONTEND_URL`             | Frontend origin (CORS, email links) | `https://cpt.local`      | `http://localhost:3000`    |
| `CORS_ALLOWED_ORIGINS`     | Allowed CORS origins                | `https://cpt.local`      | `http://localhost:3000`    |
| `SANCTUM_STATEFUL_DOMAINS` | Stateful domains for cookie auth    | `cpt.local`              | `localhost:3000`           |
| `DB_CONNECTION`            | Database driver                     | `pgsql`                  | `sqlite`                   |
| `DB_DATABASE`              | DB name                             | `client_project_tracker` | `database/database.sqlite` |
| `MAIL_MAILER`              | Email driver                        | `smtp` (Mailpit)         | `log`                      |
| `QUEUE_CONNECTION`         | Queue driver                        | `database`               | `database`                 |

### Frontend (`web/.env`)

| Variable                   | Purpose                  | Default (Full Stack)    | Default (Local)   |
| -------------------------- | ------------------------ | ----------------------- | ----------------- |
| `VITE_API_BASE_URL`        | Backend API origin       | `https://api.cpt.local` | empty (mock mode) |
| `VITE_SHOW_SIGNOUT_DIALOG` | Show logout confirmation | `false`                 | `false`           |

#### Frontend Modes

| Mode                 | Configuration                             | Description                           |
| -------------------- | ----------------------------------------- | ------------------------------------- |
| **Mock** (default)   | `VITE_API_BASE_URL` empty                 | In-memory mock backend, no API needed |
| **API (Full Stack)** | `VITE_API_BASE_URL=https://api.cpt.local` | Connects to Laravel API via Caddy     |
| **API (Local)**      | `VITE_API_BASE_URL=http://localhost:8000` | Connects to local Laravel API         |

## Project Structure

```
client-project-tracker/
├── api/                      # Laravel backend
│   ├── app/
│   ├── routes/api.php
│   ├── tests/
│   └── README.md
├── web/                      # React frontend (TanStack Start)
│   ├── src/
│   │   ├── components/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── hooks/
│   └── README.md
├── api-spec.yaml             # OpenAPI 3.0 specification
├── api.http                  # REST Client requests
├── start.sh                  # Full stack startup script
├── docker-compose.yml        # Full stack Docker config
├── Caddyfile                 # Caddy reverse proxy config
└── README.md                 # This file
```

## Testing

```bash
cd api
php artisan test
# or
vendor/bin/pest
```

## Documentation

| Document      | Location        | Description                                                     |
| ------------- | --------------- | --------------------------------------------------------------- |
| API README    | `api/README.md` | Local setup, auth flow, email, testing, API docs, env vars      |
| Web README    | `web/README.md` | Local setup, routing, project structure, theming, Docker, build |
| OpenAPI Spec  | `api-spec.yaml` | Full API specification (OpenAPI 3.0)                            |
| HTTP Examples | `api.http`      | Ready-to-run requests (VS Code REST Client)                     |

---

## Assumptions & Implementation Notes

See [`ASSUMPTIONS.md`](ASSUMPTIONS.md) for a detailed comparison of [`REQUIREMENTS.md`](REQUIREMENTS.md) vs actual implementation, including decisions, trade-offs, and rationale for each area that extends beyond the base requirements.
