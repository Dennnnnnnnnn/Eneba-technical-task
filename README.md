# Eneba-inspired digital marketplace — internship project

**Educational demo, not affiliated with or endorsed by Eneba.** The app demonstrates a marketplace with seller offers and **simulated** digital-key checkout; no real payments or redeemable codes. It uses Eneba styling and a linked brand logo as design references.

## Stack

React 18 + TypeScript + Vite frontend, Go 1.23 + Gin REST backend, PostgreSQL 16 / Neon database, versioned SQL migrations. Deployed together as one Docker web service to keep authentication same-origin.

## Features

- Backend-driven homepage banners, category shortcuts and independent product shelves.
- Catalog with platform/region/price filters, sorting, pagination and PostgreSQL fuzzy search.
- Product details and price comparison across sellers.
- Email/password authentication using signed, HTTP-only session cookies.
- Cart dropdown, cart page, **simulated** checkout with transactional key allocation and order history.
- Recently viewed product IDs stored locally in the browser; full details retrieved from the API.

## Local development

Requirements: Go 1.23+, Node.js 22+, Docker with Compose.

Terminal A (project root):

```sh
docker compose up -d db
```

Terminal B:

```sh
cd backend
go mod download
go run ./cmd/migrate
go run ./cmd/api
```

Terminal C:

```sh
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173. Vite proxies `/api` to Go on port 8080. For Go on another host set `VITE_API_URL` appropriately; **don't point it cross-domain in production** if using same-site cookies.

## Testing

```sh
cd backend && go test ./...
cd ../frontend && npm run build
```

More detailed testing instructions: [docs/TESTING.md](docs/TESTING.md).

## Deployment

One Docker image builds the frontend and backend and serves both at the same HTTPS domain. It needs a PostgreSQL `DATABASE_URL`, a private `SESSION_SECRET`, and secure cookies.

Follow [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Neon and Render. `render.yaml`, `Dockerfile`, `.dockerignore`, `docker/start.sh` and `.github/workflows/ci.yml` are included.

**Live URL:** _Add the actual deployed URL here after deployment._  
**GitHub repository:** _Add the actual GitHub URL after creating the repository._

## Important limitations

- Checkout and keys are fictional/demo-only; no real payment provider.
- The design uses an official Eneba-hosted logo and third-party game art; review asset rights before broader reuse.
- Homepage banners, cashback and stock are sample data.
- Free-tier sleeping/quotas and third-party image availability can affect the demo.
- This is an internship exercise, not a production-ready commerce platform.

## Intern evaluation deliverables

- GitHub repository link: **not created yet**.
- Public deployed link: **not deployed yet**.
- **Full AI chat transcript or share link**: must be provided separately; summary file alone is insufficient. See [docs/AI_LOG_GUIDE.md](docs/AI_LOG_GUIDE.md).

See `docs/architecture.md` for module overview and technical decisions.

## Phase 6: reliability checks

Run `cd backend && go test ./...` for Go security and API unit tests. Run `cd frontend && npm install && npm run build` for TypeScript and the React production bundle.

A separate, **opt-in** HTTP integration test covers two-account demo checkout, digital-key uniqueness, checkout idempotency, and order isolation. Follow [docs/PHASE6_TESTING.md](docs/PHASE6_TESTING.md) before running it; the test creates users and consumes demo inventory, so use an isolated local test database.
