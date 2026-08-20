# Web - Client Project Tracker Frontend

A simple **Single Page Application (SPA)** for managing client projects.

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **TanStack Router** (file-based routing, type-safe links)
- **TanStack Query v5** (server state: caching, retries, invalidation)
- **React Hook Form** + **Zod** (forms + validation)
- **Tailwind CSS** + **shadcn/ui (BaseUI)** (accessible, unstyled components)
- **Mock API** (in-memory, for UI development without a backend)

## Prerequisites

- **Runtime**: Node.js 20+ / **Bun 1.1+** / **Deno 2+**
- **Package manager**: npm / **pnpm** / **yarn** / **bun**

## Local Setup

```bash
cd web
cp .env.example .env

# Install deps (pick one)
npm install        # npm
pnpm install       # pnpm
yarn install       # yarn
bun install        # bun

# Start dev server
npm run dev        # npm
pnpm dev           # pnpm
yarn dev           # yarn
bun run dev        # bun
```

The app starts at `http://localhost:3000`.

## Environment (`.env.example`)

| Variable                   | Purpose                               | Default                  |
| -------------------------- | ------------------------------------- | ------------------------ |
| `VITE_API_BASE_URL`        | Backend API origin                    | (empty = in-memory mock) |
| `VITE_SHOW_SIGNOUT_DIALOG` | Show 3s confirmation dialog on logout | `false`                  |

## Modes

- **Mock mode** (default): leave `VITE_API_BASE_URL` empty. The app uses an
  in-memory mock backend with a demo user (`demo@example.com` / `password`).
  No backend required.
- **API mode**: set `VITE_API_BASE_URL=http://localhost:8000` (or your
  production host) to connect to the Laravel API.

## Build

```bash
npm run build
# Outputs to dist/ — deploy as a static server app or use the Dockerfile
```

## Routing

Routes are file-based under `src/routes/`. Adding a file there automatically
registers the route; the router updates `src/routeTree.gen.ts`.

## Project Structure

```
web/src/
├── components/
│   ├── AppHeader.tsx          # Shared header: breadcrumbs, theme toggle, account menu
│   ├── ThemeToggle.tsx        # Dark/light mode toggle (persists to localStorage)
│   ├── auth/
│   │   ├── AuthShell.tsx      # Auth layout wrapper (protects routes, redirects)
│   │   ├── RequireAuth.tsx    # Route guard: redirects unauthenticated users to /login
│   │   └── SignOutDialog.tsx  # Confirmation dialog before sign-out (optional)
│   ├── projects/
│   │   ├── ProjectCard.tsx    # Single project display: name, client, status/priority badges, dates
│   │   ├── ProjectBadges.tsx  # Reusable status/priority badge components with color coding
│   │   ├── ProjectStats.tsx   # Dashboard summary cards: total, by status, by priority
│   │   ├── ProjectFormDialog.tsx  # Create/edit project form (RHF + Zod validation)
│   │   ├── ProjectDetailDialog.tsx  # Read-only project detail view
│   │   └── DeleteProjectDialog.tsx  # Confirmation dialog for project deletion
│   └── ui/                    # shadcn/ui (BaseUI) primitives: button, input, dialog, toast, etc.
├── routes/                    # File-based routes (TanStack Router)
│   ├── __root.tsx             # Root layout: providers, header, outlet
│   ├── index.tsx              # Redirect → /projects
│   ├── profile.tsx            # User profile page
│   ├── verify-email.tsx       # Email verification (OTP/magic link)
│   ├── forgot-password.tsx    # Request password reset
│   ├── reset-password.tsx     # Reset password with token
│   ├── login.tsx              # Login form (mock or API mode)
│   └── register.tsx           # Registration form
├── lib/
│   ├── utils.ts               # cn() helper
│   └── project-schema.ts      # Zod schemas for project validation
├── services/                  # API & business logic
│   ├── api.ts                 # Base fetch wrapper + error handling
│   ├── auth-api.ts            # Auth endpoints (login, register, logout, etc.)
│   ├── auth-token.ts          # Token storage/retrieval (localStorage)
│   └── mock-db.ts             # In-memory mock database (demo user + seed projects)
├── types/
│   └── project.ts             # TypeScript types for Project, enums, API responses
├── hooks/
│   ├── use-auth.tsx           # Auth state + actions (login, logout, user)
│   ├── use-projects.ts        # Project queries/mutations (list, create, update, delete)
│   ├── use-theme.tsx          # Dark/light theme state + persistence
│   └── use-mobile.tsx         # Mobile breakpoint detection
├── router.tsx                 # Router configuration + route tree registration
├── routeTree.gen.ts           # Auto-generated route tree (do not edit)
└── styles.css                 # Global styles + cursor-pointer rule
```

## Cursor pointers

All interactive elements (buttons, links, dropdown items) use `cursor-pointer`
via a global CSS rule in `src/styles.css`.
