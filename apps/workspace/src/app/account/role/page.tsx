import { redirect } from "next/navigation";
import { requireIdentity } from "@shared/server/access-context-service";
import { AccountRoleSelectionView } from "@/views/account-role/AccountRoleSelectionView";

function safeReturnTo(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/account/role")) return "/";
  return value;
}

export default async function AccountRolePage({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const [identity, query] = await Promise.all([requireIdentity(), searchParams]);
  if (identity.accountRole) redirect(safeReturnTo(query.returnTo));
  return <AccountRoleSelectionView returnTo={safeReturnTo(query.returnTo)} />;
}
