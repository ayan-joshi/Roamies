"use client";

import { useEffect, useState } from "react";
import { LENS, PIN_LEFT, PIN_RIGHT } from "./logo";

// "Match moment · 600ms" from the logo spec: pins start apart, slide together (ease-out),
// the lens appears at ~420ms, then a small overshoot settles. Reduced motion: lens just fades in.
// Shown once when a room opens with ?new=1 (right after accepting an intro).
export function MatchMoment({ name }: { name: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Drop ?new=1 so a refresh doesn't replay it.
    const url = new URL(window.location.href);
    url.searchParams.delete("new");
    window.history.replaceState(null, "", url);
    const t = setTimeout(() => setVisible(false), 1700);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="match-moment fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-bg/95"
      onClick={() => setVisible(false)}
    >
      <svg viewBox="-12 0 88 64" width={180} height={131} aria-hidden className="text-ink">
        <path className="mm-lens" d={LENS} fill="var(--lime)" />
        <path className="mm-left" d={PIN_LEFT} fill="none" stroke="currentColor" strokeWidth={4} strokeLinejoin="round" />
        <path className="mm-right" d={PIN_RIGHT} fill="none" stroke="currentColor" strokeWidth={4} strokeLinejoin="round" />
      </svg>
      <p className="mm-text text-[28px] leading-8 font-extrabold tracking-[-0.01em]">it&apos;s a trip</p>
      <p className="mm-text text-ink2">You and {name} can plan it now.</p>
    </div>
  );
}
