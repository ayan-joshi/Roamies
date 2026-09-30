// Roamies mark: "Meeting pins" (Claude Design, Roamies Logo, final mark).
// Two identical pins offset by 16 units on a 64-unit grid; the lens where they overlap is lime.
// Rules: never tilt, never recolour the lens, never change the offset.

export const PIN_LEFT = "M10 24A14 14 0 1 1 38 24C38 36 24 44 24 56C24 44 10 36 10 24Z";
export const PIN_RIGHT = "M26 24A14 14 0 1 1 54 24C54 36 40 44 40 56C40 44 26 36 26 24Z";
export const LENS = "M32 12.51A14 14 0 0 1 32 35.49A14 14 0 0 1 32 12.51Z";

// Size ladder from the spec: the stroke thickens as the mark gets smaller.
export function strokeFor(px: number) {
  if (px <= 16) return 8;
  if (px <= 24) return 6.5;
  if (px <= 32) return 5.5;
  if (px <= 48) return 4.5;
  return 4;
}

type Props = {
  size?: number;
  /** Ink colour of the pins (currentColor by default). */
  className?: string;
  /** Lens fill. Lime by default; use paper when the mark sits on lime. */
  lens?: string;
  title?: string;
};

export function LogoMark({ size = 32, className = "", lens = "var(--lime)", title }: Props) {
  const stroke = strokeFor(size);
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <path d={LENS} fill={lens} />
      <path d={PIN_LEFT} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinejoin="round" />
      <path d={PIN_RIGHT} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinejoin="round" />
    </svg>
  );
}

/** Mark + lowercase wordmark, as used in headers. */
export function Logo({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <LogoMark size={size} />
      <span className="text-xl font-extrabold tracking-[-0.02em]">roamies</span>
    </span>
  );
}
