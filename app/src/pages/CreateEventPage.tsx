import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, CalendarDays, MapPin, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createEvent, listGameTypes } from "../api";
import { useEvents } from "../EventsState";
import type { GameTypeTemplate } from "../../shared/gameTypes";
import type { EventInput } from "../types";

function initialDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function CreateEventPage() {
  const navigate = useNavigate();
  const { refresh } = useEvents();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [gameTypes, setGameTypes] = useState<GameTypeTemplate[]>([]);
  const [gameTypeId, setGameTypeId] = useState("");
  const [eventFormat, setEventFormat] = useState("");
  const [capacity, setCapacity] = useState("");
  const selectedGameType = gameTypes.find(
    (gameType) => gameType.id === gameTypeId,
  );
  const minimumSeatCount = selectedGameType
    ? Math.max(
        selectedGameType.minimumCapacity,
        selectedGameType.minimumPlayersToStart,
      )
    : 1;
  const maximumSeatCount = Math.min(
    selectedGameType?.maximumCapacity ?? 30,
    30,
  );

  useEffect(() => {
    let active = true;
    listGameTypes()
      .then((types) => {
        if (!active) return;
        setGameTypes(types);
        const firstType = types[0];
        if (firstType) {
          setGameTypeId(firstType.id);
          setEventFormat(firstType.eventFormats[0] ?? "");
          setCapacity(String(firstType.defaultCapacity));
        }
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Could not load game types.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const input: EventInput = {
      name: String(form.get("name") ?? "").trim(),
      gameTypeId: String(form.get("gameTypeId") ?? ""),
      eventFormat: String(form.get("eventFormat") ?? ""),
      startDate: String(form.get("startDate") ?? ""),
      startTime: String(form.get("startTime") ?? ""),
      endTime: String(form.get("endTime") ?? ""),
      location: String(form.get("location") ?? "").trim(),
      capacity: Number(form.get("capacity")),
    };

    try {
      const created = await createEvent(input);
      await refresh();
      navigate(`/events/${created.id}`);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not create event.",
      );
      setSaving(false);
    }
  }

  return (
    <main className="page form-page">
      <Link className="back-link" to="/events">
        <ArrowLeft size={15} /> Back to events
      </Link>
      <div className="form-page-heading">
        <span className="eyebrow">ORGANIZER / NEW EVENT</span>
        <h1>Set the next table.</h1>
        <p>Choose a game, pick a time, and decide how many seats to open.</p>
      </div>

      <form className="event-form" onSubmit={handleSubmit}>
        <div className="form-section-heading">
          <span className="section-number">01</span>
          <div>
            <h2>Event details</h2>
            <p>Give players the essentials.</p>
          </div>
        </div>
        <label className="form-field">
          <span>Event name</span>
          <input
            name="name"
            type="text"
            placeholder="Friday Commander Night"
            maxLength={80}
            required
          />
        </label>
        <label className="form-field">
          <span>Game type</span>
          <select
            name="gameTypeId"
            value={gameTypeId}
            onChange={(changeEvent) => {
              const nextType = gameTypes.find(
                (gameType) => gameType.id === changeEvent.target.value,
              );
              setGameTypeId(changeEvent.target.value);
              setEventFormat(nextType?.eventFormats[0] ?? "");
              setCapacity(String(nextType?.defaultCapacity ?? ""));
            }}
            required
          >
            {gameTypes.map((gameType) => (
              <option key={gameType.id} value={gameType.id}>
                {gameType.name}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Event format</span>
          <select
            name="eventFormat"
            value={eventFormat}
            onChange={(changeEvent) => setEventFormat(changeEvent.target.value)}
            required
            disabled={!selectedGameType}
          >
            {selectedGameType?.eventFormats.map((format) => (
              <option key={format} value={format}>
                {format}
              </option>
            ))}
          </select>
        </label>
        {selectedGameType && (
          <div className="template-summary" aria-live="polite">
            <span>{selectedGameType.format}</span>
            <span>
              Capacity {minimumSeatCount} to {maximumSeatCount}
            </span>
            <span>
              {selectedGameType.minimumPlayersToStart} players to start
            </span>
          </div>
        )}

        <div className="form-section-heading form-section-spaced">
          <span className="section-number">02</span>
          <div>
            <h2>Time and place</h2>
            <p>Set the schedule players will see.</p>
          </div>
        </div>
        <div className="form-grid two-fields">
          <label className="form-field">
            <span>
              <CalendarDays size={14} /> Date
            </span>
            <input
              name="startDate"
              type="date"
              defaultValue={initialDate()}
              required
            />
          </label>
          <label className="form-field">
            <span>
              <MapPin size={14} /> Location
            </span>
            <input
              name="location"
              type="text"
              placeholder="The Wizards Table"
              maxLength={120}
              required
            />
          </label>
          <label className="form-field">
            <span>Starts</span>
            <input name="startTime" type="time" defaultValue="18:00" required />
          </label>
          <label className="form-field">
            <span>Ends</span>
            <input name="endTime" type="time" defaultValue="20:00" required />
          </label>
        </div>

        <div className="form-section-heading form-section-spaced">
          <span className="section-number">03</span>
          <div>
            <h2>Player capacity</h2>
            <p>Capacity and minimum players follow the selected game type.</p>
          </div>
        </div>
        <label className="form-field capacity-field">
          <span>
            <Users size={14} /> Maximum players
            {selectedGameType && (
              <small>
                {minimumSeatCount} to {maximumSeatCount}
              </small>
            )}
          </span>
          <input
            name="capacity"
            type="number"
            min={minimumSeatCount}
            max={maximumSeatCount}
            value={capacity}
            onChange={(changeEvent) => setCapacity(changeEvent.target.value)}
            required
          />
        </label>

        {error && (
          <p className="notice notice-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <Link className="button button-quiet" to="/events">
            Cancel
          </Link>
          <button
            className="button button-primary"
            type="submit"
            disabled={saving || !selectedGameType}
          >
            {saving ? "Creating..." : "Create event"}{" "}
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </form>
    </main>
  );
}

export default CreateEventPage;
