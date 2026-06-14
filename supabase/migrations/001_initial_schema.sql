-- ============================================================
-- ECOMMERCE SCHEMA v2 — Production-Grade
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- App settings (global config like fallback image)
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Products (soft-delete via is_active, NUMERIC(12,2) for scale)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  compare_at_price NUMERIC(12,2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url TEXT NOT NULL DEFAULT '',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = TRUE;

-- Users (role-based: admin, agent, client, guest)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'agent', 'client', 'guest')),
  avatar_url TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Orders (linked to user, with payment tracking)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  total NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid','paid','failed','refunded')),
  payment_provider TEXT,
  payment_reference TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment ON orders(payment_status);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Order Items (unique product per order)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(12,2) NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE UNIQUE INDEX unique_product_per_order ON order_items(order_id, product_id);

-- Activity Logs
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_logs_created ON logs(created_at DESC);
CREATE INDEX idx_logs_user ON logs(user_id);

-- ============================================================
-- 2. AUTO-UPDATE TIMESTAMPS TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================================
-- 3. ATOMIC STOCK DECREMENT (prevents overselling with row lock)
-- ============================================================

CREATE OR REPLACE FUNCTION decrement_stock(p_id UUID, qty INTEGER)
RETURNS INTEGER AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  SELECT stock INTO current_stock
  FROM products
  WHERE id = p_id AND is_active = TRUE
  FOR UPDATE;

  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Product not found or inactive';
  END IF;
  IF current_stock < qty THEN
    RAISE EXCEPTION 'Insufficient stock for product %', p_id;
  END IF;

  UPDATE products SET stock = stock - qty WHERE id = p_id;
  RETURN current_stock - qty;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Categories: public read, admin write
CREATE POLICY "categories_public_read" ON categories
  FOR SELECT USING (true);
CREATE POLICY "categories_admin_write" ON categories
  FOR ALL USING (
    auth.role() = 'service_role'
  );

-- Products: public read active only, admin full access
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "products_service_all" ON products
  FOR ALL USING (
    auth.role() = 'service_role'
  );

-- Users: service role only
CREATE POLICY "users_service_all" ON users
  FOR ALL USING (
    auth.role() = 'service_role'
  );

-- Orders: service role full access
CREATE POLICY "orders_service_all" ON orders
  FOR ALL USING (
    auth.role() = 'service_role'
  );

-- Order items: service role full access
CREATE POLICY "order_items_service_all" ON order_items
  FOR ALL USING (
    auth.role() = 'service_role'
  );

-- Logs: service role only
CREATE POLICY "logs_service_all" ON logs
  FOR ALL USING (
    auth.role() = 'service_role'
  );

-- App settings: public read, service write
CREATE POLICY "settings_public_read" ON app_settings
  FOR SELECT USING (true);
CREATE POLICY "settings_service_write" ON app_settings
  FOR ALL USING (
    auth.role() = 'service_role'
  );

-- ============================================================
-- 5. SEED DATA
-- ============================================================

-- Default categories
INSERT INTO categories (name, image_url) VALUES
  ('Electronics', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80'),
  ('Clothing', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80'),
  ('Home & Garden', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80'),
  ('Books', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80'),
  ('Sports', 'https://images.unsplash.com/photo-1461896836934-bd45ba48c2a5?w=400&q=80'),
  ('Accessories', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80')
ON CONFLICT (name) DO NOTHING;

-- Global fallback image setting
INSERT INTO app_settings (key, value) VALUES
  ('fallback_product_image', 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&q=80'),
  ('store_name', 'Store'),
  ('store_currency', 'USD')
ON CONFLICT (key) DO NOTHING;

-- Seed 6 demo products (3 with images, 3 without to test fallback)
INSERT INTO products (name, description, price, compare_at_price, stock, image_url, category_id, is_active) VALUES
  (
    'Wireless Noise-Canceling Headphones',
    'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio.',
    299.99, 349.99, 50,
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    (SELECT id FROM categories WHERE name = 'Electronics'),
    TRUE
  ),
  (
    'Minimal Leather Watch',
    'Hand-crafted Italian leather strap with sapphire crystal face. Water resistant to 50m.',
    189.00, NULL, 35,
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80',
    (SELECT id FROM categories WHERE name = 'Accessories'),
    TRUE
  ),
  (
    'Organic Cotton T-Shirt',
    '100% organic cotton, pre-shrunk, available in multiple colors. Sustainably sourced.',
    45.00, 59.00, 120,
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    (SELECT id FROM categories WHERE name = 'Clothing'),
    TRUE
  ),
  (
    'Smart Home Speaker',
    'Voice-controlled speaker with room-filling sound. Compatible with all major smart home ecosystems.',
    129.99, NULL, 80,
    '',
    (SELECT id FROM categories WHERE name = 'Electronics'),
    TRUE
  ),
  (
    'Running Shoes Pro',
    'Lightweight performance running shoes with responsive cushioning and breathable mesh upper.',
    159.00, 199.00, 45,
    '',
    (SELECT id FROM categories WHERE name = 'Sports'),
    TRUE
  ),
  (
    'The Art of Clean Code',
    'Essential guide to writing maintainable, scalable software. Hardcover edition with bonus chapter.',
    34.99, NULL, 200,
    '',
    (SELECT id FROM categories WHERE name = 'Books'),
    TRUE
  );
