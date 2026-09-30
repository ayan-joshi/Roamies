"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import type { ActionState } from "@/lib/types";

type Props = {
  name: string;
  email: string | null;
  signOut: React.ReactNode;
  emailAlerts: boolean | null;
  setEmailAlerts: (form: FormData) => Promise<void>;
  deleteAccount: (prev: ActionState, form: FormData) => Promise<ActionState>;
};

export function AccountView({ name, email, signOut, emailAlerts, setEmailAlerts, deleteAccount }: Props) {
  const [state, action, pending] = useActionState(deleteAccount, null);

  return (
    <main className="flex flex-1 flex-col gap-8 px-4 pt-5 pb-8">
      <section className="flex flex-col gap-1">
        <h1 className="text-[28px] leading-8 font-extrabold tracking-[-0.01em]">Account</h1>
        <p className="text-[17px] font-medium">{name}</p>
        {email && <p className="font-mono text-xs text-ink2">{email} · never shown to other travellers</p>}
      </section>

      {emailAlerts !== null && (
        <section className="flex items-center justify-between gap-3 rounded-sheet bg-paper p-4">
          <div>
            <p className="font-bold">Email alerts</p>
            <p className="text-[13px] text-ink2">New intros, matches and messages. {emailAlerts ? "On" : "Off"}.</p>
          </div>
          <form action={setEmailAlerts}>
            <input type="hidden" name="on" value={emailAlerts ? "false" : "true"} />
            <Button type="submit" variant="secondary" className="px-4 text-sm">
              {emailAlerts ? "Turn off" : "Turn on"}
            </Button>
          </form>
        </section>
      )}

      <section className="flex flex-col gap-2 rounded-sheet bg-paper p-4">
        <Link href="/profile" className="flex min-h-12 items-center justify-between rounded-field px-1 font-semibold hover:bg-paper2">
          Edit profile <span aria-hidden>→</span>
        </Link>
        <Link href="/share" className="flex min-h-12 items-center justify-between rounded-field px-1 font-semibold hover:bg-paper2">
          Share Roamies (QR code) <span aria-hidden>→</span>
        </Link>
        <Link href="/feedback?from=/account" className="flex min-h-12 items-center justify-between rounded-field px-1 font-semibold hover:bg-paper2">
          Send feedback <span aria-hidden>→</span>
        </Link>
      </section>

      <section className="flex flex-col gap-2 rounded-sheet bg-paper p-4">
        <Link href="/privacy" className="flex min-h-12 items-center justify-between rounded-field px-1 font-semibold hover:bg-paper2">
          Privacy policy <span aria-hidden>→</span>
        </Link>
        <Link href="/terms" className="flex min-h-12 items-center justify-between rounded-field px-1 font-semibold hover:bg-paper2">
          Terms and safety <span aria-hidden>→</span>
        </Link>
        {signOut}
      </section>

      <section aria-labelledby="delete-heading" className="flex flex-col gap-4 rounded-sheet border-2 border-err bg-paper p-4">
        <h2 id="delete-heading" className="text-xl leading-[26px] font-bold">
          Delete my account
        </h2>
        <p className="text-ink2">
          This permanently deletes your profile, trips, prompts, intros, matches and messages. It can&apos;t be undone.
        </p>
        <form action={action} className="flex flex-col gap-4">
          <Field id="confirm" label="Type DELETE to confirm">
            <TextInput id="confirm" name="confirm" autoComplete="off" autoCapitalize="characters" />
          </Field>
          {state?.error && <Notice tone="error">{state.error}</Notice>}
          <Button type="submit" variant="secondary" loading={pending} loadingLabel="Deleting…" className="border-err text-err">
            Delete my account
          </Button>
        </form>
      </section>
    </main>
  );
}
