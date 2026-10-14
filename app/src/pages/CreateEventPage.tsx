import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, CalendarDays, MapPin, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createEvent } from "../api";
import { useEvents } from "../EventsState";
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const input: EventInput = {
      name: String(form.get("name") ?? "").trim(),
      gameType: String(form.get("gameType") ?? ""),
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
          <select name="gameType" defaultValue="Magic: The Gathering" required>
            <option>Magic: The Gathering</option>
            <option>Pokémon TCG</option>
            <option>Disney Lorcana</option>
            <option>Board Game</option>
            <option>Other tabletop game</option>
          </select>
        </label>

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
            <p>Capacity is enforced when players register.</p>
          </div>
        </div>
        <label className="form-field capacity-field">
          <span>
            <Users size={14} /> Maximum players <small>Up to 30</small>
          </span>
          <input
            name="capacity"
            type="number"
            min={1}
            max={30}
            defaultValue={16}
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
            disabled={saving}
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
