import { AccountView } from "@/components/views/account-view";
import { requireOnboardedUser } from "@/lib/auth";
import { deleteAccount, setEmailAlerts } from "./actions";

export default async function AccountPage() {
  const { supabase, userId, profile } = await requireOnboardedUser();
  // Separate query: if the email_alerts migration isn't applied yet, the toggle just hides.
  const { data: prefs } = await supabase.from("profiles").select("email_alerts").eq("id", userId).maybeSingle();
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;

  return (
    <AccountView
      name={profile.display_name ?? "You"}
      email={email}
      deleteAccount={deleteAccount}
      emailAlerts={typeof prefs?.email_alerts === "boolean" ? prefs.email_alerts : null}
      setEmailAlerts={setEmailAlerts}
      signOut={
        <form action="/auth/signout" method="post">
          <button className="flex min-h-12 w-full items-center rounded-field px-1 font-semibold hover:bg-paper2">Sign out</button>
        </form>
      }
    />
  );
}
