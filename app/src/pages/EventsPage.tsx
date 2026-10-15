import { ArrowUpRight, Clock3, MapPin, Plus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useEvents } from "../EventsState";

function EventsPage() {
  const { events, loading, error } = useEvents();

  return (
    <main className="page events-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR EVENT LINEUP</span>
          <h1>Every seat, accounted for.</h1>
          <p>
            Browse scheduled events and open the details to share registration.
          </p>
        </div>
        <Link className="button button-primary" to="/events/new">
          <Plus size={17} /> Create event
        </Link>
      </div>

      {error && (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <div className="page-loading">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <span className="empty-mark">
            <Clock3 size={20} />
          </span>
          <h2>No events scheduled yet.</h2>
          <p>Your next game night can start here.</p>
          <Link className="button button-primary" to="/events/new">
            <Plus size={16} /> Create the first event
          </Link>
        </div>
      ) : (
        <div className="events-list">
          {events.map((event) => {
            const date = new Date(`${event.startDate}T00:00:00`);
            const full = event.currentCapacity >= event.capacity;
            return (
              <article className="event-list-row" key={event.id}>
                <div className="event-date-block">
                  <span>
                    {date
                      .toLocaleDateString("en-US", { month: "short" })
                      .toUpperCase()}
                  </span>
                  <strong>{date.getDate()}</strong>
                  <small>
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </small>
                </div>
                <div className="event-list-main">
                  <span className="game-kicker">
                    {event.gameType.name} / {event.eventFormat}
                  </span>
                  <h2>
                    <Link to={`/events/${event.id}`}>{event.name}</Link>
                  </h2>
                  <div className="event-list-meta">
                    <span>
                      <Clock3 size={14} /> {event.startTime} to {event.endTime}
                    </span>
                    <span>
                      <MapPin size={14} /> {event.location}
                    </span>
                  </div>
                </div>
                <div className="event-list-capacity">
                  <span className={full ? "availability full" : "availability"}>
                    {full ? "Full" : "Open"}
                  </span>
                  <span>
                    <Users size={14} /> {event.currentCapacity} /{" "}
                    {event.capacity}
                  </span>
                </div>
                <Link
                  className="row-open"
                  to={`/events/${event.id}`}
                  aria-label={`Open ${event.name}`}
                >
                  <ArrowUpRight size={18} />
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default EventsPage;
