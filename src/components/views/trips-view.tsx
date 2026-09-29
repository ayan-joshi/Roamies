import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/chip";
import { formatRange, spaced } from "@/lib/format";
import type { ActionState, Place, Trip } from "@/lib/types";
import { AddTripForm } from "./add-trip-form";

export type TripsViewProps = {
  trips: Trip[];
  places: Place[];
  addTrip: (prev: ActionState, form: FormData) => Promise<ActionState>;
  deleteTrip: (form: FormData) => Promise<void>;
};

export function TripsView({ trips, places, addTrip, deleteTrip }: TripsViewProps) {
  return (
    <main className="flex flex-1 flex-col gap-8 px-4 pt-5 pb-8">
      <section aria-labelledby="trips-heading" className="flex flex-col gap-3">
        <h1 id="trips-heading" className="text-[28px] leading-8 font-extrabold tracking-[-0.01em]">
          My trips
        </h1>
        {trips.length === 0 && <p className="text-ink2">No upcoming trips. Add one below to show up in feeds.</p>}
        <ul className="flex flex-col gap-3">
          {trips.map((t) => (
            <li key={t.id} className="flex flex-col gap-2.5 rounded-sheet border-[1.5px] border-line bg-paper p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xl leading-[26px] font-bold">{t.place.name}</p>
                  <p className="font-mono text-xs font-bold tracking-[0.04em]">{formatRange(t.start_date, t.end_date)}</p>
                </div>
                <form action={deleteTrip}>
                  <input type="hidden" name="trip_id" value={t.id} />
                  <Button variant="ghost" className="px-3 text-sm" aria-label={`Delete trip to ${t.place.name}`}>
                    Delete
                  </Button>
                </form>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Tag>{spaced(t.budget_bracket)}</Tag>
                <Tag>{spaced(t.vibe_tag)}</Tag>
              </div>
              {t.note && <p className="text-ink2">{t.note}</p>}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="add-heading" className="flex flex-col gap-4 rounded-sheet bg-paper p-4">
        <h2 id="add-heading" className="text-xl leading-[26px] font-bold">
          Add a trip
        </h2>
        <AddTripForm places={places} addTrip={addTrip} />
      </section>
    </main>
  );
}
