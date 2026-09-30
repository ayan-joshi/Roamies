import Link from "next/link";
import { AppShell } from "@/components/views/app-shell";
import { demoIntrosFor } from "@/lib/demo/selectors";
import { readDemoState } from "@/lib/demo/state";
import { demoReset } from "../actions";

export default async function DemoLayout({ children }: LayoutProps<"/demo">) {
  const { pending } = demoIntrosFor(await readDemoState());

  return (
    <AppShell
      basePath="/demo"
      introCount={pending.length}
      banner={
        <div className="flex items-center justify-between gap-2 bg-lime px-4 py-1.5 font-mono text-[11px] font-bold tracking-[0.06em] text-note-ink">
          <span>DEMO · SAMPLE TRAVELLERS</span>
          <span className="flex items-center gap-1">
            <Link href="/feedback?from=/demo/feed" className="flex min-h-8 items-center rounded-full px-2 underline underline-offset-2">
              FEEDBACK
            </Link>
            <form action={demoReset}>
              <button className="min-h-8 rounded-full px-2 underline underline-offset-2">RESET</button>
            </form>
          </span>
        </div>
      }
      headerAction={
        <Link href="/" className="flex min-h-12 items-center rounded-full px-3 text-sm font-semibold text-ink2 hover:bg-paper2">
          Exit demo
        </Link>
      }
    >
      {children}
    </AppShell>
  );
}
