import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Plus,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEvents } from "../EventsState";
import type { EventRecord } from "../types";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(
  value: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", options);
}

function eventsOnDay(events: EventRecord[], day: Date): EventRecord[] {
  return events.filter((event) => event.startDate === dateKey(day));
}

function CalendarPage() {
  const { events, loading, error } = useEvents();
  const today = dateKey(new Date());
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDayState, setSelectedDayState] = useState(today);
  const [hasNavigatedMonth, setHasNavigatedMonth] = useState(false);
  const [hasSelectedDay, setHasSelectedDay] = useState(false);
  const firstUpcomingEvent =
    events.find((event) => event.startDate >= today) ?? events[0];
  const selectedDay =
    !loading && !hasSelectedDay && firstUpcomingEvent
      ? firstUpcomingEvent.startDate
      : selectedDayState;
  const visibleMonth =
    !loading && !hasNavigatedMonth && firstUpcomingEvent
      ? new Date(`${firstUpcomingEvent.startDate}T00:00:00`)
      : month;
  const monthStart = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
    1,
  );
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - ((monthStart.getDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
  const dayEvents = events.filter((event) => event.startDate === selectedDay);
  const selectedDate = new Date(`${selectedDay}T00:00:00`);

  function moveMonth(offset: number) {
    setMonth(
      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1),
    );
    setHasNavigatedMonth(true);
  }

  function selectToday() {
    const now = new Date();
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setHasNavigatedMonth(true);
    setSelectedDayState(dateKey(now));
    setHasSelectedDay(true);
  }

  return (
    <main className="page calendar-page">
      <div className="page-heading calendar-heading">
        <div>
          <span className="eyebrow">THE EVENT CALENDAR</span>
          <h1>Make room for game night.</h1>
          <p>See what is on the table and find your next match.</p>
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
      <div className="calendar-layout">
        <section className="calendar-panel" aria-label="Monthly event calendar">
          <div className="calendar-toolbar">
            <div className="month-controls">
              <button
                className="icon-button"
                type="button"
                onClick={() => moveMonth(-1)}
                aria-label="Previous month"
              >
                <ChevronLeft size={19} />
              </button>
              <button
                className="icon-button"
                type="button"
                onClick={() => moveMonth(1)}
                aria-label="Next month"
              >
                <ChevronRight size={19} />
              </button>
              <h2>
                {visibleMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
            </div>
            <button
              className="button button-quiet today-button"
              type="button"
              onClick={selectToday}
            >
              Today
            </button>
          </div>

          <div className="calendar-grid calendar-weekdays" aria-hidden="true">
            {weekdays.map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>
          <div className="calendar-grid calendar-days">
            {days.map((day) => {
              const key = dateKey(day);
              const dayItems = eventsOnDay(events, day);
              const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
              const classes = [
                "calendar-day",
                isCurrentMonth ? "" : "outside-month",
                key === selectedDay ? "selected-day" : "",
                key === today ? "today" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <div className={classes} key={key}>
                  <button
                    className="day-number"
                    type="button"
                    onClick={() => {
                      setSelectedDayState(key);
                      setHasSelectedDay(true);
                      setMonth(new Date(day.getFullYear(), day.getMonth(), 1));
                      setHasNavigatedMonth(true);
                    }}
                    aria-label={formatDate(key, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  >
                    {day.getDate()}
                  </button>
                  <div className="cell-events">
                    {dayItems.slice(0, 2).map((event) => (
                      <Link
                        className="calendar-event"
                        key={event.id}
                        to={`/events/${event.id}`}
                        title={event.name}
                      >
                        <span className="event-marker" />
                        <span>{event.name}</span>
                      </Link>
                    ))}
                    {dayItems.length > 2 && (
                      <span className="more-events">
                        +{dayItems.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {loading && (
            <div className="calendar-loading" aria-live="polite">
              Loading events...
            </div>
          )}
        </section>

        <aside className="day-agenda">
          <div className="agenda-date">
            <span className="eyebrow">SELECTED DAY</span>
            <strong>
              {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
            </strong>
            <span>
              {selectedDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="agenda-title-row">
            <h2>On the table</h2>
            <span className="count-badge">{dayEvents.length}</span>
          </div>
          {dayEvents.length === 0 ? (
            <div className="empty-agenda">
              <span className="empty-mark">
                <Clock3 size={19} />
              </span>
              <p>No events on this day.</p>
              <Link to="/events/new">
                Schedule one <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          ) : (
            <div className="agenda-events">
              {dayEvents.map((event) => (
                <Link
                  className="agenda-event"
                  key={event.id}
                  to={`/events/${event.id}`}
                >
                  <span className="game-kicker">
                    {event.gameType.name} / {event.eventFormat}
                  </span>
                  <strong>{event.name}</strong>
                  <span className="agenda-meta">
                    <Clock3 size={14} /> {event.startTime} to {event.endTime}
                  </span>
                  <span className="agenda-meta">
                    <MapPin size={14} /> {event.location}
                  </span>
                  <span className="agenda-capacity">
                    <Users size={14} /> {event.currentCapacity} /{" "}
                    {event.capacity} players
                  </span>
                </Link>
              ))}
            </div>
          )}
          <Link className="agenda-all-link" to="/events">
            Browse all events <span aria-hidden="true">&rarr;</span>
          </Link>
        </aside>
      </div>
    </main>
  );
}

export default CalendarPage;
