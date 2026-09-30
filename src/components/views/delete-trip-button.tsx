"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

// Asks before deleting, inline (no browser dialog). Chats built on the trip are kept.
export function DeleteTripButton({ tripId, place, deleteTrip }: { tripId: number; place: string; deleteTrip: (form: FormData) => Promise<void> }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button type="button" variant="secondary" className="self-end px-4" onClick={() => setConfirming(true)}>
        Delete trip
      </Button>
    );
  }

  return (
    <form action={deleteTrip} className="flex flex-col gap-2 rounded-sheet bg-paper p-3">
      <input type="hidden" name="trip_id" value={tripId} />
      <p className="text-sm font-semibold">Delete your {place} trip? Chats you already started stay.</p>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={() => setConfirming(false)}>
          Keep it
        </Button>
        <Button type="submit" variant="secondary" className="flex-1 border-err text-err">
          Yes, delete
        </Button>
      </div>
    </form>
  );
}
