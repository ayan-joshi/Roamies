"use client";

import { useState, type TextareaHTMLAttributes } from "react";
import { controlClass } from "./field";

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "maxLength" | "minLength"> & {
  min?: number;
  max: number;
  /** "field" = standard textarea. "lined" = lined-paper composer used inside a note. */
  look?: "field" | "lined";
  error?: string | null;
};

const NEAR_LIMIT = 20;

// Counter states from the kit: empty / typing / too short / near limit.
export function TextareaWithCount({ min, max, look = "field", error, className = "", onChange, defaultValue, ...rest }: Props) {
  const [length, setLength] = useState(String(defaultValue ?? "").length);
  const invalid = !!error;
  const nearLimit = max - length <= NEAR_LIMIT;

  const box =
    look === "lined"
      ? // Lives on a fixed white note, so it uses note colours rather than theme colours.
        `min-h-[84px] w-full resize-none border-0 border-b-2 bg-transparent bg-lined py-1 text-base leading-[26px] text-note-ink outline-none placeholder:text-[#5a5044] [--line:#d8e4ef] ${invalid ? "border-[#b3261e]" : "border-note-ink"}`
      : controlClass(invalid, "min-h-[88px] resize-y px-3.5 py-3 leading-[1.45]");

  return (
    <div className="flex flex-col gap-1.5">
      <textarea
        {...rest}
        defaultValue={defaultValue}
        minLength={min}
        maxLength={max}
        aria-invalid={invalid || undefined}
        onChange={(e) => {
          setLength(e.target.value.length);
          onChange?.(e);
        }}
        className={`${box} ${className}`}
      />
      <div
        className={`flex justify-between gap-2 font-mono text-xs font-medium ${
          look === "lined"
            ? invalid ? "text-[#b3261e]" : nearLimit ? "text-[#8a5a00]" : "text-[#5a5044]"
            : invalid ? "text-err" : nearLimit ? "text-warn" : "text-ink2"
        }`}
      >
        <span className={invalid ? "font-sans text-[13px]" : ""}>
          {invalid ? `! ${error}` : nearLimit ? `${max - length} left` : min ? `${min}–${max} characters` : `up to ${max}`}
        </span>
        <span className="font-bold">
          {length} / {max}
        </span>
      </div>
    </div>
  );
}
