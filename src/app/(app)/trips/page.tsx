import { TripsView } from "@/components/views/trips-view";
import { requireOnboardedUser } from "@/lib/auth";
import type { Place, Trip } from "@/lib/types";
import { addTrip, deleteTrip } from "./actions";

export default async function TripsPage() {
  const { supabase, userId } = await requireOnboardedUser();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: trips }, { data: places }] = await Promise.all([
    supabase
      .from("itineraries")
      .select("id, start_date, end_date, budget_bracket, vibe_tag, note, place:places(name)")
      .eq("user_id", userId)
      .gte("end_date", today)
      .order("start_date"),
    supabase.from("places").select("id, name, circuit, kind").order("circuit").order("name"),
  ]);

  return (
    <TripsView
      trips={(trips ?? []) as unknown as Trip[]}
      places={(places ?? []) as Place[]}
      addTrip={addTrip}
      deleteTrip={deleteTrip}
    />
  );
}
