import type { HTMLAttributes, ReactNode } from "react";

export type NoteTone = "paper" | "lime" | "pink" | "white";
export type NoteTilt = "left" | "right" | "slight-left" | "slight-right" | "none";
export type NoteFixing = "tape" | "pin" | "ink-pin" | "none";

const tones: Record<NoteTone, string> = {
  paper: "bg-paper text-ink",
  // Sticky notes stay bright in dark mode; text on them is always note-ink.
  lime: "bg-lime text-note-ink",
  pink: "bg-pink text-note-ink",
  white: "bg-[#fffdf7] text-note-ink",
};

// Content notes only: ±1–2° at rest, 0° when pinned/selected.
const tilts: Record<NoteTilt, string> = {
  left: "-rotate-[1.6deg]",
  right: "rotate-[1.4deg]",
  "slight-left": "-rotate-[0.8deg]",
  "slight-right": "rotate-[0.8deg]",
  none: "",
};

type Props = HTMLAttributes<HTMLDivElement> & {
  tone?: NoteTone;
  tilt?: NoteTilt;
  fixing?: NoteFixing;
  pinned?: boolean;
  children: ReactNode;
};

export function Note({ tone = "paper", tilt = "none", fixing = "none", pinned = false, className = "", children, ...rest }: Props) {
  return (
    <div
      {...rest}
      className={[
        "relative rounded-note transition-transform duration-200",
        tones[tone],
        pinned ? "rotate-0 shadow-pinned" : `${tilts[tilt]} shadow-note`,
        className,
      ].join(" ")}
    >
      {fixing === "tape" && (
        <span
          aria-hidden
          className="absolute -top-2.5 left-1/2 h-[22px] w-[84px] -translate-x-1/2 rotate-2 bg-[rgba(255,248,220,0.75)] shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
        />
      )}
      {(fixing === "pin" || pinned) && fixing !== "ink-pin" && <Pin />}
      {fixing === "ink-pin" && <Pin className="bg-note-ink" />}
      {children}
    </div>
  );
}

export function Pin({ className = "bg-pin", position = "left-1/2 -translate-x-1/2" }: { className?: string; position?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute -top-2 size-4 rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.35)] ${position} ${className}`}
    />
  );
}

// Radio marker used on every tappable item so "pick one thing" is obvious.
// Filled with the note's own text colour; the tick takes the note's background colour,
// so it reads on paper, lime and pink in both themes.
export function RadioMarker({ checked, tickClass = "text-paper", unavailable = false }: { checked: boolean; tickClass?: string; unavailable?: boolean }) {
  if (unavailable && !checked) return <span aria-hidden className="size-[22px] shrink-0 rounded-full border-2 border-dashed border-ink2" />;
  return checked ? (
    <span aria-hidden className={`flex size-[22px] shrink-0 items-center justify-center rounded-full bg-current text-[13px] font-bold`}>
      <span className={tickClass}>✓</span>
    </span>
  ) : (
    <span aria-hidden className="size-[22px] shrink-0 rounded-full border-2 border-current" />
  );
}
