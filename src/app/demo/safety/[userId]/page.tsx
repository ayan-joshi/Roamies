import { SafetyView } from "@/components/views/safety-view";
import { demoPersonName } from "@/lib/demo/data";
import { demoReportOrBlock } from "../../actions";

export default async function DemoSafetyPage({ params, searchParams }: PageProps<"/demo/safety/[userId]">) {
  const { userId } = await params;
  const { match } = await searchParams;
  const matchId = Number(match) || undefined;

  return (
    <SafetyView
      demo
      personId={userId}
      personName={demoPersonName(userId)}
      matchId={matchId}
      backHref={matchId ? `/demo/matches/${matchId}` : "/demo/intros"}
      doneHref="/demo/feed"
      submit={demoReportOrBlock}
    />
  );
}
