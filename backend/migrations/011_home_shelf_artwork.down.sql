-- Restore locally bundled demo artwork; retain user data.
UPDATE products SET cover_image_url='/demo-gift-cards/itunes.svg' WHERE slug='itunes-card';
UPDATE products SET cover_image_url='/demo-gift-cards/razer.svg' WHERE slug='razer-gold-card';
UPDATE products SET cover_image_url='/demo-gift-cards/netflix.svg' WHERE slug='netflix-card';
UPDATE products SET cover_image_url='/demo-gift-cards/amazon.svg' WHERE slug='amazon-card';
UPDATE products SET cover_image_url='/demo-gift-cards/spotify.svg' WHERE slug='spotify-card';
UPDATE products SET cover_image_url='/demo-gift-cards/binance.svg' WHERE slug='binance-card';
UPDATE products SET cover_image_url='/demo-gift-cards/steam.svg' WHERE slug='steam-wallet-card';
UPDATE products SET cover_image_url='/demo-gift-cards/playstation.svg' WHERE slug='psn-100-card';
UPDATE products SET cover_image_url='/demo-gift-cards/playstation.svg' WHERE slug='psn-10-card';
UPDATE products SET cover_image_url='/demo-gift-cards/roblox.svg' WHERE slug='roblox-1000-card';
UPDATE products SET cover_image_url='/demo-gift-cards/playstation.svg' WHERE slug='psn-10-gbp-card';
UPDATE products SET cover_image_url='/demo-gift-cards/roblox.svg' WHERE slug='roblox-200-card';
DELETE FROM homepage_genres WHERE name IN ('Sport','Racing','Fighting');
UPDATE homepage_genres SET position=position-100 WHERE name='Roguelike';
UPDATE homepage_genres SET position=position-100 WHERE name='Platformer';
UPDATE homepage_genres SET position=position-100 WHERE name='Open World';
UPDATE homepage_genres SET position=position-100 WHERE name='Story Rich';
