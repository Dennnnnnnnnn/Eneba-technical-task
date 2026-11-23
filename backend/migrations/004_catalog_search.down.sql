DROP INDEX IF EXISTS idx_offers_region_price_active;
DROP INDEX IF EXISTS idx_products_title_trgm;
-- Deliberately leave pg_trgm installed; other database objects may use it.
