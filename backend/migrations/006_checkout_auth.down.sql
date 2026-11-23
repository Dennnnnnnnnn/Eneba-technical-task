ALTER TABLE game_keys DROP CONSTRAINT game_keys_order_item_fk;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS game_keys;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS users;
