import express from "express";
import { createEvent as createCalendarInvite } from "ics";
import { GAME_TYPES, getGameType } from "../shared/gameTypes.js";
import type { EventInput } from "./store.js";
import { EventStore, seedDemoEvents } from "./store.js";

const app = express();
const store = new EventStore();
seedDemoEvents(store);

app.use(express.json({ limit: "16kb" }));

app.get("/api/game-types", (_request, response) => {
  response.json(GAME_TYPES);
});

app.get("/api/events", (_request, response) => {
  response.json(store.listEvents());
});

app.get("/api/events/:id", (request, response) => {
  const event = store.getEvent(request.params.id);
  if (!event) {
    response.status(404).json({ error: "This event could not be found." });
    return;
  }
  response.json(event);
});

app.get("/api/events/:id/registrations", (request, response) => {
  if (!store.getEvent(request.params.id)) {
    response.status(404).json({ error: "This event could not be found." });
    return;
  }
  response.json(store.listEventPlayers(request.params.id));
});

app.post("/api/events", (request, response) => {
  const input = request.body as Partial<EventInput>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const gameTypeId =
    typeof input.gameTypeId === "string" ? input.gameTypeId : "";
  const eventFormat =
    typeof input.eventFormat === "string" ? input.eventFormat : "";
  const startDate = typeof input.startDate === "string" ? input.startDate : "";
  const startTime = typeof input.startTime === "string" ? input.startTime : "";
  const endTime = typeof input.endTime === "string" ? input.endTime : "";
  const location =
    typeof input.location === "string" ? input.location.trim() : "";
  const capacity = input.capacity;

  if (!name || name.length > 80 || !gameTypeId) {
    response
      .status(400)
      .json({ error: "Enter a valid event name and game type." });
    return;
  }
  const gameType = getGameType(gameTypeId);
  if (!gameType) {
    response.status(400).json({ error: "Choose a valid game type." });
    return;
  }
  if (!gameType.eventFormats.includes(eventFormat)) {
    response.status(400).json({
      error: `Choose a valid event format for ${gameType.name}.`,
    });
    return;
  }
  if (!isDate(startDate) || !isTime(startTime) || !isTime(endTime)) {
    response
      .status(400)
      .json({ error: "Enter a valid date and start/end time." });
    return;
  }
  if (timeMinutes(endTime) <= timeMinutes(startTime)) {
    response
      .status(400)
      .json({ error: "End time must be after the start time." });
    return;
  }
  if (!location || location.length > 120) {
    response
      .status(400)
      .json({ error: "Enter a location of 120 characters or fewer." });
    return;
  }
  const minimumCapacity = Math.max(
    gameType.minimumCapacity,
    gameType.minimumPlayersToStart,
  );
  const maximumCapacity = Math.min(gameType.maximumCapacity, 30);
  if (
    !Number.isInteger(capacity) ||
    Number(capacity) < minimumCapacity ||
    Number(capacity) > maximumCapacity
  ) {
    response.status(400).json({
      error: `Capacity for ${gameType.name} must be between ${minimumCapacity} and ${maximumCapacity} players.`,
    });
    return;
  }

  const event = store.createEvent({
    name,
    gameTypeId,
    eventFormat,
    startDate,
    startTime,
    endTime,
    location,
    capacity: Number(capacity),
  });
  response.status(201).json(event);
});

app.post("/api/events/:id/registrations", (request, response) => {
  const playerName =
    typeof request.body?.playerName === "string"
      ? request.body.playerName.trim()
      : "";

  if (!playerName || playerName.length > 80) {
    response
      .status(400)
      .json({ error: "Enter a name of 80 characters or fewer." });
    return;
  }

  const result = store.register(request.params.id, playerName);
  if (!result.ok) {
    response
      .status(result.status)
      .json({ code: result.code, error: result.error });
    return;
  }
  response.status(201).json(result);
});

app.get("/api/events/:id/invite", (request, response) => {
  const event = store.getEvent(request.params.id);
  if (!event) {
    response.status(404).json({ error: "This event could not be found." });
    return;
  }

  const [year, month, day] = event.startDate.split("-").map(Number);
  const [startHour, startMinute] = event.startTime.split(":").map(Number);
  const [endHour, endMinute] = event.endTime.split(":").map(Number);
  const invite = createCalendarInvite({
    title: event.name,
    description: `${event.gameType.name} - ${event.eventFormat}. ${event.currentCapacity} of ${event.capacity} places currently registered.`,
    location: event.location,
    start: [year, month, day, startHour, startMinute],
    end: [year, month, day, endHour, endMinute],
    startInputType: "local",
    startOutputType: "utc",
  });

  if (invite.error || !invite.value) {
    response
      .status(500)
      .json({ error: "The calendar invite could not be generated." });
    return;
  }

  const filename =
    event.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "event";
  response.setHeader("Content-Type", "text/calendar; charset=utf-8");
  response.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}.ics"`,
  );
  response.send(invite.value);
});

function isDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  return (
    new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10) ===
    value
  );
}

function isTime(value: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;
  const [hours, minutes] = value.split(":").map(Number);
  return hours < 24 && minutes < 60;
}

function timeMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`Event API listening on http://localhost:${port}`);
});
