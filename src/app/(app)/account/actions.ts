"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { str } from "@/lib/forms";
import type { ActionState } from "@/lib/types";

export async function deleteAccount(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireUser();
  if (str(form, "confirm") !== "DELETE") return { error: "Type DELETE in capitals to confirm." };

  // Deletes the auth user; profile, trips, prompts, intros, matches and messages cascade.
  const { error } = await supabase.rpc("delete_my_account");
  if (error) return { error: "Couldn't delete your account. Please try again." };

  await supabase.auth.signOut();
  redirect("/?deleted=1");
}

export async function setEmailAlerts(form: FormData) {
  const { supabase, userId } = await requireUser();
  await supabase.from("profiles").update({ email_alerts: form.get("on") === "true" }).eq("id", userId);
  revalidatePath("/account");
}
