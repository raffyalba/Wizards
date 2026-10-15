import { randomUUID } from "node:crypto";
import { getGameType } from "../shared/gameTypes.js";
import type { GameTypeTemplate } from "../shared/gameTypes.js";

export interface EventInput {
  name: string;
  gameTypeId: string;
  eventFormat: string;
  startDate: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
}

export interface EventRecord extends Omit<EventInput, "gameTypeId"> {
  id: string;
  gameTypeId: string;
  gameType: GameTypeTemplate;
  currentCapacity: number;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventName: string;
  playerName: string;
  registeredAt: string;
}

export interface EventPlayer {
  eventId: string;
  eventName: string;
  playerName: string;
}

interface StoredEvent extends EventInput {
  id: string;
}

export type RegistrationResult =
  | { ok: true; registration: EventRegistration; event: EventRecord }
  | {
      ok: false;
      status: 404 | 409;
      code: "NOT_FOUND" | "EVENT_FULL" | "DUPLICATE";
      error: string;
    };

export class EventStore {
  private readonly events = new Map<string, StoredEvent>();
  private readonly registrations = new Map<string, EventRegistration[]>();

  createEvent(input: EventInput): EventRecord {
    const gameType = getGameType(input.gameTypeId);
    if (!gameType) throw new Error("Choose a valid game type.");
    if (!gameType.eventFormats.includes(input.eventFormat)) {
      throw new Error("Choose a valid event format for this game type.");
    }
    const minimumCapacity = Math.max(
      gameType.minimumCapacity,
      gameType.minimumPlayersToStart,
    );
    const maximumCapacity = Math.min(gameType.maximumCapacity, 30);
    if (
      !Number.isInteger(input.capacity) ||
      input.capacity < minimumCapacity ||
      input.capacity > maximumCapacity
    ) {
      throw new Error(
        `Capacity for ${gameType.name} must be between ${minimumCapacity} and ${maximumCapacity}.`,
      );
    }

    const event: StoredEvent = { ...input, id: randomUUID() };
    this.events.set(event.id, event);
    this.registrations.set(event.id, []);
    return this.toEventRecord(event);
  }

  listEvents(): EventRecord[] {
    return [...this.events.values()]
      .map((event) => this.toEventRecord(event))
      .sort((left, right) =>
        `${left.startDate}T${left.startTime}`.localeCompare(
          `${right.startDate}T${right.startTime}`,
        ),
      );
  }

  getEvent(id: string): EventRecord | undefined {
    const event = this.events.get(id);
    return event ? this.toEventRecord(event) : undefined;
  }

  listEventPlayers(eventId: string): EventPlayer[] {
    const registrations = this.registrations.get(eventId) ?? [];
    return registrations.map(({ eventId, eventName, playerName }) => ({
      eventId,
      eventName,
      playerName,
    }));
  }

  register(eventId: string, playerName: string): RegistrationResult {
    const event = this.events.get(eventId);
    if (!event) {
      return {
        ok: false,
        status: 404,
        code: "NOT_FOUND",
        error: "This event could not be found.",
      };
    }

    const registrations = this.registrations.get(eventId) ?? [];
    const duplicate = registrations.some(
      (registration) =>
        registration.playerName.toLocaleLowerCase() ===
        playerName.toLocaleLowerCase(),
    );
    if (duplicate) {
      return {
        ok: false,
        status: 409,
        code: "DUPLICATE",
        error: "This name is already registered for the event.",
      };
    }

    if (registrations.length >= event.capacity) {
      return {
        ok: false,
        status: 409,
        code: "EVENT_FULL",
        error: "This event is full. No more registrations can be accepted.",
      };
    }

    const registration: EventRegistration = {
      id: randomUUID(),
      eventId,
      eventName: event.name,
      playerName,
      registeredAt: new Date().toISOString(),
    };
    registrations.push(registration);
    this.registrations.set(eventId, registrations);

    return {
      ok: true,
      registration,
      event: this.toEventRecord(event),
    };
  }

  private toEventRecord(event: StoredEvent): EventRecord {
    const gameType = getGameType(event.gameTypeId);
    if (!gameType) throw new Error("Event refers to an unknown game type.");
    return {
      ...event,
      gameType,
      currentCapacity: this.registrations.get(event.id)?.length ?? 0,
    };
  }
}

function dateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function seedDemoEvents(store: EventStore): void {
  const seedEvents: Array<EventInput & { names: string[] }> = [
    {
      name: "Commander at the Table",
      gameTypeId: "magic-the-gathering",
      eventFormat: "Commander",
      startDate: dateOffset(2),
      startTime: "18:00",
      endTime: "21:00",
      location: "The Wizards Table",
      capacity: 24,
      names: ["Alex Morgan", "Sam Rivera", "Jordan Lee", "Taylor Brooks"],
    },
    {
      name: "League Night",
      gameTypeId: "pokemon-tcg",
      eventFormat: "Standard",
      startDate: dateOffset(5),
      startTime: "17:30",
      endTime: "19:30",
      location: "The Wizards Table",
      capacity: 20,
      names: ["Riley Chen", "Jamie Patel", "Casey Bell"],
    },
    {
      name: "Open Board Game Evening",
      gameTypeId: "board-game",
      eventFormat: "Open Play",
      startDate: dateOffset(9),
      startTime: "18:30",
      endTime: "21:30",
      location: "The Wizards Table",
      capacity: 8,
      names: ["Morgan Ellis", "Avery Kim"],
    },
  ];

  for (const { names, ...input } of seedEvents) {
    const event = store.createEvent(input);
    for (const name of names) {
      store.register(event.id, name);
    }
  }
}
