# Car Wash Business Management Platform

A self-hostable multi-branch car wash management platform: bookings, customers,
vehicles, service catalog, digital job cards, POS/payments, employees, inventory,
reports, and an AI receptionist endpoint (Anthropic API) you can wire up to
WhatsApp.

## Stack
- **Frontend:** React + Vite + Tailwind CSS, React Router, Recharts
- **Backend:** Node.js + Express + Sequelize
- **Database:** PostgreSQL
- **Auth:** JWT
- **Deployment:** Docker Compose + Nginx reverse proxy

## What's built (MVP)
- Login / JWT auth, role-based permissions (admin, manager, cashier, attendant)
- Dashboard with live stats
- Customer & Vehicle management
- Service catalog (CRUD)
- Bookings (creates a job card automatically)
- Basic digital job card status tracking
- POS checkout that totals a booking's services and records a payment
- Employee management
- Inventory with low-stock flagging
- Revenue report (bar chart)
- `/api/ai/chat` and `/api/ai/whatsapp-webhook` stubs powered by the Anthropic API —
  add `ANTHROPIC_API_KEY` to `backend/.env` to make them live

## Not yet built (left as clearly-marked extension points)
Multi-branch switching in the UI, accounting module, memberships & loyalty rules,
license plate recognition, predictive inventory, voice assistant, Grafana/Prometheus
dashboards, nightly backup automation. The data model and folder structure are
built to make these straightforward to add — the `crudFactory` pattern in
`backend/src/controllers/crudFactory.js` means a new module is usually just a new
Sequelize model + a few lines in `routes/index.js`.

## Run locally (development)

**Backend**
```bash
cd backend
cp .env.example .env       # then edit DATABASE_URL if not using Docker Postgres
npm install
npm run seed                # creates admin user + sample data
npm run dev                 # http://localhost:4000
```
Default login: `admin@carwash.local` / `Admin@123` — change this immediately.

**Frontend**
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

## Run everything with Docker Compose (recommended for self-hosting)
```bash
cp backend/.env.example backend/.env   # edit JWT_SECRET before going live
docker compose up -d --build
docker compose exec backend npm run seed
```
This starts Postgres, the backend API, the built frontend, and an Nginx reverse
proxy on port 80 that routes `/` to the frontend and `/api` to the backend.

## A note on "Meta AI free hosting"
Meta AI is a chatbot product, not a hosting service — Meta doesn't offer free
web app hosting. A few options that actually work well for self-hosting a stack
like this:

- **Your own machine/VPS + Docker Compose** (this repo) — cheapest, full control.
  Expose it with a **Cloudflare Tunnel** (free) if you don't have a static IP or
  don't want to open router ports — this also matches the "Cloudflare Tunnel"
  line already in your tech-stack list.
- **Oracle Cloud Free Tier** — genuinely free forever VM (ARM, 4 vCPU/24GB RAM),
  enough to run this whole stack comfortably.
- **Railway / Render free tiers** — easy for the backend + Postgres, though free
  tiers sleep/limit hours.
- A cheap South African/EU VPS (e.g. Hetzner, ~€4/mo) if you want it always-on
  without relying on a free tier.

Happy to set up whichever of these you pick — I can adjust the Docker Compose
file or write a Cloudflare Tunnel config once you decide.

## Project structure
```
backend/   Express API, Sequelize models, JWT auth, Anthropic AI stub
frontend/  React + Tailwind SPA
nginx/     Reverse proxy config for docker-compose
docker-compose.yml
```

## Environment variables (backend/.env)
| Variable | Purpose |
|---|---|
| DATABASE_URL | Postgres connection string |
| JWT_SECRET | Long random string — change before production |
| JWT_EXPIRES_IN | Token lifetime, e.g. `7d` |
| ANTHROPIC_API_KEY | Enables the AI receptionist/chatbot endpoints |
