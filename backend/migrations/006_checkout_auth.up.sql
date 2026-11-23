-- Phase 3: users, server-side cart, transactional simulated checkout and digital-key fulfillment.
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT users_email_normalized CHECK (email = LOWER(TRIM(email)))
);
CREATE TABLE cart_items (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  offer_id BIGINT NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, offer_id)
);
CREATE TABLE game_keys (
  id BIGSERIAL PRIMARY KEY,
  offer_id BIGINT NOT NULL REFERENCES offers(id),
  key_value TEXT NOT NULL UNIQUE,
  order_item_id BIGINT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX game_keys_available_idx ON game_keys (offer_id, id) WHERE order_item_id IS NULL;
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  idempotency_key TEXT NOT NULL,
  total_cents BIGINT NOT NULL CHECK (total_cents >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL CHECK(status IN ('paid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, idempotency_key)
);
CREATE INDEX orders_user_idx ON orders(user_id, id DESC);
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  offer_id BIGINT NOT NULL REFERENCES offers(id),
  product_title TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  platform TEXT NOT NULL,
  region TEXT NOT NULL,
  price_cents BIGINT NOT NULL CHECK (price_cents >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'EUR'
);
ALTER TABLE game_keys ADD CONSTRAINT game_keys_order_item_fk
  FOREIGN KEY (order_item_id) REFERENCES order_items(id);
-- Explicitly fictional sample inventory for demonstration only.
INSERT INTO game_keys (offer_id, key_value)
SELECT o.id, 'DEMO-' || LPAD(o.id::text,6,'0') || '-' || LPAD(n::text,4,'0') || '-NOT-REAL'
FROM offers o CROSS JOIN generate_series(1, 3) n
ON CONFLICT (key_value) DO NOTHING;
