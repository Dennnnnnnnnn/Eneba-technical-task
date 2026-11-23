DELETE FROM offers WHERE product_id IN (SELECT id FROM products WHERE slug IN ('elden-ring','cyberpunk-2077','stardew-valley','hollow-knight')) AND region IN ('EU','US');
DELETE FROM products WHERE slug IN ('portal-2','terraria','dead-cells','slay-the-spire','disco-elysium','outer-wilds','cuphead','ori-and-the-blind-forest','undertale','cult-of-the-lamb','dave-the-diver','balatro');
