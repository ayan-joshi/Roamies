import { notFound } from "next/navigation";
import { ChatRoom } from "@/components/chat/chat-room";
import { RoomView } from "@/components/views/room-view";
import { requireOnboardedUser } from "@/lib/auth";
import { formatRange } from "@/lib/format";
import type { ChatMessage, RoomContext } from "@/lib/types";
import { sendMessage } from "./actions";

type Person = { display_name: string | null; verification_status: string };
type MatchRow = {
  id: number;
  created_at: string;
  user_a: string;
  user_b: string;
  a: Person;
  b: Person;
  interaction: {
    sender_id: string;
    intro_message: string;
    created_at: string;
    itinerary: { start_date: string; end_date: string; place: { name: string } } | null;
    user_prompt: { answer: string; prompt: { text: string } } | null;
  };
};

export default async function MatchRoomPage({ params }: PageProps<"/matches/[id]">) {
  const { supabase, userId } = await requireOnboardedUser();
  const matchId = Number((await params).id);
  if (!Number.isInteger(matchId)) notFound();

  // RLS returns the match only to its two members, so anyone else gets a 404.
  const [{ data: match }, { data: messages }] = await Promise.all([
    supabase
      .from("matches")
      .select(
        `id, created_at, user_a, user_b,
         a:profiles!matches_user_a_fkey(display_name, verification_status),
         b:profiles!matches_user_b_fkey(display_name, verification_status),
         interaction:interactions(sender_id, intro_message, created_at,
           itinerary:itineraries(start_date, end_date, place:places(name)),
           user_prompt:user_prompts(answer, prompt:prompts(text)))`,
      )
      .eq("id", matchId)
      .maybeSingle(),
    supabase.from("messages").select("id, sender_id, body, created_at").eq("match_id", matchId).order("created_at").limit(300),
  ]);
  if (!match) notFound();

  const m = match as unknown as MatchRow;
  const otherId = m.user_a === userId ? m.user_b : m.user_a;
  const other = m.user_a === userId ? m.b : m.a;
  const { count: iBlocked } = await supabase
    .from("blocks")
    .select("blocked_id", { count: "exact", head: true })
    .eq("blocker_id", userId)
    .eq("blocked_id", otherId);
  const otherName = other.display_name ?? "Your match";
  const { interaction } = m;

  const context: RoomContext = interaction.itinerary
    ? {
        label: "TRIP",
        body: `${interaction.itinerary.place.name} · ${formatRange(interaction.itinerary.start_date, interaction.itinerary.end_date)}`,
        handwritten: false,
      }
    : interaction.user_prompt
      ? { label: interaction.user_prompt.prompt.text.toUpperCase(), body: interaction.user_prompt.answer, handwritten: true }
      : { label: "A POST", body: "This was removed.", handwritten: false };

  // The intro that started it all opens the conversation.
  const opener: ChatMessage = {
    id: "intro",
    sender_id: interaction.sender_id,
    body: interaction.intro_message,
    created_at: interaction.created_at,
  };

  return (
    <RoomView backHref="/intros" safetyHref={`/safety/${otherId}?match=${matchId}`} otherName={otherName} verified={other.verification_status === "verified"} matchedOn={m.created_at} context={context}>
      <ChatRoom
        mode="live"
        matchId={matchId}
        myId={userId}
        otherName={otherName}
        initialMessages={[opener, ...((messages ?? []) as ChatMessage[])]}
        send={sendMessage}
        lockedReason={iBlocked ? `You blocked ${otherName}. Messaging is off.` : undefined}
      />
    </RoomView>
  );
}
