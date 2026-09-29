import "server-only";
import { cookies } from "next/headers";
import type { Trip } from "@/lib/types";

// What the visitor has done in the demo, kept in their own cookie. No database involved.
export type DemoState = {
  sent: string[]; // user ids you sent an intro to
  skipped: string[]; // user ids you skipped
  responded: Record<string, "accepted" | "declined">; // incoming intro id -> answer
  addedTrips: Trip[];
  deletedTrips: number[];
};

const COOKIE = "roamies_demo";
// A fresh object every time: callers mutate the state they read, and a shared
// module-level default would leak one visitor's actions to everyone on the server.
const empty = (): DemoState => ({ sent: [], skipped: [], responded: {}, addedTrips: [], deletedTrips: [] });

export async function readDemoState(): Promise<DemoState> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return empty();
  try {
    return { ...empty(), ...JSON.parse(raw) };
  } catch {
    return empty();
  }
}

// Only callable from server actions (cookies are read-only while rendering).
export async function writeDemoState(state: DemoState) {
  const capped = { ...state, addedTrips: state.addedTrips.slice(-5) }; // keep the cookie small
  (await cookies()).set(COOKIE, JSON.stringify(capped), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearDemoState() {
  (await cookies()).delete(COOKIE);
}
