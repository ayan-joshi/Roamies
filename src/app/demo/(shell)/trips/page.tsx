import { TripsView } from "@/components/views/trips-view";
import { demoTrips } from "@/lib/demo/selectors";
import { readDemoState } from "@/lib/demo/state";
import { todayIST } from "@/lib/forms";
import { demoDeleteTrip } from "../../actions";

export default async function DemoTripsPage({ searchParams }: PageProps<"/demo/trips">) {
  const { saved } = await searchParams;
  const trips = demoTrips(await readDemoState());
  return <TripsView basePath="/demo" trips={trips} today={todayIST()} saved={saved === "1"} deleteTrip={demoDeleteTrip} />;
}
