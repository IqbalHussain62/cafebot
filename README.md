# Cafebot

A minimal, beginner-friendly chatbot for a small cafe. It answers menu
questions and takes an order — add / change / remove items, promotions,
pickup or delivery details, a priced checkout summary, and order placement —
then hands confirmed orders to a staff dashboard.

## Folder layout

```
cafebot/
├── prompts/
│   └── system-prompt.md   # the AI's persona, rules, and tool guidance
├── data/
│   ├── menu.json          # the only valid items, sizes, options, prices
│   ├── promotions.json    # the only valid promotions + eligibility rules
│   └── orders.json        # placed orders — created at runtime, git-ignored
├── backend/               # Node HTTP server: chat + ordering tools + dashboard API
│   ├── server.js
│   ├── package.json
│   └── README.md
├── frontend/              # customer chat UI — static mockup, not yet wired to the API
│   └── index.html, styles.css, app.js
├── dashboard/             # staff order dashboard — static, calls the API
│   └── index.html
├── package.json           # root: installs + starts the backend
├── .env.example           # copy to .env, or set as host env vars
├── .gitignore
├── CLAUDE.md              # working guidance for this repo
└── README.md              # this file
```

## Run locally

1. Copy `.env.example` to `.env` and set `ANTHROPIC_API_KEY` (everything else is
   optional — see the file for defaults).
2. From the repo root: `npm install && npm start` (this installs and runs the
   backend; it listens on `PORT`, default 3000).
3. Open `dashboard/index.html` in a browser for the staff view. If it isn't
   served from the backend's origin, set `API_BASE` at the top of its `<script>`.
   `frontend/index.html` is currently a static mockup and doesn't call the API.

## Deployment

**Backend** — deploy `backend/` as a Node service (Railway, Render, Fly, a VM…):

- Runtime: Node 18+. Install: `npm install`. Start: `npm start`.
  (From the repo root the root `package.json` does both; or set the service's
  root directory to `backend/`.)
- Set environment variables in the host's dashboard — **do not deploy a `.env`
  file**. `ANTHROPIC_API_KEY` is required; set `ALLOWED_ORIGIN` to the exact
  origin serving the static pages; set `TAX_RATE` / `DELIVERY_FEE` if you charge
  them. All keys and defaults are documented in `.env.example`.
- State is in memory and `data/orders.json` is on local disk. On hosts with an
  ephemeral filesystem, placed orders are lost on redeploy — fine for a demo,
  swap in real storage before real use.

**Frontend & dashboard** — plain static files; host on any static host (or serve
them from the backend). Point each page at the backend by editing the API-URL
constant at the top of its script, then make sure that host's origin is the one
in `ALLOWED_ORIGIN`.

**Before first deploy** — commit a `package-lock.json` (run `npm install` once)
so builds are reproducible, and double-check `git status` shows no `.env` and no
`data/orders.json`.

## Keeping it low cost

- Use a free-tier or pay-as-you-go AI API key; set a spending limit in the
  provider dashboard.
- Use the smallest capable model (e.g. a "haiku"/"mini" tier).
- Keep `data/menu.json` small so prompts stay short (fewer tokens = lower cost).
- Host the frontend on a free static host and the backend on a free tier.
