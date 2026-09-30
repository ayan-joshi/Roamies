"use server";

import { str } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

const KINDS = ["bug", "idea", "love"] as const;

export async function sendFeedback(_prev: ActionState, form: FormData): Promise<ActionState> {
  const kind = str(form, "kind");
  const message = str(form, "message");
  const page = str(form, "page").slice(0, 200) || null;

  if (!(KINDS as readonly string[]).includes(kind)) return { error: "Pick bug, idea or love it." };
  if (!message) return { error: "Write a line or two first." };
  if (message.length > 1000) return { error: "Keep it under 1000 characters." };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return { error: "Feedback isn't connected on this copy of the app yet." };
  }

  // Works signed in or out (demo visitors). RLS only allows your own user id or none.
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const { error } = await supabase
    .from("feedback")
    .insert({ user_id: data?.claims?.sub ?? null, kind, message, page });

  if (error) return { error: "Couldn't send that. Check your connection and try again." };
  return { ok: true };
}
