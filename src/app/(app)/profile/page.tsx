import { requireOnboardedUser } from "@/lib/auth";
import type { Prompt } from "@/lib/types";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const { supabase, userId } = await requireOnboardedUser();

  const [{ data: me }, { data: mine }, { data: prompts }] = await Promise.all([
    supabase.from("profiles").select("display_name, home_city").eq("id", userId).single(),
    supabase.from("user_prompts").select("prompt_id, answer").eq("user_id", userId).order("position"),
    supabase.from("prompts").select("id, text, placeholder, category").order("id"),
  ]);

  const answers: Record<number, string> = {};
  for (const row of mine ?? []) answers[row.prompt_id as number] = row.answer as string;

  return (
    <ProfileForm
      name={me?.display_name ?? ""}
      homeCity={me?.home_city ?? ""}
      prompts={(prompts ?? []) as Prompt[]}
      answers={answers}
    />
  );
}
