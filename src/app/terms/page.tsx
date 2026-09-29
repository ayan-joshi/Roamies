import type { Metadata } from "next";
import { LegalPage } from "@/components/views/legal-page";

export const metadata: Metadata = { title: "Terms and safety · Roamies" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms and safety" updated="2 OCT 2026">
      <p>By using Roamies you agree to these terms. They are short on purpose.</p>

      <section className="flex flex-col gap-2">
        <h2>Who can use Roamies</h2>
        <ul>
          <li>You must be 18 or older.</li>
          <li>Use your real first name and your real trips.</li>
          <li>One account per person.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2>Not allowed</h2>
        <ul>
          <li>Harassment, threats, hate, or sexual messages nobody asked for.</li>
          <li>Asking for money, selling anything, or promoting a business, tour or hostel.</li>
          <li>Fake profiles or pretending to be someone else.</li>
          <li>Sharing someone else&apos;s messages or personal details without their consent.</li>
        </ul>
        <p>We may remove content or accounts that break these rules, without notice.</p>
      </section>

      <section className="flex flex-col gap-2">
        <h2>Meeting people safely</h2>
        <ul>
          <li>Roamies does not verify anyone&apos;s identity. Treat every profile as unverified.</li>
          <li>Meet first in a busy public place, like a cafe or hostel common area, in daylight.</li>
          <li>Tell a friend where you&apos;re going and who you&apos;re meeting.</li>
          <li>Don&apos;t send money or ID documents to someone you met here.</li>
          <li>If something feels off, leave. Then use Report or block in the app.</li>
          <li>In an emergency in India, call 112. Women&apos;s helpline: 1091.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2>No guarantees</h2>
        <p>
          Roamies is an early, free project provided as it is. We are not responsible for what other travellers say or do,
          online or on a trip. Plans, bookings and meetups are between you and the people you meet.
        </p>
      </section>
    </LegalPage>
  );
}
