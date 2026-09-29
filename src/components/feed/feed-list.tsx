"use client";

import { useState } from "react";
import { DAILY_INTROS } from "@/lib/constants";
import type { FeedItem, PromptAnswer } from "@/lib/types";
import { FeedCard, type FeedActions } from "./feed-card";

type Props = {
  basePath: string;
  items: FeedItem[];
  answersByUser: Record<string, PromptAnswer[]>;
  initialLeft: number;
  actions: FeedActions;
};

// Owns the "shots left" counter so it updates the moment an intro is pinned.
export function FeedList({ basePath, items, answersByUser, initialLeft, actions }: Props) {
  const [left, setLeft] = useState(initialLeft);
  // Hide skipped cards immediately instead of waiting for the server refresh.
  const [skipped, setSkipped] = useState<string[]>([]);
  // Keep a card in place from the moment you press "Pin it". The server drops people you wrote to,
  // and a refresh that lands with the action result (e.g. a cookie update) would otherwise unmount
  // the card before it can show its "sent" note.
  const [pinned, setPinned] = useState<{ item: FeedItem; index: number }[]>([]);

  const visible = items.filter((i) => !skipped.includes(i.user_id));
  for (const { item, index } of pinned) {
    if (!visible.some((i) => i.itinerary_id === item.itinerary_id)) visible.splice(Math.min(index, visible.length), 0, item);
  }

  function keepInPlace(item: FeedItem, index: number) {
    setPinned((cur) => (cur.some((p) => p.item.itinerary_id === item.itinerary_id) ? cur : [...cur, { item, index }]));
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-btn-bg px-3 py-[7px] text-sm font-bold text-btn-fg">
          <span className="font-mono">{left}</span> shots left today
        </span>
        <span className="font-hand text-[17px] font-bold text-ink">{left > 0 ? "no lazy 'hi' pls" : "back tomorrow"}</span>
      </div>

      <ol className="flex flex-col gap-10 pt-2">
        {visible.map((item, index) => (
          <li key={item.itinerary_id}>
            <FeedCard
              item={item}
              answers={answersByUser[item.user_id] ?? []}
              left={left}
              shotNumber={DAILY_INTROS - left + 1}
              actions={actions}
              reportHref={`${basePath}/safety/${item.user_id}`}
              onSending={() => keepInPlace(item, index)}
              onSent={setLeft}
              onSkipped={(id) => setSkipped((cur) => [...cur, id])}
            />
          </li>
        ))}
      </ol>
    </>
  );
}
