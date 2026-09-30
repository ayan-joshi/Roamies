"use client";

import { useEffect, useRef, useState } from "react";
import { DateInput } from "@/components/ui/field";

// Start/end pair with one error line under both, so the two fields stay the same height (Claude Design 07b).
// Start may be in the past (people add the trip they're already on); end must be today or later.
export function DateRangeFields({ idPrefix, today }: { idPrefix: string; today: string }) {
  const endRef = useRef<HTMLInputElement>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const error = start && end && end < start ? "End date must be on or after the start date." : null;
  useEffect(() => {
    endRef.current?.setCustomValidity(error ?? "");
  }, [error]);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${idPrefix}-start`} className="text-[13px] leading-[18px] font-bold">
            Start date
          </label>
          <DateInput id={`${idPrefix}-start`} name="start_date" required value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${idPrefix}-end`} className="text-[13px] leading-[18px] font-bold">
            End date
          </label>
          <DateInput
            ref={endRef}
            id={`${idPrefix}-end`}
            name="end_date"
            min={start && start > today ? start : today}
            required
            invalid={!!error}
            aria-describedby={error ? `${idPrefix}-dates-error` : undefined}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
      </div>
      {error && (
        <p id={`${idPrefix}-dates-error`} role="alert" className="flex gap-1.5 text-[13px] leading-snug font-medium text-err">
          <span aria-hidden className="font-extrabold">
            !
          </span>
          {error}
        </p>
      )}
    </div>
  );
}
