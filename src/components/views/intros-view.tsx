import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Note } from "@/components/ui/note";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { formatRange } from "@/lib/format";
import type { IncomingIntro } from "@/lib/types";

export type IntrosViewProps = {
  basePath: string;
  pending: IncomingIntro[];
  matches: { id: number; name: string }[];
  respond: (form: FormData) => Promise<void>;
};

export function IntrosView({ basePath, pending, matches, respond }: IntrosViewProps) {
  return (
    <main className="flex flex-1 flex-col gap-8 bg-cork px-4 pt-5 pb-8">
      <section aria-labelledby="pending-heading" className="flex flex-col gap-4">
        <h1 id="pending-heading" className="text-[28px] leading-8 font-extrabold tracking-[-0.01em] text-ink">
          Intros for you
        </h1>

        {pending.length === 0 && (
          <Note tone="paper" tilt="slight-left" fixing="tape" className="px-5 pt-7 pb-5">
            <p className="font-hand text-[22px] leading-7 font-bold">nothing pinned to your board yet. good trips take a minute.</p>
          </Note>
        )}

        <ol className="flex flex-col gap-10">
          {pending.map((intro, i) => {
            const sender = intro.sender.display_name ?? "A traveller";
            const context = intro.itinerary
              ? { label: "YOUR TRIP", body: `${intro.itinerary.place.name} · ${formatRange(intro.itinerary.start_date, intro.itinerary.end_date)}`, hand: false }
              : intro.user_prompt
                ? { label: intro.user_prompt.prompt.text.toUpperCase(), body: intro.user_prompt.answer, hand: true }
                : { label: "YOUR POST", body: "This was removed.", hand: false };

            return (
              <li key={intro.id} className="flex flex-col">
                {/* What they replied to */}
                <Note tone={i % 2 ? "pink" : "lime"} tilt={i % 2 ? "left" : "right"} className="mr-10 px-3.5 pt-3.5 pb-8">
                  <p className="font-mono text-[11px] font-bold tracking-[0.04em]">{context.label}</p>
                  <p className={context.hand ? "mt-1.5 font-hand text-[17px] leading-[1.25] font-bold" : "mt-1.5 font-mono text-sm font-bold"}>
                    {context.body}
                  </p>
                </Note>

                {/* Their note, pinned on top */}
                <Note tone="paper" fixing="ink-pin" pinned className="-mt-5 ml-8 flex flex-col gap-3 px-4 pt-[18px] pb-4">
                  <p className="flex flex-wrap items-center gap-1.5 text-lg font-extrabold">
                    {sender}
                    <VerifiedBadge verified={intro.sender.verification_status === "verified"} showUnverified />
                  </p>
                  <p className="text-[15px] leading-[1.45]">{intro.intro_message}</p>
                  <form action={respond} className="flex gap-2">
                    <input type="hidden" name="interaction_id" value={intro.id} />
                    <Button name="status" value="declined" variant="ghost" className="bg-paper2">
                      not my vibe
                    </Button>
                    <Button name="status" value="accepted" className="flex-1">
                      Plan a trip together
                    </Button>
                  </form>
                  <Link
                    href={`${basePath}/safety/${intro.sender.id}`}
                    className="-mb-1 flex min-h-11 items-center justify-center rounded-full text-sm font-semibold text-ink2 hover:bg-paper2"
                  >
                    Report or block {sender}
                  </Link>
                </Note>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="matches-heading" className="flex flex-col gap-3">
        <h2 id="matches-heading" className="text-xl leading-[26px] font-bold text-ink">
          Matches
        </h2>
        {matches.length === 0 ? (
          <p className="rounded-sheet bg-paper px-4 py-3.5 text-ink2">When you accept an intro, it shows up here. Tap a match to plan the trip together.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {matches.map((m) => (
              <li key={m.id}>
                <Link
                  href={`${basePath}/matches/${m.id}`}
                  className="flex min-h-14 items-center justify-between gap-3 rounded-sheet bg-paper px-4 hover:bg-paper2"
                >
                  <span className="font-bold">{m.name}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-hand text-[17px] font-bold">it&apos;s a trip</span>
                    <span aria-hidden className="text-lg">→</span>
                    <span className="sr-only">Open planning room</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
