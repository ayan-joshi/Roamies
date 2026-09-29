import type { ReactNode } from "react";
import { Pin } from "./note";

type Props = {
  tone: "success" | "info" | "error";
  children: ReactNode;
  /** Right-aligned mono detail on success notes, e.g. "7 LEFT". */
  meta?: ReactNode;
  action?: ReactNode;
};

// The kit's toast, rendered inline. Success is the signature: a pinned lime note in handwriting.
export function Notice({ tone, children, meta, action }: Props) {
  if (tone === "success") {
    return (
      <div role="status" className="relative flex items-center justify-between gap-2.5 rounded-note bg-lime px-4 py-3.5 text-note-ink shadow-pinned">
        <Pin position="left-5" />
        <span className="font-hand text-xl leading-[1.1] font-bold">{children}</span>
        {meta && <span className="font-mono text-xs font-bold">{meta}</span>}
      </div>
    );
  }
  if (tone === "info") {
    return (
      <div role="status" className="rounded-[14px] bg-btn-bg px-4 py-3.5 text-[14.5px] leading-snug font-semibold text-btn-fg">
        {children}
      </div>
    );
  }
  return (
    <div role="alert" className="flex items-center gap-2.5 rounded-[14px] border-2 border-err bg-paper py-2.5 pr-2 pl-3.5">
      <span className="flex-1 text-sm leading-snug font-semibold">{children}</span>
      {action}
    </div>
  );
}
