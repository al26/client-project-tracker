# Client Project Tracker

A system for digital agencies to track client projects, monitor progress, and manage project priorities.

## Features

**Project Management**
- Full CRUD for projects: create, view, update, delete
- Rich project model: client name, project name, description, status, priority, start date, due date
- Status tracking: Planning, In Progress, On Hold, Completed
- Priority levels: Low, Medium, High
- Server-side validation: required fields, enum checks, due date cannot precede start date, clear error messages

**Discovery & Organization**
- Full-text search across client and project names
- Filter by status and/or priority
- Flexible sorting by any field (name, dates, status, priority) in ascending or descending order
- Pagination with configurable page size (up to 100 per page)

**Authentication & Security**
- Laravel Sanctum token-based authentication
- User registration, login, logout
- Email verification via 6-character OTP or magic link
- Password reset via email link
- Profile management (name, email) and password change
- All emails queued for background delivery

**Developer Experience**
- Pest test suite for the API
- OpenAPI 3.0 specification (`api-spec.yaml`)
- Ready-to-run HTTP requests (`api.http`)
- In-memory mock backend for frontend development without API

## Tech Stack

| Layer        | Technology                                                                                                                       |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **Backend**  | Laravel 13 (PHP 8.4), Sanctum, Pest                                                                                              |
| **Frontend** | React 18 + TypeScript + Vite (SPA), TanStack Router, TanStack Query v5, React Hook Form + Zod, Tailwind CSS + shadcn/ui (BaseUI) |
| **Database** | SQLite (default), PostgreSQL, MySQL (any database supported by Laravel)                                                          |

## Prerequisites

### Backend (api/)

- PHP 8.4+
- Composer
- SQLite, PostgreSQL, or MySQL

### Frontend (web/)

- **Runtime**: Node.js 20+ / Bun 1.1+ / Deno 2+
- **Package manager**: npm / pnpm / yarn / bun

## Quick Start (Local, No Docker)

### Backend API

```bash
cd api
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
php artisan queue:work                # in another terminal for email delivery
```

API available at `http://localhost:8000`

### Frontend

```bash
cd web
cp .env.example .env

# Install deps
npm install        # npm

# Start dev server
npm run dev        # npm
```

Frontend available at `http://localhost:3000`

### Demo Credentials

- **Email**: `demo@example.com`
- **Password**: `password`

## Project Structure

```
client-project-tracker/
├── api/                      # Laravel backend
│   ├── app/
│   ├── routes/api.php        # API routes
│   ├── tests/                # Pest tests
│   └── README.md             # Backend docs
├── web/                      # React frontend (SPA)
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── routes/           # File-based routes
│   │   ├── services/         # API & business logic
│   │   ├── types/            # TypeScript types
│   │   └── hooks/            # Custom hooks
│   └── README.md             # Frontend docs
├── api-spec.yaml             # OpenAPI 3.0 specification
├── api.http                  # REST Client requests
└── REQUIREMENTS.md           # Original requirements
```

## API Documentation

- **OpenAPI Spec**: `api-spec.yaml` (repo root)
- **Example Requests**: `api.http` — open with VS Code REST Client extension

## Frontend Modes

| Mode               | Configuration                             | Description                           |
| ------------------ | ----------------------------------------- | ------------------------------------- |
| **Mock** (default) | `VITE_API_BASE_URL` empty                 | In-memory mock backend, no API needed |
| **API**            | `VITE_API_BASE_URL=http://localhost:8000` | Connects to Laravel API               |

## Environment Variables

### Backend (`api/.env`)

Key variables to configure:

| Variable           | Purpose                             | Default                 |
| ------------------ | ----------------------------------- | ----------------------- |
| `APP_URL`          | API origin                          | `http://localhost:8000` |
| `FRONTEND_URL`     | Frontend origin (CORS, email links) | `http://localhost:3000` |
| `DB_CONNECTION`    | Database driver                     | `sqlite`                |
| `DB_DATABASE`      | DB name                             |                         |
| `MAIL_MAILER`      | Email driver                        | `log` (dev)             |
| `QUEUE_CONNECTION` | Queue driver                        | `database`              |

### Frontend (`web/.env`)

| Variable                   | Purpose                  | Default           |
| -------------------------- | ------------------------ | ----------------- |
| `VITE_API_BASE_URL`        | Backend API origin       | empty (mock mode) |
| `VITE_SHOW_SIGNOUT_DIALOG` | Show logout confirmation | `false`           |

## Running Tests

```bash
cd api
php artisan test
# or
vendor/bin/pest
```

## Auth Flow Summary

1. **Register/Login** → returns Sanctum token + user
2. **Bearer token** in `Authorization` header for protected routes
3. **Email verification** via OTP (6-char) or magic link (both queued)
4. **Password reset** via email link (queued)
5. **Profile/Password** management endpoints
6. **Logout** revokes current token

See `api/README.md` for complete auth flow and `web/README.md` for frontend architecture.
