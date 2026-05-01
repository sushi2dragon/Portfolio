# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website with a blog/project showcase. Key features:
- Visitor-facing: hero landing, about, tag-filtered project grid, contact
- Admin: password-protected CMS to add/edit/delete projects
- Three.js animated particle-network background on hero section
- Dark/light mode with a warm amber/brown color palette
- Hand-drawn sketch aesthetic using Caveat font for accent elements

Design references: brittanychiang.com (layout/elegance), BetterDiscord themes page (project tile grid).

## Development Commands

```bash
# Install all deps (run once after cloning)
npm run install:all

# Start both client + server in parallel
npm run dev

# Client only (port 5173)
npm run dev:client

# Server only (port 3001)
npm run dev:server

# Production build
cd client && npm run build
```

## Architecture

```
Portfolio/
├── client/          # Vite + React frontend
│   └── src/
│       ├── components/
│       │   ├── Hero/         # ThreeBackground.jsx + Hero.jsx
│       │   ├── Navbar/
│       │   ├── Projects/     # Projects.jsx (grid+filter) + ProjectCard.jsx
│       │   ├── About/
│       │   └── Contact/
│       ├── context/
│       │   └── ThemeContext.jsx   # dark/light toggle, persists to localStorage
│       └── pages/
│           ├── Home.jsx           # composes all sections
│           ├── AdminLogin.jsx     # POST /api/auth/login → stores JWT
│           └── AdminDashboard.jsx # full CRUD, requires token
└── server/          # Express API
    ├── routes/
    │   ├── auth.js        # POST /api/auth/login (bcrypt compare)
    │   └── projects.js    # GET (public), POST/PUT/DELETE (requireAuth)
    ├── middleware/auth.js  # JWT verification
    └── data/projects.json  # flat-file project store
```

## Key Implementation Notes

- **Theming**: CSS custom properties on `:root` (dark) and `[data-theme='light']`. ThemeContext sets `document.documentElement.setAttribute('data-theme', ...)`. All components consume variables directly — no JS theme injection needed.
- **Three.js scene**: `ThreeBackground.jsx` creates a particle network (120 points, lines drawn between particles within distance 22). Runs in a `useEffect` with full cleanup. Color reads `data-theme` at mount time.
- **API proxy**: Vite dev server proxies `/api/*` → `http://localhost:3001`, so `fetch('/api/projects')` works identically in dev and prod (where Express serves both).
- **Auth flow**: Login stores JWT in `localStorage` as `admin_token`. Dashboard reads it on mount, redirects to `/admin` on 401.
- **Project storage**: `server/data/projects.json` — simple array, newest-first. No database.
- **Admin password**: Stored as bcrypt hash in `server/.env` as `ADMIN_HASH`. Default is `admin1234` — **change before deploying**.

## Adding Your Portrait

Replace the placeholder in `Hero.jsx`:
```jsx
// Replace <div className="portrait__placeholder"> with:
<img src="/your-sketch.png" alt="Sarthak" className="portrait__frame img" />
```
Place the image in `client/public/`. The frame has a `sepia(20%)` filter that complements a hand-drawn sketch.

## Theming / Colors

All palette values are in `client/src/index.css` under `:root` (dark) and `[data-theme='light']`. Change `--accent` to shift the primary color across the entire site.

## Fonts

- `Playfair Display` — headings
- `Inter` — body
- `Caveat` — sketch/handwritten accent (`.sketch` class)
- `JetBrains Mono` — labels, tags, code (`.mono` class)
