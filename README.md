# KeyMarket — Eneba-inspired internship marketplace (Phase 1, visual revision)

A small Eneba-inspired marketplace foundation built with **React + TypeScript + Vite**, **Go + Gin REST**, and **PostgreSQL**. Branding is original; this is not affiliated with Eneba.

## What works now

- PostgreSQL schema with distinct **products**, **sellers**, and **offers**.
- Versioned SQL migrations and repeatable sample data (8 games, 3 sellers, 24 offers).
- Go API: `GET /health/live`, `GET /health/ready`, `GET /api/v1/home`, `GET /api/v1/products`, `GET /api/v1/products/:slug`.
- Query params: `q` (case-insensitive partial title), `platform`, `sort` (`name_asc`, `name_desc`, `price_asc`, `price_desc`).
- React catalog: fetches from the backend, has search, platform filter, sort, loading and error states.
- Eneba-inspired purple header, navigation, promo banner, category strip and cover-based product cards.
- Homepage hero, categories, and separately defined product shelves are read from PostgreSQL (`003_homepage.up.sql`) by the Go homepage module.
- Basic Go unit test for sort allowlisting.

This is **Phase 1** only. Real fuzzy typo search, account creation, offers detail pages, carts and checkout are not implemented yet.

## Requirements

Go 1.23+, Node.js 20+, npm, Docker with Docker Compose (or a running PostgreSQL 16 instance).

## Run locally (three terminals)

**Terminal 1 — database:**

```sh
docker compose up -d db
```

**Terminal 2 — API and migrations:**

```sh
cd backend
cp .env.example .env  # optional documentation only: Go does NOT auto-load .env
# If customizing credentials, export DATABASE_URL from backend/.env in your shell.
go mod download
go run ./cmd/migrate
go run ./cmd/api
```

The Go backend defaults to the Docker Compose local database URL. Environment variables override defaults. For example, to load the `.env` file on macOS/Linux before running the commands:

```sh
set -a; . ./.env; set +a
```

**Terminal 3 — frontend:**

```sh
cd frontend
cp .env.example .env
npm install
npm run dev
```

Visit **http://localhost:5173**.

## Verify the backend

```sh
curl http://localhost:8080/health/live
curl http://localhost:8080/health/ready
curl 'http://localhost:8080/api/v1/products?platform=PC&sort=price_asc'
curl http://localhost:8080/api/v1/products/elden-ring
curl http://localhost:8080/api/v1/home
```

The first two health URLs should return `{"status":"ok"}`; the catalog returns `{"data":[...]}`.

## Test and build

```sh
cd backend && go test ./...
cd ../frontend && npm run build
```

## Project layout

```text
backend/cmd/api         HTTP server entrypoint
backend/cmd/migrate     forward-only SQL migration runner
backend/internal/api    Gin router/handlers and CORS
backend/internal/catalog catalog queries + DTOs
backend/migrations      SQL schema and seed data
frontend/src            React UI, API client and styles
docs/                   architecture and AI-work notes
```

## Design decisions

- **Modular monolith** instead of microservices: easier local development and deployment, still logically separated.
- **Products ≠ offers**: one game can have several competing seller prices.
- **Integer prices** prevent floating-point money errors.
- **Prepared values and allowlisted sort** avoid SQL injection through filters.
- **Original KeyMarket identity**, with Eneba-inspired structural styling. Product art is fetched from public Steam CDN URLs as demonstrative external assets; those URLs can fail or change, and placeholders are displayed on image failure. Do not use Eneba logo or claim affiliation.
- **One Go API** is enough for Phase 1; homepage content uses a separate repository and endpoint (`/api/v1/home`), backed by dedicated homepage tables. A future phase can split the independent blocks into more endpoints as needed.

## Troubleshooting

- `connection refused`: make sure `docker compose up -d db` succeeded and port 5432 is free.
- `relation products does not exist`: run `go run ./cmd/migrate` from `backend/`.
- CORS error: the API's `CORS_ORIGIN` must match the browser's frontend origin exactly.
- Frontend API error: ensure the API is running on port 8080 and `VITE_API_URL` is correct.
- Docker Compose unavailable: create a local PostgreSQL database with matching credentials or update `DATABASE_URL`.

## Submission reminder

For final evaluation you still need a GitHub link, a public deployed app, and **full, unabridged AI chat history**. This zip is not yet deployed or uploaded to GitHub. See `docs/ai-conversation.md` for transcript instructions.

## Reference alignment (Nov 2026)

The current Eneba homepage informed the layout: purple top bar, large search field, secondary categories nav, promotional hero, category shortcut icons, and dark-purple game cards with platform/region/price. This is not a pixel-perfect screenshot clone; it is a responsive educational implementation with original branding and seeded content. The top-bar login, cart, and wishlist are visual placeholders, not implemented features. Homepage content is driven by the `/api/v1/home` API.

If upgrading an earlier Phase 1 database, rerun `go run ./cmd/migrate` from `backend/` to apply migration `003_homepage.up.sql`.
