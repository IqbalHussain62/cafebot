# CLAUDE.md

Guidance for working on the Cafebot project.

## Project purpose

Cafebot is a small, beginner-friendly chatbot for a neighborhood cafe. It
answers questions about the menu, hours, and location, and helps a customer
put together a simple order (no payment). It should stay small, cheap to run,
and easy to understand.

## Architecture

Three simple parts:

1. **prompts/** — plain-text instructions that tell the AI how to behave
   (`system-prompt.md`).
2. **data/** — static cafe data the bot reads (`menu.json`: cafe info + menu).
3. **backend/** — one small server. `POST /api/chat` loads the prompt and data,
   calls the AI provider with the ordering tools, and returns the reply plus the
   session's order state; `GET /api/order` returns that state; `GET /api/orders`
   and `POST /api/orders/status` back the staff dashboard.
4. **frontend/** — one plain HTML + JavaScript page: a message list and an
   input box that talk to the backend.
5. **dashboard/** — one static page for staff: lists placed orders from
   `data/orders.json` and updates their status.

Data flow: `frontend -> POST /api/chat -> backend -> AI provider -> backend -> frontend`.

No database. Order state is kept in memory per session and lost on restart;
placed orders are appended to `data/orders.json`. No user accounts or auth.
Config and secrets come from `.env` (see `.env.example`).

## Coding rules

- Keep it simple. Prefer a few short files over a framework.
- Plain JavaScript/HTML unless there is a clear reason to add a dependency.
- Add a dependency only when necessary; explain why in the commit.
- Clear names, small functions, short comments only where the intent is not
  obvious.
- Match the style already in the file you are editing.
- Do not add build steps, linters, or config unless asked.

## Security rules

- Never commit `.env`, real API keys, or `data/orders.json` (customer PII). All
  three are in `.gitignore` — keep them there. In production, set config as host
  env vars, not a deployed `.env` file.
- API keys live only in the environment and are read on the server. Never send
  keys to the frontend or put them in client code.
- Treat all user chat input as untrusted. Do not pass it to a shell, file
  path, or `eval`.
- The bot must only use the cafe data provided. It must not invent prices or
  menu items, and it cannot take payment.
- Keep dependencies minimal to reduce supply-chain risk.
- Set a spending limit in the AI provider dashboard.

## Token-saving rules

- Keep `system-prompt.md` and `menu.json` short — they are sent on every call.
- Send only the data the bot needs, not the whole repo.
- Use the cheapest capable model (a "haiku"/"mini" tier).
- Do not send long conversation history; keep only the last few messages.
- Avoid verbose logging of full prompts/responses in production.

## Scope rule

Modify only the files needed for the current task. Do not refactor, rename,
reformat, or "clean up" unrelated code. If you notice something else worth
changing, mention it instead of doing it.
