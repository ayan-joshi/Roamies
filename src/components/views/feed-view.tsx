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
          action={{ href: `${basePath}/trips`, label: "Add a trip" }}
        />
      ) : items.length === 0 && widerItems.length > 0 ? (
        <>
          <p className="rounded-sheet bg-paper px-4 py-3 text-[15px] leading-snug">
            <strong>Nobody within {radiusKm} km yet.</strong> These travellers are further away but on your dates. Plans change, say hi anyway.
          </p>
          <FeedList basePath={basePath} items={widerItems} answersByUser={answersByUser} initialLeft={introsLeft} actions={actions} />
        </>
      ) : items.length === 0 ? (
        <EmptyNote
          line="no one's heading your way yet. widen the radius or touch grass"
          action={radiusKm < 100 ? { href: `${basePath}/feed?radius=100`, label: "Try 100 km" } : undefined}
        />
      ) : (
        <FeedList basePath={basePath} items={items} answersByUser={answersByUser} initialLeft={introsLeft} actions={actions} />
      )}
    </main>
  );
}

export function EmptyNote({ line, action }: { line: string; action?: { href: string; label: string } }) {
  return (
    <Note tone="paper" tilt="slight-left" fixing="tape" className="mt-6 flex flex-col gap-4 px-5 pt-7 pb-5">
      <p className="font-hand text-[22px] leading-7 font-bold">{line}</p>
      {action && (
        <Link href={action.href} className={buttonClass("primary", "w-full")}>
          {action.label}
        </Link>
      )}
    </Note>
  );
}
