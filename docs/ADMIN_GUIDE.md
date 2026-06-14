# Admin Guide

## Database (PostgreSQL)

This app runs on a plain PostgreSQL database (it was migrated off Supabase).
With `docker compose up` a `postgres:16` container is started and the schema +
seed data load automatically on first boot from:

- `db/00_auth_stub.sql` — compatibility shim so the Supabase-authored migrations run on vanilla Postgres
- `supabase/migrations/001_initial_schema.sql` and `002_extended_schema.sql` — schema + product seed
- `db/99_seed_admin.sql` — initial admin user

To point at an external database instead, set `DATABASE_URL` in `.env`:

```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

## Environment Variables

```bash
cp .env.example .env
```

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

## Creating Users

### Admin User

An admin is seeded automatically on first boot:

> **admin@a7madd.com** / `admin123` — **change this in production!**

To add another admin manually (`psql` or any SQL client):

```sql
INSERT INTO users (email, name, password_hash, role)
VALUES (
  'admin@example.com',
  'Admin',
  '$2b$10$YXg8irxATcO6zPdkZgzV3elKeJ4PR5/1yL0tEqjb11U04B1aWkoNW',
  'admin'
);
```

> Default password for that hash: `admin123` — change in production!

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
4. Set `AUTH_URL=https://<your-domain>`
5. Set `NEXT_PUBLIC_APP_URL=https://<your-domain>`
6. Run `docker compose up -d --build`
7. Put the app behind a reverse proxy (Traefik/nginx/caddy) terminating TLS and
   forwarding 443 → 3000

The live deployment at **ec.a7madd.com** uses the host's shared Traefik proxy;
see the compose file under `/docker/ec-a7madd` on the server.
