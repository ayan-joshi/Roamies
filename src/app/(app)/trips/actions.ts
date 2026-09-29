"use server";

import { revalidatePath } from "next/cache";
import { friendlyDbError, requireOnboardedUser } from "@/lib/auth";
import { parseTrip } from "@/lib/forms";
import type { ActionState } from "@/lib/types";

export async function addTrip(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, userId } = await requireOnboardedUser();
  const trip = parseTrip(form);
  if (typeof trip === "string") return { error: trip };
  if (trip.start_date < new Date().toISOString().slice(0, 10)) return { error: "Trips must start today or later." };

  const { error } = await supabase.from("itineraries").insert({ ...trip, user_id: userId });
  if (error) return { error: friendlyDbError(error) };

  revalidatePath("/trips");
  revalidatePath("/feed");
  return { ok: true };
}

export async function deleteTrip(form: FormData) {
  const { supabase, userId } = await requireOnboardedUser();
  const id = Number(form.get("trip_id"));
  if (!Number.isInteger(id)) return;

  await supabase.from("itineraries").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/trips");
  revalidatePath("/feed");
}
