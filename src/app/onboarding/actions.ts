"use server";

import { redirect } from "next/navigation";
import { friendlyDbError, requireUser } from "@/lib/auth";
import { ANSWER_MAX, GENDERS } from "@/lib/constants";
import { parseTrip, str } from "@/lib/forms";
import type { ActionState } from "@/lib/types";

export async function completeOnboarding(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireUser();

  const displayName = str(form, "display_name");
  const birthDate = str(form, "birth_date");
  const gender = str(form, "gender");
  if (!displayName || displayName.length > 40) return { error: "Add a name up to 40 characters." };
  if (!birthDate) return { error: "Add your date of birth." };
  if (!(GENDERS as readonly string[]).includes(gender)) return { error: "Choose a gender." };

  const promptIds = form.getAll("prompt_id").map(Number);
  if (promptIds.length !== 2) return { error: "Pick exactly two prompts." };
  const prompts = promptIds.map((id) => ({ prompt_id: id, answer: str(form, `answer_${id}`) }));
  if (prompts.some((p) => !p.answer || p.answer.length > ANSWER_MAX)) {
    return { error: `Answer both prompts (up to ${ANSWER_MAX} characters).` };
  }

  const trip = parseTrip(form);
  if (typeof trip === "string") return { error: trip };

  const { error } = await supabase.rpc("complete_onboarding", {
    p_display_name: displayName,
    p_birth_date: birthDate,
    p_gender: gender,
    p_home_city: str(form, "home_city"),
    p_prompts: prompts,
    p_place_id: trip.place_id,
    p_start_date: trip.start_date,
    p_end_date: trip.end_date,
    p_budget: trip.budget_bracket,
    p_vibe: trip.vibe_tag,
    p_note: trip.note,
  });

  if (error) {
    if (error.message.includes("birth_date")) return { error: "You need to be 18 or older to use Roamies." };
    return { error: friendlyDbError(error) };
  }

  redirect("/feed");
}
