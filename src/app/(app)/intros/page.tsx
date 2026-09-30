import { IntrosView, type MatchSummary, type SentIntro } from "@/components/views/intros-view";
import { requireOnboardedUser } from "@/lib/auth";
import type { IncomingIntro } from "@/lib/types";
import { respondToIntro } from "./actions";

type MyMatch = {
  match_id: number;
  other_name: string | null;
  last_body: string | null;
  last_from_me: boolean | null;
  unread: boolean;
};

type SentRow = {
  id: number;
  intro_message: string;
  target_type: "itinerary" | "prompt";
  receiver: { display_name: string | null };
  itinerary: { place: { name: string } } | null;
  user_prompt: { prompt: { text: string } } | null;
};

export default async function IntrosPage() {
  const { supabase, userId } = await requireOnboardedUser();

  const [{ data: intros }, { data: matches }, { data: sentRows }] = await Promise.all([
    supabase
      .from("interactions")
      .select(
        `id, intro_message, created_at, target_type,
         sender:profiles!interactions_sender_id_fkey(id, display_name, verification_status),
         itinerary:itineraries(start_date, end_date, place:places(name)),
         user_prompt:user_prompts(answer, prompt:prompts(text))`,
      )
      .eq("receiver_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    // Last message + unread flag per match; people you blocked are already left out.
    supabase.rpc("my_matches"),
    supabase
      .from("interactions")
      .select(
        `id, intro_message, target_type,
         receiver:profiles!interactions_receiver_id_fkey(display_name),
         itinerary:itineraries(place:places(name)),
         user_prompt:user_prompts(prompt:prompts(text))`,
      )
      .eq("sender_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  const matchList: MatchSummary[] = ((matches ?? []) as MyMatch[]).map((m) => ({
    id: m.match_id,
    name: m.other_name ?? "A traveller",
    lastBody: m.last_body,
    lastFromMe: !!m.last_from_me,
    unread: m.unread,
  }));

  const sent: SentIntro[] = ((sentRows ?? []) as unknown as SentRow[]).map((s) => ({
    id: s.id,
    name: s.receiver.display_name ?? "A traveller",
    about: s.itinerary ? `their ${s.itinerary.place.name} trip` : s.user_prompt ? s.user_prompt.prompt.text.replace(/\.\.\.$/, "") : "a removed post",
    message: s.intro_message,
  }));

  return (
    <IntrosView
      basePath=""
      pending={(intros ?? []) as unknown as IncomingIntro[]}
      matches={matchList}
      sent={sent}
      respond={respondToIntro}
    />
  );
}
