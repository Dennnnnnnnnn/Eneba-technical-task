DELETE FROM homepage_section_products WHERE product_id IN (SELECT id FROM products WHERE platform='Gift Card');
DELETE FROM game_keys WHERE offer_id IN (SELECT o.id FROM offers o JOIN products p ON p.id=o.product_id WHERE p.platform='Gift Card');
DELETE FROM products WHERE platform='Gift Card';
ALTER TABLE products DROP COLUMN cashback_percent;
