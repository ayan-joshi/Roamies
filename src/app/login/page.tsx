import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";
import { Notice } from "@/components/ui/notice";
import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  const nextPath = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/feed";

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 pt-4 pb-10">
      <Link href="/" className="-ml-3 flex min-h-12 w-fit items-center rounded-full px-3 font-semibold text-ink2 hover:bg-paper2">
        ← Back
      </Link>

      <LogoMark size={48} />

      {error && <Notice tone="error">That sign-in didn&apos;t go through. Please try again.</Notice>}

      <LoginForm next={nextPath} />

      <p className="mt-auto text-[13px] leading-snug text-ink2">
        By continuing you confirm you&apos;re 18+ and agree to the{" "}
        <Link href="/terms" className="font-semibold text-ink underline underline-offset-2">Terms</Link> and{" "}
        <Link href="/privacy" className="font-semibold text-ink underline underline-offset-2">Privacy policy</Link>.
      </p>
    </main>
  );
}
