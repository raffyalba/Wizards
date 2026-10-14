export interface EventRecord {
  id: string;
  name: string;
  gameType: string;
  startDate: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  currentCapacity: number;
}

export interface EventInput {
  name: string;
  gameType: string;
  startDate: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
}

export interface RegistrationResponse {
  registration: {
    id: string;
    eventId: string;
    playerName: string;
    registeredAt: string;
  };
  event: EventRecord;
}
