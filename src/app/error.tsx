"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { Logo, LogoMark } from "@/components/ui/logo";

// Claude Design 10b. No jokes on error pages (voice rules). The mark is shown without its lens:
// two plans that can't meet right now.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    console.error(error);
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, [error]);

  return (
    <main className="flex flex-1 flex-col gap-5 px-5 pt-6 pb-10">
      <Logo />
      <div className="mt-16 flex size-18 items-center justify-center rounded-full bg-paper2 text-ink2">
        <LogoMark size={40} lens="transparent" />
      </div>
      {offline ? (
        <>
          <p className="font-mono text-xs font-bold tracking-[0.06em] text-ink2">NO CONNECTION</p>
          <h1 className="-mt-3 text-[28px] leading-8 font-extrabold tracking-[-0.01em]">You&apos;re offline</h1>
          <p className="text-ink2">Roamies needs a connection to load trips and send intros. Check your signal or Wi-Fi and try again.</p>
        </>
      ) : (
        <>
          <p className="font-mono text-xs font-bold tracking-[0.06em] text-ink2">SOMETHING WENT WRONG</p>
          <h1 className="-mt-3 text-[28px] leading-8 font-extrabold tracking-[-0.01em]">That didn&apos;t load</h1>
          <p className="rounded-field border-2 border-err bg-paper px-4 py-3 font-semibold">
            Something went wrong on our side. Try again, and if it keeps happening, tell us.
          </p>
        </>
      )}
      <div className="mt-auto flex flex-col gap-2">
        <button type="button" onClick={reset} className={buttonClass("primary", "w-full")}>
          Try again
        </button>
        <Link href="/feedback" className={buttonClass("ghost", "w-full")}>
          Send feedback
        </Link>
      </div>
    </main>
  );
}
