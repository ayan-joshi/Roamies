import { notFound } from "next/navigation";
import { SafetyView } from "@/components/views/safety-view";
import { requireOnboardedUser } from "@/lib/auth";
import { reportOrBlock } from "../actions";

export default async function SafetyPage({ params, searchParams }: PageProps<"/safety/[userId]">) {
  const { supabase, userId } = await requireOnboardedUser();
  const { userId: personId } = await params;
  const { match } = await searchParams;
  if (personId === userId) notFound();

  const { data: person } = await supabase.from("profiles").select("display_name").eq("id", personId).maybeSingle();
  if (!person) notFound();

  const matchId = Number(match) || undefined;
  return (
    <SafetyView
      personId={personId}
      personName={person.display_name ?? "this person"}
      matchId={matchId}
      backHref={matchId ? `/matches/${matchId}` : "/intros"}
      doneHref="/feed"
      submit={reportOrBlock}
    />
  );
}
