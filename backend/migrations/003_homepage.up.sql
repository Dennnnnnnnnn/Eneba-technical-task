-- Homepage configuration/content lives in PostgreSQL, never in the React component.
ALTER TABLE products ADD COLUMN cover_image_url TEXT NOT NULL DEFAULT '';
UPDATE products SET cover_image_url = CASE slug
 WHEN 'cyberpunk-2077' THEN 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900.jpg'
 WHEN 'stardew-valley' THEN 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/413150/library_600x900.jpg'
 WHEN 'hollow-knight' THEN 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/library_600x900.jpg'
 WHEN 'elden-ring' THEN 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg'
 WHEN 'hades' THEN 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145360/library_600x900.jpg'
 WHEN 'minecraft' THEN ''
 WHEN 'the-witcher-3' THEN 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/library_600x900.jpg'
 WHEN 'celeste' THEN 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/504230/library_600x900.jpg'
 ELSE '' END;

CREATE TABLE homepage_hero (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  eyebrow TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  button_text TEXT NOT NULL,
  button_href TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  theme TEXT NOT NULL DEFAULT 'violet'
);
CREATE TABLE homepage_categories (
 id BIGSERIAL PRIMARY KEY,
 name TEXT NOT NULL,
 icon TEXT NOT NULL,
 href TEXT NOT NULL,
 position INTEGER NOT NULL UNIQUE
);
CREATE TABLE homepage_sections (
 id BIGSERIAL PRIMARY KEY,
 title TEXT NOT NULL,
 subtitle TEXT NOT NULL DEFAULT '',
 position INTEGER NOT NULL UNIQUE
);
CREATE TABLE homepage_section_products (
 section_id BIGINT NOT NULL REFERENCES homepage_sections(id) ON DELETE CASCADE,
 product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
 position INTEGER NOT NULL,
 PRIMARY KEY (section_id, product_id),
 UNIQUE (section_id, position)
);
INSERT INTO homepage_hero (id, eyebrow, title, subtitle, button_text, button_href, image_url, theme) VALUES
(1, 'YOUR NEXT GAME STARTS HERE', 'Big games. Smaller prices.', 'Browse digital game keys from competing sellers in one marketplace.', 'Explore games', '#store', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/library_hero.jpg', 'violet');
INSERT INTO homepage_categories(name, icon, href, position) VALUES
('Games', 'gamepad', '#store', 1),('Gaming eCards', 'gift', '#store', 2),('eGift Cards', 'card', '#store', 3),
('E-money', 'wallet', '#store', 4),('Steam', 'steam', '#store', 5),('Steam Gift Cards', 'gift', '#store', 6),
('PSN', 'playstation', '#store', 7),('Xbox', 'xbox', '#store', 8),('Nintendo', 'switch', '#store', 9),
('Cheap games', 'tag', '#store', 10);
INSERT INTO homepage_sections(title, subtitle, position) VALUES
('Top games', 'Popular digital game keys', 1),
('Best deals', 'Shop offers across sellers', 2),
('Explore more games', 'Something for your next adventure', 3);
INSERT INTO homepage_section_products (section_id, product_id, position)
SELECT s.id, p.id, x.position FROM
(VALUES
('Top games','elden-ring',1),('Top games','cyberpunk-2077',2),('Top games','the-witcher-3',3),('Top games','minecraft',4),
('Best deals','hades',1),('Best deals','stardew-valley',2),('Best deals','hollow-knight',3),('Best deals','celeste',4),
('Explore more games','minecraft',1),('Explore more games','hollow-knight',2),('Explore more games','elden-ring',3),('Explore more games','stardew-valley',4)
) AS x(section_title, product_slug, position)
JOIN homepage_sections s ON s.title=x.section_title JOIN products p ON p.slug=x.product_slug;
