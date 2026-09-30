import { Note } from "@/components/ui/note";
import { qrSvg, siteUrl } from "@/lib/site";

// Laptop screens only: a pinned note beside the phone column that sends people to their phone.
// Hidden below xl, where the column fills the screen anyway.
export async function DesktopAside() {
  const { url, display } = await siteUrl();
  const svg = await qrSvg(url);

  return (
    <aside
      aria-label="Open Roamies on your phone"
      className="fixed top-1/2 left-[calc(50%+224px+48px)] hidden w-[260px] -translate-y-1/2 xl:block"
    >
      <Note tone="paper" tilt="slight-right" fixing="pin" className="flex flex-col items-center gap-3 px-5 pt-7 pb-5">
        <p className="text-center font-hand text-[22px] leading-7 font-bold">roamies works best on your phone</p>
        <div
          className="w-full max-w-[180px] [&_svg]:h-auto [&_svg]:w-full"
          role="img"
          aria-label={`QR code for ${display}`}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <p className="font-mono text-xs font-bold tracking-[0.04em]">{display}</p>
        <p className="text-center text-sm text-ink2">Scan with your phone camera to open it there.</p>
      </Note>
    </aside>
  );
}
