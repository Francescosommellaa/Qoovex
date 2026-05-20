import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getMfaStatusByClerkId } from "@shared/server/mfa-service";
import { AuthShell } from "../ui";
import { MfaChallengeClient } from "./mfa-challenge-client";

export default async function MfaChallengePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const status = await getMfaStatusByClerkId(userId);
  if (!status?.enabled) redirect("/dashboard");

  return (
    <AuthShell
      title="Verifica l'accesso"
      subtitle="Completa il secondo fattore per aprire il workspace"
    >
      <MfaChallengeClient />
    </AuthShell>
  );
}
