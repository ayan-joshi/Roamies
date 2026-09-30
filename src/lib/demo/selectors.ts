import "server-only";
import { DAILY_INTROS } from "@/lib/constants";
import { DEMO_EXISTING_MATCHES, demoBaseTrips, demoFeed, demoIncoming, demoPersonName, demoRoom } from "./data";
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
  const withPreview = (id: number, name: string) => {
    const room = demoRoom(id);
    const last = room?.history.at(-1);
    return { id, name, lastBody: last?.body ?? null, lastFromMe: !!last?.fromMe, unread: !!last && !last.fromMe };
  };
  return {
    pending: incoming.filter((i) => !state.responded[String(i.id)]),
    matches: [
      ...incoming
        .filter((i) => state.responded[String(i.id)] === "accepted")
        .map((i) => withPreview(i.id, i.sender.display_name ?? "A traveller")),
      ...DEMO_EXISTING_MATCHES.map((m) => withPreview(m.id, m.name)),
    ],
    sent: state.sent.map((userId, i) => ({ id: i + 1, name: demoPersonName(userId), about: `On ${demoPersonName(userId)}'s trip or answer`, message: "Your intro is waiting for a reply." })),
  };
}
