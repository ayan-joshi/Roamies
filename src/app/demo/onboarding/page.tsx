import Link from "next/link";
import { OnboardingForm } from "@/app/onboarding/onboarding-form";
import { DEMO_PLACES, DEMO_PROMPTS } from "@/lib/demo/data";
import { demoCompleteOnboarding } from "../actions";

export default function DemoOnboardingPage() {
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 pt-6 pb-8">
      <div className="flex items-center justify-between">
        <p className="text-xl font-extrabold tracking-[-0.02em]">roamies</p>
        <Link href="/demo/feed" className="flex min-h-12 items-center rounded-full px-3 text-sm font-semibold text-ink2 hover:bg-paper2">
          Skip to feed
        </Link>
      </div>
      <OnboardingForm
        defaultName=""
        prompts={DEMO_PROMPTS}
        places={DEMO_PLACES}
        maxBirthDate={eighteenYearsAgo.toISOString().slice(0, 10)}
        complete={demoCompleteOnboarding}
      />
    </main>
  );
}
