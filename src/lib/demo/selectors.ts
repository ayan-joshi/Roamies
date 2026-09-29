import "server-only";
import { DAILY_INTROS } from "@/lib/constants";
import { DEMO_EXISTING_MATCHES, demoBaseTrips, demoFeed, demoIncoming } from "./data";
import type { DemoState } from "./state";

// Derive what each demo screen shows from the sample data plus the visitor's actions.

export function demoTrips(state: DemoState) {
  return [...demoBaseTrips(), ...state.addedTrips].filter((t) => !state.deletedTrips.includes(t.id));
}

export function demoFeedFor(state: DemoState, radiusKm: number) {
  const { items, answersByUser } = demoFeed();
  return {
    // Like the real feed: skipped people and people you already wrote to drop out on the next load.
    items: items.filter(
      (i) => i.distance_km <= radiusKm && !state.skipped.includes(i.user_id) && !state.sent.includes(i.user_id),
    ),
    answersByUser,
    introsLeft: Math.max(DAILY_INTROS - state.sent.length, 0),
  };
}

export function demoIntrosFor(state: DemoState) {
  const incoming = demoIncoming();
  return {
    pending: incoming.filter((i) => !state.responded[String(i.id)]),
    matches: [
      ...incoming
        .filter((i) => state.responded[String(i.id)] === "accepted")
        .map((i) => ({ id: i.id, name: i.sender.display_name ?? "A traveller" })),
      ...DEMO_EXISTING_MATCHES,
    ],
  };
}
