import type {
  EventInput,
  EventPlayer,
  EventRecord,
  RegistrationResponse,
} from "./types";
import type { GameTypeTemplate } from "../shared/gameTypes";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      payload?.error ?? "Something went wrong. Please try again.",
    );
  }
  return payload as T;
}

export function listEvents(): Promise<EventRecord[]> {
  return request<EventRecord[]>("/api/events");
}

export function listEventPlayers(eventId: string): Promise<EventPlayer[]> {
  return request<EventPlayer[]>(`/api/events/${eventId}/registrations`);
}

export function listGameTypes(): Promise<GameTypeTemplate[]> {
  return request<GameTypeTemplate[]>("/api/game-types");
}

export function getEvent(id: string): Promise<EventRecord> {
  return request<EventRecord>(`/api/events/${id}`);
}

export function createEvent(input: EventInput): Promise<EventRecord> {
  return request<EventRecord>("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function registerForEvent(
  id: string,
  playerName: string,
): Promise<RegistrationResponse> {
  return request<RegistrationResponse>(`/api/events/${id}/registrations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerName }),
  });
}
