-- Demo homepage artwork references supplied by the user.
-- These are external promotional images: they may change and do not represent actual redeemable inventory.
-- Keep image configuration in PostgreSQL, not React.
UPDATE products SET cover_image_url='https://static.eneba.games/a9eac987225c58ea44d1.jpg' WHERE slug='itunes-card';
UPDATE products SET cover_image_url='https://static.eneba.games/61672776203f4858421a.jpg' WHERE slug='razer-gold-card';
UPDATE products SET cover_image_url='https://static.eneba.games/f3922d5ccca7acf49119.jpg' WHERE slug='netflix-card';
UPDATE products SET cover_image_url='https://static.eneba.games/72fdfccf3450e0cab80e.jpg' WHERE slug='amazon-card';
UPDATE products SET cover_image_url='https://static.eneba.games/5fb9d285ac0d38d3ece2.jpg' WHERE slug='spotify-card';
UPDATE products SET cover_image_url='https://static.eneba.games/004a49f98f45c0c5a5c9.jpg' WHERE slug='binance-card';
UPDATE products SET cover_image_url='https://static.eneba.games/834d1849549a8d8bb76d.jpg' WHERE slug='steam-wallet-card';
UPDATE products SET cover_image_url='https://imgproxy.eneba.games/2da2szcvo6SCbvUjVN4V9YANXlmQcnaKreMgVum3T3U/rs:fit:300/ar:1/czM6Ly9wcm9kdWN0/cy5lbmViYS5nYW1l/cy9wcm9kdWN0cy94/UGIwR3pMWktxOUJN/VUVDeDV3d2E3RnJX/X3hBczB1LWpEazlv/c3RrVW9zLmpwZWc' WHERE slug='psn-100-card';
UPDATE products SET cover_image_url='https://imgproxy.eneba.games/gJrNssRa3stNvSW0JfJyV7TFMfIRcC3W0cWJyzWzU7w/rs:fit:300/ar:1/czM6Ly9wcm9kdWN0/cy5lbmViYS5nYW1l/cy9wcm9kdWN0cy9F/T0FOdTQxZndJdVdJ/QS11YXZ0bkVqdU9D/a2g4Q2NCajVJV2lL/TFpCVXdvLmpwZw' WHERE slug='psn-10-card';
UPDATE products SET cover_image_url='https://static.eneba.games/613df508ab5f4207ab89.jpg' WHERE slug='roblox-1000-card';
UPDATE products SET cover_image_url='https://static.eneba.games/05417e7dd6621364a14d.jpg' WHERE slug='psn-10-gbp-card';
UPDATE products SET cover_image_url='https://static.eneba.games/e62e6919b45e04f95505.jpg' WHERE slug='roblox-200-card';

-- Keep the gift card sections limited to the right demo product type and a predictable order.
DELETE FROM homepage_section_products WHERE section_id IN (SELECT id FROM homepage_sections WHERE position IN (3,4));
INSERT INTO homepage_section_products(section_id,product_id,position) SELECT s.id,p.id,1 FROM homepage_sections s JOIN products p ON p.slug='itunes-card' WHERE s.position=3 ON CONFLICT (section_id,product_id) DO UPDATE SET position=EXCLUDED.position;
INSERT INTO homepage_section_products(section_id,product_id,position) SELECT s.id,p.id,2 FROM homepage_sections s JOIN products p ON p.slug='razer-gold-card' WHERE s.position=3 ON CONFLICT (section_id,product_id) DO UPDATE SET position=EXCLUDED.position;
INSERT INTO homepage_section_products(section_id,product_id,position) SELECT s.id,p.id,3 FROM homepage_sections s JOIN products p ON p.slug='netflix-card' WHERE s.position=3 ON CONFLICT (section_id,product_id) DO UPDATE SET position=EXCLUDED.position;
INSERT INTO homepage_section_products(section_id,product_id,position) SELECT s.id,p.id,4 FROM homepage_sections s JOIN products p ON p.slug='amazon-card' WHERE s.position=3 ON CONFLICT (section_id,product_id) DO UPDATE SET position=EXCLUDED.position;
INSERT INTO homepage_section_products(section_id,product_id,position) SELECT s.id,p.id,5 FROM homepage_sections s JOIN products p ON p.slug='spotify-card' WHERE s.position=3 ON CONFLICT (section_id,product_id) DO UPDATE SET position=EXCLUDED.position;
INSERT INTO homepage_section_products(section_id,product_id,position) SELECT s.id,p.id,6 FROM homepage_sections s JOIN products p ON p.slug='binance-card' WHERE s.position=3 ON CONFLICT (section_id,product_id) DO UPDATE SET position=EXCLUDED.position;
INSERT INTO homepage_section_products(section_id,product_id,position) SELECT s.id,p.id,7 FROM homepage_sections s JOIN products p ON p.slug='steam-wallet-card' WHERE s.position=3 ON CONFLICT (section_id,product_id) DO UPDATE SET position=EXCLUDED.position;
INSERT INTO homepage_section_products(section_id,product_id,position) SELECT s.id,p.id,1 FROM homepage_sections s JOIN products p ON p.slug='psn-100-card' WHERE s.position=4 ON CONFLICT (section_id,product_id) DO UPDATE SET position=EXCLUDED.position;
INSERT INTO homepage_section_products(section_id,product_id,position) SELECT s.id,p.id,2 FROM homepage_sections s JOIN products p ON p.slug='psn-10-card' WHERE s.position=4 ON CONFLICT (section_id,product_id) DO UPDATE SET position=EXCLUDED.position;
INSERT INTO homepage_section_products(section_id,product_id,position) SELECT s.id,p.id,3 FROM homepage_sections s JOIN products p ON p.slug='roblox-1000-card' WHERE s.position=4 ON CONFLICT (section_id,product_id) DO UPDATE SET position=EXCLUDED.position;
INSERT INTO homepage_section_products(section_id,product_id,position) SELECT s.id,p.id,4 FROM homepage_sections s JOIN products p ON p.slug='psn-10-gbp-card' WHERE s.position=4 ON CONFLICT (section_id,product_id) DO UPDATE SET position=EXCLUDED.position;
INSERT INTO homepage_section_products(section_id,product_id,position) SELECT s.id,p.id,5 FROM homepage_sections s JOIN products p ON p.slug='roblox-200-card' WHERE s.position=4 ON CONFLICT (section_id,product_id) DO UPDATE SET position=EXCLUDED.position;
INSERT INTO homepage_section_products(section_id,product_id,position) SELECT s.id,p.id,6 FROM homepage_sections s JOIN products p ON p.slug='steam-wallet-card' WHERE s.position=4 ON CONFLICT (section_id,product_id) DO UPDATE SET position=EXCLUDED.position;
UPDATE homepage_genres SET position=position+100 WHERE name IN ('Roguelike','Platformer','Open World','Story Rich');
UPDATE homepage_genres SET icon='https://assets.eneba.games/tag/v2/action.svg',position=1 WHERE name='Action';
UPDATE homepage_genres SET icon='https://assets.eneba.games/tag/v2/adventure.svg',position=2 WHERE name='Adventure';
UPDATE homepage_genres SET icon='https://assets.eneba.games/tag/v2/simulation.svg',position=3 WHERE name='Simulation';
UPDATE homepage_genres SET icon='https://assets.eneba.games/tag/v2/strategy.svg',position=4 WHERE name='Strategy';
UPDATE homepage_genres SET icon='https://assets.eneba.games/tag/v2/rpg.svg',position=5 WHERE name='RPG';
UPDATE homepage_genres SET icon='https://assets.eneba.games/tag/v2/indie.svg',position=6 WHERE name='Indie';
UPDATE homepage_genres SET icon='https://assets.eneba.games/tag/v2/fps.svg',position=7 WHERE name='FPS / TPS';
UPDATE homepage_genres SET icon='https://assets.eneba.games/tag/v2/puzzle.svg',position=8 WHERE name='Puzzle';
INSERT INTO homepage_genres(name,icon,position) VALUES ('Sport','https://assets.eneba.games/tag/v2/sport.svg',9) ON CONFLICT (name) DO UPDATE SET icon=EXCLUDED.icon,position=EXCLUDED.position;
INSERT INTO homepage_genres(name,icon,position) VALUES ('Racing','https://assets.eneba.games/tag/v2/racing.svg',10) ON CONFLICT (name) DO UPDATE SET icon=EXCLUDED.icon,position=EXCLUDED.position;
INSERT INTO homepage_genres(name,icon,position) VALUES ('Fighting','https://assets.eneba.games/tag/v2/fighting.svg',11) ON CONFLICT (name) DO UPDATE SET icon=EXCLUDED.icon,position=EXCLUDED.position;
