"use client";

import Link from "next/link";
import { startTransition, useActionState } from "react";
import { Button, buttonClass } from "@/components/ui/button";
import { ChipRadioGroup } from "@/components/ui/chip";
import { Notice } from "@/components/ui/notice";
import { TextareaWithCount } from "@/components/ui/textarea-count";
import { sendFeedback } from "./actions";

const KINDS = ["bug", "idea", "love it"] as const;

export function FeedbackForm({ back }: { back: string }) {
  const [state, action, pending] = useActionState(sendFeedback, null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (data.get("kind") === "love it") data.set("kind", "love");
    startTransition(() => action(data));
  }

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 pt-2 pb-8">
      <Link href={back} className="-ml-2 flex min-h-12 w-fit items-center rounded-full px-3 font-semibold text-ink2 hover:bg-paper2">
        ← Back
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] leading-8 font-extrabold tracking-[-0.01em]">Tell us anything</h1>
        <p className="text-[17px] leading-6 font-medium text-ink2">Something broke, something&apos;s missing, or you just liked it. It all helps.</p>
      </div>

      {state?.ok ? (
        <div className="flex flex-col gap-4">
          <Notice tone="success">thanks. we read every one.</Notice>
          <Link href={back} className={buttonClass("primary", "w-full")}>
            Back to Roamies
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <input type="hidden" name="page" value={back} />
          <ChipRadioGroup name="kind" legend="What's this about?" options={KINDS} required spaced={false} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="message" className="text-[13px] leading-[18px] font-bold">
              Your note
            </label>
            <TextareaWithCount id="message" name="message" max={1000} required placeholder="e.g. the place I'm going isn't in the list" />
          </div>
          {state?.error && <Notice tone="error">{state.error}</Notice>}
          <Button type="submit" loading={pending} loadingLabel="Sending…">
            Send
          </Button>
        </form>
      )}
    </main>
  );
}
