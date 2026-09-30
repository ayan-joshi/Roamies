import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  name: string;
  email: string | null;
  emailAlerts: boolean | null;
  setEmailAlerts: (form: FormData) => Promise<void>;
};

const row = "flex min-h-12 items-center justify-between rounded-field px-1 font-semibold hover:bg-paper2";

// Claude Design 08a: status tag for alerts, sign out as its own button, delete as a quiet link.
export function AccountView({ name, email, emailAlerts, setEmailAlerts }: Props) {
  return (
    <main className="flex flex-1 flex-col gap-4 px-4 pt-2 pb-8">
      <Link href="/feed" className="-ml-2 flex min-h-12 w-fit items-center rounded-full px-3 font-semibold text-ink2 hover:bg-paper2">
        ← Back
      </Link>
      <section className="flex flex-col gap-1 pb-2">
        <h1 className="text-[28px] leading-8 font-extrabold tracking-[-0.01em]">Account</h1>
        <p className="text-[17px] font-medium">{name}</p>
        {email && <p className="font-mono text-xs text-ink2">{email} · never shown to other travellers</p>}
      </section>

      {emailAlerts !== null && (
        <section className="flex items-center justify-between gap-3 rounded-sheet bg-paper p-4">
          <div>
            <p className="flex items-center gap-2 font-bold">
              Email alerts
              {emailAlerts ? (
                <span className="rounded-full bg-lime px-1.5 font-mono text-[11px] font-bold text-note-ink">ON</span>
              ) : (
                <span className="rounded-full bg-paper2 px-1.5 font-mono text-[11px] font-bold text-ink2">OFF</span>
              )}
            </p>
            <p className="text-[13px] text-ink2">New intros, matches and messages.</p>
          </div>
          <form action={setEmailAlerts}>
            <input type="hidden" name="on" value={emailAlerts ? "false" : "true"} />
            <Button type="submit" variant="secondary" className="px-4 text-sm">
              {emailAlerts ? "Turn off" : "Turn on"}
            </Button>
          </form>
        </section>
      )}

      <nav aria-label="Account" className="flex flex-col rounded-sheet bg-paper p-3">
        <Link href="/profile" className={row}>
          Edit profile <span aria-hidden>→</span>
        </Link>
        <Link href="/share" className={row}>
          Share Roamies (QR code) <span aria-hidden>→</span>
        </Link>
        <Link href="/feedback?from=/account" className={row}>
          Send feedback <span aria-hidden>→</span>
        </Link>
      </nav>

      <nav aria-label="Legal" className="flex flex-col rounded-sheet bg-paper p-3">
        <Link href="/privacy" className={row}>
          Privacy policy <span aria-hidden>→</span>
        </Link>
        <Link href="/terms" className={row}>
          Terms and safety <span aria-hidden>→</span>
        </Link>
      </nav>

      <form action="/auth/signout" method="post">
        <Button type="submit" variant="secondary" className="w-full">
          Sign out
        </Button>
      </form>

      <Link href="/account/delete" className="mt-auto flex min-h-12 items-center justify-center self-center rounded-full px-4 pt-8 font-semibold text-err">
        Delete my account…
      </Link>
    </main>
  );
}
