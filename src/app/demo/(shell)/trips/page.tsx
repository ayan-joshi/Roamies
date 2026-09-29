import { TripsView } from "@/components/views/trips-view";
import { DEMO_PLACES } from "@/lib/demo/data";
import { demoTrips } from "@/lib/demo/selectors";
import { readDemoState } from "@/lib/demo/state";
import { demoAddTrip, demoDeleteTrip } from "../../actions";

export default async function DemoTripsPage() {
  const trips = demoTrips(await readDemoState());
  return <TripsView trips={trips} places={DEMO_PLACES} addTrip={demoAddTrip} deleteTrip={demoDeleteTrip} />;
}
