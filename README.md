# 🛡️ PR Sentinel

A dashboard for monitoring GitHub pull requests across repositories. Built with React, TypeScript, MUI DataGrid, and Express.

## Features

- **GitHub OAuth** sign-in (Sign in with GitHub)
- **Multi-repo PR monitoring** — configure any number of GitHub repositories
- **Smart filtering** — by team, workflow status, author, reviewer, and comment resolution
- **MUI DataGrid table** with sortable, filterable columns
- **PR detail drawer** — review threads, approvals, comments at a glance
- **Bot-aware comment counting** — ignores bots like `dependabot[bot]`, `copilot`, `github-actions`
- **In-memory caching** — 45-second TTL to reduce API calls
- **Auto-refresh** — polls every 60 seconds, manual refresh button

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| UI | MUI v5 + MUI DataGrid v6 |
| State | Zustand (filters) + React Query (server state) |
| Backend | Node.js + Express + TypeScript |
| Auth | GitHub OAuth 2.0 |
| Data | GitHub GraphQL API |
| Cache | node-cache (45s TTL) |

## Setup

### 1. Create a GitHub OAuth App

1. Go to GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Set **Homepage URL** to `http://localhost:5173`
3. Set **Authorization callback URL** to `http://localhost:3001/auth/github/callback`
4. Copy the **Client ID** and **Client Secret**

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
GITHUB_CLIENT_ID=<your_client_id>
GITHUB_CLIENT_SECRET=<your_client_secret>
SESSION_SECRET=<a_random_secret>
FRONTEND_URL=http://localhost:5173
PORT=3001
```

### 3. Configure repositories

Edit `backend/repositories.config.json`:
```json
{
  "repositories": [
    "facebook/react",
    "microsoft/vscode"
  ]
}
```

### 4. Install dependencies and run

```bash
# From root
npm run install:all
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Architecture

```
pr-sentinel/
├── backend/                 # Express API server
│   ├── src/
│   │   ├── index.ts         # Server entry, routes
│   │   ├── github.ts        # GitHub GraphQL client
│   │   ├── normalizer.ts    # PR data normalization
│   │   ├── cache.ts         # In-memory cache (node-cache)
│   │   ├── config.ts        # Repository config loader
│   │   └── types.ts         # Shared TypeScript types
│   └── repositories.config.json
├── frontend/                # React + Vite application
│   └── src/
│       ├── components/      # Header, FilterBar, PRTable, PRDetailDrawer
│       ├── hooks/           # useAuth, usePRs, useFilteredPRs
│       ├── store/           # Zustand filter store
│       └── types/           # TypeScript interfaces
└── package.json             # Root scripts
```

## Bot Detection

PRs ignore activity from:
- Any login ending with `[bot]` (e.g. `dependabot[bot]`, `renovate[bot]`)
- `copilot`
- `github-actions`

## Future Extensions

- Slack alerts for stale PRs
- PR aging indicators
- Review SLA metrics
- Team review workload metrics
- Auto-detection of blocked PRs