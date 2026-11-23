-- Rebrand the demonstrative homepage content without changing any user data.
UPDATE homepage_banners
SET eyebrow = 'ENEBA DEMO'
WHERE position = 3 AND eyebrow = 'KEYMARKET';
