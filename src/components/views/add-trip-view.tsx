"use client";

import Link from "next/link";
import { startTransition, useActionState } from "react";
import { TripFields } from "@/components/trip-fields";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import type { ActionState, Place } from "@/lib/types";

type Props = {
  basePath: string;
  places: Place[];
  addTrip: (prev: ActionState, form: FormData) => Promise<ActionState>;
};

// Add a trip on its own page (Claude Design 07b). On success the action redirects back to My trips.
export function AddTripView({ basePath, places, addTrip }: Props) {
  const [state, action, pending] = useActionState(addTrip, null);

  // Manual submit so a server-side error doesn't clear what you filled in.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  }

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 pt-2 pb-8">
      <Link href={`${basePath}/trips`} className="-ml-2 flex min-h-12 w-fit items-center rounded-full px-3 font-semibold text-ink2 hover:bg-paper2">
        ← My trips
      </Link>
      <h1 className="text-[28px] leading-8 font-extrabold tracking-[-0.01em]">Add a trip</h1>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <TripFields places={places} idPrefix="add-trip" />
        {state?.error && <Notice tone="error">{state.error}</Notice>}
        <Button type="submit" loading={pending} loadingLabel="Saving…">
          Add trip
        </Button>
      </form>
    </main>
  );
}
