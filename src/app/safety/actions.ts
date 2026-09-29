"use server";

import { revalidatePath } from "next/cache";
import { requireOnboardedUser } from "@/lib/auth";
import { REPORT_REASONS } from "@/lib/constants";
import { str } from "@/lib/forms";
import type { ActionState } from "@/lib/types";

export async function reportOrBlock(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, userId } = await requireOnboardedUser();

  const reportedId = str(form, "reported_id");
  const reason = str(form, "reason");
  const details = str(form, "details").slice(0, 500) || null;
  const matchId = Number(form.get("match_id")) || null;
  const block = form.get("block") === "on";

  if (!reportedId || reportedId === userId) return { error: "Something went wrong. Please try again." };
  if (reason && !(REPORT_REASONS as readonly string[]).includes(reason)) return { error: "Pick one of the reasons." };
  if (!reason && !block) return { error: "Pick a reason, or tick block, or both." };

  if (reason) {
    const { error } = await supabase
      .from("reports")
      .insert({ reporter_id: userId, reported_id: reportedId, match_id: matchId, reason, details });
    if (error) return { error: "Couldn't send the report. Check your connection and try again." };
  }

  if (block) {
    const { error } = await supabase
      .from("blocks")
      .upsert({ blocker_id: userId, blocked_id: reportedId }, { ignoreDuplicates: true });
    if (error) return { error: "Couldn't block right now. Check your connection and try again." };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
