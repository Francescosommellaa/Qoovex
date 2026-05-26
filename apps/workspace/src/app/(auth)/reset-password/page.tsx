import { AuthShell } from "../ui";
import { ResetPasswordClient } from "./reset-password-client";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const email = params.email?.trim().toLowerCase() ?? "";

  return (
    <AuthShell
      title="Imposta nuova password"
      subtitle="Inserisci il codice ricevuto e scegli una nuova password."
    >
      <ResetPasswordClient initialEmail={email} />
    </AuthShell>
  );
}
