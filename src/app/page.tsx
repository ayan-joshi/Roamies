import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Note, type NoteTilt, type NoteTone } from "@/components/ui/note";

const steps: { title: string; body: string; tone: NoteTone; tilt: NoteTilt }[] = [
  { title: "post your trip", body: "kasol, 12 → 18 oct, hostel budget, trekking", tone: "paper", tilt: "slight-left" },
  { title: "reply to one thing", body: "no swiping. pin a note on their trip or an answer", tone: "lime", tilt: "right" },
  { title: "plan, then close the app", body: "split the cab, book the dorm, go", tone: "pink", tilt: "left" },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col gap-4 px-6 pt-8 pb-10">
        <Logo size={32} className="mb-4" />
        <p className="font-mono text-xs font-bold tracking-[0.08em] text-ink2">HILLS · BEACHES · EVERYWHERE IN BETWEEN</p>
        <h1 className="text-[40px] leading-[44px] font-extrabold tracking-[-0.02em]">The anti-swipe travel app.</h1>
        <p className="text-[17px] leading-6 font-medium text-ink2">
          Find someone headed the same way on the same dates. Designed to be closed once you book your trip.
        </p>
      </section>

      <section aria-label="How it works" className="flex flex-1 flex-col gap-8 bg-cork px-6 pt-10 pb-8">
        <ol className="flex flex-col gap-7">
          {steps.map((s, i) => (
            <li key={s.title}>
              <Note tone={s.tone} tilt={s.tilt} fixing={i === 0 ? "tape" : "pin"} className="px-4 pt-5 pb-4">
                <p className="font-mono text-xs font-bold">0{i + 1}</p>
                <p className="mt-1 text-xl leading-[26px] font-bold">{s.title}</p>
                <p className="mt-1 font-hand text-[17px] leading-[22px] font-bold">{s.body}</p>
              </Note>
            </li>
          ))}
        </ol>

        <div className="mt-auto flex flex-col gap-2">
          <Link href="/login" className={buttonClass("primary", "w-full")}>
            Get started
          </Link>
          <Link href="/demo" className={buttonClass("ghost", "w-full bg-paper")}>
            look around first (demo)
          </Link>
          <p className="text-center font-mono text-xs font-medium text-ink">8 SHOTS A DAY · NO LAZY &apos;HI&apos;</p>
          <p className="flex justify-center gap-4 pt-2 text-xs font-semibold text-ink">
            <Link href="/privacy" className="underline underline-offset-2">Privacy</Link>
            <Link href="/terms" className="underline underline-offset-2">Terms and safety</Link>
            <Link href="/feedback" className="underline underline-offset-2">Feedback</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
