import express from "express";
import { createEvent as createCalendarInvite } from "ics";
import type { EventInput } from "./store.js";
import { EventStore, seedDemoEvents } from "./store.js";

const app = express();
const store = new EventStore();
seedDemoEvents(store);

app.use(express.json({ limit: "16kb" }));

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

app.post("/api/events", (request, response) => {
  const input = request.body as Partial<EventInput>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const gameType =
    typeof input.gameType === "string" ? input.gameType.trim() : "";
  const startDate = typeof input.startDate === "string" ? input.startDate : "";
  const startTime = typeof input.startTime === "string" ? input.startTime : "";
  const endTime = typeof input.endTime === "string" ? input.endTime : "";
  const location =
    typeof input.location === "string" ? input.location.trim() : "";
  const capacity = input.capacity;

  if (!name || name.length > 80 || !gameType || gameType.length > 50) {
    response
      .status(400)
      .json({ error: "Enter a valid event name and game type." });
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
  if (
    !Number.isInteger(capacity) ||
    Number(capacity) < 1 ||
    Number(capacity) > 30
  ) {
    response
      .status(400)
      .json({ error: "Capacity must be between 1 and 30 players." });
    return;
  }

  const event = store.createEvent({
    name,
    gameType,
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
    description: `${event.gameType} event. ${event.currentCapacity} of ${event.capacity} places currently registered.`,
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
