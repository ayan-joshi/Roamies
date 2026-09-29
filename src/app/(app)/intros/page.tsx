import { IntrosView } from "@/components/views/intros-view";
import { requireOnboardedUser } from "@/lib/auth";
import type { IncomingIntro } from "@/lib/types";
import { respondToIntro } from "./actions";

type MatchRow = {
  id: number;
  user_a: string;
  user_b: string;
  a: { display_name: string | null };
  b: { display_name: string | null };
};

export default async function IntrosPage() {
  const { supabase, userId } = await requireOnboardedUser();

  const [{ data: intros }, { data: matches }, { data: blocks }] = await Promise.all([
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
    supabase
      .from("matches")
      .select(
        `id, user_a, user_b,
         a:profiles!matches_user_a_fkey(display_name),
         b:profiles!matches_user_b_fkey(display_name)`,
      )
      .order("created_at", { ascending: false }),
    supabase.from("blocks").select("blocked_id").eq("blocker_id", userId),
  ]);
  const blocked = new Set((blocks ?? []).map((b) => b.blocked_id as string));

  // Hide matches with people you blocked.
  const matchRows = ((matches ?? []) as unknown as MatchRow[]).filter((m) => !blocked.has(m.user_a === userId ? m.user_b : m.user_a));

  return (
    <IntrosView
      basePath=""
      pending={(intros ?? []) as unknown as IncomingIntro[]}
      matches={matchRows.map((m) => ({
        id: m.id,
        name: (m.user_a === userId ? m.b : m.a).display_name ?? "A traveller",
      }))}
      respond={respondToIntro}
    />
  );
}
