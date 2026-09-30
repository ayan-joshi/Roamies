"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { PromptPicker, togglePicked } from "@/components/prompt-picker";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import type { Prompt } from "@/lib/types";
import { updateProfile } from "./actions";

type Props = {
  name: string;
  homeCity: string;
  prompts: Prompt[];
  answers: Record<number, string>;
};

export function ProfileForm({ name, homeCity, prompts, answers }: Props) {
  const [state, action, pending] = useActionState(updateProfile, null);
  const [picked, setPicked] = useState<number[]>(Object.keys(answers).map(Number));

  // Manual submit so a server-side error doesn't wipe what you typed.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  }

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 pt-2 pb-8">
      <Link href="/account" className="-ml-2 flex min-h-12 w-fit items-center rounded-full px-3 font-semibold text-ink2 hover:bg-paper2">
        ← Account
      </Link>
      <h1 className="text-[28px] leading-8 font-extrabold tracking-[-0.01em]">Edit profile</h1>

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <Field id="display_name" label="Name">
          <TextInput id="display_name" name="display_name" defaultValue={name} maxLength={40} required />
        </Field>
        <Field id="home_city" label="Home city (optional)">
          <TextInput id="home_city" name="home_city" defaultValue={homeCity} />
        </Field>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-[13px] leading-[18px] font-bold">Your 2 prompts</legend>
          <PromptPicker prompts={prompts} picked={picked} answers={answers} onToggle={(id) => setPicked((cur) => togglePicked(cur, id))} />
        </fieldset>

        {state?.error && <Notice tone="error">{state.error}</Notice>}
        {state?.ok && <Notice tone="info">Saved. Your card is updated.</Notice>}

        <Button type="submit" disabled={picked.length !== 2} loading={pending} loadingLabel="Saving…">
          {picked.length === 2 ? "Save" : `Pick ${2 - picked.length} more`}
        </Button>
      </form>
    </main>
  );
}
