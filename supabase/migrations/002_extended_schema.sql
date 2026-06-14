-- ============================================================
-- EXTENDED SCHEMA — Product details, reviews, campaigns, analytics
-- ============================================================

-- ============================================================
-- 1. ALTER EXISTING TABLES
-- ============================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS badge TEXT,
  ADD COLUMN IF NOT EXISTS features TEXT[],
  ADD COLUMN IF NOT EXISTS specifications JSONB;

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating DESC);

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS item_count INT DEFAULT 0;

-- ============================================================
-- 2. NEW TABLES
-- ============================================================

-- Product Images
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT DEFAULT '',
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('size', 'color')),
  options TEXT[] NOT NULL DEFAULT '{}',
  price_modifier NUMERIC(12,2) DEFAULT 0
);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT DEFAULT '',
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  verified BOOLEAN DEFAULT FALSE,
  helpful INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  code TEXT UNIQUE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INT DEFAULT 0,
  max_usage INT DEFAULT 0,
  revenue NUMERIC(12,2) DEFAULT 0,
  orders INT DEFAULT 0,
  average_order_value NUMERIC(12,2) DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  clicks INT DEFAULT 0,
  roi NUMERIC(8,2) DEFAULT 0,
  channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'social', 'paid', 'affiliate', 'organic')),
  target_audience TEXT DEFAULT '',
  description TEXT DEFAULT '',
  min_order_value NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_campaigns_active ON campaigns(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_campaigns_code ON campaigns(code);

-- Campaign Daily Stats
CREATE TABLE IF NOT EXISTS campaign_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  revenue NUMERIC(12,2) DEFAULT 0,
  orders INT DEFAULT 0,
  clicks INT DEFAULT 0,
  UNIQUE(campaign_id, date)
);

CREATE INDEX idx_campaign_daily_stats_campaign ON campaign_daily_stats(campaign_id);

-- Daily Analytics
CREATE TABLE IF NOT EXISTS daily_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  revenue NUMERIC(12,2) DEFAULT 0,
  orders INT DEFAULT 0,
  visitors INT DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0
);

CREATE INDEX idx_daily_analytics_date ON daily_analytics(date DESC);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Verified Buyer',
  avatar TEXT DEFAULT '',
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Customers (aggregated view from orders — store as materialized table for admin)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar TEXT DEFAULT '',
  total_orders INT DEFAULT 0,
  total_spent NUMERIC(12,2) DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_order_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'vip'))
);

CREATE INDEX idx_customers_status ON customers(status);

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Public read for shop-facing tables
CREATE POLICY "product_images_public_read" ON product_images FOR SELECT USING (true);
CREATE POLICY "product_images_service_all" ON product_images FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "product_variants_public_read" ON product_variants FOR SELECT USING (true);
CREATE POLICY "product_variants_service_all" ON product_variants FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_service_all" ON reviews FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "testimonials_public_read" ON testimonials FOR SELECT USING (true);
CREATE POLICY "testimonials_service_all" ON testimonials FOR ALL USING (auth.role() = 'service_role');

-- Admin-only tables
CREATE POLICY "campaigns_service_all" ON campaigns FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "campaign_daily_stats_service_all" ON campaign_daily_stats FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "daily_analytics_service_all" ON daily_analytics FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "customers_service_all" ON customers FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- 4. SEED DATA — Products (update existing + add new)
-- ============================================================

-- First, delete existing seed products to re-insert with full data
DELETE FROM products;

-- Insert all 12 store products
INSERT INTO products (name, description, price, compare_at_price, stock, image_url, category_id, is_active, slug, rating, review_count, badge, features, specifications) VALUES
(
  'Wireless ANC Headphones',
  'Experience pure audio immersion with our flagship noise-cancelling headphones. Featuring 40mm custom drivers, adaptive ANC technology, and up to 35 hours of battery life. Premium memory foam ear cushions provide all-day comfort while the foldable design makes them perfect for travel.',
  299.99, 349.99, 156,
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
  (SELECT id FROM categories WHERE name = 'Electronics'),
  TRUE, 'wireless-anc-headphones', 4.8, 2341, 'Best Seller',
  ARRAY['Active Noise Cancellation', '35-hour battery life', 'Bluetooth 5.3', 'Multipoint connection', 'Hi-Res Audio certified', 'Foldable design'],
  '{"Driver": "40mm dynamic", "Frequency": "4Hz - 40kHz", "Impedance": "32 ohm", "Weight": "254g", "Connectivity": "Bluetooth 5.3, 3.5mm", "Battery Life": "35 hours (ANC on)"}'
),
(
  'Minimal Leather Watch',
  'A timeless minimalist watch crafted with genuine Italian leather and a Swiss quartz movement. The 40mm case features a sapphire crystal face and is water-resistant to 50 meters. Perfect for both casual and formal occasions.',
  189.00, NULL, 84,
  'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80',
  (SELECT id FROM categories WHERE name = 'Accessories'),
  TRUE, 'minimal-leather-watch', 4.9, 891, 'New',
  ARRAY['Swiss quartz movement', 'Sapphire crystal', 'Italian leather band', 'Water resistant 50m', 'Stainless steel case'],
  '{"Movement": "Swiss Quartz", "Crystal": "Sapphire", "Case": "316L Stainless Steel", "Band": "Italian Leather", "Water Resistance": "50 meters", "Diameter": "40mm"}'
),
(
  'Organic Cotton Tee',
  'Made from 100% GOTS-certified organic cotton, this everyday essential offers a relaxed fit with a modern silhouette. Pre-shrunk and garment-dyed for a vintage feel. Ethically manufactured in Portugal.',
  45.00, 59.00, 342,
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
  (SELECT id FROM categories WHERE name = 'Clothing'),
  TRUE, 'organic-cotton-tee', 4.7, 1205, NULL,
  ARRAY['100% organic cotton', 'GOTS certified', 'Pre-shrunk', 'Garment-dyed', 'Ethically made in Portugal'],
  '{"Material": "100% Organic Cotton", "Weight": "180gsm", "Fit": "Relaxed", "Origin": "Portugal", "Care": "Machine wash cold", "Certification": "GOTS"}'
),
(
  'Smart Home Speaker',
  'Transform your living space with room-filling 360-degree sound. Features voice assistant integration, multi-room audio support, and adaptive sound technology that optimizes audio based on your room acoustics.',
  129.99, NULL, 203,
  'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&q=80',
  (SELECT id FROM categories WHERE name = 'Electronics'),
  TRUE, 'smart-home-speaker', 4.5, 567, NULL,
  ARRAY['360-degree sound', 'Voice assistant', 'Multi-room audio', 'Adaptive acoustics', 'Wi-Fi & Bluetooth', 'Touch controls'],
  '{"Drivers": "Full-range + tweeter", "Connectivity": "Wi-Fi 6, Bluetooth 5.2", "Voice Assistant": "Alexa & Google", "Dimensions": "6.8\" x 4.7\"", "Weight": "1.2 kg", "Power": "30W"}'
),
(
  'Running Shoes Pro',
  'Engineered for performance with a carbon-fiber plate midsole and responsive ZoomX foam. Ultra-lightweight at just 198g with a breathable Flyknit upper. Designed for both training runs and race day.',
  159.00, 199.00, 89,
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  (SELECT id FROM categories WHERE name = 'Sports'),
  TRUE, 'running-shoes-pro', 4.8, 3420, 'Popular',
  ARRAY['Carbon-fiber plate', 'ZoomX foam midsole', 'Flyknit upper', '198g ultralight', '10mm drop', 'Rubber outsole'],
  '{"Weight": "198g (size 10)", "Drop": "10mm", "Upper": "Flyknit", "Midsole": "ZoomX + Carbon Plate", "Outsole": "Rubber", "Terrain": "Road"}'
),
(
  'Canvas Backpack',
  'A rugged yet refined backpack crafted from waxed canvas with full-grain leather accents. Features a padded 15" laptop compartment, brass hardware, and a lifetime warranty. Ages beautifully with use.',
  89.00, NULL, 67,
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
  (SELECT id FROM categories WHERE name = 'Accessories'),
  TRUE, 'canvas-backpack', 4.6, 412, 'New',
  ARRAY['Waxed canvas', 'Leather accents', '15" laptop sleeve', 'Brass hardware', 'Lifetime warranty', 'Water resistant'],
  '{"Material": "18oz Waxed Canvas", "Trim": "Full-grain Leather", "Volume": "22L", "Laptop": "Up to 15\"", "Dimensions": "18\" x 12\" x 6\"", "Hardware": "Solid Brass"}'
),
(
  'Ceramic Pour-Over Set',
  'Handmade ceramic pour-over coffee set including dripper, server, and two cups. Glazed in a matte finish with a minimalist Japanese aesthetic. Each piece is unique due to the handcrafting process.',
  68.00, 85.00, 42,
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
  (SELECT id FROM categories WHERE name = 'Home & Garden'),
  TRUE, 'ceramic-pour-over-set', 4.9, 289, NULL,
  ARRAY['Handmade ceramic', 'Matte glaze finish', 'Includes dripper + server + 2 cups', 'Dishwasher safe', 'Japanese-inspired design'],
  '{"Material": "Stoneware Ceramic", "Glaze": "Matte Finish", "Server": "500ml capacity", "Cup": "250ml each", "Origin": "Handmade", "Care": "Dishwasher Safe"}'
),
(
  'Titanium Sunglasses',
  'Ultra-lightweight titanium frames with Carl Zeiss polarized lenses. The minimalist design weighs just 18 grams and features spring hinges for a custom fit. UV400 protection with anti-reflective coating.',
  245.00, NULL, 55,
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
  (SELECT id FROM categories WHERE name = 'Accessories'),
  TRUE, 'titanium-sunglasses', 4.7, 178, 'Premium',
  ARRAY['Pure titanium frame', 'Carl Zeiss lenses', 'Polarized', 'UV400 protection', '18g ultralight', 'Spring hinges'],
  '{"Frame": "Pure Titanium", "Lenses": "Carl Zeiss Polarized", "Weight": "18g", "Protection": "UV400", "Coating": "Anti-reflective", "Hinge": "Spring-loaded"}'
),
(
  'Merino Wool Sweater',
  'Luxuriously soft 100% extra-fine merino wool sweater. Naturally temperature-regulating, moisture-wicking, and odor-resistant. The classic crew neck design pairs effortlessly with any outfit.',
  135.00, 165.00, 128,
  'https://images.unsplash.com/photo-1434389677669-e08b4cda3a65?w=600&q=80',
  (SELECT id FROM categories WHERE name = 'Clothing'),
  TRUE, 'merino-wool-sweater', 4.8, 634, NULL,
  ARRAY['100% Extra-fine Merino', 'Temperature regulating', 'Moisture wicking', 'Odor resistant', 'Machine washable'],
  '{"Material": "100% Extra-fine Merino Wool", "Gauge": "16.5 micron", "Fit": "Regular", "Neckline": "Crew Neck", "Care": "Machine Wash Gentle", "Origin": "New Zealand Wool"}'
),
(
  'Portable SSD 2TB',
  'Blazing-fast portable storage with read speeds up to 2,000 MB/s. Rugged aluminum enclosure is IP65 water and dust resistant with drop protection up to 2 meters. USB-C with Thunderbolt 4 support.',
  179.99, 219.99, 211,
  'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=80',
  (SELECT id FROM categories WHERE name = 'Electronics'),
  TRUE, 'portable-ssd-2tb', 4.6, 892, NULL,
  ARRAY['2,000 MB/s read speed', 'IP65 water & dust resistant', '2m drop protection', 'USB-C / Thunderbolt 4', 'Hardware encryption', 'Compact design'],
  '{"Capacity": "2TB", "Read Speed": "2,000 MB/s", "Write Speed": "1,800 MB/s", "Interface": "USB-C 3.2 Gen 2x2", "Protection": "IP65, 2m drop", "Encryption": "AES 256-bit"}'
),
(
  'Plant-Based Candle Set',
  'Set of three hand-poured soy wax candles with essential oil fragrances. Each candle burns for 45+ hours with a clean, even flame. Housed in reusable amber glass jars with wooden wicks.',
  52.00, NULL, 94,
  'https://images.unsplash.com/photo-1602607512085-13fe3faefdc0?w=600&q=80',
  (SELECT id FROM categories WHERE name = 'Home & Garden'),
  TRUE, 'plant-based-candle-set', 4.8, 356, NULL,
  ARRAY['100% soy wax', 'Essential oil fragrances', '45+ hour burn time each', 'Wooden wicks', 'Reusable amber glass', 'Set of 3'],
  '{"Wax": "100% Soy", "Fragrance": "Essential Oils", "Burn Time": "45+ hours each", "Wick": "Wooden", "Jar": "Amber Glass, 8oz", "Quantity": "Set of 3"}'
),
(
  'Architect Desk Lamp',
  'Precision-engineered desk lamp with a die-cast aluminum arm and adjustable LED panel. Features stepless dimming, 5 color temperature modes, and a built-in USB-C charging port. Clamp and base mount options included.',
  198.00, 248.00, 38,
  'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&q=80',
  (SELECT id FROM categories WHERE name = 'Home & Garden'),
  TRUE, 'architect-desk-lamp', 4.7, 443, NULL,
  ARRAY['Die-cast aluminum', 'Stepless dimming', '5 color temperatures', 'USB-C charging port', 'Clamp + base included', '50,000 hour LED'],
  '{"Material": "Die-cast Aluminum", "Light": "LED, 12W", "Color Temp": "2700K - 6500K", "Lumens": "800 lm", "LED Life": "50,000 hours", "Port": "USB-C 15W"}'
);

-- ============================================================
-- 5. SEED — Product Images
-- ============================================================

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order)
SELECT p.id, v.url, v.alt, v.is_primary, v.sort_order
FROM products p, (VALUES
  ('wireless-anc-headphones', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 'Headphones front view', TRUE, 0),
  ('wireless-anc-headphones', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80', 'Headphones side view', FALSE, 1),
  ('wireless-anc-headphones', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80', 'Headphones on desk', FALSE, 2),
  ('wireless-anc-headphones', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80', 'Headphones lifestyle', FALSE, 3),
  ('minimal-leather-watch', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80', 'Watch front', TRUE, 0),
  ('minimal-leather-watch', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 'Watch on wrist', FALSE, 1),
  ('minimal-leather-watch', 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=80', 'Watch detail', FALSE, 2),
  ('organic-cotton-tee', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 'White tee front', TRUE, 0),
  ('organic-cotton-tee', 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80', 'Tee folded', FALSE, 1),
  ('organic-cotton-tee', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80', 'Tee detail', FALSE, 2),
  ('smart-home-speaker', 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&q=80', 'Speaker front', TRUE, 0),
  ('smart-home-speaker', 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800&q=80', 'Speaker in room', FALSE, 1),
  ('smart-home-speaker', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80', 'Speaker detail', FALSE, 2),
  ('running-shoes-pro', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'Shoes side view', TRUE, 0),
  ('running-shoes-pro', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80', 'Shoes pair', FALSE, 1),
  ('running-shoes-pro', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80', 'Shoes detail', FALSE, 2),
  ('running-shoes-pro', 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80', 'Shoes on track', FALSE, 3),
  ('canvas-backpack', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 'Backpack front', TRUE, 0),
  ('canvas-backpack', 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&q=80', 'Backpack open', FALSE, 1),
  ('canvas-backpack', 'https://images.unsplash.com/photo-1581605405669-fcdf81165b78?w=800&q=80', 'Backpack detail', FALSE, 2),
  ('ceramic-pour-over-set', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', 'Pour-over set', TRUE, 0),
  ('ceramic-pour-over-set', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=800&q=80', 'Coffee brewing', FALSE, 1),
  ('ceramic-pour-over-set', 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80', 'Set detail', FALSE, 2),
  ('titanium-sunglasses', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80', 'Sunglasses front', TRUE, 0),
  ('titanium-sunglasses', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80', 'Sunglasses side', FALSE, 1),
  ('titanium-sunglasses', 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80', 'Sunglasses lifestyle', FALSE, 2),
  ('merino-wool-sweater', 'https://images.unsplash.com/photo-1434389677669-e08b4cda3a65?w=800&q=80', 'Sweater front', TRUE, 0),
  ('merino-wool-sweater', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80', 'Sweater detail', FALSE, 1),
  ('merino-wool-sweater', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80', 'Sweater folded', FALSE, 2),
  ('portable-ssd-2tb', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80', 'SSD front', TRUE, 0),
  ('portable-ssd-2tb', 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&q=80', 'SSD connected', FALSE, 1),
  ('portable-ssd-2tb', 'https://images.unsplash.com/photo-1618410320928-25228d811631?w=800&q=80', 'SSD size comparison', FALSE, 2),
  ('plant-based-candle-set', 'https://images.unsplash.com/photo-1602607512085-13fe3faefdc0?w=800&q=80', 'Candle set', TRUE, 0),
  ('plant-based-candle-set', 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80', 'Candle lit', FALSE, 1),
  ('plant-based-candle-set', 'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?w=800&q=80', 'Candle detail', FALSE, 2),
  ('architect-desk-lamp', 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=800&q=80', 'Lamp on desk', TRUE, 0),
  ('architect-desk-lamp', 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80', 'Lamp detail', FALSE, 1),
  ('architect-desk-lamp', 'https://images.unsplash.com/photo-1534105615256-13940a56ff44?w=800&q=80', 'Lamp in use', FALSE, 2)
) AS v(slug, url, alt, is_primary, sort_order)
WHERE p.slug = v.slug;

-- ============================================================
-- 6. SEED — Product Variants
-- ============================================================

INSERT INTO product_variants (product_id, name, type, options, price_modifier)
SELECT p.id, v.name, v.type, v.options, v.price_modifier
FROM products p, (VALUES
  ('wireless-anc-headphones', 'Color', 'color', ARRAY['Matte Black', 'Silver', 'Navy Blue'], 0),
  ('minimal-leather-watch', 'Band Color', 'color', ARRAY['Tan', 'Black', 'Dark Brown'], 0),
  ('minimal-leather-watch', 'Case Size', 'size', ARRAY['36mm', '40mm', '44mm'], 0),
  ('organic-cotton-tee', 'Size', 'size', ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'], 0),
  ('organic-cotton-tee', 'Color', 'color', ARRAY['White', 'Black', 'Sage', 'Sand'], 0),
  ('smart-home-speaker', 'Color', 'color', ARRAY['Charcoal', 'Glacier White', 'Sage Green'], 0),
  ('running-shoes-pro', 'Size', 'size', ARRAY['7', '8', '9', '10', '11', '12', '13'], 0),
  ('running-shoes-pro', 'Color', 'color', ARRAY['Volt Red', 'Obsidian', 'Pure White'], 0),
  ('canvas-backpack', 'Color', 'color', ARRAY['Olive', 'Charcoal', 'Navy'], 0),
  ('ceramic-pour-over-set', 'Glaze', 'color', ARRAY['Matte White', 'Speckled Gray', 'Forest Green'], 0),
  ('titanium-sunglasses', 'Frame', 'color', ARRAY['Gunmetal', 'Gold', 'Matte Black'], 0),
  ('merino-wool-sweater', 'Size', 'size', ARRAY['S', 'M', 'L', 'XL'], 0),
  ('merino-wool-sweater', 'Color', 'color', ARRAY['Charcoal', 'Navy', 'Oatmeal', 'Burgundy'], 0),
  ('portable-ssd-2tb', 'Capacity', 'size', ARRAY['500GB', '1TB', '2TB', '4TB'], 0),
  ('portable-ssd-2tb', 'Color', 'color', ARRAY['Space Gray', 'Silver'], 0),
  ('plant-based-candle-set', 'Scent Set', 'color', ARRAY['Coastal Breeze', 'Forest Walk', 'Midnight Bloom'], 0),
  ('architect-desk-lamp', 'Finish', 'color', ARRAY['Matte Black', 'Brushed Aluminum', 'White'], 0)
) AS v(slug, name, type, options, price_modifier)
WHERE p.slug = v.slug;

-- ============================================================
-- 7. SEED — Reviews
-- ============================================================

INSERT INTO reviews (product_id, user_name, user_avatar, rating, title, content, verified, helpful, created_at)
SELECT p.id, v.user_name, v.user_avatar, v.rating, v.title, v.content, v.verified, v.helpful, v.created_at
FROM products p, (VALUES
  ('wireless-anc-headphones', 'Sarah Chen', 'SC', 5, 'Best headphones I''ve ever owned', 'The noise cancellation is incredible. I use these daily for work calls and music. Battery lasts all week. Sound quality is crystal clear with deep bass. Worth every penny.', TRUE, 42, '2024-02-15'::timestamptz),
  ('wireless-anc-headphones', 'James Miller', 'JM', 5, 'Premium build quality', 'These feel incredibly well-made. The memory foam cushions are super comfortable even after 8 hours. The folding mechanism is solid. Paired instantly with my devices.', TRUE, 38, '2024-02-10'::timestamptz),
  ('wireless-anc-headphones', 'Aisha Patel', 'AP', 4, 'Great sound, minor fit issue', 'Sound quality is outstanding and ANC works perfectly. Only downside is they feel slightly tight on larger heads. After a week of use they loosened up nicely though.', TRUE, 15, '2024-01-28'::timestamptz),
  ('wireless-anc-headphones', 'Marcus Thompson', 'MT', 5, 'Converted from Bose', 'Switched from QC45 and the sound quality difference is night and day. The app customization options are excellent. Multipoint connection between laptop and phone is seamless.', TRUE, 29, '2024-01-20'::timestamptz),
  ('wireless-anc-headphones', 'Elena Vasquez', 'EV', 4, 'Excellent for commuting', 'I take the subway daily and these block out all the noise. The transparency mode is natural sounding. Wish the carrying case was a bit more compact but that''s a minor gripe.', TRUE, 21, '2024-01-15'::timestamptz),
  ('wireless-anc-headphones', 'David Kim', 'DK', 5, 'Studio-quality audio', 'As a music producer, I can confidently say these reproduce sound accurately. The spatial audio feature is impressive. The EQ customization in the app lets me fine-tune to my preference.', TRUE, 33, '2024-01-08'::timestamptz),
  ('wireless-anc-headphones', 'Rachel Foster', 'RF', 3, 'Good but not perfect', 'Sound is very good and ANC works well. However, I found the touch controls a bit finicky sometimes. Call quality could be better in windy conditions. Still a solid purchase overall.', TRUE, 8, '2023-12-29'::timestamptz),
  ('minimal-leather-watch', 'Michael O''Brien', 'MO', 5, 'Elegant simplicity', 'This watch is absolutely stunning in person. The Italian leather band feels premium and the sapphire crystal is scratch-proof. Gets compliments every time I wear it.', TRUE, 19, '2024-02-12'::timestamptz),
  ('organic-cotton-tee', 'Sophie Laurent', 'SL', 5, 'My new favorite tee', 'The fabric is incredibly soft and the fit is perfect. Love that it''s ethically made. Already ordered three more in different colors. Hasn''t shrunk after multiple washes.', TRUE, 14, '2024-02-08'::timestamptz),
  ('running-shoes-pro', 'Tyler Brooks', 'TB', 5, 'PR machine', 'Set a new half-marathon PR in these. The carbon plate gives real energy return and they feel incredibly light. The Flyknit upper breathes well even in summer heat.', TRUE, 27, '2024-01-25'::timestamptz),
  ('running-shoes-pro', 'Nina Kovacs', 'NK', 4, 'Great for training and racing', 'These shoes deliver on performance. Used them for a 10K race and several training runs. They''re responsive and comfortable. Only wish they had a wider toe box option.', TRUE, 12, '2024-01-18'::timestamptz),
  ('ceramic-pour-over-set', 'Oliver Webb', 'OW', 5, 'Beautiful craftsmanship', 'Each piece is clearly handmade with care. The matte glaze is gorgeous and the pour-over produces an excellent cup. Makes my morning ritual feel special.', TRUE, 22, '2024-02-01'::timestamptz),
  ('merino-wool-sweater', 'Isabella Rossi', 'IR', 5, 'Incredibly soft and warm', 'This merino sweater is absolutely divine. It regulates temperature perfectly - warm in winter but never overheats. The charcoal color is beautiful. Planning to buy every color.', TRUE, 16, '2024-01-30'::timestamptz),
  ('portable-ssd-2tb', 'Alex Tanaka', 'AT', 3, 'Fast but runs warm', 'Transfer speeds are insane as advertised. The build quality is solid and it''s truly pocket-sized. However, during extended large file transfers it gets quite warm. Nothing dangerous but noticeable.', TRUE, 9, '2024-01-22'::timestamptz),
  ('architect-desk-lamp', 'Clara Hoffmann', 'CH', 5, 'Perfect workspace lighting', 'This lamp transformed my home office. The stepless dimming and color temperature adjustment let me set the perfect ambiance for any task. The USB-C port is a great bonus. Beautiful design.', TRUE, 31, '2024-02-05'::timestamptz)
) AS v(slug, user_name, user_avatar, rating, title, content, verified, helpful, created_at)
WHERE p.slug = v.slug;

-- ============================================================
-- 8. SEED — Campaigns
-- ============================================================

INSERT INTO campaigns (name, discount_percent, code, start_date, end_date, is_active, usage_count, max_usage, revenue, orders, average_order_value, conversion_rate, clicks, roi, channel, target_audience, description, min_order_value) VALUES
('Spring Sale 2024', 20, 'SPRING24', '2024-03-01', '2024-03-31', TRUE, 342, 1000, 28450, 342, 83.19, 4.8, 7125, 340, 'email', 'All Customers', 'Seasonal spring promotion across all categories with 20% discount for returning customers.', 50),
('New Customer Welcome', 15, 'WELCOME15', '2024-01-01', '2024-12-31', TRUE, 1289, 5000, 96750, 1289, 75.06, 6.2, 20790, 520, 'paid', 'New Signups', 'First-purchase welcome discount to convert new email subscribers into paying customers.', 30),
('VIP Exclusive', 25, 'VIP25', '2024-02-01', '2024-04-30', TRUE, 87, 200, 18270, 87, 210.00, 12.4, 702, 890, 'email', 'VIP Customers', 'Exclusive high-value discount for VIP tier customers with $100+ lifetime spend.', 100),
('Flash Friday', 30, 'FLASH30', '2024-01-19', '2024-01-19', FALSE, 456, 500, 34200, 456, 75.00, 8.1, 5630, 280, 'social', 'All Visitors', 'One-day flash sale with aggressive 30% discount to clear seasonal inventory.', 0),
('Loyalty Reward', 10, 'LOYAL10', '2024-01-01', '2024-06-30', TRUE, 723, 2000, 54225, 723, 75.00, 5.1, 14176, 410, 'email', 'Repeat Buyers', 'Ongoing loyalty program discount for customers with 3+ orders to boost retention.', 25),
('Instagram Promo', 15, 'INSTA15', '2024-02-10', '2024-03-10', TRUE, 198, 500, 12870, 198, 65.00, 2.9, 6828, 180, 'social', 'Social Followers', 'Social-media-exclusive promo code shared via Instagram stories and reels.', 40),
('Affiliate Partner Push', 12, 'PARTNER12', '2024-01-15', '2024-04-15', TRUE, 534, 1500, 42720, 534, 80.00, 3.7, 14432, 350, 'affiliate', 'Affiliate Traffic', 'Dedicated code for affiliate partners to track and incentivize their audience conversions.', 35),
('SEO Landing Offer', 10, 'ORGANIC10', '2024-02-01', '2024-05-31', TRUE, 312, 3000, 21840, 312, 70.00, 2.3, 13565, 290, 'organic', 'Search Visitors', 'Conversion-focused offer on organic landing pages targeting high-intent search queries.', 0);

-- ============================================================
-- 9. SEED — Campaign Daily Stats (30 days for each campaign)
-- ============================================================

-- Generate daily stats for each campaign using generate_series
INSERT INTO campaign_daily_stats (campaign_id, date, revenue, orders, clicks)
SELECT
  c.id,
  d::date,
  ROUND((base_rev * (0.6 + random() * 0.8))::numeric, 2),
  ROUND(base_orders * (0.6 + random() * 0.8))::int,
  ROUND(base_clicks * (0.6 + random() * 0.8))::int
FROM campaigns c
CROSS JOIN generate_series('2024-01-15'::date, '2024-02-13'::date, '1 day'::interval) d
CROSS JOIN LATERAL (
  SELECT
    CASE c.code
      WHEN 'SPRING24' THEN 950
      WHEN 'WELCOME15' THEN 3225
      WHEN 'VIP25' THEN 609
      WHEN 'FLASH30' THEN 34200
      WHEN 'LOYAL10' THEN 1808
      WHEN 'INSTA15' THEN 460
      WHEN 'PARTNER12' THEN 1424
      WHEN 'ORGANIC10' THEN 728
    END AS base_rev,
    CASE c.code
      WHEN 'SPRING24' THEN 11
      WHEN 'WELCOME15' THEN 43
      WHEN 'VIP25' THEN 3
      WHEN 'FLASH30' THEN 456
      WHEN 'LOYAL10' THEN 24
      WHEN 'INSTA15' THEN 7
      WHEN 'PARTNER12' THEN 18
      WHEN 'ORGANIC10' THEN 10
    END AS base_orders,
    CASE c.code
      WHEN 'SPRING24' THEN 240
      WHEN 'WELCOME15' THEN 693
      WHEN 'VIP25' THEN 23
      WHEN 'FLASH30' THEN 5630
      WHEN 'LOYAL10' THEN 473
      WHEN 'INSTA15' THEN 244
      WHEN 'PARTNER12' THEN 481
      WHEN 'ORGANIC10' THEN 452
    END AS base_clicks
) bases
ON CONFLICT (campaign_id, date) DO NOTHING;

-- ============================================================
-- 10. SEED — Daily Analytics (30 days)
-- ============================================================

INSERT INTO daily_analytics (date, revenue, orders, visitors, conversion_rate)
SELECT
  d::date,
  ROUND((CASE WHEN EXTRACT(DOW FROM d) IN (0,6) THEN 0.7 ELSE 1 END * (0.8 + random() * 0.4) * 5200)::numeric, 2),
  ROUND(CASE WHEN EXTRACT(DOW FROM d) IN (0,6) THEN 0.7 ELSE 1 END * (0.8 + random() * 0.4) * 42)::int,
  ROUND(CASE WHEN EXTRACT(DOW FROM d) IN (0,6) THEN 0.7 ELSE 1 END * (0.8 + random() * 0.4) * 1400)::int,
  ROUND((2.5 + random() * 2.5)::numeric, 2)
FROM generate_series('2024-01-01'::date, '2024-01-30'::date, '1 day'::interval) d
ON CONFLICT (date) DO NOTHING;

-- ============================================================
-- 11. SEED — Testimonials
-- ============================================================

INSERT INTO testimonials (name, role, avatar, rating, text) VALUES
('Sarah Chen', 'Verified Buyer', 'SC', 5, 'The quality exceeded my expectations. Fast shipping and the packaging was beautiful. Will definitely be ordering again.'),
('Marcus Johnson', 'Verified Buyer', 'MJ', 5, 'Best online shopping experience I''ve had. The product photos are accurate and customer service was incredibly responsive.'),
('Emily Rodriguez', 'Verified Buyer', 'ER', 5, 'I''ve been a loyal customer for over a year now. The consistency in quality across all their products is impressive.');

-- ============================================================
-- 12. SEED — Customers
-- ============================================================

INSERT INTO customers (name, email, avatar, total_orders, total_spent, joined_at, last_order_at, status) VALUES
('Sarah Chen', 'sarah.chen@email.com', 'SC', 23, 4892.50, '2023-03-15', '2024-02-14', 'vip'),
('Marcus Johnson', 'marcus.j@email.com', 'MJ', 12, 2156.00, '2023-06-22', '2024-02-10', 'active'),
('Emily Rodriguez', 'emily.r@email.com', 'ER', 31, 6734.25, '2022-11-08', '2024-02-12', 'vip'),
('David Kim', 'd.kim@email.com', 'DK', 5, 845.00, '2023-09-14', '2024-01-28', 'active'),
('Rachel Foster', 'rachel.f@email.com', 'RF', 8, 1523.75, '2023-07-30', '2024-02-08', 'active'),
('Alex Tanaka', 'alex.t@email.com', 'AT', 2, 389.99, '2024-01-05', '2024-01-22', 'active'),
('Isabella Rossi', 'isabella.r@email.com', 'IR', 0, 0, '2024-02-01', NULL, 'inactive'),
('Oliver Webb', 'o.webb@email.com', 'OW', 18, 3287.50, '2023-04-12', '2024-02-11', 'vip');

-- ============================================================
-- 13. Update category item counts
-- ============================================================

UPDATE categories c SET item_count = (
  SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = TRUE
);
