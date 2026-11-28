-- Actual customer wishlist selections, not fabricated popularity counts.
-- Each authenticated user can favorite each product at most once.
CREATE TABLE product_favorites (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, product_id)
);
CREATE INDEX idx_product_favorites_product_id ON product_favorites(product_id);
