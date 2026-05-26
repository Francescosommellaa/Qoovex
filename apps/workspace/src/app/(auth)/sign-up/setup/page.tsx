import { redirect } from "next/navigation";
import { getVerifiedSignupEmailFromCookie } from "@shared/server/signup-session-service";
import { AuthShell } from "../../ui";
import { SignUpSetupClient } from "./sign-up-setup-client";

export default async function SignUpSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const email = params.email?.trim().toLowerCase();
  const verifiedEmail = await getVerifiedSignupEmailFromCookie();
  if (!email || !verifiedEmail || verifiedEmail !== email) redirect("/sign-up");

  return (
    <AuthShell
      title="Scegli username e password"
      subtitle="Crea le credenziali del tuo account."
      steps={{ current: 3, total: 3, labels: ["Email", "Codice", "Credenziali"] }}
    >
      <SignUpSetupClient email={email} callbackUrl={params.callbackUrl} />
    </AuthShell>
  );
}
