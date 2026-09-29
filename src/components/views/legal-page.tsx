import Link from "next/link";
import type { ReactNode } from "react";

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pt-3 pb-12">
      <Link href="/" className="-ml-3 flex min-h-12 w-fit items-center rounded-full px-3 font-semibold text-ink2 hover:bg-paper2">
        ← roamies
      </Link>
      <header className="flex flex-col gap-1">
        <h1 className="text-[28px] leading-8 font-extrabold tracking-[-0.01em]">{title}</h1>
        <p className="font-mono text-xs font-bold tracking-[0.06em] text-ink2">LAST UPDATED {updated}</p>
      </header>
      <div className="flex flex-col gap-5 text-[15px] leading-[1.55] [&_h2]:text-xl [&_h2]:leading-[26px] [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
        {children}
      </div>
      <p className="text-sm text-ink2">
        Questions? {CONTACT_EMAIL ? <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-ink underline">{CONTACT_EMAIL}</a> : "Use the Report option in the app."}
      </p>
    </main>
  );
}
