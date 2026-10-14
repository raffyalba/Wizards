import {
  BrowserRouter,
  Link,
  NavLink,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { CalendarDays, ClipboardList, Dice5, Plus } from "lucide-react";
import { EventsProvider } from "./EventsProvider";
import CalendarPage from "./pages/CalendarPage";
import CreateEventPage from "./pages/CreateEventPage";
import EventDetailPage from "./pages/EventDetailPage";
import EventsPage from "./pages/EventsPage";
import RegistrationPage from "./pages/RegistrationPage";
import "./App.css";

function AppLayout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/" aria-label="The Wizards Table home">
          <span className="brand-mark">
            <Dice5 size={21} strokeWidth={1.8} />
          </span>
          <span className="brand-copy">
            <strong>The Wizards Table</strong>
            <small>EVENT DESK</small>
          </span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }: { isActive: boolean }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <CalendarDays size={16} /> Calendar
          </NavLink>
          <NavLink
            to="/events"
            className={({ isActive }: { isActive: boolean }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <ClipboardList size={16} /> Events
          </NavLink>
        </nav>
        <Link className="button button-primary header-create" to="/events/new">
          <Plus size={17} /> <span>New event</span>
        </Link>
      </header>
      <div className="route-content">
        <Outlet />
      </div>
      <footer className="app-footer">
        <span>THE WIZARDS TABLE</span>
        <span>Good games start with a seat.</span>
      </footer>
    </div>
  );
}

function NotFoundPage() {
  return (
    <main className="page narrow-page">
      <span className="eyebrow">404 / TABLE NOT FOUND</span>
      <h1>That seat is empty.</h1>
      <Link className="text-link" to="/">
        Return to the calendar
      </Link>
    </main>
  );
}

function App() {
  return (
    <EventsProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<CalendarPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/new" element={<CreateEventPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/register/:id" element={<RegistrationPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </EventsProvider>
  );
}

export default App;
