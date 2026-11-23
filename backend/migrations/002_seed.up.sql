-- Fictional sellers and sample game listings. Prices are in EUR cents.
INSERT INTO sellers (name) VALUES ('PixelVault'), ('GamePort'), ('KeyNest') ON CONFLICT (name) DO NOTHING;
INSERT INTO products (slug, title, description, platform, cover_color) VALUES
('cyberpunk-2077', 'Cyberpunk 2077', 'Explore Night City in a story-driven open-world RPG.', 'PC', '#bc4b54'),
('stardew-valley', 'Stardew Valley', 'Build a farm and be part of a welcoming community.', 'PC', '#547e77'),
('hollow-knight', 'Hollow Knight', 'Explore a haunting world of insects and heroes.', 'PC', '#58608d'),
('elden-ring', 'Elden Ring', 'Journey through the Lands Between.', 'PC', '#8e7456'),
('hades', 'Hades', 'Battle out of the Underworld in this roguelike.', 'PC', '#a44e62'),
('minecraft', 'Minecraft', 'Create, explore and survive in a blocky world.', 'Xbox', '#4c966b'),
('the-witcher-3', 'The Witcher 3: Wild Hunt', 'Play as Geralt in a fantasy open world.', 'PC', '#667b89'),
('celeste', 'Celeste', 'Climb a mountain in a challenging platform adventure.', 'Switch', '#6b6bb1')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO offers (product_id, seller_id, region, price_cents, currency)
SELECT p.id, s.id, 'GLOBAL',
       CASE s.name
           WHEN 'PixelVault' THEN 1899
           WHEN 'GamePort' THEN 2049
           ELSE 2199
       END + (p.id % 6) * 320,
       'EUR'
FROM products p CROSS JOIN sellers s
WHERE p.slug IN ('cyberpunk-2077','stardew-valley','hollow-knight','elden-ring','hades','minecraft','the-witcher-3','celeste')
  AND s.name IN ('PixelVault','GamePort','KeyNest')
ON CONFLICT (product_id, seller_id, region) DO NOTHING;
