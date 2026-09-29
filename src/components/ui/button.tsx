import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-[15px] transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-btn-bg font-bold text-btn-fg hover:bg-btn-hover active:bg-btn-press disabled:bg-dis-bg disabled:text-dis-fg",
  secondary:
    "border-[1.5px] border-ink bg-paper font-semibold hover:bg-paper2 active:bg-line disabled:border-dis-bg disabled:bg-transparent disabled:text-dis-fg",
  ghost: "font-semibold hover:bg-paper2 active:bg-line disabled:bg-transparent disabled:text-dis-fg",
};

// Exposed so links can look like buttons without nesting interactive elements.
export function buttonClass(variant: ButtonVariant = "primary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`;
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
  loadingLabel?: string;
};

export function Button({ variant = "primary", loading, loadingLabel, className = "", children, disabled, ...rest }: Props) {
  return (
    <button {...rest} disabled={disabled || loading} aria-busy={loading || undefined} className={buttonClass(variant, className)}>
      {loading ? (
        <>
          <span
            aria-hidden
            className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
          />
          {loadingLabel ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
