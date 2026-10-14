# Event Calendar for Tabletop Game Events

We run organized play for trading card games. A store organizer needs a small web app to schedule in-store game events and let players register for them.

## Event Calendar Requirements

1. **Data Structure**
   - Event
     - Name
     - Game Type - Card Game, Board Game, etc
     - Start Date
     - Start Time
     - Capacity - maximum of 30 players
     - Current Capacity
   - EventRegistrations
     - Player Name
     - Event Name

2. **Pages**
   - Event Creation page - where an organizer can create and schedule events based on Event data structure
   - Calendar View page - displays scheduled events on a calendar so an organizer can see what's happening on a given day. A month grid or a grouped-by-day agenda list are both acceptable. Using a calendar library is fine.
   - Events page
     - Each event gets a registration link, and the event page displays a QR code encoding that link. Scanning it takes a player to a simple registration form (name is enough). Registration must be **capacity-enforced**: once the event is full, further registrations are rejected with a clear message — enforce this on the server, not just in the UI.
     - An event page must offer a downloadable calendar invite (`.ics` file) for that event, with correct title, start/end time, and location, importable into Google Calendar or Outlook.
