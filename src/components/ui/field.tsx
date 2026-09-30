import type { ComponentProps, ReactNode, SelectHTMLAttributes } from "react";

// Resting: 1.5px line border. Focus: 2px ink border + lime glow. Error: 2px err border on err-bg.
export function controlClass(invalid?: boolean, extra = "") {
  return [
    "w-full rounded-field bg-paper text-[15px] outline-none placeholder:text-ink2",
    "disabled:border-transparent disabled:bg-dis-bg disabled:text-dis-fg",
    invalid
      ? "border-2 border-err bg-err-bg"
      : "border-[1.5px] border-line focus:border-2 focus:border-ink focus:shadow-[0_0_0_3px_var(--lime-soft)]",
    extra,
  ].join(" ");
}

type FieldProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
};

export function Field({ id, label, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] leading-[18px] font-bold">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex gap-1.5 text-[13px] leading-snug font-medium text-err">
          <span aria-hidden className="font-extrabold">
            !
          </span>
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12.5px] text-ink2">{hint}</p>
      ) : null}
    </div>
  );
}

// ComponentProps includes `ref` (a plain prop in React 19).
type InputProps = ComponentProps<"input"> & { invalid?: boolean };

export function TextInput({ invalid, className = "", ...rest }: InputProps) {
  return <input {...rest} aria-invalid={invalid || undefined} className={controlClass(invalid, `h-12 px-3.5 ${className}`)} />;
}

// Native date input keeps the OS picker (fast and accessible on phones); dates use mono per the kit.
export function DateInput({ invalid, className = "", ...rest }: InputProps) {
  return (
    <input
      {...rest}
      type="date"
      aria-invalid={invalid || undefined}
      className={controlClass(invalid, `h-12 px-3.5 font-mono ${className}`)}
    />
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };

export function SelectInput({ invalid, className = "", children, ...rest }: SelectProps) {
  return (
    <div className="relative">
      <select {...rest} aria-invalid={invalid || undefined} className={controlClass(invalid, `h-12 appearance-none pr-10 pl-3.5 ${className}`)}>
        {children}
      </select>
      <span aria-hidden className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2">
        ▾
      </span>
    </div>
  );
}
