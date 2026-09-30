// Display chip: sits on notes, not tappable.
export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full border-[1.5px] border-current px-2.5 py-1 text-[13px] leading-none font-semibold">
      {children}
    </span>
  );
}

type ChipGroupProps = {
  name: string;
  legend: string;
  options: readonly string[];
  defaultValue?: string;
  required?: boolean;
  error?: string | null;
  /** Show "Hostel/Budget" as "Hostel / Budget" like the kit. */
  spaced?: boolean;
};

// Selectable chips are real radio inputs, so they work in plain forms and with the keyboard.
export function ChipRadioGroup({ name, legend, options, defaultValue, required, error, spaced = true }: ChipGroupProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-[13px] leading-[18px] font-bold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option}
            className={[
              "relative flex h-11 cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] border-line bg-paper px-3.5 text-sm font-semibold whitespace-nowrap",
              "has-[:checked]:border-note-ink has-[:checked]:bg-lime has-[:checked]:font-bold has-[:checked]:text-note-ink",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
              "has-[:disabled]:cursor-not-allowed has-[:disabled]:border-transparent has-[:disabled]:bg-dis-bg has-[:disabled]:text-dis-fg",
            ].join(" ")}
          >
            <input
              type="radio"
              name={name}
              value={option}
              defaultChecked={option === defaultValue}
              required={required}
              className="peer sr-only"
            />
            <span aria-hidden className="hidden peer-checked:inline">
              ✓
            </span>
            {spaced ? option.replace("/", " / ") : option}
          </label>
        ))}
      </div>
      {error && (
        <p className="flex gap-1.5 text-[13px] font-medium text-err">
          <span aria-hidden className="font-extrabold">
            !
          </span>
          {error}
        </p>
      )}
    </fieldset>
  );
}
