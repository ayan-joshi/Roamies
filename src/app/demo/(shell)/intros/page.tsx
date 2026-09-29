import { IntrosView } from "@/components/views/intros-view";
import { demoIntrosFor } from "@/lib/demo/selectors";
import { readDemoState } from "@/lib/demo/state";
import { demoRespond } from "../../actions";

export default async function DemoIntrosPage() {
  const { pending, matches } = demoIntrosFor(await readDemoState());
  return <IntrosView basePath="/demo" pending={pending} matches={matches} respond={demoRespond} />;
}
