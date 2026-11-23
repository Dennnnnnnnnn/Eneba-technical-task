-- Additional seeded listings to demonstrate page navigation and region filtering.
INSERT INTO products (slug,title,description,platform,cover_color,cover_image_url) VALUES
('portal-2','Portal 2','Solve inventive puzzles in Aperture Science.', 'PC','#697e90','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/620/library_600x900.jpg'),
('terraria','Terraria','Explore, build and battle in a sandbox adventure.', 'PC','#5c884f','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/105600/library_600x900.jpg'),
('dead-cells','Dead Cells','Fast-paced action-platformer with roguelite progression.', 'PC','#8e475a','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/588650/library_600x900.jpg'),
('slay-the-spire','Slay the Spire','Build a deck and climb the Spire.', 'PC','#aa634a','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/646570/library_600x900.jpg'),
('disco-elysium','Disco Elysium','Investigate a mysterious case in a narrative RPG.', 'PC','#9a6253','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/632470/library_600x900.jpg'),
('outer-wilds','Outer Wilds','Explore a solar system in a repeating time loop.', 'PC','#456b83','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/753640/library_600x900.jpg'),
('cuphead','Cuphead','Classic cartoon run-and-gun boss battles.', 'Xbox','#a04d5b',''),
('ori-and-the-blind-forest','Ori and the Blind Forest','Beautiful platforming journey through a glowing forest.', 'Xbox','#446d8b','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/261570/library_600x900.jpg'),
('undertale','Undertale','A role-playing game where choices matter.', 'Switch','#574366','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/391540/library_600x900.jpg'),
('cult-of-the-lamb','Cult of the Lamb','Build a following in a mysterious woodland.', 'Switch','#a44d65','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1313140/library_600x900.jpg'),
('dave-the-diver','DAVE THE DIVER','Dive by day and run a sushi restaurant by night.', 'PC','#3c8e9a','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1868140/library_600x900.jpg'),
('balatro','Balatro','Poker-inspired roguelike deckbuilder.', 'PC','#4d73a1','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2379780/library_600x900.jpg')
ON CONFLICT (slug) DO NOTHING;
INSERT INTO offers(product_id,seller_id,region,price_cents,currency)
SELECT p.id,s.id,
 CASE WHEN s.name='PixelVault' THEN 'GLOBAL' WHEN s.name='GamePort' THEN 'EU' ELSE 'US' END,
 699 + ((length(p.slug)*173 + length(s.name)*89) % 3100), 'EUR'
FROM products p CROSS JOIN sellers s
WHERE p.slug IN ('portal-2','terraria','dead-cells','slay-the-spire','disco-elysium','outer-wilds','cuphead','ori-and-the-blind-forest','undertale','cult-of-the-lamb','dave-the-diver','balatro')
ON CONFLICT (product_id,seller_id,region) DO NOTHING;
-- Add EU/US offers to a subset of original listings without overriding existing offers.
INSERT INTO offers(product_id,seller_id,region,price_cents,currency)
SELECT p.id,s.id,CASE WHEN s.name='GamePort' THEN 'EU' ELSE 'US' END,
 1399+(length(p.slug)*143)%2300,'EUR'
FROM products p CROSS JOIN sellers s
WHERE p.slug IN ('elden-ring','cyberpunk-2077','stardew-valley','hollow-knight')
 AND s.name IN ('GamePort','KeyNest')
ON CONFLICT (product_id,seller_id,region) DO NOTHING;
