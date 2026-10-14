import assert from "node:assert/strict";
import test from "node:test";
import { EventStore } from "./store.js";

const eventInput = {
  name: "Small table event",
  gameType: "Board Game",
  startDate: "2026-11-02",
  startTime: "18:00",
  endTime: "20:00",
  location: "The Wizards Table",
  capacity: 2,
};

test("registration is capped at event capacity on the server store", () => {
  const store = new EventStore();
  const event = store.createEvent(eventInput);

  assert.equal(store.register(event.id, "Alex Morgan").ok, true);
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
});
