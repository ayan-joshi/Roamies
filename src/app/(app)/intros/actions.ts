"use server";

import { revalidatePath } from "next/cache";
import { requireOnboardedUser } from "@/lib/auth";
import { notifyMatch } from "@/lib/notify";

export async function respondToIntro(form: FormData) {
  const { supabase, userId, profile } = await requireOnboardedUser();
  const id = Number(form.get("interaction_id"));
  const status = form.get("status");
  if (!Number.isInteger(id) || (status !== "accepted" && status !== "declined")) return;

  // RLS + column grants limit this to the receiver flipping a pending status.
  // Accepting fires the trigger that opens a match.
  const { data: updated } = await supabase
    .from("interactions")
    .update({ status })
    .eq("id", id)
    .eq("receiver_id", userId)
    .select("sender_id")
    .maybeSingle();

  if (updated && status === "accepted") {
    const { data: match } = await supabase.from("matches").select("id").eq("interaction_id", id).maybeSingle();
    if (match) notifyMatch({ senderId: updated.sender_id, accepterName: profile.display_name ?? "A traveller", matchId: match.id });
  }

  revalidatePath("/intros");
}
