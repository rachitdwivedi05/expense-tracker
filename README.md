# Expense Tracker Deployment Guide

Full-stack MERN Expense Tracker deployment setup for:

- Frontend: React + Vite on Vercel
- Backend: Node.js + Express on Render
- Database: MongoDB Atlas

## Deployment Order

Deploy the backend first, then deploy the frontend. The frontend needs the final Render backend URL in `VITE_API_URL`, and the backend needs the final Vercel frontend URL in `CLIENT_URL`.

## Backend on Render

Render service type: Web Service

Root directory:

```bash
backend
```

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Required Render environment variables:

```bash
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=<long-random-secret>
CLIENT_URL=https://your-frontend.vercel.app
NODE_ENV=production
SENDER_EMAIL=<gmail-address>
SENDER_PASSWORD=<gmail-app-password>
```

Optional Render environment variable:

```bash
FORGOT_TOKEN_SECRET=<long-random-secret-for-reset-links>
```

Render automatically provides `PORT`; do not hardcode it in Render settings.

## Frontend on Vercel

Vercel project root directory:

```bash
frontend
```

Framework preset:

```bash
Vite
```

Build command:

```bash
npm run build
```

The build script uses Vite's runner config loader to avoid a Windows/OneDrive esbuild config-loading issue while remaining compatible with Vercel.

Output directory:

```bash
dist
```

Required Vercel environment variable:

```bash
VITE_API_URL=https://your-backend.onrender.com
```

After setting or changing Vercel environment variables, redeploy the frontend because Vite reads `VITE_*` variables at build time.

## Local Development

Backend:

```bash
cd backend
npm install
npm start
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Create local `.env` files from the `.env.example` files. Do not commit real `.env` files.

## Production Notes

- CORS allows only `CLIENT_URL` in production.
- Cookies are `secure` and `sameSite=none` in production so Vercel can authenticate with Render.
- MongoDB uses `MONGO_URI`; old local names remain as fallbacks only to avoid breaking existing setups.
- `frontend/vercel.json` rewrites all routes to `index.html` so direct visits like `/signup` and `/app/user/dashboard` work on Vercel.
