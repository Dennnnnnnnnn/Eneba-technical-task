DROP TABLE IF EXISTS homepage_genre_products;
DROP TABLE IF EXISTS homepage_genres;
DELETE FROM homepage_section_products WHERE section_id IN (SELECT id FROM homepage_sections WHERE position IN (4,5));
DELETE FROM homepage_sections WHERE position IN (4,5);
UPDATE homepage_sections SET title='Top games',subtitle='Popular digital game keys' WHERE position=1;
UPDATE homepage_sections SET title='Best deals',subtitle='Shop offers across sellers' WHERE position=2;
UPDATE homepage_sections SET title='Explore more games',subtitle='Something for your next adventure' WHERE position=3;
DELETE FROM homepage_categories WHERE position>10;
DROP TABLE IF EXISTS homepage_banners;
