# FoodBridge — school-to-charity food redistribution

A Next.js MVP for matching surplus food from school cafeterias with registered charities in Singapore.

## What's included
- Public home, about, contact, login and registration pages
- Role-specific school, charity and admin workspaces
- School food listings, charity requests and approval workflow
- Inventory progress calculations and collection coordination UI
- Supabase browser/server clients and SQL schema with Row Level Security
- Demo mode with seeded sample data when Supabase environment variables are absent

## Run locally
1. Install Node.js 20 or newer.
2. Extract this project and open the folder in VS Code.
3. In a terminal run:
   ```bash
   npm install
   npm run dev
   ```
4. Open http://localhost:3000.

Supabase is optional. If you are testing locally, do not copy `.env.example` to `.env.local`; simply run the app and it will use demo mode with browser local storage. If you already copied the example file, the app now recognizes its placeholder values and still uses demo mode. Demo accounts:
- `school@demo.sg` / `demo1234`
- `charity@demo.sg` / `demo1234`
- `admin@demo.sg` / `demo1234`

In demo mode, the login page lets you choose a role; any password works.

## Connect Supabase
1. Create a Supabase project.
2. Copy Project URL and anon/public key into `.env.local`.
3. Open Supabase SQL Editor and run `supabase/schema.sql`.
4. Create accounts through the app's registration page. The SQL trigger creates a profile using the organization metadata.
5. For production, configure email confirmation and redirect URLs in Supabase Auth.

## Important production notes
- The SQL schema enables RLS and restricts organization access.
- The demo mode is for prototyping only. Do not use demo data or demo authentication for real organizations.
- Add server-side RPC approval with row locking before real-world use to prevent simultaneous claims from overselling inventory. The included app keeps approval conservative and should be load-tested before deployment.
- Verify organizations and establish food handling, allergen, temperature, timing and collection procedures before any real food transfer.
- Add rate limits, audit logs, email notifications and formal admin provisioning before launch.

## Stack
Next.js 15, React 19, TypeScript, Tailwind CSS 4, Supabase, Lucide.
