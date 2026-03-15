# Workspace

## Overview

pnpm workspace monorepo using TypeScript. This is the student website for **الأستاذ عباس علي الغالبي** — a full-stack Arabic RTL educational platform for sharing study notes (ملازم/PDFs) with categories, ratings, sharing, protected PDF viewer, dark mode, and an admin panel.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS v4 + TanStack Query

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── al-ghalbi/           # React frontend (RTL Arabic student website)
│   └── api-server/          # Express API server
├── lib/
│   ├── api-spec/            # OpenAPI spec + Orval codegen config
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod schemas from OpenAPI
│   └── db/                  # Drizzle ORM schema + DB connection
├── scripts/                 # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Frontend: artifacts/al-ghalbi

Arabic RTL student website with full design:

- **Colors (Day)**: bg `#F7F5F0` (cream), navy `#1A2744`, teal `#0D9488`, gold `#F59E0B`
- **Colors (Night)**: bg `#0F172A`, card `#1E293B`, text `#F1F5F9`
- **Fonts**: Zanjabeel (headings, OTF files in `public/fonts/`) + Cairo (body, from Google Fonts)
- **Preview path**: `/` (root)

### Pages
- `/` — Home page with hero, category filter tabs, notes grid
- `/note/:id` — Note detail with PDF viewer (black overlay when minimized), star rating, share buttons
- `/admin` — Admin stats dashboard
- `/admin/categories` — Manage categories (create/edit/delete)
- `/admin/notes` — Manage notes (create/edit/delete, PDF/image upload)

### Features
- RTL layout (Arabic)
- Dark mode toggle (localStorage)
- 5-star rating system (localStorage fingerprint anti-duplicate)
- WhatsApp/Telegram sharing buttons on each note card
- A4 aspect ratio (1:1.41) for note covers
- Protected PDF viewer (Page Visibility API hides PDF when tab hidden)
- Animated page transitions (framer-motion)

### Vite proxy
Vite dev server proxies `/api/*` → `http://localhost:8080` for API calls.

## API Server: artifacts/api-server

Express API on port 8080. All routes prefixed `/api`.

### Routes
- `GET/POST /api/categories` — list and create categories
- `PATCH/DELETE /api/categories/:id` — update/delete category
- `GET/POST /api/notes` — list notes (with optional `?categoryId=` or `?search=`) and create
- `GET/PATCH/DELETE /api/notes/:id` — get, update, delete note
- `GET /api/notes/:id/similar` — similar notes in same category
- `POST /api/upload/pdf` — upload PDF, auto-detects page count and file size
- `POST /api/upload/image` — upload cover image
- `GET /api/uploads/:filename` — serve uploaded files (static)
- `POST /api/ratings` — submit rating (fingerprint-based duplicate check)
- `GET /api/ratings/:noteId` — get average rating for a note
- `POST /api/stats/event` — record a view/preview/download event
- `GET /api/stats` — get all notes stats for admin dashboard
- `GET /api/stats/:noteId` — get stats for a specific note

### Uploads
Files stored in `artifacts/api-server/uploads/`, served at `/api/uploads/`.

## Database Schema

Tables: `categories`, `notes`, `ratings`, `stats_events`

### categories
- `id`, `name`, `icon` (emoji), `order`, `createdAt`

### notes
- `id`, `title`, `teacherName`, `categoryId`, `version`, `pageCount`, `fileSize`
- `coverImageUrl`, `pdfUrl`, `telegramDownloadUrl`, `telegramPurchaseUrl`
- `createdAt`, `updatedAt`

### ratings
- `id`, `noteId`, `rating` (1-5), `fingerprint`, `createdAt`

### stats_events
- `id`, `noteId`, `eventType` (view/preview_click/download_click), `createdAt`

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, static `/api/uploads`, routes at `/api`
- Routes: `src/routes/index.ts` mounts all sub-routers
- Depends on: `@workspace/db`, `@workspace/api-zod`, `multer`, `pdf-parse`

### `artifacts/al-ghalbi` (`@workspace/al-ghalbi`)

React + Vite + Tailwind CSS v4 frontend with Arabic RTL.

- Entry: `src/main.tsx`
- Routing: wouter
- State: TanStack Query via `@workspace/api-client-react` hooks
- Depends on: `@workspace/api-client-react`, `framer-motion`, `react-hook-form`, etc.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development: `pnpm --filter @workspace/db run push`

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec. Used by `api-server` for request/response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec.

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`.
