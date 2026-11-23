# Architecture notes (Phase 1)

- **Frontend:** React + TypeScript/Vite. Catalog UI fetches a JSON REST API; products are not hardcoded into React.
- **Backend:** Go/Gin REST API. `api` handles transport; `catalog` handles catalog SQL and domain DTOs; `database` manages the pgx connection pool.
- **Persistence:** PostgreSQL. Product identity is separate from sellers' offers. Prices are integer cents; currency is a 3-letter ISO code.
- **API contract:** `{ "data": ... }` on success; `{ "error": "..." }` on errors. `GET /api/v1/products` accepts `q`, `platform`, `sort`.
- **Security:** All query values are SQL parameters; sort SQL is selected from a hardcoded allowlist. CORS only permits the configured frontend origin.
- **Migration strategy:** Small forward-only versioned SQL runner for learning, with a `schema_migrations` table and SQL transactions. The `.down.sql` files are provided for reference but not executed automatically.
- **Scope:** Phase 1 provides a real connected catalog with sample offers, not authentication, fuzzy search, checkout, or dynamic homepage blocks. Those are future phases.
- **Future checkout:** Store keys per offer, use transactions plus `FOR UPDATE SKIP LOCKED` for safe assignment, and idempotent purchase requests.
- **Deployment:** not deployed in Phase 1. Store credentials only in environment variables, not in the repo.
