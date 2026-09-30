import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Note } from "@/components/ui/note";
import { createClient } from "@/lib/supabase/server";

async function isSignedIn() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return false;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    return !!data?.claims;
  } catch {
    return false;
  }
}

// Claude Design 10a: the voice lives in the Kalam line on a taped note; title and instructions stay plain.
export default async function NotFound() {
  const signedIn = await isSignedIn();

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pt-6 pb-10">
      <Logo />
      <div className="mt-10 rounded-sheet bg-cork p-6">
        <Note tone="paper" tilt="slight-left" fixing="tape" className="px-5 pt-7 pb-5">
          <p className="font-mono text-xs font-semibold tracking-[0.06em] text-ink2">404 · PAGE NOT FOUND</p>
          <p className="mt-2 font-hand text-2xl leading-8 font-bold">this page left without telling anyone.</p>
        </Note>
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] leading-8 font-extrabold tracking-[-0.01em]">Page not found</h1>
        <p className="text-ink2">The link may be old, or the trip was deleted.</p>
      </div>
      <div className="mt-auto flex flex-col gap-2">
        {signedIn ? (
          <>
            <Link href="/feed" className={buttonClass("primary", "w-full")}>
              Back to feed
            </Link>
            <Link href="/" className={buttonClass("ghost", "w-full")}>
              Go to home page
            </Link>
          </>
        ) : (
          <Link href="/" className={buttonClass("primary", "w-full")}>
            Go to home page
          </Link>
        )}
      </div>
    </main>
  );
}
