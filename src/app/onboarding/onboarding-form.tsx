"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { TripFields } from "@/components/trip-fields";
import { Button } from "@/components/ui/button";
import { ChipRadioGroup } from "@/components/ui/chip";
import { DateInput, Field, TextInput } from "@/components/ui/field";
import { RadioMarker } from "@/components/ui/note";
import { Notice } from "@/components/ui/notice";
import { TextareaWithCount } from "@/components/ui/textarea-count";
import { ANSWER_MAX, GENDERS } from "@/lib/constants";
import type { ActionState, Place, Prompt } from "@/lib/types";

const STEPS = [
  { title: "About you", intro: "The basics other travellers see on your note." },
  { title: "Your prompts", intro: "Pick exactly 2 prompts to show on your card." },
  { title: "Your first trip", intro: "Where you're headed. This is what people reply to." },
] as const;

type Props = {
  defaultName: string;
  prompts: Prompt[];
  places: Place[];
  maxBirthDate: string;
  complete: (prev: ActionState, form: FormData) => Promise<ActionState>;
};

export function OnboardingForm({ defaultName, prompts, places, maxBirthDate, complete }: Props) {
  const [state, action, pending] = useActionState(complete, null);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  // Validate only the visible step; hidden required fields would otherwise block submit silently.
  function stepIsValid() {
    const fields = formRef.current?.querySelectorAll<HTMLInputElement>(`[data-step="${step}"] [name], [data-step="${step}"] [required]`) ?? [];
    return Array.from(fields).every((field) => field.reportValidity());
  }

  // Submit manually: a plain <form action> is reset by React after every submit, which would wipe
  // three steps of input when the server returns a validation error.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!stepIsValid()) return;
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  }

  function togglePrompt(id: number) {
    setPicked((cur) => (cur.includes(id) ? cur.filter((p) => p !== id) : cur.length < 2 ? [...cur, id] : cur));
  }

  const canContinue = step !== 1 || picked.length === 2;

  // One form across all steps (hidden, not unmounted) so a single submit sends everything.
  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex gap-1.5" aria-hidden>
          {STEPS.map((s, i) => (
            <span key={s.title} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-ink" : "bg-line"}`} />
          ))}
        </div>
        <p className="font-mono text-xs font-bold tracking-[0.06em] text-ink2">
          STEP {step + 1} / {STEPS.length}
        </p>
        <h1 className="text-[28px] leading-8 font-extrabold tracking-[-0.01em]">{STEPS[step].title}</h1>
        <p className="text-[17px] leading-6 font-medium text-ink2">{STEPS[step].intro}</p>
      </div>

      <fieldset data-step={0} hidden={step !== 0} className="flex flex-col gap-5">
        <Field id="display_name" label="Name" hint="First name is enough.">
          <TextInput id="display_name" name="display_name" defaultValue={defaultName} maxLength={40} required autoComplete="given-name" />
        </Field>
        <Field id="birth_date" label="Date of birth" hint="You need to be 18 or older to use Roamies. Only your age is shown.">
          <DateInput id="birth_date" name="birth_date" max={maxBirthDate} required />
        </Field>
        <ChipRadioGroup name="gender" legend="Gender" options={GENDERS} required spaced={false} />
        <Field id="home_city" label="Home city (optional)">
          <TextInput id="home_city" name="home_city" placeholder="Pune" autoComplete="address-level2" />
        </Field>
      </fieldset>

      <fieldset data-step={1} hidden={step !== 1} className="flex flex-col gap-3">
        <legend className="sr-only">Pick exactly 2 prompts</legend>
        <p className="font-mono text-xs font-bold" aria-live="polite">
          {picked.length} / 2 PICKED{picked.length === 2 && " · unpick one to swap"}
        </p>
        {prompts.map((p) => {
          const on = picked.includes(p.id);
          const locked = !on && picked.length === 2;
          return (
            <div
              key={p.id}
              className={`flex flex-col gap-3 rounded-field border-[1.5px] p-3.5 ${
                on ? "border-ink bg-paper" : locked ? "border-transparent bg-dis-bg text-dis-fg" : "border-line bg-paper"
              }`}
            >
              <label className={`flex min-h-6 items-start justify-between gap-3 ${locked ? "cursor-not-allowed" : "cursor-pointer"}`}>
                <span className="font-semibold">{p.text}</span>
                <input
                  type="checkbox"
                  name="prompt_id"
                  value={p.id}
                  checked={on}
                  disabled={locked}
                  onChange={() => togglePrompt(p.id)}
                  className="peer sr-only"
                />
                <span className="rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink">
                  <RadioMarker checked={on} />
                </span>
              </label>
              {on && (
                <TextareaWithCount
                  name={`answer_${p.id}`}
                  aria-label={`Your answer to: ${p.text}`}
                  placeholder={p.placeholder}
                  max={ANSWER_MAX}
                  required
                />
              )}
            </div>
          );
        })}
      </fieldset>

      <div data-step={2} hidden={step !== 2}>
        <TripFields places={places} idPrefix="onboarding-trip" />
      </div>

      {state?.error && <Notice tone="error">{state.error}</Notice>}

      <div className="mt-auto flex gap-2 pt-2">
        {step > 0 && (
          <Button type="button" variant="secondary" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button type="button" className="flex-1" disabled={!canContinue} onClick={() => stepIsValid() && setStep(step + 1)}>
            {step === 1 && picked.length < 2 ? `Pick ${2 - picked.length} more` : "Next"}
          </Button>
        ) : (
          <Button type="submit" className="flex-1" loading={pending} loadingLabel="Saving…">
            Pin my trip
          </Button>
        )}
      </div>
    </form>
  );
}
