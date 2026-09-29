"use server";

import { revalidatePath } from "next/cache";
import { friendlyDbError, requireOnboardedUser } from "@/lib/auth";
import { parseIntro, str } from "@/lib/forms";
import { notifyNewIntro } from "@/lib/notify";
import type { ActionState } from "@/lib/types";

export async function sendIntro(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, userId, profile } = await requireOnboardedUser();

  const intro = parseIntro(form);
  if (typeof intro === "string") return { error: intro };

  // The database checks that the target belongs to the receiver and enforces the daily cap.
  const { error } = await supabase.from("interactions").insert({
    sender_id: userId,
    receiver_id: intro.receiver_id,
    target_type: intro.target_type,
    itinerary_id: intro.target_type === "itinerary" ? intro.target_id : null,
    user_prompt_id: intro.target_type === "prompt" ? intro.target_id : null,
    intro_message: intro.intro_message,
  });
  if (error) return { error: friendlyDbError(error) };

  let about = "prompt answer";
  if (intro.target_type === "itinerary") {
    const { data: trip } = await supabase.from("itineraries").select("place:places(name)").eq("id", intro.target_id).maybeSingle();
    const place = (trip as unknown as { place: { name: string } } | null)?.place.name;
    about = place ? `${place} trip` : "trip";
  }
  notifyNewIntro({ receiverId: intro.receiver_id, senderName: profile.display_name ?? "A traveller", about, message: intro.intro_message });

  // No revalidatePath here: the card stays on screen in its "sent" state.
  // The feed drops this traveller on the next load because get_feed excludes existing pairs.
  const { data: left } = await supabase.rpc("intros_left_today");
  return { ok: true, left: left ?? 0 };
}

export async function skipTraveller(form: FormData) {
  const { supabase, userId } = await requireOnboardedUser();
  const skippedId = str(form, "user_id");
  if (!skippedId) return;

  await supabase.from("skips").upsert({ user_id: userId, skipped_user_id: skippedId }, { ignoreDuplicates: true });
  revalidatePath("/feed");
}
