# Assumptions & Implementation Notes

This document explains key decisions where the implementation extends beyond or interprets REQUIREMENTS.md. For each area: **Requirement → Decision → Trade-off/Rationale → What Would Improve With More Time**.

---

## 1. Authentication & Authorization

**Requirement**: Not mentioned (bonus: "Authentication")

**Decision**: Full Laravel Sanctum token-based auth:

- Register, login, logout (revokes current token)
- Email verification: 6-char OTP + magic link (both queued)
- Password reset: email link (queued)
- Profile management (name, email) + password change
- All emails queued via `database` queue; Mailpit for local dev

**Trade-off**: Adds significant complexity (auth controllers, notifications, tokens, policies) but required for real-world multi-user project tracking. Without it, projects would be globally visible/editable.

**With More Time**:

- Role-based access (admin, manager, viewer)
- Team/organization scoping (multi-tenant)
- OAuth providers (GitHub, Google)
- Refresh token rotation + device management

---

## 2. Search, Filter, Sort, Pagination

**Requirement**: All optional (bonus)

**Decision**: Fully implemented server-side:

- Search: `search` param → `WHERE client_name LIKE ? OR project_name LIKE ?`
- Filters: `status`, `priority` (enum validated)
- Sort: 7 fields (`client_name`, `project_name`, `start_date`, `due_date`, `status`, `priority`, `id`), `asc`/`desc`
- Pagination: `page`, `per_page` (max 100)

**Trade-off**: Frontend complexity (debounced search, URL state sync, pagination controls) but enables production UX without later retrofit. Server-side keeps payloads small.

**With More Time**:

- Saved views / user preferences
- Advanced filters (date ranges, multi-select)
- Cursor-based pagination for large datasets

---

## 3. Docker & Deployment Infrastructure

**Requirement**: Not mentioned (bonus: "Docker Setup", "Deployment")

**Decision**: Full stack Docker Compose:

- Caddy reverse proxy (auto-TLS via local CA for `*.cpt.local`)
- PostgreSQL (production parity)
- Mailpit (email UI)
- Laravel queue worker (background emails)
- Single `./start.sh` command

**Trade-off**: Adds operational complexity (Caddy config, hosts file, multiple services) but achieves dev/prod parity and zero-config TLS locally.

**With More Time**:

- GitHub Actions CI/CD pipeline
- Monitoring: Sentry + Laravel Telescope/Pulse

**Future Learning**:

- Kubernetes manifests / Helm charts
- Log aggregation (Loki) + metrics (Prometheus/Grafana)

---

## 4. Mock Backend for Frontend Development

**Requirement**: Not mentioned

**Decision**: In-memory mock API (`web/src/services/mock-db.ts`) activated when `VITE_API_BASE_URL` is empty:

- Pre-seeded with 4 realistic projects
- Simulates latency (350ms)
- Demo user: `demo@example.com` / `password`
- Default mode — zero backend setup to start frontend dev

**Trade-off**: Maintains two API implementations (mock + real) but dramatically improves onboarding and enables parallel frontend/backend work.

**With More Time**:

- Scenario-based fixtures (empty state, error state, loading)
- Auto-generated from OpenAPI spec

**Future Learning**:

- MSW (Mock Service Worker) for network-level mocking

---

## 5. Testing

**Requirement**: Optional (bonus: "Unit Tests")

**Decision**: Pest test suite (54 tests, 187 assertions):

- Feature tests for all auth endpoints
- Feature tests for project CRUD + validation + auth + filtering/sorting/pagination
- Factory-based test data

**Trade-off**: Pest syntax is expressive but less familiar than PHPUnit; tests run against SQLite in-memory for speed.

**With More Time**:

- Frontend component tests (Vitest + React Testing Library)
- E2E tests (Playwright) for critical flows
- GitHub Actions CI running tests

**Future Learning**:

- Mutation testing (Infection) — automated mutant killing to verify test quality
- Contract tests against OpenAPI spec — automated (Dredd/Schemathesis) to verify API matches spec

---

## 6. API Documentation

**Requirement**: Optional (bonus)

**Decision**: OpenAPI 3.0 spec (`api-spec.yaml`) + `api.http` for VS Code REST Client:

- All endpoints documented with request/response schemas
- Security schemes (Bearer)
- Enums, pagination, error responses
- `api.http` has ready-to-run requests with variables

**Trade-off**: Manual maintenance of YAML; could drift from code.

**With More Time**:

- Generate OpenAPI from Laravel routes (scramble/dingo)
- Swagger UI / Redoc hosted endpoint
- Postman collection export

---

## 7. Technology Stack Selection

**Requirement**: "You may use any framework or language"

**Decision**:

- **Backend**: Laravel 13 (PHP 8.4) — primary proficiency, batteries-included (Sanctum, Pest, queues, notifications)
- **Frontend**: React 19 + TypeScript + Vite — skill refresh
- **Framework**: TanStack Start (SSR) — curiosity; initially wanted SPA, tried SSR
- **Skipped Inertia** — perceived requirement for BE/FE separation (may have been unnecessary)
- **State**: TanStack Query v5 (server state), React Hook Form + Zod (forms)
- **UI**: Tailwind CSS + shadcn/ui (BaseUI) — accessible, unstyled primitives, copy-paste customization
- **Database**: SQLite (local), PostgreSQL (Docker), MySQL supported

**Trade-off**: TanStack Start is newer than Next.js; smaller ecosystem but simpler mental model. BE/FE separation requirement may have been misinterpreted — Inertia would have worked and simplified full-stack TypeScript.

**With More Time**:

- GraphQL evaluation if relationships get complex

---

## 8. Email System

**Requirement**: Not mentioned

**Decision**: Laravel Notifications + queued delivery:

- `VerifyEmailNotification` (OTP + magic link)
- `ResetPasswordNotification`
- `database` queue driver (local), `database` (Docker)
- Mailpit SMTP for local inspection (UI at `mail.cpt.local`)

**Trade-off**: Queue worker required in production; adds infrastructure but prevents request blocking on email send.

**With More Time**:

- Email templates (Blade/Markdown) with preview
- Delivery tracking (opens, clicks) via webhook
- Fallback providers (SendGrid, Resend, Postmark)

---

## 9. Database Strategy

**Requirement**: Any supported by Laravel

**Decision**:

- SQLite for local zero-config (`database/database.sqlite`)
- PostgreSQL for Docker/production (parity)
- Migrations + seeders for all tables
- Enum casts for status/priority (database stores string values)

**Trade-off**: SQLite lacks some PostgreSQL features (partial indexes, advanced JSON); test locally on SQLite, CI on PostgreSQL.

**With More Time**:

- Soft deletes + audit trail (spatie/laravel-activitylog)

---

## 10. Validation & Error Handling

**Requirement**: Required fields, enum checks, due ≥ start, meaningful errors

**Decision**:

- `StoreProjectRequest` / `UpdateProjectRequest` FormRequests
- `required`, `max`, `Rule::enum()`, `after_or_equal:start_date`
- Update uses closure for cross-field check against existing record
- `ApiError` class: `{ message, status, errors: { field: [messages] } }`
- Laravel renders JSON for `api/*` routes via `bootstrap/app.php`
- Frontend shows toast with message + field-level errors

**Trade-off**: Duplicate validation logic in frontend (Zod schemas) for immediate UX feedback; DRY via OpenAPI codegen would eliminate.

**With More Time**:

- Generate Zod schemas from OpenAPI
- Rate limiting per-user on write endpoints

---

## 11. Frontend Architecture

**Requirement**: "Create a user interface" — no framework specified

**Decision**:

- **TanStack Start (SSR)** — server-rendered HTML, hydration, file-based routing
- **TanStack Router** — type-safe links, search params validation, route loaders
- **TanStack Query v5** — caching, deduping, retries, invalidation, optimistic updates
- **React Hook Form + Zod** — performant forms, schema validation
- **shadcn/ui (BaseUI)** — Radix-based accessible primitives, copy-paste customization

**Trade-off**: SSR adds server complexity (Node.js runtime for production) vs SPA; TanStack Start is less mature than Next.js. But: smaller bundle, simpler mental model, React 19 ready.

**With More Time**:

- Optimistic UI for create/update/delete
- Offline support (Service Worker + TanStack Query persistence)

**Future Learning**:

- Suspense boundaries for async UI
- Storybook for component documentation

---

## 12. Project Ownership & Authorization

**Requirement**: Not specified

**Decision**: Projects belong to authenticated user (`user_id` FK). Policies (`ProjectPolicy`) enforce `view`, `update`, `delete` — users only access their own projects.

**Trade-off**: Simpler than team-based sharing but limits collaboration.

**With More Time**:

- Team/workspace model with roles
- Project sharing (invite members, public links)
- Activity log / audit trail

---

## 13. Hard Delete vs Soft Delete

**Requirement**: Not specified

**Decision**: Hard delete (`DELETE` removes row). No `SoftDeletes` trait.

**Trade-off**: Simpler queries, no global scopes. Loses audit trail.

**With More Time**:

- Add `SoftDeletes` + `deleted_at` index
- Admin "trash" view with restore/force-delete
- GDPR-compliant data export/delete

---

## 14. API Versioning

**Requirement**: Not specified

**Decision**: No versioning (`/api/projects`). Single version, additive changes only.

**Trade-off**: Simpler routes, no version negotiation. Breaking changes require coordination.

**With More Time**:

- URL versioning (`/api/v1/projects`) when breaking changes needed

**Future Learning**:

- Deprecation headers
- Sunset header
- Link header
- Add when breaking changes needed

---

## Honest Reflection & Future Learning

This project was built as a learning vehicle. Key areas where I have production experience vs. exploration:

**Comfortable**: Laravel, React basics, REST APIs, Docker Compose, GitHub Actions (via UI), Sentry basics, Optimistic UI, Service Worker offline (basic), Pest, OpenAPI spec, Sanctum auth, Queued emails

**Explored in this project**: TanStack Start (SSR), TanStack Router/Query, shadcn/ui, Mailpit

**Future Learning (would pursue next)**:

- Kubernetes / Helm / CI-CD as code (.github/workflows)
- Health checks, readiness probes, structured logging (Loki/Prometheus/Grafana)
- Laravel Telescope / Pulse for observability
- Mutation testing (Infection), Contract tests (Dredd)
- MSW for network-level mocking
- Suspense boundaries for async UI
- Storybook for component documentation
- API deprecation headers (Deprecation/Sunset/Link)
- CI matrix (SQLite + PostgreSQL + MySQL)
- Read replicas, soft deletes, audit trails
