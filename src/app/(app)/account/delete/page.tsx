import { requireOnboardedUser } from "@/lib/auth";
import { deleteAccount } from "../actions";
import { DeleteAccountForm } from "./delete-form";

export default async function DeleteAccountPage() {
  await requireOnboardedUser();
  return <DeleteAccountForm deleteAccount={deleteAccount} />;
}
