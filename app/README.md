# The Wizards Table

A small event calendar and registration app for tabletop game nights.

## Run locally

From this directory:

```sh
npm install
npm run dev
```

The client runs at `http://localhost:5173`. The same command starts the Express API on port 3001.

## Features

- Month calendar and event list
- Organizer event creation with template-based formats and capacity limits
- Server-enforced registration capacity and duplicate-name rejection
- Registration QR code and downloadable `.ics` calendar invite

## Game type templates

Game types are defined in `shared/gameTypes.ts` and exposed by `GET /api/game-types`. Each template supplies its name, category, available event formats, minimum and maximum capacity, minimum players to start, and default capacity. The event form and API use this same registry, so adding a game type requires adding a template entry rather than changing event logic.

## Capacity

Each event has its own defined capacity. The current count is derived from its registration list, so it stays updated. The creation API and EventStore validate capacity against the selected game template’s minimum players needed to start, and the overall 30-player limit. Registration checks the count and adds the player synchronously in the server process. If two requests compete for the last seat, one is accepted and the next receives a 409 full-event response. See server/store.ts and server/index.ts.

## Timebox

To keep the end-to-end flow within the timebox, I used in-memory storage with seeded sample events instead of a persistent database. Restarting the API resets all events and registrations. I also left out authentication, event editing/cancellation, recurring events, email, and payments. The calendar is a simple custom month grid, and the game formats are representative template data. QR codes and .ics invites are generated in real time.

## What's next?

I’d add persistent storage with a database transaction or constraint for last-seat registration across multiple server instances. I’d also add organizer authentication, create/edit game type templates, event editing/cancellation, and clearer timezone handling for calendar invites.

## AI usage note

I used GitHub Copilot to implement the React/TypeScript UI, Express API, and tests. I used terminal runs for build, lint, tests, and browser checks to verify the registration flow. One issue I caught and fixed: Game type was hardcoded and it didn't have its own entity. I've created the necessary entity and wired into the event creation so it will follow the maximum capacity.

## Data and checks

Events and registrations live in the API process memory and are seeded with examples on startup. Restarting the API resets all data. Registration is checked synchronously on the server before a place is assigned.

```sh
npm run lint
npm test
npm run build
```
