import { AddTripView } from "@/components/views/add-trip-view";
import { requireOnboardedUser } from "@/lib/auth";
import type { Place } from "@/lib/types";
import { addTrip } from "../actions";

export default async function NewTripPage() {
  const { supabase } = await requireOnboardedUser();
  const { data: places } = await supabase.from("places").select("id, name, circuit, kind").order("circuit").order("name");
  return <AddTripView basePath="" places={(places ?? []) as Place[]} addTrip={addTrip} />;
}
