"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { controlClass } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { MESSAGE_MAX } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/lib/types";

type SendFn = (matchId: number, body: string) => Promise<{ message?: ChatMessage; error?: string }>;

type Props = {
  matchId: number;
  myId: string;
  otherName: string;
  initialMessages: ChatMessage[];
  send: SendFn;
  /** "live" subscribes to Supabase Realtime. "demo" fakes the other person's replies. */
  mode: "live" | "demo";
  demoReplies?: string[];
  /** Set when messaging is off (e.g. you blocked this person). Replaces the composer. */
  lockedReason?: string;
};

const time = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });

export function ChatRoom({ matchId, myId, otherName, initialMessages, send, mode, demoReplies = [], lockedReason }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const replyIndex = useRef(0);

  // Add a message once, whether it arrives from our own send or from the realtime echo.
  function add(message: ChatMessage) {
    setMessages((cur) => (cur.some((m) => String(m.id) === String(message.id)) ? cur : [...cur, message]));
  }

  // Live: new rows in this match arrive over Supabase Realtime (RLS limits them to the two members).
  useEffect(() => {
    if (mode !== "live") return;
    const supabase = createClient();
    const channel = supabase
      .channel(`match-${matchId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
        (payload) => add(payload.new as ChatMessage),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [mode, matchId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, typing]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    const result = await send(matchId, body);
    setSending(false);
    if (result.error || !result.message) {
      setError(result.error ?? "Couldn't send your message. Check your connection and try again.");
      return;
    }
    add(result.message);
    setDraft("");

    if (mode === "demo" && demoReplies.length) {
      const reply = demoReplies[replyIndex.current % demoReplies.length];
      replyIndex.current += 1;
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        add({ id: `demo-reply-${Date.now()}`, sender_id: "other", body: reply, created_at: new Date().toISOString() });
      }, 1400);
    }
  }

  return (
    <>
      <ol className="flex flex-1 flex-col gap-2 px-4 pt-4 pb-6" aria-live="polite" aria-label={`Messages with ${otherName}`}>
        {messages.map((m, i) => {
          const mine = m.sender_id === myId;
          const prev = messages[i - 1];
          const grouped = prev && prev.sender_id === m.sender_id;
          const next = messages[i + 1];
          const lastOfRun = !next || next.sender_id !== m.sender_id;
          return (
            <li key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"} ${grouped ? "" : "mt-2"}`}>
              <p
                className={`max-w-[80%] px-3.5 py-2.5 text-[15px] leading-[1.45] whitespace-pre-wrap break-words ${
                  mine
                    ? "rounded-[18px] rounded-br-[4px] bg-btn-bg text-btn-fg"
                    : "rounded-[18px] rounded-bl-[4px] border-[1.5px] border-line bg-paper"
                }`}
              >
                <span className="sr-only">{mine ? "You: " : `${otherName}: `}</span>
                {m.body}
              </p>
              {lastOfRun && (
                <time dateTime={m.created_at} className="mt-1 px-1 font-mono text-[11px] font-medium text-ink2">
                  {time.format(new Date(m.created_at))}
                </time>
              )}
            </li>
          );
        })}
        {typing && (
          <li className="mt-2 font-mono text-xs font-medium text-ink2" aria-label={`${otherName} is typing`}>
            {otherName.toLowerCase()} is typing…
          </li>
        )}
        <div ref={endRef} />
      </ol>

      {lockedReason ? (
        <p className="sticky bottom-0 border-t-[1.5px] border-line bg-bg px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] text-center text-sm font-semibold text-ink2">
          {lockedReason}
        </p>
      ) : (
      <form onSubmit={onSubmit} className="sticky bottom-0 flex flex-col gap-2 border-t-[1.5px] border-line bg-bg px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        {error && <Notice tone="error">{error}</Notice>}
        <div className="flex items-end gap-2">
          <label htmlFor="message" className="sr-only">
            Message {otherName}
          </label>
          <textarea
            id="message"
            rows={1}
            value={draft}
            maxLength={MESSAGE_MAX}
            placeholder="dates, budget, who books the bus…"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            className={controlClass(false, "max-h-32 min-h-12 flex-1 resize-none px-3.5 py-3 leading-[1.4] [field-sizing:content]")}
          />
          <Button type="submit" disabled={!draft.trim()} loading={sending} loadingLabel="Sending" className="px-5">
            Send
          </Button>
        </div>
      </form>
      )}
    </>
  );
}
