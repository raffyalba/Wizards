import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  Download,
  Eye,
  EyeOff,
  MapPin,
  QrCode,
  Users,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Link, useParams } from "react-router-dom";
import { listEventPlayers } from "../api";
import { useEvents } from "../EventsState";
import type { EventPlayer } from "../types";

function EventDetailPage() {
  const { id } = useParams();
  const { events, loading, error } = useEvents();
  const [copied, setCopied] = useState(false);
  const [showPlayerNames, setShowPlayerNames] = useState(false);
  const [playerRoster, setPlayerRoster] = useState<{
    eventId: string;
    players: EventPlayer[];
  } | null>(null);
  const [playerNamesLoading, setPlayerNamesLoading] = useState(false);
  const [playerNamesError, setPlayerNamesError] = useState("");
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
  const currentEventId = event.id;
  const isRosterVisible =
    showPlayerNames && playerRoster?.eventId === currentEventId;
  const eventPlayers =
    playerRoster?.eventId === currentEventId ? playerRoster.players : [];

  async function togglePlayerNames() {
    if (isRosterVisible) {
      setShowPlayerNames(false);
      return;
    }
    if (playerRoster?.eventId === currentEventId) {
      setShowPlayerNames(true);
      return;
    }

    setPlayerNamesLoading(true);
    setPlayerNamesError("");
    try {
      const players = await listEventPlayers(currentEventId);
      setPlayerRoster({ eventId: currentEventId, players });
      setShowPlayerNames(true);
    } catch (caught) {
      setPlayerNamesError(
        caught instanceof Error
          ? caught.message
          : "Could not load player names.",
      );
    } finally {
      setPlayerNamesLoading(false);
    }
  }

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
          <span className="game-kicker">{event.gameType.name}</span>
          <h1>{event.name}</h1>
          <p className="detail-format">
            {event.gameType.format} / {event.eventFormat}
          </p>
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
            <div>
              <Users size={17} />
              <span>
                <small>MINIMUM TO START</small>
                {event.gameType.minimumPlayersToStart} players
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
          <section
            className="detail-player-roster"
            aria-label="Registered players"
          >
            <button
              className="button button-quiet"
              type="button"
              onClick={togglePlayerNames}
              disabled={playerNamesLoading}
              aria-expanded={isRosterVisible}
              aria-controls={
                isRosterVisible ? `registered-players-${event.id}` : undefined
              }
            >
              {isRosterVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              {playerNamesLoading
                ? "Loading players..."
                : isRosterVisible
                  ? "Hide player names"
                  : "Show player names"}
            </button>
            {playerNamesError && (
              <p className="notice notice-error" role="alert">
                {playerNamesError}
              </p>
            )}
            {isRosterVisible && (
              <div
                className="detail-player-list"
                id={`registered-players-${event.id}`}
              >
                {eventPlayers.length === 0 ? (
                  <span className="no-players">No registrations yet</span>
                ) : (
                  <ul>
                    {eventPlayers.map((player) => (
                      <li key={`${player.eventId}-${player.playerName}`}>
                        {player.playerName}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
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
