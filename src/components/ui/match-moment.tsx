"use client";

import { useEffect, useState } from "react";
import { buttonClass } from "./button";
import { LENS, PIN_LEFT, PIN_RIGHT } from "./logo";

// "Match moment · 600ms" from the logo spec: pins start apart, slide together (ease-out),
// the lens appears at ~420ms, then a small overshoot settles. Reduced motion: lens just fades in.
// Shown once when a room opens with ?new=1. Never auto-closes (Claude Design 06): it waits for
// "Start planning" or a tap anywhere.
export function MatchMoment({ name }: { name: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Drop ?new=1 so a refresh doesn't replay it.
    const url = new URL(window.location.href);
    url.searchParams.delete("new");
    window.history.replaceState(null, "", url);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-moment-title"
      className="match-moment fixed inset-0 z-50 mx-auto flex max-w-md flex-col bg-bg px-6 pt-10 pb-[max(24px,env(safe-area-inset-bottom))]"
      onClick={() => setVisible(false)}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <svg viewBox="-12 0 88 64" width={150} height={109} aria-hidden className="text-ink">
          <path className="mm-lens" d={LENS} fill="var(--lime)" />
          <path className="mm-left" d={PIN_LEFT} fill="none" stroke="currentColor" strokeWidth={4} strokeLinejoin="round" />
          <path className="mm-right" d={PIN_RIGHT} fill="none" stroke="currentColor" strokeWidth={4} strokeLinejoin="round" />
        </svg>
        <p id="match-moment-title" className="mm-text font-hand text-[40px] leading-[48px] font-bold">
          it&apos;s a trip
        </p>
        <p className="mm-text text-[17px] text-ink2">You and {name} can plan it now.</p>
      </div>
      <div className="mm-text flex flex-col items-center gap-3">
        <button type="button" autoFocus onClick={() => setVisible(false)} className={buttonClass("primary", "w-full")}>
          Start planning
        </button>
        <p className="font-mono text-xs font-bold tracking-[0.08em] text-ink2">OR TAP ANYWHERE</p>
      </div>
    </div>
  );
}
