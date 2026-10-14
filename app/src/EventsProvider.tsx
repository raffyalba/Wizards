import { useEffect, useState } from "react";
import type { PropsWithChildren } from "react";
import { listEvents } from "./api";
import { EventsContext } from "./EventsState";
import type { EventRecord } from "./types";

export function EventsProvider({ children }: PropsWithChildren) {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    setError("");
    try {
      setEvents(await listEvents());
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not load events.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    listEvents()
      .then((nextEvents) => {
        if (active) setEvents(nextEvents);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(
            caught instanceof Error ? caught.message : "Could not load events.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <EventsContext.Provider value={{ events, loading, error, refresh }}>
      {children}
    </EventsContext.Provider>
  );
}
