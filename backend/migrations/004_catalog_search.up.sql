-- Typos and incomplete terms: pg_trgm gives indexed similarity scoring.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_products_title_trgm ON products USING GIN (title gin_trgm_ops);
CREATE INDEX idx_offers_region_price_active ON offers (region,price_cents,product_id) WHERE active = TRUE;
