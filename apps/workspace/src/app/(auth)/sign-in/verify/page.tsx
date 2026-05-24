import { redirect } from "next/navigation";
import { AuthShell } from "../../ui";
import { VerifyEmailClient } from "./verify-email-client";

export default async function SignInVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const email = params.email?.trim().toLowerCase();
  if (!email) redirect("/sign-up");

  return (
    <AuthShell
      title="Verifica la tua email"
      subtitle={`Inserisci il codice a 6 cifre inviato a ${email}.`}
      steps={{ current: 2, total: 2 }}
    >
      <VerifyEmailClient email={email} />
    </AuthShell>
  );
}
