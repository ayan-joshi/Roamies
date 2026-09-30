import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { Tag } from "@/components/ui/chip";
import { Note } from "@/components/ui/note";
import { Notice } from "@/components/ui/notice";
import { formatDay, formatRange, spaced } from "@/lib/format";
import type { Trip } from "@/lib/types";
import { DeleteTripButton } from "./delete-trip-button";
import { EmptyNote } from "./feed-view";

export type TripsViewProps = {
  basePath: string;
  trips: Trip[];
  /** Today in IST as YYYY-MM-DD, for "IN 12 DAYS" / "ON NOW". */
  today: string;
  saved?: boolean;
  deleteTrip: (form: FormData) => Promise<void>;
};

function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

function status(t: Trip, today: string) {
  if (t.start_date <= today) return `ON NOW · UNTIL ${formatDay(t.end_date)}`;
  const d = daysBetween(today, t.start_date);
  return `UPCOMING · ${d === 1 ? "TOMORROW" : `IN ${d} DAYS`}`;
}

// Each trip is the same paper note people see in their feed, so this screen previews your card (Claude Design 07a).
export function TripsView({ basePath, trips, today, saved, deleteTrip }: TripsViewProps) {
  return (
    <main className="flex flex-1 flex-col gap-4 bg-cork px-4 pt-5 pb-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[28px] leading-8 font-extrabold tracking-[-0.01em] text-ink">My trips</h1>
        <Link href={`${basePath}/trips/new`} className={buttonClass("primary", "px-4")}>
          + Add a trip
        </Link>
      </div>

      {saved && <Notice tone="info">Trip saved. It shows up in feeds within a minute.</Notice>}

      {trips.length === 0 ? (
        <EmptyNote line="no trip, no feed. post where you're headed and we'll show who else is." actions={[{ href: `${basePath}/trips/new`, label: "Add a trip" }]} />
      ) : (
        <>
          <p className="font-mono text-[11px] font-bold tracking-[0.06em] text-ink">THIS IS HOW YOUR TRIP LOOKS IN OTHER PEOPLE&apos;S FEEDS</p>
          <ul className="flex flex-col gap-8 pt-2">
            {trips.map((t, i) => (
              <li key={t.id} className="flex flex-col gap-3">
                <Note tone="paper" tilt={i % 2 ? "slight-right" : "slight-left"} fixing={i % 2 ? "pin" : "tape"} className="px-4 pt-6 pb-4">
                  <p className="font-mono text-xs font-semibold tracking-[0.06em] text-ink2">{status(t, today)}</p>
                  <p className="mt-1 text-[40px] leading-[1.05] font-extrabold tracking-[-0.02em]">{t.place.name}</p>
                  {t.place.circuit && <p className="text-sm font-medium text-ink2">{t.place.circuit}</p>}
                  <p className="mt-1 font-mono text-sm font-bold">{formatRange(t.start_date, t.end_date)}</p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <Tag>{spaced(t.budget_bracket)}</Tag>
                    <Tag>{spaced(t.vibe_tag)}</Tag>
                  </div>
                  {t.note && <p className="mt-2.5 font-hand text-lg leading-[1.3]">{t.note}</p>}
                </Note>
                <DeleteTripButton tripId={t.id} place={t.place.name} deleteTrip={deleteTrip} />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
