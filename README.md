# AI-Powered Cyber Threat Intelligence Platform

A modern cybersecurity dashboard with real-time threat monitoring, mock analytics APIs, and a production-ready frontend build.

## 🚀 Features

- **Realtime Dashboard UI**: Responsive React + Tailwind interface and charts
- **Mock Intelligence APIs**: Ready-made endpoints for stats and alerts
- **Production Build**: One-command builds targeted to your domain
- **Safe CORS**: Frontend can call backend from allowed origins only

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (dev server and build)
- Tailwind CSS + Radix UI (shadcn-style components)
- TanStack Query for data fetching/caching

### Backend
- Node.js + Express (plain JS simple server)
- CORS configured for `http://localhost:5173` and `https://cyberintelai.co`

## 📦 Scripts

Root `package.json`:

```bash
# Install deps (root + backend)
npm run install:all

# Development
npm run dev            # Frontend at http://localhost:5173
npm run backend:start  # Backend at  http://localhost:3001
npm run dev:full       # Run both in parallel

# Lint & types
npm run lint
npm run type-check

# Builds
npm run backend:build  # No-op (backend is plain JS)
npm run build          # Frontend production build → dist/
npm run build:full     # Backend build then frontend build
npm run build:prod:domain  # Build with API base = https://cyberintelai.co/api/v1
```

Backend `package.json`:

```bash
npm start       # node simple-server.js
npm run dev     # same behavior, for convenience
npm run build   # logs no-op (kept for CI symmetry)
```

## 🔧 Configuration

The frontend reads the API base at build-time from `VITE_API_BASE_URL`.

- Development default: `http://localhost:3001/api/v1` (in code)
- Production example build:

```bash
npm run build:prod:domain
# Equivalent to: VITE_API_BASE_URL=https://cyberintelai.co/api/v1 npm run build
```

If you prefer an env file, create `.env.production` and add:

```env
VITE_API_BASE_URL=https://cyberintelai.co/api/v1
```

Then run `npm run build`.

## 📊 Backend API Endpoints (mock data)

- `GET /health`
- `GET /api/v1/health`
- `GET /api/v1/dashboard/stats`
- `GET /api/v1/dashboard/alerts`

All served by `backend/simple-server.js`.

## 🌐 CORS

Allowed origins (backend):
- `http://localhost:5173`
- `https://cyberintelai.co` and `https://www.cyberintelai.co`

Adjust in `backend/simple-server.js` (`allowedOrigins`) if needed.

## 🧪 Quick Start

```bash
# 1) Install dependencies (root + backend)
npm run install:all

# 2) Start backend	npm run backend:start
#    http://localhost:3001/health

# 3) Start frontend	npm run dev
#    http://localhost:5173
```

## 🚀 Production

Build the frontend targeting your domain and deploy `dist/` via any static host or Nginx. Proxy `/api/` to the backend.

```bash
npm run build:full
npm run build:prod:domain
```

High-level Nginx idea (not exhaustive):

```nginx
location /api/ { proxy_pass http://127.0.0.1:3001/; }
location /     { try_files $uri /index.html; }
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT

---

Built with ❤️ by the Cyber Threat Intelligence Team
