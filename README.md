# Eneba-inspired digital marketplace

**Internship technical assignment · educational demo**

A full-stack marketplace for digital games and gift cards, inspired by the look and feel of [Eneba](https://www.eneba.com/). Visitors can explore a catalog, search for games, compare offers from multiple sellers, and complete a **simulated** purchase that delivers a demo digital key.

> **Disclaimer:** This project is not affiliated with or endorsed by Eneba. No real payments are processed, and the delivered keys are fictional and cannot be redeemed. Eneba branding and externally hosted artwork are used as visual references; usage rights must be reviewed before reuse outside this demonstration.

## Links
- **Live demo:** https://eneba-technical-task.onrender.com/

> The live demo is deployed with Render. Its availability may vary due to hosting limits; verify the links before submitting.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite |
| Backend | **Go 1.25**, Gin, REST API |
| Database | PostgreSQL 16 locally; hosted PostgreSQL on Neon |
| Authentication | Email/password, signed HttpOnly session cookies |
| Hosting | Single Docker Web Service on Render |
| Testing | Go tests, TypeScript production build, opt-in HTTP integration script |

Using one production origin lets Go serve both the React application and `/api/v1/*` endpoints, simplifying session-cookie handling.

## Implemented functionality

- **Homepage:** Backend-provided banners, shortcuts, product shelves, and categories; each shelf loads from its own API endpoint.
- **Store:** Product catalog with search, platform/region/price filters, sorting, and pagination.
- **Search:** PostgreSQL-backed name search with partial and typo-tolerant matching.
- **Product details:** Game information and offers from multiple sellers, region selection, and a purchase sidebar.
- **Favorites:** Signed-in users can save products; counts are persisted in the database.
- **Authentication:** Registration, login, logout, and routes protected by session authentication.
- **Cart and checkout:** Add/remove seller offers, simulate a purchase, allocate demo keys transactionally, and review order history.
- **Recently viewed:** Product identifiers are remembered in the browser; details are fetched from the API.

Some UI elements (including PayPal styling, cashback promotions, and language/currency preferences) are **demonstrations**, not live integrations. Actual checkout remains simulated and denominated in EUR.

## Architecture

```text
Browser (React + TypeScript)
        |
        | REST/JSON + session cookie
        v
Go API (Gin)
  |-- catalog and search
  |-- homepage content
  |-- authentication and favorites
  |-- cart, checkout and orders
        |
        v
PostgreSQL (products, offers, users, keys, orders)
```

In production the Go HTTP server also serves the compiled React assets from `/app/public`.

## Run locally

**Prerequisites:** Go **1.25**, Node.js **22+**, Docker and Docker Compose.

1. Start the database from the repository root:

   ```bash
   docker compose up -d db
   ```

2. Configure backend environment variables. Set `DATABASE_URL` to your local PostgreSQL connection string and `SESSION_SECRET` to a long random value. For example, for the default development-only Compose credentials:

   ```bash
   export DATABASE_URL='postgres://marketplace:marketplace_dev_only@localhost:5432/marketplace?sslmode=disable'
   export SESSION_SECRET='replace-with-a-long-random-secret'
   export COOKIE_SECURE=false
   ```

   These examples are for local development only. Never commit production credentials. On Windows, set the environment variables using your shell's syntax.

3. Run migrations and the API:

   ```bash
   cd backend
   go mod download
   go run ./cmd/migrate
   go run ./cmd/api
   ```

4. In another terminal, start the React app:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

