# Client Project Tracker — Product Roadmap

**Current Version**: 0.0.1 (MVP — core CRUD + auth + discovery + docker)  
**Target Version**: 1.0.0 (all personal/functional features complete)  
**Status**: Planning  

---

## Release Strategy

| Phase | Version Range | Focus |
|-------|---------------|-------|
| **Phase 0** | 0.0.1 ✅ | Core CRUD + Auth + Discovery + Docker |
| **Phase 1** | 0.1.x | Task Management Foundation |
| **Phase 2** | 0.2.x | Time Tracking & Productivity |
| **Phase 3** | 0.3.x | Advanced Views (Kanban, Gantt, Calendar) |
| **Phase 4** | 0.4.x | Organization & Automation |
| **Phase 5** | 0.5.x | Reporting & Insights |
| **Phase 6** | 0.6.x | Data & Customization |
| **Phase 7** | 0.7.x | Polish, Performance, Mobile |
| **Phase 8** | 0.8.x | API & Integrations Foundation |
| **Phase 9** | 0.9.x | Collaboration & Teams (pre-1.0) |
| **v1.0.0** | 1.0.0 | **First Stable Release** — all above complete |
| **Post-1.0** | 1.x+ | Platform, Marketplace, Advanced Collaboration |

---

## Phase 1 — Task Management Foundation (0.1.x)

**Theme**: Break projects into actionable work items

### Features

| Feature | Description | Effort | Priority |
|---------|-------------|--------|----------|
| **Tasks/Sub-tasks** | Break projects into tasks with due dates, status, priority, assignee (self) | M | P0 |
| **Task Statuses** | Customizable workflow: Todo → In Progress → Review → Done (per project) | S | P0 |
| **Task Priorities** | Low/Medium/High/Critical with color coding | S | P0 |
| **Task List View** | Sortable, filterable table view with inline editing | M | P1 |
| **Task Detail Modal** | Full task view: description, dates, subtasks, activity | M | P1 |
| **Sub-tasks/Checklists** | Nested checklists within tasks; progress rollup | S | P1 |

### Technical Changes
- New model: `Task` (project_id, parent_id for subtasks, status, priority, due_date, sort_order)
- Polymorphic: Tasks belong to Project
- API: `/api/projects/{project}/tasks` + `/api/tasks` (global)
- Drag-to-reorder (sort_order)

---

## Phase 2 — Time Tracking & Productivity (0.2.x)

**Theme**: Measure and optimize personal productivity

### Features

| Feature | Description | Effort | Priority |
|---------|-------------|--------|----------|
| **Timer (Start/Stop)** | One-click timer per task; auto-save on browser close | M | P0 |
| **Manual Time Entries** | Add/edit time logs with date, duration, description | M | P0 |
| **Weekly Timesheet** | Grid view: days × tasks; quick entry; weekly total | M | P1 |
| **Time Reports** | Daily/weekly/monthly breakdown by project, task, client | M | P1 |
| **Billable vs Non-billable** | Toggle per time entry; rate per project/client | S | P2 |
| **Idle Detection** | Pause timer after X minutes inactivity; prompt to keep/discard | S | P2 |
| **Time Budget Alerts** | Warn when task/project exceeds estimated hours | S | P2 |

### Technical Changes
- New model: `TimeEntry` (user_id, task_id, project_id, started_at, ended_at, duration, description, billable)
- Timer state in localStorage + sync to API
- Aggregation scopes on TimeEntry model

---

## Phase 3 — Advanced Views (0.3.x)

**Theme**: Visual project management

### Features

| Feature | Description | Effort | Priority |
|---------|-------------|--------|----------|
| **Kanban Board** | Drag-drop columns = statuses; per-project; swimlanes by priority | L | P0 |
| **Calendar View** | Monthly/weekly view; tasks with due dates; drag to reschedule | L | P1 |
| **Gantt Timeline** | Timeline with milestones, dependencies, critical path | L | P2 |
| **List View Enhancements** | Group by: status, priority, assignee, milestone; saved views | M | P1 |
| **Compact/Dense Mode** | Toggle density for power users | S | P2 |

### Technical Changes
- Kanban: @dnd-kit/core (accessible, headless)
- Calendar: @tanstack/react-virtual + date-fns
- Gantt: vis-timeline or custom Canvas
- Saved views: UserPreference model or localStorage

---

## Phase 4 — Organization & Automation (0.4.x)

**Theme**: Structure work and reduce manual effort

### Features

| Feature | Description | Effort | Priority |
|---------|-------------|--------|----------|
| **Milestones** | Group tasks into milestones with target dates; progress % | M | P1 |
| **Task Dependencies** | Blocking/blocked-by; visual indicators on Kanban/Gantt | M | P1 |
| **Recurring Tasks** | Daily/weekly/monthly/custom; generate next occurrence on completion | M | P2 |
| **Project Templates** | Clone project + tasks + milestones as reusable template | M | P1 |
| **Bulk Actions** | Multi-select: update status, priority, dates, delete, duplicate | S | P1 |
| **Smart Lists** | Saved filter combos (e.g., "Overdue high priority", "This week") | S | P1 |
| **Quick Capture** | Global shortcut (Cmd+K) to create task from anywhere | S | P2 |

### Technical Changes
- Models: `Milestone`, `TaskDependency` (task_id, depends_on_task_id, type)
- Recurring: Cron expression or rrule; scheduler via Laravel Scheduler
- Templates: Deep clone with relationships

---

## Phase 5 — Reporting & Insights (0.5.x)

**Theme**: Data-driven decisions

### Features

| Feature | Description | Effort | Priority |
|---------|-------------|--------|----------|
| **Personal Dashboard** | Active projects, overdue tasks, hours this week, upcoming deadlines | M | P0 |
| **Project Health** | Timeline variance, completion velocity, stale tasks | M | P1 |
| **Productivity Dashboard** | Focus time, context switches, completion rate, streak | M | P2 |
| **Export Reports** | PDF/Excel: project status, timesheets, task lists, invoices | M | P1 |
| **Scheduled Exports** | Weekly email report (Monday morning) | S | P2 |
| **Custom Date Ranges** | Presets + custom picker for all reports | S | P1 |

### Technical Changes
- Materialized views for common aggregates
- PDF: dompdf / browsershot
- Charts: Recharts (already in stack)
- Scheduler for weekly emails

---

## Phase 6 — Data & Customization (0.6.x)

**Theme**: Make it yours

### Features

| Feature | Description | Effort | Priority |
|---------|-------------|--------|----------|
| **Custom Fields** | User-defined fields on projects/tasks (text, select, number, date, user) | M | P1 |
| **Custom Statuses** | Per-project workflow statuses (beyond default 4) | M | P1 |
| **Tags/Labels** | Free-form tags on projects/tasks; filter by tag | S | P1 |
| **Data Export** | Full workspace JSON/CSV (GDPR portability) | M | P1 |
| **Data Import** | CSV import for projects/tasks/clients | M | P2 |
| **Backup/Restore** | Automated daily backup; one-click restore | M | P2 |

### Technical Changes
- Custom fields: JSONB column or EAV table
- Tags: Polymorphic many-to-many
- Import: CSV parsing with validation preview

---

## Phase 7 — Polish, Performance, Mobile (0.7.x)

**Theme**: Production readiness

### Features

| Feature | Description | Effort | Priority |
|---------|-------------|--------|----------|
| **Mobile Responsive** | Touch-optimized Kanban, list, calendar; PWA support | M | P1 |
| **Offline Mode** | Service Worker; queue mutations; sync on reconnect | L | P2 |
| **Keyboard Shortcuts** | Full keyboard navigation; command palette (Cmd+K) | M | P1 |
| **Performance** | Virtualized lists; query optimization; bundle analysis | M | P1 |
| **Accessibility Audit** | WCAG 2.1 AA; screen reader testing | M | P1 |
| **Dark Mode Polish** | System sync; per-project theme; high contrast | S | P2 |
| **Onboarding Flow** | Interactive tour; sample project; tips | S | P2 |

### Technical Changes
- PWA: Workbox + Vite PWA plugin
- Offline: TanStack Query persistence + background sync
- Shortcuts: @tanstack/react-router + hotkeys
- Bundle: vite-bundle-analyzer; code-split by route

---

## Phase 8 — API & Integrations Foundation (0.8.x)

**Theme**: Extensibility

### Features

| Feature | Description | Effort | Priority |
|---------|-------------|--------|----------|
| **API Versioning** | `/api/v1/` with deprecation headers; OpenAPI auto-gen (Scramble) | M | P1 |
| **Personal Access Tokens** | Manage PATs in UI; scopes (read, write, admin) | M | P1 |
| **Webhooks** | Outgoing: project.created, task.completed, time.logged; retry + signature | M | P1 |
| **OAuth Providers** | GitHub, Google, Microsoft (Socialite) | S | P2 |
| **Zapier/Make Integration** | Pre-built webhook templates | S | P2 |

### Technical Changes
- Scramble for OpenAPI generation
- Webhook: spatie/laravel-webhook-client or custom
- PAT: Laravel Sanctum token abilities

---

## Phase 9 — Collaboration & Teams (0.9.x)

**Theme**: Multi-user workflows (last before v1.0.0)

### Features

| Feature | Description | Effort | Priority |
|---------|-------------|--------|----------|
| **Teams/Organizations** | Group users; invite via email; team billing owner | M | P0 |
| **RBAC** | Roles: Owner, Admin, Member, Viewer; per-resource permissions | M | P0 |
| **Project Sharing** | Share with team (read/write); public read-only links | S | P0 |
| **Task Assignment** | Assign tasks to team members; notifications | M | P1 |
| **Comments/@mentions** | Threaded on projects/tasks; real-time via Reverb | M | P1 |
| **Activity Feed** | Unified timeline per project/team | M | P1 |
| **In-App Notifications** | Bell icon; mark read; email digest | M | P1 |

### Technical Changes
- Models: `Team`, `TeamMember`, `ProjectMember`, `Comment`, `Notification`
- Policies: Team-scoped access
- Real-time: Laravel Reverb (WebSockets)
- Requires: Phases 1-4 models (tasks, time entries, etc.)

---

## v1.0.0 — First Stable Release

**Criteria**:
- [ ] All Phase 1-9 features implemented and tested
- [ ] Pest test coverage ≥ 80% (backend)
- [ ] Playwright E2E tests for critical paths
- [ ] Mobile responsive + PWA working
- [ ] API v1 stable with OpenAPI spec
- [ ] Documentation complete (user guide, API docs)
- [ ] CI/CD: test → build → deploy to staging
- [ ] Performance: < 200ms p95 API; < 3s FCP frontend
- [ ] Accessibility: WCAG 2.1 AA
- [ ] Security audit: OWASP top 10

---

## Post-1.0 (1.x+) — Platform Features

| Feature | Description |
|---------|-------------|
| **Marketplace/Plugins** | Custom fields, workflows, integrations as installable packages |
| **Advanced RBAC** | Custom roles, resource-level permissions, SSO (SAML/OIDC) |
| **Audit Log** | Immutable event sourcing; compliance exports |
| **Multi-language** | i18n for UI + user content |
| **White-label** | Custom branding per team |
| **Advanced Analytics** | Cohort analysis, forecasting, benchmarks |
| **Mobile Apps** | React Native / Expo (share codebase) |

---

## Technical Debt & Infrastructure (Ongoing)

| Item | Target Phase |
|------|--------------|
| CI/CD Pipeline (GitHub Actions) | 1 |
| Health Checks / Readiness Probes | 1 |
| Monitoring: Laravel Pulse + Sentry | 1 |
| Frontend Tests: Vitest + Playwright | 2 |
| Load Testing (k6) | 3 |
| CI Matrix: SQLite + PostgreSQL + MySQL | 3 |
| Soft Deletes + Activity Log | 3 |
| Storybook Component Docs | 4 |
| OpenAPI Codegen (TS types) | 4 |
| Kubernetes/Helm Manifests | 8 |

---

## Prioritization Framework

```
Score = (User Impact × 3) + (Revenue Potential × 2) - (Effort × 1.5) + (Strategic Alignment × 2)
```

| Priority | Score | Label |
|----------|-------|-------|
| **P0** | ≥ 20 | Must Have |
| **P1** | 10–19 | Should Have |
| **P2** | 0–9 | Nice to Have |
| **P3** | < 0 | Later |

---

## Release Cadence

| Type | Frequency | Contents |
|------|-----------|----------|
| **Patch** | Weekly | Bug fixes, minor UX |
| **Minor** | Bi-weekly | New features (phase items) |
| **Major** | At 1.0.0 | Stable release |

---

## Success Metrics (Pre-1.0)

| Phase | Metric | Target |
|-------|--------|--------|
| 0.1.x | Tasks/project | > 5 |
| 0.2.x | Time entries/user/week | > 10 |
| 0.3.x | Kanban adoption | > 40% |
| 0.3.x | Saved views/user | > 2 |
| 0.5.x | Report views/week | > 20% WAU |
| 0.6.x | Custom fields usage | > 30% projects |
| 0.7.x | Mobile sessions | > 25% |
| 0.8.x | Webhook integrations | > 10 |
| 0.9.x | Teams created | > 50% users |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-08-25 | Version 0.0.1 → 1.0.0 | Semantic: 0.x = pre-stable; 1.0 = first stable |
| 2026-08-25 | Collaboration in Phase 9 (0.9.x) | Functional features first; teams add complexity |
| 2026-08-25 | Tasks before Time Tracking | Time entries need task_id |
| 2026-08-25 | Kanban before Gantt | Higher adoption; simpler implementation |
| 2026-08-25 | Custom fields in Phase 6 | Enables user workflows without code changes |

---

## Related Documents

- **PRD.md** — Current requirements (v0.0.1)
- **ASSUMPTIONS.md** — Decisions, trade-offs, learning goals
- **README.md** — Setup, architecture, quick start
- **api-spec.yaml** — OpenAPI 3.0 specification