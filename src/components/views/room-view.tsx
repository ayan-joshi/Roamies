import Link from "next/link";
import type { ReactNode } from "react";
import { MatchMoment } from "@/components/ui/match-moment";
import { Note } from "@/components/ui/note";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import type { RoomContext } from "@/lib/types";

type Props = {
  backHref: string;
  otherName: string;
  verified: boolean;
  matchedOn: string;
  context: RoomContext;
  safetyHref: string;
  justMatched?: boolean;
  banner?: ReactNode;
  children: ReactNode;
};

const day = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

// The planning room: what you matched over stays pinned at the top, the chat runs below.
export function RoomView({ backHref, otherName, verified, matchedOn, context, safetyHref, justMatched, banner, children }: Props) {
  return (
    <main className="flex min-h-dvh flex-1 flex-col">
      {justMatched && <MatchMoment name={otherName} />}
      {banner}
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b-[1.5px] border-line bg-bg px-2 py-1.5">
        <Link href={backHref} aria-label="Back to intros and matches" className="flex size-12 items-center justify-center rounded-full text-xl hover:bg-paper2">
          ←
        </Link>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xl leading-[26px] font-bold">
            <span className="truncate">{otherName}</span>
            <VerifiedBadge verified={verified} />
          </p>
          <p className="font-mono text-[11px] font-bold tracking-[0.06em] text-ink2">
            IT&apos;S A TRIP · MATCHED {day.format(new Date(matchedOn)).toUpperCase()}
          </p>
        </div>
        <Link href={safetyHref} className="flex min-h-12 items-center rounded-full px-3 text-sm font-semibold text-ink2 hover:bg-paper2">
          Report
        </Link>
      </header>

      <div className="bg-cork px-4 pt-6 pb-5">
        <Note tone="lime" fixing="pin" pinned className="px-4 pt-4 pb-3.5">
          <p className="font-mono text-[11px] font-bold tracking-[0.04em]">YOU MATCHED OVER · {context.label}</p>
          <p className={context.handwritten ? "mt-1.5 font-hand text-[17px] leading-[1.25] font-bold" : "mt-1.5 font-mono text-sm font-bold"}>
            {context.body}
          </p>
        </Note>
      </div>

      {children}
    </main>
  );
}
