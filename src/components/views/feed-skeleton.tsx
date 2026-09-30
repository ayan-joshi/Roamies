import { Note } from "@/components/ui/note";
import { RADII_KM } from "@/lib/constants";

const block = "rounded-[6px] bg-paper2";

// Claude Design 10c: skeleton notes keep their real tilt, tape and pin so cards don't jump in.
// Pulse at most once per 1.2s, none with reduced motion.
export function FeedSkeleton() {
  return (
    <main aria-busy="true" className="flex flex-1 flex-col gap-4 bg-cork px-4 pt-4 pb-8">
      <div className="flex items-center gap-2" aria-hidden>
        <span className="font-mono text-xs font-bold tracking-wider text-ink">WITHIN</span>
        {RADII_KM.map((r) => (
          <span key={r} className={`flex h-11 items-center rounded-full px-3.5 font-mono text-xs font-bold ${r === 50 ? "bg-btn-bg text-btn-fg" : "bg-paper text-ink"}`}>
            {r} KM
          </span>
        ))}
      </div>
      <p className="text-center font-mono text-[11px] font-bold tracking-[0.06em] text-ink">FINDING PEOPLE ON YOUR DATES…</p>
      <div className="flex animate-[pulse_1.2s_ease-in-out_infinite] flex-col gap-3.5 motion-reduce:animate-none" aria-hidden>
        <Note tone="paper" tilt="slight-left" fixing="tape" className="flex flex-col gap-3 px-4 pt-6 pb-5">
          <div className="flex items-center gap-2.5">
            <span className={`size-11 ${block}`} />
            <span className="flex flex-1 flex-col gap-1.5">
              <span className={`h-4 w-2/5 ${block}`} />
              <span className={`h-3 w-1/4 ${block}`} />
            </span>
          </div>
          <span className={`h-3 w-1/3 ${block}`} />
          <span className={`h-9 w-3/5 ${block}`} />
          <span className={`h-4 w-1/2 ${block}`} />
          <span className="flex gap-2">
            <span className={`h-6 w-24 ${block}`} />
            <span className={`h-6 w-32 ${block}`} />
          </span>
        </Note>
        <div className="grid grid-cols-2 gap-3">
          <Note tone="lime" tilt="right" className="min-h-[130px] opacity-70" >
            <span />
          </Note>
          <Note tone="pink" tilt="left" className="min-h-[130px] opacity-70">
            <span />
          </Note>
        </div>
        <Note tone="paper" fixing="pin" className="mt-4 flex flex-col gap-3 px-4 pt-6 pb-5">
          <span className={`h-9 w-1/2 ${block}`} />
          <span className={`h-4 w-2/5 ${block}`} />
          <span className={`h-4 w-3/5 ${block}`} />
        </Note>
      </div>
      <span className="sr-only">Loading the feed</span>
    </main>
  );
}
