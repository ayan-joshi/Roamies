"use client";

import { useActionState } from "react";
import { TripFields } from "@/components/trip-fields";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import type { ActionState, Place } from "@/lib/types";

type Props = { places: Place[]; addTrip: (prev: ActionState, form: FormData) => Promise<ActionState> };

export function AddTripForm({ places, addTrip }: Props) {
  const [state, action, pending] = useActionState(addTrip, null);

  // Plain form action on purpose: React resets it after submit, which clears it for the next trip.
  return (
    <form action={action} className="flex flex-col gap-5">
      <TripFields places={places} idPrefix="add-trip" />
      {state?.error && <Notice tone="error">{state.error}</Notice>}
      {state?.ok && <Notice tone="info">Trip saved. It shows up in feeds within a minute.</Notice>}
      <Button type="submit" loading={pending} loadingLabel="Saving…">
        Add trip
      </Button>
    </form>
  );
}
