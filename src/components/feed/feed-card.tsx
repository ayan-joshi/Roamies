"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/chip";
import { Note, RadioMarker, type NoteTilt, type NoteTone } from "@/components/ui/note";
import { Notice } from "@/components/ui/notice";
import { TextareaWithCount } from "@/components/ui/textarea-count";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { DAILY_INTROS, INTRO_MAX, INTRO_MIN } from "@/lib/constants";
import { formatRange, genderInitial, spaced } from "@/lib/format";
import type { ActionState, FeedItem, PromptAnswer } from "@/lib/types";

type Target = { type: "itinerary" | "prompt"; id: number; label: string };

export type FeedActions = {
  sendIntro: (prev: ActionState, form: FormData) => Promise<ActionState>;
  skip: (form: FormData) => Promise<void>;
};

type Props = {
  item: FeedItem;
  answers: PromptAnswer[];
  left: number;
  shotNumber: number;
  actions: FeedActions;
  reportHref: string;
  onSending: () => void;
  onSent: (left: number) => void;
  onSkipped: (userId: string) => void;
  /** Bold the distance (used in the "further away" feed, where distance is the news). */
  emphasizeDistance?: boolean;
};

// Prompt notes alternate lime/pink with opposite tilts, like the design.
const PROMPT_LOOKS: { tone: NoteTone; tilt: NoteTilt; tick: string }[] = [
  { tone: "lime", tilt: "right", tick: "text-lime" },
  { tone: "pink", tilt: "left", tick: "text-pink" },
];

// Direction 1c "Hostel noticeboard": three states, default / item selected + composer / intro sent.
export function FeedCard({ item, answers, left, shotNumber, actions, reportHref, onSending, onSent, onSkipped, emphasizeDistance }: Props) {
  const name = item.display_name ?? "This traveller";
  const [target, setTarget] = useState<Target | null>(null);
  const [draft, setDraft] = useState("");
  const [state, action, pending] = useActionState(actions.sendIntro, null);

  const sent = !!state?.ok;

  // Report each successful send exactly once, even if the parent re-renders with a new callback.
  const reported = useRef<ActionState>(null);
  useEffect(() => {
    if (state?.ok && typeof state.left === "number" && reported.current !== state) {
      reported.current = state;
      onSent(state.left);
    }
  }, [state, onSent]);

  function select(t: Target) {
    if (!sent) setTarget((cur) => (cur?.type === t.type && cur.id === t.id ? null : t));
  }

  // Manual submit so React does not clear the draft when the server returns an error.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    onSending();
    startTransition(() => action(data));
  }

  const isSelected = (type: Target["type"], id: number) => target?.type === type && target.id === id;
  const tripTarget: Target = { type: "itinerary", id: item.itinerary_id, label: `${name}'s trip` };
  const who = [genderInitial(item.gender), item.home_city && `from ${item.home_city}`].filter(Boolean).join(" · ");

  return (
    <article aria-label={`${name}, going to ${item.place_name}`} className="flex flex-col gap-3.5">
      {/* Trip note */}
      <button
        type="button"
        onClick={() => select(tripTarget)}
        aria-pressed={isSelected("itinerary", item.itinerary_id)}
        aria-label={`Reply to ${name}'s trip to ${item.place_name}`}
        disabled={sent}
        className="block w-full rounded-note text-left disabled:cursor-default"
      >
        <Note
          tone="paper"
          tilt="slight-left"
          fixing="tape"
          pinned={isSelected("itinerary", item.itinerary_id)}
          className="px-4 pt-[22px] pb-4"
        >
          <div className="flex items-center gap-2.5">
            <Avatar name={name} url={item.avatar_url} />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-1.5 text-lg font-extrabold">
                {name}
                {item.age ? `, ${item.age}` : ""}
                <VerifiedBadge verified={item.is_verified} />
              </p>
              {who && <p className="text-[13px] text-ink2">{who}</p>}
            </div>
            {!sent && <RadioMarker checked={isSelected("itinerary", item.itinerary_id)} />}
          </div>

          <p className="mt-3 font-mono text-xs font-semibold tracking-[0.06em] text-ink2">LOOKING FOR COMPANY →</p>
          <p className="flex flex-wrap items-baseline gap-x-2.5">
            <span className="text-[40px] leading-[1.05] font-extrabold tracking-[-0.02em]">{item.place_name}</span>
            <span className="text-sm font-medium text-ink2">
              {item.circuit} ·{" "}
              <span className={emphasizeDistance ? "font-bold text-ink" : ""}>{Math.round(Number(item.distance_km))} km</span> from your{" "}
              {item.my_place_name} trip
            </span>
          </p>
          <p className="mt-1 font-mono text-sm font-bold">
            {formatRange(item.start_date, item.end_date)}{" "}
            {item.overlap_days > 0 && (
              <span className="bg-lime px-1.5 text-note-ink">
                {item.overlap_days} {item.overlap_days === 1 ? "day" : "days"} overlap
              </span>
            )}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <Tag>{spaced(item.budget_bracket)}</Tag>
            <Tag>{spaced(item.vibe_tag)}</Tag>
          </div>
          {item.note && <p className="mt-2.5 font-hand text-lg leading-[1.3]">{item.note}</p>}
        </Note>
      </button>

      {/* Prompt answers as sticky notes */}
      {answers.length > 0 && (
        <div className="grid grid-cols-2 items-start gap-3">
          {answers.map((a, i) => {
            const selected = isSelected("prompt", a.id);
            const look = PROMPT_LOOKS[i % PROMPT_LOOKS.length];
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => select({ type: "prompt", id: a.id, label: `${name}'s answer` })}
                aria-pressed={selected}
                aria-label={`Reply to ${name}'s answer: ${a.prompt.text} ${a.answer}`}
                disabled={sent}
                className="block rounded-note text-left disabled:cursor-default"
              >
                <Note tone={look.tone} tilt={look.tilt} pinned={selected} className="min-h-[150px] px-3 pt-3.5 pb-3">
                  <div className="flex justify-between gap-1.5">
                    <span className="text-xs leading-[1.3] font-semibold">{a.prompt.text}</span>
                    {!sent && <RadioMarker checked={selected} tickClass={look.tick} />}
                  </div>
                  <p className="mt-2 font-hand text-[17px] leading-[1.25] font-bold">{a.answer}</p>
                </Note>
              </button>
            );
          })}
        </div>
      )}

      {/* State c: intro sent */}
      {sent && target ? (
        <>
          <Note tone="white" fixing="ink-pin" className="mt-[-26px] ml-12 rotate-[2.2deg] px-3.5 pt-[18px] pb-3.5 shadow-pinned">
            <p className="font-mono text-xs font-semibold text-[#5a5044]">↖ PINNED TO {target.label.toUpperCase()}</p>
            <p className="mt-1.5 line-clamp-3 text-[15px] leading-[1.4]">{draft}</p>
            <p className="mt-1.5 font-hand text-[22px] font-bold text-[#c9271f]">sent. now act normal.</p>
          </Note>
          <p className="flex min-h-[50px] items-center justify-center rounded-full bg-paper px-4 text-center text-[15px] font-semibold text-ink2">
            {name} will see your note next to theirs
          </p>
        </>
      ) : target ? (
        /* State b: item selected + composer */
        <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
          <input type="hidden" name="receiver_id" value={item.user_id} />
          <input type="hidden" name="target_type" value={target.type} />
          <input type="hidden" name="target_id" value={target.id} />

          <Note tone="white" fixing="ink-pin" className="mt-[-4px] flex flex-col gap-1.5 px-3.5 pt-[18px] pb-3 shadow-pinned">
            <label htmlFor={`intro-${item.itinerary_id}`} className="text-[13px] font-bold">
              Your intro · replying to {target.label}
            </label>
            <TextareaWithCount
              id={`intro-${item.itinerary_id}`}
              name="intro_message"
              look="lined"
              min={INTRO_MIN}
              max={INTRO_MAX}
              required
              autoFocus
              disabled={left === 0}
              placeholder="Reply to the one thing that caught your eye"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              error={state?.error?.includes("characters") ? state.error : null}
            />
          </Note>

          {state?.error && !state.error.includes("characters") && <Notice tone="error">{state.error}</Notice>}

          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setTarget(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={left === 0}
              loading={pending}
              loadingLabel="Pinning…"
            >
              {left === 0 ? "0 shots left" : `Pin it · ${shotNumber} of ${DAILY_INTROS}`}
            </Button>
          </div>
        </form>
      ) : (
        /* State a: default */
        <>
          <form
            action={async (form) => {
              await actions.skip(form);
              onSkipped(item.user_id);
            }}
          >
            <input type="hidden" name="user_id" value={item.user_id} />
            <Button type="submit" variant="secondary" className="w-full">
              not my vibe
            </Button>
          </form>
          <p className="text-center font-mono text-xs font-medium text-ink">tap the trip or one answer to write an intro</p>
          <Link href={reportHref} className="-mt-2 self-center rounded-full px-3 py-2 text-xs font-semibold text-ink underline underline-offset-2">
            Report {name}
          </Link>
        </>
      )}
    </article>
  );
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element -- remote avatars (Google) of unknown host
    return <img src={url} alt="" className="size-11 shrink-0 rounded-md object-cover" />;
  }
  return (
    <span
      aria-hidden
      className="flex size-11 shrink-0 items-center justify-center rounded-md bg-[repeating-linear-gradient(45deg,var(--line)_0_5px,var(--paper2)_5px_10px)] text-lg font-extrabold"
    >
      {name.charAt(0)}
    </span>
  );
}
