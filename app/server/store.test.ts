import assert from "node:assert/strict";
import test from "node:test";
import { EventStore } from "./store.js";

const eventInput = {
  name: "Small table event",
  gameTypeId: "board-game",
  eventFormat: "Open Play",
  startDate: "2026-11-02",
  startTime: "18:00",
  endTime: "20:00",
  location: "The Wizards Table",
  capacity: 2,
};

test("registration is capped at event capacity on the server store", () => {
  const store = new EventStore();
  const event = store.createEvent(eventInput);

  const firstRegistration = store.register(event.id, "Alex Morgan");
  assert.equal(firstRegistration.ok, true);
  if (firstRegistration.ok) {
    assert.equal(firstRegistration.registration.eventName, event.name);
  }
  assert.equal(store.register(event.id, "Sam Rivera").ok, true);

  const fullResult = store.register(event.id, "Jordan Lee");
  assert.equal(fullResult.ok, false);
  if (!fullResult.ok) {
    assert.equal(fullResult.code, "EVENT_FULL");
    assert.match(fullResult.error, /full/i);
  }
  assert.equal(store.getEvent(event.id)?.currentCapacity, 2);
});

test("registration rejects duplicate names without consuming another place", () => {
  const store = new EventStore();
  const event = store.createEvent(eventInput);

  assert.equal(store.register(event.id, "Alex Morgan").ok, true);
  const duplicate = store.register(event.id, "alex morgan");

  assert.equal(duplicate.ok, false);
  if (!duplicate.ok) assert.equal(duplicate.code, "DUPLICATE");
  assert.equal(store.getEvent(event.id)?.currentCapacity, 1);
  assert.equal(store.register(event.id, "Another Player").ok, true);
  const registrations = store.register(event.id, "Third Player");
  assert.equal(registrations.ok, false);
  assert.equal(store.getEvent(event.id)?.gameType.name, "Board Game");
});

test("template rules validate capacity and event format", () => {
  const store = new EventStore();

  assert.throws(
    () => store.createEvent({ ...eventInput, capacity: 13 }),
    /between 2 and 12/,
  );
  assert.throws(
    () => store.createEvent({ ...eventInput, eventFormat: "Commander" }),
    /valid event format/,
  );
  assert.throws(
    () =>
      store.createEvent({
        ...eventInput,
        gameTypeId: "magic-the-gathering",
        eventFormat: "Commander",
        capacity: 3,
      }),
    /between 4 and 30/,
  );
});

test("player listing keeps names associated with their event", () => {
  const store = new EventStore();
  const firstEvent = store.createEvent(eventInput);
  const secondEvent = store.createEvent({
    ...eventInput,
    name: "Second table event",
  });

  store.register(firstEvent.id, "Alex Morgan");
  store.register(secondEvent.id, "Sam Rivera");

  assert.deepEqual(store.listEventPlayers(firstEvent.id), [
    {
      eventId: firstEvent.id,
      eventName: firstEvent.name,
      playerName: "Alex Morgan",
    },
  ]);
  assert.deepEqual(store.listEventPlayers(secondEvent.id), [
    {
      eventId: secondEvent.id,
      eventName: secondEvent.name,
      playerName: "Sam Rivera",
    },
  ]);
});
