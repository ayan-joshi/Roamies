import { FeedView } from "@/components/views/feed-view";
import { RADII_KM } from "@/lib/constants";
import { demoFeedFor, demoTrips } from "@/lib/demo/selectors";
import { readDemoState } from "@/lib/demo/state";
import { demoSendIntro, demoSkip } from "../../actions";

export default async function DemoFeedPage({ searchParams }: PageProps<"/demo/feed">) {
  const { radius } = await searchParams;
  const radiusKm = RADII_KM.find((r) => String(r) === radius) ?? 50;
  const state = await readDemoState();
  const { items, answersByUser, introsLeft } = demoFeedFor(state, radiusKm);

  return (
    <FeedView
      basePath="/demo"
      radiusKm={radiusKm}
      items={items}
      answersByUser={answersByUser}
      introsLeft={introsLeft}
      hasUpcomingTrip={demoTrips(state).length > 0}
      actions={{ sendIntro: demoSendIntro, skip: demoSkip }}
    />
  );
}
