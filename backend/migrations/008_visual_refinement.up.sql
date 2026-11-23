-- Phase 3.6 visual refinement: real demo gift-card entities and backend-owned cashback config.
-- All codes remain explicitly fictional; no third-party redemption is possible.
ALTER TABLE products ADD COLUMN cashback_percent INT NOT NULL DEFAULT 5 CHECK (cashback_percent BETWEEN 0 AND 25);
INSERT INTO products(slug,title,description,platform,cover_color,cover_image_url,cashback_percent) VALUES ('itunes-card','iTunes demo gift card','Fictional, non-redeemable demo card for internship testing','Gift Card','#ddd7f0','/demo-gift-cards/itunes.svg',5) ON CONFLICT(slug) DO NOTHING;
INSERT INTO offers(product_id,seller_id,region,price_cents,currency) SELECT p.id,s.id,'GLOBAL', 1000, 'EUR' FROM products p JOIN sellers s ON s.name='PixelVault' WHERE p.slug='itunes-card' ON CONFLICT(product_id,seller_id,region) DO NOTHING;
INSERT INTO products(slug,title,description,platform,cover_color,cover_image_url,cashback_percent) VALUES ('razer-gold-card','Razer Gold demo gift card','Fictional, non-redeemable demo card for internship testing','Gift Card','#171717','/demo-gift-cards/razer.svg',5) ON CONFLICT(slug) DO NOTHING;
INSERT INTO offers(product_id,seller_id,region,price_cents,currency) SELECT p.id,s.id,'GLOBAL', 1500, 'EUR' FROM products p JOIN sellers s ON s.name='PixelVault' WHERE p.slug='razer-gold-card' ON CONFLICT(product_id,seller_id,region) DO NOTHING;
INSERT INTO products(slug,title,description,platform,cover_color,cover_image_url,cashback_percent) VALUES ('netflix-card','Netflix demo gift card','Fictional, non-redeemable demo card for internship testing','Gift Card','#161616','/demo-gift-cards/netflix.svg',5) ON CONFLICT(slug) DO NOTHING;
INSERT INTO offers(product_id,seller_id,region,price_cents,currency) SELECT p.id,s.id,'GLOBAL', 2000, 'EUR' FROM products p JOIN sellers s ON s.name='PixelVault' WHERE p.slug='netflix-card' ON CONFLICT(product_id,seller_id,region) DO NOTHING;
INSERT INTO products(slug,title,description,platform,cover_color,cover_image_url,cashback_percent) VALUES ('amazon-card','Amazon demo gift card','Fictional, non-redeemable demo card for internship testing','Gift Card','#121f37','/demo-gift-cards/amazon.svg',5) ON CONFLICT(slug) DO NOTHING;
INSERT INTO offers(product_id,seller_id,region,price_cents,currency) SELECT p.id,s.id,'GLOBAL', 2500, 'EUR' FROM products p JOIN sellers s ON s.name='PixelVault' WHERE p.slug='amazon-card' ON CONFLICT(product_id,seller_id,region) DO NOTHING;
INSERT INTO products(slug,title,description,platform,cover_color,cover_image_url,cashback_percent) VALUES ('spotify-card','Spotify demo gift card','Fictional, non-redeemable demo card for internship testing','Gift Card','#53b76b','/demo-gift-cards/spotify.svg',5) ON CONFLICT(slug) DO NOTHING;
INSERT INTO offers(product_id,seller_id,region,price_cents,currency) SELECT p.id,s.id,'GLOBAL', 1200, 'EUR' FROM products p JOIN sellers s ON s.name='PixelVault' WHERE p.slug='spotify-card' ON CONFLICT(product_id,seller_id,region) DO NOTHING;
INSERT INTO products(slug,title,description,platform,cover_color,cover_image_url,cashback_percent) VALUES ('binance-card','Binance demo gift card','Fictional, non-redeemable demo card for internship testing','Gift Card','#e6b92c','/demo-gift-cards/binance.svg',5) ON CONFLICT(slug) DO NOTHING;
INSERT INTO offers(product_id,seller_id,region,price_cents,currency) SELECT p.id,s.id,'GLOBAL', 2000, 'EUR' FROM products p JOIN sellers s ON s.name='PixelVault' WHERE p.slug='binance-card' ON CONFLICT(product_id,seller_id,region) DO NOTHING;
INSERT INTO products(slug,title,description,platform,cover_color,cover_image_url,cashback_percent) VALUES ('psn-100-card','PlayStation Network Card 100 EUR demo','Fictional, non-redeemable demo card for internship testing','Gift Card','#1965a8','/demo-gift-cards/playstation.svg',5) ON CONFLICT(slug) DO NOTHING;
INSERT INTO offers(product_id,seller_id,region,price_cents,currency) SELECT p.id,s.id,'US', 9300, 'EUR' FROM products p JOIN sellers s ON s.name='PixelVault' WHERE p.slug='psn-100-card' ON CONFLICT(product_id,seller_id,region) DO NOTHING;
INSERT INTO products(slug,title,description,platform,cover_color,cover_image_url,cashback_percent) VALUES ('psn-10-card','PlayStation Network Card 10 EUR demo','Fictional, non-redeemable demo card for internship testing','Gift Card','#1965a8','/demo-gift-cards/playstation.svg',5) ON CONFLICT(slug) DO NOTHING;
INSERT INTO offers(product_id,seller_id,region,price_cents,currency) SELECT p.id,s.id,'GLOBAL', 950, 'EUR' FROM products p JOIN sellers s ON s.name='PixelVault' WHERE p.slug='psn-10-card' ON CONFLICT(product_id,seller_id,region) DO NOTHING;
INSERT INTO products(slug,title,description,platform,cover_color,cover_image_url,cashback_percent) VALUES ('roblox-1000-card','Roblox 1000 Robux demo card','Fictional, non-redeemable demo card for internship testing','Gift Card','#161616','/demo-gift-cards/roblox.svg',5) ON CONFLICT(slug) DO NOTHING;
INSERT INTO offers(product_id,seller_id,region,price_cents,currency) SELECT p.id,s.id,'GLOBAL', 980, 'EUR' FROM products p JOIN sellers s ON s.name='PixelVault' WHERE p.slug='roblox-1000-card' ON CONFLICT(product_id,seller_id,region) DO NOTHING;
INSERT INTO products(slug,title,description,platform,cover_color,cover_image_url,cashback_percent) VALUES ('psn-10-gbp-card','PlayStation Network 10 GBP demo card','Fictional, non-redeemable demo card for internship testing','Gift Card','#1965a8','/demo-gift-cards/playstation.svg',5) ON CONFLICT(slug) DO NOTHING;
INSERT INTO offers(product_id,seller_id,region,price_cents,currency) SELECT p.id,s.id,'GLOBAL', 1150, 'EUR' FROM products p JOIN sellers s ON s.name='PixelVault' WHERE p.slug='psn-10-gbp-card' ON CONFLICT(product_id,seller_id,region) DO NOTHING;
INSERT INTO products(slug,title,description,platform,cover_color,cover_image_url,cashback_percent) VALUES ('roblox-200-card','Roblox 200 Robux demo card','Fictional, non-redeemable demo card for internship testing','Gift Card','#161616','/demo-gift-cards/roblox.svg',5) ON CONFLICT(slug) DO NOTHING;
INSERT INTO offers(product_id,seller_id,region,price_cents,currency) SELECT p.id,s.id,'GLOBAL', 280, 'EUR' FROM products p JOIN sellers s ON s.name='PixelVault' WHERE p.slug='roblox-200-card' ON CONFLICT(product_id,seller_id,region) DO NOTHING;
INSERT INTO products(slug,title,description,platform,cover_color,cover_image_url,cashback_percent) VALUES ('steam-wallet-card','Steam Wallet demo card','Fictional, non-redeemable demo card for internship testing','Gift Card','#182437','/demo-gift-cards/steam.svg',5) ON CONFLICT(slug) DO NOTHING;
INSERT INTO offers(product_id,seller_id,region,price_cents,currency) SELECT p.id,s.id,'GLOBAL', 2500, 'EUR' FROM products p JOIN sellers s ON s.name='PixelVault' WHERE p.slug='steam-wallet-card' ON CONFLICT(product_id,seller_id,region) DO NOTHING;
INSERT INTO game_keys(offer_id,key_value)
SELECT o.id,'DEMO-GIFT-'||LPAD(o.id::text,6,'0')||'-'||LPAD(n::text,3,'0')||'-NOT-REAL'
FROM offers o JOIN products p ON p.id=o.product_id CROSS JOIN generate_series(1,3) n
WHERE p.platform='Gift Card' ON CONFLICT(key_value) DO NOTHING;
-- Gift-card shelves no longer contain games, and are independently served by their existing endpoints.
DELETE FROM homepage_section_products WHERE section_id IN (SELECT id FROM homepage_sections WHERE position IN (3,4));
INSERT INTO homepage_section_products(section_id,product_id,position)
SELECT s.id,p.id,ROW_NUMBER() OVER(PARTITION BY s.id ORDER BY p.id)
FROM homepage_sections s JOIN products p ON
 (s.position=3 AND p.slug IN ('itunes-card','razer-gold-card','netflix-card','amazon-card','spotify-card','binance-card','steam-wallet-card')) OR
 (s.position=4 AND p.slug IN ('psn-100-card','psn-10-card','roblox-1000-card','psn-10-gbp-card','roblox-200-card','steam-wallet-card'));
UPDATE homepage_genres SET icon= CASE name
 WHEN 'Action' THEN '/category-icons/action.svg' WHEN 'Adventure' THEN '/category-icons/adventure.svg'
 WHEN 'Simulation' THEN '/category-icons/simulation.svg' WHEN 'Strategy' THEN '/category-icons/strategy.svg'
 WHEN 'RPG' THEN '/category-icons/rpg.svg' WHEN 'Indie' THEN '/category-icons/indie.svg'
 WHEN 'FPS / TPS' THEN '/category-icons/fps.svg' WHEN 'Puzzle' THEN '/category-icons/puzzle.svg'
 WHEN 'Roguelike' THEN '/category-icons/roguelike.svg' WHEN 'Platformer' THEN '/category-icons/platformer.svg'
 WHEN 'Open World' THEN '/category-icons/open-world.svg' WHEN 'Story Rich' THEN '/category-icons/story.svg'
 ELSE icon END;
