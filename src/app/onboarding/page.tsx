import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import type { Place, Prompt } from "@/lib/types";
import { completeOnboarding } from "./actions";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const { supabase, userId } = await requireUser();

  const [{ data: profile }, { data: prompts }, { data: places }] = await Promise.all([
    supabase.from("profiles").select("display_name, onboarded_at").eq("id", userId).single(),
    supabase.from("prompts").select("id, text, placeholder, category").order("id"),
    supabase.from("places").select("id, name, circuit").order("circuit").order("name"),
  ]);

  if (profile?.onboarded_at) redirect("/feed");

  // Latest birth date that is 18+ today; computed on the server so the client render stays pure.
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 pt-6 pb-8">
      <p className="text-xl font-extrabold tracking-[-0.02em]">roamies</p>
      <OnboardingForm
        defaultName={profile?.display_name ?? ""}
        prompts={(prompts ?? []) as Prompt[]}
        places={(places ?? []) as Place[]}
        maxBirthDate={eighteenYearsAgo.toISOString().slice(0, 10)}
        complete={completeOnboarding}
      />
    </main>
  );
}
