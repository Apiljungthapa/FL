# forth-ledger

React + Vite frontend (`src/`) with a Python FastAPI backend (`backend/`)
for the consultation form.

## Run locally

One-time setup:

```bash
python -m venv .venv
.venv\Scripts\python -m pip install -r backend/requirements.txt   # macOS/Linux: .venv/bin/python
npm install
```

Then start backend + frontend together:

```bash
npm start                         # open http://localhost:5173
```

`npm start` launches the backend (`python -m uvicorn`, port 8000) and
Vite (port 5173, which proxies `/api` to the backend). It doesn't use
the `uvicorn.exe` / `vite.cmd` launchers, which Windows Application
Control can block. Ctrl+C stops both.

With no SMTP configured, emails are written to `backend/data/outbox.log`
instead of being sent. See `backend/README.md` for SMTP and deployment.

## Production (single process)

```bash
npm run build                     # creates dist/
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

When `dist/` exists, FastAPI serves the built site as well as `/api/*`.
