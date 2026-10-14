# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

````js
export default defineConfig([
  # The Wizards Table

  A small event calendar and registration app for tabletop game nights.

  ## Run locally

  From this directory:

  ```sh
  npm install
  npm run dev
````

The client runs at `http://localhost:5173`. The same command starts the Express API on port 3001.

## Features

- Month calendar and event list
- Organizer event creation with a maximum capacity of 30
- Event registration page and QR code
- Server-side capacity checks and duplicate-name rejection
- Downloadable `.ics` calendar invites with event title, time, and location

## Data and checks

Events and registrations are held in the API process memory and are seeded with examples on startup. Restarting the API resets all data. Registration capacity is checked and updated synchronously on the server before returning success.

```sh
npm run lint
npm test
npm run build
```

import reactDom from 'eslint-plugin-react-dom'
