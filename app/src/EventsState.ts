import { createContext, useContext } from "react";
import type { EventRecord } from "./types";

interface EventsContextValue {
  events: EventRecord[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}

export const EventsContext = createContext<EventsContextValue | undefined>(
  undefined,
);

export function useEvents(): EventsContextValue {
  const value = useContext(EventsContext);
  if (!value) throw new Error("useEvents must be used within EventsProvider.");
  return value;
}
