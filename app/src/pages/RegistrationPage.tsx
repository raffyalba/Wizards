import { useState } from "react";
import type { FormEvent } from "react";
import { CalendarDays, Clock3, MapPin, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { registerForEvent } from "../api";
import { useEvents } from "../EventsState";

function RegistrationPage() {
  const { id } = useParams();
  const { events, loading, error: loadError, refresh } = useEvents();
  const [playerName, setPlayerName] = useState("");
  const [registeredName, setRegisteredName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const event = events.find((item) => item.id === id);

  async function handleSubmit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    if (!event) return;
    setSubmitting(true);
    setError("");
    try {
      const result = await registerForEvent(event.id, playerName.trim());
      setRegisteredName(result.registration.playerName);
      void refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not complete registration.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return <main className="page page-loading">Loading event...</main>;
  if (loadError)
    return (
      <main className="page">
        <p className="notice notice-error" role="alert">
          {loadError}
        </p>
      </main>
    );
  if (!event) {
    return (
      <main className="page registration-page">
        <span className="eyebrow">REGISTRATION</span>
        <h1>Event not found.</h1>
        <Link className="text-link" to="/">
          Back to calendar
        </Link>
      </main>
    );
  }

  const date = new Date(`${event.startDate}T00:00:00`);
  const full = event.currentCapacity >= event.capacity;

  return (
    <main className="page registration-page">
      <div className="registration-card">
        <span className="eyebrow">
          PLAYER REGISTRATION / {event.gameType.toUpperCase()}
        </span>
        <h1>{event.name}</h1>
        <div className="registration-event-meta">
          <span>
            <CalendarDays size={15} />{" "}
            {date.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span>
            <Clock3 size={15} /> {event.startTime} to {event.endTime}
          </span>
          <span>
            <MapPin size={15} /> {event.location}
          </span>
          <span>
            <Users size={15} /> {event.currentCapacity} / {event.capacity}{" "}
            registered
          </span>
        </div>

        {registeredName ? (
          <div className="registration-success" role="status">
            <span className="success-check" aria-hidden="true">
              &check;
            </span>
            <h2>You have a seat, {registeredName}.</h2>
            <p>You're on the list for this event. See you at the table.</p>
            <Link className="button button-outline" to={`/events/${event.id}`}>
              View event details
            </Link>
          </div>
        ) : (
          <form className="registration-form" onSubmit={handleSubmit}>
            {full && (
              <p className="notice notice-full" role="status">
                This event is full. Registration is closed.
              </p>
            )}
            <label className="form-field">
              <span>Your name</span>
              <input
                value={playerName}
                onChange={(changeEvent) =>
                  setPlayerName(changeEvent.target.value)
                }
                maxLength={80}
                autoComplete="name"
                placeholder="Enter your name"
                required
                disabled={full}
              />
            </label>
            {error && (
              <p className="notice notice-error" role="alert">
                {error}
              </p>
            )}
            <button
              className="button button-primary register-submit"
              type="submit"
              disabled={full || submitting}
            >
              {submitting
                ? "Saving your seat..."
                : full
                  ? "Event full"
                  : "Register for this event"}{" "}
              <span aria-hidden="true">&rarr;</span>
            </button>
            <small className="registration-footnote">
              One registration per name. Your spot is confirmed when you submit.
            </small>
          </form>
        )}
      </div>
    </main>
  );
}

export default RegistrationPage;
