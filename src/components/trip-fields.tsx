import { ChipRadioGroup } from "@/components/ui/chip";
import { DateInput, Field, TextInput } from "@/components/ui/field";
import { PlacePicker } from "@/components/ui/place-picker";
import { BUDGETS, VIBES } from "@/lib/constants";
import type { Place } from "@/lib/types";

// Shared by onboarding and "add a trip". Field names are parsed by parseTrip().
export function TripFields({ places, idPrefix = "trip" }: { places: Place[]; idPrefix?: string }) {
  const today = new Date().toISOString().slice(0, 10);
  // Start can be in the past: many travellers add a trip they're already on.
  const id = (name: string) => `${idPrefix}-${name}`;

  return (
    <div className="flex flex-col gap-5">
      <PlacePicker id={id("place")} name="place_id" label="Destination" places={places} required />

      <div className="grid grid-cols-2 gap-3">
        <Field id={id("start")} label="Start date">
          <DateInput id={id("start")} name="start_date" required />
        </Field>
        <Field id={id("end")} label="End date">
          <DateInput id={id("end")} name="end_date" min={today} required />
        </Field>
      </div>

      <ChipRadioGroup name="budget" legend="Budget" options={BUDGETS} required />
      <ChipRadioGroup name="vibe" legend="Vibe" options={VIBES} required />

      <Field id={id("note")} label="Note (optional)" hint="Shows on your trip note. Up to 200 characters.">
        <TextInput id={id("note")} name="note" maxLength={200} placeholder="doing kheerganga + tosh. slow mornings, fast chai." />
      </Field>
    </div>
  );
}
