import { SHOW_VERIFIED_BADGE } from "@/lib/constants";

// "✓ Verified" pill next to a name. Unverified is plain text, never shaming.
// Hidden entirely while SHOW_VERIFIED_BADGE is off.
export function VerifiedBadge({ verified, showUnverified = false }: { verified: boolean; showUnverified?: boolean }) {
  if (!SHOW_VERIFIED_BADGE) return null;
  if (verified) {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full border-[1.5px] border-current px-1.5 py-px text-[11px] font-bold whitespace-nowrap">
        ✓ Verified
      </span>
    );
  }
  return showUnverified ? <span className="text-xs font-semibold text-ink2">ID not verified</span> : null;
}
