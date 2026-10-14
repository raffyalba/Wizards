import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  Download,
  MapPin,
  QrCode,
  Users,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Link, useParams } from "react-router-dom";
import { useEvents } from "../EventsState";

function EventDetailPage() {
  const { id } = useParams();
  const { events, loading, error } = useEvents();
  const [copied, setCopied] = useState(false);
  const event = events.find((item) => item.id === id);

  if (loading)
    return <main className="page page-loading">Opening event...</main>;
  if (error)
    return (
      <main className="page">
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      </main>
    );
  if (!event) {
    return (
      <main className="page narrow-page">
        <span className="eyebrow">EVENT NOT FOUND</span>
        <h1>This event has left the table.</h1>
        <Link className="text-link" to="/events">
          Browse events
        </Link>
      </main>
    );
  }

  const registrationUrl = `${window.location.origin}/register/${event.id}`;
  const percentage = Math.min(
    100,
    (event.currentCapacity / event.capacity) * 100,
  );
  const full = event.currentCapacity >= event.capacity;
  const date = new Date(`${event.startDate}T00:00:00`);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(registrationUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="page detail-page">
      <Link className="back-link" to="/events">
        <ArrowLeft size={15} /> All events
      </Link>
      <section className="detail-hero">
        <div className="detail-copy">
          <span className="game-kicker">{event.gameType}</span>
          <h1>{event.name}</h1>
          <div className="detail-meta-grid">
            <div>
              <CalendarDays size={17} />
              <span>
                <small>DATE</small>
                {date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div>
              <Clock3 size={17} />
              <span>
                <small>TIME</small>
                {event.startTime} to {event.endTime}
              </span>
            </div>
            <div>
              <MapPin size={17} />
              <span>
                <small>LOCATION</small>
                {event.location}
              </span>
            </div>
            <div>
              <Users size={17} />
              <span>
                <small>PLAYERS</small>
                {event.currentCapacity} registered / {event.capacity} max
              </span>
            </div>
          </div>
          <div
            className="capacity-track"
            aria-label={`${event.currentCapacity} of ${event.capacity} players registered`}
          >
            <span
              className={full ? "capacity-fill is-full" : "capacity-fill"}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="capacity-caption">
            <span>
              {full
                ? "This event is full"
                : `${event.capacity - event.currentCapacity} seats available`}
            </span>
            <span>
              {event.currentCapacity} / {event.capacity}
            </span>
          </div>
          <div className="detail-actions">
            <a
              className="button button-outline"
              href={`/api/events/${event.id}/invite`}
            >
              <Download size={16} /> Calendar invite
            </a>
            <Link
              className="button button-primary"
              to={`/register/${event.id}`}
            >
              Register a player <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
        <aside className="qr-panel">
          <div className="qr-heading">
            <span className="qr-icon">
              <QrCode size={17} />
            </span>
            <div>
              <strong>Registration link</strong>
              <small>Scan to save a seat</small>
            </div>
          </div>
          <div className="qr-code-wrap">
            <QRCodeSVG
              value={registrationUrl}
              size={176}
              level="M"
              includeMargin
            />
          </div>
          <div className="share-link-row">
            <span>{registrationUrl}</span>
            <button
              className="icon-button copy-button"
              type="button"
              onClick={copyLink}
              aria-label={copied ? "Link copied" : "Copy registration link"}
              title={copied ? "Copied" : "Copy link"}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <Link className="qr-open-link" to={`/register/${event.id}`}>
            Open registration page <span aria-hidden="true">&rarr;</span>
          </Link>
        </aside>
      </section>
    </main>
  );
}

export default EventDetailPage;
