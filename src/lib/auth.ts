import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Every page and server action re-checks auth: server actions are plain POST
// endpoints, so the proxy redirect alone is not a security boundary.
export async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");
  return { supabase, userId: data.claims.sub };
}

export async function requireOnboardedUser() {
  const ctx = await requireUser();
  const { data: profile } = await ctx.supabase
    .from("profiles")
    .select("display_name, onboarded_at")
    .eq("id", ctx.userId)
    .single();
  if (!profile?.onboarded_at) redirect("/onboarding");
  return { ...ctx, profile };
}

// Turn Postgres/PostgREST errors from triggers and constraints into user-facing text.
export function friendlyDbError(error: { code?: string; message: string }) {
  if (error.message.includes("Daily limit")) return "You have used all your intros for today. Come back tomorrow.";
  if (error.code === "23505") return "You have already sent this person an intro.";
  if (error.code === "42501") return "You can't contact this person.";
  if (error.code === "22023") return error.message;
  if (error.code === "23514") return "Some of the details are not valid. Please check and try again.";
  return "Something went wrong. Please try again.";
}
