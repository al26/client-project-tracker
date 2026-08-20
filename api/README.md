# API - Client Project Tracker

Backend REST API for the Client Project Tracker. Built with **Laravel 13** (PHP 8.4), using **Sanctum** for token-based authentication and **Pest** for testing.

## Tech Stack

- **Laravel** 13
- **PHP** 8.4
- **Sanctum** personal-access tokens (Bearer auth)
- **Pest** PHP unit testing
- **SQLite** (development)
- **PostgreSQL** or **MySQL** (production)

## Requirements

- PHP 8.4+
- Composer
- SQLite, PostgreSQL, or MySQL

## Local Setup (without Docker)

```bash
cd api
cp .env.example .env
php artisan key:generate
touch database/database.sqlite        # or set DB_CONNECTION=pgsql in .env
php artisan migrate --seed
php artisan serve
php artisan queue:work                # run in another terminal for email delivery
```

The API is then available at `http://localhost:8000`.

## Important Environment Variables (`.env.example`)

| Variable                   | Purpose                                    | Example / Default               |
| -------------------------- | ------------------------------------------ | ------------------------------- |
| `APP_URL`                  | API origin (used in generated links)       | `http://localhost:8000`         |
| `FRONTEND_URL`             | Frontend origin for CORS & email links     | `http://localhost:3000`         |
| `CORS_ALLOWED_ORIGINS`     | Allowed CORS origins (comma-separated)     | `http://localhost:3000`         |
| `SANCTUM_STATEFUL_DOMAINS` | Stateful domains for cookie auth (if used) | `localhost:3000`                |
| `DB_CONNECTION`            | Database driver                            | `sqlite` (dev) / `pgsql` (prod) |
| `DB_DATABASE`              | Path to SQLite file or DB name             | `database/database.sqlite`      |
| `MAIL_MAILER`              | Email driver                               | `log` (dev) / `smtp` (prod)     |
| `MAIL_HOST`                | SMTP host                                  | `smtp.mailgun.org`              |
| `MAIL_PORT`                | SMTP port                                  | `587`                           |
| `MAIL_USERNAME`            | SMTP username                              |                                 |
| `MAIL_PASSWORD`            | SMTP password                              |                                 |
| `MAIL_ENCRYPTION`          | SMTP encryption                            | `tls`                           |
| `MAIL_FROM_ADDRESS`        | From email address                         | `noreply@example.com`           |
| `MAIL_FROM_NAME`           | From name                                  | `Client Project Tracker`        |
| `QUEUE_CONNECTION`         | Queue driver                               | `database`                      |

> **Tip:** For local development with a real inbox, use a service like [Mailtrap](https://mailtrap.io/) or [Mailpit](https://github.com/axllent/mailpit) and set `MAIL_MAILER=smtp` with their credentials.

## Queue Workers

The following notifications are **queued** and require a running queue worker:

| Notification                | Trigger                                             | Implements        |
| --------------------------- | --------------------------------------------------- | ----------------- |
| `VerifyEmailNotification`   | User requests email verification (OTP + magic link) | `Queueable` trait |
| `WelcomeNotification`       | New user registers                                  | `ShouldQueue`     |
| `ResetPasswordNotification` | User requests password reset                        | `ShouldQueue`     |

**Development:** Use `php artisan queue:work` (runs in foreground, processes immediately).

**Production:** Use `php artisan queue:work --daemon` supervised by systemd/Supervisor, or Laravel Horizon for Redis queues.

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

## Auth Flow

### Registration & Login

- `POST /api/register` — Create account, returns `{ token, user }`. Sends **welcome email** (queued).
- `POST /api/login` — Returns `{ token, user }`.

### Protected Routes

- Include `Authorization: Bearer <token>` header for all authenticated endpoints.
- `POST /api/logout` — Revokes current token.

### Email Verification

- `POST /api/email/verification-notification` — Sends **6-char OTP + magic link** to authenticated user (queued).
- `POST /api/email/verification-notification/resend` — Resends OTP if still valid, else generates new (queued).
- `POST /api/email/verify` — Verify using **6-char OTP** (public, rate-limited).
- `POST /api/email/verify-magic` — Verify via **magic link token** (public, rate-limited).

### Password Reset

- `POST /api/forgot-password` — Sends password reset link to email (queued).
- `POST /api/reset-password` — Reset password using token from email.

### Profile Management

- `GET /api/user` — Get authenticated user.
- `PUT /api/user/profile-information` — Update name & email.
- `PUT /api/user/password` — Update password (requires current password).

See `api-spec.yaml` for full endpoint documentation.
