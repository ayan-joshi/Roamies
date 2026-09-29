"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { createClient } from "@/lib/supabase/client";

type Step = "choose" | "otp";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<Step>("choose");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const digits = phone.replace(/\D/g, "");
  const fullPhone = `+91${digits}`;

  async function signInWithGoogle() {
    setBusy(true);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    if (error) {
      setMessage("Couldn't reach Google. Check your connection and try again.");
      setBusy(false);
    }
  }

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    setBusy(false);
    if (error) return setMessage("Couldn't send the code. Check the number and try again.");
    setStep("otp");
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.verifyOtp({ phone: fullPhone, token: otp, type: "sms" });
    setBusy(false);
    if (error) return setMessage("That code didn't work. Check it or request a new one.");
    router.replace(next);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {step === "choose" ? (
        <>
          <Button type="button" variant="secondary" onClick={signInWithGoogle} loading={busy} loadingLabel="Opening Google…">
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 font-mono text-xs font-medium text-ink2">
            <span className="h-px flex-1 bg-line" /> OR USE YOUR PHONE <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={sendOtp} className="flex flex-col gap-4">
            <Field id="phone" label="Mobile number" hint="We'll text you a 6-digit code.">
              <div className="flex gap-2">
                <span className="flex h-12 items-center rounded-field border-[1.5px] border-line bg-paper2 px-3.5 font-mono text-ink2">
                  +91
                </span>
                <TextInput
                  id="phone"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="font-mono"
                />
              </div>
            </Field>
            <Button type="submit" disabled={digits.length !== 10} loading={busy} loadingLabel="Sending…">
              Send code
            </Button>
          </form>
        </>
      ) : (
        <form onSubmit={verifyOtp} className="flex flex-col gap-4">
          <Field id="otp" label={`Code sent to ${fullPhone}`}>
            <TextInput
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="text-center font-mono text-xl tracking-[0.4em]"
            />
          </Field>
          <Button type="submit" disabled={otp.length !== 6} loading={busy} loadingLabel="Checking…">
            Verify and continue
          </Button>
          <Button type="button" variant="ghost" onClick={() => setStep("choose")}>
            Use a different number
          </Button>
        </form>
      )}

      {message && <Notice tone="error">{message}</Notice>}
    </div>
  );
}
