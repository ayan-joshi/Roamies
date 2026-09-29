"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, buttonClass } from "@/components/ui/button";
import { ChipRadioGroup } from "@/components/ui/chip";
import { Notice } from "@/components/ui/notice";
import { TextareaWithCount } from "@/components/ui/textarea-count";
import { REPORT_REASONS } from "@/lib/constants";
import type { ActionState } from "@/lib/types";

type Props = {
  personId: string;
  personName: string;
  matchId?: number;
  backHref: string;
  doneHref: string;
  submit: (prev: ActionState, form: FormData) => Promise<ActionState>;
  demo?: boolean;
};

// Safety copy is plain and direct on purpose: no jokes here (kit voice rules).
export function SafetyView({ personId, personName, matchId, backHref, doneHref, submit, demo }: Props) {
  const [state, action, pending] = useActionState(submit, null);

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 pt-2 pb-8">
      <Link href={backHref} className="-ml-2 flex min-h-12 w-fit items-center rounded-full px-3 font-semibold text-ink2 hover:bg-paper2">
        ← Back
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] leading-8 font-extrabold tracking-[-0.01em]">Report or block {personName}</h1>
        <p className="text-[17px] leading-6 font-medium text-ink2">
          {personName} won&apos;t be told. Blocking hides you from each other and stops all intros and messages.
        </p>
      </div>

      {state?.ok ? (
        <div className="flex flex-col gap-4">
          <Notice tone="info">
            {demo ? "Done. In the demo nothing is actually sent." : "Thanks. We've got it and will look into it."}
          </Notice>
          <Link href={doneHref} className={buttonClass("primary", "w-full")}>
            Back to Roamies
          </Link>
        </div>
      ) : (
        <form action={action} className="flex flex-col gap-6">
          <input type="hidden" name="reported_id" value={personId} />
          {matchId && <input type="hidden" name="match_id" value={matchId} />}

          <ChipRadioGroup name="reason" legend="What happened? (optional if you only want to block)" options={REPORT_REASONS} spaced={false} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="details" className="text-[13px] leading-[18px] font-bold">
              Details (optional)
            </label>
            <TextareaWithCount id="details" name="details" max={500} placeholder="Anything that helps us understand, e.g. what was said" />
          </div>

          <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-field border-[1.5px] border-line bg-paper px-3.5 py-3 has-[:checked]:border-ink">
            <input type="checkbox" name="block" defaultChecked className="size-5 accent-[var(--ink)]" />
            <span>
              <span className="block font-bold">Also block {personName}</span>
              <span className="block text-[13px] text-ink2">You can&apos;t undo this from the app yet.</span>
            </span>
          </label>

          {state?.error && <Notice tone="error">{state.error}</Notice>}

          <Button type="submit" loading={pending} loadingLabel="Sending…">
            Submit
          </Button>
          <p className="text-[13px] leading-snug text-ink2">
            If you&apos;re in danger right now, call <strong>112</strong> (India emergency). For women&apos;s safety, <strong>1091</strong>.
          </p>
        </form>
      )}
    </main>
  );
}
