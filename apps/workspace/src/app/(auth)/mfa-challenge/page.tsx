import { redirect } from "next/navigation";
import { auth } from "@shared/server/auth/config";
import {
  getMfaStatusByUserId,
  isMfaSatisfiedForUser,
} from "@shared/server/mfa-service";
import { AuthShell } from "../ui";
import { MfaChallengeClient } from "./mfa-challenge-client";

export default async function MfaChallengePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/sign-in");

  const status = await getMfaStatusByUserId(userId);
  if (!status?.enabled) redirect("/dashboard");
  if (await isMfaSatisfiedForUser(userId)) redirect("/dashboard");

  return (
    <AuthShell
      title="Verifica l'accesso"
      subtitle="Completa il secondo fattore per aprire il workspace"
    >
      <MfaChallengeClient />
    </AuthShell>
  );
}
