import { ChipRadioGroup } from "@/components/ui/chip";
import { DateRangeFields } from "@/components/date-range-fields";
import { Field, TextInput } from "@/components/ui/field";
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

      <DateRangeFields idPrefix={idPrefix} today={today} />

      <ChipRadioGroup name="budget" legend="Budget" options={BUDGETS} required />
      <ChipRadioGroup name="vibe" legend="Vibe" options={VIBES} required />

      <Field id={id("note")} label="Note (optional)" hint="Shows on your trip note. Up to 200 characters.">
        <TextInput id={id("note")} name="note" maxLength={200} placeholder="doing kheerganga + tosh. slow mornings, fast chai." />
      </Field>
    </div>
  );
}
