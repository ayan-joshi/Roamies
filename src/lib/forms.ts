import { BUDGETS, INTRO_MAX, INTRO_MIN, VIBES } from "@/lib/constants";

const str = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

export type TripInput = {
  place_id: number;
  start_date: string;
  end_date: string;
  budget_bracket: string;
  vibe_tag: string;
  note: string | null;
};

// Light validation for friendly errors; the database constraints are the real guard.
export function parseTrip(form: FormData): TripInput | string {
  const place_id = Number(form.get("place_id"));
  const start_date = str(form, "start_date");
  const end_date = str(form, "end_date");
  const budget_bracket = str(form, "budget");
  const vibe_tag = str(form, "vibe");

  if (!Number.isInteger(place_id) || place_id <= 0) return "Choose a destination.";
  if (!start_date || !end_date) return "Add your trip dates.";
  if (end_date < start_date) return "The trip ends before it starts.";
  // Trips may already be under way (people join mid-trip); they just can't be over.
  if (end_date < todayIST()) return "That trip has already ended. Pick dates that end today or later.";
  if (!(BUDGETS as readonly string[]).includes(budget_bracket)) return "Choose a budget.";
  if (!(VIBES as readonly string[]).includes(vibe_tag)) return "Choose a vibe.";

  return { place_id, start_date, end_date, budget_bracket, vibe_tag, note: str(form, "note") || null };
}

/** Today's date in India as YYYY-MM-DD. */
export function todayIST() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

export type IntroInput = {
  receiver_id: string;
  target_type: "itinerary" | "prompt";
  target_id: number;
  intro_message: string;
};

export function parseIntro(form: FormData): IntroInput | string {
  const receiver_id = str(form, "receiver_id");
  const target_type = str(form, "target_type");
  const target_id = Number(form.get("target_id"));
  const intro_message = str(form, "intro_message");

  if (target_type !== "itinerary" && target_type !== "prompt") return "Pick the trip or one answer to reply to.";
  if (!receiver_id || !Number.isInteger(target_id)) return "Something went wrong. Please try again.";
  if (intro_message.length < INTRO_MIN) return `Write at least ${INTRO_MIN} characters.`;
  if (intro_message.length > INTRO_MAX) return `Keep it under ${INTRO_MAX} characters.`;

  return { receiver_id, target_type, target_id, intro_message };
}

export { str };
