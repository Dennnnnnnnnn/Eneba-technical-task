-- Only for local development: removes sample listings and their sellers.
DELETE FROM offers WHERE seller_id IN (SELECT id FROM sellers WHERE name IN ('PixelVault','GamePort','KeyNest'));
DELETE FROM products WHERE slug IN ('cyberpunk-2077','stardew-valley','hollow-knight','elden-ring','hades','minecraft','the-witcher-3','celeste');
DELETE FROM sellers WHERE name IN ('PixelVault','GamePort','KeyNest');
