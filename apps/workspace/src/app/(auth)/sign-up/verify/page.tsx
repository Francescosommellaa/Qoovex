import { redirect } from "next/navigation";
import { AuthShell } from "../../ui";
import { SignUpVerifyClient } from "./sign-up-verify-client";

export default async function SignUpVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const email = params.email?.trim().toLowerCase();
  if (!email) redirect("/sign-up");

  return (
    <AuthShell
      title="Verifica la tua email"
      subtitle={`Inserisci il codice a 6 cifre inviato a ${email}.`}
      steps={{ current: 2, total: 3, labels: ["Email", "Codice", "Credenziali"] }}
    >
      <SignUpVerifyClient email={email} callbackUrl={params.callbackUrl} />
    </AuthShell>
  );
}
