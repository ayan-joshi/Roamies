"use client";

import { RadioMarker } from "@/components/ui/note";
import { TextareaWithCount } from "@/components/ui/textarea-count";
import { ANSWER_MAX } from "@/lib/constants";
import type { Prompt } from "@/lib/types";

type Props = {
  prompts: Prompt[];
  picked: number[];
  onToggle: (id: number) => void;
  /** Existing answers by prompt id (edit profile). */
  answers?: Record<number, string>;
};

// Pick exactly 2 prompts and answer them. Field names: prompt_id (checkboxes) + answer_<id>.
// Shared by onboarding and edit profile.
export function PromptPicker({ prompts, picked, onToggle, answers = {} }: Props) {
  return (
    <>
      <p className="font-mono text-xs font-bold" aria-live="polite">
        {picked.length} / 2 PICKED{picked.length === 2 && " · unpick one to swap"}
      </p>
      {prompts.map((p) => {
        const on = picked.includes(p.id);
        const locked = !on && picked.length === 2;
        return (
          <div
            key={p.id}
            className={`flex flex-col gap-3 rounded-field border-[1.5px] p-3.5 ${
              on ? "border-ink bg-paper" : locked ? "border-transparent bg-dis-bg text-dis-fg" : "border-line bg-paper"
            }`}
          >
            <label className={`flex min-h-6 items-start justify-between gap-3 ${locked ? "cursor-not-allowed" : "cursor-pointer"}`}>
              <span className="font-semibold">{p.text}</span>
              <input
                type="checkbox"
                name="prompt_id"
                value={p.id}
                checked={on}
                disabled={locked}
                onChange={() => onToggle(p.id)}
                className="peer sr-only"
              />
              <span className="rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink">
                <RadioMarker checked={on} />
              </span>
            </label>
            {on && (
              <TextareaWithCount
                name={`answer_${p.id}`}
                aria-label={`Your answer to: ${p.text}`}
                placeholder={p.placeholder}
                defaultValue={answers[p.id]}
                max={ANSWER_MAX}
                required
              />
            )}
          </div>
        );
      })}
    </>
  );
}

export function togglePicked(cur: number[], id: number) {
  return cur.includes(id) ? cur.filter((p) => p !== id) : cur.length < 2 ? [...cur, id] : cur;
}
