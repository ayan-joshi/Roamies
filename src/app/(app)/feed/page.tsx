import { FeedView } from "@/components/views/feed-view";
import { requireOnboardedUser } from "@/lib/auth";
import { RADII_KM } from "@/lib/constants";
import type { FeedItem, PromptAnswer } from "@/lib/types";
import { sendIntro, skipTraveller } from "./actions";

export default async function FeedPage({ searchParams }: PageProps<"/feed">) {
  const { supabase, userId } = await requireOnboardedUser();
  const { radius } = await searchParams;
  const radiusKm = RADII_KM.find((r) => String(r) === radius) ?? 50;

  const [{ data: feed, error }, { data: introsLeft }, { count: upcomingTrips }] = await Promise.all([
    supabase.rpc("get_feed", { radius_km: radiusKm }),
    supabase.rpc("intros_left_today"),
    supabase
      .from("itineraries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("end_date", new Date().toISOString().slice(0, 10)),
  ]);

  const items = (feed ?? []) as FeedItem[];

  // One query for everyone's prompt answers instead of one per card.
  const userIds = [...new Set(items.map((i) => i.user_id))];
  const { data: answers } = userIds.length
    ? await supabase
        .from("user_prompts")
        .select("id, user_id, answer, prompt:prompts(text)")
        .in("user_id", userIds)
        .order("position")
    : { data: [] };
  const answersByUser: Record<string, PromptAnswer[]> = {};
  for (const a of (answers ?? []) as unknown as PromptAnswer[]) {
    (answersByUser[a.user_id] ??= []).push(a);
  }

  return (
    <FeedView
      basePath=""
      radiusKm={radiusKm}
      items={items}
      answersByUser={answersByUser}
      introsLeft={introsLeft ?? 0}
      hasUpcomingTrip={!!upcomingTrips}
      loadError={!!error}
      actions={{ sendIntro, skip: skipTraveller }}
    />
  );
}
