# FitFindr

FitFindr is a Vite + React application that showcases a local-first experience for discovering fitness professionals, pickup games, courts, and player leaderboards. The original project was bootstrapped with a Base44 template, but it has been refactored to run completely offline using mock data stored in the browser.

## Getting started

```bash
npm install
npm run dev
```

Then open the URL printed in the terminal to explore the app.

## Available scripts

- `npm run dev` – start the development server
- `npm run build` – create a production build
- `npm run preview` – preview the production build locally
- `npm run lint` – run ESLint over the project

## Data model

All data is stored locally using seed data defined in `src/api/seedData.js`. When the app runs in the browser, changes made through the UI are persisted to `localStorage` so you can continue iterating without an external API.

To reset the demo data, clear the `localStorage` entry with the key `fitfinder:data` or call the `resetDataStore` helper exported from `src/api/localDataStore.js`.
