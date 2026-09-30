import Link from "next/link";
import type { FeedActions } from "@/components/feed/feed-card";
import { FeedList } from "@/components/feed/feed-list";
import { buttonClass } from "@/components/ui/button";
import { Note } from "@/components/ui/note";
import { RADII_KM } from "@/lib/constants";
import type { FeedItem, PromptAnswer } from "@/lib/types";

export type FeedViewProps = {
  basePath: string;
  radiusKm: number;
  items: FeedItem[];
  answersByUser: Record<string, PromptAnswer[]>;
  introsLeft: number;
  hasUpcomingTrip: boolean;
  /** Filled only when nobody is within the radius: travellers anywhere on overlapping dates. */
  widerItems?: FeedItem[];
  loadError?: boolean;
  actions: FeedActions;
};

// Pure view: the real /feed page and /demo/feed both render this with their own data and actions.
export function FeedView({ basePath, radiusKm, items, answersByUser, introsLeft, hasUpcomingTrip, widerItems = [], loadError, actions }: FeedViewProps) {
  return (
    <main className="flex flex-1 flex-col gap-4 bg-cork px-4 pt-4 pb-8">
      <nav aria-label="Distance" className="flex items-center gap-2">
        <span className="font-mono text-xs font-bold tracking-wider text-ink">WITHIN</span>
        {RADII_KM.map((r) => (
          <Link
            key={r}
            href={`${basePath}/feed?radius=${r}`}
            aria-current={r === radiusKm ? "true" : undefined}
            className={`flex h-11 items-center rounded-full px-3.5 font-mono text-xs font-bold ${
              r === radiusKm ? "bg-btn-bg text-btn-fg" : "bg-paper text-ink"
            }`}
          >
            {r} KM
          </Link>
        ))}
      </nav>

      {loadError && (
        <Note tone="paper" className="p-4">
          Couldn&apos;t load the feed. Pull to refresh or try again in a minute.
        </Note>
      )}

      {!hasUpcomingTrip ? (
        <EmptyNote
          line="no trip, no feed. post where you're headed and we'll show who else is."
          actions={[{ href: `${basePath}/trips/new`, label: "Add a trip" }]}
        />
      ) : items.length === 0 && widerItems.length > 0 ? (
        <>
          <div className="flex flex-col gap-1 rounded-sheet bg-paper px-4 py-3">
            <p className="font-mono text-[11px] font-bold tracking-[0.06em] text-ink2">NOBODY WITHIN {radiusKm} KM</p>
            <p className="text-[15px] leading-snug">These travellers are further away but on your dates. Plans change, say hi anyway.</p>
          </div>
          <FeedList basePath={basePath} items={widerItems} answersByUser={answersByUser} initialLeft={introsLeft} actions={actions} emphasizeDistance />
        </>
      ) : items.length === 0 ? (
        <EmptyNote
          line="no one's heading your way yet. widen the radius or touch grass"
          actions={[
            ...(radiusKm < 100 ? [{ href: `${basePath}/feed?radius=100`, label: "Try 100 km" }] : []),
            { href: `${basePath}/trips`, label: "Edit my trip dates", secondary: radiusKm < 100 },
          ]}
        />
      ) : (
        <FeedList basePath={basePath} items={items} answersByUser={answersByUser} initialLeft={introsLeft} actions={actions} />
      )}
    </main>
  );
}

type EmptyAction = { href: string; label: string; secondary?: boolean };

// The note carries only the handwritten line; buttons sit flat below it (controls never tilt).
export function EmptyNote({ line, actions = [] }: { line: string; actions?: EmptyAction[] }) {
  return (
    <div className="mt-6 flex flex-col gap-4">
      <Note tone="paper" tilt="slight-left" fixing="tape" className="px-5 pt-7 pb-5">
        <p className="font-hand text-[22px] leading-7 font-bold">{line}</p>
      </Note>
      {actions.map((a) => (
        <Link key={a.href} href={a.href} className={buttonClass(a.secondary ? "secondary" : "primary", "w-full")}>
          {a.label}
        </Link>
      ))}
    </div>
  );
}
