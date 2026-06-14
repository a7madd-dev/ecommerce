# Admin Guide

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings > API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`
3. Run the migration in `supabase/migrations/001_initial_schema.sql` via the **SQL Editor**

## Environment Variables

```bash
cp .env.example .env.local
```

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

## Creating Users

### Admin User

Run in Supabase SQL Editor:

```sql
INSERT INTO users (email, name, password_hash, role)
VALUES (
  'admin@example.com',
  'Admin',
  '$2b$10$YXg8irxATcO6zPdkZgzV3elKeJ4PR5/1yL0tEqjb11U04B1aWkoNW',
  'admin'
);
```

> Default password: `admin123` — change in production!

### Agent User (can manage orders only)

```sql
INSERT INTO users (email, name, password_hash, role)
VALUES ('agent@example.com', 'Agent', '<bcrypt_hash>', 'agent');
```

### Generate Password Hash

```js
const bcrypt = require('bcryptjs');
bcrypt.hash('YOUR_PASSWORD', 10).then(console.log);
```

## Roles

| Role    | Access                           |
|---------|----------------------------------|
| admin   | Full dashboard access            |
| agent   | Orders management only           |
| client  | Storefront + order history       |
| guest   | Storefront only                  |

All roles use the same `/login` page. Middleware routes each role automatically.

## Database Schema

### Tables
- `categories` — product categories with images
- `products` — with soft delete (`is_active`), `compare_at_price`, `NUMERIC(12,2)`
- `users` — 4 roles (admin, agent, client, guest)
- `orders` — linked to `user_id`, with `payment_status`, `payment_provider`, `payment_reference`
- `order_items` — unique product per order constraint
- `logs` — activity audit trail
- `app_settings` — global config (fallback image, store name, currency)

### Safety Features
- **RLS** enabled on all tables
- **Atomic stock decrement** via `decrement_stock()` function with `FOR UPDATE` row lock
- **Updated_at triggers** on products, orders, users, settings
- **Unique constraint** on order_items (prevents duplicate product per order)
- **Soft delete** on products (preserves historical order references)

## Global Settings

The `app_settings` table stores:
- `fallback_product_image` — shown when a product has no image
- `store_name` — brand name
- `store_currency` — default currency

## Running

### Development

```bash
npm install
npm run dev
```

### Production (Docker)

```bash
docker compose up -d --build
```

### Deployment to VPS

1. SSH into your VPS
2. Clone the repository
3. Create `.env` with production values
4. Set `AUTH_URL=https://ecommerce.o2logic.com`
5. Set `NEXT_PUBLIC_APP_URL=https://ecommerce.o2logic.com`
6. Run `docker compose up -d --build`
7. Configure reverse proxy (nginx/caddy) to forward 80/443 → 3000

### Nginx Config

```nginx
server {
    server_name ecommerce.o2logic.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
