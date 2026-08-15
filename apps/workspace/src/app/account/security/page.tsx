import { redirect } from "next/navigation";
import { AccessError } from "@shared/server/access-errors";
import { requireIdentity } from "@shared/server/access-context-service";
import { getMfaStatusByUserId } from "@shared/server/mfa-service";
import { AccountSecurityFlow } from "@/views/account-security/AccountSecurityFlow";

export default async function AccountSecurityPage() {
  try {
    const identity = await requireIdentity();
    const status = await getMfaStatusByUserId(identity.id);
    if (!status) redirect("/sign-in");
    return <AccountSecurityFlow initialStatus={{ ...status, satisfied: true }} mode="management" showDataExport={identity.accountRole === "CLIENT"} />;
  } catch (error) {
    if (error instanceof AccessError && error.status === 401) redirect("/sign-in?callbackUrl=%2Faccount%2Fsecurity");
    if (error instanceof AccessError && error.code === "MFA_REQUIRED") return null;
    throw error;
  }
}

