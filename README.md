# Eneba-inspired marketplace — internship demo

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

**Phase 2 now implements typo-tolerant search and offers detail pages.** Accounts, cart and checkout remain for Phase 3.

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
# If you already created frontend/.env with VITE_API_URL=http://localhost:8080,
# remove that line or delete frontend/.env to use the development proxy.
npm install
npm run dev
```

Visit **http://localhost:5173** (or **http://127.0.0.1:5173**). Local `/api` requests are proxied by Vite to `http://localhost:8080`, so either frontend host works without CORS changes.

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
- **Educational demo branding:** the frontend displays Eneba’s externally hosted logo as a design reference at the user’s request. It is not affiliated with or endorsed by Eneba. The externally hosted asset may be unavailable. Product art is fetched from public Steam CDN URLs with fallbacks.
- **One Go API** is enough for Phase 1; homepage content uses a separate repository and endpoint (`/api/v1/home`), backed by dedicated homepage tables. A future phase can split the independent blocks into more endpoints as needed.

## Troubleshooting

- `blocked by CORS policy`: ensure `frontend/.env` does not set `VITE_API_URL=http://localhost:8080`; restart `npm run dev` after editing Vite config or `.env`. Requests from the browser should be to `http://localhost:5173/api/v1/...` (or `127.0.0.1:5173`), and Vite forwards them to Go.
- `500 could not load homepage`: run `go run ./cmd/migrate` again and check the Go terminal for database errors.

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

## Phase 2 — catalog, typo search and seller offers (Nov 23 2026)

This iteration extends the previous visual revision and keeps the Go + PostgreSQL modular monolith. To upgrade an existing Phase 1 database, rerun the migrations:

```sh
cd backend
go mod download
go run ./cmd/migrate
go run ./cmd/api
```

New migrations `004_catalog_search.up.sql` and `005_more_catalog_data.up.sql` enable PostgreSQL `pg_trgm` search and seed 12 additional products (20 products total), with offers across GLOBAL/EU/US regions. They run automatically through the existing forward-only migration runner. The sample data is illustrative and prices are fictional.

### New API endpoints and query parameters

| HTTP | URL | Behavior |
| --- | --- | --- |
| GET | `/api/v1/products?q=elden&platform=PC&region=GLOBAL&sort=price_asc&page=1&pageSize=12` | Filtered, sorted, paginated items |
| GET | `/api/v1/products?maxPriceCents=2500&minPriceCents=500` | Price filter using integer EUR cents |
| GET | `/api/v1/search?q=eldn` | Typo-tolerant results ordered by best title match |
| GET | `/api/v1/products/elden-ring` | One product |
| GET | `/api/v1/products/elden-ring/offers` | Seller offers ordered from lowest price |

Catalog responses now use `{"data":{"items": [...],"total":20,"page":1,"pageSize":12,"totalPages":2}}` rather than the Phase 1 `{"data":[...]}` shape. The React API client was updated accordingly. Invalid pagination/price inputs return HTTP 400. Page size is capped at 48. An unrecognized sort falls back to alphabetical order.

The product pages have browser URLs such as `/products/elden-ring` and can be opened directly or using back/forward navigation. The UI includes a price apply control, price/region/platform filters, sort order, and previous/next buttons. A purchase button is intentionally **disabled** until Phase 3 implements authentication, digital inventory, and transaction-safe checkout. Showing a fake working purchase button would be misleading.

**Search scope:** `pg_trgm` similarity threshold is 0.20; this catches many common misspellings, but is not a full search engine. The query also supports `ILIKE` partial matches. Results show price and offer count of **eligible seller offers** after the region/price filters; seller-offer detail pages display all active offers. The database uses a single currency (EUR) for this demo.

### Manual acceptance checks

1. Run migrations and API; check `/health/ready` is OK.
2. Open `/store` and verify 20 products across two pages with default 12-per-page pagination.
3. Search for `eldn`, `cyber`, and `hollow`; verify the expected game appears.
4. Choose `EU` and verify products with eligible EU offers; use price filtering and inspect resulting prices.
5. Open `/products/elden-ring`; verify seller names, prices, and ordering.
6. Set max price lower than minimum: verify frontend error; send negative API price and verify HTTP 400.
7. Confirm homepage shelves still load from `/api/v1/home`.

### Limitations

- JWT authentication, cart, checkout, real digital-key inventory, and order history are **not yet implemented** (Phase 3).
- Frontend URLs are managed with the History API, not a routing package. The Vite dev server handles SPA fallback; deployment needs equivalent rewrite rules.
- Frontend images depend on external Steam CDN availability. Educational styling is Eneba-inspired, not affiliated with Eneba.
- This archive has not been deployed to a public URL or pushed to GitHub.
- Go/npm dependencies were not installed in the file-generation environment; full build, test, and end-to-end integration results must be verified locally.

## Search troubleshooting (Phase 2 patch)

The header search now clears previously chosen region/platform/price filters so a global search for `cyber` cannot be accidentally restricted by those settings. The catalog still supports combining search with filters when chosen afterwards.

To check the underlying API, open `http://localhost:8080/api/v1/search?q=cyber`. With migrations and seed data applied, `data.items` should contain Cyberpunk 2077. If it does not, run `go run ./cmd/migrate` from `backend/` and check Go terminal logs, then inspect `GET /api/v1/products?q=cyber&sort=relevance` in the browser Network tab. The frontend patch cannot fix a failing API or an empty database.

---

## Phase 3 — Authentication, cart and simulated checkout

**What's new:** account registration/login/logout, httpOnly signed session cookie, protected cart, product-offer selection, simulated payment, unique demo digital-key fulfillment, protected order history, plus enhanced Eneba-inspired UI styling and mobile layouts.

### Upgrading a Phase 2 installation

Replace the project files with this package, while retaining any personal `.env` and local database. From the repository root:

```bash
# start the database (Docker needed)
docker compose up -d db
# run migrations 001–006 in order (applied migrations are skipped)
cd backend
go mod tidy
go run ./cmd/migrate
go run ./cmd/api
```

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`. Select a product, compare seller offers, add one to cart, register or log in, then click **Pay in demo mode**. Order history and demo keys are available after checkout. Migrations initialize three fictional keys per seller offer.

### Important deployment configuration

The frontend's Vite dev server forwards `/api` calls to Go on port 8080, so session cookies are same-origin in local development. For a deployed app, configure a **same-origin reverse proxy for `/api`**, not separate cross-site browser fetches. Set production `SESSION_SECRET` to a unique high-entropy value, `COOKIE_SECURE=true`, `GIN_MODE=release`, correct `CORS_ORIGIN`, HTTPS and a PostgreSQL `DATABASE_URL`. Do not commit secrets or use the development fallback secret in production.

### New API routes

| HTTP | Path | Authentication |
| --- | --- | --- |
| POST | `/api/v1/auth/register` | Public |
| POST | `/api/v1/auth/login` | Public |
| POST | `/api/v1/auth/logout` | Public |
| GET | `/api/v1/auth/me` | Signed in |
| GET | `/api/v1/cart` | Signed in |
| POST | `/api/v1/cart/items` (`{ "offerId": 1 }`) | Signed in |
| DELETE | `/api/v1/cart/items/:offerId` | Signed in |
| POST | `/api/v1/checkout` (`{ "idempotencyKey": "unique-value-at-least-16-chars" }`) | Signed in |
| GET | `/api/v1/orders` | Signed in |
| GET | `/api/v1/orders/:id` | Signed in; owner only |

Use `docs/phase3-test-plan.md` for verification steps and limitations.

**AI logs:** This repository contains implementation notes, not a complete transcript. Export or link the full original AI conversation, including user messages and assistant replies, for submission. Do not claim a summary is a full transcript.


## Phase 3.5 — Eneba-inspired homepage refresh

Apply migration `007_homepage_design.up.sql` using `cd backend && go run ./cmd/migrate`, then restart the API and frontend. This upgrade does not delete orders or change checkout.

The homepage now loads independent REST resources from PostgreSQL:

- `GET /api/v1/home/banners` — four ordered promotional banners.
- `GET /api/v1/home/categories` — scrollable category shortcuts.
- `GET /api/v1/home/sections` — section metadata and order.
- `GET /api/v1/home/sections/:id` — products for **that section**, fetched individually by each React carousel.
- `GET /api/v1/home/genres` — dynamic category cards with counts from relational associations.

**Deliberate demo limitations:** This seed database only contains games, so gift-card sections show sample games until real eGift Card / gift-card products are added. Discount percentages, cashback amounts, payment-provider logos as actual payment methods, newsletter subscriptions, reviews, and functional wishlists are not fabricated. "Add to cart" on a homepage card fetches current offers and adds the cheapest one; "View offers" opens seller comparison. Banner art is an external illustrative image and is not official GTA VI artwork. Categories grid counts represent seeded data, not Eneba's total product counts.

Keep the footer non-affiliation statement; the Eneba name and logo are used solely as design references for this educational project.

### Visual QA

1. Confirm `/api/v1/home/banners` returns 4 banners after migration 007.
2. Confirm category shortcuts scroll horizontally.
3. Hover a card: wishlist heart and two CTA buttons appear in the lower image area.
4. Hover a product section: carousel arrows appear; the left arrow is hidden at the beginning; the progress indicator moves while scrolling.
5. Click a product card's Add to cart: the lowest-priced seller offer should be added to the cart (sign in first if prompted). View offers should navigate to the comparison page.
6. Click Load more on Categories: 4 additional rows/cards appear until exhausted.
7. Confirm cart/login/checkout from Phase 3 are unaffected.

**Note on AI history:** `docs/ai-conversation.md` is an activity summary only; export the full original ChatGPT conversation (both prompts and responses) for submission.


## Phase 3.6 — Screenshot-based homepage refinements

Apply migration **008** after migration 007 (migrations run sequentially):

```bash
cd backend
go mod tidy
go run ./cmd/migrate
go run ./cmd/api
```

Then in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

This revision adds a dropdown cart, full-bleed promo, better carousel progress, upward-moving card details and actions, locally designed demo eGift-card art, demo gift-card inventory, API-configured cashback percentages, and category SVG artwork. See `docs/phase3-design-patch.md` for verification and limitations. The cashback text is illustrative and is **not** issued as real credit; all digital keys are fictional. The cart still uses a single key per seller offer, so the plus control in the popover is intentionally disabled.
