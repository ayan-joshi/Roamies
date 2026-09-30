"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Place } from "@/lib/types";
import { controlClass } from "./field";

// Shown before typing. Only names that exist in `places` are used.
const POPULAR = ["Rishikesh", "Manali", "Kasol", "Triund", "Kedarkantha", "Leh", "Anjuna", "Varanasi", "Jaipur", "Udaipur", "Gokarna", "Hampi", "Varkala", "Darjeeling", "Shillong", "McLeod Ganj"];

const KIND_LABEL: Record<string, string> = { trek: "TREK", beach: "BEACH", spot: "SPOT" };

const MAX_RESULTS = 8;

type Props = {
  id: string;
  name: string;
  label: string;
  places: Place[];
  required?: boolean;
};

// Searchable destination field. Submits the place id through a hidden input.
// The visible input carries validity so the browser blocks submit until a place is picked from the list.
export function PlacePicker({ id, name, label, places, required }: Props) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Place | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      const byName = new Map(places.map((p) => [p.name, p]));
      const popular = POPULAR.map((n) => byName.get(n)).filter((p): p is Place => !!p);
      return (popular.length ? popular : places).slice(0, MAX_RESULTS);
    }
    // Name prefix first, then name contains, then region contains.
    const score = (p: Place) => {
      const n = p.name.toLowerCase();
      if (n.startsWith(q)) return 0;
      if (n.split(/[\s(]+/).some((w) => w.startsWith(q))) return 1;
      if (n.includes(q)) return 2;
      if (p.circuit.toLowerCase().includes(q)) return 3;
      // "trek", "beach", "spot" (or "treks") list every place of that kind
      if (p.kind && p.kind !== "town" && (q.startsWith(p.kind) || p.kind.startsWith(q))) return 4;
      return 9;
    };
    return places
      .map((p) => ({ p, s: score(p) }))
      .filter((x) => x.s < 9)
      .sort((a, b) => a.s - b.s || a.p.name.localeCompare(b.p.name))
      .slice(0, MAX_RESULTS)
      .map((x) => x.p);
  }, [query, places]);

  // Clear with the rest of the form (e.g. after "Add trip" succeeds), so the next trip
  // doesn't silently reuse the previous destination.
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const onReset = () => {
      setSelected(null);
      setQuery("");
      setOpen(false);
      inputRef.current?.setCustomValidity("");
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);

  function choose(place: Place) {
    setSelected(place);
    setQuery(place.name);
    setOpen(false);
    inputRef.current?.setCustomValidity("");
  }

  function onChange(value: string) {
    setQuery(value);
    setOpen(true);
    setActive(0);
    if (selected && value !== selected.name) setSelected(null);
    inputRef.current?.setCustomValidity(required && !(selected && value === selected.name) ? "Pick a place from the list." : "");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && open && results[active]) {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showList = open && results.length > 0;

  return (
    <div className="relative flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] leading-[18px] font-bold">
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList ? `${listId}-${active}` : undefined}
        autoComplete="off"
        placeholder="Search a place, e.g. Rishikesh"
        required={required}
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        className={controlClass(false, "h-12 px-3.5")}
      />
      <input type="hidden" name={name} value={selected?.id ?? ""} />
      {selected && (
        <p className="font-mono text-xs font-medium text-ink2">
          {selected.kind && KIND_LABEL[selected.kind] ? `${KIND_LABEL[selected.kind]} · ` : ""}
          {selected.circuit.toUpperCase()}
        </p>
      )}

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-full right-0 left-0 z-20 mt-1 flex max-h-80 flex-col overflow-auto rounded-field border-[1.5px] border-line bg-paper p-1 shadow-pop"
        >
          {!query.trim() && <li className="px-2.5 pt-1.5 pb-1 font-mono text-[11px] font-bold tracking-[0.06em] text-ink2">POPULAR</li>}
          {results.map((p, i) => {
            const isSel = selected?.id === p.id;
            return (
              <li
                key={p.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={isSel}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(p)}
                onMouseEnter={() => setActive(i)}
                className={`flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-[9px] px-2.5 ${
                  isSel ? "bg-lime font-semibold text-note-ink" : i === active ? "bg-paper2" : ""
                }`}
              >
                <span>{p.name}</span>
                <span className={`flex items-center gap-1.5 text-xs ${isSel ? "" : "text-ink2"}`}>
                  {p.kind && KIND_LABEL[p.kind] && (
                    <span className="rounded-full border-[1.5px] border-current px-1.5 font-mono text-[10px] font-bold">{KIND_LABEL[p.kind]}</span>
                  )}
                  {isSel ? "✓" : p.circuit}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {open && query.trim() && results.length === 0 && (
        <p className="text-[13px] text-ink2">No place called &ldquo;{query}&rdquo; yet. Try a nearby town.</p>
      )}
    </div>
  );
}
