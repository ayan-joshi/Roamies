"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DAILY_INTROS, MESSAGE_MAX } from "@/lib/constants";
import { DEMO_PLACES } from "@/lib/demo/data";
import { clearDemoState, readDemoState, writeDemoState } from "@/lib/demo/state";
import { parseIntro, parseTrip, str } from "@/lib/forms";
import type { ActionState, ChatMessage } from "@/lib/types";

// Same validation and responses as the real actions, but state lives in the visitor's cookie.

export async function demoSendIntro(_prev: ActionState, form: FormData): Promise<ActionState> {
  const intro = parseIntro(form);
  if (typeof intro === "string") return { error: intro };

  const state = await readDemoState();
  if (state.sent.length >= DAILY_INTROS) return { error: "You have used all your intros for today. Come back tomorrow." };
  if (state.sent.includes(intro.receiver_id)) return { error: "You have already sent this person an intro." };

  state.sent.push(intro.receiver_id);
  await writeDemoState(state);
  return { ok: true, left: DAILY_INTROS - state.sent.length };
}

export async function demoSkip(form: FormData) {
  const userId = str(form, "user_id");
  if (!userId) return;
  const state = await readDemoState();
  if (!state.skipped.includes(userId)) state.skipped.push(userId);
  await writeDemoState(state);
  revalidatePath("/demo/feed");
}

export async function demoRespond(form: FormData) {
  const id = str(form, "interaction_id");
  const status = form.get("status");
  if (!id || (status !== "accepted" && status !== "declined")) return;
  const state = await readDemoState();
  state.responded[id] = status;
  await writeDemoState(state);
  revalidatePath("/demo", "layout");
  if (status === "accepted") redirect(`/demo/matches/${id}?new=1`);
}

export async function demoAddTrip(_prev: ActionState, form: FormData): Promise<ActionState> {
  const trip = parseTrip(form);
  if (typeof trip === "string") return { error: trip };
  const place = DEMO_PLACES.find((p) => p.id === trip.place_id);
  if (!place) return { error: "Choose a destination." };

  const state = await readDemoState();
  state.addedTrips.push({
    id: Date.now(),
    start_date: trip.start_date,
    end_date: trip.end_date,
    budget_bracket: trip.budget_bracket,
    vibe_tag: trip.vibe_tag,
    note: trip.note,
    place: { name: place.name },
  });
  await writeDemoState(state);
  revalidatePath("/demo", "layout");
  return { ok: true };
}

export async function demoDeleteTrip(form: FormData) {
  const id = Number(form.get("trip_id"));
  if (!Number.isFinite(id)) return;
  const state = await readDemoState();
  state.addedTrips = state.addedTrips.filter((t) => t.id !== id);
  if (!state.deletedTrips.includes(id)) state.deletedTrips.push(id);
  await writeDemoState(state);
  revalidatePath("/demo", "layout");
}

// Chat in the demo is not stored: the room keeps messages in the page until you leave.
export async function demoSendMessage(_matchId: number, body: string): Promise<{ message?: ChatMessage; error?: string }> {
  const text = body.trim();
  if (!text) return { error: "Write something first." };
  if (text.length > MESSAGE_MAX) return { error: `Keep it under ${MESSAGE_MAX} characters.` };
  return { message: { id: `demo-${Date.now()}`, sender_id: "me", body: text, created_at: new Date().toISOString() } };
}

export async function demoCompleteOnboarding(): Promise<ActionState> {
  redirect("/demo/feed");
}

export async function demoReset() {
  await clearDemoState();
  redirect("/demo/feed");
}

// Demo safety form: validates like the real one, stores nothing.
export async function demoReportOrBlock(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!str(form, "reason") && form.get("block") !== "on") return { error: "Pick a reason, or tick block, or both." };
  return { ok: true };
}
