# FitFindr

FitFindr is a Vite + React application that showcases a local-first experience for discovering fitness professionals, pickup games, courts, and player leaderboards. The original project was bootstrapped with a Base44 template, but it has been refactored to run completely offline using mock data stored in the browser.

## Getting started

```bash
npm install
npm run dev
```

Then open the URL printed in the terminal to explore the app.

## AI Interpretation (Gemini)

FitFindr AI uses a small Express server to keep your Gemini API key off the client. The server accepts the AI zip package, unpacks it, and sends the prompt + video + landmarks to Gemini.

Node 18+ is recommended for the built-in `fetch` used by the server.

### Local setup

1) Create a `.env` file at the project root:

```bash
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-1.5-flash
```

2) Start the API server in one terminal:

```bash
npm run dev:server
```

3) Start the Vite client in another terminal:

```bash
npm run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:8080`.

### Render deployment (single service)

1) Create a new Render **Web Service** from this repo.
2) Set environment variables:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` (optional, defaults to `gemini-1.5-flash`)
3) Build command:

```bash
npm install && npm run build
```

4) Start command:

```bash
npm run start
```

The Express server serves the built app from `dist/` and exposes `/api/ai/interpret`.

### Exercise image mapping

Exercise image folders live under `public/exercises/{exercise_id}/images/`. The AI package includes `exercise.id` and `exercise.folder` so Gemini can return URLs like:

```
/exercises/{exercise_id}/images/0.jpg
/exercises/{exercise_id}/images/1.jpg
```

## Available scripts

- `npm run dev` – start the Vite development server
- `npm run dev:server` – start the Express API server on port 8080
- `npm run build` – create a production build
- `npm run preview` – preview the production build locally
- `npm run lint` – run ESLint over the project
- `npm run start` – start the Express server (serves `dist/` + API)

## Data model

All data is stored locally using seed data defined in `src/api/seedData.js`. When the app runs in the browser, changes made through the UI are persisted to `localStorage` so you can continue iterating without an external API.

To reset the demo data, clear the `localStorage` entry with the key `fitfinder:data` or call the `resetDataStore` helper exported from `src/api/localDataStore.js`.
