-- Phase 3.5: content managed in PostgreSQL. Existing orders and products remain untouched.
CREATE TABLE homepage_banners (
 id BIGSERIAL PRIMARY KEY, title TEXT NOT NULL, eyebrow TEXT NOT NULL DEFAULT '',
 subtitle TEXT NOT NULL DEFAULT '', cta TEXT NOT NULL, href TEXT NOT NULL DEFAULT '/store',
 image_url TEXT NOT NULL DEFAULT '', theme TEXT NOT NULL DEFAULT 'purple', position INT UNIQUE NOT NULL
);
INSERT INTO homepage_banners(title,eyebrow,subtitle,cta,image_url,theme,position) VALUES
('GRAND THEFT AUTO VI','THE NEXT CHAPTER','Explore game offers and prepare for Vice City','BUY GTA VI','','violet',1),
('BLACK WEEK','UP TO 25%','Big deals on digital games','SHOP DEALS','','rose',2),
('MEGA GIVEAWAY','KEYMARKET','Discover game offers','EXPLORE','','blue',3),
('GAMES -90% OFF','HOT DEALS','Limited-time demo deals','SHOP GAMES','','orange',4);
INSERT INTO homepage_categories(name,icon,href,position) VALUES
('FIFA','gamepad','#store',11),('Fortnite','gamepad','#store',12),('Amazon','gift','#store',13),
('Apple','card','#store',14),('Mobile games','gamepad','#store',15),('Spotify','music','#store',16),
('Netflix','video','#store',17),('DLCs','tag','#store',18),('Pre-orders','calendar','#store',19)
ON CONFLICT (position) DO NOTHING;
UPDATE homepage_sections SET title='Recommended for you', subtitle='Hand-picked games from our marketplace' WHERE position=1;
UPDATE homepage_sections SET title='Top games',subtitle='Popular digital games' WHERE position=2;
UPDATE homepage_sections SET title='Best selling eGift Cards',subtitle='Discover offers across sellers' WHERE position=3;
INSERT INTO homepage_sections(title,subtitle,position) VALUES
('Best selling gift cards','More great finds',4),('Upcoming games','Explore games to play next',5);
-- Ensure each shelf has listings even though this demo primarily seeds games, not real gift cards.
INSERT INTO homepage_section_products(section_id,product_id,position)
SELECT s.id,p.id,ROW_NUMBER() OVER (PARTITION BY s.id ORDER BY p.id)
FROM homepage_sections s CROSS JOIN products p
WHERE s.position IN (4,5) AND p.slug IN ('hades','balatro','cult-of-the-lamb','cyberpunk-2077','outer-wilds','portal-2','dead-cells','terraria')
ON CONFLICT (section_id,product_id) DO NOTHING;
CREATE TABLE homepage_genres (
 id BIGSERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL, icon TEXT NOT NULL, position INT UNIQUE NOT NULL
);
CREATE TABLE homepage_genre_products (
 genre_id BIGINT NOT NULL REFERENCES homepage_genres(id) ON DELETE CASCADE,
 product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
 PRIMARY KEY(genre_id,product_id)
);
INSERT INTO homepage_genres(name,icon,position) VALUES
('Action','⚔',1),('Adventure','🧭',2),('Simulation','◈',3),('Strategy','♜',4),
('RPG','✦',5),('Indie','✿',6),('FPS / TPS','⌖',7),('Puzzle','◩',8),('Roguelike','♠',9),('Platformer','▣',10),('Open World','◎',11),('Story Rich','☷',12);
INSERT INTO homepage_genre_products(genre_id,product_id)
SELECT g.id,p.id FROM homepage_genres g JOIN products p ON
 (g.name='Action' AND p.slug IN ('elden-ring','hades','dead-cells','cuphead','cyberpunk-2077')) OR
 (g.name='Adventure' AND p.slug IN ('outer-wilds','the-witcher-3','ori-and-the-blind-forest')) OR
 (g.name='Simulation' AND p.slug IN ('stardew-valley','terraria','dave-the-diver')) OR
 (g.name='Strategy' AND p.slug IN ('slay-the-spire','balatro')) OR
 (g.name='RPG' AND p.slug IN ('disco-elysium','elden-ring','undertale')) OR
 (g.name='Indie' AND p.slug IN ('celeste','hollow-knight','hades','stardew-valley')) OR
 (g.name='FPS / TPS' AND p.slug IN ('cyberpunk-2077','portal-2')) OR
 (g.name='Puzzle' AND p.slug IN ('portal-2','outer-wilds')) OR
 (g.name='Roguelike' AND p.slug IN ('hades','dead-cells','balatro')) OR
 (g.name='Platformer' AND p.slug IN ('celeste','cuphead','ori-and-the-blind-forest')) OR
 (g.name='Open World' AND p.slug IN ('cyberpunk-2077','the-witcher-3','minecraft')) OR
 (g.name='Story Rich' AND p.slug IN ('disco-elysium','undertale','the-witcher-3'))
ON CONFLICT DO NOTHING;

-- Add enough eligible products to make carousels genuinely scrollable.
INSERT INTO homepage_section_products(section_id,product_id,position)
SELECT s.id,p.id,100 + ROW_NUMBER() OVER(PARTITION BY s.id ORDER BY p.id)
FROM homepage_sections s CROSS JOIN products p
WHERE NOT EXISTS (SELECT 1 FROM homepage_section_products existing WHERE existing.section_id=s.id AND existing.product_id=p.id)
ON CONFLICT (section_id,product_id) DO NOTHING;
