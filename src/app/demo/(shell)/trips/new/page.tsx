import { AddTripView } from "@/components/views/add-trip-view";
import { DEMO_PLACES } from "@/lib/demo/data";
import { demoAddTrip } from "../../../actions";

export default function DemoNewTripPage() {
  return <AddTripView basePath="/demo" places={DEMO_PLACES} addTrip={demoAddTrip} />;
}
