import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import QRCode from "qrcode";
import { Logo } from "@/components/ui/logo";
import { Note } from "@/components/ui/note";
import { ShareActions } from "./share-actions";

export const metadata: Metadata = { title: "Share Roamies" };

// Show this on your phone at a hostel: people scan it and land on Roamies.
export default async function SharePage() {
  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const url = origin.replace(/\/$/, "");
  const display = url.replace(/^https?:\/\//, "");

  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#1d1a16", light: "#fffdf7" },
  });

  return (
    <main className="flex flex-1 flex-col gap-6 bg-cork px-5 pt-5 pb-10">
      <div className="flex items-center justify-between">
        <Link href="/" aria-label="Roamies home" className="rounded-full">
          <Logo />
        </Link>
      </div>

      <Note tone="paper" fixing="pin" className="mt-2 flex flex-col items-center gap-4 px-6 pt-8 pb-6">
        <p className="font-hand text-[22px] leading-7 font-bold">scan to find your trip buddy</p>
        <div
          className="w-full max-w-[260px] [&_svg]:h-auto [&_svg]:w-full"
          role="img"
          aria-label={`QR code for ${display}`}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <p className="font-mono text-sm font-bold tracking-[0.04em]">{display}</p>
      </Note>

      <ShareActions url={url} />

      <p className="text-center text-sm font-medium text-ink">
        No account yet? <Link href="/demo" className="font-bold underline underline-offset-2">Try the demo</Link> first.
      </p>
    </main>
  );
}
