import type { Metadata } from "next";
import { LegalPage } from "@/components/views/legal-page";

export const metadata: Metadata = { title: "Privacy · Roamies" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="2 OCT 2026">
      <p>
        Roamies is a small independent project that helps travellers find company for trips across India. This page explains what we collect, why, and what you can do about it.
      </p>

      <section className="flex flex-col gap-2">
        <h2>What we collect</h2>
        <ul>
          <li>From Google sign-in: your name, email address and profile photo.</li>
          <li>What you enter: date of birth, gender, home city, your two prompt answers, and your trips (place, dates, budget, vibe, note).</li>
          <li>What you do: intros you send and receive, matches, chat messages, skips, blocks and reports.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2>Who sees what</h2>
        <ul>
          <li>Other signed-in travellers whose trips are near yours see your first name, age, gender, home city, trips and prompt answers.</li>
          <li>Your date of birth and email are never shown to anyone. Only your age is.</li>
          <li>An intro is seen only by the person you sent it to. Chat messages are seen only by the two people in that match.</li>
          <li>Reports are seen only by the Roamies team. The person you report is not told.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2>Why we use it</h2>
        <p>
          Only to run Roamies: showing you travellers heading your way, delivering intros and messages, emailing you when
          someone replies, and keeping the community safe. We don&apos;t sell your data or show ads.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2>Services we rely on</h2>
        <ul>
          <li>Supabase: stores the database and handles sign-in.</li>
          <li>Vercel: hosts the website.</li>
          <li>Google: sign-in.</li>
          <li>Resend: sends notification emails.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2>Deleting your data</h2>
        <p>
          Go to Account → Delete my account. This permanently removes your profile, trips, prompts, intros, matches and
          messages. Reports you were involved in are kept for safety, with your identity removed.
        </p>
      </section>
    </LegalPage>
  );
}
