# VoltStation — EV Charging Station Management System

Full-stack Next.js app with **Customer Dashboard** + **Admin Panel**, connected to Supabase.

## URLs
- `http://localhost:3000` → Customer Dashboard
- `http://localhost:3000/admin` → Admin Panel

## STEP-BY-STEP SETUP

### Step 1 — Install Node.js
Download: https://nodejs.org (LTS version)
Verify: `node --version` (should be v18+)

### Step 2 — Setup Supabase (Free)
1. Go to https://supabase.com → Sign Up → New Project
2. Name: `voltstation`, choose Singapore region
3. SQL Editor → New Query → paste entire `supabase/schema.sql` → Run
4. Settings → API → copy your URL and keys

### Step 3 — Configure .env.local
Open `.env.local` and fill in your Supabase values:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
JWT_ADMIN_SECRET=voltstation-admin-jwt-secret-2025
JWT_CUSTOMER_SECRET=voltstation-customer-jwt-secret-2025
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4 — Install & Run
```bash
cd voltstation-nextjs
npm install
npm run dev
```
Open: http://localhost:3000

### Step 5 — Seed Admin Accounts
In a new terminal:
```bash
curl -X POST http://localhost:3000/api/seed \
  -H "Content-Type: application/json" \
  -d "{\"secret\":\"voltstation-seed-2025\"}"
```
Or use Postman: POST http://localhost:3000/api/seed with body {"secret":"voltstation-seed-2025"}

Admin credentials:
- admin / volt2025 (Super Admin)
- ali.mgr / manager123 (Manager)
- sara.op / operator123 (Operator)

Customer demo phone: 03124445566

## Project Structure
```
app/
  customer/page.tsx     ← Customer Dashboard (/customer)
  admin/page.tsx        ← Admin Panel (/admin)
  api/
    customer/           ← Public APIs (chargers, bookings, queue, shops, analytics)
    admin/              ← Protected APIs (JWT required)
    analytics/          ← Shared analytics
    seed/               ← One-time seed

lib/
  supabase.ts          ← DB client
  auth.ts              ← JWT helpers

supabase/
  schema.sql           ← Run this in Supabase SQL Editor
```

## Troubleshooting
- "SUPABASE_URL not defined" → Check .env.local values
- "relation does not exist" → Run schema.sql in Supabase SQL Editor
- "Invalid credentials" → Run /api/seed first
- Port in use → npm run dev -- -p 3001
