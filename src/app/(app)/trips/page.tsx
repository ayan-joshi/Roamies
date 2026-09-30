import { TripsView } from "@/components/views/trips-view";
import { requireOnboardedUser } from "@/lib/auth";
import { todayIST } from "@/lib/forms";
import type { Trip } from "@/lib/types";
import { deleteTrip } from "./actions";

export default async function TripsPage({ searchParams }: PageProps<"/trips">) {
  const { supabase, userId } = await requireOnboardedUser();
  const today = todayIST();
  const { saved } = await searchParams;

  const { data: trips } = await supabase
    .from("itineraries")
    .select("id, start_date, end_date, budget_bracket, vibe_tag, note, place:places(name, circuit)")
    .eq("user_id", userId)
    .gte("end_date", today)
    .order("start_date");

  return <TripsView basePath="" trips={(trips ?? []) as unknown as Trip[]} today={today} saved={saved === "1"} deleteTrip={deleteTrip} />;
}
