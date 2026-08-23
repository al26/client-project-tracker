# Web - Client Project Tracker Frontend

A server-rendered web app (**TanStack Start** + React) for managing client projects.

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **TanStack Start** (SSR meta-framework)
- **TanStack Router** (file-based routing, type-safe links)
- **TanStack Query v5** (server state: caching, retries, invalidation)
- **React Hook Form** + **Zod** (forms + validation)
- **Tailwind CSS** + **shadcn/ui (BaseUI)** (accessible, unstyled components)
- **Mock API** (in-memory, for UI development without a backend)

## Prerequisites

- **Runtime**: Node.js 20+ / **Bun 1.1+** / **Deno 2+**
- **Package manager**: npm / **pnpm** / **yarn** / **bun**
- **Docker** (optional, for containerized setup)

## Environment & Modes

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Backend API origin | (empty = in-memory mock) |
| `VITE_SHOW_SIGNOUT_DIALOG` | Show 3s confirmation dialog on logout | `false` |

**Modes:**

- **Mock mode** (default): leave `VITE_API_BASE_URL` empty. The app uses an in-memory mock backend with a demo user (`demo@example.com` / `password`). No backend required.
- **API mode (Local)**: set `VITE_API_BASE_URL=http://localhost:8000` to connect to local Laravel API.
- **API mode (Full Stack)**: set `VITE_API_BASE_URL=https://api.cpt.local` to connect via Caddy reverse proxy.

## Quick Start

### Docker (Recommended)

**Standalone (this directory):**
```bash
cd web
cp .env.example .env
docker compose up -d --build
# App at http://localhost:3000
```

**Full Stack (repo root):**
```bash
./start.sh
# App at https://cpt.local
```
> Requires `/etc/hosts` entry: `127.0.0.1 cpt.local api.cpt.local mail.cpt.local`

### Local Development

**npm**
```bash
npm install && npm run dev
```

**pnpm**
```bash
pnpm install && pnpm dev
```

**yarn**
```bash
yarn install && yarn dev
```

**bun**
```bash
bun install && bun run dev
```

> App starts at `http://localhost:3000` for standalone/local development.
> For full stack (Docker), access at `https://cpt.local`.

## Build & Distribution (Web Only)

```bash
# Local production build
npm run build

# Docker build
docker compose build
```

Outputs to `dist/`:
- `dist/client/` → static assets
- `dist/server/server.js` → SSR handler

Serve via: `node server.mjs` (production SSR server)

## TanStack

### Routing (File-Based)

Routes under `src/routes/` auto-register. The router updates `src/routeTree.gen.ts` automatically.

### Project Structure

```
web/src/
├── components/       # UI components (auth, projects, ui primitives)
├── routes/           # File-based routes (TanStack Router)
├── lib/              # Utils, schemas
├── services/         # API, auth, mock DB
├── types/            # TypeScript types
├── hooks/            # Custom React hooks
├── router.tsx        # Router config
├── routeTree.gen.ts  # Auto-generated (do not edit)
├── server.mjs        # Production SSR entry
└── styles.css        # Global styles + Tailwind
```

## Theme & Styling

### Entry Points

- `src/styles.css` — Global CSS + Tailwind directives + `cursor-pointer` rule for interactive elements
- `tailwind.config.js` — Tailwind configuration (extends BaseUI preset)

### Customizing

- **Colors/tokens**: Edit `tailwind.config.js` (extends `baseui` preset)
- **CSS variables**: Define in `src/styles.css` for theming
- **Dark mode**: `use-theme.tsx` (state + localStorage persistence) + `ThemeToggle.tsx` (UI toggle)

### shadcn/ui (BaseUI)

Primitives in `src/components/ui/` — copy from BaseUI, customize as needed.
Use `cn()` helper from `lib/utils.ts` for class merging.