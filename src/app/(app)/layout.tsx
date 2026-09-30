import Link from "next/link";
import { AppShell } from "@/components/views/app-shell";
import { requireOnboardedUser } from "@/lib/auth";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { supabase, userId } = await requireOnboardedUser();

  // Badge = intros waiting for you + chats with unread messages.
  const [{ count }, { data: matches }] = await Promise.all([
    supabase.from("interactions").select("id", { count: "exact", head: true }).eq("receiver_id", userId).eq("status", "pending"),
    supabase.rpc("my_matches"),
  ]);
  const unreadChats = ((matches ?? []) as { unread: boolean }[]).filter((m) => m.unread).length;

  return (
    <AppShell
      basePath=""
      introCount={(count ?? 0) + unreadChats}
      headerAction={
        <Link href="/account" className="flex min-h-12 items-center rounded-full px-3 text-sm font-semibold text-ink2 hover:bg-paper2">
          Account
        </Link>
      }
    >
      {children}
    </AppShell>
  );
}
