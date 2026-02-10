# POS (Point of Sale)

Monorepo for a Point of Sale system:
- **Backend**: NestJS (TypeScript) API + DB layer
- **Web app**: React + Vite (TypeScript) POS UI
- **Desktop app**: Electron wrapper for running POS locally (optionally offline)

## Repo structure

- `backend/` — NestJS API server (defaults to `http://127.0.0.1:8000`)
- `point-of-sale/` — React + Vite frontend (dev server defaults to `http://localhost:5173`)
- `desktop/` — Electron app that can run web + backend together

## Prerequisites

- Node.js (LTS recommended)
- npm
 Quick start (web + backend)

1) Backend

bash
cd backend
npm install
cp .env.example .env
npm run start:dev

Notes:
- `JWT_SECRET` is required (the API will fail to boot without it).
- DB defaults to `DB_TYPE=sqljs` and stores data at `DB_PATH` (defaults to `backend/data/pos.sqlite`).
- To use Postgres, set `DB_TYPE=postgres` and `DATABASE_URL`.

2) Frontend

bash
cd point-of-sale
npm install
cp .env.example .env
npm run dev


The frontend calls the API using `VITE_API_URL` (defaults to `http://localhost:8000`).

Desktop app (Electron)

Runs backend + Vite dev server + Electron together:

bash
cd desktop
npm install
npm run dev


Offline-style build/run (packages the built web UI and backend build into Electron):


cd desktop
npm run start:offline


Building for production

Option A: Deploy backend and frontend separately

Backend: build and run

```bash
cd backend
npm install
npm run build
npm run start:prod
```
Frontend: build

```bash
cd point-of-sale
npm install
npm run build
```

Then host `point-of-sale/dist/` on any static host (and point it at your API with `VITE_API_URL`).

Option B: Single service (backend serves the built web app)

The backend will serve a built Vite app if it can find `point-of-sale/dist/index.html` (or if you set `WEB_DIST_DIR`).

```bash
cd point-of-sale
npm install
npm run build

cd ../backend
npm install
npm run build
npm run start:prod
```



- `GET /health` — health check
- `GET /version` — version info
- `GET /system/info` — system info


