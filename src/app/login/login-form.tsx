"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { controlClass, Field, TextInput } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";

type Step = "choose" | "otp";
const RESEND_AFTER = 30;

function ErrorLine({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="flex gap-1.5 text-[13px] leading-snug font-medium text-err">
      <span aria-hidden className="font-extrabold">
        !
      </span>
      {children}
    </p>
  );
}

// "98765 43210" for display
const spacedNumber = (digits: string) => (digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits);

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<Step>("choose");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState<"google" | "send" | "verify" | null>(null);
  // Errors sit under the control that failed (Claude Design 02a/02b).
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);

  const digits = phone.replace(/\D/g, "").slice(0, 10);
  const fullPhone = `+91${digits}`;

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  async function signInWithGoogle() {
    setBusy("google");
    setGoogleError(null);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    if (error) {
      setGoogleError("Couldn't reach Google. Check your connection and try again.");
      setBusy(null);
    }
  }

  async function requestCode() {
    setBusy("send");
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    setBusy(null);
    if (error) return false;
    setResendIn(RESEND_AFTER);
    return true;
  }

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setPhoneError(null);
    if (await requestCode()) setStep("otp");
    else setPhoneError("Couldn't send the code. Check the number and try again.");
  }

  async function resend() {
    setOtpError(null);
    if (!(await requestCode())) setOtpError("Couldn't resend the code. Try again in a minute.");
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy("verify");
    setOtpError(null);
    const { error } = await supabase.auth.verifyOtp({ phone: fullPhone, token: otp, type: "sms" });
    setBusy(null);
    if (error) return setOtpError("That code didn't work. Check it or request a new one.");
    router.replace(next);
    router.refresh();
  }

  if (step === "otp") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] leading-8 font-extrabold tracking-[-0.01em]">Enter the code</h1>
          <p className="text-[17px] leading-6 font-medium text-ink2">
            Sent by SMS to <span className="font-mono font-bold text-ink">+91 {spacedNumber(digits)}</span>
          </p>
        </div>
        <form onSubmit={verifyOtp} className="flex flex-col gap-4">
          <Field id="otp" label="6-digit code">
            <TextInput
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              invalid={!!otpError}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="font-mono text-xl tracking-[0.4em]"
            />
          </Field>
          {otpError && <ErrorLine>{otpError}</ErrorLine>}
          <Button type="submit" disabled={otp.length !== 6} loading={busy === "verify"} loadingLabel="Checking…">
            Verify and continue
          </Button>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={resend}
              disabled={resendIn > 0 || busy !== null}
              className="min-h-12 rounded-full px-3 font-semibold disabled:text-dis-fg"
            >
              Resend code{resendIn > 0 && <span className="font-mono"> · 0:{String(resendIn).padStart(2, "0")}</span>}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("choose");
                setOtp("");
                setOtpError(null);
              }}
              className="min-h-12 rounded-full px-3 font-semibold hover:bg-paper2"
            >
              Change number
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] leading-8 font-extrabold tracking-[-0.01em]">Sign in</h1>
        <p className="text-[17px] leading-6 font-medium text-ink2">Post your trip and meet people on the same route.</p>
      </div>

      <div className="flex flex-col gap-2">
        <Button type="button" variant="secondary" onClick={signInWithGoogle} loading={busy === "google"} loadingLabel="Opening Google…">
          Continue with Google
        </Button>
        {googleError && <ErrorLine>{googleError}</ErrorLine>}
      </div>

      <div className="flex items-center gap-3 font-mono text-xs font-medium text-ink2">
        <span className="h-px flex-1 bg-line" /> OR USE YOUR PHONE <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={sendOtp} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-[13px] leading-[18px] font-bold">
            Mobile number
          </label>
          {/* +91 lives inside the field, split by a divider, so it reads as one control. */}
          <div className={controlClass(!!phoneError, "flex h-12 items-stretch overflow-hidden p-0 focus-within:border-2 focus-within:border-ink focus-within:shadow-[0_0_0_3px_var(--lime-soft)]")}>
            <span className="flex items-center border-r-[1.5px] border-line px-3.5 font-mono">+91</span>
            <input
              id="phone"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-invalid={!!phoneError || undefined}
              className="min-w-0 flex-1 bg-transparent px-3.5 font-mono outline-none placeholder:text-ink2"
            />
          </div>
          {phoneError ? <ErrorLine>{phoneError}</ErrorLine> : <p className="text-[12.5px] text-ink2">We&apos;ll text you a 6-digit code.</p>}
        </div>
        <Button type="submit" disabled={digits.length !== 10} loading={busy === "send"} loadingLabel="Sending…">
          Send code
        </Button>
      </form>
    </div>
  );
}
