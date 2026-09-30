"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import type { ActionState } from "@/lib/types";

export function DeleteAccountForm({ deleteAccount }: { deleteAccount: (prev: ActionState, form: FormData) => Promise<ActionState> }) {
  const [state, action, pending] = useActionState(deleteAccount, null);

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 pt-2 pb-8">
      <Link href="/account" className="-ml-2 flex min-h-12 w-fit items-center rounded-full px-3 font-semibold text-ink2 hover:bg-paper2">
        ← Account
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] leading-8 font-extrabold tracking-[-0.01em]">Delete my account</h1>
        <p className="text-[17px] leading-6 font-medium text-ink2">
          This permanently deletes your profile, trips, prompts, intros, matches and messages. It can&apos;t be undone.
        </p>
      </div>
      <form action={action} className="flex flex-col gap-4">
        <Field id="confirm" label="Type DELETE to confirm">
          <TextInput id="confirm" name="confirm" autoComplete="off" autoCapitalize="characters" />
        </Field>
        {state?.error && <Notice tone="error">{state.error}</Notice>}
        <Button type="submit" variant="secondary" loading={pending} loadingLabel="Deleting…" className="border-err text-err">
          Delete my account
        </Button>
        <Link href="/account" className="flex min-h-12 items-center justify-center rounded-full font-semibold hover:bg-paper2">
          Keep my account
        </Link>
      </form>
    </main>
  );
}
