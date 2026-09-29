"use server";

import { requireOnboardedUser } from "@/lib/auth";
import { MESSAGE_MAX } from "@/lib/constants";
import { notifyMessage } from "@/lib/notify";
import type { ChatMessage } from "@/lib/types";

export async function sendMessage(matchId: number, body: string): Promise<{ message?: ChatMessage; error?: string }> {
  const { supabase, userId, profile } = await requireOnboardedUser();
  const text = body.trim();
  if (!text) return { error: "Write something first." };
  if (text.length > MESSAGE_MAX) return { error: `Keep it under ${MESSAGE_MAX} characters.` };

  // RLS only lets the two members of the match post here.
  const { data, error } = await supabase
    .from("messages")
    .insert({ match_id: matchId, sender_id: userId, body: text })
    .select("id, sender_id, body, created_at")
    .single();

  // 42501 = RLS refused the insert: one of you blocked the other.
  if (error?.code === "42501") return { error: `You can't message this person anymore.` };
  if (error || !data) return { error: "Couldn't send your message. Check your connection and try again." };

  // Email only for the first message of a burst: nothing from me in this match in the last 2 hours.
  const since = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const [{ count: recentFromMe }, { data: match }] = await Promise.all([
    supabase.from("messages").select("id", { count: "exact", head: true }).eq("match_id", matchId).eq("sender_id", userId).gte("created_at", since),
    supabase.from("matches").select("user_a, user_b").eq("id", matchId).maybeSingle(),
  ]);
  if (match && recentFromMe === 1) {
    notifyMessage({
      recipientId: match.user_a === userId ? match.user_b : match.user_a,
      senderName: profile.display_name ?? "Your match",
      matchId,
    });
  }

  return { message: data as ChatMessage };
}
