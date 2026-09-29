// Hand-written row shapes. Replace with `supabase gen types typescript` once the project is linked.

export type ActionState = { error?: string; ok?: boolean; left?: number } | null;

// circuit = region/state label, e.g. "Himachal", "Rajasthan", "Kerala"
export type Place = { id: number; name: string; circuit: string };
export type Prompt = { id: number; text: string; placeholder: string; category: string };

export type FeedItem = {
  itinerary_id: number;
  user_id: string;
  display_name: string | null;
  age: number | null;
  gender: string | null;
  home_city: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  place_name: string;
  circuit: string;
  start_date: string;
  end_date: string;
  budget_bracket: string;
  vibe_tag: string;
  note: string | null;
  distance_km: number;
  my_place_name: string;
  overlap_days: number;
};

export type PromptAnswer = { id: number; user_id: string; answer: string; prompt: { text: string } };

export type Trip = {
  id: number;
  start_date: string;
  end_date: string;
  budget_bracket: string;
  vibe_tag: string;
  note: string | null;
  place: { name: string };
};

export type IncomingIntro = {
  id: number;
  intro_message: string;
  created_at: string;
  target_type: "itinerary" | "prompt";
  sender: { id: string; display_name: string | null; verification_status: string };
  itinerary: { start_date: string; end_date: string; place: { name: string } } | null;
  user_prompt: { answer: string; prompt: { text: string } } | null;
};

export type ChatMessage = { id: number | string; sender_id: string; body: string; created_at: string };

/** What the match started from, pinned at the top of the planning room. */
export type RoomContext = { label: string; body: string; handwritten: boolean };
