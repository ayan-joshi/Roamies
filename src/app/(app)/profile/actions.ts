"use server";

import { revalidatePath } from "next/cache";
import { friendlyDbError, requireOnboardedUser } from "@/lib/auth";
import { ANSWER_MAX } from "@/lib/constants";
import { str } from "@/lib/forms";
import type { ActionState } from "@/lib/types";

export async function updateProfile(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireOnboardedUser();

  const displayName = str(form, "display_name");
  if (!displayName || displayName.length > 40) return { error: "Add a name up to 40 characters." };

  const promptIds = form.getAll("prompt_id").map(Number);
  if (promptIds.length !== 2) return { error: "Pick exactly two prompts." };
  const prompts = promptIds.map((id) => ({ prompt_id: id, answer: str(form, `answer_${id}`) }));
  if (prompts.some((p) => !p.answer || p.answer.length > ANSWER_MAX)) {
    return { error: `Answer both prompts (up to ${ANSWER_MAX} characters).` };
  }

  // One transaction; prompts you keep stay the same row, so intros that replied to them keep their context.
  const { error } = await supabase.rpc("update_my_profile", {
    p_display_name: displayName,
    p_home_city: str(form, "home_city"),
    p_prompts: prompts,
  });
  if (error) return { error: friendlyDbError(error) };

  revalidatePath("/", "layout");
  return { ok: true };
}
