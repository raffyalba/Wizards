import type { GameTypeTemplate } from "../shared/gameTypes";

export interface EventRecord {
  id: string;
  name: string;
  gameTypeId: string;
  gameType: GameTypeTemplate;
  eventFormat: string;
  startDate: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  currentCapacity: number;
}

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

export interface EventPlayer {
  eventId: string;
  eventName: string;
  playerName: string;
}

export interface RegistrationResponse {
  registration: {
    id: string;
    eventId: string;
    eventName: string;
    playerName: string;
    registeredAt: string;
  };
  event: EventRecord;
}
